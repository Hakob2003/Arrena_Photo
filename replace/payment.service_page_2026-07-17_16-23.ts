import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentProvider } from "./interfaces/payment-provider.interface";

@Injectable()
export class PaymentService {
  constructor(
    @Inject("PAYMENT_PROVIDER") private paymentProvider: PaymentProvider,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // --- Credit Purchase (One-time) ---
  async createPaymentIntentForCredits(
    userId: string,
    amountUsd: number,
    credits: number,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const customerId = await this.paymentProvider.getOrCreateCustomer(
      user.email,
      user.name || undefined,
      userId,
    );

    if (!user.stripeCustomerId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId }, // In a real provider-independent system this column should be renamed to `paymentProviderCustomerId`
      });
    }

    if (amountUsd <= 0 || credits <= 0) {
      throw new InternalServerErrorException("Invalid amount or credits");
    }

    const { clientSecret, providerPaymentId } =
      await this.paymentProvider.createPaymentIntentForCredits(
        userId,
        customerId,
        amountUsd,
        credits,
      );

    await this.prisma.paymentHistory.create({
      data: {
        userId,
        stripePaymentIntentId: providerPaymentId, // Should be renamed to providerPaymentId
        amount: Math.round(amountUsd * 100),
        currency: "usd",
        status: "PENDING",
        type: "CREDITS",
        creditsAdded: credits,
      },
    });

    return { clientSecret };
  }

  // --- Subscription (Recurring) ---
  async createSubscription(userId: string, planName: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const customerId = await this.paymentProvider.getOrCreateCustomer(
      user.email,
      user.name || undefined,
      userId,
    );

    if (!user.stripeCustomerId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const planConfig = await this.prisma.planConfig.findFirst({
      where: { plan: planName as any, isActive: true },
    });

    if (!planConfig) {
      throw new NotFoundException(`Plan ${planName} not found`);
    }

    if (!planConfig.stripePriceId) {
      throw new InternalServerErrorException(
        "Plan does not have a Stripe Price ID configured.",
      );
    }

    // --- Reuse existing incomplete subscription for the same price ---
    // This is somewhat provider specific (incomplete subs), but abstracted
    const incompleteSubs =
      await this.paymentProvider.listIncompleteSubscriptions(customerId);

    const reusableSub = incompleteSubs.find((sub: any) =>
      sub.items.data.some(
        (item: any) => item.price.id === planConfig.stripePriceId,
      ),
    );

    if (
      reusableSub &&
      this.paymentProvider["getIncompleteSubscriptionIntent"]
    ) {
      const intent = await (
        this.paymentProvider as any
      ).getIncompleteSubscriptionIntent(
        reusableSub.id,
        reusableSub.latest_invoice,
      );
      if (intent)
        return {
          clientSecret: intent.clientSecret,
          subscriptionId: intent.subscriptionId,
        };
    }

    // --- Cancel other incomplete subs ---
    const otherIncompleteSubs = incompleteSubs.filter(
      (sub: any) =>
        !sub.items.data.some(
          (item: any) => item.price.id === planConfig.stripePriceId,
        ),
    );

    for (const staleSub of otherIncompleteSubs) {
      try {
        await this.paymentProvider.cancelSubscription(staleSub.id);
      } catch {}
    }

    const existingSub = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    const { clientSecret, subscriptionId, providerPaymentId } =
      await this.paymentProvider.createSubscription(
        userId,
        customerId,
        planConfig.stripePriceId,
        planConfig.plan,
      );

    await this.prisma.paymentHistory.create({
      data: {
        userId,
        stripePaymentIntentId: providerPaymentId,
        amount: 0, // Should be fetched from intent
        currency: "usd",
        status: "PENDING",
        type: "SUBSCRIPTION",
        plan: planConfig.plan,
      },
    });

    if (existingSub) {
      await this.prisma.subscription.update({
        where: { userId },
        data: { stripeSubId: subscriptionId },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          userId,
          plan: "FREE",
          stripeSubId: subscriptionId,
        },
      });
    }

    return { clientSecret, subscriptionId };
  }

  // Wallet
  async processWalletPayment(
    userId: string,
    token: any,
    amountUsd: number,
    type: "CREDITS" | "SUBSCRIPTION",
    planName?: string,
    credits?: number,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const customerId = await this.paymentProvider.getOrCreateCustomer(
      user.email,
      user.name || undefined,
      userId,
    );

    if (type === "SUBSCRIPTION") {
      if (!planName)
        throw new InternalServerErrorException(
          "Plan name is required for subscriptions",
        );

      const planConfig = await this.prisma.planConfig.findFirst({
        where: { plan: planName as any, isActive: true },
      });

      if (!planConfig) {
        throw new NotFoundException(`Plan ${planName} not found`);
      }

      const priceId = planConfig.stripePriceId;
      if (!priceId) {
        throw new InternalServerErrorException(
          `Missing price ID for plan ${planName}`,
        );
      }

      const result = await this.paymentProvider.processWalletSubscriptionToken(
        token,
        customerId,
        priceId,
        {
          userId,
          planId: planName,
        },
      );

      if (!result.success) {
        throw new InternalServerErrorException(
          result.errorMessage || "Wallet subscription failed",
        );
      }

      await this.prisma.paymentHistory.create({
        data: {
          userId,
          stripePaymentIntentId: result.providerPaymentId || "",
          amount: Math.round(amountUsd * 100),
          currency: "usd",
          status: "SUCCEEDED",
          type: "SUBSCRIPTION",
          plan: planName.toUpperCase() as any,
        },
      });

      // Update Subscription immediately
      await this.prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeSubId: result.providerPaymentId,
          plan: planName.toUpperCase() as any,
        },
        update: {
          stripeSubId: result.providerPaymentId,
          plan: planName.toUpperCase() as any,
        },
      });

      return { success: true, providerPaymentId: result.providerPaymentId };
    }

    // CREDITS flow
    const result = await this.paymentProvider.processWalletToken(
      token,
      amountUsd,
      customerId,
      {
        userId,
        type: "CREDITS",
        creditsToAdd: (credits || 0).toString(),
      },
    );

    if (!result.success) {
      throw new InternalServerErrorException(
        result.errorMessage || "Wallet payment failed",
      );
    }

    await this.prisma.paymentHistory.create({
      data: {
        userId,
        stripePaymentIntentId: result.providerPaymentId || "",
        amount: Math.round(amountUsd * 100),
        currency: "usd",
        status: "SUCCEEDED",
        type: "CREDITS",
        creditsAdded: credits || 0,
      },
    });

    // Update Credits immediately
    if (credits && credits > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: credits } },
      });

      await this.prisma.creditTransaction.create({
        data: {
          userId,
          amount: credits,
          reason: "Purchase via Wallet",
        },
      });
    }

    return { success: true, providerPaymentId: result.providerPaymentId };
  }

  public getProvider() {
    return this.paymentProvider;
  }

  async syncPaymentStatus(providerPaymentId: string, requestUserId: string) {
    const history = await this.prisma.paymentHistory.findFirst({
      where: { stripePaymentIntentId: providerPaymentId },
    });

    if (!history) throw new NotFoundException("Payment history not found");
    if (history.userId !== requestUserId)
      throw new InternalServerErrorException(
        "Unauthorized to sync this payment",
      );
    if (history.status === "SUCCEEDED")
      return { success: true, alreadyProcessed: true };

    let isSuccess = false;
    const stripe = (this.paymentProvider as any).getStripeInstance?.();
    if (!stripe)
      return {
        success: false,
        errorMessage: "Provider does not support direct sync",
      };

    try {
      if (history.type === "SUBSCRIPTION") {
        if (providerPaymentId.startsWith("sub_")) {
          const stripeSub =
            await stripe.subscriptions.retrieve(providerPaymentId);
          if (stripeSub.status === "active" || stripeSub.status === "trialing")
            isSuccess = true;
        } else if (providerPaymentId.startsWith("pi_")) {
          const intent =
            await stripe.paymentIntents.retrieve(providerPaymentId);
          if (intent.status === "succeeded") isSuccess = true;
        }
      } else {
        if (providerPaymentId.startsWith("pi_")) {
          const intent =
            await stripe.paymentIntents.retrieve(providerPaymentId);
          if (intent.status === "succeeded") isSuccess = true;
        }
      }

      if (isSuccess) {
        await this.prisma.paymentHistory.update({
          where: { id: history.id },
          data: { status: "SUCCEEDED" },
        });

        if (history.type === "CREDITS") {
          await this.prisma.user.update({
            where: { id: history.userId },
            data: { credits: { increment: history.creditsAdded } },
          });
          await this.prisma.creditTransaction.create({
            data: {
              userId: history.userId,
              amount: history.creditsAdded,
              reason: "Purchase via Stripe Sync",
            },
          });
        } else if (history.type === "SUBSCRIPTION" && history.plan) {
          await this.prisma.subscription.upsert({
            where: { userId: history.userId },
            create: {
              userId: history.userId,
              stripeSubId: providerPaymentId,
              plan: history.plan as any,
            },
            update: {
              plan: history.plan as any,
            },
          });
        }
        return { success: true };
      }

      return { success: false, status: "PENDING" };
    } catch (err: any) {
      throw new InternalServerErrorException(
        "Failed to verify payment with Stripe: " + err.message,
      );
    }
  }

  async getPaymentHistory(userId: string) {
    return await this.prisma.paymentHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
