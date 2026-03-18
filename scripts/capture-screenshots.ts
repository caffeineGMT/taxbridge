/**
 * Automated Screenshot Capture for Product Hunt Launch
 *
 * Captures high-quality screenshots of key TaxBridge pages
 * Output: /public/screenshots/product-hunt/
 */

import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const OUTPUT_DIR = join(process.cwd(), 'public', 'screenshots', 'product-hunt');

interface Screenshot {
  name: string;
  url: string;
  description: string;
  viewport?: { width: number; height: number };
  waitFor?: string;
  fullPage?: boolean;
}

const screenshots: Screenshot[] = [
  {
    name: '01-hero-landing-page',
    url: '/',
    description: 'Hero section with main value proposition',
    viewport: { width: 1920, height: 1080 },
    fullPage: false,
  },
  {
    name: '02-tax-calculator-entry',
    url: '/tax-calculator/h1b-worker-canada',
    description: 'Tax calculator with RSU entry form',
    viewport: { width: 1920, height: 1080 },
    waitFor: 'input[name="vestingDate"]',
    fullPage: true,
  },
  {
    name: '03-dashboard-overview',
    url: '/dashboard',
    description: 'Main dashboard with RSU portfolio',
    viewport: { width: 1920, height: 1080 },
    waitFor: '[data-testid="dashboard-stats"]',
    fullPage: true,
  },
  {
    name: '04-forms-checklist',
    url: '/forms-checklist',
    description: 'Required tax forms checklist',
    viewport: { width: 1920, height: 1080 },
    waitFor: 'h1',
    fullPage: true,
  },
  {
    name: '05-multi-year-dashboard',
    url: '/dashboard/multi-year',
    description: 'Multi-year tax trends and comparison',
    viewport: { width: 1920, height: 1080 },
    waitFor: '.recharts-wrapper',
    fullPage: true,
  },
  {
    name: '06-pricing-page',
    url: '/pricing',
    description: 'Pricing tiers with feature comparison',
    viewport: { width: 1920, height: 1080 },
    waitFor: 'h1',
    fullPage: true,
  },
  {
    name: '07-ftc-optimizer',
    url: '/dashboard',
    description: 'Foreign Tax Credit calculation detail',
    viewport: { width: 1920, height: 1080 },
    fullPage: false,
  },
  {
    name: '08-mobile-calculator',
    url: '/tax-calculator/h1b-worker-canada',
    description: 'Mobile-responsive calculator view',
    viewport: { width: 375, height: 812 },
    waitFor: 'input[name="vestingDate"]',
    fullPage: true,
  },
];

async function captureScreenshot(
  page: puppeteer.Page,
  screenshot: Screenshot,
  index: number
) {
  const { name, url, description, viewport, waitFor, fullPage } = screenshot;

  console.log(`\n[${index + 1}/${screenshots.length}] Capturing: ${description}`);
  console.log(`URL: ${BASE_URL}${url}`);

  // Set viewport
  if (viewport) {
    await page.setViewport(viewport);
  }

  // Navigate to page
  await page.goto(`${BASE_URL}${url}`, {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });

  // Wait for specific element if specified
  if (waitFor) {
    try {
      await page.waitForSelector(waitFor, { timeout: 5000 });
    } catch (error) {
      console.warn(`Warning: Could not find selector "${waitFor}", continuing...`);
    }
  }

  // Additional wait for animations/renders
  await page.waitForTimeout(1000);

  // Capture screenshot
  const outputPath = join(OUTPUT_DIR, `${name}.png`);
  await page.screenshot({
    path: outputPath,
    fullPage: fullPage !== false,
  });

  console.log(`✓ Saved: ${outputPath}`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('TaxBridge Product Hunt Screenshot Capture');
  console.log('='.repeat(60));
  console.log(`\nBase URL: ${BASE_URL}`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);
  console.log(`Screenshots to capture: ${screenshots.length}\n`);

  // Create output directory
  await mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`✓ Output directory ready\n`);

  // Launch browser
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  console.log('✓ Browser launched\n');

  // Capture all screenshots
  for (let i = 0; i < screenshots.length; i++) {
    try {
      await captureScreenshot(page, screenshots[i], i);
    } catch (error) {
      console.error(`✗ Error capturing ${screenshots[i].name}:`, error);
    }
  }

  await browser.close();

  console.log('\n' + '='.repeat(60));
  console.log('Screenshot Capture Complete!');
  console.log('='.repeat(60));
  console.log(`\nScreenshots saved to: ${OUTPUT_DIR}`);
  console.log('\nNext steps:');
  console.log('1. Review screenshots in /public/screenshots/product-hunt/');
  console.log('2. Edit/annotate as needed (use Figma, Photoshop, or Snagit)');
  console.log('3. Upload to Product Hunt when ready');
  console.log('\nTips for Product Hunt:');
  console.log('- First screenshot should be the most compelling (hero/landing)');
  console.log('- Show the product in action (calculator with real data)');
  console.log('- Include mobile screenshots to show responsive design');
  console.log('- Add brief captions/annotations if needed');
  console.log('- Max 10 screenshots, aim for 6-8 high-quality ones');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
