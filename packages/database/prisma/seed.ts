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

  // 2. Create Test User
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: 'dummy_hash',
      name: 'Test User',
      roleId: role.id,
    },
  });
  console.log('Test User created:', testUser.id);

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
  const model1 = await prisma.aIModel.upsert({
    where: { providerId_name: { providerId: provider.id, name: 'sdxl-1.0' } },
    update: {},
    create: {
      name: 'sdxl-1.0',
      providerId: provider.id,
      isActive: true,
    },
  });

  const model2 = await prisma.aIModel.upsert({
    where: { providerId_name: { providerId: provider.id, name: 'dall-e-3' } },
    update: {},
    create: {
      name: 'dall-e-3',
      providerId: provider.id,
      isActive: true,
    },
  });

  console.log('AI Models created:', model1.name, model2.name);
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
