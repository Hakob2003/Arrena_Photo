import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  async getSettings() {
    return {
      platformName: 'AI Template Studio',
      supportEmail: 'support@studio.ai',
      usePicsumMock: (global as any).usePicsumMock !== false,
      publicRegistrations: true,
      requireEmailVerification: false,
      maintenanceMode: false
    };
  }

  async updateSettings(settings: Record<string, any>) {
    if (settings.usePicsumMock !== undefined) {
      (global as any).usePicsumMock = settings.usePicsumMock;
    }
    return this.getSettings();
  }
}

