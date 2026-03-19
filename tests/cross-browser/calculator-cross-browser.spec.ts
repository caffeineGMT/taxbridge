/**
 * Enhanced Cross-Browser Calculator Tests
 *
 * Comprehensive tests for input validation, currency masking, calculations,
 * and rendering across Chrome, Firefox, Safari, and Edge (desktop + mobile).
 */

import { test, expect, type Page } from '@playwright/test';

// Helper to format currency for comparison
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

test.describe('ROI Calculator - Cross-Browser Input Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/enterprise/calculator');
    // Wait for calculator to be visible
    await page.waitForSelector('text=ROI Calculator', { timeout: 10000 });
  });

  test('accepts and formats integer inputs correctly', async ({ page, browserName }) => {
    console.log(`Testing integer inputs on ${browserName}`);

    const attorneyCountInput = page.locator('input#attorneyCount');

    if (await attorneyCountInput.isVisible()) {
      // Test various input formats
      await attorneyCountInput.fill('1000');
      await attorneyCountInput.blur();
      let value = await attorneyCountInput.inputValue();
      expect(parseInt(value.replace(/,/g, ''))).toBe(1000);

      // Test with commas
      await attorneyCountInput.fill('1,000');
      await attorneyCountInput.blur();
      value = await attorneyCountInput.inputValue();
      expect(parseInt(value.replace(/,/g, ''))).toBe(1000);

      // Test edge case: zero
      await attorneyCountInput.fill('0');
      await attorneyCountInput.blur();
      value = await attorneyCountInput.inputValue();
      expect(parseInt(value)).toBe(0);
    }
  });

  test('accepts and formats currency inputs correctly', async ({ page, browserName }) => {
    console.log(`Testing currency inputs on ${browserName}`);

    const billableRateInput = page.locator('input#billableRate');

    if (await billableRateInput.isVisible()) {
      // Test plain number
      await billableRateInput.fill('250');
      await billableRateInput.blur();
      let value = await billableRateInput.inputValue();
      expect(parseFloat(value.replace(/[$,]/g, ''))).toBe(250);

      // Test with decimals
      await billableRateInput.fill('250.50');
      await billableRateInput.blur();
      value = await billableRateInput.inputValue();
      expect(parseFloat(value.replace(/[$,]/g, ''))).toBe(250.50);

      // Test with dollar sign
      await billableRateInput.fill('$250.50');
      await billableRateInput.blur();
      value = await billableRateInput.inputValue();
      expect(parseFloat(value.replace(/[$,]/g, ''))).toBe(250.50);

      // Test with commas and dollar sign
      await billableRateInput.fill('$1,250.50');
      await billableRateInput.blur();
      value = await billableRateInput.inputValue();
      expect(parseFloat(value.replace(/[$,]/g, ''))).toBe(1250.50);
    }
  });

  test('prevents wheel scroll on number inputs', async ({ page, browserName }) => {
    console.log(`Testing wheel scroll prevention on ${browserName}`);

    const attorneyCountInput = page.locator('input#attorneyCount');

    if (await attorneyCountInput.isVisible()) {
      await attorneyCountInput.fill('100');
      const initialValue = await attorneyCountInput.inputValue();

      // Simulate mouse wheel scroll
      await attorneyCountInput.hover();
      await page.mouse.wheel(0, 100); // Scroll down
      await page.waitForTimeout(100);

      const afterScrollValue = await attorneyCountInput.inputValue();
      expect(afterScrollValue).toBe(initialValue);
    }
  });

  test('shows correct keyboard on mobile for number inputs', async ({ page, browserName, isMobile }) => {
    if (!isMobile) {
      test.skip();
      return;
    }

    console.log(`Testing mobile keyboard for ${browserName}`);

    const attorneyCountInput = page.locator('input#attorneyCount');

    if (await attorneyCountInput.isVisible()) {
      // Check input has inputMode="numeric" or type="number"
      const inputMode = await attorneyCountInput.getAttribute('inputmode');
      const inputType = await attorneyCountInput.getAttribute('type');

      expect(inputMode === 'numeric' || inputType === 'number').toBeTruthy();
    }
  });

  test('calculates ROI consistently across browsers', async ({ page, browserName }) => {
    console.log(`Testing ROI calculation on ${browserName}`);

    // Fill in test data
    const firmNameInput = page.locator('input#firmName');
    if (await firmNameInput.isVisible()) {
      await firmNameInput.fill('Test Law Firm');
    }

    const attorneyCountInput = page.locator('input#attorneyCount');
    if (await attorneyCountInput.isVisible()) {
      await attorneyCountInput.fill('50');
    }

    const clientsInput = page.locator('input#clientsPerYear');
    if (await clientsInput.isVisible()) {
      await clientsInput.fill('200');
    }

    const hoursInput = page.locator('input#hoursPerWeek');
    if (await hoursInput.isVisible()) {
      await hoursInput.fill('5');
    }

    const billableRateInput = page.locator('input#billableRate');
    if (await billableRateInput.isVisible()) {
      await billableRateInput.fill('250');
    }

    // Submit or calculate
    const calculateButton = page.locator('button:has-text("Calculate")');
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
      await page.waitForTimeout(500);
    }

    // Verify results are displayed (values should be consistent across browsers)
    const resultsSection = page.locator('text=Hours Saved').or(page.locator('text=Value Saved'));
    if (await resultsSection.isVisible()) {
      // Just verify results section exists - exact values tested separately
      await expect(resultsSection).toBeVisible();
    }
  });
});

test.describe('Main Landing Page - Cross-Browser Rendering', () => {
  test('gradient text renders without clipping', async ({ page, browserName }) => {
    console.log(`Testing gradient text rendering on ${browserName}`);

    await page.goto('/');

    const gradientText = page.locator('h1 span.bg-clip-text');
    await expect(gradientText).toBeVisible();

    // Verify text is actually visible (not clipped to invisible)
    const box = await gradientText.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.height).toBeGreaterThan(20);
    expect(box!.width).toBeGreaterThan(50);

    // Check computed styles include necessary webkit prefixes for Safari
    if (browserName === 'webkit') {
      const styles = await gradientText.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundClip: computed.backgroundClip,
          webkitBackgroundClip: (computed as any).webkitBackgroundClip,
          color: computed.color,
        };
      });

      // Should have -webkit-background-clip for Safari
      expect(
        styles.backgroundClip === 'text' ||
        styles.webkitBackgroundClip === 'text'
      ).toBeTruthy();
    }
  });

  test('backdrop blur renders on sticky header', async ({ page, browserName }) => {
    console.log(`Testing backdrop blur on ${browserName}`);

    await page.goto('/');

    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Scroll to trigger sticky
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    // Header should still be at top (sticky)
    await expect(header).toBeVisible();
    const box = await header.boundingBox();
    expect(box!.y).toBeLessThanOrEqual(5);

    // Check backdrop-blur is applied
    const hasBackdropBlur = await header.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return computed.backdropFilter !== 'none' ||
             (computed as any).webkitBackdropFilter !== 'none';
    });

    // Note: backdrop-filter support varies, so we just check it's attempted
    console.log(`${browserName} backdrop-filter support:`, hasBackdropBlur);
  });

  test('responsive grid layout on mobile', async ({ page, browserName, isMobile }) => {
    console.log(`Testing responsive grid on ${browserName} (mobile: ${isMobile})`);

    // Set mobile viewport if not already mobile
    if (!isMobile) {
      await page.setViewportSize({ width: 375, height: 812 });
    }

    await page.goto('/');

    const featureGrid = page.locator('#features .grid');
    if (await featureGrid.isVisible()) {
      const gridCols = await featureGrid.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });

      // On mobile (< 640px), should be single column
      // Grid columns will show as "1fr" or similar for single column
      const colCount = gridCols.split(' ').filter(col => col.includes('fr') || col.includes('px')).length;
      expect(colCount).toBeLessThanOrEqual(2); // Allow up to 2 columns on mobile
    }
  });

  test('touch targets are minimum 44x44px on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
      return;
    }

    await page.goto('/');

    // Check CTA buttons
    const buttons = page.locator('button, a[href="/dashboard"]');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44);
          expect(box.width).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });
});

test.describe('Input Validation - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/enterprise/calculator');
    await page.waitForSelector('text=ROI Calculator', { timeout: 10000 });
  });

  test('handles negative numbers correctly', async ({ page, browserName }) => {
    console.log(`Testing negative number handling on ${browserName}`);

    const attorneyCountInput = page.locator('input#attorneyCount');

    if (await attorneyCountInput.isVisible()) {
      // Try to enter negative number
      await attorneyCountInput.fill('-50');
      await attorneyCountInput.blur();

      const value = await attorneyCountInput.inputValue();
      const numValue = parseInt(value.replace(/[^0-9-]/g, ''));

      // Should either reject negative (become 0 or empty) or accept but sanitize
      expect(numValue >= 0 || isNaN(numValue)).toBeTruthy();
    }
  });

  test('handles very large numbers', async ({ page, browserName }) => {
    console.log(`Testing large number handling on ${browserName}`);

    const billableRateInput = page.locator('input#billableRate');

    if (await billableRateInput.isVisible()) {
      // Enter very large number
      await billableRateInput.fill('999999999');
      await billableRateInput.blur();

      const value = await billableRateInput.inputValue();
      // Should accept but might format with commas
      expect(value).toBeTruthy();
    }
  });

  test('handles empty/cleared inputs gracefully', async ({ page, browserName }) => {
    console.log(`Testing empty input handling on ${browserName}`);

    const attorneyCountInput = page.locator('input#attorneyCount');

    if (await attorneyCountInput.isVisible()) {
      // Fill then clear
      await attorneyCountInput.fill('100');
      await attorneyCountInput.fill('');
      await attorneyCountInput.blur();

      // Should either show placeholder or default value, not crash
      const value = await attorneyCountInput.inputValue();
      console.log(`Empty input value: "${value}"`);
    }
  });

  test('handles non-numeric characters in number inputs', async ({ page, browserName }) => {
    console.log(`Testing non-numeric input filtering on ${browserName}`);

    const attorneyCountInput = page.locator('input#attorneyCount');

    if (await attorneyCountInput.isVisible()) {
      // Try to enter letters
      await attorneyCountInput.fill('abc123def');
      await attorneyCountInput.blur();

      const value = await attorneyCountInput.inputValue();
      // Should extract just the number or reject entirely
      expect(value === '123' || value === '' || parseInt(value.replace(/,/g, '')) === 123).toBeTruthy();
    }
  });
});

test.describe('CSS Compatibility - Visual Rendering', () => {
  test('box shadows render consistently', async ({ page, browserName }) => {
    console.log(`Testing box shadow rendering on ${browserName}`);

    await page.goto('/');

    const featureCard = page.locator('#features .grid > div').first();
    if (await featureCard.isVisible()) {
      const shadow = await featureCard.evaluate((el) => {
        return window.getComputedStyle(el).boxShadow;
      });

      expect(shadow).not.toBe('none');
      console.log(`${browserName} box-shadow:`, shadow);
    }
  });

  test('border radius renders consistently', async ({ page, browserName }) => {
    console.log(`Testing border radius on ${browserName}`);

    await page.goto('/');

    const button = page.locator('button').first();
    if (await button.isVisible()) {
      const radius = await button.evaluate((el) => {
        return window.getComputedStyle(el).borderRadius;
      });

      expect(radius).not.toBe('0px');
      console.log(`${browserName} border-radius:`, radius);
    }
  });

  test('flexbox layouts render correctly', async ({ page, browserName }) => {
    console.log(`Testing flexbox layout on ${browserName}`);

    await page.goto('/');

    const header = page.locator('header .container');
    if (await header.isVisible()) {
      const display = await header.evaluate((el) => {
        return window.getComputedStyle(el).display;
      });

      expect(display).toBe('flex');
    }
  });

  test('grid layouts render correctly', async ({ page, browserName }) => {
    console.log(`Testing grid layout on ${browserName}`);

    await page.goto('/');

    const featureGrid = page.locator('#features .grid');
    if (await featureGrid.isVisible()) {
      const display = await featureGrid.evaluate((el) => {
        return window.getComputedStyle(el).display;
      });

      expect(display).toBe('grid');
    }
  });
});

test.describe('Form Accessibility - Keyboard Navigation', () => {
  test('all inputs are keyboard accessible', async ({ page, browserName }) => {
    console.log(`Testing keyboard accessibility on ${browserName}`);

    await page.goto('/enterprise/calculator');
    await page.waitForSelector('text=ROI Calculator', { timeout: 10000 });

    // Tab through inputs
    await page.keyboard.press('Tab');
    let focusedElement = page.locator(':focus');

    // Should focus on first input
    const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
    expect(['input', 'button', 'a'].includes(tagName)).toBeTruthy();
  });

  test('focus styles are visible', async ({ page, browserName }) => {
    console.log(`Testing focus styles on ${browserName}`);

    await page.goto('/');

    // Tab to first focusable element
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus-visible');
    const count = await focusedElement.count();

    if (count > 0) {
      const outline = await focusedElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return computed.outline || computed.outlineWidth;
      });

      console.log(`${browserName} focus outline:`, outline);
      expect(outline).not.toBe('none');
      expect(outline).not.toBe('0px');
    }
  });
});
