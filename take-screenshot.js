const { chromium } = require('playwright');

async function capture() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/feed', { waitUntil: 'networkidle' });
    // Wait for images to load
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshot.png', fullPage: true });
    console.log('Screenshot saved to screenshot.png');
  } catch (e) {
    console.error('Screenshot failed:', e);
  } finally {
    await browser.close();
  }
}

capture();
