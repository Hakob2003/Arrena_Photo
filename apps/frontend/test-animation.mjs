import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 400, height: 800 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000');
  
  // Wait for the app to load
  await page.waitForSelector('header');
  
  // Find the hamburger menu
  const menuButton = await page.locator('header button').first();
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('LOGO ANIMATION TICK') || text.includes('Calculated targetX')) {
      console.log('BROWSER_LOG:', text);
    }
  });

  console.log('Opening sidebar...');
  await menuButton.click({ force: true });
  
  // Track positions for 1 second
  const start = Date.now();
  console.log('Tracking animation for 1.5s...');
  
  const history = [];
  
  while (Date.now() - start < 1500) {
    const data = await page.evaluate(() => {
      const topbarEl = document.querySelector('header .absolute.left-1\\/2 > div');
      const sidebarEl = document.getElementById('sidebar-logo-ref');
      
      let topbarRect = null;
      if (topbarEl) {
        const rect = topbarEl.getBoundingClientRect();
        topbarRect = { left: rect.left, right: rect.right, width: rect.width, center: rect.left + rect.width / 2 };
      }
      
      let sidebarRect = null;
      if (sidebarEl) {
        const rect = sidebarEl.getBoundingClientRect();
        sidebarRect = { left: rect.left, right: rect.right, width: rect.width, center: rect.left + rect.width / 2 };
      }
      
      return { time: Date.now(), topbarRect, sidebarRect };
    });
    
    data.relativeTime = data.time - start;
    history.push(data);
    await new Promise(r => setTimeout(r, 20)); // poll every 20ms
  }
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'test-screenshot.png' });
  
  await browser.close();
  
  // Print summary
  console.log('--- Animation Tracking Data ---');
  for (const row of history) {
    const t = String(row.relativeTime).padStart(4, ' ');
    const tbCenter = row.topbarRect ? row.topbarRect.center.toFixed(1) : 'null';
    const sbCenter = row.sidebarRect ? row.sidebarRect.center.toFixed(1) : 'null';
    
    // Also track left edge
    const tbLeft = row.topbarRect ? row.topbarRect.left.toFixed(1) : 'null';
    const sbLeft = row.sidebarRect ? row.sidebarRect.left.toFixed(1) : 'null';
    
    console.log(`[${t}ms] Topbar(Center: ${tbCenter}, Left: ${tbLeft}) | Sidebar(Center: ${sbCenter}, Left: ${sbLeft})`);
  }
})();
