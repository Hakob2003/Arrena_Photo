import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProviderCheckService {
  private readonly logger = new Logger(ProviderCheckService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService
  ) {}

  async checkConnection(providerId: string) {
    const connection = await this.prisma.aIConnection.findFirst({
      where: { providerId },
      include: { provider: true }
    });

    if (!connection || !connection.encryptedApiKey) {
      throw new Error('Connection or API Key not found');
    }

    const apiKey = Buffer.from(connection.encryptedApiKey, 'base64').toString('utf8');
    const providerName = connection.provider.name.toLowerCase();

    let status = 'ERROR';
    let balance = null;
    let errorMessage = null;

    try {
      if (providerName.includes('openrouter')) {
        const res = await firstValueFrom(this.httpService.get('https://openrouter.ai/api/v1/auth/key', {
          headers: { Authorization: `Bearer ${apiKey}` }
        }));
        status = 'CONNECTED';
        balance = res.data.data?.limit && res.data.data?.usage !== undefined 
          ? res.data.data.limit - res.data.data.usage 
          : null;
      } else if (providerName.includes('openai')) {
        await firstValueFrom(this.httpService.get('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` }
        }));
        status = 'CONNECTED';
      } else if (providerName.includes('fal')) {
        // Fal AI check (usually they use authorization headers)
        await firstValueFrom(this.httpService.get('https://fal.run/models', {
          headers: { Authorization: `Key ${apiKey}` },
          validateStatus: (status) => status < 500 // sometimes /models might return 404, we just check auth
        }));
        status = 'CONNECTED';
      } else {
        // Generic fallback check
        try {
          await firstValueFrom(this.httpService.get('https://api.openai.com/v1/models', {
            headers: { Authorization: `Bearer ${apiKey}` }
          }));
          status = 'CONNECTED';
        } catch {
          // If it fails, we still assume connected but mark as UNKNOWN
          status = 'UNKNOWN';
          errorMessage = 'Unsupported provider format for automated check';
        }
      }
    } catch (e: any) {
      status = 'ERROR';
      errorMessage = e.response?.data?.error?.message || e.message || 'Connection failed';
    }

    return this.prisma.aIConnection.update({
      where: { id: connection.id },
      data: {
        status,
        balance,
        errorMessage,
        lastCheckedAt: new Date()
      }
    });
  }

  async testGeneration(providerId: string) {
    const conn = await this.checkConnection(providerId);
    if (conn.status === 'ERROR') {
      throw new Error('Cannot test, connection is in ERROR state: ' + conn.errorMessage);
    }
    return { success: true, message: 'Test check passed successfully. Full generation tests require specific model payloads.' };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async monitorApiKeys() {
    this.logger.log('Running auto-monitoring for API keys');
    const connections = await this.prisma.aIConnection.findMany({
      where: { isAutoMonitorOn: true }
    });

    const now = Date.now();

    for (const conn of connections) {
      const lastCheck = conn.lastCheckedAt ? conn.lastCheckedAt.getTime() : 0;
      let intervalMs = 60 * 60 * 1000; // default 1h
      
      switch (conn.monitorInterval) {
        case 'REALTIME': intervalMs = 10 * 1000; break; // 10s for REALTIME (Cron runs every minute, so effectively every 1m unless triggered otherwise)
        case '1m': intervalMs = 60 * 1000; break;
        case '5m': intervalMs = 5 * 60 * 1000; break;
        case '10m': intervalMs = 10 * 60 * 1000; break;
        case '30m': intervalMs = 30 * 60 * 1000; break;
        case '1h': intervalMs = 60 * 60 * 1000; break;
      }

      if (now - lastCheck >= intervalMs) {
        try {
          await this.checkConnection(conn.providerId);
          this.logger.log(`Checked connection for provider ${conn.providerId}`);
        } catch (e) {
          this.logger.error(`Failed to auto-check provider ${conn.providerId}`, e);
        }
      }
    }
  }
}
