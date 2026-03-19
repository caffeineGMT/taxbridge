
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('https://taxbridge.vercel.app', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/Users/michaelguo/hivemind-projects/cross-border-tax/docs/evidence/health-baseline-2026-03-19/homepage-screenshot.png', fullPage: true });
  await browser.close();
})();
    