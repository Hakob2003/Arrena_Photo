import { IImageProvider, ImageGenerationOptions } from './image-provider.interface';

export class MockImageProvider implements IImageProvider {
  constructor(private readonly apiKey: string, private readonly usePicsumMock: boolean = false) {}

  async generateImage(prompt: string, modelSlug: string, options?: ImageGenerationOptions): Promise<string[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const count = options?.numImages || 1;
    const images: string[] = [];
    
    for (let i = 0; i < count; i++) {
      if (this.usePicsumMock) {
        const randomSeed = Math.floor(Math.random() * 100000);
        images.push(`https://fastly.picsum.photos/id/${randomSeed%1000}/1024/1024.jpg`);
      } else {
        const color = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      // Create a simple SVG as a placeholder
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
        <rect width="100%" height="100%" fill="#${color}" />
        <text x="50%" y="40%" font-family="sans-serif" font-size="64" fill="white" text-anchor="middle">MOCK GENERATION</text>
        <text x="50%" y="55%" font-family="sans-serif" font-size="32" fill="white" text-anchor="middle">${prompt.substring(0, 50) || 'No prompt'}</text>
      </svg>`;
      
      const base64 = Buffer.from(svg).toString('base64');
      images.push(`data:image/svg+xml;base64,${base64}`);
      }
    }

    return images;
  }
}
