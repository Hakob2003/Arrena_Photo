import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenerationDto } from './dto/create-generation.dto';

@Injectable()
export class GenerationsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('generations') private generationsQueue: Queue,
  ) {}

  async create(userId: string, dto: CreateGenerationDto) {
    // 1. Verify model exists
    const aiModel = await this.prisma.aIModel.findUnique({
      where: { id: dto.aiModelId }
    });

    if (!aiModel) {
      throw new NotFoundException('AI Model not found');
    }

    // 2. Create Pending Generation Record
    const generation = await this.prisma.generation.create({
      data: {
        userId,
        templateId: dto.templateId,
        aiModelId: dto.aiModelId,
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
