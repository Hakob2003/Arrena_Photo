import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

// Use require for the Stripe instance to avoid esModuleInterop issues,
// and import type for the type definitions.
import type { Stripe as StripeType } from "stripe";
const Stripe = require("stripe");

@Injectable()
export class PaymentService {
  private stripe: StripeType;

  constructor(private configService: ConfigService) {
    // We use a mock test key as fallback so it doesn't crash if env is missing
    const secretKey =
      this.configService.get("STRIPE_SECRET_KEY") || "mock_test_key";
    this.stripe = new Stripe(secretKey, {
      apiVersion: "2024-04-10", // specify API version to avoid warnings
    });
  }

  async createPaymentIntent(amount: number, currency: string = "usd") {
    try {
      // Stripe expects amounts in cents
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        mock: false,
      };
    } catch (error: any) {
      // If the API key is expired or invalid (e.g. dummy key from docs),
      // we mock the response so the frontend template doesn't crash with a 500.
      if (
        error.message?.includes("API Key") ||
        error.message?.includes("api_key")
      ) {
        return {
          clientSecret: "mock_client_secret_for_template",
          mock: true,
        };
      }
      throw error;
    }
  }
}
