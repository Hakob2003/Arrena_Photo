import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting password hash analysis...');
  
  const users = await prisma.user.findMany({
    where: {
      passwordHash: { not: null }
    },
    select: { id: true, email: true, passwordHash: true }
  });

  let weakCount = 0;
  let unknownCount = 0;
  let okCount = 0;

  for (const user of users) {
    const hash = user.passwordHash as string;
    
    // Check if it's a bcrypt hash
    if (!hash.startsWith('$2a$') && !hash.startsWith('$2b$')) {
      console.warn(`[WARNING] Unknown hash format for user ${user.email} (ID: ${user.id}). Requires password reset.`);
      unknownCount++;
      // Optional: Clear passwordHash to force reset, or add a 'forcePasswordReset' flag.
      // await prisma.user.update({ where: { id: user.id }, data: { passwordHash: null } });
      continue;
    }

    try {
      const rounds = bcrypt.getRounds(hash);
      if (rounds < 10) {
        console.warn(`[INFO] Weak bcrypt hash (rounds: ${rounds}) for user ${user.email} (ID: ${user.id}). Will be rehashed on next login.`);
        weakCount++;
      } else {
        okCount++;
      }
    } catch (e) {
      console.warn(`[ERROR] Invalid bcrypt hash for user ${user.email} (ID: ${user.id}). Requires password reset.`);
      unknownCount++;
    }
  }

  console.log('\n--- Analysis Complete ---');
  console.log(`Total users with password: ${users.length}`);
  console.log(`OK (bcrypt >= 10 rounds): ${okCount}`);
  console.log(`Weak (bcrypt < 10 rounds): ${weakCount}`);
  console.log(`Unknown/Invalid format: ${unknownCount}`);
  
  if (unknownCount > 0) {
    console.log('\nRecommendation: Users with unknown/invalid formats should be forced to reset their passwords via email.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
