const sharp = require('sharp');
const path = require('path');

async function test() {
  const logoPath = 'f:\\Arrena_Photo\\apps\\backend-api\\assets\\logo.png';

  const bgBuffer = await sharp({
    create: { width: 800, height: 800, channels: 3, background: { r: 255, g: 0, b: 0 } }
  }).jpeg().toBuffer();

  const logoWidth = Math.floor(800 * 0.45); // 45%

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

  const resultBuffer = await sharp(bgBuffer)
    .composite([{ input: logoBuffer, gravity: 'center' }])
    .jpeg({ quality: 90 })
    .toFile('C:\\Users\\hakob\\.gemini\\antigravity-ide\\brain\\ca80cc29-221e-47c1-9cd3-87eca21c8834\\scratch\\test-opacity-out.jpg');
    
  console.log("Done");
}

test().catch(console.error);
