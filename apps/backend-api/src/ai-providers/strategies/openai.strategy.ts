import { Injectable } from '@nestjs/common';
import { BaseProviderStrategy } from './base-provider.strategy';
import { GenerationParamsDto, GenerationResultDto } from '../interfaces';

@Injectable()
export class OpenAiStrategy extends BaseProviderStrategy {
  get id(): string {
    return 'openai';
  }

  protected async doCheckAvailability(apiKey: string): Promise<boolean> {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return res.ok;
  }

  protected async doGetModels(apiKey: string): Promise<string[]> {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    return data.data?.map((m: any) => m.id).filter((id: string) => id.includes('dall-e')) || [];
  }

  protected async doGenerateImage(apiKey: string, params: GenerationParamsDto): Promise<Omit<GenerationResultDto, 'durationMs'>> {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: params.modelId || 'dall-e-3',
        prompt: params.prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'url',
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`OpenAI API Error: ${error}`);
    }

    const data = await res.json();
    return {
      imageUrl: data.data[0].url,
    };
  }
}
