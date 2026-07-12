import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post("create-intent")
  async createIntent(
    @CurrentUser() user: any,
    @Body() body: { amount: number; type: "one-time" | "subscription" },
  ) {
    // For now, we only implement the one-time flow to test Apple/Google Pay.
    // Subscriptions would require creating a Customer and a Subscription instead of a PaymentIntent.
    return this.paymentService.createPaymentIntent(body.amount, "usd");
  }
}
