import { Injectable, NotFoundException } from '@nestjs/common';
import { AiProviderStrategy } from '../interfaces';
import { OpenAiStrategy } from '../strategies/openai.strategy';
import { GeminiStrategy } from '../strategies/gemini.strategy';
import { StabilityStrategy } from '../strategies/stability.strategy';

@Injectable()
export class AiProviderFactory {
  private readonly strategies = new Map<string, AiProviderStrategy>();

  constructor(
    private openai: OpenAiStrategy,
    private gemini: GeminiStrategy,
    private stability: StabilityStrategy,
  ) {
    // Регистрация всех доступных стратегий
    this.registerStrategy(this.openai);
    this.registerStrategy(this.gemini);
    this.registerStrategy(this.stability);
    // Добавление новых провайдеров сводится к передаче их сюда
  }

  private registerStrategy(strategy: AiProviderStrategy) {
    this.strategies.set(strategy.id, strategy);
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
