const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePrompts() {
  const templates = await prisma.template.findMany({
    include: { versions: true }
  });

  const professionalPrompts = {
    'Cinematic Cyberpunk Portrait': 'A masterpiece cyberpunk portrait, towering neon-lit skyscrapers reflecting in puddles, cinematic moody lighting, hyper-realistic, intricate details, 8k resolution, octane render, trending on ArtStation',
    'Magical Forest Landscape': 'Breathtaking magical forest, glowing bioluminescent mushrooms, ethereal mist, ancient towering trees, fantasy concept art, highly detailed, vivid colors, volumetric lighting, epic scale, 8k',
    'Steampunk Mechanic': 'Portrait of a steampunk mechanic, brass goggles, intricate clockwork details, Victorian industrial background, dramatic shadows, photorealistic, sharp focus, masterpiece, highly detailed',
    'Anime Style Character': 'High quality anime style character, Studio Ghibli style, vibrant colors, soft lighting, detailed background, dynamic pose, 4k, masterpiece, highly detailed anime illustration'
  };

  for (const template of templates) {
    const newPrompt = professionalPrompts[template.name];
    if (newPrompt) {
      // update template versions
      for (const version of template.versions) {
        await prisma.templateVersion.update({
          where: { id: version.id },
          data: { prompt: newPrompt }
        });
      }
      console.log(`Updated template: ${template.name}`);
    }
  }

  // Update generations that were seeded
  await prisma.generation.updateMany({
    where: { prompt: { contains: 'cyberpunk city' } },
    data: { prompt: professionalPrompts['Cinematic Cyberpunk Portrait'] }
  });
  await prisma.generation.updateMany({
    where: { prompt: { contains: 'magical forest' } },
    data: { prompt: professionalPrompts['Magical Forest Landscape'] }
  });
  await prisma.generation.updateMany({
    where: { prompt: { contains: 'steampunk mechanic' } },
    data: { prompt: professionalPrompts['Steampunk Mechanic'] }
  });

  console.log("Prompts updated successfully.");
}

updatePrompts().catch(console.error).finally(() => prisma.$disconnect());
