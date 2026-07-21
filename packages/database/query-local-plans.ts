import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.planConfig.findMany();
  console.log(JSON.stringify(plans, null, 2));
}

main().finally(() => prisma.$disconnect());
