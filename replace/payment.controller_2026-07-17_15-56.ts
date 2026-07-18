import {
  Controller,
  Post,
  Body,
  UseGuards,
  InternalServerErrorException,
  Get,
} from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import {
  CreatePaymentIntentDto,
  CreateSubscriptionDto,
  ProcessWalletDto,
  ValidateMerchantDto,
} from "./dto/payment.dto";
import { ConfigService } from "@nestjs/config";

@Controller("payment")
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private configService: ConfigService,
  ) {}

  @Get("config")
  async getConfig() {
    // The provider is Stripe for now
    const publishableKey =
      this.configService.get("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY") ||
      this.configService.get("STRIPE_PUBLISHABLE_KEY");

    return {
      provider: "stripe",
      publicKey: publishableKey,
      googlePayGateway: "stripe",
      // The gateway merchant ID is typically the Stripe account ID or just "stripe" config
      googlePayMerchantId: publishableKey,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post("create-intent")
  async createIntent(
    @CurrentUser() user: any,
    @Body() body: CreatePaymentIntentDto,
  ) {
    try {
      return await this.paymentService.createPaymentIntentForCredits(
        user.id,
        body.amount,
        body.credits,
      );
    } catch (e: any) {
      if (e.message?.includes("API Key") || e.message?.includes("api_key")) {
        throw new InternalServerErrorException(
          "Stripe Secret Key is missing or invalid. Please configure STRIPE_SECRET_KEY in backend .env file.",
        );
      }
      throw e;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("create-subscription")
  async createSubscription(
    @CurrentUser() user: any,
    @Body() body: CreateSubscriptionDto,
  ) {
    try {
      return await this.paymentService.createSubscription(
        user.id,
        body.planName,
      );
    } catch (e: any) {
      if (e.message?.includes("API Key") || e.message?.includes("api_key")) {
        throw new InternalServerErrorException(
          "Stripe Secret Key is missing or invalid. Please configure STRIPE_SECRET_KEY in backend .env file.",
        );
      }
      throw e;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("process-wallet")
  async processWallet(
    @CurrentUser() user: any,
    @Body() body: ProcessWalletDto,
  ) {
    try {
      return await this.paymentService.processWalletPayment(
        user.id,
        body.token,
        body.amount,
        body.type,
        body.planName,
        body.credits,
      );
    } catch (e: any) {
      throw new InternalServerErrorException(
        e.message || "Failed to process wallet payment",
      );
    }
  }

  @Post("apple-pay/validate-merchant")
  async validateMerchant(@Body() body: ValidateMerchantDto) {
    // This is a mock validation for local development as per the implementation plan
    // In production, this would make an HTTPS request to body.validationURL
    // using the merchant certificate to obtain an opaque merchant session object.

    return {
      epochTimestamp: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 5,
      merchantSessionIdentifier: "mock_session_id_" + Date.now(),
      nonce: "mock_nonce_" + Date.now(),
      merchantIdentifier: "merchant.com.arrenaphoto",
      domainName: "localhost",
      displayName: "Arrena Photo",
      signature: "mock_signature_data",
    };
  }
}
