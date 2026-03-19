#!/usr/bin/env tsx
/**
 * Production Health Baseline Verification Script
 *
 * This script provides EVIDENCE-BASED verification of production health:
 * 1. Screenshot of production site
 * 2. Calculator workflow verification
 * 3. Stripe checkout test (if possible)
 * 4. Environment variable audit (masked)
 *
 * Usage: npm run verify:health-baseline
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface HealthCheckResult {
  timestamp: string;
  productionUrl: string;
  checks: {
    siteAccessibility: CheckResult;
    calculatorAvailability: CheckResult;
    stripeConfiguration: CheckResult;
    environmentVariables: EnvAuditResult;
  };
  evidence: {
    screenshotPath?: string;
    videoPath?: string;
    transactionId?: string;
    envAuditPath?: string;
  };
}

interface CheckResult {
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

interface EnvAuditResult extends CheckResult {
  variables: {
    name: string;
    status: 'SET' | 'PLACEHOLDER' | 'MISSING';
    maskedValue: string;
  }[];
}

const PRODUCTION_URL = 'https://taxbridge.vercel.app';
const EVIDENCE_DIR = path.join(process.cwd(), 'docs', 'evidence', `health-baseline-${new Date().toISOString().split('T')[0]}`);

async function ensureEvidenceDir() {
  await fs.mkdir(EVIDENCE_DIR, { recursive: true });
  console.log(`📁 Evidence directory: ${EVIDENCE_DIR}`);
}

async function checkSiteAccessibility(): Promise<CheckResult> {
  try {
    const response = await fetch(PRODUCTION_URL);
    const status = response.status;

    if (status === 200) {
      return {
        status: 'PASS',
        message: `Production site is accessible (HTTP ${status})`,
        details: { url: PRODUCTION_URL, status }
      };
    } else {
      return {
        status: 'FAIL',
        message: `Production site returned HTTP ${status}`,
        details: { url: PRODUCTION_URL, status }
      };
    }
  } catch (error) {
    return {
      status: 'FAIL',
      message: `Production site is not accessible: ${error.message}`,
      details: { error: error.message }
    };
  }
}

async function captureScreenshot(): Promise<string | undefined> {
  try {
    console.log('📸 Capturing production screenshot...');

    // Check if playwright is available
    const screenshotPath = path.join(EVIDENCE_DIR, 'homepage-screenshot.png');

    const screenshotScript = `
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('${PRODUCTION_URL}', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '${screenshotPath}', fullPage: true });
  await browser.close();
})();
    `;

    const scriptPath = path.join(EVIDENCE_DIR, 'capture-screenshot.js');
    await fs.writeFile(scriptPath, screenshotScript);

    await execAsync(`node ${scriptPath}`);

    console.log(`✅ Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  } catch (error) {
    console.error(`❌ Screenshot capture failed: ${error.message}`);
    return undefined;
  }
}

async function checkCalculatorAvailability(): Promise<CheckResult> {
  try {
    const calculatorUrl = `${PRODUCTION_URL}/us-canada-tax-calculator`;
    const response = await fetch(calculatorUrl);
    const status = response.status;

    if (status === 200) {
      return {
        status: 'PASS',
        message: 'Calculator page is accessible',
        details: { url: calculatorUrl, status }
      };
    } else {
      return {
        status: 'FAIL',
        message: `Calculator page returned HTTP ${status}`,
        details: { url: calculatorUrl, status }
      };
    }
  } catch (error) {
    return {
      status: 'FAIL',
      message: `Calculator page check failed: ${error.message}`,
      details: { error: error.message }
    };
  }
}

async function auditEnvironmentVariables(): Promise<EnvAuditResult> {
  const criticalVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_POSTHOG_KEY',
    'NEXT_PUBLIC_POSTHOG_HOST',
    'SENTRY_AUTH_TOKEN',
    'NEXT_PUBLIC_SENTRY_DSN',
    'DATABASE_URL',
    'POSTGRES_URL',
    'POSTGRES_PRISMA_URL',
    'RESEND_API_KEY',
    'OPENAI_API_KEY'
  ];

  const variables: EnvAuditResult['variables'] = [];
  let hasPlaceholders = false;
  let hasMissing = false;

  for (const varName of criticalVars) {
    const value = process.env[varName];

    if (!value) {
      variables.push({
        name: varName,
        status: 'MISSING',
        maskedValue: '[NOT SET]'
      });
      hasMissing = true;
    } else if (
      value.includes('YOUR_') ||
      value.includes('XXXXX') ||
      value.includes('placeholder') ||
      value.includes('test_') ||
      value === 'sk_test_YOUR_SECRET_KEY_HERE' ||
      value === 'pk_test_YOUR_PUBLISHABLE_KEY_HERE'
    ) {
      variables.push({
        name: varName,
        status: 'PLACEHOLDER',
        maskedValue: maskValue(value)
      });
      hasPlaceholders = true;
    } else {
      variables.push({
        name: varName,
        status: 'SET',
        maskedValue: maskValue(value)
      });
    }
  }

  const status: 'PASS' | 'FAIL' | 'WARNING' =
    hasPlaceholders || hasMissing ? 'FAIL' : 'PASS';

  const message = status === 'PASS'
    ? 'All critical environment variables are properly set'
    : `Found ${variables.filter(v => v.status !== 'SET').length} issues with environment variables`;

  return {
    status,
    message,
    variables
  };
}

function maskValue(value: string): string {
  if (value.length <= 8) {
    return '***';
  }
  const prefix = value.substring(0, 4);
  const suffix = value.substring(value.length - 4);
  return `${prefix}...${suffix} (${value.length} chars)`;
}

async function checkStripeConfiguration(): Promise<CheckResult> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!stripeKey || !publishableKey) {
    return {
      status: 'FAIL',
      message: 'Stripe keys are missing',
      details: { secretKey: !!stripeKey, publishableKey: !!publishableKey }
    };
  }

  const isTestMode = stripeKey.startsWith('sk_test_') || publishableKey.startsWith('pk_test_');
  const isPlaceholder = stripeKey.includes('YOUR_') || publishableKey.includes('YOUR_');

  if (isPlaceholder) {
    return {
      status: 'FAIL',
      message: 'Stripe keys are placeholders - cannot accept payments',
      details: { mode: 'PLACEHOLDER', canAcceptPayments: false }
    };
  }

  if (isTestMode) {
    return {
      status: 'WARNING',
      message: 'Stripe is in TEST mode - can only accept test payments',
      details: { mode: 'TEST', canAcceptPayments: true, isProduction: false }
    };
  }

  return {
    status: 'PASS',
    message: 'Stripe is in PRODUCTION mode',
    details: { mode: 'PRODUCTION', canAcceptPayments: true, isProduction: true }
  };
}

async function generateReport(results: HealthCheckResult): Promise<void> {
  const reportPath = path.join(EVIDENCE_DIR, 'health-baseline-report.md');

  const report = `# Production Health Baseline Report

**Timestamp:** ${results.timestamp}
**Production URL:** ${results.productionUrl}

## Executive Summary

${generateExecutiveSummary(results)}

## Detailed Checks

### 1. Site Accessibility
- **Status:** ${results.checks.siteAccessibility.status}
- **Message:** ${results.checks.siteAccessibility.message}
${results.checks.siteAccessibility.details ? `- **Details:** ${JSON.stringify(results.checks.siteAccessibility.details, null, 2)}` : ''}

### 2. Calculator Availability
- **Status:** ${results.checks.calculatorAvailability.status}
- **Message:** ${results.checks.calculatorAvailability.message}
${results.checks.calculatorAvailability.details ? `- **Details:** ${JSON.stringify(results.checks.calculatorAvailability.details, null, 2)}` : ''}

### 3. Stripe Configuration
- **Status:** ${results.checks.stripeConfiguration.status}
- **Message:** ${results.checks.stripeConfiguration.message}
${results.checks.stripeConfiguration.details ? `- **Details:** ${JSON.stringify(results.checks.stripeConfiguration.details, null, 2)}` : ''}

### 4. Environment Variables Audit

**Status:** ${results.checks.environmentVariables.status}
**Message:** ${results.checks.environmentVariables.message}

| Variable | Status | Masked Value |
|----------|--------|--------------|
${results.checks.environmentVariables.variables.map(v =>
  `| ${v.name} | ${v.status} | \`${v.maskedValue}\` |`
).join('\n')}

## Evidence Artifacts

${results.evidence.screenshotPath ? `- Screenshot: ${results.evidence.screenshotPath}` : '- Screenshot: Not captured'}
${results.evidence.videoPath ? `- Video: ${results.evidence.videoPath}` : '- Video: Not captured'}
${results.evidence.transactionId ? `- Transaction ID: ${results.evidence.transactionId}` : '- Transaction: Not executed'}
- Environment Audit: This report

## Recommendations

${generateRecommendations(results)}

---

*Report generated on ${new Date().toISOString()}*
`;

  await fs.writeFile(reportPath, report);
  console.log(`📄 Report saved: ${reportPath}`);

  // Also save JSON version
  const jsonPath = path.join(EVIDENCE_DIR, 'health-baseline-report.json');
  await fs.writeFile(jsonPath, JSON.stringify(results, null, 2));
  console.log(`📄 JSON report saved: ${jsonPath}`);
}

function generateExecutiveSummary(results: HealthCheckResult): string {
  const checks = [
    results.checks.siteAccessibility,
    results.checks.calculatorAvailability,
    results.checks.stripeConfiguration,
    results.checks.environmentVariables
  ];

  const passing = checks.filter(c => c.status === 'PASS').length;
  const warnings = checks.filter(c => c.status === 'WARNING').length;
  const failing = checks.filter(c => c.status === 'FAIL').length;

  let summary = `**Overall Status:** `;
  if (failing > 0) {
    summary += `⚠️ **FAILING** (${failing} critical issues)\n\n`;
  } else if (warnings > 0) {
    summary += `⚠️ **WARNING** (${warnings} issues need attention)\n\n`;
  } else {
    summary += `✅ **HEALTHY** (All checks passing)\n\n`;
  }

  summary += `- ✅ Passing: ${passing}/4\n`;
  summary += `- ⚠️ Warnings: ${warnings}/4\n`;
  summary += `- ❌ Failing: ${failing}/4\n`;

  return summary;
}

function generateRecommendations(results: HealthCheckResult): string {
  const recommendations: string[] = [];

  if (results.checks.siteAccessibility.status === 'FAIL') {
    recommendations.push('- **CRITICAL:** Fix production site accessibility immediately. Site is not loading.');
  }

  if (results.checks.calculatorAvailability.status === 'FAIL') {
    recommendations.push('- **CRITICAL:** Fix calculator page. This is the core product feature.');
  }

  if (results.checks.stripeConfiguration.status === 'FAIL') {
    recommendations.push('- **CRITICAL:** Replace Stripe placeholder keys with real keys (test or production).');
  } else if (results.checks.stripeConfiguration.status === 'WARNING') {
    recommendations.push('- **WARNING:** Stripe is in TEST mode. Move to PRODUCTION mode to accept real payments.');
  }

  const envIssues = results.checks.environmentVariables.variables.filter(
    v => v.status !== 'SET'
  );

  if (envIssues.length > 0) {
    recommendations.push(`- **WARNING:** ${envIssues.length} environment variables need attention:`);
    envIssues.forEach(v => {
      recommendations.push(`  - \`${v.name}\` is ${v.status}`);
    });
  }

  if (recommendations.length === 0) {
    return '✅ No critical recommendations. All systems operational.';
  }

  return recommendations.join('\n');
}

async function main() {
  console.log('🏥 Production Health Baseline Verification Starting...\n');

  await ensureEvidenceDir();

  const results: HealthCheckResult = {
    timestamp: new Date().toISOString(),
    productionUrl: PRODUCTION_URL,
    checks: {
      siteAccessibility: { status: 'FAIL', message: 'Not checked' },
      calculatorAvailability: { status: 'FAIL', message: 'Not checked' },
      stripeConfiguration: { status: 'FAIL', message: 'Not checked' },
      environmentVariables: { status: 'FAIL', message: 'Not checked', variables: [] }
    },
    evidence: {}
  };

  // Check 1: Site Accessibility
  console.log('1️⃣ Checking site accessibility...');
  results.checks.siteAccessibility = await checkSiteAccessibility();
  console.log(`   ${results.checks.siteAccessibility.status}: ${results.checks.siteAccessibility.message}\n`);

  // Capture screenshot if site is accessible
  if (results.checks.siteAccessibility.status === 'PASS') {
    results.evidence.screenshotPath = await captureScreenshot();
  }

  // Check 2: Calculator Availability
  console.log('2️⃣ Checking calculator availability...');
  results.checks.calculatorAvailability = await checkCalculatorAvailability();
  console.log(`   ${results.checks.calculatorAvailability.status}: ${results.checks.calculatorAvailability.message}\n`);

  // Check 3: Stripe Configuration
  console.log('3️⃣ Checking Stripe configuration...');
  results.checks.stripeConfiguration = await checkStripeConfiguration();
  console.log(`   ${results.checks.stripeConfiguration.status}: ${results.checks.stripeConfiguration.message}\n`);

  // Check 4: Environment Variables
  console.log('4️⃣ Auditing environment variables...');
  results.checks.environmentVariables = await auditEnvironmentVariables();
  console.log(`   ${results.checks.environmentVariables.status}: ${results.checks.environmentVariables.message}\n`);

  // Generate report
  await generateReport(results);

  console.log('\n✅ Health baseline verification complete!');
  console.log(`📁 Evidence saved to: ${EVIDENCE_DIR}`);

  // Exit with appropriate code
  const hasCriticalFailures = [
    results.checks.siteAccessibility,
    results.checks.calculatorAvailability,
    results.checks.stripeConfiguration,
    results.checks.environmentVariables
  ].some(check => check.status === 'FAIL');

  process.exit(hasCriticalFailures ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
