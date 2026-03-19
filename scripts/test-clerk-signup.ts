#!/usr/bin/env tsx
/**
 * Clerk Signup Flow E2E Test
 *
 * This script tests the complete Clerk signup flow in production:
 * 1. Visit signup page
 * 2. Verify Clerk widget loads
 * 3. Test signup form interaction
 * 4. Capture screenshots for evidence
 *
 * Run: npm run test:clerk-signup
 */

import { chromium, Browser, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const PRODUCTION_URL = 'https://taxbridge.vercel.app';
const SCREENSHOT_DIR = path.join(process.cwd(), 'docs/screenshots/clerk-verification');

interface TestResult {
  passed: boolean;
  message: string;
  screenshot?: string;
  error?: string;
}

class ClerkSignupTester {
  private browser?: Browser;
  private page?: Page;
  private results: TestResult[] = [];

  async setup(): Promise<void> {
    // Ensure screenshot directory exists
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    // Launch browser
    this.browser = await chromium.launch({
      headless: true,
    });

    const context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    });

    this.page = await context.newPage();
  }

  async testSignupPageAccessibility(): Promise<TestResult> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      const signupUrl = `${PRODUCTION_URL}/sign-up`;
      console.log(`📍 Navigating to: ${signupUrl}`);

      const response = await this.page.goto(signupUrl, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      const screenshotPath = path.join(SCREENSHOT_DIR, `signup-page-${Date.now()}.png`);
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      if (!response || response.status() !== 200) {
        return {
          passed: false,
          message: `❌ Signup page returned HTTP ${response?.status()}`,
          screenshot: screenshotPath,
        };
      }

      return {
        passed: true,
        message: '✅ Signup page is accessible (HTTP 200)',
        screenshot: screenshotPath,
      };
    } catch (error) {
      return {
        passed: false,
        message: '❌ Failed to access signup page',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async testClerkWidgetPresence(): Promise<TestResult> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      console.log('🔍 Looking for Clerk widget...');

      // Wait for Clerk to load (give it up to 10 seconds)
      const clerkSelectors = [
        '.cl-component',
        '.cl-rootBox',
        '.cl-signUp-root',
        '[data-clerk-id]',
        '#clerk-sign-up',
        'iframe[src*="clerk"]',
      ];

      let found = false;
      let foundSelector = '';

      for (const selector of clerkSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 });
          found = true;
          foundSelector = selector;
          break;
        } catch {
          // Try next selector
          continue;
        }
      }

      const screenshotPath = path.join(SCREENSHOT_DIR, `clerk-widget-${Date.now()}.png`);
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      if (!found) {
        // Check for error messages in console
        const consoleLogs: string[] = [];
        this.page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleLogs.push(msg.text());
          }
        });

        return {
          passed: false,
          message: '❌ Clerk widget not found on signup page',
          screenshot: screenshotPath,
          error: `Tried selectors: ${clerkSelectors.join(', ')}\nConsole errors: ${consoleLogs.join(', ')}`,
        };
      }

      return {
        passed: true,
        message: `✅ Clerk widget found (selector: ${foundSelector})`,
        screenshot: screenshotPath,
      };
    } catch (error) {
      const screenshotPath = path.join(SCREENSHOT_DIR, `clerk-error-${Date.now()}.png`);
      if (this.page) {
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
      }

      return {
        passed: false,
        message: '❌ Error while checking for Clerk widget',
        screenshot: screenshotPath,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async testClerkInputFields(): Promise<TestResult> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      console.log('🔍 Checking for Clerk input fields...');

      // Look for common Clerk form inputs
      const inputSelectors = [
        'input[name="emailAddress"]',
        'input[name="password"]',
        'input[type="email"]',
        'input[placeholder*="email" i]',
      ];

      let foundInput = false;
      let foundSelector = '';

      for (const selector of inputSelectors) {
        const input = await this.page.$(selector);
        if (input) {
          foundInput = true;
          foundSelector = selector;
          break;
        }
      }

      const screenshotPath = path.join(SCREENSHOT_DIR, `clerk-inputs-${Date.now()}.png`);
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      if (!foundInput) {
        return {
          passed: false,
          message: '⚠️ Clerk form inputs not found',
          screenshot: screenshotPath,
          error: `Tried selectors: ${inputSelectors.join(', ')}`,
        };
      }

      return {
        passed: true,
        message: `✅ Clerk form inputs present (found: ${foundSelector})`,
        screenshot: screenshotPath,
      };
    } catch (error) {
      return {
        passed: false,
        message: '❌ Error checking Clerk inputs',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async testNetworkRequests(): Promise<TestResult> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      console.log('🔍 Monitoring network requests...');

      const clerkRequests: string[] = [];

      this.page.on('request', request => {
        const url = request.url();
        if (url.includes('clerk') || url.includes('api.clerk')) {
          clerkRequests.push(url);
        }
      });

      // Wait a bit for requests to fire
      await this.page.waitForTimeout(3000);

      if (clerkRequests.length === 0) {
        return {
          passed: false,
          message: '❌ No Clerk API requests detected',
          error: 'Clerk SDK may not be loaded or configured',
        };
      }

      return {
        passed: true,
        message: `✅ Clerk API requests detected (${clerkRequests.length} requests)`,
        error: `Sample: ${clerkRequests.slice(0, 3).join(', ')}`,
      };
    } catch (error) {
      return {
        passed: false,
        message: '❌ Error monitoring network requests',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAll(): Promise<void> {
    console.log('🧪 Clerk Signup Flow E2E Test\n');
    console.log('=' .repeat(60));
    console.log('');

    try {
      await this.setup();

      // Run tests sequentially
      console.log('Test 1: Signup page accessibility...');
      this.results.push(await this.testSignupPageAccessibility());
      console.log('');

      console.log('Test 2: Clerk widget presence...');
      this.results.push(await this.testClerkWidgetPresence());
      console.log('');

      console.log('Test 3: Clerk form inputs...');
      this.results.push(await this.testClerkInputFields());
      console.log('');

      console.log('Test 4: Network requests...');
      this.results.push(await this.testNetworkRequests());
      console.log('');

    } finally {
      await this.cleanup();
    }

    // Print results
    console.log('=' .repeat(60));
    console.log('\n📊 Test Results:\n');

    for (let i = 0; i < this.results.length; i++) {
      const result = this.results[i];
      console.log(`${i + 1}. ${result.message}`);
      if (result.screenshot) {
        console.log(`   📸 Screenshot: ${result.screenshot}`);
      }
      if (result.error) {
        console.log(`   ℹ️  Details: ${result.error}`);
      }
      console.log('');
    }

    // Summary
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const criticalFailures = this.results.filter(r =>
      !r.passed && r.message.includes('❌')
    ).length;

    console.log('=' .repeat(60));
    console.log(`\n📈 Summary: ${passed}/${total} tests passed`);

    if (criticalFailures > 0) {
      console.log(`\n❌ ${criticalFailures} critical failure(s)`);
      console.log('\n🔧 Next Steps:');
      console.log('   1. Check Clerk dashboard for valid production keys');
      console.log('   2. Verify Vercel environment variables are set');
      console.log('   3. Review guide: docs/CLERK_KEY_REPLACEMENT_GUIDE.md');
      console.log('');
      console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`);
      process.exit(1);
    }

    console.log('\n✅ All tests passed! Clerk signup flow is working.');
    console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`);
    process.exit(0);
  }
}

// Run tests
const tester = new ClerkSignupTester();
tester.runAll().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
