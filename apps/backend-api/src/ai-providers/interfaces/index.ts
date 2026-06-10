// F:\Arrena_Photo\apps\backend-api\src\ai-providers\interfaces\generation-params.dto.ts
export interface GenerationParamsDto {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  modelId: string;
  seed?: number;
  [key: string]: any; // Для специфичных параметров провайдера
}

// F:\Arrena_Photo\apps\backend-api\src\ai-providers\interfaces\generation-result.dto.ts
export interface GenerationResultDto {
  imageUrl?: string;
  imageBuffer?: Buffer;
  durationMs: number;
  meta?: any;
}

// F:\Arrena_Photo\apps\backend-api\src\ai-providers\interfaces\provider-strategy.interface.ts
import { GenerationParamsDto, GenerationResultDto } from './index';

export interface AiProviderStrategy {
  get id(): string;
  checkAvailability(apiKey: string): Promise<boolean>;
  getModels(apiKey: string): Promise<string[]>;
  generateImage(apiKey: string, params: GenerationParamsDto): Promise<GenerationResultDto>;
}
