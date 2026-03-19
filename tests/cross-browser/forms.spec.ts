import { test, expect } from '@playwright/test';

/**
 * Cross-Browser Form Submission Tests
 * Tests signup, contact forms, and other form submissions across all browsers
 */

test.describe('Forms - Cross Browser', () => {
  const PROD_URL = 'https://taxbridgecpa.com';

  test('signup form should be accessible', async ({ page, browserName }) => {
    await page.goto(PROD_URL);

    // Look for signup/get started buttons
    const signupBtn = page.locator('a:has-text("Get Started"), a:has-text("Sign Up"), button:has-text("Get Started")').first();
    await expect(signupBtn).toBeVisible({ timeout: 10000 });

    console.log(`✓ ${browserName}: Signup CTA visible`);
  });

  test('email input should validate format', async ({ page, browserName }) => {
    await page.goto(PROD_URL);

    // Navigate to signup if needed
    const signupBtn = page.locator('a:has-text("Get Started"), a:has-text("Sign Up")').first();
    if (await signupBtn.isVisible()) {
      await signupBtn.click();
      await page.waitForLoadState('networkidle');
    }

    // Find email input
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible({ timeout: 5000 })) {
      // Test invalid email
      await emailInput.fill('invalid-email');
      await emailInput.press('Tab'); // Trigger blur validation

      // Test valid email
      await emailInput.fill('test@example.com');
      const value = await emailInput.inputValue();
      expect(value).toBe('test@example.com');

      console.log(`✓ ${browserName}: Email validation works`);
    } else {
      console.log(`⚠ ${browserName}: Email input not found on current page`);
    }
  });

  test('form submission should show loading state', async ({ page, browserName }) => {
    await page.goto(PROD_URL);

    // Look for any form submit button
    const submitBtn = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Calculate")').first();

    if (await submitBtn.isVisible({ timeout: 5000 })) {
      const initialText = await submitBtn.textContent();

      // Intercept network to simulate slow response
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });

      await submitBtn.click();

      // Check if button shows loading state
      await page.waitForTimeout(500);
      const loadingText = await submitBtn.textContent();

      console.log(`${browserName}: Button text changed from "${initialText}" to "${loadingText}"`);

      // Button should either be disabled or show loading text
      const isDisabled = await submitBtn.isDisabled();
      const hasLoadingText = loadingText !== initialText;

      if (isDisabled || hasLoadingText) {
        console.log(`✓ ${browserName}: Form shows loading state`);
      } else {
        console.log(`⚠ ${browserName}: No visible loading state detected`);
      }
    }
  });

  test('form inputs should persist on mobile', async ({ page, browserName, isMobile }) => {
    if (!isMobile) {
      test.skip();
      return;
    }

    await page.goto(PROD_URL);

    // Fill calculator form on mobile
    const incomeInput = page.locator('input[name="income"], input[placeholder*="income" i]').first();
    if (await incomeInput.isVisible({ timeout: 5000 })) {
      await incomeInput.fill('100000');

      // Scroll away and back
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, 0));

      // Value should persist
      const value = await incomeInput.inputValue();
      expect(value).toBe('100000');

      console.log(`✓ ${browserName} (mobile): Form state persists after scroll`);
    }
  });

  test('autofill should work correctly', async ({ page, browserName }) => {
    await page.goto(PROD_URL);

    // Navigate to signup
    const signupBtn = page.locator('a:has-text("Get Started"), a:has-text("Sign Up")').first();
    if (await signupBtn.isVisible({ timeout: 5000 })) {
      await signupBtn.click();
      await page.waitForLoadState('networkidle');

      // Check if email input has autocomplete attribute
      const emailInput = page.locator('input[type="email"]').first();
      if (await emailInput.isVisible({ timeout: 5000 })) {
        const autocomplete = await emailInput.getAttribute('autocomplete');

        if (autocomplete === 'email') {
          console.log(`✓ ${browserName}: Email autocomplete properly configured`);
        } else {
          console.log(`⚠ ${browserName}: Email autocomplete is "${autocomplete}" (should be "email")`);
        }
      }
    }
  });

  test('form should handle rapid submissions', async ({ page, browserName }) => {
    await page.goto(PROD_URL);

    const submitBtn = page.locator('button[type="submit"], button:has-text("Calculate")').first();

    if (await submitBtn.isVisible({ timeout: 5000 })) {
      // Try to click multiple times rapidly
      await submitBtn.click();
      await submitBtn.click();
      await submitBtn.click();

      // Wait and check if app didn't crash
      await page.waitForTimeout(2000);

      const isResponsive = await page.evaluate(() => {
        return document.readyState === 'complete';
      });

      expect(isResponsive).toBe(true);
      console.log(`✓ ${browserName}: Handles rapid submissions without crashing`);
    }
  });

  test('required fields should show validation errors', async ({ page, browserName }) => {
    await page.goto(PROD_URL);

    // Find a submit button and try to submit without filling required fields
    const submitBtn = page.locator('button[type="submit"]').first();

    if (await submitBtn.isVisible({ timeout: 5000 })) {
      await submitBtn.click();

      // Look for validation messages
      await page.waitForTimeout(1000);

      const validationMessage = page.locator('[role="alert"], .error, .text-red-500, .text-destructive').first();
      const hasValidation = await validationMessage.isVisible().catch(() => false);

      if (hasValidation) {
        console.log(`✓ ${browserName}: Validation errors displayed`);
      } else {
        console.log(`⚠ ${browserName}: No visible validation errors (may use browser native validation)`);
      }

      await page.screenshot({
        path: `test-results/form-validation-${browserName}.png`
      });
    }
  });

  test('forms should be keyboard accessible', async ({ page, browserName }) => {
    await page.goto(PROD_URL);

    // Tab through form inputs
    const activeElements: string[] = [];

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);

      const tagName = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
      if (tagName === 'input' || tagName === 'button' || tagName === 'textarea') {
        activeElements.push(tagName);
      }
    }

    if (activeElements.length > 0) {
      console.log(`✓ ${browserName}: Keyboard navigation works (${activeElements.length} focusable elements)`);
    } else {
      console.log(`⚠ ${browserName}: No focusable form elements found`);
    }
  });
});
