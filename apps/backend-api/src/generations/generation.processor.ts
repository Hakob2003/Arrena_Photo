import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleRef } from '@nestjs/core';
import { GoogleDriveService } from '../integrations/google-drive/google-drive.service';
import { ImageProviderFactory } from './providers/image-provider.factory';
import { EncryptionUtil } from '../common/utils/encryption.util';
import { WatermarkService } from './watermark.service';
import axios from 'axios';
@Processor('generations')
export class GenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(GenerationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private moduleRef: ModuleRef
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { generationId, initImage } = job.data;
    
    this.logger.log(`Processing generation job: ${generationId}`);

    // 1. Fetch Generation
    const generation = await this.prisma.generation.findUnique({
      where: { id: generationId },
      include: {
        aiModel: {
          include: { provider: true }
        },
        user: {
          include: { subscription: true }
        }
      }
    });

    if (!generation) {
      this.logger.error(`Generation ${generationId} not found`);
      throw new Error('Generation not found');
    }

    // 2. Mark as PROCESSING
    await this.prisma.generation.update({
      where: { id: generationId },
      data: { status: 'PROCESSING' }
    });

    try {
      // 3. Real Generation Strategy
      const mode = initImage ? 'img2img' : 'txt2img';
      this.logger.log(`Generating image with provider: ${generation.aiModel.provider.name}, model: ${generation.aiModel.name}, mode: ${mode}...`);
      
      // Fetch API Key
      const connection = await this.prisma.aIConnection.findFirst({
        where: { providerId: generation.aiModel.providerId }
      });

      const isMock = generation.aiModel.provider.name.toLowerCase().includes('mock');

      let providerFactory;
      if (!isMock && (!connection || !connection.encryptedApiKey)) {
        this.logger.warn(`No API key configured for provider ${generation.aiModel.provider.name}. Falling back to MOCK provider.`);
        
        // Check local memory settings for mock type
        const usePicsumMock = (global as any).usePicsumMock !== false;
        providerFactory = ImageProviderFactory.create('mock', 'mock-key', { usePicsumMock });
      } else {
        const apiKey = connection?.encryptedApiKey 
          ? EncryptionUtil.decrypt(connection.encryptedApiKey)
          : '';
        const usePicsumMock = (global as any).usePicsumMock !== false;
        providerFactory = ImageProviderFactory.create(generation.aiModel.provider.name, apiKey, { usePicsumMock });
      }
      
      const startTime = Date.now();

      // --- Simulate generation time based on plan ---
      const plan = generation.user?.subscription?.plan || 'FREE';
      let delayMs = 30000;
      if (plan === 'STARTER') delayMs = 15000;
      else if (plan === 'PRO') delayMs = 10000;
      else if (plan === 'BUSINESS') delayMs = Math.floor(Math.random() * 4000) + 1000; // 1 to 5 seconds
      
      this.logger.log(`Simulating generation time for ${plan} plan: ${delayMs}ms`);
      await new Promise(resolve => setTimeout(resolve, delayMs));

      // Check if cancelled during wait
      const currentStatus = await this.prisma.generation.findUnique({ where: { id: generationId }, select: { status: true }});
      if (currentStatus?.status === 'FAILED') {
        this.logger.log(`Generation ${generationId} was cancelled during wait. Aborting.`);
        return;
      }
      // ----------------------------------------------

      const generatedUrls = await providerFactory.generateImage(job.data.prompt, generation.aiModel.slug, {
        initImage: initImage,
        negativePrompt: job.data.negativePrompt,
        aspectRatio: job.data.aspectRatio,
        resolution: job.data.resolution
      });
      
      if (!generatedUrls || generatedUrls.length === 0) {
        throw new Error('Provider returned empty image list');
      }

      let finalImageUrl = generatedUrls[0];
      const durationMs = Date.now() - startTime;

      // Apply watermark if user is on FREE plan
      if (!generation.user?.subscription || generation.user.subscription.plan === 'FREE') {
        try {
          const watermarkService = this.moduleRef.get(WatermarkService, { strict: false });
          if (watermarkService) {
            this.logger.log(`Applying watermark for FREE user ${generation.userId}...`);
            let imageBuffer: Buffer;
            
            if (finalImageUrl.startsWith('data:image')) {
              const base64Data = finalImageUrl.split(',')[1];
              imageBuffer = Buffer.from(base64Data, 'base64');
            } else {
              const res = await axios.get(finalImageUrl, { responseType: 'arraybuffer' });
              imageBuffer = Buffer.from(res.data);
            }
            
            const skin = job.data.skin || 'NEON';
            const watermarkedBuffer = await watermarkService.applyWatermark(imageBuffer, skin);
            const base64String = watermarkedBuffer.toString('base64');
            finalImageUrl = `data:image/jpeg;base64,${base64String}`;
          }
        } catch (e: any) {
          this.logger.warn(`Failed to apply watermark, falling back to original. Error: ${e?.message}`);
        }
      }

      const randomImage = finalImageUrl;

      // 4. Try saving to Google Drive
      let driveFileId: string | null = null;
      try {
        const driveService = this.moduleRef.get(GoogleDriveService, { strict: false });
        if (driveService) {
           const uploadRes = await driveService.saveImageToDrive(generation.userId, randomImage);
           if (uploadRes.success && uploadRes.fileId) {
              driveFileId = uploadRes.fileId;
              this.logger.log(`Saved generation ${generationId} to Google Drive: ${uploadRes.fileId}`);
           }
        }
      } catch (e: any) {
        this.logger.warn(`Could not save to Google Drive for user ${generation.userId}. Falling back to default URL. Error: ${e?.message || e}`);
      }

      // Find or create a default storage provider for the result
      let storageProvider = await this.prisma.storageProvider.findFirst();
      if (!storageProvider) {
        storageProvider = await this.prisma.storageProvider.create({
          data: {
            name: 'Mock Storage',
            baseUrl: 'https://mock.storage'
          }
        });
      }

      // Always keep the original image URL as fallback; store driveFileId separately
      await this.prisma.generationResult.create({
        data: {
          generationId,
          imageUrl: randomImage,
          driveFileId: driveFileId,
          durationMs: durationMs,
          storageProviderId: storageProvider.id
        }
      });

      // 5. Mark as DONE after result is created
      await this.prisma.generation.update({
        where: { id: generationId },
        data: { status: 'DONE' }
      });

      this.logger.log(`Successfully completed generation: ${generationId}`);
      return { success: true, imageUrl: randomImage, driveFileId };

    } catch (error: any) {
      this.logger.error(`Failed generation: ${generationId}`, error.stack);
      
      // Mark as FAILED
      await this.prisma.generation.update({
        where: { id: generationId },
        data: { status: 'FAILED' }
      });
      
      throw error;
    }
  }
}

