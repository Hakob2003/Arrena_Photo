const { chromium } = require('playwright');
const fs = require('fs');

async function capture() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/templates', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshot.png', fullPage: true });
    console.log('Screenshot saved to screenshot.png');
  } catch (e) {
    console.error('Screenshot failed:', e);
  } finally {
    await browser.close();
  }
}

capture();
