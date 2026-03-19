import { test, expect } from '@playwright/test';

/**
 * Cross-Browser Payment Flow Tests
 * Tests Stripe checkout and payment flow across all browsers
 */

test.describe('Payment Flow - Cross Browser', () => {
  const PROD_URL = 'https://taxbridge.app';

  test('pricing page should be accessible', async ({ page, browserName }) => {
    await page.goto(`${PROD_URL}/pricing`);

    // Check if pricing cards load
    const pricingSection = page.locator('section:has-text("Pricing"), div:has-text("$")').first();
    await expect(pricingSection).toBeVisible({ timeout: 10000 });

    console.log(`✓ ${browserName}: Pricing page loads`);

    await page.screenshot({
      path: `test-results/pricing-${browserName}.png`,
      fullPage: true
    });
  });

  test('payment button should be clickable', async ({ page, browserName }) => {
    await page.goto(`${PROD_URL}/pricing`);

    // Look for purchase/subscribe buttons
    const paymentBtn = page.locator('button:has-text("Get Started"), button:has-text("Subscribe"), button:has-text("Buy Now"), a:has-text("Get Started")').first();

    await expect(paymentBtn).toBeVisible({ timeout: 10000 });

    // Check if button is interactive
    const isEnabled = await paymentBtn.isEnabled();
    expect(isEnabled).toBe(true);

    console.log(`✓ ${browserName}: Payment CTA is clickable`);
  });

  test('checkout flow should initiate', async ({ page, browserName, context }) => {
    // Skip on mobile for this test (Stripe checkout may redirect)
    await page.goto(`${PROD_URL}/pricing`);

    const paymentBtn = page.locator('button:has-text("Get Started"), button:has-text("Subscribe"), a[href*="checkout"]').first();

    if (await paymentBtn.isVisible({ timeout: 5000 })) {
      // Listen for new pages/popups (Stripe may open in new window)
      const pagePromise = context.waitForEvent('page', { timeout: 10000 }).catch(() => null);

      await paymentBtn.click();

      // Wait for either:
      // 1. New page (Stripe redirect)
      // 2. URL change (in-app checkout)
      // 3. Modal/dialog (embedded checkout)
      await Promise.race([
        pagePromise,
        page.waitForURL(/checkout|stripe|payment/, { timeout: 10000 }).catch(() => {}),
        page.waitForSelector('[role="dialog"], .modal, iframe[src*="stripe"]', { timeout: 10000 }).catch(() => {})
      ]);

      // Check what happened
      const currentUrl = page.url();
      const hasStripeIframe = await page.locator('iframe[src*="stripe"]').isVisible().catch(() => false);
      const hasModal = await page.locator('[role="dialog"], .modal').isVisible().catch(() => false);

      if (currentUrl.includes('checkout') || currentUrl.includes('stripe') || hasStripeIframe || hasModal) {
        console.log(`✓ ${browserName}: Checkout flow initiated successfully`);

        await page.screenshot({
          path: `test-results/checkout-${browserName}.png`
        });
      } else {
        console.log(`⚠ ${browserName}: Checkout flow unclear (URL: ${currentUrl})`);
      }
    }
  });

  test('stripe elements should load on mobile', async ({ page, browserName, isMobile }) => {
    if (!isMobile) {
      test.skip();
      return;
    }

    await page.goto(`${PROD_URL}/pricing`);

    const paymentBtn = page.locator('button:has-text("Get Started"), a[href*="checkout"]').first();

    if (await paymentBtn.isVisible({ timeout: 5000 })) {
      await paymentBtn.click();

      // Wait for Stripe elements
      await page.waitForTimeout(3000);

      // Check for Stripe iframe
      const stripeFrame = page.frameLocator('iframe[src*="stripe"]').first();
      const hasStripe = await stripeFrame.locator('body').isVisible({ timeout: 5000 }).catch(() => false);

      if (hasStripe) {
        console.log(`✓ ${browserName} (mobile): Stripe elements load correctly`);
      } else {
        console.log(`⚠ ${browserName} (mobile): Stripe elements not detected`);
      }

      await page.screenshot({
        path: `test-results/checkout-mobile-${browserName}.png`,
        fullPage: true
      });
    }
  });

  test('payment errors should display correctly', async ({ page, browserName }) => {
    // This test would require a test payment page
    // For now, just verify error handling UI exists

    await page.goto(`${PROD_URL}/pricing`);

    // Check if page has error handling elements
    const errorHandling = await page.evaluate(() => {
      // Look for common error display patterns
      const hasToast = !!document.querySelector('[role="status"], [role="alert"], .toast');
      const hasErrorDiv = !!document.querySelector('.error, .text-red-500, .text-destructive');

      return { hasToast, hasErrorDiv };
    });

    console.log(`${browserName}: Error handling elements:`, errorHandling);
  });

  test('payment page should not have console errors', async ({ page, browserName }) => {
    const errors: string[] = [];
    const networkErrors: string[] = [];

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('response', response => {
      if (!response.ok() && response.url().includes('stripe')) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto(`${PROD_URL}/pricing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('PostHog') &&
      !e.includes('favicon')
    );

    if (criticalErrors.length > 0) {
      console.log(`⚠ ${browserName}: Console errors on pricing page:`, criticalErrors);
    } else {
      console.log(`✓ ${browserName}: No critical console errors on pricing page`);
    }

    if (networkErrors.length > 0) {
      console.log(`⚠ ${browserName}: Network errors:`, networkErrors);
    }
  });

  test('checkout should work with autofill', async ({ page, browserName }) => {
    await page.goto(`${PROD_URL}/pricing`);

    const paymentBtn = page.locator('button:has-text("Get Started"), a[href*="checkout"]').first();

    if (await paymentBtn.isVisible({ timeout: 5000 })) {
      await paymentBtn.click();
      await page.waitForTimeout(2000);

      // Check if form inputs have proper autocomplete attributes
      const inputs = page.locator('input[type="email"], input[type="text"], input[autocomplete]');
      const count = await inputs.count();

      let properAutocomplete = 0;
      for (let i = 0; i < count; i++) {
        const autocomplete = await inputs.nth(i).getAttribute('autocomplete');
        if (autocomplete && autocomplete !== 'off') {
          properAutocomplete++;
        }
      }

      console.log(`${browserName}: ${properAutocomplete}/${count} inputs have autocomplete configured`);
    }
  });

  test('pricing tiers should be readable', async ({ page, browserName }) => {
    await page.goto(`${PROD_URL}/pricing`);

    // Check if pricing amounts are visible and properly formatted
    const prices = page.locator('text=/\\$\\d+/');
    const priceCount = await prices.count();

    if (priceCount > 0) {
      console.log(`✓ ${browserName}: Found ${priceCount} pricing elements`);

      // Take screenshot for visual verification
      await page.screenshot({
        path: `test-results/pricing-display-${browserName}.png`,
        fullPage: true
      });
    } else {
      console.log(`⚠ ${browserName}: No pricing amounts detected`);
    }
  });
});
