/**
 * Automated Screenshot Capture for Product Hunt Launch (Playwright version)
 *
 * Captures high-quality screenshots of key TaxBridge pages
 * Product Hunt recommended dimensions: 1280x800px (16:10 aspect ratio)
 * Output: /public/product-hunt/screenshots/
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const OUTPUT_DIR = join(process.cwd(), 'public', 'product-hunt', 'screenshots');

// Product Hunt recommended dimensions
const PH_VIEWPORT = { width: 1280, height: 800 };

interface Screenshot {
  name: string;
  url: string;
  description: string;
  viewport?: { width: number; height: number };
  waitFor?: string;
  fullPage?: boolean;
  scrollTo?: { selector: string; offset?: number };
}

const screenshots: Screenshot[] = [
  {
    name: 'hero-dashboard',
    url: '/dashboard',
    description: 'Main dashboard with RSU entries and tax overview',
    viewport: PH_VIEWPORT,
    waitFor: 'h1',
    fullPage: false,
  },
  {
    name: 'ftc-optimizer',
    url: '/dashboard',
    description: 'Foreign Tax Credit calculation results showing dual-country taxation',
    viewport: PH_VIEWPORT,
    waitFor: 'h1',
    fullPage: false,
    scrollTo: { selector: '[data-testid="tax-summary"]' },
  },
  {
    name: 'forms-checklist',
    url: '/forms-checklist',
    description: 'Required tax forms checklist (W-2, 1040, T1, T4, FBAR, 8938, 8833)',
    viewport: PH_VIEWPORT,
    waitFor: 'h1',
    fullPage: false,
  },
  {
    name: 'pricing-page',
    url: '/pricing',
    description: 'Pricing tiers with Pro plan highlighted',
    viewport: PH_VIEWPORT,
    waitFor: 'h1',
    fullPage: false,
  },
  {
    name: 'pdf-export',
    url: '/dashboard',
    description: 'Professional PDF export sample with dual-country tax breakdown',
    viewport: PH_VIEWPORT,
    waitFor: 'h1',
    fullPage: false,
    scrollTo: { selector: 'footer', offset: -200 },
  },
];

async function captureScreenshot(
  page: any,
  screenshot: Screenshot,
  index: number
) {
  const { name, url, description, viewport, waitFor, fullPage, scrollTo } = screenshot;

  console.log(`\n[${index + 1}/${screenshots.length}] Capturing: ${description}`);
  console.log(`URL: ${BASE_URL}${url}`);

  // Set viewport
  if (viewport) {
    await page.setViewportSize(viewport);
  }

  // Navigate to page
  await page.goto(`${BASE_URL}${url}`, {
    waitUntil: 'networkidle',
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

  // Scroll to specific element if needed
  if (scrollTo) {
    try {
      await page.evaluate((selector: string) => {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, scrollTo.selector);
      await page.waitForTimeout(500);
    } catch (error) {
      console.warn(`Warning: Could not scroll to "${scrollTo.selector}", continuing...`);
    }
  }

  // Additional wait for animations/renders
  await page.waitForTimeout(1500);

  // Capture screenshot
  const outputPath = join(OUTPUT_DIR, `${name}.png`);
  await page.screenshot({
    path: outputPath,
    fullPage: fullPage !== false,
  });

  console.log(`✓ Saved: ${outputPath}`);
}

async function main() {
  console.log('='.repeat(70));
  console.log('TaxBridge Product Hunt Screenshot Capture');
  console.log('='.repeat(70));
  console.log(`\nBase URL: ${BASE_URL}`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);
  console.log(`Dimensions: ${PH_VIEWPORT.width}x${PH_VIEWPORT.height} (Product Hunt recommended)`);
  console.log(`Screenshots to capture: ${screenshots.length}\n`);

  // Create output directory
  await mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`✓ Output directory ready\n`);

  // Launch browser
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
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

  console.log('\n' + '='.repeat(70));
  console.log('Screenshot Capture Complete!');
  console.log('='.repeat(70));
  console.log(`\nScreenshots saved to: ${OUTPUT_DIR}`);
  console.log('\nNext steps:');
  console.log('1. Review screenshots in /public/product-hunt/screenshots/');
  console.log('2. Upload to Product Hunt (max 10 screenshots)');
  console.log('3. First screenshot should be hero-dashboard.png (most compelling)');
  console.log('\nProduct Hunt Screenshot Tips:');
  console.log('✓ 1280x800px dimensions (16:10 aspect ratio)');
  console.log('✓ Show the product in action with real data');
  console.log('✓ Include pricing page for transparency');
  console.log('✓ Highlight key features (FTC optimizer, forms checklist)');
  console.log('✓ Add brief annotations if needed (use Figma/Canva)');
  console.log('✓ First image is critical - make it count!\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
