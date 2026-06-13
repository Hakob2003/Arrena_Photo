import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
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

  @Post('add-credits')
  @ApiOperation({ summary: 'Mock endpoint to add credits' })
  addCredits(@Request() req, @Body('amount') amount: number, @Body('reason') reason: string) {
    return this.billingService.addCredits(req.user.id, amount, reason);
  }
}
