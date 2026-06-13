import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
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

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
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
          return {
            connection: {
              host: url.hostname,
              port: parseInt(url.port, 10),
              username: url.username,
              password: url.password,
              tls: url.protocol === 'rediss:' ? {} : undefined,
            },
          };
        }
        return {
          connection: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
            password: configService.get('REDIS_PASSWORD', ''),
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
  ],
})
export class AppModule {}
