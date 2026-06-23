import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.template.deleteMany({
    where: {
      id: {
        in: ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002']
      }
    }
  });
  console.log('Deleted old templates');
}

main().finally(() => prisma.$disconnect());
