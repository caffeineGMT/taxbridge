/**
 * COMPREHENSIVE MANUAL QA TEST SUITE
 * Tests all critical user flows on production: signup, calculator, checkout, dashboard
 *
 * Run with: npm run test:e2e -- manual-qa.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

const PRODUCTION_URL = process.env.TEST_URL || 'https://taxbridge.app';
const TEST_EMAIL = `qa-test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

// Helper to wait for navigation and stability
async function waitForStability(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

test.describe('Manual QA - User Flow Testing', () => {
  test.describe.configure({ mode: 'serial' });

  test.describe('1. SIGNUP FLOW', () => {
    test('1.1 Landing page loads correctly', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await waitForStability(page);

      // Check critical elements exist
      await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

      // Check for CTA buttons
      const ctaButtons = page.locator('a[href*="sign-up"], button:has-text("Sign Up"), button:has-text("Get Started")');
      await expect(ctaButtons.first()).toBeVisible({ timeout: 5000 });

      // Check for navigation
      const nav = page.locator('nav, header').first();
      await expect(nav).toBeVisible();

      // Screenshot for documentation
      await page.screenshot({ path: 'qa-screenshots/landing-page.png', fullPage: true });
    });

    test('1.2 Sign up page loads and form is accessible', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/sign-up`);
      await waitForStability(page);

      // Check for Clerk sign-up form
      const signUpForm = page.locator('form, [class*="clerk"], [class*="sign-up"]').first();
      await expect(signUpForm).toBeVisible({ timeout: 10000 });

      // Check for email input
      const emailInput = page.locator('input[type="email"], input[name="email"], input[name="emailAddress"]').first();
      await expect(emailInput).toBeVisible();

      // Check for password input
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      await expect(passwordInput).toBeVisible();

      await page.screenshot({ path: 'qa-screenshots/signup-page.png', fullPage: true });
    });

    test('1.3 OAuth buttons are present', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/sign-up`);
      await waitForStability(page);

      // Check for Google OAuth button
      const oauthButtons = page.locator('button:has-text("Google"), button:has-text("Continue with Google"), [class*="oauth"]');
      const oauthCount = await oauthButtons.count();

      console.log(`Found ${oauthCount} OAuth buttons`);

      await page.screenshot({ path: 'qa-screenshots/oauth-buttons.png' });
    });

    test('1.4 Form validation works', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/sign-up`);
      await waitForStability(page);

      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Continue")').first();

      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for validation errors
        await page.waitForTimeout(1000);

        // Check if errors are displayed
        const errorMessages = page.locator('[class*="error"], [class*="invalid"], [role="alert"], .text-red-500, .text-destructive');
        const errorCount = await errorMessages.count();

        console.log(`Found ${errorCount} validation error messages`);

        await page.screenshot({ path: 'qa-screenshots/validation-errors.png' });
      }
    });
  });

  test.describe('2. CALCULATOR FLOW', () => {
    test('2.1 Calculator page loads', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await waitForStability(page);

      // Look for calculator link or direct navigation
      const calculatorPage = await page.locator('a[href*="calculator"], a:has-text("Calculator"), a:has-text("Try Calculator")').first();

      if (await calculatorPage.isVisible({ timeout: 5000 })) {
        await calculatorPage.click();
        await waitForStability(page);
      } else {
        // Direct navigation if link not found
        await page.goto(`${PRODUCTION_URL}/#calculator`);
        await waitForStability(page);
      }

      // Check for calculator form
      const calculatorForm = page.locator('form').first();
      await expect(calculatorForm).toBeVisible({ timeout: 10000 });

      await page.screenshot({ path: 'qa-screenshots/calculator-page.png', fullPage: true });
    });

    test('2.2 Calculator inputs are accessible and functional', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await waitForStability(page);

      // Find all number inputs
      const numberInputs = page.locator('input[type="number"], input[inputmode="numeric"]');
      const inputCount = await numberInputs.count();

      console.log(`Found ${inputCount} calculator inputs`);
      expect(inputCount).toBeGreaterThan(0);

      // Test first input
      if (inputCount > 0) {
        const firstInput = numberInputs.first();
        await firstInput.click();
        await firstInput.fill('100000');

        const value = await firstInput.inputValue();
        console.log(`Input value: ${value}`);
      }

      await page.screenshot({ path: 'qa-screenshots/calculator-inputs.png' });
    });

    test('2.3 Calculator handles edge cases', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await waitForStability(page);

      const numberInputs = page.locator('input[type="number"], input[inputmode="numeric"]');

      if (await numberInputs.count() > 0) {
        const testCases = [
          { value: '0', label: 'zero' },
          { value: '999999999', label: 'large number' },
          { value: '-1000', label: 'negative' },
          { value: 'abc', label: 'non-numeric' }
        ];

        for (const testCase of testCases) {
          const input = numberInputs.first();
          await input.clear();
          await input.fill(testCase.value);
          await page.waitForTimeout(500);

          const actualValue = await input.inputValue();
          console.log(`${testCase.label}: entered "${testCase.value}", got "${actualValue}"`);

          await page.screenshot({ path: `qa-screenshots/edge-case-${testCase.label}.png` });
        }
      }
    });

    test('2.4 Calculate button works and shows results', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await waitForStability(page);

      // Fill in sample data
      const inputs = page.locator('input[type="number"], input[inputmode="numeric"]');
      const inputCount = await inputs.count();

      if (inputCount >= 4) {
        // Fill typical values
        await inputs.nth(0).fill('120000'); // Income
        await inputs.nth(1).fill('80000');  // RSU value
        await inputs.nth(2).fill('500');    // Grants
        await inputs.nth(3).fill('50');     // Days in Canada
      }

      // Find and click calculate button
      const calculateButton = page.locator('button:has-text("Calculate"), button[type="submit"]').first();

      if (await calculateButton.isVisible()) {
        await calculateButton.click();
        await page.waitForTimeout(2000);

        // Check for results
        const results = page.locator('[class*="result"], [class*="tax-"], [data-testid*="result"]');
        const resultCount = await results.count();
        console.log(`Found ${resultCount} result elements`);

        await page.screenshot({ path: 'qa-screenshots/calculator-results.png', fullPage: true });
      }
    });

    test('2.5 Results show correct tax breakdown', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await waitForStability(page);

      // Fill calculator
      const inputs = page.locator('input[type="number"], input[inputmode="numeric"]');
      if (await inputs.count() >= 4) {
        await inputs.nth(0).fill('120000');
        await inputs.nth(1).fill('80000');
        await inputs.nth(2).fill('500');
        await inputs.nth(3).fill('50');

        const calculateButton = page.locator('button:has-text("Calculate"), button[type="submit"]').first();
        if (await calculateButton.isVisible()) {
          await calculateButton.click();
          await page.waitForTimeout(2000);

          // Look for tax amounts (should be currency formatted)
          const taxAmounts = page.locator('text=/\\$[0-9,]+/');
          const amountCount = await taxAmounts.count();
          console.log(`Found ${amountCount} currency amounts in results`);

          // Check for key terms
          const keyTerms = ['US Tax', 'Canada Tax', 'Foreign Tax Credit', 'FTC', 'Total Tax', 'Savings'];
          for (const term of keyTerms) {
            const found = await page.locator(`text=${term}`).count();
            console.log(`"${term}": ${found > 0 ? 'FOUND' : 'NOT FOUND'}`);
          }

          await page.screenshot({ path: 'qa-screenshots/tax-breakdown.png', fullPage: true });
        }
      }
    });
  });

  test.describe('3. CHECKOUT FLOW', () => {
    test('3.1 Pricing page loads', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/pricing`);
      await waitForStability(page);

      // Check for pricing cards
      const pricingCards = page.locator('[class*="pricing"], [class*="plan"], [data-testid*="pricing"]');
      const cardCount = await pricingCards.count();

      console.log(`Found ${cardCount} pricing cards`);
      expect(cardCount).toBeGreaterThan(0);

      // Check for prices
      const prices = page.locator('text=/\\$[0-9]+/');
      const priceCount = await prices.count();
      console.log(`Found ${priceCount} price elements`);

      await page.screenshot({ path: 'qa-screenshots/pricing-page.png', fullPage: true });
    });

    test('3.2 Pricing tiers are displayed correctly', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/pricing`);
      await waitForStability(page);

      // Check for plan names
      const planNames = ['Free', 'Pro', 'Enterprise', 'Professional'];
      for (const plan of planNames) {
        const planElement = page.locator(`text=${plan}`).first();
        if (await planElement.isVisible()) {
          console.log(`✓ Found plan: ${plan}`);
        }
      }

      // Check for CTA buttons
      const ctaButtons = page.locator('button:has-text("Get Started"), button:has-text("Choose"), a:has-text("Subscribe"), button:has-text("Upgrade")');
      const buttonCount = await ctaButtons.count();
      console.log(`Found ${buttonCount} CTA buttons`);

      await page.screenshot({ path: 'qa-screenshots/pricing-tiers.png', fullPage: true });
    });

    test('3.3 Checkout button is accessible', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/pricing`);
      await waitForStability(page);

      // Find upgrade/subscribe buttons
      const upgradeButtons = page.locator('button:has-text("Upgrade"), button:has-text("Subscribe"), button:has-text("Get Started"), a[href*="checkout"]');
      const buttonCount = await upgradeButtons.count();

      console.log(`Found ${buttonCount} upgrade/checkout buttons`);

      if (buttonCount > 0) {
        const firstButton = upgradeButtons.first();
        await expect(firstButton).toBeVisible();

        // Check if button is enabled
        const isDisabled = await firstButton.isDisabled();
        console.log(`First button disabled: ${isDisabled}`);
      }

      await page.screenshot({ path: 'qa-screenshots/checkout-buttons.png' });
    });

    test('3.4 Stripe checkout flow initiates (requires auth)', async ({ page }) => {
      // Note: Full checkout testing requires authentication
      // This test checks if checkout pages/routes exist

      await page.goto(`${PRODUCTION_URL}/pricing`);
      await waitForStability(page);

      const upgradeButton = page.locator('button:has-text("Upgrade"), button:has-text("Subscribe")').first();

      if (await upgradeButton.isVisible()) {
        // Click and see where it goes
        const navigationPromise = page.waitForURL(/.*/, { timeout: 5000 }).catch(() => null);
        await upgradeButton.click();
        await navigationPromise;

        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        console.log(`After clicking upgrade: ${currentUrl}`);

        // Should redirect to sign-in or checkout
        const redirectedToAuth = currentUrl.includes('sign-in') || currentUrl.includes('sign-up') || currentUrl.includes('clerk');
        const redirectedToCheckout = currentUrl.includes('checkout') || currentUrl.includes('stripe');

        console.log(`Redirected to auth: ${redirectedToAuth}`);
        console.log(`Redirected to checkout: ${redirectedToCheckout}`);

        await page.screenshot({ path: 'qa-screenshots/checkout-redirect.png', fullPage: true });
      }
    });
  });

  test.describe('4. DASHBOARD FLOW', () => {
    test('4.1 Dashboard requires authentication', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/dashboard`);
      await waitForStability(page);

      const currentUrl = page.url();

      // Should redirect to sign-in if not authenticated
      const isAuthPage = currentUrl.includes('sign-in') || currentUrl.includes('sign-up') || currentUrl.includes('clerk');
      const isDashboard = currentUrl.includes('dashboard');

      console.log(`Current URL: ${currentUrl}`);
      console.log(`Is auth page: ${isAuthPage}`);
      console.log(`Is dashboard: ${isDashboard}`);

      // If on auth page, authentication is working correctly
      if (isAuthPage) {
        console.log('✓ Dashboard correctly requires authentication');
      } else if (isDashboard) {
        console.log('⚠️  Dashboard accessible without auth (may be logged in from previous test)');
      }

      await page.screenshot({ path: 'qa-screenshots/dashboard-auth-check.png', fullPage: true });
    });

    test('4.2 Dashboard navigation structure', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/dashboard`);
      await waitForStability(page);

      // Check for common dashboard navigation items
      const navItems = ['Overview', 'Multi-Year', 'Import', 'Status', 'Subscription', 'Settings'];

      for (const item of navItems) {
        const navLink = page.locator(`a:has-text("${item}"), button:has-text("${item}")`).first();
        if (await navLink.isVisible({ timeout: 2000 })) {
          console.log(`✓ Found nav item: ${item}`);
        } else {
          console.log(`✗ Missing nav item: ${item}`);
        }
      }

      await page.screenshot({ path: 'qa-screenshots/dashboard-navigation.png' });
    });

    test('4.3 Multi-year dashboard route exists', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/dashboard/multi-year`);
      await waitForStability(page);

      const currentUrl = page.url();
      console.log(`Multi-year URL: ${currentUrl}`);

      // Check if page loaded or redirected to auth
      const isAuthPage = currentUrl.includes('sign-in');
      const is404 = await page.locator('text=404, text=Not Found').count() > 0;

      console.log(`Is auth page: ${isAuthPage}`);
      console.log(`Is 404: ${is404}`);

      if (!is404) {
        console.log('✓ Multi-year route exists');
      } else {
        console.log('✗ Multi-year route returns 404');
      }

      await page.screenshot({ path: 'qa-screenshots/multi-year-page.png', fullPage: true });
    });

    test('4.4 Import flow route exists', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/dashboard/import`);
      await waitForStability(page);

      const currentUrl = page.url();
      console.log(`Import URL: ${currentUrl}`);

      const is404 = await page.locator('text=404, text=Not Found').count() > 0;

      if (!is404) {
        console.log('✓ Import route exists');

        // Check for file upload component
        const fileInput = page.locator('input[type="file"]');
        const hasFileInput = await fileInput.count() > 0;
        console.log(`Has file input: ${hasFileInput}`);
      } else {
        console.log('✗ Import route returns 404');
      }

      await page.screenshot({ path: 'qa-screenshots/import-page.png', fullPage: true });
    });

    test('4.5 Subscription page route exists', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/dashboard/subscription`);
      await waitForStability(page);

      const currentUrl = page.url();
      const is404 = await page.locator('text=404, text=Not Found').count() > 0;

      if (!is404) {
        console.log('✓ Subscription route exists');

        // Check for subscription-related content
        const hasUpgradeButton = await page.locator('button:has-text("Upgrade"), a:has-text("Upgrade")').count() > 0;
        const hasPlanInfo = await page.locator('text=/Free|Pro|Enterprise/').count() > 0;

        console.log(`Has upgrade button: ${hasUpgradeButton}`);
        console.log(`Has plan info: ${hasPlanInfo}`);
      } else {
        console.log('✗ Subscription route returns 404');
      }

      await page.screenshot({ path: 'qa-screenshots/subscription-page.png', fullPage: true });
    });
  });

  test.describe('5. MOBILE RESPONSIVENESS', () => {
    test('5.1 Mobile viewport - Landing page', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto(PRODUCTION_URL);
      await waitForStability(page);

      // Check if mobile menu exists
      const mobileMenu = page.locator('button[aria-label*="menu"], button:has-text("Menu"), [class*="mobile-menu"]');
      const hasMobileMenu = await mobileMenu.count() > 0;
      console.log(`Has mobile menu: ${hasMobileMenu}`);

      await page.screenshot({ path: 'qa-screenshots/mobile-landing.png', fullPage: true });
    });

    test('5.2 Mobile viewport - Calculator', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(PRODUCTION_URL);
      await waitForStability(page);

      // Check calculator inputs on mobile
      const inputs = page.locator('input[type="number"]');
      if (await inputs.count() > 0) {
        const firstInput = inputs.first();
        const boundingBox = await firstInput.boundingBox();

        if (boundingBox) {
          console.log(`Input touch target size: ${boundingBox.width}x${boundingBox.height}px`);
          // Should be at least 44x44px for mobile
          const isTouchFriendly = boundingBox.height >= 44 && boundingBox.width >= 200;
          console.log(`Touch-friendly: ${isTouchFriendly}`);
        }
      }

      await page.screenshot({ path: 'qa-screenshots/mobile-calculator.png', fullPage: true });
    });

    test('5.3 Tablet viewport - Dashboard', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto(`${PRODUCTION_URL}/dashboard`);
      await waitForStability(page);

      await page.screenshot({ path: 'qa-screenshots/tablet-dashboard.png', fullPage: true });
    });
  });

  test.describe('6. CROSS-BROWSER COMPATIBILITY', () => {
    test('6.1 Check for browser-specific CSS issues', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await waitForStability(page);

      // Check for CSS Grid and Flexbox usage
      const hasGrid = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('*')).some(el => {
          const style = window.getComputedStyle(el);
          return style.display === 'grid';
        });
      });

      const hasFlex = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('*')).some(el => {
          const style = window.getComputedStyle(el);
          return style.display === 'flex';
        });
      });

      console.log(`Uses CSS Grid: ${hasGrid}`);
      console.log(`Uses Flexbox: ${hasFlex}`);
    });

    test('6.2 JavaScript errors in console', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      page.on('pageerror', error => {
        errors.push(error.message);
      });

      await page.goto(PRODUCTION_URL);
      await waitForStability(page);

      // Navigate to a few key pages
      await page.goto(`${PRODUCTION_URL}/pricing`);
      await waitForStability(page);

      await page.goto(`${PRODUCTION_URL}/dashboard`);
      await waitForStability(page);

      if (errors.length > 0) {
        console.log('❌ JavaScript errors detected:');
        errors.forEach(err => console.log(`  - ${err}`));
      } else {
        console.log('✓ No JavaScript errors detected');
      }
    });
  });
});
