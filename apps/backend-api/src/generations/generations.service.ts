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
        prompt: dto.prompt,
        negativePrompt: dto.negativePrompt,
        settings: {
          aspectRatio: dto.aspectRatio,
          resolution: dto.resolution,
          initImage: dto.initImage ? true : false,
        }
      }
    });

    // 3. Add to BullMQ Queue
    await this.generationsQueue.add('generate-image', {
      generationId: generation.id,
      prompt: dto.prompt,
      negativePrompt: dto.negativePrompt,
      initImage: dto.initImage,
      aspectRatio: dto.aspectRatio,
      resolution: dto.resolution
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

  async publish(id: string, userId: string, isPublic: boolean) {
    const generation = await this.prisma.generation.findUnique({ where: { id } });
    if (!generation || generation.userId !== userId) {
      throw new NotFoundException('Generation not found');
    }

    return this.prisma.generation.update({
      where: { id },
      data: { isPublic }
    });
  }

  async toggleLike(generationId: string, userId: string) {
    const existing = await this.prisma.generationLike.findUnique({
      where: { userId_generationId: { userId, generationId } }
    });

    if (existing) {
      await this.prisma.generationLike.delete({ where: { id: existing.id } });
      await this.prisma.generation.update({
        where: { id: generationId },
        data: { likesCount: { decrement: 1 } }
      });
      return { liked: false };
    } else {
      await this.prisma.generationLike.create({
        data: { userId, generationId }
      });
      await this.prisma.generation.update({
        where: { id: generationId },
        data: { likesCount: { increment: 1 } }
      });
      return { liked: true };
    }
  }

  async getFeed(userId?: string) {
    const generations = await this.prisma.generation.findMany({
      where: { status: 'DONE', isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        result: true,
        user: { select: { name: true, image: true } },
        template: { select: { name: true } }
      }
    });

    let likedSet = new Set<string>();
    if (userId) {
      const likes = await this.prisma.generationLike.findMany({
        where: { userId, generationId: { in: generations.map(g => g.id) } }
      });
      likes.forEach(l => likedSet.add(l.generationId));
    }

    return generations.map(g => {
      let imageUrl = g.result?.imageUrl;
      let driveFileId = g.result?.driveFileId;
      const drivePathPrefix = '/api/integrations/google-drive/file/';
      if (imageUrl && imageUrl.startsWith(drivePathPrefix) && !driveFileId) {
        driveFileId = imageUrl.substring(drivePathPrefix.length);
        imageUrl = null;
      }

      return {
        id: g.id,
        imageUrl: imageUrl || 'https://picsum.photos/seed/fallback/512/512',
        driveFileId,
        user: g.user,
        template: g.template,
        prompt: g.prompt,
        settings: g.settings,
        likesCount: g.likesCount,
        isLiked: likedSet.has(g.id),
        createdAt: g.createdAt
      };
    });
  }
}
