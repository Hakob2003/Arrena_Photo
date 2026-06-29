const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function test() {
  const width = 800;
  const height = 600;
  
  // create dummy background image
  const dummyBuffer = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 50, g: 50, b: 50, alpha: 1 }
    }
  }).png().toBuffer();

  const logoFilename = 'logo.png';
  const logoPath = path.join(process.cwd(), 'assets', logoFilename);

  const logoWidth = Math.floor(width * 0.45);
  
  let r = 99, g = 102, b = 241; // NEON Indigo

  // Load and resize the logo, tint it, and reduce opacity
  const coloredLogoBuffer = await sharp(logoPath)
    .resize({ width: logoWidth })
    .tint({ r, g, b })
    .ensureAlpha()
    .composite([
      {
        input: Buffer.from([255, 255, 255, Math.floor(255 * 0.7)]), // 70% opacity
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'dest-in'
      }
    ])
    .png()
    .toBuffer();

  const resultBuffer = await sharp(dummyBuffer)
    .composite([{ input: coloredLogoBuffer, gravity: 'center' }])
    .jpeg({ quality: 90 })
    .toBuffer();

  fs.writeFileSync('watermark_test_logo.jpg', resultBuffer);
  console.log("Saved watermark_test_logo.jpg");
}

test().catch(console.error);
