#!/usr/bin/env tsx
/**
 * Sentry Production Verification Script
 *
 * Tests that Sentry is properly configured and capturing errors from production.
 *
 * Usage:
 *   npm run verify:sentry
 *   # or
 *   npx tsx scripts/verify-sentry-production.ts
 *
 * Exit codes:
 *   0 = All checks passed, Sentry fully operational
 *   1 = Configuration errors detected, Sentry not working
 */

import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  step: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
}

const results: VerificationResult[] = [];

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkEnvVar(name: string, expectedPattern?: RegExp): VerificationResult {
  const value = process.env[name];

  if (!value) {
    return {
      step: `Check ${name}`,
      status: 'fail',
      message: `${name} is not set`,
      details: 'This environment variable is required for Sentry to work',
    };
  }

  // Check for placeholder values
  const placeholders = [
    'YOUR_',
    'PLACEHOLDER',
    'REPLACE_ME',
    'TODO',
    'CHANGEME',
    'o0000000.ingest.sentry.io',
    'YOUR_SENTRY_',
  ];

  for (const placeholder of placeholders) {
    if (value.includes(placeholder)) {
      return {
        step: `Check ${name}`,
        status: 'fail',
        message: `${name} contains placeholder value`,
        details: `Current value: ${value.substring(0, 30)}... (contains "${placeholder}")`,
      };
    }
  }

  // Pattern validation
  if (expectedPattern && !expectedPattern.test(value)) {
    return {
      step: `Check ${name}`,
      status: 'fail',
      message: `${name} format is invalid`,
      details: `Expected pattern: ${expectedPattern.source}`,
    };
  }

  return {
    step: `Check ${name}`,
    status: 'pass',
    message: `${name} is properly configured`,
    details: `Value: ${value.substring(0, 40)}...`,
  };
}

function checkFileExists(filePath: string, description: string): VerificationResult {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    return {
      step: `Check ${description}`,
      status: 'fail',
      message: `${description} not found`,
      details: `Expected file at: ${fullPath}`,
    };
  }

  return {
    step: `Check ${description}`,
    status: 'pass',
    message: `${description} exists`,
    details: fullPath,
  };
}

function checkSentryInit(filePath: string, description: string): VerificationResult {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    return {
      step: `Check ${description}`,
      status: 'warn',
      message: `${description} not found`,
      details: fullPath,
    };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  if (!content.includes('Sentry.init')) {
    return {
      step: `Check ${description}`,
      status: 'fail',
      message: `Sentry.init not found in ${description}`,
      details: 'Sentry must be initialized in this file',
    };
  }

  if (!content.includes('dsn:')) {
    return {
      step: `Check ${description}`,
      status: 'fail',
      message: `DSN configuration missing in ${description}`,
      details: 'Sentry.init must include dsn property',
    };
  }

  return {
    step: `Check ${description}`,
    status: 'pass',
    message: `${description} properly configured`,
  };
}

async function testSentryCapture(): Promise<VerificationResult> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const testUrl = `${baseUrl}/api/test-sentry`;

    log(`\n📡 Testing Sentry error capture at ${testUrl}...`, colors.blue);

    const response = await fetch(testUrl);

    if (!response.ok) {
      return {
        step: 'Test Sentry Capture',
        status: 'fail',
        message: `Test endpoint returned ${response.status}`,
        details: await response.text(),
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        step: 'Test Sentry Capture',
        status: 'fail',
        message: 'Test error was not sent to Sentry',
        details: JSON.stringify(data),
      };
    }

    if (!data.eventId) {
      return {
        step: 'Test Sentry Capture',
        status: 'warn',
        message: 'Test completed but no event ID returned',
        details: 'Check Sentry dashboard manually',
      };
    }

    return {
      step: 'Test Sentry Capture',
      status: 'pass',
      message: 'Test error successfully sent to Sentry',
      details: `Event ID: ${data.eventId}`,
    };
  } catch (error) {
    return {
      step: 'Test Sentry Capture',
      status: 'fail',
      message: 'Failed to connect to test endpoint',
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', colors.bold);
  log('║     SENTRY PRODUCTION VERIFICATION                        ║', colors.bold);
  log('╚════════════════════════════════════════════════════════════╝\n', colors.bold);

  log('🔍 Checking environment variables...', colors.blue);

  // Check DSN
  results.push(checkEnvVar(
    'NEXT_PUBLIC_SENTRY_DSN',
    /^https:\/\/[a-f0-9]+@o\d+\.ingest\.sentry\.io\/\d+$/
  ));

  // Check auth token
  results.push(checkEnvVar(
    'SENTRY_AUTH_TOKEN',
    /^sntrys_[a-zA-Z0-9]{64,}$/
  ));

  // Check org and project
  results.push(checkEnvVar('SENTRY_ORG'));
  results.push(checkEnvVar('SENTRY_PROJECT'));

  log('\n🔍 Checking Sentry configuration files...', colors.blue);

  // Check config files exist
  results.push(checkFileExists('sentry.client.config.ts', 'Client config'));
  results.push(checkFileExists('sentry.server.config.ts', 'Server config'));
  results.push(checkFileExists('sentry.edge.config.ts', 'Edge config'));
  results.push(checkFileExists('instrumentation.ts', 'Instrumentation'));

  // Check Sentry is initialized
  results.push(checkSentryInit('sentry.client.config.ts', 'Client initialization'));
  results.push(checkSentryInit('sentry.server.config.ts', 'Server initialization'));

  // Test Sentry capture (only if running locally or can access production)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    results.push(await testSentryCapture());
  } else {
    results.push({
      step: 'Test Sentry Capture',
      status: 'warn',
      message: 'Skipped - NEXT_PUBLIC_APP_URL not set',
      details: 'Set this env var to test error capture',
    });
  }

  // Print results
  log('\n╔════════════════════════════════════════════════════════════╗', colors.bold);
  log('║     VERIFICATION RESULTS                                  ║', colors.bold);
  log('╚════════════════════════════════════════════════════════════╝\n', colors.bold);

  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;

  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    const color = result.status === 'pass' ? colors.green : result.status === 'fail' ? colors.red : colors.yellow;

    log(`${icon} ${result.step}`, color);
    log(`   ${result.message}`, color);
    if (result.details) {
      log(`   ${result.details}`, colors.reset);
    }
    log('');

    if (result.status === 'pass') passCount++;
    else if (result.status === 'fail') failCount++;
    else warnCount++;
  }

  // Summary
  log('╔════════════════════════════════════════════════════════════╗', colors.bold);
  log('║     SUMMARY                                               ║', colors.bold);
  log('╚════════════════════════════════════════════════════════════╝\n', colors.bold);

  log(`✅ Passed: ${passCount}`, colors.green);
  if (warnCount > 0) log(`⚠️  Warnings: ${warnCount}`, colors.yellow);
  if (failCount > 0) log(`❌ Failed: ${failCount}`, colors.red);

  log('');

  if (failCount === 0) {
    log('🎉 SENTRY IS FULLY OPERATIONAL', colors.green + colors.bold);
    log('');
    log('Next steps:', colors.blue);
    log('1. Visit https://sentry.io/organizations/taxbridge/issues/');
    log('2. Verify test error appears within 30 seconds');
    log('3. Take screenshot for task completion evidence');
    log('');
    process.exit(0);
  } else {
    log('🚨 SENTRY CONFIGURATION HAS ERRORS', colors.red + colors.bold);
    log('');
    log('Fix required:', colors.yellow);
    log('1. Review failed checks above');
    log('2. Follow SENTRY_PRODUCTION_ACTIVATION_GUIDE.md');
    log('3. Replace placeholder environment variables');
    log('4. Redeploy to Vercel');
    log('');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error during verification:', error);
  process.exit(1);
});
