import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.subscription.updateMany({ data: { plan: 'FREE' } });
  console.log('All users set to FREE');
}
main().catch(console.error).finally(() => prisma.$disconnect());
