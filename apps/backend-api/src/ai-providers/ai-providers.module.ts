import { Module } from '@nestjs/common';
import { AiProvidersService } from './ai-providers.service';
import { AiProviderFactory } from './core/ai-provider.factory';
import { OpenAiStrategy } from './strategies/openai.strategy';
import { GeminiStrategy } from './strategies/gemini.strategy';
import { StabilityStrategy } from './strategies/stability.strategy';
import { ComfyUiStrategy } from './strategies/comfyui.strategy';

@Module({
  providers: [
    AiProvidersService,
    AiProviderFactory,
    OpenAiStrategy,
    GeminiStrategy,
    StabilityStrategy,
    ComfyUiStrategy,
  ],
  exports: [AiProvidersService],
})
export class AiProvidersModule {}
