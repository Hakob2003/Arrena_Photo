import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreatorAnalyticsService } from './creator-analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Creator Dashboard')
@Controller('creator')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CreatorController {
  constructor(private readonly analytics: CreatorAnalyticsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get creator dashboard statistics' })
  async getStats(@CurrentUser() user: any) {
    return this.analytics.getDashboardStats(user.id);
  }

  @Post('payouts/request')
  @ApiOperation({ summary: 'Request a payout' })
  async requestPayout(@CurrentUser() user: any, @Body('amount') amount: number) {
    return this.analytics.requestPayout(user.id, amount);
  }
}
