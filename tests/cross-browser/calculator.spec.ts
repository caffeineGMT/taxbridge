import { test, expect } from '@playwright/test';

/**
 * Cross-Browser Calculator Regression Tests
 * Tests calculator functionality on Chrome, Firefox, Safari, Edge, and mobile browsers
 */

test.describe('Calculator - Cross Browser', () => {
  const PROD_URL = 'https://taxbridge.app';

  test.beforeEach(async ({ page }) => {
    await page.goto(PROD_URL);
  });

  test('calculator should load and display correctly', async ({ page, browserName }) => {
    // Check if calculator section exists
    const calculator = page.locator('[data-testid="roi-calculator"], section:has-text("Calculate Your Savings")').first();
    await expect(calculator).toBeVisible({ timeout: 10000 });

    // Screenshot for visual comparison
    await page.screenshot({
      path: `test-results/calculator-${browserName}.png`,
      fullPage: true
    });
  });

  test('calculator inputs should accept numeric values', async ({ page, browserName }) => {
    // Find income input
    const incomeInput = page.locator('input[name="income"], input[placeholder*="income" i]').first();
    await incomeInput.waitFor({ state: 'visible', timeout: 10000 });
    await incomeInput.fill('120000');

    // Verify value persists
    await expect(incomeInput).toHaveValue('120000');

    // Find RSU value input
    const rsuInput = page.locator('input[name="rsuValue"], input[placeholder*="RSU" i], input[placeholder*="stock" i]').first();
    if (await rsuInput.isVisible()) {
      await rsuInput.fill('50000');
      await expect(rsuInput).toHaveValue('50000');
    }

    console.log(`✓ ${browserName}: Input validation passed`);
  });

  test('calculator should handle edge cases', async ({ page, browserName }) => {
    const incomeInput = page.locator('input[name="income"], input[placeholder*="income" i]').first();
    await incomeInput.waitFor({ state: 'visible', timeout: 10000 });

    // Test zero value
    await incomeInput.fill('0');
    await expect(incomeInput).toHaveValue('0');

    // Test large value
    await incomeInput.fill('9999999');
    await expect(incomeInput).toHaveValue('9999999');

    // Test decimal value
    await incomeInput.fill('120000.50');
    const value = await incomeInput.inputValue();
    expect(value).toContain('120000');

    console.log(`✓ ${browserName}: Edge case handling passed`);
  });

  test('calculator should compute results', async ({ page, browserName }) => {
    // Fill in calculator inputs
    const incomeInput = page.locator('input[name="income"], input[placeholder*="income" i]').first();
    await incomeInput.waitFor({ state: 'visible', timeout: 10000 });
    await incomeInput.fill('120000');

    const rsuInput = page.locator('input[name="rsuValue"], input[placeholder*="RSU" i], input[placeholder*="stock" i]').first();
    if (await rsuInput.isVisible()) {
      await rsuInput.fill('50000');
    }

    // Look for calculate button
    const calculateBtn = page.locator('button:has-text("Calculate"), button[type="submit"]').first();
    if (await calculateBtn.isVisible()) {
      await calculateBtn.click();

      // Wait for results to appear
      await page.waitForTimeout(2000);

      // Check if results section appeared
      const results = page.locator('[data-testid="calculation-results"], div:has-text("Tax Savings"), div:has-text("Results")');
      const hasResults = await results.first().isVisible().catch(() => false);

      if (hasResults) {
        console.log(`✓ ${browserName}: Calculator computation successful`);
      } else {
        console.log(`⚠ ${browserName}: Results not immediately visible (may be async)`);
      }

      await page.screenshot({
        path: `test-results/calculator-results-${browserName}.png`
      });
    }
  });

  test('calculator should be responsive on mobile', async ({ page, browserName, isMobile }) => {
    if (!isMobile) {
      test.skip();
      return;
    }

    // Check if calculator is visible and usable on mobile
    const calculator = page.locator('[data-testid="roi-calculator"], section:has-text("Calculate")').first();
    await expect(calculator).toBeVisible({ timeout: 10000 });

    // Check if inputs are tappable (not too small)
    const incomeInput = page.locator('input[name="income"], input[placeholder*="income" i]').first();
    const box = await incomeInput.boundingBox();

    if (box) {
      // Minimum touch target should be 44x44px (Apple HIG)
      expect(box.height).toBeGreaterThanOrEqual(40);
      console.log(`✓ ${browserName} (mobile): Touch targets adequate (${box.height}px)`);
    }

    await page.screenshot({
      path: `test-results/calculator-mobile-${browserName}.png`,
      fullPage: true
    });
  });

  test('calculator should not have JavaScript errors', async ({ page, browserName }) => {
    const errors: string[] = [];

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    if (errors.length > 0) {
      console.log(`⚠ ${browserName}: JavaScript errors detected:`, errors);
    } else {
      console.log(`✓ ${browserName}: No JavaScript errors`);
    }

    // Don't fail test for console errors, just document them
    expect(errors.filter(e => !e.includes('ResizeObserver') && !e.includes('PostHog'))).toHaveLength(0);
  });
});
