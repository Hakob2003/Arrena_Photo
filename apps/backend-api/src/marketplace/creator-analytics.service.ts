import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CreatorAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(creatorId: string) {
    // Получаем все шаблоны автора
    const templates = await this.prisma.template.findMany({
      where: { creatorId },
      select: {
        id: true,
        downloadCount: true,
        price: true,
        marketplace: {
          select: {
            id: true,
            purchases: { select: { amount: true } },
          }
        }
      }
    });

    let totalDownloads = 0;
    let totalRevenue = 0;

    for (const t of templates) {
      totalDownloads += t.downloadCount;
      if (t.marketplace && t.marketplace.purchases) {
        for (const p of t.marketplace.purchases) {
          totalRevenue += p.amount;
        }
      }
    }

    const followersCount = await this.prisma.userFollow.count({
      where: { followingId: creatorId }
    });

    return {
      totalDownloads,
      totalRevenue,
      followersCount,
      activeTemplatesCount: templates.length,
    };
  }

  async requestPayout(creatorId: string, amount: number) {
    // В реальности здесь нужна проверка минимальной суммы и доступного баланса
    return this.prisma.payout.create({
      data: {
        userId: creatorId,
        amount,
      }
    });
  }
}
