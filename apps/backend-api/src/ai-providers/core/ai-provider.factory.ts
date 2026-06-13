import { Injectable, NotFoundException } from '@nestjs/common';
import { AiProviderStrategy } from '../interfaces';

import { OpenAiStrategy } from '../strategies/openai.strategy';
import { GeminiStrategy } from '../strategies/gemini.strategy';
import { StabilityStrategy } from '../strategies/stability.strategy';
import { ComfyUiStrategy } from '../strategies/comfyui.strategy';

import { ClaudeProviderStrategy } from '../strategies/claude.strategy';
import { DeepSeekProviderStrategy } from '../strategies/deepseek.strategy';
import { QwenProviderStrategy } from '../strategies/qwen.strategy';
import { GrokProviderStrategy } from '../strategies/grok.strategy';
import { MistralProviderStrategy } from '../strategies/mistral.strategy';
import { FluxProviderStrategy } from '../strategies/flux.strategy';
import { ReplicateProviderStrategy } from '../strategies/replicate.strategy';
import { FalAiProviderStrategy } from '../strategies/fal-ai.strategy';
import { HuggingFaceProviderStrategy } from '../strategies/huggingface.strategy';
import { Automatic1111ProviderStrategy } from '../strategies/automatic1111.strategy';
import { ForgeProviderStrategy } from '../strategies/forge.strategy';
import { FooocusProviderStrategy } from '../strategies/fooocus.strategy';
import { InvokeAiProviderStrategy } from '../strategies/invokeai.strategy';
import { RunPodProviderStrategy } from '../strategies/runpod.strategy';

@Injectable()
export class AiProviderFactory {
  private readonly strategies = new Map<string, AiProviderStrategy>();

  constructor(
    private openai: OpenAiStrategy,
    private gemini: GeminiStrategy,
    private stability: StabilityStrategy,
    private comfyui: ComfyUiStrategy,
    private claude: ClaudeProviderStrategy,
    private deepseek: DeepSeekProviderStrategy,
    private qwen: QwenProviderStrategy,
    private grok: GrokProviderStrategy,
    private mistral: MistralProviderStrategy,
    private flux: FluxProviderStrategy,
    private replicate: ReplicateProviderStrategy,
    private falai: FalAiProviderStrategy,
    private huggingface: HuggingFaceProviderStrategy,
    private automatic1111: Automatic1111ProviderStrategy,
    private forge: ForgeProviderStrategy,
    private fooocus: FooocusProviderStrategy,
    private invokeai: InvokeAiProviderStrategy,
    private runpod: RunPodProviderStrategy,
  ) {
    this.registerStrategy(this.openai);
    this.registerStrategy(this.gemini);
    this.registerStrategy(this.stability);
    this.registerStrategy(this.comfyui);
    
    this.registerStrategy(this.claude);
    this.registerStrategy(this.deepseek);
    this.registerStrategy(this.qwen);
    this.registerStrategy(this.grok);
    this.registerStrategy(this.mistral);
    this.registerStrategy(this.flux);
    this.registerStrategy(this.replicate);
    this.registerStrategy(this.falai);
    this.registerStrategy(this.huggingface);
    this.registerStrategy(this.automatic1111);
    this.registerStrategy(this.forge);
    this.registerStrategy(this.fooocus);
    this.registerStrategy(this.invokeai);
    this.registerStrategy(this.runpod);
  }

  private registerStrategy(strategy: AiProviderStrategy) {
    this.strategies.set(strategy.id.toLowerCase(), strategy);
  }

  getStrategy(providerId: string): AiProviderStrategy {
    const strategy = this.strategies.get(providerId.toLowerCase());
    if (!strategy) {
      throw new NotFoundException(`AI Provider strategy for '${providerId}' not found or not implemented.`);
    }
    return strategy;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.strategies.keys());
  }
}
