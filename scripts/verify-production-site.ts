#!/usr/bin/env tsx

/**
 * Production Site Verification Script
 * Captures screenshots and performs health checks on production URLs
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const URLS_TO_TEST = [
  { name: 'taxbridgecpa.com', url: 'https://taxbridgecpa.com', expected: false },
  { name: 'taxbridge.vercel.app', url: 'https://taxbridge.vercel.app', expected: true },
];

const PAGES_TO_CAPTURE = [
  { path: '/', name: 'homepage' },
  { path: '/calculator', name: 'calculator' },
  { path: '/pricing', name: 'pricing' },
];

async function verifyProduction() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const screenshotDir = path.join(process.cwd(), 'docs', 'screenshots', timestamp);

  // Create screenshots directory
  fs.mkdirSync(screenshotDir, { recursive: true });

  console.log(`\n📸 Production Site Verification - ${new Date().toISOString()}\n`);
  console.log(`Screenshots will be saved to: ${screenshotDir}\n`);

  const browser = await chromium.launch({ headless: true });
  const results: any[] = [];

  for (const urlConfig of URLS_TO_TEST) {
    console.log(`\n🔍 Testing: ${urlConfig.url}`);

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    });

    const page = await context.newPage();

    try {
      // Test basic connectivity
      const response = await page.goto(urlConfig.url, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      const status = response?.status() || 0;
      const accessible = status === 200;

      console.log(`   Status: ${status} ${accessible ? '✅' : '❌'}`);

      if (accessible) {
        // Test additional pages
        for (const pageConfig of PAGES_TO_CAPTURE) {
          const fullUrl = `${urlConfig.url}${pageConfig.path}`;
          console.log(`   📄 Capturing: ${pageConfig.name}...`);

          try {
            await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 10000 });
            await page.waitForTimeout(2000); // Let page settle

            const screenshotPath = path.join(
              screenshotDir,
              `${urlConfig.name}-${pageConfig.name}.png`
            );

            await page.screenshot({
              path: screenshotPath,
              fullPage: true,
            });

            console.log(`      ✅ Saved: ${pageConfig.name}.png`);
          } catch (err: any) {
            console.log(`      ❌ Failed to capture ${pageConfig.name}: ${err.message}`);
          }
        }
      }

      results.push({
        url: urlConfig.url,
        name: urlConfig.name,
        status,
        accessible,
        expected: urlConfig.expected,
        match: accessible === urlConfig.expected,
      });

    } catch (error: any) {
      console.log(`   ❌ Connection failed: ${error.message}`);
      results.push({
        url: urlConfig.url,
        name: urlConfig.name,
        status: 0,
        accessible: false,
        expected: urlConfig.expected,
        match: !urlConfig.expected,
        error: error.message,
      });
    } finally {
      await context.close();
    }
  }

  await browser.close();

  // Generate summary report
  console.log('\n' + '='.repeat(80));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(80) + '\n');

  let allPassed = true;

  for (const result of results) {
    const icon = result.match ? '✅' : '⚠️';
    const statusText = result.accessible ? 'UP' : 'DOWN';
    const expectedText = result.expected ? 'Expected UP' : 'Expected DOWN';

    console.log(`${icon} ${result.name}: ${statusText} (${expectedText})`);
    console.log(`   URL: ${result.url}`);
    console.log(`   Status: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log('');

    if (!result.match) {
      allPassed = false;
    }
  }

  // Save JSON report
  const reportPath = path.join(screenshotDir, 'verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    results,
    summary: {
      totalTests: results.length,
      passed: results.filter(r => r.match).length,
      failed: results.filter(r => !r.match).length,
      allPassed,
    },
  }, null, 2));

  console.log(`📄 Full report saved: ${reportPath}\n`);
  console.log('='.repeat(80) + '\n');

  if (allPassed) {
    console.log('✅ All verifications passed!\n');
  } else {
    console.log('⚠️  Some verifications did not match expectations.\n');
  }

  return { allPassed, screenshotDir, results };
}

// Run verification
verifyProduction()
  .then(({ allPassed, screenshotDir }) => {
    console.log(`Screenshots directory: ${screenshotDir}`);
    process.exit(allPassed ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
