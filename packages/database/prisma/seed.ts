import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Role
  const role = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      permissions: ['templates:read', 'generations:create'],
    },
  });

  // 2. Create Admin User
  // Password is 'admin123'
  const adminHash = '$2a$10$EAlG/EoWQ9dTZ8JiIaeAY.k5IDkxmz.HT0EKpq.y2ZI9.H1bkUV9S'; // pre-computed hash for admin123
  
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      permissions: ['admin:all', 'templates:read', 'generations:create'],
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@arrena.com' },
    update: {},
    create: {
      email: 'admin@arrena.com',
      passwordHash: adminHash,
      name: 'Admin',
      roleId: adminRole.id,
      emailVerified: new Date(),
    },
  });
  console.log('Admin User created:', adminUser.email);

  // 3. Create Storage Provider (needed for generations)
  const storage = await prisma.storageProvider.upsert({
    where: { name: 'Mock Storage' },
    update: {},
    create: {
      name: 'Mock Storage',
      baseUrl: 'https://mock.storage.com',
    },
  });

  // 4. Create AI Providers
  const providers = [
    { name: 'Stability AI', isGlobal: true },
    { name: 'OpenAI', isGlobal: true },
    { name: 'Google Gemini', isGlobal: true },
    { name: 'Leonardo AI', isGlobal: true },
    { name: 'Midjourney', isGlobal: true },
    { name: 'Replicate', isGlobal: true },
    { name: 'Fal.ai', isGlobal: true },
    { name: 'ComfyUI (Local/Remote)', isGlobal: true },
    { name: 'RunPod', isGlobal: true },
    { name: 'OpenRouter', isGlobal: true },
  ];

  const createdProviders: Record<string, any> = {};
  for (const p of providers) {
    createdProviders[p.name] = await prisma.aIProvider.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }
  const provider = createdProviders['Stability AI'];

  // 5. Create AI Model
  const openRouterProvider = createdProviders['OpenRouter'];
  const orModels = [
    { name: 'OpenRouter Free', slug: 'openrouter/free', providerId: openRouterProvider.id, isFree: true, isActive: true },
    { name: 'OpenRouter Auto', slug: 'openrouter/auto', providerId: openRouterProvider.id, isFree: false, isActive: true },
    { name: 'Qwen 3 Coder', slug: 'qwen/qwen3-coder:free', providerId: openRouterProvider.id, isFree: true, isActive: true },
    { name: 'DeepSeek R1', slug: 'deepseek/deepseek-r1:free', providerId: openRouterProvider.id, isFree: true, isActive: true },
  ];

  for (const model of orModels) {
    await prisma.aIModel.upsert({
      where: { slug: model.slug },
      update: {},
      create: model,
    });
  }

  const model1 = await prisma.aIModel.upsert({
    where: { slug: 'stability-ai/sdxl-1.0' },
    update: {},
    create: {
      name: 'sdxl-1.0',
      slug: 'stability-ai/sdxl-1.0',
      providerId: provider.id,
      isActive: true,
      isFree: false
    },
  });

  const model2 = await prisma.aIModel.upsert({
    where: { slug: 'openai/dall-e-3' },
    update: {},
    create: {
      name: 'dall-e-3',
      slug: 'openai/dall-e-3',
      providerId: createdProviders['OpenAI'].id,
      isActive: true,
      isFree: false
    },
  });

  console.log('AI Models seeded successfully');

  // 6. Create Template Categories and Templates
  const category = await prisma.templateCategory.upsert({
    where: { slug: 'portrait' },
    update: {},
    create: {
      name: 'Portraits',
      slug: 'portrait'
    }
  });

  await prisma.template.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Cinematic Cyberpunk Portrait',
      description: 'A neon-lit cyberpunk style portrait',
      coverUrl: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5',
      galleryUrls: [],
      recommendedModels: ['stability-ai/sdxl-1.0', 'openai/dall-e-3'],
      status: 'PUBLISHED',
      isPublic: true,
      isApproved: true,
      price: null,
      categoryId: category.id,
      creatorId: adminUser.id,
      versions: {
        create: {
          versionNumber: 1,
          prompt: 'A close up portrait of a cyberpunk character, neon lights, rainy street, cinematic lighting, 8k, photorealistic',
          settings: { steps: 30, guidance_scale: 7.5 }
        }
      }
    }
  });

  await prisma.template.upsert({
    where: { id: '00000000-0000-4000-8000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000002',
      name: 'Anime Style Avatar',
      description: 'Convert your photo into a beautiful anime character',
      coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477',
      galleryUrls: [],
      recommendedModels: ['stability-ai/sdxl-1.0'],
      status: 'PUBLISHED',
      isPublic: true,
      isApproved: true,
      price: 5.99,
      categoryId: category.id,
      creatorId: adminUser.id,
      versions: {
        create: {
          versionNumber: 1,
          prompt: 'Makoto Shinkai style anime portrait, detailed eyes, beautiful lighting, masterpiece',
          settings: { steps: 25, guidance_scale: 7.0 }
        }
      }
    }
  });

  console.log('Templates seeded successfully');
  console.log('--- SEED COMPLETE ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
