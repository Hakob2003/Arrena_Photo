import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ModuleRef } from "@nestjs/core";
import { GoogleDriveService } from "../integrations/google-drive/google-drive.service";
import { ImageProviderFactory } from "../providers/image-provider.factory";
import { EncryptionUtil } from "../common/utils/encryption.util";
import { WatermarkService } from "../watermark/watermark.service";
import { BillingService } from "../billing/billing.service";
import { StorageService } from "../storage/storage.service";
import axios from "axios";

export interface GenerationJobData {
  generationId: string;
  initImage?: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string;
  resolution?: string;
  skin?: string;
  accentColor?: string;
}

@Processor("generations")
export class GenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(GenerationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private moduleRef: ModuleRef,
    private readonly billingService: BillingService,
    private readonly storageService: StorageService,
  ) {
    super();
  }

  @OnWorkerEvent("failed")
  async onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`,
    );
    // Check if this was the last attempt
    if (job.attemptsMade >= (job.opts.attempts || 1)) {
      this.logger.log(
        `Final attempt failed for job ${job.id}. Initiating refund (WRK-028).`,
      );

      const { generationId } = job.data;
      if (!generationId) return;

      const generation = await this.prisma.generation.findUnique({
        where: { id: generationId },
      });
      if (!generation) return;

      // Determine cost
      let cost = 5;
      if (generation.templateId) {
        const template = await this.prisma.template.findUnique({
          where: { id: generation.templateId },
        });
        if (template?.price) cost = template.price;
      }

      try {
        await this.billingService.addCredits(
          generation.userId,
          cost,
          "Refund for failed generation",
        );
        this.logger.log(
          `Refunded ${cost} credits to user ${generation.userId}.`,
        );
      } catch (e: unknown) {
        this.logger.error(
          `Failed to refund credits: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }
  }

  async process(
    job: Job<GenerationJobData, unknown, string>,
  ): Promise<unknown> {
    const { generationId, initImage } = job.data;

    this.logger.log(`Processing generation job: ${generationId}`);

    // 1. Fetch Generation
    const generation = await this.prisma.generation.findUnique({
      where: { id: generationId },
      include: {
        aiModel: {
          include: { provider: true },
        },
        user: {
          include: { subscription: true },
        },
      },
    });

    if (!generation) {
      this.logger.error(`Generation ${generationId} not found`);
      throw new Error("Generation not found");
    }

    // 2. Mark as PROCESSING
    await this.prisma.generation.update({
      where: { id: generationId },
      data: { status: "PROCESSING" },
    });

    try {
      // 3. Real Generation Strategy
      const mode = initImage ? "img2img" : "txt2img";
      this.logger.log(
        `Generating image with provider: ${generation.aiModel.provider.name}, model: ${generation.aiModel.name}, mode: ${mode}...`,
      );

      // Fetch API Key
      const connection = await this.prisma.aIConnection.findFirst({
        where: { providerId: generation.aiModel.providerId },
      });

      const isMock = generation.aiModel.provider.name
        .toLowerCase()
        .includes("mock");

      let providerFactory;
      if (!isMock && (!connection || !connection.encryptedApiKey)) {
        this.logger.warn(
          `No API key configured for provider ${generation.aiModel.provider.name}. Falling back to MOCK provider.`,
        );

        // Check local memory settings for mock type
        const globalAny = global as unknown as { usePicsumMock?: boolean };
        const usePicsumMock = globalAny.usePicsumMock !== false;
        providerFactory = ImageProviderFactory.create("mock", "mock-key", {
          usePicsumMock,
        });
      } else {
        const apiKey = connection?.encryptedApiKey
          ? EncryptionUtil.decrypt(connection.encryptedApiKey)
          : "";
        const globalAny = global as unknown as { usePicsumMock?: boolean };
        const usePicsumMock = globalAny.usePicsumMock !== false;
        providerFactory = ImageProviderFactory.create(
          generation.aiModel.provider.name,
          apiKey,
          { usePicsumMock },
        );
      }

      const startTime = Date.now();

      // Simulated wait has been moved to Producer (BullMQ delay) - WRK-025 / WRK-026

      const generatedUrls = await providerFactory.generateImage(
        job.data.prompt,
        generation.aiModel.slug,
        {
          initImage: initImage,
          negativePrompt: job.data.negativePrompt,
          aspectRatio: job.data.aspectRatio,
          resolution: job.data.resolution,
        },
      );

      if (!generatedUrls || generatedUrls.length === 0) {
        throw new Error("Provider returned empty image list");
      }

      let finalImageUrl = generatedUrls[0];
      const durationMs = Date.now() - startTime;

      // Apply watermark if user is on FREE plan
      if (
        !generation.user?.subscription ||
        generation.user.subscription.plan === "FREE"
      ) {
        try {
          const watermarkService = this.moduleRef.get(WatermarkService, {
            strict: false,
          });
          if (watermarkService) {
            this.logger.log(
              `Applying watermark for FREE user ${generation.userId}...`,
            );
            let imageBuffer: Buffer;

            if (finalImageUrl.startsWith("data:image")) {
              const base64Data = finalImageUrl.split(",")[1];
              imageBuffer = Buffer.from(base64Data, "base64");
            } else {
              const res = await axios.get(finalImageUrl, {
                responseType: "arraybuffer",
              });
              imageBuffer = Buffer.from(res.data);
            }

            const skin = job.data.skin || "NEON";
            const accentColor = job.data.accentColor;
            const watermarkedBuffer = await watermarkService.applyWatermark(
              imageBuffer,
              skin,
              accentColor,
            );
            const base64String = watermarkedBuffer.toString("base64");
            finalImageUrl = `data:image/jpeg;base64,${base64String}`;
          }
        } catch (e: unknown) {
          this.logger.warn(
            `Failed to apply watermark, falling back to original. Error: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
      }

      const randomImage = finalImageUrl;

      // 4. Try saving to Google Drive
      let driveFileId: string | null = null;
      try {
        const driveService = this.moduleRef.get(GoogleDriveService, {
          strict: false,
        });
        if (driveService) {
          const uploadRes = await driveService.saveImageToDrive(
            generation.userId,
            randomImage,
          );
          if (uploadRes.success && uploadRes.fileId) {
            driveFileId = uploadRes.fileId;
            this.logger.log(
              `Saved generation ${generationId} to Google Drive: ${uploadRes.fileId}`,
            );
          }
        }
      } catch (e: unknown) {
        this.logger.warn(
          `Could not save to Google Drive for user ${generation.userId}. Falling back to default URL. Error: ${e instanceof Error ? e.message : String(e)}`,
        );
      }

      // 4.5. Upload to S3
      let s3Url = null;
      let s3Bucket = null;
      try {
        let uploadBuffer: Buffer;
        if (randomImage.startsWith("data:image")) {
          const base64Data = randomImage.split(",")[1];
          uploadBuffer = Buffer.from(base64Data, "base64");
        } else {
          const res = await axios.get(randomImage, {
            responseType: "arraybuffer",
          });
          uploadBuffer = Buffer.from(res.data);
        }

        const filename = `generations/${generation.userId}/${generationId}.jpg`;
        const s3Result = await this.storageService.uploadFile(
          uploadBuffer,
          filename,
          "image/jpeg",
        );
        s3Url = s3Result.url;
        s3Bucket = s3Result.bucket;
      } catch (e: unknown) {
        this.logger.error(
          `Failed to upload generation ${generationId} to S3: ${e instanceof Error ? e.message : String(e)}`,
        );
      }

      // Find or create a default storage provider for the result
      let storageProvider = await this.prisma.storageProvider.findFirst({
        where: { name: "S3 MinIO" },
      });
      if (!storageProvider) {
        storageProvider = await this.prisma.storageProvider.create({
          data: {
            name: "S3 MinIO",
            baseUrl: "http://localhost:9000/ai-studio",
          },
        });
      }

      if ((s3Url || driveFileId) && finalImageUrl.startsWith("data:image")) {
        finalImageUrl = ""; // Clear heavy base64 to save DB space if we have external storage
      }

      // Store S3 URL, and keep imageUrl empty if externally stored to save db space
      await this.prisma.generationResult.create({
        data: {
          generationId,
          imageUrl: finalImageUrl,
          s3ImageUrl: s3Url,
          s3Bucket: s3Bucket,
          driveFileId: driveFileId,
          durationMs: durationMs,
          storageProviderId: storageProvider.id,
        },
      });

      // 5. Mark as DONE after result is created
      await this.prisma.generation.update({
        where: { id: generationId },
        data: { status: "DONE" },
      });

      this.logger.log(`Successfully completed generation: ${generationId}`);
      return { success: true, imageUrl: randomImage, driveFileId };
    } catch (error: unknown) {
      this.logger.error(
        `Failed generation: ${generationId}`,
        error instanceof Error ? error.stack : String(error),
      );

      // Mark as FAILED
      await this.prisma.generation.update({
        where: { id: generationId },
        data: { status: "FAILED" },
      });

      throw error;
    }
  }
}
