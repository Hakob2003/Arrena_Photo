import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import type { Stripe as StripeType } from "stripe";
const Stripe = require("stripe");

@Injectable()
export class PaymentService {
  private stripe: StripeType;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secretKey = this.configService.get("STRIPE_SECRET_KEY");
    if (!secretKey) {
      throw new Error(
        "STRIPE_SECRET_KEY is not configured in environment variables.",
      );
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20", // Pin API version to ensure payment_intent is generated on invoices
    });
  }

  // --- Customer Management ---
  async getOrCreateCustomer(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException("User not found");

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  // --- Credit Purchase (One-time) ---
  async createPaymentIntentForCredits(
    userId: string,
    amountUsd: number,
    credits: number,
  ) {
    const customerId = await this.getOrCreateCustomer(userId);

    // Validate amount (in real app, validate against predefined packages)
    if (amountUsd <= 0 || credits <= 0) {
      throw new InternalServerErrorException("Invalid amount or credits");
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amountUsd * 100),
      currency: "usd",
      customer: customerId,
      payment_method_types: ["card"],
      metadata: {
        userId,
        type: "CREDITS",
        creditsToAdd: credits.toString(),
      },
    });

    // Record intent in DB
    await this.prisma.paymentHistory.create({
      data: {
        userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: Math.round(amountUsd * 100),
        currency: "usd",
        status: "PENDING",
        type: "CREDITS",
        creditsAdded: credits,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  // --- Subscription (Recurring) ---
  async createSubscription(userId: string, planName: string) {
    const customerId = await this.getOrCreateCustomer(userId);

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
    const existingStripeSubs = await this.stripe.subscriptions.list({
      customer: customerId,
      status: "incomplete",
      limit: 100,
    });

    // Find an incomplete subscription that matches the requested priceId
    const reusableSub = existingStripeSubs.data.find((sub: any) =>
      sub.items.data.some(
        (item: any) => item.price.id === planConfig.stripePriceId,
      ),
    );

    if (reusableSub) {
      // Expand the latest_invoice to get the payment_intent
      const invoice = (await this.stripe.invoices.retrieve(
        reusableSub.latest_invoice as string,
        { expand: ["payment_intent"] },
      )) as any;

      const paymentIntent = invoice.payment_intent as any;

      if (paymentIntent?.client_secret) {
        return {
          clientSecret: paymentIntent.client_secret,
          subscriptionId: reusableSub.id,
        };
      }
    }

    // --- Cancel other incomplete subs for different plans to prevent buildup ---
    const otherIncompleteSubs = existingStripeSubs.data.filter(
      (sub: any) =>
        !sub.items.data.some(
          (item: any) => item.price.id === planConfig.stripePriceId,
        ),
    );

    for (const staleSub of otherIncompleteSubs) {
      try {
        await this.stripe.subscriptions.cancel(staleSub.id);
      } catch {
        // Non-critical вЂ” log and continue
      }
    }

    // --- Check if user already has an active subscription in our DB ---
    const existingSub = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    // Create the subscription in Stripe
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: planConfig.stripePriceId }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
        payment_method_types: ["card"],
      },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        userId,
        planId: planConfig.plan,
      },
    });

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice.payment_intent as any;

    if (!paymentIntent) {
      throw new InternalServerErrorException(
        "Failed to create subscription payment intent",
      );
    }

    // Record in history
    await this.prisma.paymentHistory.create({
      data: {
        userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: "PENDING",
        type: "SUBSCRIPTION",
        plan: planConfig.plan,
      },
    });

    // Save sub ID but don't activate yet
    if (existingSub) {
      await this.prisma.subscription.update({
        where: { userId },
        data: { stripeSubId: subscription.id },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          userId,
          plan: "FREE", // remains FREE until paid
          stripeSubId: subscription.id,
        },
      });
    }

    return {
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
    };
  }

  // --- Utility ---
  public getStripeInstance() {
    return this.stripe;
  }
}
