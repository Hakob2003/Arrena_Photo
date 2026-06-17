import axios from 'axios';
import { IImageProvider, ImageGenerationOptions } from './image-provider.interface';

export class OpenAIImageProvider implements IImageProvider {
  private readonly baseUrl = 'https://api.openai.com/v1';

  constructor(private readonly apiKey: string) {}

  async generateImage(prompt: string, modelSlug: string, options?: ImageGenerationOptions): Promise<string[]> {
    const url = `${this.baseUrl}/images/generations`;

    // Map common options to OpenAI options
    // DALL-E 3 default sizes: 1024x1024
    let size = '1024x1024';
    if (options?.width && options?.height) {
      const w = options.width;
      const h = options.height;
      if (w === 1024 && h === 1024) size = '1024x1024';
      else if (w > h) size = '1792x1024'; // landscape for dall-e 3
      else size = '1024x1792'; // portrait
    }

    try {
      const response = await axios.post(
        url,
        {
          model: modelSlug || 'dall-e-3',
          prompt,
          n: options?.numImages || 1,
          size,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      if (response.data && response.data.data) {
        return response.data.data.map((item: any) => item.url);
      }

      throw new Error('No image returned from OpenAI');
    } catch (error: any) {
      if (error.response) {
        throw new Error(`OpenAI API error: ${error.response.data?.error?.message || error.response.statusText}`);
      }
      throw error;
    }
  }
}
