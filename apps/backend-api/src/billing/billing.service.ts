import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan } from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async getSubscription(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub) {
      // Return free tier by default if not exists
      return { plan: SubscriptionPlan.FREE, monthlyCredits: 20, expiresAt: null };
    }
    return sub;
  }

  async getCreditHistory(userId: string) {
    return this.prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async addCredits(userId: string, amount: number, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: amount } }
      });
      const txRecord = await tx.creditTransaction.create({
        data: { userId, amount, reason }
      });
      return { user, transaction: txRecord };
    });
  }

  async deductCredits(userId: string, amount: number, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.credits < amount) {
        throw new BadRequestException('Insufficient credits');
      }
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: amount } }
      });
      const txRecord = await tx.creditTransaction.create({
        data: { userId, amount: -amount, reason }
      });
      return { user: updatedUser, transaction: txRecord };
    });
  }
}
