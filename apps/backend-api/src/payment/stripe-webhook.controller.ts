import { Controller, Post, Req, Res, Headers, RawBodyRequest, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentService } from "./payment.service";

@Controller("payments/webhook")
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService
  ) {}

  @Post()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers("stripe-signature") signature: string
  ) {
    const webhookSecret = this.configService.get("STRIPE_WEBHOOK_SECRET");
    const stripe = (this.paymentService.getProvider() as any).getStripeInstance();

    let event;

    try {
      if (!webhookSecret) {
        // Fallback for test environments without webhook secret
        this.logger.warn("No STRIPE_WEBHOOK_SECRET found, trusting event body (TEST MODE ONLY).");
        event = req.body;
      } else {
        if (!req.rawBody) {
          this.logger.error("Raw body is missing! Check NestJS rawBody configuration.");
          return res.status(400).send("Webhook Error: Raw body missing");
        }
        event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
      }
    } catch (err: any) {
      this.logger.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Idempotency check
    const existingEvent = await this.prisma.stripeWebhookEvent.findUnique({
      where: { id: event.id },
    });

    if (existingEvent) {
      this.logger.log(`Skipping duplicate event ${event.id}`);
      return res.status(200).send("Duplicate event ignored");
    }

    try {
      await this.processEvent(event);
      
      // Mark as processed
      await this.prisma.stripeWebhookEvent.create({
        data: {
          id: event.id,
          type: event.type,
          status: "PROCESSED",
        }
      });
      
      res.status(200).json({ received: true });
    } catch (error: any) {
      this.logger.error(`Failed to process event ${event.id}:`, error);
      // Still return 200 to Stripe so it doesn't retry infinitely if our app logic fails 
      // (Unless it's a critical error where we want Stripe to retry)
      res.status(200).send("Event processed with application errors");
    }
  }

  private async processEvent(event: any) {
    const data = event.data.object;

    switch (event.type) {
      case "payment_intent.succeeded":
        await this.handlePaymentIntentSucceeded(data);
        break;
      
      case "payment_intent.payment_failed":
        await this.handlePaymentIntentFailed(data);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await this.handleSubscriptionUpdated(data);
        break;
        
      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(data);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: any) {
    // Check if it's a credit purchase
    if (paymentIntent.metadata?.type === "CREDITS") {
      const userId = paymentIntent.metadata.userId;
      const creditsToAdd = parseInt(paymentIntent.metadata.creditsToAdd || "0", 10);

      // Update history
      await this.prisma.paymentHistory.updateMany({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: { status: "SUCCEEDED" },
      });

      if (userId && creditsToAdd > 0) {
        // Add credits to user
        await this.prisma.user.update({
          where: { id: userId },
          data: { credits: { increment: creditsToAdd } },
        });

        // Create transaction record
        await this.prisma.creditTransaction.create({
          data: {
            userId,
            amount: creditsToAdd,
            reason: "Purchase via Stripe",
          }
        });
        
        this.logger.log(`Successfully added ${creditsToAdd} credits to user ${userId}`);
      }
    } else {
      // It's a subscription or something else
      await this.prisma.paymentHistory.updateMany({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: { status: "SUCCEEDED" },
      });
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: any) {
    await this.prisma.paymentHistory.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: "FAILED" },
    });
    this.logger.warn(`Payment Intent Failed: ${paymentIntent.id}`);
  }

  private async handleSubscriptionUpdated(subscription: any) {
    const userId = subscription.metadata?.userId;
    const planId = subscription.metadata?.planId;

    if (!userId || !planId) return;

    if (subscription.status === "active") {
      await this.prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeSubId: subscription.id,
          plan: planId as any,
        },
        update: {
          stripeSubId: subscription.id,
          plan: planId as any,
          expiresAt: new Date(subscription.current_period_end * 1000),
        },
      });
      this.logger.log(`Subscription ${subscription.id} active for user ${userId}`);
    }
  }

  private async handleSubscriptionDeleted(subscription: any) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        plan: "FREE",
        stripeSubId: null,
      },
    });
    this.logger.log(`Subscription ${subscription.id} cancelled for user ${userId}`);
  }
}
