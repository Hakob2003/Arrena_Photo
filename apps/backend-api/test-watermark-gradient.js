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
  
  const resizedLogo = await sharp(logoPath).resize({ width: logoWidth }).toBuffer();
  const metadata = await sharp(resizedLogo).metadata();
  
  let r1 = 99, g1 = 102, b1 = 241; // INDIGO-500
  let r2 = 129, g2 = 140, b2 = 248; // INDIGO-400
  
  // SVG gradient matching exactly the resized logo metadata
  const svgGradient = `
    <svg width="${metadata.width}" height="${metadata.height}" xmlns="http://www.w3.org/2000/svg">
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

  // Base is the resized logo, composite the SVG gradient over it with 'in' blend mode
  const coloredLogoBuffer = await sharp(resizedLogo)
    .composite([
      {
        input: Buffer.from(svgGradient),
        blend: 'in'
      }
    ])
    .png()
    .toBuffer();

  // Make it semi-transparent
  const finalLogoBuffer = await sharp(coloredLogoBuffer)
    .composite([
      {
         input: Buffer.from([255, 255, 255, Math.floor(255 * 0.7)]),
         raw: { width: 1, height: 1, channels: 4 },
         tile: true,
         blend: 'dest-in'
      }
    ])
    .png()
    .toBuffer();

  const resultBuffer = await sharp(dummyBuffer)
    .composite([{ input: finalLogoBuffer, gravity: 'center' }])
    .jpeg({ quality: 90 })
    .toBuffer();

  fs.writeFileSync('watermark_test_gradient.jpg', resultBuffer);
  console.log("Saved watermark_test_gradient.jpg");
}

test().catch(console.error);
