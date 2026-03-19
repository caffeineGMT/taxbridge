import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/cross-browser',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  // Run auth setup before all tests
  globalSetup: require.resolve('./tests/global-setup.ts'),

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Use authenticated state for all tests
    storageState: '.playwright/.auth/user.json',
  },

  // Auto-start dev server for E2E tests
  webServer: {
    command: 'NODE_ENV=test npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes for server to start
    stdout: 'pipe', // Capture stdout to detect "ready" message
    stderr: 'pipe', // Capture stderr for debugging
    env: {
      // Load test environment variables
      PLAYWRIGHT_TEST_MODE: 'true',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_PLAYWRIGHT',
      CLERK_SECRET_KEY: 'sk_test_PLAYWRIGHT',
      SENTRY_DSN: '',
      NEXT_PUBLIC_SENTRY_DSN: '',
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'edge',
      use: { ...devices['Desktop Edge'] },
    },
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
