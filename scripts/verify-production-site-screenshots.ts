import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs/promises';

const PRODUCTION_URL = 'https://taxbridge.vercel.app';
const TIMESTAMP = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const SCREENSHOT_DIR = path.join(process.cwd(), 'docs', 'screenshots', TIMESTAMP);

interface PageTest {
  name: string;
  url: string;
  waitFor?: string;
}

const pages: PageTest[] = [
  { name: 'homepage', url: PRODUCTION_URL },
  { name: 'calculator', url: `${PRODUCTION_URL}/calculator` },
  { name: 'pricing', url: `${PRODUCTION_URL}/pricing` },
  { name: 'dashboard', url: `${PRODUCTION_URL}/dashboard` },
  { name: 'signup', url: `${PRODUCTION_URL}/sign-up` },
];

async function captureScreenshots() {
  console.log(`🔍 Starting production site verification...`);
  console.log(`📸 Screenshots will be saved to: ${SCREENSHOT_DIR}\n`);

  // Ensure screenshot directory exists
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });
  const page = await context.newPage();

  const results: any[] = [];

  for (const pageTest of pages) {
    console.log(`\n📄 Testing: ${pageTest.name}`);
    console.log(`   URL: ${pageTest.url}`);

    const startTime = Date.now();
    let status = 'unknown';
    let error: string | null = null;

    try {
      const response = await page.goto(pageTest.url, {
        waitUntil: 'networkidle',
        timeout: 15000,
      });

      status = response?.status()?.toString() || 'no-response';
      const loadTime = Date.now() - startTime;

      console.log(`   ✅ Status: ${status}`);
      console.log(`   ⏱️  Load time: ${loadTime}ms`);

      // Wait for page to settle
      await page.waitForTimeout(1000);

      // Take screenshot
      const screenshotPath = path.join(SCREENSHOT_DIR, `${pageTest.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      const stats = await fs.stat(screenshotPath);
      console.log(`   📸 Screenshot: ${screenshotPath} (${(stats.size / 1024).toFixed(1)} KB)`);

      // Get page title
      const title = await page.title();
      console.log(`   📝 Title: ${title}`);

      results.push({
        name: pageTest.name,
        url: pageTest.url,
        status,
        loadTime,
        title,
        screenshotPath,
        screenshotSize: stats.size,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      error = err.message;
      console.log(`   ❌ Error: ${error}`);

      results.push({
        name: pageTest.name,
        url: pageTest.url,
        status: 'error',
        error,
        timestamp: new Date().toISOString(),
      });
    }
  }

  await browser.close();

  // Save results as JSON
  const reportPath = path.join(SCREENSHOT_DIR, 'verification-results.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📊 Verification report: ${reportPath}`);

  // Print summary
  console.log(`\n\n═══════════════════════════════════════════════════════`);
  console.log(`PRODUCTION SITE VERIFICATION SUMMARY`);
  console.log(`═══════════════════════════════════════════════════════`);
  console.log(`Total pages tested: ${results.length}`);
  console.log(`Successful (2xx): ${results.filter(r => r.status >= 200 && r.status < 300).length}`);
  console.log(`Client errors (4xx): ${results.filter(r => r.status >= 400 && r.status < 500).length}`);
  console.log(`Server errors (5xx): ${results.filter(r => r.status >= 500).length}`);
  console.log(`Errors/Timeouts: ${results.filter(r => r.status === 'error').length}`);
  console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`);
  console.log(`═══════════════════════════════════════════════════════\n`);

  return results;
}

// Run if called directly
if (require.main === module) {
  captureScreenshots()
    .then(results => {
      const hasFailures = results.some(r => r.status === 'error' || r.status >= 400);
      process.exit(hasFailures ? 1 : 0);
    })
    .catch(err => {
      console.error('❌ Fatal error:', err);
      process.exit(1);
    });
}

export { captureScreenshots };
