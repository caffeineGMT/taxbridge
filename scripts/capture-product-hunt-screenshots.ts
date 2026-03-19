#!/usr/bin/env tsx
/**
 * Auto-capture Product Hunt screenshots
 * Runs headless browser to capture all required screenshots at 1280x800px
 *
 * Usage: npm run capture:screenshots
 */

import { chromium } from '@playwright/test';
import { join } from 'path';

const SCREENSHOTS_DIR = join(process.cwd(), 'public/product-hunt/screenshots');
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const screenshots = [
  {
    name: 'hero-dashboard.png',
    url: '/dashboard',
    description: 'Main dashboard with RSU entries and tax overview',
    waitFor: 'text=TaxBridge Dashboard',
    viewport: { width: 1280, height: 800 },
  },
  {
    name: 'ftc-optimizer.png',
    url: '/dashboard/results',
    description: 'Foreign Tax Credit calculation results',
    waitFor: 'text=Foreign Tax Credit',
    viewport: { width: 1280, height: 800 },
  },
  {
    name: 'forms-checklist.png',
    url: '/dashboard/forms-checklist',
    description: 'Required tax forms checklist',
    waitFor: 'text=Forms Checklist',
    viewport: { width: 1280, height: 800 },
  },
  {
    name: 'pricing-page.png',
    url: '/pricing',
    description: 'Pricing tiers with Pro plan highlighted',
    waitFor: 'text=Choose Your Plan',
    viewport: { width: 1280, height: 800 },
  },
  {
    name: 'landing-hero.png',
    url: '/',
    description: 'Landing page hero section',
    waitFor: 'text=Cross-Border Tax',
    viewport: { width: 1280, height: 800 },
  },
];

async function captureScreenshots() {
  console.log('🚀 Starting Product Hunt screenshot capture...\n');

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2, // Retina display
  });

  const page = await context.newPage();

  for (const screenshot of screenshots) {
    try {
      console.log(`📸 Capturing: ${screenshot.name}`);
      console.log(`   URL: ${BASE_URL}${screenshot.url}`);

      await page.goto(`${BASE_URL}${screenshot.url}`, {
        waitUntil: 'networkidle',
      });

      // Wait for specific element to ensure page is fully loaded
      await page.waitForSelector(screenshot.waitFor, {
        timeout: 10000,
      });

      // Additional wait for animations
      await page.waitForTimeout(1000);

      const outputPath = join(SCREENSHOTS_DIR, screenshot.name);
      await page.screenshot({
        path: outputPath,
        fullPage: false,
      });

      console.log(`   ✅ Saved: ${outputPath}\n`);
    } catch (error) {
      console.error(`   ❌ Failed to capture ${screenshot.name}:`, error);
      console.log(`   Skipping...\n`);
    }
  }

  await browser.close();

  console.log('✅ Screenshot capture complete!');
  console.log(`\n📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
}

captureScreenshots().catch(console.error);
