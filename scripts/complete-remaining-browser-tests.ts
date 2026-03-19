import { chromium, firefox, devices } from 'playwright';
import path from 'path';

const PRODUCTION_URL = 'https://taxbridge.vercel.app';
const SCREENSHOT_DIR = 'docs/screenshots/cross-browser-testing';
const pages = [
  { path: '/', name: 'Homepage' },
  { path: '/us-canada-tax-calculator', name: 'Calculator' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/sign-up', name: 'Signup' },
  { path: '/blog', name: 'Blog-Index' },
];

async function testBrowser(browserType: 'firefox' | 'chromium', browserName: string, deviceName: string) {
  console.log(`\n=== Testing ${browserName} ===`);
  const browser = browserType === 'firefox' ? await firefox.launch() : await chromium.launch();
  const context = await browser.newContext({
    ...(devices[deviceName] || {}),
    locale: 'en-US',
  });
  const page = await context.newPage();

  for (const pageConfig of pages) {
    const url = `${PRODUCTION_URL}${pageConfig.path}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = `${browserName.replace(/\s+/g, '-')}_${deviceName.replace(/\s+/g, '-')}_${pageConfig.name}_${timestamp}.png`;
    const screenshotPath = path.join(SCREENSHOT_DIR, screenshotName);

    console.log(`  Testing ${pageConfig.name}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`    ✓ ${screenshotName}`);
    } catch (error) {
      console.error(`    ✗ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  await browser.close();
  console.log(`✓ Completed ${browserName}`);
}

async function main() {
  await testBrowser('firefox', 'Desktop-Firefox', 'Desktop Firefox');
  await testBrowser('chromium', 'Desktop-Edge', 'Desktop Edge');
  await testBrowser('chromium', 'Desktop-Chrome', 'Desktop Chrome');
  console.log('\n✅ All remaining tests complete!');
}

main().catch(console.error);
