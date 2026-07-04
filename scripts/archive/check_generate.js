const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function capture() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Go to home to set localStorage
    await page.goto('http://localhost:3001/');
    await page.evaluate(() => {
        localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjExZTA1YS0wNjVhLTRiYTUtYmJkNy02MTQ0ZjY3MjY3MmMiLCJlbWFpbCI6ImFkbWluQGFycmVuYS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODIyODkzOTIsImV4cCI6MTc4Mjg5NDE5Mn0.HGe8ESgnM_8nUWCMq78xKjjWi5LS4qYWhvKwvaIflOQ');
        localStorage.setItem('auth-storage', JSON.stringify({state:{user:{id:'f211e05a-065a-4ba5-bbd7-6144f672672c',name:'Admin',email:'admin@arrena.com',role:'ADMIN'}},version:0}));
        // Set skin to neon to see the mask
        localStorage.setItem('ui-store', JSON.stringify({state:{theme:'dark',skin:'neon',isSidebarOpen:true,locale:'ru'},version:0}));
    });
    
    // Go to generate
    await page.goto('http://localhost:3001/generate', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const screenshotPath = path.join('C:\\Users\\hakob\\.gemini\\antigravity-ide\\brain\\ca80cc29-221e-47c1-9cd3-87eca21c8834', 'scratch', 'generate_screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot saved to: ' + screenshotPath);
  } catch (e) {
    console.error('Screenshot failed:', e);
  } finally {
    await browser.close();
  }
}

capture();
