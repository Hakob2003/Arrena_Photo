import { Injectable } from '@nestjs/common';
import { BaseProviderStrategy } from './base-provider.strategy';
import { GenerationParamsDto, GenerationResultDto } from '../interfaces';

@Injectable()
export class StabilityStrategy extends BaseProviderStrategy {
  get id(): string {
    return 'stability';
  }

  protected async doCheckAvailability(apiKey: string): Promise<boolean> {
    const res = await fetch('https://api.stability.ai/v1/user/account', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return res.ok;
  }

  protected async doGetModels(apiKey: string): Promise<string[]> {
    const res = await fetch('https://api.stability.ai/v1/engines/list', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    return data.map((engine: any) => engine.id) || [];
  }

  protected async doGenerateImage(apiKey: string, params: GenerationParamsDto): Promise<Omit<GenerationResultDto, 'durationMs'>> {
    const engineId = params.modelId || 'stable-diffusion-xl-1024-v1-0';
    const res = await fetch(`https://api.stability.ai/v1/generation/${engineId}/text-to-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [
          { text: params.prompt, weight: 1 },
          ...(params.negativePrompt ? [{ text: params.negativePrompt, weight: -1 }] : []),
        ],
        cfg_scale: params.cfgScale || 7,
        height: params.height || 1024,
        width: params.width || 1024,
        samples: 1,
        steps: params.steps || 30,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Stability API Error: ${error}`);
    }

    const data = await res.json();
    const base64Image = data.artifacts[0].base64;
    return {
      imageBuffer: Buffer.from(base64Image, 'base64'),
    };
  }
}
