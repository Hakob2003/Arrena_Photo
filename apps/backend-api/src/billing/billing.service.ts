import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionPlan } from "@prisma/client";

@Injectable()
export class BillingService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const planConfigs = [
      {
        plan: SubscriptionPlan.STARTER,
        name: "Starter",
        price: "/mo",
        monthlyCredits: 1500,
        maxConcurrent: 1,
        queueDelay: 30000,
        priority: 3,
        modelsAccess: "Base Only",
        stripePriceId: "price_1Tsq8cA9uhtrETnDbzaESKaj",
        isActive: true,
      },
      {
        plan: SubscriptionPlan.PRO,
        name: "Pro",
        price: "/mo",
        monthlyCredits: 5000,
        maxConcurrent: 1,
        queueDelay: 30000,
        priority: 3,
        modelsAccess: "Base Only",
        stripePriceId: "price_1Tsq8dA9uhtrETnDmEhp2qx6",
        isActive: true,
      },
      {
        plan: SubscriptionPlan.BUSINESS,
        name: "Business",
        price: "/mo",
        monthlyCredits: 20000,
        maxConcurrent: 1,
        queueDelay: 30000,
        priority: 3,
        modelsAccess: "Base Only",
        stripePriceId: "price_1Tsq8uA9uhtrETnD26TpHdMr",
        isActive: true,
      },
    ];

    for (const pc of planConfigs) {
      await this.prisma.planConfig.upsert({
        where: { plan: pc.plan },
        update: { stripePriceId: pc.stripePriceId },
        create: pc,
      });
    }
  }

  async getSubscription(userId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    if (!sub) {
      // Return free tier by default if not exists
      return {
        plan: SubscriptionPlan.FREE,
        monthlyCredits: 20,
        expiresAt: null,
      };
    }
    return sub;
  }

  async upgradeSubscription(userId: string, plan: SubscriptionPlan) {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    if (sub) {
      return this.prisma.subscription.update({
        where: { id: sub.id },
        data: {
          plan,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    } else {
      return this.prisma.subscription.create({
        data: {
          userId,
          plan,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  async getCreditHistory(userId: string) {
    return this.prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  // --- Payment Methods ---
  async getPaymentMethods(userId: string) {
    return this.prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async addPaymentMethod(
    userId: string,
    data: {
      cardNumber: string;
      expiry: string;
      cardholderName: string;
      cvv?: string;
      balance: number;
      limit: number;
      isDefault?: boolean;
    },
  ) {
    // Basic formatting
    const cleanedNumber = data.cardNumber.replace(/\s+/g, "");
    const isExpired = this.checkIfExpired(data.expiry);

    if (isExpired) {
      throw new BadRequestException("Cannot add an expired card");
    }

    const existingCards = await this.prisma.paymentMethod.count({
      where: { userId },
    });
    const isFirstCard = existingCards === 0;
    const makeDefault = data.isDefault || isFirstCard;

    if (makeDefault) {
      // Unset previous defaults
      await this.prisma.paymentMethod.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const last4 =
      cleanedNumber.length >= 4 ? cleanedNumber.slice(-4) : cleanedNumber;
    let brand = "visa";
    if (cleanedNumber.startsWith("5") || cleanedNumber.startsWith("2"))
      brand = "mastercard";
    if (cleanedNumber.startsWith("4")) brand = "visa";
    if (cleanedNumber.startsWith("34") || cleanedNumber.startsWith("37"))
      brand = "amex";

    return this.prisma.paymentMethod.create({
      data: {
        userId,
        last4,
        brand,
        expiry: data.expiry,
        cardholderName: data.cardholderName,
        balance: data.balance,
        limit: data.limit,
        isDefault: makeDefault,
      },
    });
  }

  async deletePaymentMethod(userId: string, id: string) {
    const card = await this.prisma.paymentMethod.findUnique({
      where: { id, userId },
    });
    if (!card) throw new NotFoundException("Card not found");

    await this.prisma.paymentMethod.delete({ where: { id } });

    // If we deleted the default card, make another one default if it exists and is not expired
    if (card.isDefault) {
      const remainingCards = await this.prisma.paymentMethod.findMany({
        where: { userId },
      });
      const validCard = remainingCards.find(
        (c) => !this.checkIfExpired(c.expiry),
      );
      if (validCard) {
        await this.prisma.paymentMethod.update({
          where: { id: validCard.id },
          data: { isDefault: true },
        });
      }
    }
    return { success: true };
  }

  async setDefaultPaymentMethod(userId: string, id: string) {
    const card = await this.prisma.paymentMethod.findUnique({
      where: { id, userId },
    });
    if (!card) throw new NotFoundException("Card not found");

    if (this.checkIfExpired(card.expiry)) {
      throw new BadRequestException("Cannot set an expired card as default");
    }

    await this.prisma.$transaction([
      this.prisma.paymentMethod.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      this.prisma.paymentMethod.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);
    return { success: true };
  }

  async updatePaymentMethodLimit(userId: string, id: string, limit: number) {
    const card = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });
    if (!card || card.userId !== userId) {
      throw new BadRequestException("Card not found");
    }
    await this.prisma.paymentMethod.update({
      where: { id },
      data: { limit },
    });
    return { success: true };
  }

  async chargePaymentMethod(userId: string, amount: number, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const defaultCard = await tx.paymentMethod.findFirst({
        where: { userId, isDefault: true },
      });

      if (!defaultCard) {
        throw new BadRequestException("No default card available for charging");
      }

      if (this.checkIfExpired(defaultCard.expiry)) {
        throw new BadRequestException(
          "Default card is expired. Please add a new card.",
        );
      }

      if (amount > 1000) {
        throw new BadRequestException("Amount exceeds card limit");
      }

      // 4. Simulate insufficient funds
      if (amount > 500 && amount < 1000) {
        throw new BadRequestException("Insufficient funds on card");
      }

      // Deduct from card balance (and limit if it is set)
      await tx.paymentMethod.update({
        where: { id: defaultCard.id },
        data: {
          balance: { decrement: amount },
          ...(defaultCard.limit > 0 ? { limit: { decrement: amount } } : {}),
        },
      });

      // Record transaction
      const txRecord = await tx.creditTransaction.create({
        data: { userId, amount, reason }, // Here amount is the money spent
      });

      return { success: true, transaction: txRecord };
    });
  }

  private checkIfExpired(expiry: string): boolean {
    if (!expiry || expiry.length < 5) return true;
    const [monthStr, yearStr] = expiry.split("/");
    if (!monthStr || !yearStr) return true;

    const month = parseInt(monthStr, 10);
    const year = parseInt("20" + yearStr, 10);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear) return true;
    if (year === currentYear && month < currentMonth) return true;
    return false;
  }

  // --- Credits & Transactions ---
  async addCredits(userId: string, amount: number, reason: string) {
    if (amount <= 0) throw new BadRequestException("Amount must be positive");
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: amount } },
      });
      const txRecord = await tx.creditTransaction.create({
        data: { userId, amount, reason },
      });
      return { user, transaction: txRecord };
    });
  }

  async deductCredits(userId: string, amount: number, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      // Use atomic updateMany to prevent Race Conditions (Double Spend)
      const result = await tx.user.updateMany({
        where: { id: userId, credits: { gte: amount } },
        data: { credits: { decrement: amount } },
      });

      if (result.count === 0) {
        throw new BadRequestException("Insufficient credits or user not found");
      }

      const updatedUser = await tx.user.findUnique({ where: { id: userId } });
      const txRecord = await tx.creditTransaction.create({
        data: { userId, amount: -amount, reason },
      });
      return { user: updatedUser, transaction: txRecord };
    });
  }

  // --- Plan Configurations ---

  async getPlanConfigs() {
    return this.prisma.planConfig.findMany({
      orderBy: { price: "asc" },
    });
  }

  async updatePlanConfig(plan: SubscriptionPlan, data: any) {
    return this.prisma.planConfig.upsert({
      where: { plan },
      update: {
        name: data.name,
        price: data.price,
        monthlyCredits: data.monthlyCredits,
        maxConcurrent: data.maxConcurrent,
        queueDelay: data.queueDelay,
        priority: data.priority,
        modelsAccess: data.modelsAccess,
        stripePriceId: data.stripePriceId,
        isActive: data.isActive,
      },
      create: {
        plan,
        name: data.name || plan,
        price: data.price || "$0",
        monthlyCredits: data.monthlyCredits || 0,
        maxConcurrent: data.maxConcurrent || 1,
        queueDelay: data.queueDelay || 30000,
        priority: data.priority || 3,
        modelsAccess: data.modelsAccess || "Base Only",
        stripePriceId: data.stripePriceId,
        isActive: data.isActive ?? true,
      },
    });
  }
}
