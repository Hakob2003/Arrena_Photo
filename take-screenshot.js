const { chromium } = require('playwright');

async function capture() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/');
    await page.evaluate(() => {
        localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjExZTA1YS0wNjVhLTRiYTUtYmJkNy02MTQ0ZjY3MjY3MmMiLCJlbWFpbCI6ImFkbWluQGFycmVuYS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODIyODkzOTIsImV4cCI6MTc4Mjg5NDE5Mn0.HGe8ESgnM_8nUWCMq78xKjjWi5LS4qYWhvKwvaIflOQ');
        localStorage.setItem('auth-storage', JSON.stringify({state:{user:{id:'f211e05a-065a-4ba5-bbd7-6144f672672c',name:'Admin',email:'admin@arrena.com',role:'ADMIN'}},version:0}));
    });
    await page.goto('http://localhost:3000/profile/billing', { waitUntil: 'networkidle' });
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
