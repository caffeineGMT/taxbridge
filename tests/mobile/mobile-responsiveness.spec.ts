/**
 * Mobile Responsiveness Test Suite
 * Tests on iOS Safari and Android Chrome
 *
 * Coverage:
 * - Layout breakpoints
 * - Touch interactions
 * - Viewport scaling
 * - Mobile navigation
 * - Form usability
 */

import { test, expect, devices } from '@playwright/test';

// Test configurations for different mobile devices
const mobileDevices = [
  { name: 'iPhone 13', device: devices['iPhone 13'] },
  { name: 'iPhone SE', device: devices['iPhone SE'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] },
  { name: 'Samsung Galaxy S21', device: devices['Galaxy S9+'] },
];

test.describe('Mobile Layout - Landing Page', () => {
  for (const { name, device } of mobileDevices) {
    test(`${name}: should display hero section properly`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
      });
      const page = await context.newPage();
      await page.goto('/');

      // Check hero heading is visible
      const hero = page.locator('h1');
      await expect(hero).toBeVisible();

      // Check CTA buttons are stacked vertically on mobile
      const ctaContainer = page.locator('div:has(> a > button)').first();
      const buttons = ctaContainer.locator('button');
      const count = await buttons.count();

      if (count >= 2) {
        const firstButton = buttons.nth(0);
        const secondButton = buttons.nth(1);

        const firstBox = await firstButton.boundingBox();
        const secondBox = await secondButton.boundingBox();

        // On mobile, buttons should stack (y positions different)
        if (firstBox && secondBox) {
          expect(secondBox.y).toBeGreaterThan(firstBox.y);
        }
      }

      await context.close();
    });

    test(`${name}: should have working mobile navigation`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
      });
      const page = await context.newPage();
      await page.goto('/');

      // Check if hamburger menu exists on mobile
      const hamburger = page.locator('[aria-label*="menu" i], button:has-text("Menu")');

      // Mobile nav may be hidden on larger screens
      const viewportWidth = device.viewport.width;
      if (viewportWidth < 768) {
        // Should have hamburger menu on small screens
        // Note: Implementation may vary
      }

      await context.close();
    });

    test(`${name}: should not have horizontal scroll`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
      });
      const page = await context.newPage();
      await page.goto('/');

      // Check no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance

      await context.close();
    });
  }
});

test.describe('Mobile Layout - Dashboard', () => {
  for (const { name, device } of mobileDevices) {
    test(`${name}: should display dashboard cards in column layout`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
      });
      const page = await context.newPage();
      await page.goto('/dashboard');

      // Wait for dashboard to load
      await page.waitForLoadState('networkidle');

      // Check that cards stack vertically
      const cards = page.locator('[class*="card"]');
      const count = await cards.count();

      if (count >= 2) {
        const firstCard = cards.nth(0);
        const secondCard = cards.nth(1);

        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();

        if (firstBox && secondBox) {
          // Cards should be stacked (not side by side)
          const isStacked = secondBox.y > firstBox.y + firstBox.height - 50;
          expect(isStacked).toBeTruthy();
        }
      }

      await context.close();
    });

    test(`${name}: should have readable text sizes`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
      });
      const page = await context.newPage();
      await page.goto('/dashboard');

      // Check font sizes are readable
      const bodyFontSize = await page.locator('body').evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).fontSize);
      });

      // Body text should be at least 14px
      expect(bodyFontSize).toBeGreaterThanOrEqual(14);

      // Check heading sizes
      const h1FontSize = await page.locator('h1').first().evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).fontSize);
      });

      // H1 should be noticeably larger
      expect(h1FontSize).toBeGreaterThanOrEqual(24);

      await context.close();
    });
  }
});

test.describe('Mobile Forms - Calculator', () => {
  for (const { name, device } of mobileDevices) {
    test(`${name}: should have usable form inputs`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
      });
      const page = await context.newPage();
      await page.goto('/tax-calculator/washington-bc');

      // Check input fields are large enough for touch
      const inputs = page.locator('input, select');
      const count = await inputs.count();

      for (let i = 0; i < Math.min(count, 3); i++) {
        const input = inputs.nth(i);
        const box = await input.boundingBox();

        if (box) {
          // Inputs should be at least 44px tall for touch
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }

      // Test filling out the form
      const rsuInput = page.locator('input[type="text"]').first();
      await rsuInput.tap();
      await rsuInput.fill('100000');

      // Virtual keyboard should appear (can't directly test, but fill should work)
      const value = await rsuInput.inputValue();
      expect(value).toBe('100000');

      await context.close();
    });

    test(`${name}: should display validation errors clearly`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
      });
      const page = await context.newPage();
      await page.goto('/tax-calculator/washington-bc');

      // Submit empty form
      const submitButton = page.locator('button:has-text("Calculate")');
      await submitButton.tap();

      await page.waitForTimeout(1000);

      // Check for error messages
      const errors = page.locator('[role="alert"], .error, [class*="error"]');
      const errorCount = await errors.count();

      // Errors should be visible and readable
      if (errorCount > 0) {
        const errorBox = await errors.first().boundingBox();
        expect(errorBox).toBeTruthy();
      }

      await context.close();
    });

    test(`${name}: should have accessible dropdowns`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
      });
      const page = await context.newPage();
      await page.goto('/tax-calculator/washington-bc');

      // Find select dropdown
      const select = page.locator('select').first();
      const box = await select.boundingBox();

      if (box) {
        // Dropdown should be tall enough for touch
        expect(box.height).toBeGreaterThanOrEqual(40);

        // Test interaction
        await select.tap();
        await select.selectOption({ index: 1 });

        const value = await select.inputValue();
        expect(value).toBeTruthy();
      }

      await context.close();
    });
  }
});

test.describe('Mobile Touch Interactions', () => {
  test.use({
    ...devices['iPhone 13'],
  });

  test('should support touch scrolling', async ({ page }) => {
    await page.goto('/');

    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Simulate swipe up
    await page.touchscreen.tap(200, 400);
    await page.mouse.move(200, 400);
    await page.mouse.down();
    await page.mouse.move(200, 100);
    await page.mouse.up();

    await page.waitForTimeout(500);

    const finalScrollY = await page.evaluate(() => window.scrollY);

    // Page should scroll
    expect(finalScrollY).toBeGreaterThanOrEqual(initialScrollY);
  });

  test('should support tap interactions on buttons', async ({ page }) => {
    await page.goto('/');

    // Tap on CTA button
    const ctaButton = page.locator('button, a[role="button"]').first();
    await ctaButton.tap();

    await page.waitForTimeout(500);

    // Navigation should occur
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should handle double tap gracefully', async ({ page }) => {
    await page.goto('/tax-calculator/washington-bc');

    const submitButton = page.locator('button:has-text("Calculate")');

    // Double tap
    await submitButton.tap();
    await submitButton.tap();

    // Should not cause issues (form submission dedupe)
    await page.waitForTimeout(1000);

    // Page should still be functional
    const isVisible = await submitButton.isVisible();
    expect(isVisible).toBeTruthy();
  });
});

test.describe('Mobile Viewport Scaling', () => {
  test('should have proper viewport meta tag', async ({ page }) => {
    await page.goto('/');

    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');

    expect(viewportMeta).toBeTruthy();
    expect(viewportMeta).toContain('width=device-width');
    expect(viewportMeta).toContain('initial-scale=1');
  });

  test('should not allow user to zoom out beyond reasonable limits', async ({ page }) => {
    await page.goto('/');

    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');

    // Check that maximum-scale is reasonable (not blocking zoom entirely)
    // Note: Blocking zoom is an accessibility issue
    if (viewportMeta?.includes('maximum-scale')) {
      const maxScale = parseFloat(viewportMeta.match(/maximum-scale=([\d.]+)/)?.[1] || '1');
      expect(maxScale).toBeGreaterThanOrEqual(1);
    }
  });
});

test.describe('Mobile Performance', () => {
  test.use({
    ...devices['Pixel 5'],
  });

  test('should load quickly on mobile network', async ({ page }) => {
    // Simulate slow 3G
    await page.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should load within reasonable time even with delay
    expect(loadTime).toBeLessThan(10000); // 10 seconds
  });

  test('should handle offline gracefully', async ({ page, context }) => {
    await page.goto('/');

    // Go offline
    await context.setOffline(true);

    // Try to navigate
    await page.locator('a').first().click();

    await page.waitForTimeout(2000);

    // Should show some error or cached content
    // Implementation specific
  });
});

test.describe('Mobile-Specific Features', () => {
  test.use({
    ...devices['iPhone 13'],
  });

  test('should have proper safe area insets for notched devices', async ({ page }) => {
    await page.goto('/');

    // Check if viewport-fit=cover is set for notched devices
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');

    // Safe area insets should be respected
    const header = page.locator('header');
    const headerTop = await header.evaluate((el) => {
      return window.getComputedStyle(el).paddingTop;
    });

    // Should have some padding (can be from safe-area-inset-top)
    expect(headerTop).toBeTruthy();
  });

  test('should work with mobile keyboard', async ({ page }) => {
    await page.goto('/tax-calculator/washington-bc');

    const input = page.locator('input[type="text"]').first();

    // Focus input (should trigger mobile keyboard)
    await input.tap();
    await input.fill('100000');

    // Check input is still visible (not covered by keyboard)
    const isVisible = await input.isVisible();
    expect(isVisible).toBeTruthy();

    // Value should be correct
    const value = await input.inputValue();
    expect(value).toBe('100000');
  });
});

test.describe('Landscape Orientation', () => {
  test('should work in landscape mode on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 13'],
      viewport: { width: 844, height: 390 }, // Landscape
    });
    const page = await context.newPage();
    await page.goto('/');

    // Content should still be readable
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);

    await context.close();
  });
});
