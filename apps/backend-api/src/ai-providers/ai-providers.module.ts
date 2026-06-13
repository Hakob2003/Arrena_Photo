import { Module } from '@nestjs/common';
import { AiProvidersService } from './ai-providers.service';
import { AiProviderFactory } from './core/ai-provider.factory';

// Strategies
import { OpenAiStrategy } from './strategies/openai.strategy';
import { GeminiStrategy } from './strategies/gemini.strategy';
import { StabilityStrategy } from './strategies/stability.strategy';
import { ComfyUiStrategy } from './strategies/comfyui.strategy';

import { ClaudeProviderStrategy } from './strategies/claude.strategy';
import { DeepSeekProviderStrategy } from './strategies/deepseek.strategy';
import { QwenProviderStrategy } from './strategies/qwen.strategy';
import { GrokProviderStrategy } from './strategies/grok.strategy';
import { MistralProviderStrategy } from './strategies/mistral.strategy';
import { FluxProviderStrategy } from './strategies/flux.strategy';
import { ReplicateProviderStrategy } from './strategies/replicate.strategy';
import { FalAiProviderStrategy } from './strategies/fal-ai.strategy';
import { HuggingFaceProviderStrategy } from './strategies/huggingface.strategy';
import { Automatic1111ProviderStrategy } from './strategies/automatic1111.strategy';
import { ForgeProviderStrategy } from './strategies/forge.strategy';
import { FooocusProviderStrategy } from './strategies/fooocus.strategy';
import { InvokeAiProviderStrategy } from './strategies/invokeai.strategy';
import { RunPodProviderStrategy } from './strategies/runpod.strategy';

@Module({
  providers: [
    AiProvidersService,
    AiProviderFactory,
    OpenAiStrategy,
    GeminiStrategy,
    StabilityStrategy,
    ComfyUiStrategy,
    ClaudeProviderStrategy,
    DeepSeekProviderStrategy,
    QwenProviderStrategy,
    GrokProviderStrategy,
    MistralProviderStrategy,
    FluxProviderStrategy,
    ReplicateProviderStrategy,
    FalAiProviderStrategy,
    HuggingFaceProviderStrategy,
    Automatic1111ProviderStrategy,
    ForgeProviderStrategy,
    FooocusProviderStrategy,
    InvokeAiProviderStrategy,
    RunPodProviderStrategy,
  ],
  exports: [AiProvidersService],
})
export class AiProvidersModule {}
