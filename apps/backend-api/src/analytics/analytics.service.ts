import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getGenerationStats() {
    // Basic implementation - aggregate generations by AI Model
    const stats = await this.prisma.generation.groupBy({
      by: ['aiModelId'],
      _count: {
        id: true,
      },
    });
    return stats;
  }
}
