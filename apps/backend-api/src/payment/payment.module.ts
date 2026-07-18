import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { StripeWebhookController } from "./stripe-webhook.controller";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../prisma/prisma.module";
import { StripeProvider } from "./providers/stripe.provider";
import { PdfService } from "./pdf.service";

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [PaymentController, StripeWebhookController],
  providers: [
    PaymentService,
    PdfService,
    {
      provide: "PAYMENT_PROVIDER",
      useClass: StripeProvider,
    },
  ],
  exports: [PaymentService, PdfService, "PAYMENT_PROVIDER"],
})
export class PaymentModule {}
