import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { BullModule } from "@nestjs/bullmq";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { TemplatesModule } from "./templates/templates.module";
import { MarketplaceModule } from "./marketplace/marketplace.module";
import { GenerationsModule } from "./generations/generations.module";
import { RolesModule } from "./roles/roles.module";
import { StorageModule } from "./storage/storage.module";
import { AdminModule } from "./admin/admin.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { BillingModule } from "./billing/billing.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { MailModule } from "./mail/mail.module";
import { AiModule } from "./modules/ai/ai.module";
import { GoogleDriveModule } from "./integrations/google-drive/google-drive.module";
import { ScheduleModule } from "@nestjs/schedule";
import { ProfileModule } from "./profile/profile.module";

import { SettingsModule } from "./settings/settings.module";
import { PaymentModule } from "./payment/payment.module";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      envFilePath: "../../.env",
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // 100 requests per minute
      },
    ]),

    // Redis & BullMQ
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<any> => {
        const redisUrl = configService.get("REDIS_URL");
        if (redisUrl) {
          const url = new URL(redisUrl);
          const tlsConfig =
            url.protocol === "rediss:"
              ? { rejectUnauthorized: false }
              : undefined;

          const conn = {
            host: url.hostname,
            port: parseInt(url.port, 10),
            username: url.username
              ? decodeURIComponent(url.username)
              : undefined,
            password:
              configService.get("REDIS_PASSWORD") ||
              (url.password ? decodeURIComponent(url.password) : undefined),
            tls: tlsConfig,
          };

          return { connection: conn as any };
        }
        return {
          connection: {
            host: configService.get("REDIS_HOST", "localhost"),
            port: configService.get("REDIS_PORT", 6379),
            password: configService.get("REDIS_PASSWORD") || undefined,
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
    ProfileModule,
    SettingsModule,
    PaymentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
