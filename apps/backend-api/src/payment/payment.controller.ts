import {
  Controller,
  Post,
  Body,
  UseGuards,
  InternalServerErrorException,
  Get,
  Query,
  Param,
  Res,
} from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PdfService } from "./pdf.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import {
  CreatePaymentIntentDto,
  CreateSubscriptionDto,
  ProcessWalletDto,
  ValidateMerchantDto,
} from "./dto/payment.dto";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import { IJwtPayload } from "@arrena-photo/shared-types";

@Controller("payment")
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly pdfService: PdfService,
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
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("create-intent")
  async createIntent(
    @CurrentUser() user: IJwtPayload,
    @Body() body: CreatePaymentIntentDto,
  ) {
    try {
      return await this.paymentService.createPaymentIntentForCredits(
        user.id,
        body.amount,
        body.credits,
      );
    } catch (err: unknown) {
      const e = err as Error;
      if (e.message?.includes("API Key") || e.message?.includes("api_key")) {
        throw new InternalServerErrorException(
          "Stripe Secret Key is missing or invalid. Please configure STRIPE_SECRET_KEY in backend .env file.",
        );
      }
      throw e;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("create-subscription")
  async createSubscription(
    @CurrentUser() user: IJwtPayload,
    @Body() body: CreateSubscriptionDto,
  ) {
    try {
      return await this.paymentService.createSubscription(
        user.id,
        body.planName,
      );
    } catch (err: unknown) {
      const e = err as Error;
      if (e.message?.includes("API Key") || e.message?.includes("api_key")) {
        throw new InternalServerErrorException(
          "Stripe Secret Key is missing or invalid. Please configure STRIPE_SECRET_KEY in backend .env file.",
        );
      }
      throw e;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("process-wallet")
  async processWallet(
    @CurrentUser() user: IJwtPayload,
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
    } catch (err: unknown) {
      const e = err as Error;
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

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("sync-status")
  async syncStatus(
    @CurrentUser() user: IJwtPayload,
    @Body() body: { paymentIntentId: string },
  ) {
    if (!body.paymentIntentId) {
      throw new InternalServerErrorException("paymentIntentId is required");
    }
    try {
      return await this.paymentService.syncPaymentStatus(
        body.paymentIntentId,
        user.id,
      );
    } catch (err: unknown) {
      const e = err as Error;
      throw new InternalServerErrorException(
        e.message || "Failed to sync payment status",
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("history")
  async getHistory(
    @CurrentUser() user: IJwtPayload,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "5",
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("type") type?: string,
    @Query("plan") plan?: string,
    @Query("minAmount") minAmount?: string,
    @Query("maxAmount") maxAmount?: string,
    @Query("status") status?: string,
    @Query("txId") txId?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "asc" | "desc",
  ) {
    try {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 5);

      const filters = {
        startDate,
        endDate,
        type,
        plan,
        minAmount: minAmount ? parseInt(minAmount, 10) : undefined,
        maxAmount: maxAmount ? parseInt(maxAmount, 10) : undefined,
        status,
        txId,
        sortBy,
        sortOrder,
      };

      return await this.paymentService.getPaymentHistory(
        user.id,
        pageNum,
        limitNum,
        filters,
      );
    } catch (err: unknown) {
      const e = err as Error;
      throw new InternalServerErrorException(
        e.message || "Failed to get payment history",
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id/receipt")
  async getReceipt(
    @CurrentUser() user: IJwtPayload,
    @Param("id") id: string,
    @Query("lang") lang: string,
    @Res() res: any,
  ) {
    try {
      await this.pdfService.generateReceipt(id, user.id, lang || "en", res);
    } catch (err: unknown) {
      const e = err as Error;
      console.error("[PDF Generation Error]:", e);
      throw new InternalServerErrorException({
        message: "Failed to generate receipt",
        error: e.message,
        stack: e.stack,
      });
    }
  }
}
