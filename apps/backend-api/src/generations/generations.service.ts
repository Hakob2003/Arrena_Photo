import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenerationDto } from './dto/create-generation.dto';

import { BillingService } from '../billing/billing.service';

@Injectable()
export class GenerationsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('generations') private generationsQueue: Queue,
    private billingService: BillingService,
  ) {}

  async create(userId: string, dto: CreateGenerationDto) {
    // 1. Verify model exists (by name or ID)
    let aiModel = await this.prisma.aIModel.findFirst({
      where: { 
        OR: [
          { id: dto.aiModelId },
          { name: dto.aiModelId },
          { slug: dto.aiModelId }
        ]
      }
    });

    if (!aiModel) {
      let provider = await this.prisma.aIProvider.findFirst();
      if (!provider) {
         provider = await this.prisma.aIProvider.create({
            data: { name: 'Mock Provider', isGlobal: true }
         });
      }
      aiModel = await this.prisma.aIModel.create({
         data: {
            providerId: provider.id,
            name: dto.aiModelId,
            slug: dto.aiModelId,
            isFree: true,
            isActive: true
         }
      });
    }

    // Determine cost
    let generationCost = 5; // default
    if (dto.templateId) {
      const template = await this.prisma.template.findUnique({
        where: { id: dto.templateId }
      });
      if (template && template.price != null) {
        generationCost = template.price;
      }
    }

    // Deduct credits before generating
    await this.billingService.deductCredits(userId, generationCost, 'Image Generation');

    // 2. Create Pending Generation Record
    const generation = await this.prisma.generation.create({
      data: {
        userId,
        templateId: dto.templateId,
        aiModelId: aiModel.id,
        status: 'PENDING',
      }
    });

    // 3. Add to BullMQ Queue
    await this.generationsQueue.add('generate-image', {
      generationId: generation.id,
      prompt: dto.prompt,
      negativePrompt: dto.negativePrompt,
      initImage: dto.initImage,
      aspectRatio: dto.aspectRatio
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 }
    });

    return generation;
  }

  async getHistory(userId: string) {
    const generations = await this.prisma.generation.findMany({
      where: { userId, status: 'DONE' },
      orderBy: { createdAt: 'desc' },
      include: {
        result: true,
        aiModel: { select: { name: true } },
        template: { select: { name: true } }
      }
    });

    return generations.map(g => {
      let imageUrl = g.result?.imageUrl;
      let driveFileId = g.result?.driveFileId;

      // Handle legacy records where imageUrl was saved as a relative Drive proxy path
      const drivePathPrefix = '/api/integrations/google-drive/file/';
      if (imageUrl && imageUrl.startsWith(drivePathPrefix) && !driveFileId) {
        driveFileId = imageUrl.substring(drivePathPrefix.length);
        imageUrl = null; // No valid fallback URL available for legacy records
      }

      return {
        id: g.id,
        imageUrl: imageUrl || 'https://picsum.photos/seed/fallback/512/512',
        driveFileId,
        model: g.aiModel.name,
        template: g.template?.name,
        createdAt: g.createdAt
      };
    });
  }

  async getStatus(id: string, userId: string) {
    const generation = await this.prisma.generation.findUnique({
      where: { id },
      include: { result: true }
    });

    if (!generation || generation.userId !== userId) {
      throw new NotFoundException('Generation not found');
    }

    return generation;
  }

  async getActiveModels() {
    return this.prisma.aIModel.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        costPerToken: true,
        speed: true,
        provider: {
          select: { name: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }
}
