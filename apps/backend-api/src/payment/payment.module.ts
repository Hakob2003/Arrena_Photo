import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { StripeWebhookController } from "./stripe-webhook.controller";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../prisma/prisma.module";
import { StripeProvider } from "./providers/stripe.provider";

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [PaymentController, StripeWebhookController],
  providers: [
    PaymentService,
    {
      provide: 'PAYMENT_PROVIDER',
      useClass: StripeProvider
    }
  ],
  exports: [PaymentService, 'PAYMENT_PROVIDER'],
})
export class PaymentModule {}
