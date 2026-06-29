const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@arrena.com' } });
  if (!user) return;

  const card = await prisma.paymentMethod.findFirst({ where: { userId: user.id } });
  
  if (card) {
    await prisma.paymentMethod.update({
      where: { id: card.id },
      data: { balance: 25000, limit: 25000 }
    });
    console.log("Updated existing card to $25,000 balance and limit!");
  } else {
    await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        cardNumber: "4242 4242 4242 4242",
        expiry: "12/30",
        cvv: "123",
        last4: "4242",
        brand: "visa",
        cardholderName: "Admin User",
        limit: 25000,
        balance: 25000,
        isDefault: true
      }
    });
    console.log("Created a new card with $25,000 balance!");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
