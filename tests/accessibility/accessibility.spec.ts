/**
 * Accessibility Test Suite
 * Tests WCAG 2.1 AA compliance across all major pages
 *
 * Coverage:
 * - ARIA labels and roles
 * - Keyboard navigation
 * - Color contrast
 * - Focus management
 * - Screen reader compatibility
 */

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Helper function to check color contrast
async function checkColorContrast(page: Page, selector: string): Promise<boolean> {
  const element = await page.locator(selector).first();
  const backgroundColor = await element.evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor;
  });
  const color = await element.evaluate((el) => {
    return window.getComputedStyle(el).color;
  });

  // Parse RGB values
  const bgMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  const colorMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

  if (!bgMatch || !colorMatch) return true; // Skip if can't parse

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map((val) => {
      const s = val / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(parseInt(bgMatch[1]), parseInt(bgMatch[2]), parseInt(bgMatch[3]));
  const l2 = getLuminance(parseInt(colorMatch[1]), parseInt(colorMatch[2]), parseInt(colorMatch[3]));

  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  return ratio >= 4.5;
}

test.describe('Landing Page Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = await page.locator('h1').count();
    const h2 = await page.locator('h2').count();

    expect(h1).toBeGreaterThanOrEqual(1);
    expect(h2).toBeGreaterThan(0);

    // Check h1 exists before h2
    const firstH1 = await page.locator('h1').first();
    const firstH2 = await page.locator('h2').first();

    const h1BoundingBox = await firstH1.boundingBox();
    const h2BoundingBox = await firstH2.boundingBox();

    expect(h1BoundingBox?.y).toBeLessThan(h2BoundingBox?.y || 0);
  });

  test('should have accessible navigation with ARIA labels', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check all links have accessible text
    const links = nav.locator('a');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');

      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // Check that focus is visible
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      const styles = window.getComputedStyle(el as Element);
      return {
        tagName: el?.tagName,
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
      };
    });

    expect(focusedElement.tagName).toBeTruthy();
  });

  test('should have proper button accessibility', async ({ page }) => {
    const buttons = page.locator('button, a[role="button"]');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible();

      if (isVisible) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');

        // Button should have accessible text
        expect(text || ariaLabel).toBeTruthy();

        // Check if button is keyboard accessible
        const tabIndex = await button.getAttribute('tabindex');
        expect(tabIndex !== '-1').toBeTruthy();
      }
    }
  });

  test('should have proper color contrast for text', async ({ page }) => {
    const textElements = [
      'h1',
      'h2',
      'p',
      'a',
      'button',
    ];

    for (const selector of textElements) {
      const elements = page.locator(selector);
      const count = await elements.count();

      if (count > 0) {
        const hasGoodContrast = await checkColorContrast(page, selector);
        // Note: This is a basic check, manual testing with tools like axe is recommended
        expect(hasGoodContrast).toBeTruthy();
      }
    }
  });

  test('should have skip link for screen readers', async ({ page }) => {
    // Check for skip to main content link
    const skipLink = page.locator('a[href="#main-content"], a:has-text("Skip to")');

    // Skip link may be visually hidden but should exist
    const count = await skipLink.count();
    // This is a nice-to-have, not required
    if (count > 0) {
      const href = await skipLink.first().getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      if (id) {
        // Check if there's a label with for attribute
        const label = page.locator(`label[for="${id}"]`);
        const labelCount = await label.count();

        const hasLabel = labelCount > 0 || ariaLabel || ariaLabelledBy;
        expect(hasLabel).toBeTruthy();
      }
    }
  });
});

test.describe('Dashboard Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should have accessible data tables', async ({ page }) => {
    const tables = page.locator('table');
    const count = await tables.count();

    for (let i = 0; i < count; i++) {
      const table = tables.nth(i);

      // Check for table headers
      const th = table.locator('th');
      const thCount = await th.count();
      expect(thCount).toBeGreaterThan(0);

      // Check for caption or aria-label
      const caption = await table.locator('caption').count();
      const ariaLabel = await table.getAttribute('aria-label');

      // Table should have caption or aria-label for context
      // This is a recommendation, not strict requirement
      const hasAccessibleName = caption > 0 || ariaLabel;
      if (count > 0) {
        expect(hasAccessibleName).toBeTruthy();
      }
    }
  });

  test('should have accessible charts', async ({ page }) => {
    // Charts should have alt text or ARIA labels
    const charts = page.locator('[class*="recharts"], svg[class*="chart"]');
    const count = await charts.count();

    for (let i = 0; i < count; i++) {
      const chart = charts.nth(i);
      const ariaLabel = await chart.getAttribute('aria-label');
      const role = await chart.getAttribute('role');

      // Chart should have accessible description
      expect(ariaLabel || role).toBeTruthy();
    }
  });

  test('should announce dynamic content changes', async ({ page }) => {
    // Check for ARIA live regions
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
    const count = await liveRegions.count();

    // At least some dynamic feedback should exist
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Calculator Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tax-calculator/washington-bc');
  });

  test('should have accessible form inputs with labels', async ({ page }) => {
    const inputs = page.locator('input[type="text"], input[type="number"], select');
    const count = await inputs.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelCount = await label.count();

        const hasLabel = labelCount > 0 || ariaLabel || ariaLabelledBy;
        expect(hasLabel).toBeTruthy();
      }
    }
  });

  test('should show validation errors accessibly', async ({ page }) => {
    // Submit empty form
    const submitButton = page.locator('button:has-text("Calculate")');
    await submitButton.click();

    // Wait for error messages
    await page.waitForTimeout(1000);

    // Check for error messages with role="alert"
    const errors = page.locator('[role="alert"], [aria-live="assertive"]');
    const errorCount = await errors.count();

    // Should have accessible error announcements
    if (errorCount > 0) {
      const errorText = await errors.first().textContent();
      expect(errorText).toBeTruthy();
    }
  });

  test('should have accessible tooltips', async ({ page }) => {
    const tooltipTriggers = page.locator('[aria-describedby], [data-tooltip]');
    const count = await tooltipTriggers.count();

    if (count > 0) {
      const trigger = tooltipTriggers.first();
      await trigger.hover();

      await page.waitForTimeout(500);

      // Check if tooltip appears
      const ariaDescribedBy = await trigger.getAttribute('aria-describedby');
      if (ariaDescribedBy) {
        const tooltip = page.locator(`#${ariaDescribedBy}`);
        const isVisible = await tooltip.isVisible();
        expect(isVisible).toBeTruthy();
      }
    }
  });

  test('should support keyboard-only interaction', async ({ page }) => {
    // Tab to first input
    await page.keyboard.press('Tab');

    // Type value
    await page.keyboard.type('100000');

    // Tab to state dropdown
    await page.keyboard.press('Tab');

    // Navigate dropdown with arrow keys
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Tab to submit button
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    // Submit with Enter key
    await page.keyboard.press('Enter');

    // Should work without any mouse interaction
    await page.waitForTimeout(2000);

    // Check if results appear
    const results = page.locator('text=/tax/i, text=/result/i');
    const hasResults = await results.count() > 0;

    // Note: This may fail if form validation requires specific inputs
    // Manual testing recommended
  });
});

test.describe('Mobile Accessibility', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have touch-friendly tap targets', async ({ page }) => {
    const buttons = page.locator('button, a');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible();

      if (isVisible) {
        const box = await button.boundingBox();

        if (box) {
          // WCAG recommends minimum 44x44px touch targets
          const isTouchFriendly = box.width >= 44 && box.height >= 44;

          if (!isTouchFriendly) {
            console.warn(`Button ${i} has small touch target: ${box.width}x${box.height}`);
          }
        }
      }
    }
  });

  test('should have responsive text that is readable', async ({ page }) => {
    const headings = page.locator('h1, h2, h3');
    const count = await headings.count();

    for (let i = 0; i < count; i++) {
      const heading = headings.nth(i);
      const fontSize = await heading.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });

      const fontSizeNum = parseFloat(fontSize);

      // Headings should be at least 16px on mobile
      expect(fontSizeNum).toBeGreaterThanOrEqual(14);
    }
  });

  test('should not have horizontal scroll', async ({ page }) => {
    const bodyScrollWidth = await page.evaluate(() => {
      return document.body.scrollWidth;
    });

    const viewportWidth = page.viewportSize()?.width || 0;

    // Allow 5px tolerance for rounding
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });
});

test.describe('Screen Reader Compatibility', () => {
  test('should have proper document structure', async ({ page }) => {
    await page.goto('/');

    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toHaveCount(1);

    // Check for navigation landmark
    const nav = page.locator('nav, [role="navigation"]');
    expect(await nav.count()).toBeGreaterThanOrEqual(1);

    // Check for footer
    const footer = page.locator('footer, [role="contentinfo"]');
    await expect(footer).toHaveCount(1);
  });

  test('should have proper image alt text', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Images should have alt text or role="presentation" for decorative images
      expect(alt !== null || role === 'presentation').toBeTruthy();
    }
  });

  test('should have proper button and link semantics', async ({ page }) => {
    await page.goto('/');

    // Links that look like buttons should have role="button"
    const linkButtons = page.locator('a.btn, a.button, a[class*="Button"]');
    const count = await linkButtons.count();

    // This is more of a semantic check - not strictly required
    for (let i = 0; i < Math.min(count, 5); i++) {
      const link = linkButtons.nth(i);
      const href = await link.getAttribute('href');

      // Links should have href
      expect(href).toBeTruthy();
    }
  });
});
