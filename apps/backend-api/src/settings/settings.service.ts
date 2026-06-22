import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly REDIS_KEY = 'platform:system_settings';

  constructor(
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  async getSettings() {
    try {
      const data = await this.redisClient.get(this.REDIS_KEY);
      if (!data) return this.getDefaultSettings();
      return { ...this.getDefaultSettings(), ...JSON.parse(data) };
    } catch (e) {
      this.logger.error('Failed to get settings from Redis', e);
      return this.getDefaultSettings();
    }
  }

  async updateSettings(settings: Record<string, any>) {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await this.redisClient.set(this.REDIS_KEY, JSON.stringify(updated));
    return updated;
  }

  private getDefaultSettings() {
    return {
      platformName: 'AI Template Studio',
      supportEmail: 'support@studio.ai',
      usePicsumMock: false,
      publicRegistrations: true,
      requireEmailVerification: false,
      maintenanceMode: false
    };
  }
}
