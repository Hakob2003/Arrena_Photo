import { Injectable } from '@nestjs/common';
import { BaseProviderStrategy } from './base-provider.strategy';
import { GenerationParamsDto, GenerationResultDto } from '../interfaces';

@Injectable()
export class Automatic1111ProviderStrategy extends BaseProviderStrategy {
  get id(): string {
    return 'automatic1111';
  }

  protected async doCheckAvailability(apiKey: string): Promise<boolean> {
    // TODO: Implement actual API check
    return true;
  }

  protected async doGetModels(apiKey: string): Promise<string[]> {
    // TODO: Implement actual model fetch
    return ['default-model'];
  }

  protected async doGenerateImage(apiKey: string, params: GenerationParamsDto): Promise<Omit<GenerationResultDto, 'durationMs'>> {
    // TODO: Implement actual generation
    return {
      imageUrl: 'https://placeholder.com/image.jpg',
    };
  }
}
