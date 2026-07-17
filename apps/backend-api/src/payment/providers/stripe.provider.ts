import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Stripe as StripeType } from 'stripe';
import { PaymentProvider, CreateIntentResult, CreateSubscriptionResult } from '../interfaces/payment-provider.interface';

const Stripe = require('stripe');

@Injectable()
export class StripeProvider implements PaymentProvider {
  private stripe: StripeType;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get("STRIPE_SECRET_KEY");
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured in environment variables.");
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20", 
    });
  }

  async getOrCreateCustomer(email: string, name?: string, userId?: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: userId ? { userId } : undefined,
    });
    return customer.id;
  }

  async createPaymentIntentForCredits(userId: string, customerId: string, amountUsd: number, credits: number): Promise<CreateIntentResult> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amountUsd * 100),
      currency: "usd",
      customer: customerId,
      payment_method_types: ['card'],
      metadata: {
        userId,
        type: "CREDITS",
        creditsToAdd: credits.toString(),
      },
    });

    if (!paymentIntent.client_secret) {
      throw new InternalServerErrorException("Failed to generate client secret");
    }

    return {
      clientSecret: paymentIntent.client_secret,
      providerPaymentId: paymentIntent.id,
    };
  }

  async createSubscription(userId: string, customerId: string, priceId: string, planName: string): Promise<CreateSubscriptionResult> {
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { 
        save_default_payment_method: "on_subscription",
        payment_method_types: ['card']
      },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        userId,
        planId: planName,
      },
    });

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice.payment_intent as any;

    if (!paymentIntent || !paymentIntent.client_secret) {
      throw new InternalServerErrorException("Failed to create subscription payment intent");
    }

    return {
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
      providerPaymentId: paymentIntent.id,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.cancel(subscriptionId);
  }

  async listIncompleteSubscriptions(customerId: string): Promise<any[]> {
    const existingStripeSubs = await this.stripe.subscriptions.list({
      customer: customerId,
      status: "incomplete",
      limit: 100,
    });
    return existingStripeSubs.data;
  }

  async getIncompleteSubscriptionIntent(subscriptionId: string, invoiceId: string): Promise<CreateSubscriptionResult | null> {
      const invoice = await this.stripe.invoices.retrieve(
        invoiceId,
        { expand: ["payment_intent"] }
      ) as any;

      const paymentIntent = invoice.payment_intent as any;

      if (paymentIntent?.client_secret) {
        return {
          clientSecret: paymentIntent.client_secret,
          subscriptionId: subscriptionId,
          providerPaymentId: paymentIntent.id,
        };
      }
      return null;
  }

  async processWalletToken(token: any, amountUsd: number, customerId: string, metadata?: Record<string, any>): Promise<{ success: boolean; providerPaymentId?: string; errorMessage?: string }> {
    // When using Stripe as the backend for Google/Apple Pay via token:
    // Stripe expects you to create a PaymentMethod from the token, then a PaymentIntent, and confirm it.
    try {
      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amountUsd * 100),
        currency: "usd",
        customer: customerId,
        payment_method_data: {
          type: 'card',
          card: {
            token: typeof token === 'string' ? token : token.id,
          }
        } as any,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
        metadata: metadata || {},
        // If 3DS or other actions are required, return_url might be needed if automatic,
        // but typically wallets are pre-authenticated
      });

      if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture') {
        return { success: true, providerPaymentId: paymentIntent.id };
      } else if (paymentIntent.status === 'requires_action') {
        // Here we could handle 3D Secure, but typically Google/Apple Pay shouldn't need it
        // Or we pass the client_secret back to the frontend to complete the action
        return { success: false, errorMessage: 'Additional action required', providerPaymentId: paymentIntent.id };
      }

      return { success: false, errorMessage: `Unhandled status: ${paymentIntent.status}` };
    } catch (error: any) {
      return { success: false, errorMessage: error.message };
    }
  }

  async processWalletSubscriptionToken(token: any, customerId: string, priceId: string, metadata?: Record<string, any>): Promise<{ success: boolean; providerPaymentId?: string; errorMessage?: string }> {
    try {
      // 1. Create a PaymentMethod from the token
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          token: typeof token === 'string' ? token : token.id,
        },
      });

      // 2. Attach the PaymentMethod to the Customer
      await this.stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customerId,
      });

      // 3. Set the default payment method on the customer
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });

      // 4. Create the subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        default_payment_method: paymentMethod.id,
        expand: ['latest_invoice.payment_intent'],
        metadata: metadata || {},
      });

      // 5. Check the status
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        return { success: true, providerPaymentId: subscription.id };
      } else {
        const invoice = subscription.latest_invoice as any;
        const intent = invoice?.payment_intent;
        if (intent && intent.status === 'requires_action') {
           return { success: false, errorMessage: 'Additional action required', providerPaymentId: subscription.id };
        }
        return { success: false, errorMessage: `Subscription status is ${subscription.status}` };
      }
    } catch (error: any) {
      return { success: false, errorMessage: error.message };
    }
  }

  // Utility to expose stripe instance for webhook handling etc
  getStripeInstance() {
    return this.stripe;
  }
}
