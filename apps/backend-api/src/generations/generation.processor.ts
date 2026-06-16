import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleRef } from '@nestjs/core';
import { GoogleDriveService } from '../integrations/google-drive/google-drive.service';

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
      // 3. Mock Generation Strategy: Wait 3 seconds and return a fake image URL
      const mode = initImage ? 'img2img (editing)' : 'txt2img';
      this.logger.log(`[MOCK] Generating image with provider: ${generation.aiModel.provider.name}, model: ${generation.aiModel.name}, mode: ${mode}...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      const fakeImages = [
        'https://picsum.photos/seed/gen1/512/512',
        'https://picsum.photos/seed/gen2/512/512',
        'https://picsum.photos/seed/gen3/512/512'
      ];
      const randomImage = fakeImages[Math.floor(Math.random() * fakeImages.length)];

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
          durationMs: 3000,
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
