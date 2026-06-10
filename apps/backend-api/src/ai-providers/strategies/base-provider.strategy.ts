import { Logger, InternalServerErrorException } from '@nestjs/common';
import { AiProviderStrategy, GenerationParamsDto, GenerationResultDto } from '../interfaces';

export abstract class BaseProviderStrategy implements AiProviderStrategy {
  protected readonly logger = new Logger(this.constructor.name);

  abstract get id(): string;

  async checkAvailability(apiKey: string): Promise<boolean> {
    try {
      return await this.doCheckAvailability(apiKey);
    } catch (error) {
      this.logger.error(`Availability check failed: ${error.message}`);
      return false;
    }
  }

  async getModels(apiKey: string): Promise<string[]> {
    try {
      return await this.doGetModels(apiKey);
    } catch (error) {
      this.logger.error(`Failed to fetch models: ${error.message}`);
      return [];
    }
  }

  async generateImage(apiKey: string, params: GenerationParamsDto): Promise<GenerationResultDto> {
    const startTime = Date.now();
    try {
      this.logger.log(`Starting generation with model ${params.modelId}`);
      // Здесь можно добавить проверку RateLimiterService
      
      const result = await this.doGenerateImage(apiKey, params);
      
      const durationMs = Date.now() - startTime;
      return {
        ...result,
        durationMs,
      };
    } catch (error) {
      this.logger.error(`Generation failed: ${error.message}`);
      throw new InternalServerErrorException(`Generation failed on provider ${this.id}`);
    }
  }

  // Абстрактные методы, которые обязаны реализовать наследники
  protected abstract doCheckAvailability(apiKey: string): Promise<boolean>;
  protected abstract doGetModels(apiKey: string): Promise<string[]>;
  protected abstract doGenerateImage(apiKey: string, params: GenerationParamsDto): Promise<Omit<GenerationResultDto, 'durationMs'>>;
}
