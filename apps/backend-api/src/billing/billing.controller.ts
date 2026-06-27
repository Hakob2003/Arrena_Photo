import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('subscription')
  @ApiOperation({ summary: 'Get current user subscription status' })
  getSubscription(@Request() req) {
    return this.billingService.getSubscription(req.user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get credit transaction history' })
  getCreditHistory(@Request() req) {
    return this.billingService.getCreditHistory(req.user.id);
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'Get user payment methods' })
  getPaymentMethods(@Request() req) {
    return this.billingService.getPaymentMethods(req.user.id);
  }

  @Post('payment-methods')
  @ApiOperation({ summary: 'Add a new payment method' })
  addPaymentMethod(@Request() req, @Body() data: any) {
    return this.billingService.addPaymentMethod(req.user.id, data);
  }

  @Delete('payment-methods/:id')
  @ApiOperation({ summary: 'Delete a payment method' })
  deletePaymentMethod(@Request() req, @Param('id') id: string) {
    return this.billingService.deletePaymentMethod(req.user.id, id);
  }

  @Put('payment-methods/:id/default')
  @ApiOperation({ summary: 'Set payment method as default' })
  setDefaultPaymentMethod(@Request() req, @Param('id') id: string) {
    return this.billingService.setDefaultPaymentMethod(req.user.id, id);
  }

  @Put('payment-methods/:id/limit')
  @ApiOperation({ summary: 'Update payment method limit' })
  setPaymentMethodLimit(@Request() req, @Param('id') id: string, @Body('limit') limit: number) {
    return this.billingService.updatePaymentMethodLimit(req.user.id, id, limit);
  }

  @Post('charge')
  @ApiOperation({ summary: 'Charge the default payment method' })
  chargePaymentMethod(@Request() req, @Body('amount') amount: number, @Body('reason') reason: string) {
    return this.billingService.chargePaymentMethod(req.user.id, amount, reason);
  }

  @Post('add-credits')
  @ApiOperation({ summary: 'Mock endpoint to add credits directly (Admin)' })
  addCredits(@Request() req, @Body('amount') amount: number, @Body('reason') reason: string) {
    return this.billingService.addCredits(req.user.id, amount, reason);
  }
}
