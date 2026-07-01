import axios from 'axios';
import { IImageProvider, ImageGenerationOptions } from './image-provider.interface';

export class OpenAIImageProvider implements IImageProvider {
  private readonly baseUrl: string;

  constructor(private readonly apiKey: string, baseUrl?: string) {
    this.baseUrl = baseUrl || 'https://api.openai.com/v1';
  }

  async generateImage(prompt: string, modelSlug: string, options?: ImageGenerationOptions): Promise<string[]> {
    const isOpenRouter = this.baseUrl.includes('openrouter');
    const url = isOpenRouter ? `${this.baseUrl}/chat/completions` : `${this.baseUrl}/images/generations`;

    // Map common options to OpenAI options
    let size = '1024x1024';
    if (options?.width && options?.height) {
      const w = options.width;
      const h = options.height;
      if (w === 1024 && h === 1024) size = '1024x1024';
      else if (w > h) size = '1792x1024';
      else size = '1024x1792';
    }

    try {
      let requestBody: any = {
        model: modelSlug || 'dall-e-3',
        prompt,
        n: options?.numImages || 1,
        size,
      };

      if (isOpenRouter) {
        requestBody = {
          model: modelSlug,
          messages: [{ role: 'user', content: prompt }],
          modalities: ['image']
        };
      }

      const response = await axios.post(
        url,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            ...(isOpenRouter ? { 'HTTP-Referer': 'https://arrenaphoto.com', 'X-Title': 'ArrenaPhoto' } : {})
          },
        }
      );

      if (isOpenRouter) {
        if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
          const content = response.data.choices[0].message.content;
          // Extract URL or base64 if it's embedded in markdown, or just return the content if it's a raw URL/base64
          let imageUrl = content;
          // Some models return markdown like ![image](data:image/png;base64,...)
          const markdownMatch = content.match(/!\[.*?\]\((.*?)\)/);
          if (markdownMatch && markdownMatch[1]) {
            imageUrl = markdownMatch[1];
          }
          if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:') && (!imageUrl.startsWith('/') || imageUrl.length > 500)) {
            imageUrl = `data:image/png;base64,${imageUrl}`;
          }
          return [imageUrl];
        }
        throw new Error('No image returned from OpenRouter');
      }

      if (response.data && response.data.data) {
        return response.data.data.map((item: any) => {
          let imageUrl = item.url;
          if (!imageUrl && item.b64_json) {
            imageUrl = `data:image/png;base64,${item.b64_json}`;
          }
          if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:') && (!imageUrl.startsWith('/') || imageUrl.length > 500)) {
            imageUrl = `data:image/png;base64,${imageUrl}`;
          }
          return imageUrl;
        }).filter(Boolean);
      }

      throw new Error('No image returned from OpenAI');
    } catch (error: any) {
      if (error.response) {
        throw new Error(`${isOpenRouter ? 'OpenRouter' : 'OpenAI'} API error: ${error.response.data?.error?.message || error.response.statusText}`);
      }
      throw error;
    }
  }
}

