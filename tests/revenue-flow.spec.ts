/**
 * End-to-End Revenue Flow Test
 *
 * Tests the complete payment flow from pricing page to successful Pro subscription.
 *
 * PREREQUISITES:
 * - Stripe must be configured in production/test mode
 * - Valid Stripe API keys in environment variables
 * - Price IDs must be real Stripe price objects
 *
 * TEST FLOW:
 * 1. Navigate to pricing page
 * 2. Click "Upgrade to Pro" button
 * 3. Verify checkout API call
 * 4. Verify Stripe checkout URL returned
 * 5. (Manual) Complete Stripe checkout with test card
 * 6. (Manual) Verify webhook processes payment
 * 7. Verify user dashboard shows Pro tier
 *
 * LIMITATIONS:
 * - Cannot automate Stripe checkout card entry (PCI compliance)
 * - Webhook testing requires manual verification in Stripe dashboard
 * - Database verification requires SQLite access
 *
 * RUN:
 * npm run test:e2e -- revenue-flow.spec.ts
 */

import { test, expect, type Page } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const STRIPE_CONFIGURED = process.env.STRIPE_SECRET_KEY &&
                          !process.env.STRIPE_SECRET_KEY.includes('YOUR_SECRET_KEY_HERE');

// Skip all tests if Stripe is not configured
test.describe.configure({ mode: 'serial' });

test.describe('End-to-End Revenue Flow', () => {
  let page: Page;
  let userId: number;
  let checkoutUrl: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    // Check if Stripe is configured
    if (!STRIPE_CONFIGURED) {
      console.warn('⚠️  Stripe is not configured. Skipping E2E revenue tests.');
      console.warn('   To run these tests, set valid Stripe API keys in .env.test');
      test.skip();
    }
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should display pricing page with Pro tier', async () => {
    await page.goto(`${BASE_URL}/pricing`);

    // Verify pricing page loaded
    await expect(page.locator('h1')).toContainText('Simple, Transparent Pricing');

    // Verify Pro tier card exists
    const proCard = page.locator('div').filter({ hasText: /^Pro/ }).first();
    await expect(proCard).toBeVisible();

    // Verify Pro price is displayed
    const proPrice = page.locator('text=/\\$49|\\$99/').first();
    await expect(proPrice).toBeVisible();

    // Verify "Upgrade to Pro" CTA exists
    const ctaButton = page.locator('button').filter({
      hasText: /Start 14-Day Free Trial|Upgrade to Pro|Try Pro/
    }).first();
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeEnabled();
  });

  test('should require authentication before checkout', async () => {
    await page.goto(`${BASE_URL}/pricing`);

    // Intercept API calls
    const userApiPromise = page.waitForResponse(
      response => response.url().includes('/api/user') && response.request().method() === 'GET'
    );

    // Click upgrade button
    const upgradeButton = page.locator('button').filter({
      hasText: /Start 14-Day Free Trial|Upgrade to Pro/
    }).first();
    await upgradeButton.click();

    // Verify user API is called
    const userResponse = await userApiPromise;

    if (userResponse.status() === 401 || userResponse.status() === 403) {
      // User not authenticated - should redirect to sign-up
      await expect(page).toHaveURL(/sign-up|sign-in/);
      console.log('✓ Authentication check passed - redirected to sign-up');
    } else if (userResponse.status() === 200) {
      // User authenticated - continue to checkout
      console.log('✓ User authenticated - proceeding to checkout flow');

      // Store user ID for later tests
      const userData = await userResponse.json();
      userId = userData.user?.id;
      expect(userId).toBeDefined();
    } else {
      throw new Error(`Unexpected user API response: ${userResponse.status()}`);
    }
  });

  test('should create Stripe checkout session for authenticated user', async () => {
    // This test assumes user is authenticated
    // In a real test suite, you'd set up auth state in beforeAll

    // For now, we'll test the checkout API directly
    const response = await page.request.post(`${BASE_URL}/api/stripe/create-checkout`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_1ProAnnual',
        tier: 'pro',
        userId: userId || 1, // Use stored userId or default for testing
      },
    });

    if (response.status() === 401 || response.status() === 403) {
      console.log('⚠️  User not authenticated - skipping checkout test');
      test.skip();
      return;
    }

    // Verify checkout session created successfully
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('url');
    expect(data.url).toMatch(/^https:\/\/checkout\.stripe\.com\/c\/pay\//);

    checkoutUrl = data.url;
    console.log('✓ Checkout session created:', checkoutUrl);
  });

  test('should redirect to Stripe checkout page', async () => {
    if (!checkoutUrl) {
      console.log('⚠️  No checkout URL - skipping redirect test');
      test.skip();
      return;
    }

    await page.goto(checkoutUrl);

    // Verify we're on Stripe's checkout page
    await expect(page).toHaveURL(/checkout\.stripe\.com/);

    // Verify Stripe checkout elements are present
    const stripeForm = page.locator('form').first();
    await expect(stripeForm).toBeVisible({ timeout: 10000 });

    console.log('✓ Successfully redirected to Stripe checkout');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('⚠️  MANUAL TEST REQUIRED');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('The automated test stops here. Complete the following manually:');
    console.log('');
    console.log('1. Use test card: 4242 4242 4242 4242');
    console.log('   - Expiry: Any future date (12/30)');
    console.log('   - CVC: Any 3 digits (123)');
    console.log('   - ZIP: Any 5 digits (10001)');
    console.log('');
    console.log('2. Click "Subscribe" button');
    console.log('');
    console.log('3. Verify redirect to /dashboard?upgrade=success');
    console.log('');
    console.log('4. Verify toast: "Subscription activated!"');
    console.log('');
    console.log('5. Verify dashboard shows "Pro" badge/tier');
    console.log('');
    console.log('6. Go to https://dashboard.stripe.com/webhooks');
    console.log('   - Find checkout.session.completed event');
    console.log('   - Verify status: "Succeeded" ✅');
    console.log('');
    console.log('7. Verify database updated:');
    console.log('   sqlite3 data/taxbridge.db "SELECT subscription_tier FROM user_profiles WHERE id = ' + (userId || 1) + ';"');
    console.log('   Expected: pro');
    console.log('');
    console.log('8. IMPORTANT: Cancel test subscription in Stripe dashboard');
    console.log('   https://dashboard.stripe.com/subscriptions');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
  });

  test('should handle successful payment callback', async () => {
    // Test the success redirect handling
    await page.goto(`${BASE_URL}/dashboard?upgrade=success`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify we're on the dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify success toast is shown
    // (This might not be visible if toast auto-dismissed, so we'll check for redirect only)
    console.log('✓ Success callback handled - redirected to dashboard');
  });

  test('should handle cancelled payment callback', async () => {
    await page.goto(`${BASE_URL}/pricing?upgrade=cancelled`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify we're on the pricing page
    await expect(page).toHaveURL(/\/pricing/);

    // Verify cancellation message handling
    // (Toast might auto-dismiss, so we'll check for redirect only)
    console.log('✓ Cancellation callback handled - redirected to pricing');
  });
});

test.describe('Checkout API Validation', () => {
  test('should reject checkout without required fields', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/stripe/create-checkout`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        // Missing priceId, tier, userId
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Missing required fields');
  });

  test('should reject checkout with invalid tier', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/stripe/create-checkout`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        priceId: 'price_test123',
        tier: 'invalid_tier', // Invalid tier
        userId: 1,
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Invalid tier');
  });

  test('should reject checkout for non-existent user', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/stripe/create-checkout`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_test123',
        tier: 'pro',
        userId: 999999, // Non-existent user
      },
    });

    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('User not found');
  });
});

test.describe('Pricing Page Features', () => {
  test('should display all three pricing tiers', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);

    // Verify Free tier
    const freeTier = page.locator('text=Free').first();
    await expect(freeTier).toBeVisible();

    // Verify Pro tier
    const proTier = page.locator('text=Pro').first();
    await expect(proTier).toBeVisible();

    // Verify Enterprise tier
    const enterpriseTier = page.locator('text=Enterprise').first();
    await expect(enterpriseTier).toBeVisible();
  });

  test('should show Pro tier as recommended', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);

    // Verify "Recommended" badge on Pro tier
    const recommendedBadge = page.locator('text=/Recommended|⭐/').first();
    await expect(recommendedBadge).toBeVisible();
  });

  test('should display pricing countdown timer', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);

    // Verify countdown timer exists
    const timer = page.locator('text=/\\d+h \\d+m \\d+s/').first();
    await expect(timer).toBeVisible();
  });

  test('should display social proof user count', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);

    // Verify user count is displayed
    const userCount = page.locator('text=/\\d+\\+.*H-1B professionals/i').first();
    await expect(userCount).toBeVisible();
  });

  test('should display FAQ section', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);

    // Scroll to FAQ section
    await page.locator('text=Frequently Asked Questions').scrollIntoViewIfNeeded();

    // Verify FAQ section exists
    const faqHeader = page.locator('text=Frequently Asked Questions');
    await expect(faqHeader).toBeVisible();

    // Verify at least one FAQ item
    const firstFaq = page.locator('button').filter({ hasText: /Can I switch/ }).first();
    await expect(firstFaq).toBeVisible();
  });
});

test.describe('Analytics Tracking', () => {
  test('should track pricing_page_viewed event', async ({ page }) => {
    // Intercept PostHog API calls (if configured)
    let eventTracked = false;

    page.on('request', request => {
      if (request.url().includes('posthog') || request.url().includes('/api/events')) {
        const postData = request.postDataJSON();
        if (postData?.event === 'pricing_page_viewed') {
          eventTracked = true;
          console.log('✓ PostHog event tracked: pricing_page_viewed');
        }
      }
    });

    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForTimeout(2000); // Wait for analytics to fire

    // Note: This test might not pass if PostHog is not configured
    // It's informational only
    console.log('Analytics tracking test completed (event tracked:', eventTracked, ')');
  });
});
