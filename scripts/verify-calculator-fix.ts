#!/usr/bin/env tsx

/**
 * Calculator Route Verification Script
 *
 * Verifies the /us-canada-tax-calculator route works correctly:
 * 1. Page loads with HTTP 200
 * 2. Input fields are visible
 * 3. Calculator renders properly
 * 4. No 404 errors
 *
 * Evidence-based verification per TASK_COMPLETION_POLICY.md
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const PRODUCTION_URL = 'https://taxbridge.vercel.app';
const CALCULATOR_PATH = '/us-canada-tax-calculator';
const SCREENSHOT_DIR = path.join(process.cwd(), 'docs/screenshots/calculator-fix-verification');

async function verifyCalculatorRoute() {
  console.log('🔍 Starting Calculator Route Verification...\n');

  // Ensure screenshot directory exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  const results = {
    timestamp: new Date().toISOString(),
    url: `${PRODUCTION_URL}${CALCULATOR_PATH}`,
    tests: [] as any[],
    passed: 0,
    failed: 0,
    totalTests: 4,
  };

  try {
    // Test 1: Page loads with HTTP 200
    console.log('Test 1: Checking if page loads with HTTP 200...');
    const response = await page.goto(`${PRODUCTION_URL}${CALCULATOR_PATH}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    const statusCode = response?.status() || 0;
    const test1Passed = statusCode === 200;
    results.tests.push({
      name: 'Page HTTP Status',
      expected: '200',
      actual: statusCode.toString(),
      passed: test1Passed,
    });

    if (test1Passed) {
      console.log('✅ Page loads with HTTP 200');
      results.passed++;
    } else {
      console.log(`❌ Page returned HTTP ${statusCode} (expected 200)`);
      results.failed++;
      throw new Error(`Page returned ${statusCode} instead of 200`);
    }

    // Take screenshot after page load
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `calculator-page-loaded-${Date.now()}.png`),
      fullPage: true,
    });
    console.log('📸 Screenshot saved: calculator-page-loaded.png\n');

    // Test 2: Input fields are visible
    console.log('Test 2: Checking if input fields are visible...');

    // Wait for input fields to be visible
    const rsuInput = page.locator('input[type="number"]').first();
    await rsuInput.waitFor({ state: 'visible', timeout: 10000 });

    const inputVisible = await rsuInput.isVisible();
    results.tests.push({
      name: 'RSU Input Field Visible',
      expected: 'true',
      actual: inputVisible.toString(),
      passed: inputVisible,
    });

    if (inputVisible) {
      console.log('✅ RSU input field is visible');
      results.passed++;
    } else {
      console.log('❌ RSU input field is NOT visible');
      results.failed++;
    }

    // Take screenshot of input field
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `input-field-visible-${Date.now()}.png`),
      fullPage: false,
    });
    console.log('📸 Screenshot saved: input-field-visible.png\n');

    // Test 3: Select dropdowns are visible
    console.log('Test 3: Checking if select dropdowns are visible...');
    const usStateSelect = page.locator('select#us-state');
    const provinceSelect = page.locator('select#canada-province');

    await usStateSelect.waitFor({ state: 'visible', timeout: 5000 });
    await provinceSelect.waitFor({ state: 'visible', timeout: 5000 });

    const selectsVisible = await usStateSelect.isVisible() && await provinceSelect.isVisible();
    results.tests.push({
      name: 'Select Dropdowns Visible',
      expected: 'true',
      actual: selectsVisible.toString(),
      passed: selectsVisible,
    });

    if (selectsVisible) {
      console.log('✅ US State and Province selects are visible');
      results.passed++;
    } else {
      console.log('❌ Select dropdowns are NOT visible');
      results.failed++;
    }

    // Test 4: Calculator actually calculates
    console.log('Test 4: Testing calculator functionality...');

    // Fill in calculator
    await rsuInput.fill('100000');
    await page.waitForTimeout(2000); // Wait for calculation

    // Check if results are displayed
    const resultsCard = page.locator('text=Your Tax Estimate');
    const resultsVisible = await resultsCard.isVisible();

    results.tests.push({
      name: 'Calculator Calculates',
      expected: 'Results displayed',
      actual: resultsVisible ? 'Results displayed' : 'No results',
      passed: resultsVisible,
    });

    if (resultsVisible) {
      console.log('✅ Calculator displays results after input');
      results.passed++;
    } else {
      console.log('❌ Calculator does NOT display results');
      results.failed++;
    }

    // Take final screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `calculator-working-${Date.now()}.png`),
      fullPage: true,
    });
    console.log('📸 Screenshot saved: calculator-working.png\n');

  } catch (error: any) {
    console.error('❌ Error during verification:', error.message);
    results.failed = results.totalTests - results.passed;

    // Take error screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `error-state-${Date.now()}.png`),
      fullPage: true,
    });
  } finally {
    await browser.close();
  }

  // Generate report
  const report = `
# Calculator Route Verification Report

**Timestamp:** ${results.timestamp}
**URL:** ${results.url}

## Summary

- ✅ Passed: ${results.passed}/${results.totalTests}
- ❌ Failed: ${results.failed}/${results.totalTests}
- **Overall Status:** ${results.passed === results.totalTests ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}

## Test Results

${results.tests.map((test, i) => `
### Test ${i + 1}: ${test.name}

- **Expected:** ${test.expected}
- **Actual:** ${test.actual}
- **Status:** ${test.passed ? '✅ PASS' : '❌ FAIL'}
`).join('\n')}

## Evidence

Screenshots saved to: \`${SCREENSHOT_DIR}\`

- calculator-page-loaded.png
- input-field-visible.png
- calculator-working.png

## Conclusion

${results.passed === results.totalTests
  ? '✅ **Calculator route is working correctly.** All input fields are visible and calculator functionality is confirmed.'
  : '❌ **Calculator route has issues.** See failed tests above for details.'}
`;

  // Save report
  const reportPath = path.join(SCREENSHOT_DIR, 'verification-report.md');
  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Report saved to: ${reportPath}`);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}/${results.totalTests}`);
  console.log(`❌ Failed: ${results.failed}/${results.totalTests}`);
  console.log('='.repeat(60));

  if (results.passed === results.totalTests) {
    console.log('\n🎉 SUCCESS: Calculator route is fully functional!');
    process.exit(0);
  } else {
    console.log('\n⚠️  FAILED: Some tests did not pass. Check the report for details.');
    process.exit(1);
  }
}

verifyCalculatorRoute();
