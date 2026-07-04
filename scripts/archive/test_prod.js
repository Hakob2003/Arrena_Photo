const rawData = `Name,Category,Preview URL (Cover Image),Price (Credits),Description,Prompt,Negative Prompt
Cyberpunk City,Fantasy & Sci-Fi,https://images.unsplash.com/photo-1540959733332-eab4deabeeaf,15,Transform photo into a futuristic cyberpunk metropolis with neon lights and holograms.,"Ultra detailed cyberpunk city, neon lights, futuristic skyscrapers, cinematic lighting, rain reflections, high detail, 8k, masterpiece, vibrant colors","blurry, low quality, distorted face, extra limbs, watermark, text, jpeg artifacts"`;
const Papa = require('papaparse');
const parseResult = Papa.parse(rawData, { header: true, dynamicTyping: true });
const headerMap = { 'name': 'name', 'category': 'categoryName', 'categoryname': 'categoryName', 'preview url (cover image)': 'coverUrl', 'price (credits)': 'price', 'description': 'description', 'prompt': 'prompt', 'negative prompt': 'negativePrompt' };
const parsedTemplates = parseResult.data.map(row => {
  const obj = {};
  for (const [key, val] of Object.entries(row)) {
    const cleanKey = key.trim().toLowerCase();
    const mappedKey = headerMap[cleanKey] || key.trim();
    obj[mappedKey] = typeof val === 'string' ? val.trim() : val;
  }
  return obj;
});
const validTemplates = parsedTemplates.filter(t => t.name && t.categoryName && t.prompt);
console.log('Valid:', validTemplates);
fetch('https://arrena-photo-backend.onrender.com/v1/templates/bulk-import', { 
  method: 'POST', 
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock' }, 
  body: JSON.stringify({ templates: validTemplates }) 
})
.then(res => res.text().then(text => console.log(res.status, text)))
.catch(console.error);
