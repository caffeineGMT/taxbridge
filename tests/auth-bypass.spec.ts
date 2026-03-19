/**
 * Quick Test - Verify Auth Bypass Works
 *
 * This test verifies that the PLAYWRIGHT_TEST_MODE environment variable
 * properly bypasses Clerk authentication in middleware.
 */

import { test, expect } from '@playwright/test';

test.describe('Auth Bypass Verification', () => {
  test('can access protected route /enterprise/calculator', async ({ page }) => {
    // Navigate to protected route
    await page.goto('/enterprise/calculator');

    // Should NOT redirect to sign-in
    expect(page.url()).not.toContain('/sign-in');
    expect(page.url()).not.toContain('/sign-up');

    // Should show the ROI Calculator
    await expect(page.locator('text=ROI Calculator')).toBeVisible({ timeout: 10000 });

    console.log('✅ Auth bypass working - can access protected route');
  });

  test('can access protected route /dashboard', async ({ page }) => {
    // Navigate to another protected route
    await page.goto('/dashboard');

    // Should NOT redirect to sign-in
    expect(page.url()).not.toContain('/sign-in');
    expect(page.url()).not.toContain('/sign-up');

    console.log('✅ Auth bypass working - can access dashboard');
  });
});
