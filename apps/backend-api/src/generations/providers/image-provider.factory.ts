import { IImageProvider } from './image-provider.interface';
import { OpenAIImageProvider } from './openai-image.provider';
import { ReplicateImageProvider } from './replicate-image.provider';

export class ImageProviderFactory {
  /**
   * Returns the appropriate IImageProvider based on provider name.
   */
  static create(providerName: string, apiKey: string): IImageProvider {
    const normalizedName = providerName.toLowerCase().trim();

    if (normalizedName.includes('openai')) {
      return new OpenAIImageProvider(apiKey);
    }
    
    if (normalizedName.includes('replicate')) {
      return new ReplicateImageProvider(apiKey);
    }

    // Default to mock or throw error if not supported yet
    throw new Error(`Provider ${providerName} is not fully integrated yet for image generation.`);
  }
}
