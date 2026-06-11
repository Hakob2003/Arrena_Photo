import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Processor('generations')
export class GenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(GenerationProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { generationId } = job.data;
    
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
      this.logger.log(`[MOCK] Generating image with provider: ${generation.aiModel.provider.name}, model: ${generation.aiModel.name}...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      const fakeImages = [
        'https://images.unsplash.com/photo-1707343843437-caacff5cfa74',
        'https://images.unsplash.com/photo-1682687982501-1e58f8147c08',
        'https://images.unsplash.com/photo-1682687220063-4742bd7fd538'
      ];
      const randomImage = fakeImages[Math.floor(Math.random() * fakeImages.length)];

      // 4. Mark as DONE and save result
      await this.prisma.generation.update({
        where: { id: generationId },
        data: { status: 'DONE' }
      });

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

      await this.prisma.generationResult.create({
        data: {
          generationId,
          imageUrl: randomImage,
          durationMs: 3000,
          storageProviderId: storageProvider.id
        }
      });

      this.logger.log(`Successfully completed generation: ${generationId}`);
      return { success: true, imageUrl: randomImage };

    } catch (error) {
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
