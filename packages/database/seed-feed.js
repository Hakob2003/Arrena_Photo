const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const user = await prisma.user.findFirst();
  if (!user) return console.log("No users found");

  const model = await prisma.aIModel.findFirst();
  if (!model) return console.log("No AI models found");

  const storage = await prisma.storageProvider.findFirst();
  if (!storage) return console.log("No storage provider found");

  const gen1 = await prisma.generation.create({
    data: {
      userId: user.id,
      aiModelId: model.id,
      status: 'DONE',
      prompt: 'A cyberpunk city with neon lights and flying cars, high detail, 8k',
      isPublic: true,
      result: {
        create: {
          imageUrl: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=800&q=80',
          durationMs: 5000,
          storageProviderId: storage.id,
        }
      }
    }
  });

  const gen2 = await prisma.generation.create({
    data: {
      userId: user.id,
      aiModelId: model.id,
      status: 'DONE',
      prompt: 'A beautiful magical forest with glowing mushrooms, fantasy art style, trending on artstation',
      isPublic: true,
      result: {
        create: {
          imageUrl: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=800&q=80',
          durationMs: 4000,
          storageProviderId: storage.id,
        }
      }
    }
  });

  const gen3 = await prisma.generation.create({
    data: {
      userId: user.id,
      aiModelId: model.id,
      status: 'DONE',
      prompt: 'Portrait of a steampunk mechanic girl, intricate details, brass goggles',
      isPublic: true,
      result: {
        create: {
          imageUrl: 'https://images.unsplash.com/photo-1620589125156-fdf9d5f75eab?w=800&q=80',
          durationMs: 6000,
          storageProviderId: storage.id,
        }
      }
    }
  });

  console.log("Seeded generations");
}

seed().catch(console.error).finally(() => prisma.$disconnect());
