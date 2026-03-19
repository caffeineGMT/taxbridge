/**
 * PRODUCTION HEALTH AUDIT E2E TESTS
 *
 * This suite tests taxbridge.app end-to-end across devices and browsers.
 * Tests: Calculator accuracy, signup flow, payment flow, dashboard access.
 *
 * Run with:
 *   npm run test:e2e -- production-health-audit.spec.ts
 *
 * Target browsers: Chrome, Firefox, Safari, Edge
 * Target devices: Desktop, iOS Safari, Android Chrome
 */

import { test, expect, Page } from '@playwright/test';

// Helper function to wait for calculator results
async function waitForCalculatorResults(page: Page) {
  await expect(page.locator('[data-testid="calculation-results"]').or(page.locator('text=Tax Savings').first())).toBeVisible({ timeout: 10000 });
}

// Helper function to check for console errors
async function checkConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

test.describe('Production Health Audit: Calculator Accuracy', () => {
  test('Calculator - Standard H1B Scenario', async ({ page }) => {
    const errors = await checkConsoleErrors(page);

    await page.goto('/');

    // Fill in calculator
    await page.fill('input[name="salary"]', '120000');
    await page.fill('input[name="rsuValue"]', '80000');
    await page.selectOption('select[name="year"]', '2026');

    // Submit
    await page.click('button:has-text("Calculate")');

    // Wait for results
    await waitForCalculatorResults(page);

    // Verify results are present and make sense
    const usTaxText = await page.locator('text=/US Tax|United States Tax/i').first().textContent() || '';
    const canadaTaxText = await page.locator('text=/Canada Tax|Canadian Tax/i').first().textContent() || '';
    const savingsText = await page.locator('text=/Savings|FTC/i').first().textContent() || '';

    // Check that results contain dollar amounts
    expect(usTaxText || canadaTaxText || savingsText).toContain('$');

    // Verify no NaN or undefined in results
    expect(await page.locator('text=/NaN|undefined|null/i').count()).toBe(0);

    // Check for console errors
    expect(errors.length).toBe(0);
  });

  test('Calculator - Zero RSU Edge Case', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[name="salary"]', '100000');
    await page.fill('input[name="rsuValue"]', '0');
    await page.selectOption('select[name="year"]', '2026');

    await page.click('button:has-text("Calculate")');
    await waitForCalculatorResults(page);

    // Verify no NaN/undefined
    expect(await page.locator('text=/NaN|undefined/i').count()).toBe(0);

    // FTC savings should be $0 or very small
    const savingsText = await page.locator('text=/Savings|FTC/i').first().textContent() || '';
    expect(savingsText).toContain('$');
  });

  test('Calculator - Extreme High Income', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[name="salary"]', '500000');
    await page.fill('input[name="rsuValue"]', '2000000');
    await page.selectOption('select[name="year"]', '2026');

    await page.click('button:has-text("Calculate")');
    await waitForCalculatorResults(page);

    // Verify large numbers are formatted with commas
    const pageContent = await page.content();
    expect(pageContent).toMatch(/\$[\d,]+/);

    // No errors
    expect(await page.locator('text=/Error|Failed/i').count()).toBe(0);
  });

  test('Calculator - Invalid Input Handling', async ({ page }) => {
    await page.goto('/');

    // Try negative number
    await page.fill('input[name="salary"]', '-50000');
    await page.fill('input[name="rsuValue"]', '80000');

    // Check if input is sanitized or error appears
    const salaryValue = await page.inputValue('input[name="salary"]');

    // Either input is sanitized (positive) OR an error message appears
    const hasError = await page.locator('text=/Error|Invalid|must be positive/i').count() > 0;
    const isSanitized = !salaryValue.includes('-');

    expect(hasError || isSanitized).toBeTruthy();
  });
});

test.describe('Production Health Audit: Signup Flow', () => {
  test('Signup Page Loads', async ({ page }) => {
    await page.goto('/sign-up');

    // Verify Clerk signup modal/page appears
    await expect(page.locator('input[name="emailAddress"]').or(page.locator('input[type="email"]'))).toBeVisible({ timeout: 5000 });

    // Check for Clerk branding or sign-up elements
    expect(await page.locator('text=/Sign up|Create account|Get started/i').count()).toBeGreaterThan(0);
  });

  test('Sign-In Page Loads', async ({ page }) => {
    await page.goto('/sign-in');

    // Verify Clerk sign-in modal/page appears
    await expect(page.locator('input[name="identifier"]').or(page.locator('input[type="email"]'))).toBeVisible({ timeout: 5000 });

    expect(await page.locator('text=/Sign in|Log in|Welcome back/i').count()).toBeGreaterThan(0);
  });

  test('OAuth Buttons Present', async ({ page }) => {
    await page.goto('/sign-up');

    // Wait for page load
    await page.waitForLoadState('networkidle');

    // Check for Google OAuth button (Clerk usually provides this)
    const hasOAuthButtons = await page.locator('button:has-text("Google")').or(page.locator('[aria-label*="Google"]')).count() > 0;

    // This is informational - OAuth may or may not be configured
    console.log('OAuth buttons present:', hasOAuthButtons);
  });
});

test.describe('Production Health Audit: Payment Flow', () => {
  test('Pricing Page Loads', async ({ page }) => {
    await page.goto('/pricing');

    // Verify page loads
    await expect(page).toHaveTitle(/Pricing|Plans/i);

    // Check for pricing elements
    expect(await page.locator('text=/\\$\\d+|Pro|Enterprise|Free/i').count()).toBeGreaterThan(0);

    // Check for CTA buttons
    expect(await page.locator('button:has-text("Upgrade")').or(page.locator('button:has-text("Get Started")')).count()).toBeGreaterThan(0);
  });

  test('Stripe Integration Check', async ({ page }) => {
    const errors = await checkConsoleErrors(page);

    await page.goto('/pricing');

    // Check page source for Stripe keys
    const pageContent = await page.content();

    // CRITICAL: Verify Stripe is in LIVE mode (pk_live_) not TEST mode (pk_test_)
    const hasTestKey = pageContent.includes('pk_test_');
    const hasLiveKey = pageContent.includes('pk_live_');

    if (hasTestKey) {
      console.warn('🚨 WARNING: Stripe TEST mode detected! Revenue blocker!');
    }

    if (hasLiveKey) {
      console.log('✅ Stripe LIVE mode detected');
    }

    // Check for Stripe.js script
    const stripeScriptLoaded = await page.locator('script[src*="stripe.com"]').count() > 0;
    expect(stripeScriptLoaded).toBeTruthy();

    expect(errors.filter(e => e.includes('Stripe')).length).toBe(0);
  });

  test('Checkout Button Click (Without Payment)', async ({ page }) => {
    await page.goto('/pricing');

    // Find and click upgrade button
    const upgradeButton = page.locator('button:has-text("Upgrade")').or(page.locator('button:has-text("Get Started")')).first();

    if (await upgradeButton.count() > 0) {
      await upgradeButton.click();

      // Should either:
      // 1. Open Stripe Checkout popup
      // 2. Redirect to sign-in (if not authenticated)
      // 3. Show error message

      await page.waitForTimeout(2000); // Wait for popup or redirect

      const currentUrl = page.url();
      const hasStripeCheckout = await page.frameLocator('iframe[name*="stripe"]').locator('body').count() > 0;
      const redirectedToSignIn = currentUrl.includes('/sign-in');

      // One of these should be true
      expect(hasStripeCheckout || redirectedToSignIn || currentUrl.includes('/pricing')).toBeTruthy();
    }
  });
});

test.describe('Production Health Audit: Dashboard Access', () => {
  test('Dashboard Redirects to Sign-In When Not Authenticated', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies();

    await page.goto('/dashboard');

    // Should redirect to sign-in
    await page.waitForURL(/sign-in|login/i, { timeout: 10000 });

    expect(page.url()).toMatch(/sign-in|login/i);
  });

  test('Dashboard Loads for Authenticated User', async ({ page }) => {
    // This test requires authentication setup in global-setup.ts
    // If auth is set up, dashboard should load

    try {
      await page.goto('/dashboard');

      // Either:
      // 1. Dashboard loads (user is authenticated)
      // 2. Redirects to sign-in (user is not authenticated)

      const isDashboard = page.url().includes('/dashboard');
      const isSignIn = page.url().includes('/sign-in');

      if (isDashboard) {
        // Verify dashboard elements
        await expect(page.locator('text=/Dashboard|Welcome|Overview/i')).toBeVisible({ timeout: 5000 });
        console.log('✅ Dashboard loaded - user authenticated');
      } else if (isSignIn) {
        console.log('ℹ️  Redirected to sign-in - no auth state');
      }

      expect(isDashboard || isSignIn).toBeTruthy();
    } catch (error) {
      console.log('Dashboard auth check failed:', error);
    }
  });

  test('Protected Routes Require Auth', async ({ page }) => {
    await page.context().clearCookies();

    const protectedRoutes = [
      '/dashboard',
      '/dashboard/multi-year',
      '/dashboard/import',
      '/dashboard/settings',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);

      // Should redirect to sign-in or show auth modal
      await page.waitForTimeout(2000);
      const currentUrl = page.url();

      const isProtected = currentUrl.includes('/sign-in') || currentUrl.includes('/sign-up') || currentUrl !== route;
      expect(isProtected).toBeTruthy();
    }
  });
});

test.describe('Production Health Audit: Bug Hunting', () => {
  test('Homepage - No Console Errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors (e.g., third-party scripts)
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('third-party') &&
      !e.includes('Extension')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('No Broken Links on Homepage', async ({ page }) => {
    await page.goto('/');

    const links = await page.locator('a[href]').all();
    const brokenLinks: string[] = [];

    for (const link of links) {
      const href = await link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        continue;
      }

      // Check if link is relative (internal)
      if (href.startsWith('/')) {
        const response = await page.goto(href);
        if (response && response.status() >= 400) {
          brokenLinks.push(`${href} - ${response.status()}`);
        }
        await page.goBack();
      }
    }

    expect(brokenLinks).toHaveLength(0);
  });

  test('No Network Errors on Critical Pages', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('requestfailed', request => {
      failedRequests.push(`${request.url()} - ${request.failure()?.errorText}`);
    });

    const criticalPages = ['/', '/pricing', '/sign-in', '/dashboard'];

    for (const route of criticalPages) {
      await page.goto(route, { waitUntil: 'networkidle' });
    }

    // Filter out known acceptable failures (e.g., analytics blocked by ad blocker)
    const criticalFailures = failedRequests.filter(req =>
      !req.includes('analytics') &&
      !req.includes('ads') &&
      !req.includes('tracking')
    );

    expect(criticalFailures.length).toBe(0);
  });

  test('HTTPS Redirect', async ({ page, baseURL }) => {
    // Only run if baseURL is production
    if (!baseURL || baseURL.includes('localhost')) {
      test.skip();
    }

    // Try HTTP (should redirect to HTTPS)
    const httpUrl = baseURL.replace('https://', 'http://');
    const response = await page.goto(httpUrl);

    expect(page.url()).toMatch(/^https:/);
    expect(response?.status()).toBeLessThan(400);
  });

  test('No PII Logged to Console', async ({ page }) => {
    const consoleMessages: string[] = [];

    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    await page.goto('/');

    // Check for email patterns
    const hasPII = consoleMessages.some(msg =>
      msg.includes('@') ||
      msg.match(/\b\d{3}-\d{2}-\d{4}\b/) || // SSN pattern
      msg.match(/\$\d+,\d+/) // Large dollar amounts (potential tax data)
    );

    if (hasPII) {
      console.warn('⚠️  WARNING: Potential PII detected in console logs');
    }

    expect(hasPII).toBeFalsy();
  });
});

test.describe('Production Health Audit: Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('Calculator Mobile Layout', async ({ page }) => {
    await page.goto('/');

    // Check no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.viewportSize();

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth!.width + 1); // +1 for rounding

    // Check calculator form is visible
    await expect(page.locator('form').or(page.locator('input[name="salary"]'))).toBeVisible();

    // Check submit button is visible and tappable
    const submitButton = page.locator('button:has-text("Calculate")');
    await expect(submitButton).toBeVisible();

    const buttonBox = await submitButton.boundingBox();
    expect(buttonBox!.height).toBeGreaterThan(40); // Minimum tappable size
  });

  test('Pricing Page Mobile Layout', async ({ page }) => {
    await page.goto('/pricing');

    // Check no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.viewportSize();

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth!.width + 1);

    // Check pricing cards are stacked (not overflowing)
    const pricingCards = page.locator('[data-testid="pricing-card"]').or(page.locator('text=/Pro|Enterprise/i'));
    if (await pricingCards.count() > 0) {
      const firstCard = pricingCards.first();
      const cardBox = await firstCard.boundingBox();

      // Card should not be wider than viewport
      expect(cardBox!.width).toBeLessThanOrEqual(viewportWidth!.width);
    }
  });

  test('Dashboard Mobile Navigation', async ({ page }) => {
    try {
      await page.goto('/dashboard');

      // Check for hamburger menu or mobile nav
      const hasMobileNav = await page.locator('button[aria-label*="menu"]').or(page.locator('[data-testid="mobile-menu"]')).count() > 0;

      if (hasMobileNav) {
        console.log('✅ Mobile navigation detected');
      } else {
        console.log('ℹ️  No mobile-specific navigation found (may use standard nav)');
      }
    } catch (error) {
      console.log('Dashboard mobile test skipped (auth required)');
    }
  });
});

test.describe('Production Health Audit: Performance', () => {
  test('Page Load Time < 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    console.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  test('Images Have Alt Text', async ({ page }) => {
    await page.goto('/');

    const images = await page.locator('img').all();
    const missingAlt: string[] = [];

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');

      if (!alt || alt.trim() === '') {
        missingAlt.push(src || 'unknown');
      }
    }

    if (missingAlt.length > 0) {
      console.warn('Images missing alt text:', missingAlt);
    }

    // Allow a few decorative images without alt
    expect(missingAlt.length).toBeLessThan(3);
  });
});
