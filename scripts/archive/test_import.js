const Papa = require('papaparse');
const fs = require('fs');

const rawData = `Name,Category,Preview URL (Cover Image),Price (Credits),Description,Prompt,Negative Prompt
Cyberpunk City,Fantasy & Sci-Fi,https://images.unsplash.com/photo-1540959733332-eab4deabeeaf,15,Transform photo into a futuristic cyberpunk metropolis with neon lights and holograms.,"Ultra detailed cyberpunk city, neon lights, futuristic skyscrapers, cinematic lighting, rain reflections, high detail, 8k, masterpiece, vibrant colors","blurry, low quality, distorted face, extra limbs, watermark, text, jpeg artifacts"
Medieval Knight,Fantasy & Sci-Fi,https://images.unsplash.com/photo-1518562180175-34a163b1a9a6,15,Turn portrait into a heroic medieval knight.,"Medieval knight armor, epic fantasy castle, cinematic sunlight, realistic metal textures, ultra detailed, 8k, masterpiece","ugly, blurry, low resolution, cartoon, extra fingers, watermark"
Space Explorer,Fantasy & Sci-Fi,https://images.unsplash.com/photo-1446776811953-b23d57bd21aa,20,Create an astronaut portrait in deep space.,"Astronaut suit, distant galaxies, cinematic space scene, realistic lighting, ultra detailed, 8k, science fiction masterpiece","blurry, low quality, noise, watermark, cropped, deformed"
`;

const parseResult = Papa.parse(rawData, {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: true,
});

const headerMap = {
  'name': 'name',
  'category': 'categoryName',
  'categoryname': 'categoryName',
  'category name': 'categoryName',
  'preview url (cover image)': 'coverUrl',
  'coverurl': 'coverUrl',
  'preview url': 'coverUrl',
  'cover image': 'coverUrl',
  'price (credits)': 'price',
  'price': 'price',
  'description': 'description',
  'prompt': 'prompt',
  'negative prompt': 'negativePrompt',
  'negativeprompt': 'negativePrompt',
  'status': 'status',
  'recommended models': 'recommendedModels',
  'recommendedmodels': 'recommendedModels',
};

const parsedTemplates = parseResult.data.map((row) => {
  const obj = {};
  for (const [key, val] of Object.entries(row)) {
    const cleanKey = key.trim().toLowerCase();
    const mappedKey = headerMap[cleanKey] || key.trim();

    if (mappedKey === 'recommendedModels' && typeof val === 'string') {
      obj[mappedKey] = val.split(',').map(m => m.trim());
    } else if (typeof val === 'string') {
      obj[mappedKey] = val.trim();
    } else {
      obj[mappedKey] = val;
    }
  }
  return obj;
});

const validTemplates = parsedTemplates.filter(t => t.name && (t.categoryName || t.categoryId) && t.prompt);

console.log("Parsed:", validTemplates);

async function test() {
  try {
    const res = await fetch('http://127.0.0.1:10000/v1/templates/bulk-import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock'
      },
      body: JSON.stringify({ templates: validTemplates })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.log("Error:", e);
  }
}
test();
