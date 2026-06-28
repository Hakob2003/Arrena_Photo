import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
const sharp = require('sharp');

@Injectable()
export class WatermarkService {
  private readonly logger = new Logger(WatermarkService.name);

  /**
   * Applies the UI skin logo to the center of the given image buffer, 45% size and semi-transparent.
   */
  async applyWatermark(imageBuffer: Buffer, skin: string = 'NEON'): Promise<Buffer> {
    try {
      // Get image metadata to determine size
      const metadata = await sharp(imageBuffer).metadata();
      const width = metadata.width || 1024;

      // Select the correct logo based on skin
      const logoFilename = skin === 'LUXURY' ? 'logoG.png' : 'logo.png';
      const logoPath = path.join(process.cwd(), 'assets', logoFilename);

      // Determine size for the logo (45% of the image width)
      const logoWidth = Math.floor(width * 0.45);

      // Load and resize the logo, and make it semi-transparent
      const logoBuffer = await sharp(logoPath)
        .resize({ width: logoWidth })
        .ensureAlpha()
        .composite([
          {
            input: Buffer.from([255, 255, 255, 128]), // 50% opacity
            raw: { width: 1, height: 1, channels: 4 },
            tile: true,
            blend: 'dest-in'
          }
        ])
        .png()
        .toBuffer();

      // Composite the logo over the original image (centered)
      const resultBuffer = await sharp(imageBuffer)
        .composite([{ input: logoBuffer, gravity: 'center' }])
        .jpeg({ quality: 90 }) // force jpeg output for consistency
        .toBuffer();

      return resultBuffer;
    } catch (e: any) {
      this.logger.error('Failed to apply watermark', e.stack);
      // Fallback to returning original image if processing fails
      return imageBuffer;
    }
  }
}
