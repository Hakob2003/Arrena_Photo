export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  steps?: number;
  guidanceScale?: number;
  negativePrompt?: string;
  initImage?: string;
  numImages?: number;
}

export interface IImageProvider {
  /**
   * Generates images based on the provided prompt and model.
   * @param prompt The prompt to generate the image
   * @param modelSlug The model slug (e.g. 'dall-e-3' or 'black-forest-labs/flux-1.1-pro')
   * @param options Additional generation options
   * @returns Array of generated image URLs or base64 strings
   */
  generateImage(prompt: string, modelSlug: string, options?: ImageGenerationOptions): Promise<string[]>;
}
