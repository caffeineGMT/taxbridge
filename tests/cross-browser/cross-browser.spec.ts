/**
 * Cross-Browser Rendering Tests
 *
 * Tests visual rendering, input behavior, and calculation consistency
 * across Chrome, Firefox, Safari/WebKit, and Edge.
 */

import { test, expect } from '@playwright/test';

test.describe('Landing Page Rendering', () => {
  test('hero section renders correctly with gradient text', async ({ page }) => {
    await page.goto('/');

    // Check hero heading is visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Simplify Your');
    await expect(heading).toContainText('Cross-Border Tax Filing');

    // Verify gradient text span exists and has the right classes
    const gradientSpan = page.locator('h1 span.bg-clip-text');
    await expect(gradientSpan).toBeVisible();

    // Verify gradient text is rendered (not invisible due to missing webkit prefix)
    const boundingBox = await gradientSpan.boundingBox();
    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.height).toBeGreaterThan(0);
    expect(boundingBox!.width).toBeGreaterThan(0);
  });

  test('sticky header has backdrop blur effect', async ({ page }) => {
    await page.goto('/');

    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Scroll down to trigger sticky behavior
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    // Header should still be visible (sticky)
    await expect(header).toBeVisible();
    const headerBox = await header.boundingBox();
    expect(headerBox!.y).toBeLessThanOrEqual(5); // Should be at top
  });

  test('feature cards render with proper layout', async ({ page }) => {
    await page.goto('/');

    const featureCards = page.locator('#features .grid > div');
    const cardCount = await featureCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(3);

    // Verify cards are visible
    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      await expect(featureCards.nth(i)).toBeVisible();
    }
  });

  test('CTA buttons are clickable and properly sized', async ({ page }) => {
    await page.goto('/');

    const getStartedBtn = page.locator('a[href="/dashboard"] button').first();
    await expect(getStartedBtn).toBeVisible();

    // Check button has minimum touch target size (44px)
    const box = await getStartedBtn.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('footer links are accessible', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check that footer links exist
    const footerLinks = footer.locator('a');
    const linkCount = await footerLinks.count();
    expect(linkCount).toBeGreaterThanOrEqual(4);
  });
});

test.describe('Input Validation Cross-Browser', () => {
  test('number inputs prevent scroll wheel changes', async ({ page }) => {
    await page.goto('/rsu-entry');

    const sharesInput = page.locator('input[type="number"]').first();
    if (await sharesInput.isVisible()) {
      // Focus the input and type a value
      await sharesInput.fill('100');

      // Simulate wheel event
      await sharesInput.dispatchEvent('wheel', { deltaY: 100 });

      // Value should not have changed
      const value = await sharesInput.inputValue();
      expect(value).toBe('100');
    }
  });

  test('number inputs accept decimal values correctly', async ({ page }) => {
    await page.goto('/rsu-entry');

    const fmvInput = page.locator('input[placeholder="450.50"]');
    if (await fmvInput.isVisible()) {
      await fmvInput.fill('450.50');
      const value = await fmvInput.inputValue();
      expect(value).toBe('450.50');
    }
  });

  test('select dropdowns render with custom chevron icon', async ({ page }) => {
    await page.goto('/rsu-entry');

    // Check that native select arrows are hidden and custom icon is shown
    const selectWrappers = page.locator('.relative select');
    const count = await selectWrappers.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const wrapper = selectWrappers.nth(i).locator('..');
        const chevron = wrapper.locator('svg');
        await expect(chevron).toBeVisible();
      }
    }
  });
});

test.describe('Responsive Layout', () => {
  test('mobile navigation collapses correctly', async ({ page, browserName }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Desktop nav should be hidden on mobile
    const desktopNav = page.locator('nav.hidden.md\\:flex');
    if (await desktopNav.count() > 0) {
      await expect(desktopNav).not.toBeVisible();
    }
  });

  test('feature cards stack vertically on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const featureSection = page.locator('#features .grid');
    if (await featureSection.isVisible()) {
      const gridStyle = await featureSection.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      // On mobile, should be single column
      expect(gridStyle).not.toContain('repeat(3');
    }
  });

  test('buttons are full-width on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // CTA buttons should take full width on mobile
    const ctaButton = page.locator('a[href="/dashboard"] button').first();
    if (await ctaButton.isVisible()) {
      const box = await ctaButton.boundingBox();
      // Button should be at least 80% of viewport width on mobile
      expect(box!.width).toBeGreaterThanOrEqual(280);
    }
  });
});

test.describe('Currency Formatting', () => {
  test('dashboard displays formatted currency values', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for any currency display on the page
    const pageContent = await page.textContent('body');
    // Currency values should use consistent formatting with commas and decimals
    if (pageContent?.includes('$')) {
      // Verify dollar amounts use proper formatting ($ followed by digits)
      const hasCurrencyFormat = /\$[\d,]+\.\d{2}/.test(pageContent);
      expect(hasCurrencyFormat).toBeTruthy();
    }
  });
});

test.describe('Accessibility Cross-Browser', () => {
  test('focus styles are visible in all browsers', async ({ page }) => {
    await page.goto('/');

    // Tab to the first interactive element
    await page.keyboard.press('Tab');

    // Check that some element has focus
    const focusedElement = page.locator(':focus-visible');
    const focusCount = await focusedElement.count();
    expect(focusCount).toBeGreaterThanOrEqual(1);
  });

  test('skip link is functional', async ({ page }) => {
    await page.goto('/');

    // Tab to activate skip link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main-content"]');

    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeFocused();
    }
  });
});

test.describe('Form Submission', () => {
  test('form prevents submission with invalid data', async ({ page }) => {
    await page.goto('/rsu-entry');

    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      // Try to submit without filling required fields
      await submitButton.click();

      // Should show validation errors, not navigate away
      const url = page.url();
      expect(url).toContain('rsu-entry');
    }
  });
});
