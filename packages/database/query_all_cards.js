const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Query all cards for all users just in case it's on another account
  const allCards = await prisma.paymentMethod.findMany({
    include: { user: { select: { email: true } } }
  });
  console.log("ALL CURRENT CARDS:", JSON.stringify(allCards, null, 2));

  // Query audit logs to see if a card was deleted recently
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  console.log("RECENT AUDIT LOGS:", JSON.stringify(logs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
