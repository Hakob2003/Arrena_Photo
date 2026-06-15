import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GenerationsController } from './generations.controller';
import { GenerationsService } from './generations.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GenerationProcessor } from './generation.processor';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'generations',
    }),
    BillingModule,
  ],
  controllers: [GenerationsController],
  providers: [GenerationsService, GenerationProcessor],
  exports: [GenerationsService],
})
export class GenerationsModule {}
