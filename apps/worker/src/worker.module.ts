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
      useFactory: async (configService: ConfigService): Promise<any> => {
        const redisUrl = configService.get('REDIS_URL');
        if (redisUrl) {
          const url = new URL(redisUrl);
          const tlsConfig = url.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined;
          
          const conn = {
            host: url.hostname,
            port: parseInt(url.port, 10),
            username: url.username ? decodeURIComponent(url.username) : undefined,
            password: configService.get('REDIS_PASSWORD') || (url.password ? decodeURIComponent(url.password) : undefined),
            tls: tlsConfig,
          };
          
          return { connection: conn as any };
        }
        return {
          connection: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
            password: configService.get<string>('REDIS_PASSWORD') || undefined,
          },
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    BillingModule,
  ],
  providers: [GenerationProcessor, WatermarkService, GoogleDriveService, StorageService],
})
export class WorkerModule {}
