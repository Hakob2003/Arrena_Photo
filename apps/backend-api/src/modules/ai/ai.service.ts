import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { ChatMessage, ChatResponse, IAIProvider } from './interfaces/ai-provider.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private primaryProvider: IAIProvider;
  private readonly defaultFallbackModel = 'openrouter/free';

  constructor(private readonly prisma: PrismaService) {
    // Initialize OpenRouter provider
    const apiKey = process.env.OPENROUTER_API_KEY || '';
    const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    
    this.primaryProvider = new OpenRouterProvider(apiKey, baseUrl);
  }

  /**
   * Tracks usage in the AIUsage table
   */
  private async trackUsage(userId: string, response: ChatResponse) {
    if (!userId) return; // Skip tracking if no user context (e.g. anonymous test)
    
    try {
      await this.prisma.aIUsage.create({
        data: {
          userId,
          model: response.model,
          inputTokens: response.inputTokens,
          outputTokens: response.outputTokens,
          totalTokens: response.totalTokens,
        },
      });
    } catch (error) {
      this.logger.error('Failed to track AI usage', error);
    }
  }

  /**
   * Resolves the model to use. Uses environment default if not specified.
   */
  private getModel(requestedModel?: string): string {
    return requestedModel || process.env.OPENROUTER_MODEL || this.defaultFallbackModel;
  }

  async chat(userId: string, messages: ChatMessage[], modelSlug?: string): Promise<ChatResponse> {
    const targetModel = this.getModel(modelSlug);
    
    try {
      const result = await this.primaryProvider.chat(messages, targetModel);
      await this.trackUsage(userId, result);
      return result;
    } catch (error) {
      this.logger.warn(`Primary model ${targetModel} failed: ${error.message}. Attempting fallback.`);
      
      // Fallback Logic
      if (targetModel !== this.defaultFallbackModel) {
        try {
          const fallbackResult = await this.primaryProvider.chat(messages, this.defaultFallbackModel);
          await this.trackUsage(userId, fallbackResult);
          return fallbackResult;
        } catch (fallbackError) {
          throw new HttpException(`AI Service unavailable after fallback: ${fallbackError.message}`, HttpStatus.SERVICE_UNAVAILABLE);
        }
      }
      
      throw error;
    }
  }

  async *stream(userId: string, messages: ChatMessage[], modelSlug?: string): AsyncGenerator<string, void, unknown> {
    const targetModel = this.getModel(modelSlug);

    try {
      const generator = this.primaryProvider.stream(messages, targetModel);
      
      let finalResult: ChatResponse;
      while (true) {
        const { done, value } = await generator.next();
        if (done) {
          finalResult = value as ChatResponse;
          break;
        }
        yield value as string;
      }
      
      if (finalResult) {
        await this.trackUsage(userId, finalResult);
      }
    } catch (error) {
      this.logger.warn(`Primary model ${targetModel} failed during stream init: ${error.message}. Attempting fallback.`);
      
      // Fallback Logic
      if (targetModel !== this.defaultFallbackModel) {
        try {
          const fallbackGenerator = this.primaryProvider.stream(messages, this.defaultFallbackModel);
          let fallbackResult: ChatResponse;
          while (true) {
            const { done, value } = await fallbackGenerator.next();
            if (done) {
              fallbackResult = value as ChatResponse;
              break;
            }
            yield value as string;
          }
          if (fallbackResult) {
            await this.trackUsage(userId, fallbackResult);
          }
          return;
        } catch (fallbackError) {
          // If we fail here, we can't yield an HTTP exception directly in SSE easily if headers are sent,
          // but if it fails on init, throwing will be caught by the controller.
          throw new HttpException(`AI Service unavailable after fallback: ${fallbackError.message}`, HttpStatus.SERVICE_UNAVAILABLE);
        }
      }
      
      throw error;
    }
  }
}
