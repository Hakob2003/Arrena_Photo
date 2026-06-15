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
    const aiModel = await this.prisma.aIModel.findFirst({
      where: { 
        OR: [
          { id: dto.aiModelId },
          { name: dto.aiModelId }
        ]
      }
    });

    if (!aiModel) {
      throw new NotFoundException('AI Model not found');
    }

    // Deduct credits before generating
    await this.billingService.deductCredits(userId, 5, 'Image Generation');

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
      negativePrompt: dto.negativePrompt
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 }
    });

    return generation;
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
}
