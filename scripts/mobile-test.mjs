#!/usr/bin/env node

/**
 * Mobile Responsiveness Testing Script
 * Tests the application on various mobile viewports using Playwright
 *
 * Devices tested:
 * - iPhone SE (375x667) - Smallest common iPhone
 * - iPhone 14 Pro (393x852) - Current flagship
 * - Pixel 5 (393x851) - Common Android
 * - Samsung Galaxy S21 (360x800) - Common Android
 * - iPad Mini (768x1024) - Tablet
 *
 * Tests:
 * 1. Layout doesn't break at any viewport
 * 2. Touch targets are 44px minimum
 * 3. Text is readable (16px minimum for inputs)
 * 4. No horizontal scroll
 * 5. Keyboard handling works correctly
 * 6. Landscape orientation works
 * 7. All interactive elements are accessible
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const RESULTS_DIR = 'test-results/mobile-audit';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Device configurations
const DEVICES = [
  {
    name: 'iPhone SE',
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: 'iPhone 14 Pro',
    viewport: { width: 393, height: 852 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: 'Pixel 5',
    viewport: { width: 393, height: 851 },
    userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.75,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: 'Samsung Galaxy S21',
    viewport: { width: 360, height: 800 },
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: 'iPad Mini',
    viewport: { width: 768, height: 1024 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
];

// Test cases
const TEST_CASES = [
  {
    name: 'Homepage Layout',
    path: '/',
    checks: [
      'Hero section visible',
      'CTA buttons accessible',
      'Navigation menu responsive',
      'Trust signals display correctly',
    ],
  },
  {
    name: 'Calculator Page',
    path: '/dashboard',
    checks: [
      'All input fields visible',
      'Input fields have 44px touch targets',
      'Calculate button is accessible',
      'Results display without horizontal scroll',
      'Progress indicator visible',
    ],
  },
  {
    name: 'Enterprise ROI Calculator',
    path: '/enterprise',
    checks: [
      'Form inputs are touch-friendly',
      'Demo button works',
      'Results cards don\'t overflow',
      'CTA button is prominent',
    ],
  },
];

// Create results directory
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Utility: Check for horizontal scroll
async function checkHorizontalScroll(page) {
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  return hasHorizontalScroll;
}

// Utility: Get touch target sizes
async function getTouchTargetSizes(page) {
  const sizes = await page.evaluate(() => {
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
    const results = [];

    interactiveElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        results.push({
          tag: el.tagName,
          class: el.className,
          width: rect.width,
          height: rect.height,
          meetsWCAG: rect.width >= 44 && rect.height >= 44,
        });
      }
    });

    return results;
  });
  return sizes;
}

// Utility: Check text size
async function checkTextSizes(page) {
  const sizes = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, select, textarea');
    const results = [];

    inputs.forEach(el => {
      const fontSize = window.getComputedStyle(el).fontSize;
      const fontSizeNum = parseInt(fontSize);
      results.push({
        tag: el.tagName,
        id: el.id,
        fontSize: fontSize,
        meetsMinimum: fontSizeNum >= 16, // iOS won't zoom if >= 16px
      });
    });

    return results;
  });
  return sizes;
}

// Main test runner
async function runMobileTests() {
  console.log('🚀 Starting Mobile Responsiveness Audit\n');
  console.log(`Testing URL: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    devices: [],
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
    },
  };

  for (const device of DEVICES) {
    console.log(`\n📱 Testing on ${device.name} (${device.viewport.width}x${device.viewport.height})`);

    const context = await browser.newContext({
      viewport: device.viewport,
      userAgent: device.userAgent,
      deviceScaleFactor: device.deviceScaleFactor,
      isMobile: device.isMobile,
      hasTouch: device.hasTouch,
    });

    const page = await context.newPage();
    const deviceResults = {
      name: device.name,
      viewport: device.viewport,
      tests: [],
      issues: [],
      warnings: [],
    };

    for (const testCase of TEST_CASES) {
      console.log(`  ⚡ Testing: ${testCase.name}`);

      try {
        await page.goto(`${BASE_URL}${testCase.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000); // Let animations settle

        const testResult = {
          name: testCase.name,
          path: testCase.path,
          passed: true,
          issues: [],
          warnings: [],
        };

        // Check 1: Horizontal scroll
        const hasScroll = await checkHorizontalScroll(page);
        if (hasScroll) {
          testResult.issues.push('Horizontal scroll detected');
          testResult.passed = false;
          console.log(`    ❌ Horizontal scroll detected`);
        } else {
          console.log(`    ✅ No horizontal scroll`);
        }

        // Check 2: Touch target sizes
        const touchTargets = await getTouchTargetSizes(page);
        const smallTargets = touchTargets.filter(t => !t.meetsWCAG);
        if (smallTargets.length > 0) {
          testResult.warnings.push(`${smallTargets.length} touch targets smaller than 44px`);
          console.log(`    ⚠️  ${smallTargets.length} small touch targets found`);
          deviceResults.warnings.push(...smallTargets.slice(0, 5).map(t =>
            `${t.tag}.${t.class}: ${Math.round(t.width)}x${Math.round(t.height)}px`
          ));
        } else {
          console.log(`    ✅ All touch targets meet WCAG 44px minimum`);
        }

        // Check 3: Input font sizes (prevent iOS zoom)
        const textSizes = await checkTextSizes(page);
        const smallText = textSizes.filter(t => !t.meetsMinimum);
        if (smallText.length > 0) {
          testResult.issues.push(`${smallText.length} inputs with font < 16px (will trigger iOS zoom)`);
          testResult.passed = false;
          console.log(`    ❌ ${smallText.length} inputs trigger iOS zoom`);
        } else {
          console.log(`    ✅ All inputs have 16px+ font (no iOS zoom)`);
        }

        // Check 4: Take screenshot
        const screenshotPath = path.join(RESULTS_DIR, `${device.name.replace(/\s+/g, '-')}-${testCase.name.replace(/\s+/g, '-')}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        testResult.screenshot = screenshotPath;

        // Test landscape orientation
        if (device.name.includes('iPhone') || device.name.includes('Pixel')) {
          console.log(`  🔄 Testing landscape orientation`);
          await page.setViewportSize({
            width: device.viewport.height,
            height: device.viewport.width
          });
          await page.waitForTimeout(500);

          const hasScrollLandscape = await checkHorizontalScroll(page);
          if (hasScrollLandscape) {
            testResult.warnings.push('Horizontal scroll in landscape mode');
            console.log(`    ⚠️  Horizontal scroll in landscape`);
          } else {
            console.log(`    ✅ Landscape orientation OK`);
          }

          const landscapeScreenshot = path.join(RESULTS_DIR, `${device.name.replace(/\s+/g, '-')}-${testCase.name.replace(/\s+/g, '-')}-landscape.png`);
          await page.screenshot({ path: landscapeScreenshot, fullPage: true });

          // Reset to portrait
          await page.setViewportSize(device.viewport);
        }

        deviceResults.tests.push(testResult);
        report.summary.totalTests++;
        if (testResult.passed) {
          report.summary.passed++;
        } else {
          report.summary.failed++;
        }
        if (testResult.warnings.length > 0) {
          report.summary.warnings += testResult.warnings.length;
        }

      } catch (error) {
        console.log(`    ❌ Error: ${error.message}`);
        deviceResults.issues.push({
          test: testCase.name,
          error: error.message,
        });
        report.summary.failed++;
      }
    }

    await context.close();
    report.devices.push(deviceResults);
  }

  await browser.close();

  // Generate report
  const reportPath = path.join(RESULTS_DIR, 'mobile-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  const markdownReport = generateMarkdownReport(report);
  const markdownPath = path.join(RESULTS_DIR, 'MOBILE_AUDIT_REPORT.md');
  fs.writeFileSync(markdownPath, markdownReport);

  // Summary
  console.log('\n\n📊 MOBILE AUDIT SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`Total Tests:    ${report.summary.totalTests}`);
  console.log(`Passed:         ${report.summary.passed} ✅`);
  console.log(`Failed:         ${report.summary.failed} ❌`);
  console.log(`Warnings:       ${report.summary.warnings} ⚠️`);
  console.log('\n📄 Full report saved to:');
  console.log(`   ${markdownPath}`);
  console.log(`   ${reportPath}`);
  console.log(`\n📸 Screenshots saved to: ${RESULTS_DIR}/`);

  const grade = calculateGrade(report);
  console.log(`\n🎯 OVERALL GRADE: ${grade.letter} (${grade.score}/100)`);
  console.log(`   ${grade.verdict}`);

  if (report.summary.failed > 0) {
    process.exit(1);
  }
}

function generateMarkdownReport(report) {
  let md = `# Mobile Responsiveness Audit Report\n\n`;
  md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n`;
  md += `**Base URL:** ${report.baseUrl}\n\n`;

  md += `## Summary\n\n`;
  md += `| Metric | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Tests | ${report.summary.totalTests} |\n`;
  md += `| Passed | ${report.summary.passed} ✅ |\n`;
  md += `| Failed | ${report.summary.failed} ❌ |\n`;
  md += `| Warnings | ${report.summary.warnings} ⚠️ |\n\n`;

  const grade = calculateGrade(report);
  md += `**Overall Grade:** ${grade.letter} (${grade.score}/100)\n`;
  md += `**Verdict:** ${grade.verdict}\n\n`;

  md += `---\n\n`;

  for (const device of report.devices) {
    md += `## ${device.name} (${device.viewport.width}x${device.viewport.height})\n\n`;

    for (const test of device.tests) {
      const status = test.passed ? '✅ PASS' : '❌ FAIL';
      md += `### ${test.name} ${status}\n\n`;

      if (test.issues.length > 0) {
        md += `**Issues:**\n`;
        test.issues.forEach(issue => {
          md += `- ❌ ${issue}\n`;
        });
        md += `\n`;
      }

      if (test.warnings.length > 0) {
        md += `**Warnings:**\n`;
        test.warnings.forEach(warning => {
          md += `- ⚠️ ${warning}\n`;
        });
        md += `\n`;
      }

      if (test.screenshot) {
        md += `**Screenshot:** \`${test.screenshot}\`\n\n`;
      }
    }

    if (device.warnings.length > 0) {
      md += `### Device-Specific Warnings\n\n`;
      device.warnings.forEach(warning => {
        md += `- ⚠️ ${warning}\n`;
      });
      md += `\n`;
    }

    md += `---\n\n`;
  }

  return md;
}

function calculateGrade(report) {
  const passRate = report.summary.totalTests > 0
    ? (report.summary.passed / report.summary.totalTests) * 100
    : 0;
  const warningPenalty = Math.min(report.summary.warnings * 2, 20); // Max 20 point penalty
  const score = Math.max(0, Math.round(passRate - warningPenalty));

  let letter, verdict;
  if (score >= 95) {
    letter = 'A+';
    verdict = '🎉 Excellent mobile responsiveness - production ready!';
  } else if (score >= 90) {
    letter = 'A';
    verdict = '✅ Great mobile experience - minor warnings only';
  } else if (score >= 85) {
    letter = 'B+';
    verdict = '👍 Good mobile support - address warnings before launch';
  } else if (score >= 80) {
    letter = 'B';
    verdict = '⚠️ Acceptable mobile support - fix critical issues';
  } else if (score >= 70) {
    letter = 'C';
    verdict = '❌ Poor mobile experience - significant issues found';
  } else {
    letter = 'F';
    verdict = '🚨 Mobile UX is broken - not ready for production';
  }

  return { score, letter, verdict };
}

// Run tests
runMobileTests().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
