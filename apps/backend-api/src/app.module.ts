import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import Redis from 'ioredis';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TemplatesModule } from './templates/templates.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { GenerationsModule } from './generations/generations.module';
import { RolesModule } from './roles/roles.module';
import { StorageModule } from './storage/storage.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BillingModule } from './billing/billing.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MailModule } from './mail/mail.module';
import { AiModule } from './modules/ai/ai.module';
import { GoogleDriveModule } from './integrations/google-drive/google-drive.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    
    // Rate Limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // 100 requests per minute
    }]),

    // Redis & BullMQ
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');
        if (redisUrl) {
          const url = new URL(redisUrl);
          const tlsConfig = url.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined;
          
          return {
            connection: new Redis(redisUrl, {
              maxRetriesPerRequest: null,
              tls: tlsConfig,
              password: configService.get('REDIS_PASSWORD') || undefined,
            }) as any,
          };
        }
        return {
          connection: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
            password: configService.get('REDIS_PASSWORD') || undefined,
          },
        };
      },
      inject: [ConfigService],
    }),

    // Core Modules
    PrismaModule,
    
    // Feature Modules
    AuthModule,
    UsersModule,
    TemplatesModule,
    MarketplaceModule,
    GenerationsModule,
    RolesModule,
    StorageModule,
    AdminModule,
    AnalyticsModule,
    BillingModule,
    NotificationsModule,
    MailModule,
    AiModule,
    GoogleDriveModule,
  ],
})
export class AppModule {}
