import { Injectable } from '@nestjs/common';
import { AiProviderFactory } from './core/ai-provider.factory';
import { GenerationParamsDto, GenerationResultDto } from './interfaces';

@Injectable()
export class AiProvidersService {
  constructor(private readonly factory: AiProviderFactory) {}

  async generateImage(providerId: string, apiKey: string, params: GenerationParamsDto): Promise<GenerationResultDto> {
    const strategy = this.factory.getStrategy(providerId);
    return strategy.generateImage(apiKey, params);
  }

  async checkProvider(providerId: string, apiKey: string): Promise<boolean> {
    const strategy = this.factory.getStrategy(providerId);
    return strategy.checkAvailability(apiKey);
  }

  async getSupportedModels(providerId: string, apiKey: string): Promise<string[]> {
    const strategy = this.factory.getStrategy(providerId);
    return strategy.getModels(apiKey);
  }

  getAvailableProviders(): string[] {
    return this.factory.getAvailableProviders();
  }
}
