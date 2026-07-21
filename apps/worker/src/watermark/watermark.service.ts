import { Injectable, Logger } from "@nestjs/common";
import * as path from "path";
import sharp from "sharp";

@Injectable()
export class WatermarkService {
  private readonly logger = new Logger(WatermarkService.name);

  /**
   * Applies the UI skin logo to the center of the given image buffer, 45% size and semi-transparent.
   */
  async applyWatermark(
    imageBuffer: Buffer,
    skin: string = "NEON",
    accentColor?: string,
  ): Promise<Buffer> {
    try {
      // Get image metadata to determine size
      const metadata = await sharp(imageBuffer).metadata();
      const width = metadata.width || 1024;

      // Select the correct logo based on skin
      const logoFilename = skin === "LUXURY" ? "logoG.png" : "logo.png";
      const logoPath = path.join(process.cwd(), "assets", logoFilename);

      // Determine size for the logo (45% of the image width)
      const logoWidth = Math.floor(width * 0.45);

      let opacity = 128; // 50% opacity by default

      // Load and resize the logo mask
      const sharpLogoBuffer = await sharp(logoPath)
        .resize({ width: logoWidth })
        .toBuffer();
      const logoMeta = await sharp(sharpLogoBuffer).metadata();

      let coloredLogoBuffer;

      if (skin === "NEON") {
        opacity = Math.floor(255 * 0.7); // 70% opacity for better visibility

        let r1 = 79,
          g1 = 70,
          b1 = 229; // 600
        let r2 = 129,
          g2 = 140,
          b2 = 248; // 400

        switch (accentColor) {
          case "ROSE":
            r1 = 225;
            g1 = 29;
            b1 = 72;
            r2 = 251;
            g2 = 113;
            b2 = 133;
            break;
          case "EMERALD":
            r1 = 5;
            g1 = 150;
            b1 = 105;
            r2 = 52;
            g2 = 211;
            b2 = 153;
            break;
          case "AMBER":
            r1 = 217;
            g1 = 119;
            b1 = 6;
            r2 = 251;
            g2 = 191;
            b2 = 36;
            break;
          case "BLUE":
            r1 = 37;
            g1 = 99;
            b1 = 235;
            r2 = 96;
            g2 = 165;
            b2 = 250;
            break;
          case "SUNSET":
            r1 = 244;
            g1 = 63;
            b1 = 94; // rose-500
            r2 = 251;
            g2 = 146;
            b2 = 60; // orange-400
            break;
          case "OCEAN":
            r1 = 59;
            g1 = 130;
            b1 = 246; // blue-500
            r2 = 34;
            g2 = 211;
            b2 = 238; // cyan-400
            break;
          case "AMETHYST":
            r1 = 147;
            g1 = 51;
            b1 = 234; // purple-600
            r2 = 217;
            g2 = 70;
            b2 = 239; // fuchsia-500
            break;
          case "FLAME":
            r1 = 220;
            g1 = 38;
            b1 = 38; // red-600
            r2 = 250;
            g2 = 204;
            b2 = 21; // yellow-400
            break;
          case "GALAXY":
            r1 = 107;
            g1 = 33;
            b1 = 168; // purple-800
            r2 = 79;
            g2 = 70;
            b2 = 229; // indigo-600
            break;
          case "PEACH":
            r1 = 253;
            g1 = 186;
            b1 = 116; // orange-300
            r2 = 253;
            g2 = 164;
            b2 = 175; // rose-300
            break;
          case "CANDY":
            r1 = 167;
            g1 = 139;
            b1 = 250; // violet-400
            r2 = 244;
            g2 = 114;
            b2 = 182; // pink-400
            break;
          case "MINT":
            r1 = 34;
            g1 = 211;
            b1 = 238; // cyan-400
            r2 = 110;
            g2 = 231;
            b2 = 183; // emerald-300
            break;
          case "FOREST":
            r1 = 4;
            g1 = 120;
            b1 = 87; // emerald-700
            r2 = 34;
            g2 = 197;
            b2 = 94; // green-500
            break;
          case "BERRY":
            r1 = 126;
            g1 = 34;
            b1 = 206; // purple-700
            r2 = 244;
            g2 = 63;
            b2 = 94; // rose-500
            break;
          case "DAWN":
            r1 = 249;
            g1 = 168;
            b1 = 212; // pink-300
            r2 = 253;
            g2 = 224;
            b2 = 71; // yellow-300
            break;
          case "LAGOON":
            r1 = 29;
            g1 = 78;
            b1 = 216; // blue-700
            r2 = 6;
            g2 = 182;
            b2 = 212; // cyan-500
            break;
          case "MANGO":
            r1 = 249;
            g1 = 115;
            b1 = 22; // orange-500
            r2 = 250;
            g2 = 204;
            b2 = 21; // yellow-400
            break;
          case "GRAPE":
            r1 = 79;
            g1 = 70;
            b1 = 229; // indigo-600
            r2 = 192;
            g2 = 132;
            b2 = 252; // purple-400
            break;
          case "ROSEGOLD":
            r1 = 253;
            g1 = 230;
            b1 = 138; // amber-200
            r2 = 253;
            g2 = 164;
            b2 = 175; // rose-300
            break;
          case "INDIGO":
          default:
            r1 = 79;
            g1 = 70;
            b1 = 229;
            r2 = 129;
            g2 = 140;
            b2 = 248;
            break;
        }

        const svgGradient = `
          <svg width="${logoMeta.width}" height="${logoMeta.height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:rgb(${r1},${g1},${b1});stop-opacity:1" />
                <stop offset="50%" style="stop-color:rgb(${r2},${g2},${b2});stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgb(${r1},${g1},${b1});stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad1)" />
          </svg>
        `;

        coloredLogoBuffer = await sharp(sharpLogoBuffer)
          .composite([{ input: Buffer.from(svgGradient), blend: "in" }])
          .png()
          .toBuffer();
      } else if (skin === "LUXURY") {
        opacity = Math.floor(255 * 0.8); // 80% opacity

        // Luxury gold gradient: #D4AF37 to #F0D8A8
        const svgGradient = `
          <svg width="${logoMeta.width}" height="${logoMeta.height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:rgb(240,216,168);stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgb(212,175,55);stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad1)" />
          </svg>
        `;

        coloredLogoBuffer = await sharp(sharpLogoBuffer)
          .composite([{ input: Buffer.from(svgGradient), blend: "in" }])
          .png()
          .toBuffer();
      } else {
        coloredLogoBuffer = sharpLogoBuffer;
      }

      const finalLogoBuffer = await sharp(coloredLogoBuffer)
        .composite([
          {
            input: Buffer.from([255, 255, 255, opacity]),
            raw: { width: 1, height: 1, channels: 4 },
            tile: true,
            blend: "dest-in",
          },
        ])
        .png()
        .toBuffer();

      // Composite the logo over the original image (centered)
      const resultBuffer = await sharp(imageBuffer)
        .composite([{ input: finalLogoBuffer, gravity: "center" }])
        .jpeg({ quality: 90 }) // force jpeg output for consistency
        .toBuffer();

      return resultBuffer;
    } catch (e: any) {
      this.logger.error("Failed to apply watermark", e.stack);
      // Fallback to returning original image if processing fails
      return imageBuffer;
    }
  }
}
