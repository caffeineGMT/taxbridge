import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for cross-browser regression testing on PRODUCTION
 * Tests taxbridgecpa.com across Chrome, Firefox, Safari, Edge, and mobile
 */
export default defineConfig({
  testDir: './tests/cross-browser',
  fullyParallel: true,
  forbidOnly: true,
  retries: 2, // Retry flaky tests
  workers: 4, // Run 4 browsers in parallel
  reporter: [
    ['html', { outputFolder: 'test-results/cross-browser-html' }],
    ['json', { outputFile: 'test-results/cross-browser-results.json' }],
    ['list']
  ],

  use: {
    baseURL: 'https://taxbridgecpa.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30000, // 30s per action
  },

  // Test timeout
  timeout: 60000, // 1 minute total per test

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
      },
    },
    {
      name: 'mobile-safari-landscape',
      use: {
        ...devices['iPhone 13 landscape'],
      },
    },

    // Tablet
    {
      name: 'tablet-ipad',
      use: {
        ...devices['iPad Pro'],
      },
    },
  ],
});
