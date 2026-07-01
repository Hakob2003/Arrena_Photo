import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { GenerationProcessor } from './processors/generation.processor';
import { WatermarkService } from './watermark/watermark.service';
import { GoogleDriveService } from './integrations/google-drive/google-drive.service';
import { BillingModule } from './billing/billing.module';
import { StorageService } from './storage/storage.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env.prod', '../../.env'],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    BillingModule,
  ],
  providers: [GenerationProcessor, WatermarkService, GoogleDriveService, StorageService],
})
export class WorkerModule {}
