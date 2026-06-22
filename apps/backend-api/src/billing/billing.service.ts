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

  // --- Payment Methods ---
  async getPaymentMethods(userId: string) {
    return this.prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addPaymentMethod(userId: string, data: { cardNumber: string, expiry: string, cardholderName: string, cvv?: string, balance: number, limit: number, isDefault?: boolean }) {
    // Basic formatting
    const cleanedNumber = data.cardNumber.replace(/\s+/g, '');
    const isExpired = this.checkIfExpired(data.expiry);
    
    if (isExpired) {
      throw new BadRequestException('Cannot add an expired card');
    }

    const existingCards = await this.prisma.paymentMethod.count({ where: { userId } });
    const isFirstCard = existingCards === 0;
    const makeDefault = data.isDefault || isFirstCard;

    if (makeDefault) {
      // Unset previous defaults
      await this.prisma.paymentMethod.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    return this.prisma.paymentMethod.create({
      data: {
        userId,
        cardNumber: data.cardNumber,
        expiry: data.expiry,
        cardholderName: data.cardholderName,
        cvv: data.cvv,
        balance: data.balance,
        limit: data.limit,
        isDefault: makeDefault
      }
    });
  }

  async deletePaymentMethod(userId: string, id: string) {
    const card = await this.prisma.paymentMethod.findUnique({ where: { id, userId } });
    if (!card) throw new NotFoundException('Card not found');

    await this.prisma.paymentMethod.delete({ where: { id } });
    
    // If we deleted the default card, make another one default if it exists and is not expired
    if (card.isDefault) {
      const remainingCards = await this.prisma.paymentMethod.findMany({ where: { userId } });
      const validCard = remainingCards.find(c => !this.checkIfExpired(c.expiry));
      if (validCard) {
        await this.prisma.paymentMethod.update({
          where: { id: validCard.id },
          data: { isDefault: true }
        });
      }
    }
    return { success: true };
  }

  async setDefaultPaymentMethod(userId: string, id: string) {
    const card = await this.prisma.paymentMethod.findUnique({ where: { id, userId } });
    if (!card) throw new NotFoundException('Card not found');
    
    if (this.checkIfExpired(card.expiry)) {
      throw new BadRequestException('Нельзя сделать просроченную карту основной');
    }

    await this.prisma.$transaction([
      this.prisma.paymentMethod.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      }),
      this.prisma.paymentMethod.update({
        where: { id },
        data: { isDefault: true }
      })
    ]);
    return { success: true };
  }

  async chargePaymentMethod(userId: string, amount: number, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const defaultCard = await tx.paymentMethod.findFirst({
        where: { userId, isDefault: true }
      });

      if (!defaultCard) {
        throw new BadRequestException('Нет основной карты для списания средств');
      }

      if (this.checkIfExpired(defaultCard.expiry)) {
        throw new BadRequestException('Основная карта просрочена. Добавьте новую карту.');
      }

      if (defaultCard.limit > 0 && amount > defaultCard.limit) {
        throw new BadRequestException('Сумма превышает лимит по карте');
      }

      if (defaultCard.balance < amount) {
        throw new BadRequestException('Недостаточно средств на карте');
      }

      // Deduct from card balance
      await tx.paymentMethod.update({
        where: { id: defaultCard.id },
        data: { balance: { decrement: amount } }
      });

      // Record transaction
      const txRecord = await tx.creditTransaction.create({
        data: { userId, amount, reason } // Here amount is the money spent
      });

      return { success: true, transaction: txRecord };
    });
  }

  private checkIfExpired(expiry: string): boolean {
    if (!expiry || expiry.length < 5) return true;
    const [monthStr, yearStr] = expiry.split('/');
    if (!monthStr || !yearStr) return true;
    
    const month = parseInt(monthStr, 10);
    const year = parseInt('20' + yearStr, 10);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear) return true;
    if (year === currentYear && month < currentMonth) return true;
    return false;
  }

  // --- Credits & Transactions ---
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
