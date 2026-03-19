/**
 * Cross-Browser Device Testing Script
 *
 * Tests taxbridgecpa.com (or fallback production URL) across:
 * - iPhone Safari
 * - Android Chrome
 * - Desktop Safari
 * - Desktop Firefox
 * - Desktop Edge
 *
 * Captures screenshots and documents rendering bugs for each combination.
 *
 * Usage: tsx scripts/cross-browser-device-testing.ts
 */

import { chromium, firefox, webkit, devices, type Browser, type Page } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://taxbridge.vercel.app';
const FALLBACK_URL = 'https://taxbridgecpa.com';
const SCREENSHOT_DIR = 'docs/screenshots/cross-browser-testing';
const REPORT_PATH = 'docs/CROSS_BROWSER_TEST_REPORT.md';

interface TestResult {
  browser: string;
  device: string;
  page: string;
  status: 'pass' | 'fail' | 'warning';
  issues: string[];
  screenshot: string;
  viewport: { width: number; height: number };
  userAgent: string;
  timestamp: string;
}

interface RenderingIssue {
  severity: 'critical' | 'major' | 'minor';
  description: string;
  affectedBrowsers: string[];
  affectedPages: string[];
  screenshot?: string;
}

const testResults: TestResult[] = [];
const renderingIssues: RenderingIssue[] = [];

// Test configurations for each browser/device combination
const testConfigurations = [
  {
    browserType: 'webkit',
    device: 'iPhone 13',
    name: 'iPhone Safari',
  },
  {
    browserType: 'webkit',
    device: 'iPhone 13 Pro',
    name: 'iPhone 13 Pro Safari',
  },
  {
    browserType: 'chromium',
    device: 'Pixel 5',
    name: 'Android Chrome (Pixel 5)',
  },
  {
    browserType: 'chromium',
    device: 'Galaxy S9+',
    name: 'Android Chrome (Galaxy S9+)',
  },
  {
    browserType: 'webkit',
    device: 'Desktop Safari',
    name: 'Desktop Safari',
  },
  {
    browserType: 'firefox',
    device: 'Desktop Firefox',
    name: 'Desktop Firefox',
  },
  {
    browserType: 'chromium',
    device: 'Desktop Edge',
    name: 'Desktop Edge',
  },
  {
    browserType: 'chromium',
    device: 'Desktop Chrome',
    name: 'Desktop Chrome',
  },
];

// Critical pages to test
const criticalPages = [
  { path: '/', name: 'Homepage' },
  { path: '/us-canada-tax-calculator', name: 'Calculator' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/sign-up', name: 'Signup' },
  { path: '/blog', name: 'Blog Index' },
];

async function ensureDirectory(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function testPageRendering(
  page: Page,
  url: string,
  pageName: string,
  browserName: string,
  deviceName: string
): Promise<TestResult> {
  const issues: string[] = [];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotName = `${browserName.replace(/\s+/g, '-')}_${deviceName.replace(/\s+/g, '-')}_${pageName.replace(/\s+/g, '-')}_${timestamp}.png`;
  const screenshotPath = path.join(SCREENSHOT_DIR, screenshotName);

  console.log(`  Testing ${pageName} on ${browserName} (${deviceName})...`);

  try {
    // Navigate to page with extended timeout for production
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    if (!response || !response.ok()) {
      issues.push(`HTTP ${response?.status() || 'UNKNOWN'} error when loading page`);
    }

    // Wait for page to fully render
    await page.waitForLoadState('load');

    // Check for JavaScript errors
    const jsErrors: string[] = [];
    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });

    // Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Basic rendering checks
    const checks = [
      {
        name: 'Page title exists',
        test: async () => {
          const title = await page.title();
          return title && title.length > 0;
        },
      },
      {
        name: 'No blank page',
        test: async () => {
          const bodyText = await page.textContent('body');
          return bodyText && bodyText.trim().length > 100;
        },
      },
      {
        name: 'No horizontal scrollbar',
        test: async () => {
          const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
          const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
          return scrollWidth <= clientWidth + 1; // Allow 1px tolerance
        },
      },
      {
        name: 'Viewport meta tag exists',
        test: async () => {
          const viewportMeta = await page.locator('meta[name="viewport"]').count();
          return viewportMeta > 0;
        },
      },
    ];

    for (const check of checks) {
      try {
        const passed = await check.test();
        if (!passed) {
          issues.push(`Failed: ${check.name}`);
        }
      } catch (error) {
        issues.push(`Error during ${check.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Check for layout issues
    const layoutIssues = await page.evaluate(() => {
      const issues: string[] = [];

      // Check for elements overflowing viewport
      const allElements = document.querySelectorAll('*');
      allElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
          const tagName = element.tagName.toLowerCase();
          const id = element.id ? `#${element.id}` : '';
          const classes = element.className ? `.${Array.from(element.classList).join('.')}` : '';
          issues.push(`Element overflows viewport: ${tagName}${id}${classes} (${Math.round(rect.right)}px > ${window.innerWidth}px)`);
        }
      });

      // Check for invisible text (color too similar to background)
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button');
      textElements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;

        // Simple contrast check (not comprehensive)
        if (color === backgroundColor) {
          issues.push(`Potential invisible text: ${element.tagName.toLowerCase()}`);
        }
      });

      return issues;
    });

    issues.push(...layoutIssues);

    // Add JS errors if any
    if (jsErrors.length > 0) {
      issues.push(...jsErrors.map((err) => `JavaScript error: ${err}`));
    }

    // Capture screenshot
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    console.log(`    ✓ Screenshot saved: ${screenshotName}`);
    if (issues.length > 0) {
      console.log(`    ⚠ ${issues.length} issue(s) detected`);
    }

    const viewport = page.viewportSize() || { width: 0, height: 0 };
    const userAgent = await page.evaluate(() => navigator.userAgent);

    return {
      browser: browserName,
      device: deviceName,
      page: pageName,
      status: issues.length === 0 ? 'pass' : issues.length > 3 ? 'fail' : 'warning',
      issues,
      screenshot: screenshotName,
      viewport,
      userAgent,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    issues.push(`Fatal error: ${errorMessage}`);

    // Try to capture screenshot even on error
    try {
      await page.screenshot({
        path: screenshotPath,
      });
    } catch (screenshotError) {
      console.log(`    ✗ Failed to capture screenshot: ${screenshotError}`);
    }

    return {
      browser: browserName,
      device: deviceName,
      page: pageName,
      status: 'fail',
      issues,
      screenshot: screenshotName,
      viewport: page.viewportSize() || { width: 0, height: 0 },
      userAgent: '',
      timestamp: new Date().toISOString(),
    };
  }
}

async function runTestConfiguration(config: typeof testConfigurations[0]): Promise<void> {
  let browser: Browser | null = null;

  try {
    console.log(`\n=== Testing ${config.name} ===`);

    // Launch appropriate browser
    if (config.browserType === 'chromium') {
      browser = await chromium.launch({ headless: true });
    } else if (config.browserType === 'firefox') {
      browser = await firefox.launch({ headless: true });
    } else if (config.browserType === 'webkit') {
      browser = await webkit.launch({ headless: true });
    }

    if (!browser) {
      throw new Error(`Failed to launch browser: ${config.browserType}`);
    }

    // Get device configuration
    const deviceConfig = devices[config.device] || {};

    // Create context with device emulation
    const context = await browser.newContext({
      ...deviceConfig,
      locale: 'en-US',
      timezoneId: 'America/Los_Angeles',
    });

    const page = await context.newPage();

    // Test primary URL, fallback if needed
    let baseUrl = PRODUCTION_URL;
    try {
      const response = await page.goto(baseUrl, { timeout: 10000 });
      if (!response || !response.ok()) {
        console.log(`  Primary URL failed (${response?.status()}), trying fallback...`);
        baseUrl = FALLBACK_URL;
      }
    } catch (error) {
      console.log(`  Primary URL unreachable, trying fallback...`);
      baseUrl = FALLBACK_URL;
    }

    // Test each critical page
    for (const pageConfig of criticalPages) {
      const url = `${baseUrl}${pageConfig.path}`;
      const result = await testPageRendering(
        page,
        url,
        pageConfig.name,
        config.name,
        config.device
      );
      testResults.push(result);
    }

    await context.close();
    await browser.close();

    console.log(`✓ Completed testing ${config.name}`);
  } catch (error) {
    console.error(`✗ Error testing ${config.name}:`, error);
    if (browser) {
      await browser.close();
    }
  }
}

async function analyzeResults(): Promise<void> {
  console.log('\n=== Analyzing Results ===');

  // Group issues by type
  const issuesByType = new Map<string, Set<string>>();

  testResults.forEach((result) => {
    result.issues.forEach((issue) => {
      // Extract issue type (before the colon if exists)
      const issueType = issue.split(':')[0];
      if (!issuesByType.has(issueType)) {
        issuesByType.set(issueType, new Set());
      }
      issuesByType.get(issueType)?.add(`${result.browser} - ${result.device} - ${result.page}`);
    });
  });

  // Create rendering issues list
  issuesByType.forEach((affectedBrowsers, issueType) => {
    const affectedPages = new Set<string>();
    testResults.forEach((result) => {
      if (result.issues.some((issue) => issue.startsWith(issueType))) {
        affectedPages.add(result.page);
      }
    });

    // Determine severity
    let severity: RenderingIssue['severity'] = 'minor';
    if (affectedBrowsers.size > 4) {
      severity = 'critical';
    } else if (affectedBrowsers.size > 2) {
      severity = 'major';
    }

    renderingIssues.push({
      severity,
      description: issueType,
      affectedBrowsers: Array.from(affectedBrowsers),
      affectedPages: Array.from(affectedPages),
    });
  });

  // Sort by severity
  renderingIssues.sort((a, b) => {
    const severityOrder = { critical: 0, major: 1, minor: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

async function generateReport(): Promise<void> {
  console.log('\n=== Generating Report ===');

  const totalTests = testResults.length;
  const passedTests = testResults.filter((r) => r.status === 'pass').length;
  const warningTests = testResults.filter((r) => r.status === 'warning').length;
  const failedTests = testResults.filter((r) => r.status === 'fail').length;

  const report = `# Cross-Browser Device Testing Report

**Generated:** ${new Date().toISOString()}
**Production URL:** ${PRODUCTION_URL}
**Total Tests:** ${totalTests}
**Passed:** ${passedTests} (${Math.round((passedTests / totalTests) * 100)}%)
**Warnings:** ${warningTests} (${Math.round((warningTests / totalTests) * 100)}%)
**Failed:** ${failedTests} (${Math.round((failedTests / totalTests) * 100)}%)

## Executive Summary

${
  failedTests === 0 && warningTests === 0
    ? '✅ **All tests passed!** The site renders correctly across all tested browsers and devices.'
    : failedTests > 0
    ? `❌ **Critical issues found.** ${failedTests} test(s) failed across different browser/device combinations. Immediate attention required.`
    : `⚠️ **Minor issues found.** ${warningTests} test(s) completed with warnings. Review recommended but not blocking.`
}

## Test Matrix

| Browser | Device | Homepage | Calculator | Pricing | Signup | Blog | Status |
|---------|--------|----------|------------|---------|--------|------|--------|
${testConfigurations
  .map((config) => {
    const results = testResults.filter((r) => r.browser === config.name && r.device === config.device);
    const statusIcons = criticalPages.map((page) => {
      const result = results.find((r) => r.page === page.name);
      if (!result) return '❓';
      return result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    });

    const overallStatus = results.every((r) => r.status === 'pass')
      ? '✅ PASS'
      : results.some((r) => r.status === 'fail')
      ? '❌ FAIL'
      : '⚠️ WARN';

    return `| ${config.name} | ${config.device} | ${statusIcons[0]} | ${statusIcons[1]} | ${statusIcons[2]} | ${statusIcons[3]} | ${statusIcons[4]} | ${overallStatus} |`;
  })
  .join('\n')}

## Rendering Issues

${
  renderingIssues.length === 0
    ? '_No rendering issues detected across all tested configurations._'
    : renderingIssues
        .map(
          (issue) => `### ${issue.severity === 'critical' ? '🔴' : issue.severity === 'major' ? '🟠' : '🟡'} ${issue.description}

**Severity:** ${issue.severity.toUpperCase()}
**Affected Browsers:** ${issue.affectedBrowsers.length}
**Affected Pages:** ${issue.affectedPages.join(', ')}

**Details:**
${issue.affectedBrowsers.map((browser) => `- ${browser}`).join('\n')}
`
        )
        .join('\n')
}

## Detailed Test Results

${testResults
  .map(
    (result) => `### ${result.browser} - ${result.device} - ${result.page}

**Status:** ${result.status === 'pass' ? '✅ PASS' : result.status === 'warning' ? '⚠️ WARNING' : '❌ FAIL'}
**Viewport:** ${result.viewport.width}x${result.viewport.height}
**User Agent:** \`${result.userAgent}\`
**Screenshot:** [${result.screenshot}](./screenshots/cross-browser-testing/${result.screenshot})
**Timestamp:** ${result.timestamp}

${
  result.issues.length === 0
    ? '_No issues detected._'
    : `**Issues Detected (${result.issues.length}):**\n${result.issues.map((issue, idx) => `${idx + 1}. ${issue}`).join('\n')}`
}

---
`
  )
  .join('\n')}

## Screenshots

All screenshots are saved in: \`docs/screenshots/cross-browser-testing/\`

### Homepage Screenshots
${testConfigurations
  .map((config) => {
    const result = testResults.find((r) => r.browser === config.name && r.page === 'Homepage');
    return result ? `- [${config.name} (${config.device})](./screenshots/cross-browser-testing/${result.screenshot})` : '';
  })
  .filter(Boolean)
  .join('\n')}

### Calculator Screenshots
${testConfigurations
  .map((config) => {
    const result = testResults.find((r) => r.browser === config.name && r.page === 'Calculator');
    return result ? `- [${config.name} (${config.device})](./screenshots/cross-browser-testing/${result.screenshot})` : '';
  })
  .filter(Boolean)
  .join('\n')}

### Pricing Screenshots
${testConfigurations
  .map((config) => {
    const result = testResults.find((r) => r.browser === config.name && r.page === 'Pricing');
    return result ? `- [${config.name} (${config.device})](./screenshots/cross-browser-testing/${result.screenshot})` : '';
  })
  .filter(Boolean)
  .join('\n')}

## Browser/Device Coverage

| Category | Browsers/Devices Tested |
|----------|------------------------|
| **Mobile iOS** | iPhone 13, iPhone 13 Pro (Safari) |
| **Mobile Android** | Pixel 5, Galaxy S9+ (Chrome) |
| **Desktop** | Safari, Firefox, Edge, Chrome |
| **Total Configurations** | ${testConfigurations.length} |
| **Total Pages Tested** | ${criticalPages.length} |
| **Total Test Cases** | ${totalTests} |

## Recommendations

${
  failedTests === 0 && warningTests === 0
    ? `✅ **No immediate action required.** All tests passed successfully.

**Next Steps:**
1. Continue monitoring cross-browser compatibility in CI/CD pipeline
2. Add automated visual regression testing for future changes
3. Consider testing on additional devices (older iOS/Android versions, tablets)
`
    : `${
        renderingIssues
          .filter((i) => i.severity === 'critical' || i.severity === 'major')
          .map(
            (issue) => `**${issue.severity === 'critical' ? 'P0-CRITICAL' : 'P1-HIGH'}:** Fix "${issue.description}" affecting ${
              issue.affectedBrowsers.length
            } browser(s)`
          )
          .join('\n') || '_No high-priority fixes required._'
      }

**Additional Recommendations:**
1. Review all failed/warning tests in detail
2. Fix rendering issues starting with critical severity
3. Re-run tests after fixes to verify resolution
4. Consider adding automated cross-browser testing to CI/CD
`
}

## Testing Methodology

1. **Browser Coverage:** Tested on Chromium (Chrome/Edge), Firefox, and WebKit (Safari)
2. **Device Emulation:** Used Playwright device emulation for mobile testing
3. **Test Pages:** Homepage, Calculator, Pricing, Signup, Blog Index
4. **Checks Performed:**
   - HTTP response status
   - Page title and content rendering
   - Horizontal scrollbar detection
   - Viewport meta tag presence
   - Element overflow detection
   - JavaScript error detection
   - Full-page screenshot capture
5. **Automation:** Fully automated using Playwright with TypeScript
6. **Evidence:** Full-page screenshots captured for all test cases

## Appendix: Test Configuration

\`\`\`json
${JSON.stringify(testConfigurations, null, 2)}
\`\`\`

## Appendix: Full Results Data

\`\`\`json
${JSON.stringify(testResults, null, 2)}
\`\`\`
`;

  await fs.writeFile(REPORT_PATH, report, 'utf-8');
  console.log(`✓ Report saved to: ${REPORT_PATH}`);
}

async function main(): Promise<void> {
  console.log('=== Cross-Browser Device Testing ===');
  console.log(`Testing URL: ${PRODUCTION_URL}`);
  console.log(`Fallback URL: ${FALLBACK_URL}`);
  console.log(`Configurations: ${testConfigurations.length}`);
  console.log(`Pages per configuration: ${criticalPages.length}`);
  console.log(`Total test cases: ${testConfigurations.length * criticalPages.length}\n`);

  // Ensure screenshot directory exists
  await ensureDirectory(SCREENSHOT_DIR);

  // Run all test configurations
  for (const config of testConfigurations) {
    await runTestConfiguration(config);
  }

  // Analyze results
  await analyzeResults();

  // Generate report
  await generateReport();

  // Print summary
  console.log('\n=== Summary ===');
  console.log(`Total tests: ${testResults.length}`);
  console.log(`Passed: ${testResults.filter((r) => r.status === 'pass').length}`);
  console.log(`Warnings: ${testResults.filter((r) => r.status === 'warning').length}`);
  console.log(`Failed: ${testResults.filter((r) => r.status === 'fail').length}`);
  console.log(`Rendering issues: ${renderingIssues.length}`);
  console.log(`\nReport: ${REPORT_PATH}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}/`);

  // Exit with appropriate code
  const failedCount = testResults.filter((r) => r.status === 'fail').length;
  process.exit(failedCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
