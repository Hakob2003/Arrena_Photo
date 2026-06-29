const sharp = require('sharp');
const fs = require('fs');

async function test() {
  const width = 800;
  const height = 600;
  
  // create dummy blue image
  const dummyBuffer = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 255, alpha: 1 }
    }
  }).png().toBuffer();

  const fontSize = Math.floor(Math.min(width, height) / 10);
  const svgImage = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .title { fill: rgba(255, 255, 255, 0.4); font-size: ${fontSize}px; font-weight: bold; font-family: sans-serif; }
        .shadow { fill: rgba(0, 0, 0, 0.5); font-size: ${fontSize}px; font-weight: bold; font-family: sans-serif; }
      </style>
      <g transform="translate(${width/2}, ${height/2}) rotate(-45) translate(-${width/2}, -${height/2})">
        <text x="50%" y="50%" text-anchor="middle" class="shadow" dx="4" dy="4">WATERMARK</text>
        <text x="50%" y="50%" text-anchor="middle" class="title">WATERMARK</text>
      </g>
    </svg>
  `;

  const svgBuffer = Buffer.from(svgImage);

  const resultBuffer = await sharp(dummyBuffer)
    .composite([{ input: svgBuffer, gravity: 'center' }])
    .jpeg({ quality: 90 })
    .toBuffer();

  fs.writeFileSync('watermark_test.jpg', resultBuffer);
  console.log("Saved watermark_test.jpg");
}

test().catch(console.error);
