const { PrismaClient } = require('F:/Arrena_Photo/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.planConfig.findMany({
    select: { plan: true, stripePriceId: true, isActive: true, name: true }
  });
  console.log('PlanConfig records:');
  console.log(JSON.stringify(plans, null, 2));

  const users = await prisma.user.findMany({
    take: 3,
    select: { id: true, email: true, stripeCustomerId: true }
  });
  console.log('\nFirst 3 users:');
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
