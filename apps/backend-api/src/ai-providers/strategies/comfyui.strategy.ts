import { Injectable } from '@nestjs/common';
import { BaseProviderStrategy } from './base-provider.strategy';
import { GenerationParamsDto, GenerationResultDto } from '../interfaces';

@Injectable()
export class ComfyUiStrategy extends BaseProviderStrategy {
  get id(): string {
    return 'comfyui';
  }

  protected async doCheckAvailability(apiKey: string): Promise<boolean> {
    // ComfyUI base URL might be passed as apiKey or via system settings
    const baseUrl = apiKey.startsWith('http') ? apiKey : 'http://localhost:8188';
    try {
      const res = await fetch(`${baseUrl}/system_stats`);
      return res.ok;
    } catch {
      return false;
    }
  }

  protected async doGetModels(apiKey: string): Promise<string[]> {
    const baseUrl = apiKey.startsWith('http') ? apiKey : 'http://localhost:8188';
    const res = await fetch(`${baseUrl}/object_info`);
    const data = await res.json();
    return Object.keys(data); // Returns available nodes
  }

  protected async doGenerateImage(apiKey: string, params: GenerationParamsDto): Promise<Omit<GenerationResultDto, 'durationMs'>> {
    const baseUrl = apiKey.startsWith('http') ? apiKey : 'http://localhost:8188';
    
    // В реальности здесь нужно собирать workflow.json на основе params
    const promptWorkflow = params.workflow || {};

    const res = await fetch(`${baseUrl}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptWorkflow }),
    });

    if (!res.ok) {
      throw new Error(`ComfyUI API Error: ${await res.text()}`);
    }

    const data = await res.json();
    // Дальнейший код потребует WebSockets для ожидания окончания генерации,
    // но для простоты архитектуры адаптера возвращаем ID задачи
    return {
      meta: { prompt_id: data.prompt_id }
    };
  }
}
