/**
 * Playwright Authentication Setup
 *
 * This file configures authentication for E2E tests by mocking Clerk session.
 * Tests run with a fake authenticated user to access protected routes.
 */

import { test as setup } from '@playwright/test';

const authFile = '.playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // For Playwright tests, we'll bypass Clerk authentication by setting up
  // a mock session cookie. This allows tests to access protected routes.

  // Navigate to a public page first
  await page.goto('/');

  // Set a mock Clerk session cookie for testing
  // In test environment, middleware will recognize this
  await page.context().addCookies([
    {
      name: '__clerk_db_jwt',
      value: 'PLAYWRIGHT_TEST_TOKEN',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  // Save signed-in state to reuse across tests
  await page.context().storageState({ path: authFile });
});
