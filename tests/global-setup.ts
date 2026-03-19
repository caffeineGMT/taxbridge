/**
 * Playwright Global Setup
 *
 * Runs once before all tests to set up the test environment.
 * Creates authenticated session state for protected routes.
 */

import { chromium, FullConfig } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';
import { waitForServer } from './utils/wait-for-server';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const serverUrl = baseURL || 'http://localhost:3000';
  const authFile = '.playwright/.auth/user.json';

  console.log('🔧 Waiting for dev server to be ready...');

  // Wait for the server to be ready before proceeding
  await waitForServer({
    url: serverUrl,
    timeout: 120000, // 2 minutes
    retryInterval: 500, // Check every 500ms
  });

  // Ensure auth directory exists
  await mkdir(dirname(authFile), { recursive: true });

  // Create a browser instance
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to a public page
    await page.goto(serverUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Set environment variable to bypass auth in test mode
    process.env.PLAYWRIGHT_TEST_MODE = 'true';

    // Set mock authentication cookies
    await context.addCookies([
      {
        name: '__session',
        value: 'PLAYWRIGHT_TEST_SESSION',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    // Save authenticated state
    await context.storageState({ path: authFile });

    console.log('✅ Playwright auth setup complete');
  } catch (error) {
    console.error('❌ Playwright auth setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
