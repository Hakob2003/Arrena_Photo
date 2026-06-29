const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@arrena.com' } });
  if (!user) return;
  const transactions = await prisma.creditTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(transactions, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
