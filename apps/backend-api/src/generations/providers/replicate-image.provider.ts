import axios from 'axios';
import { IImageProvider, ImageGenerationOptions } from './image-provider.interface';

export class ReplicateImageProvider implements IImageProvider {
  private readonly baseUrl = 'https://api.replicate.com/v1';

  constructor(private readonly apiKey: string) {}

  async generateImage(prompt: string, modelSlug: string, options?: ImageGenerationOptions): Promise<string[]> {
    // Model slug is typically "owner/model-name:version_hash" or just "owner/model"
    // E.g. "stability-ai/sdxl"
    const isVersion = modelSlug.includes(':');
    let url = `${this.baseUrl}/models/${modelSlug}/predictions`;
    let requestData: any = {};

    if (isVersion) {
      const versionHash = modelSlug.split(':')[1];
      url = `${this.baseUrl}/predictions`;
      requestData.version = versionHash;
    }

    // Default params suitable for flux / sdxl
    requestData.input = {
      prompt,
      negative_prompt: options?.negativePrompt || '',
      width: options?.width || 1024,
      height: options?.height || 1024,
      num_outputs: options?.numImages || 1,
      guidance_scale: options?.guidanceScale || 7.5,
      num_inference_steps: options?.steps || 30,
    };

    if (options?.initImage) {
      requestData.input.image = options.initImage; // Used for img2img / controlnet
      requestData.input.prompt_strength = 0.8; 
    }

    try {
      const response = await axios.post(
        url,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'Prefer': 'wait=60' // Wait up to 60 seconds for the result
          },
        }
      );

      let prediction = response.data;
      
      // If it returns immediately but is 'starting' or 'processing', we poll
      let attempts = 0;
      while ((prediction.status === 'starting' || prediction.status === 'processing') && attempts < 30) {
        await new Promise(r => setTimeout(r, 2000));
        const pollResponse = await axios.get(prediction.urls.get, {
          headers: { 'Authorization': `Bearer ${this.apiKey}` }
        });
        prediction = pollResponse.data;
        attempts++;
      }

      if (prediction.status === 'succeeded' && prediction.output) {
        // Replicate typically returns an array of output URLs
        return Array.isArray(prediction.output) ? prediction.output : [prediction.output];
      }

      throw new Error(`Replicate failed with status: ${prediction.status}. Error: ${prediction.error}`);
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Replicate API error: ${error.response.data?.detail || error.response.statusText}`);
      }
      throw error;
    }
  }
}
