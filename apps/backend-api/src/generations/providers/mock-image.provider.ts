import { IImageProvider, ImageGenerationOptions } from './image-provider.interface';

export class MockImageProvider implements IImageProvider {
  constructor(private readonly apiKey: string, private readonly usePicsumMock: boolean = false) {}

  async generateImage(prompt: string, modelSlug: string, options?: ImageGenerationOptions): Promise<string[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const count = options?.numImages || 1;
    const images: string[] = [];
    
    // Default to 1:1 if not provided or parsing fails
    let width = 1024;
    let height = 1024;
    if (options?.aspectRatio) {
      const [w, h] = options.aspectRatio.split(':').map(Number);
      if (w && h) {
        if (w > h) {
          width = 1024;
          height = Math.round(1024 * (h / w));
        } else {
          height = 1024;
          width = Math.round(1024 * (w / h));
        }
      }
    }
    
    for (let i = 0; i < count; i++) {
      if (this.usePicsumMock) {
        const randomSeed = Math.floor(Math.random() * 100000);
        images.push(`https://picsum.photos/seed/${randomSeed}/${width}/${height}`);
      } else {
        const color = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      // Create a simple SVG as a placeholder
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <rect width="100%" height="100%" fill="#${color}" />
        <text x="50%" y="40%" font-family="sans-serif" font-size="${Math.min(width, height) / 16}" fill="white" text-anchor="middle">MOCK GENERATION</text>
        <text x="50%" y="55%" font-family="sans-serif" font-size="${Math.min(width, height) / 32}" fill="white" text-anchor="middle">${prompt.substring(0, 50) || 'No prompt'}</text>
      </svg>`;
      
      const base64 = Buffer.from(svg).toString('base64');
      images.push(`data:image/svg+xml;base64,${base64}`);
      }
    }

    return images;
  }
}
