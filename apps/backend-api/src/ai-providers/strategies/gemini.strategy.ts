import { Injectable } from '@nestjs/common';
import { BaseProviderStrategy } from './base-provider.strategy';
import { GenerationParamsDto, GenerationResultDto } from '../interfaces';

@Injectable()
export class GeminiStrategy extends BaseProviderStrategy {
  get id(): string {
    return 'gemini';
  }

  protected async doCheckAvailability(apiKey: string): Promise<boolean> {
    // Простая проверка (здесь нужен актуальный endpoint для моделей)
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    return res.ok;
  }

  protected async doGetModels(apiKey: string): Promise<string[]> {
    // В реальности возвращаем поддерживаемые модели, например gemini-pro-vision, gemini-1.5-pro
    return ['gemini-pro-vision', 'gemini-1.5-pro'];
  }

  protected async doGenerateImage(apiKey: string, params: GenerationParamsDto): Promise<Omit<GenerationResultDto, 'durationMs'>> {
    // Внимание: Google Vertex AI Imagen работает немного иначе (через GCP), 
    // но для API ключей это может выглядеть так
    throw new Error('Not implemented for direct API key yet');
  }
}
