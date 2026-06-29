const { PrismaClient } = require('@prisma/client');
const { chromium } = require('playwright');
const path = require('path');

const prisma = new PrismaClient();

async function run() {
  // Get admin user
  const admin = await prisma.user.findUnique({ where: { email: 'admin@arrena.com' } });
  
  // Set to FREE
  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: { plan: 'FREE' },
    create: { userId: admin.id, plan: 'FREE' }
  });
  console.log("Set plan to FREE");

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  
  // Login
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'admin@arrena.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000); // wait for redirect to finish
  console.log("Logged in");
  
  // Go to generator
  await page.goto('http://localhost:3000/generate?templateId=00000000-0000-4000-8000-000000000001');
  await page.waitForTimeout(3000);
  const artifactsDir = path.resolve(__dirname, '..');
  const freePath = path.join(artifactsDir, 'screenshot_free.png');
  await page.screenshot({ path: freePath });
  console.log("Saved FREE screenshot to " + freePath);

  // Set to PRO
  await prisma.subscription.update({
    where: { userId: admin.id },
    data: { plan: 'PRO' }
  });
  console.log("Set plan to PRO");
  
  // Refresh to get new plan
  await page.reload();
  await page.waitForTimeout(3000);
  const proPath = path.join(artifactsDir, 'screenshot_pro.png');
  await page.screenshot({ path: proPath });
  console.log("Saved PRO screenshot to " + proPath);

  await browser.close();
  await prisma.$disconnect();
}

run().catch(console.error);
