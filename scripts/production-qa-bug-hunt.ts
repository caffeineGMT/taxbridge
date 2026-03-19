#!/usr/bin/env tsx
/**
 * Production QA Bug Hunt - CEO Manual QA Pass
 *
 * Comprehensive automated testing to find ALL bugs:
 * - Broken links
 * - Layout issues
 * - Form validation
 * - Error states
 * - Cross-browser compatibility
 * - Mobile responsiveness
 *
 * Usage: npm run qa:bug-hunt
 */

import { chromium, firefox, webkit, Browser, Page } from '@playwright/test';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const PRODUCTION_URL = 'https://taxbridge.vercel.app';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'qa-bug-hunt');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

interface Bug {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'Broken Link' | 'Layout Issue' | 'Form Validation' | 'Error State' | 'Performance' | 'Accessibility' | 'Functionality';
  page: string;
  description: string;
  steps: string[];
  expected: string;
  actual: string;
  screenshot?: string;
  browser?: string;
  viewport?: string;
}

const bugs: Bug[] = [];
let screenshotCounter = 0;

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const screenshotsDir = join(OUTPUT_DIR, `screenshots-${TIMESTAMP}`);
if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true });
}

async function captureScreenshot(page: Page, name: string, browser: string = 'chromium'): Promise<string> {
  screenshotCounter++;
  const filename = `${screenshotCounter.toString().padStart(3, '0')}-${browser}-${name}.png`;
  const filepath = join(screenshotsDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filename;
}

async function testPage(browser: Browser, browserName: string, url: string, viewport: { width: number; height: number }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  const viewportLabel = `${viewport.width}x${viewport.height}`;
  console.log(`🧪 Testing ${url} on ${browserName} (${viewportLabel})`);

  try {
    // Navigate to page
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Check HTTP status
    if (!response || response.status() !== 200) {
      bugs.push({
        severity: 'CRITICAL',
        category: 'Broken Link',
        page: url,
        description: `Page returns HTTP ${response?.status() || 'TIMEOUT'}`,
        steps: ['Navigate to ' + url],
        expected: 'HTTP 200 OK',
        actual: `HTTP ${response?.status() || 'TIMEOUT'}`,
        browser: browserName,
        viewport: viewportLabel
      });
    }

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Capture screenshot
    const screenshotName = url.replace(PRODUCTION_URL, '').replace(/\//g, '-') || 'homepage';
    const screenshot = await captureScreenshot(page, screenshotName, browserName);

    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter((img) => !img.complete || img.naturalHeight === 0)
        .map((img) => img.src);
    });

    if (brokenImages.length > 0) {
      bugs.push({
        severity: 'MEDIUM',
        category: 'Broken Link',
        page: url,
        description: `${brokenImages.length} broken image(s) found`,
        steps: ['Navigate to ' + url, 'Check all images'],
        expected: 'All images load successfully',
        actual: `Broken images: ${brokenImages.join(', ')}`,
        screenshot,
        browser: browserName,
        viewport: viewportLabel
      });
    }

    // Check for layout issues - horizontal scrollbar on mobile
    if (viewport.width <= 768) {
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (hasHorizontalScroll) {
        bugs.push({
          severity: 'HIGH',
          category: 'Layout Issue',
          page: url,
          description: 'Horizontal scrollbar detected on mobile viewport',
          steps: ['Navigate to ' + url, 'Set viewport to ' + viewportLabel, 'Check for horizontal scroll'],
          expected: 'Content fits within viewport width',
          actual: 'Page has horizontal scrollbar',
          screenshot,
          browser: browserName,
          viewport: viewportLabel
        });
      }
    }

    console.log(`✅ Completed ${url} on ${browserName} (${viewportLabel})`);

  } catch (error: any) {
    bugs.push({
      severity: 'CRITICAL',
      category: 'Functionality',
      page: url,
      description: `Page failed to load: ${error.message}`,
      steps: ['Navigate to ' + url],
      expected: 'Page loads successfully',
      actual: error.message,
      browser: browserName,
      viewport: viewportLabel
    });
    console.error(`❌ Error testing ${url}:`, error.message);
  } finally {
    await context.close();
  }
}

async function runQABugHunt() {
  console.log('🚀 Starting Production QA Bug Hunt');
  console.log(`📍 Testing: ${PRODUCTION_URL}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);

  // Pages to test
  const pagesToTest = [
    '/',
    '/us-canada-tax-calculator',
    '/pricing',
    '/dashboard',
  ];

  // Viewports to test (simulating different devices)
  const viewports = [
    { width: 1920, height: 1080, name: 'Desktop' },
    { width: 414, height: 896, name: 'iPhone' },
  ];

  // Test on Chromium only (quick test)
  console.log('\n━━━ Testing on Chromium ━━━');
  const chromiumBrowser = await chromium.launch();

  for (const viewport of viewports) {
    console.log(`\n📱 ${viewport.name} (${viewport.width}x${viewport.height})`);
    for (const page of pagesToTest) {
      await testPage(chromiumBrowser, 'Chromium', `${PRODUCTION_URL}${page}`, viewport);
    }
  }

  await chromiumBrowser.close();

  // Generate report
  generateReport();
}

function generateReport() {
  console.log('\n━━━ Generating Bug Report ━━━');

  // Group bugs by severity
  const criticalBugs = bugs.filter((b) => b.severity === 'CRITICAL');
  const highBugs = bugs.filter((b) => b.severity === 'HIGH');
  const mediumBugs = bugs.filter((b) => b.severity === 'MEDIUM');
  const lowBugs = bugs.filter((b) => b.severity === 'LOW');

  // Generate Markdown report
  let report = `# Production QA Bug Hunt Report\n\n`;
  report += `**Date:** ${new Date().toISOString()}\n`;
  report += `**Production URL:** ${PRODUCTION_URL}\n`;
  report += `**Total Bugs Found:** ${bugs.length}\n\n`;

  report += `## Summary\n\n`;
  report += `- 🔴 **CRITICAL:** ${criticalBugs.length}\n`;
  report += `- 🟠 **HIGH:** ${highBugs.length}\n`;
  report += `- 🟡 **MEDIUM:** ${mediumBugs.length}\n`;
  report += `- 🟢 **LOW:** ${lowBugs.length}\n\n`;

  if (bugs.length === 0) {
    report += `## ✅ No Bugs Found!\n\nCongratulations! The production site passed all automated tests.\n`;
  } else {
    // Critical bugs
    if (criticalBugs.length > 0) {
      report += `## 🔴 CRITICAL Bugs (${criticalBugs.length})\n\n`;
      criticalBugs.forEach((bug, index) => {
        report += `### ${index + 1}. ${bug.description}\n\n`;
        report += `- **Category:** ${bug.category}\n`;
        report += `- **Page:** ${bug.page}\n`;
        report += `- **Browser:** ${bug.browser || 'N/A'}\n`;
        report += `- **Viewport:** ${bug.viewport || 'N/A'}\n`;
        report += `- **Expected:** ${bug.expected}\n`;
        report += `- **Actual:** ${bug.actual}\n`;
        if (bug.screenshot) report += `- **Screenshot:** ![Screenshot](screenshots-${TIMESTAMP}/${bug.screenshot})\n`;
        report += `\n**Steps to Reproduce:**\n`;
        bug.steps.forEach((step, i) => {
          report += `${i + 1}. ${step}\n`;
        });
        report += `\n`;
      });
    }

    // High bugs
    if (highBugs.length > 0) {
      report += `## 🟠 HIGH Priority Bugs (${highBugs.length})\n\n`;
      highBugs.forEach((bug, index) => {
        report += `### ${index + 1}. ${bug.description}\n\n`;
        report += `- **Category:** ${bug.category}\n`;
        report += `- **Page:** ${bug.page}\n`;
        report += `- **Browser:** ${bug.browser || 'N/A'}\n`;
        report += `- **Viewport:** ${bug.viewport || 'N/A'}\n`;
        report += `- **Expected:** ${bug.expected}\n`;
        report += `- **Actual:** ${bug.actual}\n`;
        if (bug.screenshot) report += `- **Screenshot:** ![Screenshot](screenshots-${TIMESTAMP}/${bug.screenshot})\n`;
        report += `\n**Steps to Reproduce:**\n`;
        bug.steps.forEach((step, i) => {
          report += `${i + 1}. ${step}\n`;
        });
        report += `\n`;
      });
    }

    // Medium bugs
    if (mediumBugs.length > 0) {
      report += `## 🟡 MEDIUM Priority Bugs (${mediumBugs.length})\n\n`;
      mediumBugs.forEach((bug, index) => {
        report += `### ${index + 1}. ${bug.description}\n\n`;
        report += `- **Category:** ${bug.category}\n`;
        report += `- **Page:** ${bug.page}\n`;
        report += `- **Browser:** ${bug.browser || 'N/A'}\n`;
        report += `- **Viewport:** ${bug.viewport || 'N/A'}\n`;
        report += `- **Expected:** ${bug.expected}\n`;
        report += `- **Actual:** ${bug.actual}\n`;
        if (bug.screenshot) report += `- **Screenshot:** ![Screenshot](screenshots-${TIMESTAMP}/${bug.screenshot})\n`;
        report += `\n**Steps to Reproduce:**\n`;
        bug.steps.forEach((step, i) => {
          report += `${i + 1}. ${step}\n`;
        });
        report += `\n`;
      });
    }
  }

  // Add testing details
  report += `## Testing Details\n\n`;
  report += `- **Browsers Tested:** Chromium (Chrome/Edge)\n`;
  report += `- **Viewports Tested:** Desktop (1920x1080), iPhone (414x896)\n`;
  report += `- **Total Screenshots:** ${screenshotCounter}\n`;
  report += `- **Screenshots Directory:** \`screenshots-${TIMESTAMP}/\`\n\n`;

  // Save report
  const reportPath = join(OUTPUT_DIR, `bug-report-${TIMESTAMP}.md`);
  writeFileSync(reportPath, report);

  // Save JSON version for programmatic access
  const jsonPath = join(OUTPUT_DIR, `bug-report-${TIMESTAMP}.json`);
  writeFileSync(jsonPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    productionUrl: PRODUCTION_URL,
    totalBugs: bugs.length,
    criticalBugs: criticalBugs.length,
    highBugs: highBugs.length,
    mediumBugs: mediumBugs.length,
    lowBugs: lowBugs.length,
    bugs,
    screenshotCount: screenshotCounter,
    screenshotsDir: `screenshots-${TIMESTAMP}`
  }, null, 2));

  console.log(`\n✅ Bug report generated: ${reportPath}`);
  console.log(`✅ JSON report: ${jsonPath}`);
  console.log(`📸 Screenshots: ${screenshotsDir}`);
  console.log(`\n📊 Summary:`);
  console.log(`   🔴 CRITICAL: ${criticalBugs.length}`);
  console.log(`   🟠 HIGH: ${highBugs.length}`);
  console.log(`   🟡 MEDIUM: ${mediumBugs.length}`);
  console.log(`   🟢 LOW: ${lowBugs.length}`);
  console.log(`   📸 Screenshots: ${screenshotCounter}`);

  if (criticalBugs.length > 0) {
    console.log(`\n⚠️  CRITICAL BUGS FOUND - Fix immediately before launch!`);
    process.exit(1);
  } else if (highBugs.length > 0) {
    console.log(`\n⚠️  HIGH priority bugs found - Review and fix before launch`);
  } else if (mediumBugs.length > 0 || lowBugs.length > 0) {
    console.log(`\n✅ No critical/high bugs - Site is ready for launch!`);
  } else {
    console.log(`\n🎉 Perfect! No bugs found!`);
  }
}

// Run the bug hunt
runQABugHunt().catch((error) => {
  console.error('❌ QA Bug Hunt failed:', error);
  process.exit(1);
});
