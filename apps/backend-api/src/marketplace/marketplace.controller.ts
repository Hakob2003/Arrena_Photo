import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { ReviewsService } from './reviews.service';
import { SocialService } from './social.service';
import { CreateReviewDto, ReportTemplateDto } from './dto/marketplace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Marketplace')
@Controller('marketplace')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MarketplaceController {
  constructor(
    private readonly marketplace: MarketplaceService,
    private readonly reviews: ReviewsService,
    private readonly social: SocialService,
  ) {}

  @Post('templates/:id/purchase')
  @ApiOperation({ summary: 'Purchase or download a template' })
  async purchase(@CurrentUser() user: any, @Param('id') id: string) {
    return this.marketplace.purchaseTemplate(user.id, id);
  }

  @Post('templates/:id/reviews')
  @ApiOperation({ summary: 'Leave a review' })
  async review(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: CreateReviewDto) {
    return this.reviews.addReview(user.id, id, dto);
  }

  @Post('templates/:id/favorite')
  @ApiOperation({ summary: 'Toggle favorite' })
  async favorite(@CurrentUser() user: any, @Param('id') id: string) {
    return this.social.toggleFavorite(user.id, id);
  }

  @Post('users/:id/follow')
  @ApiOperation({ summary: 'Follow/Unfollow author' })
  async follow(@CurrentUser() user: any, @Param('id') id: string) {
    return this.social.toggleFollow(user.id, id);
  }

  @Post('templates/:id/report')
  @ApiOperation({ summary: 'Report a template' })
  async report(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: ReportTemplateDto) {
    return this.marketplace.reportTemplate(user.id, id, dto.reason, dto.details);
  }
}
