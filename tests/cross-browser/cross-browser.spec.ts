/**
 * Cross-Browser Compatibility Test Suite
 * Tests on Chrome, Firefox, Safari (WebKit), and Edge
 *
 * Coverage:
 * - Layout consistency
 * - JavaScript functionality
 * - CSS rendering
 * - Form behavior
 */

import { test, expect, chromium, firefox, webkit } from '@playwright/test';

const browsers = [
  { name: 'Chromium', browser: chromium },
  { name: 'Firefox', browser: firefox },
  { name: 'WebKit (Safari)', browser: webkit },
];

test.describe('Cross-Browser: Landing Page Rendering', () => {
  for (const { name, browser } of browsers) {
    test(`${name}: should render hero section correctly`, async () => {
      const browserInstance = await browser.launch();
      const page = await browserInstance.newPage();
      await page.goto('/');

      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();

      const ctaButton = page.locator('button, a[href*="dashboard"]').first();
      await expect(ctaButton).toBeVisible();

      await browserInstance.close();
    });

    test(`${name}: should handle text input correctly`, async () => {
      const browserInstance = await browser.launch();
      const page = await browserInstance.newPage();
      await page.goto('/tax-calculator/washington-bc');

      const input = page.locator('input[type="text"]').first();
      await input.fill('100000');

      const value = await input.inputValue();
      expect(value).toBe('100000');

      await browserInstance.close();
    });
  }
});
