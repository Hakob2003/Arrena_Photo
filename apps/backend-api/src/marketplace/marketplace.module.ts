import { Module } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { ReviewsService } from './reviews.service';
import { SocialService } from './social.service';
import { CreatorAnalyticsService } from './creator-analytics.service';
import { MarketplaceController } from './marketplace.controller';
import { CreatorController } from './creator.controller';

@Module({
  controllers: [MarketplaceController, CreatorController],
  providers: [
    MarketplaceService,
    ReviewsService,
    SocialService,
    CreatorAnalyticsService,
  ],
})
export class MarketplaceModule {}
