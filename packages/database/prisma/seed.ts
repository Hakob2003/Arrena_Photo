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

  const createdProviders = {};
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
