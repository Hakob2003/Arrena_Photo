import { IImageProvider, ImageGenerationOptions } from './image-provider.interface';

export class MockImageProvider implements IImageProvider {
  constructor(private readonly apiKey: string) {}

  async generateImage(prompt: string, modelSlug: string, options?: ImageGenerationOptions): Promise<string[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const count = options?.numImages || 1;
    const images: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // Random picsum image
      const randomSeed = Math.floor(Math.random() * 100000);
      images.push(`https://picsum.photos/seed/${randomSeed}/1024/1024`);
    }

    return images;
  }
}
