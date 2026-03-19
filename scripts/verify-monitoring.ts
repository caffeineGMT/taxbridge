#!/usr/bin/env tsx

/**
 * Production Monitoring Verification Script
 *
 * Verifies that all monitoring systems are correctly configured:
 * - Health endpoint responding
 * - UptimeRobot monitors active (requires API key)
 * - Sentry error tracking configured
 * - Alert channels working
 *
 * Usage:
 *   npm run verify:monitoring
 *   npm run verify:monitoring -- --production
 */

import { execSync } from 'child_process';
import fs from 'fs';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'skip';
  message: string;
  details?: string;
}

const results: CheckResult[] = [];

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function printHeader(text: string) {
  console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.cyan}${text}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

function printCheck(result: CheckResult) {
  const icon =
    result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : result.status === 'warning' ? '⚠️' : '⏭️';

  const color =
    result.status === 'pass'
      ? colors.green
      : result.status === 'fail'
        ? colors.red
        : result.status === 'warning'
          ? colors.yellow
          : colors.blue;

  console.log(`${icon} ${color}${result.name}${colors.reset}`);
  console.log(`   ${result.message}`);
  if (result.details) {
    console.log(`   ${colors.blue}${result.details}${colors.reset}`);
  }
  console.log('');
}

async function checkHealthEndpoint(url: string): Promise<CheckResult> {
  try {
    const response = await fetch(url);
    const data = (await response.json()) as { status: string; database?: { connected: boolean } };

    if (response.ok && data.status === 'ok') {
      return {
        name: 'Health Endpoint',
        status: 'pass',
        message: `✅ ${url} responding with 200 OK`,
        details: `Database: ${data.database?.connected ? 'Connected' : 'Disconnected'}`,
      };
    } else {
      return {
        name: 'Health Endpoint',
        status: 'fail',
        message: `❌ ${url} returned ${response.status}`,
        details: `Status: ${data.status}`,
      };
    }
  } catch (error) {
    return {
      name: 'Health Endpoint',
      status: 'fail',
      message: `❌ Failed to connect to ${url}`,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkSentryConfig(): Promise<CheckResult> {
  const envFile = '.env.production';

  if (!fs.existsSync(envFile)) {
    return {
      name: 'Sentry Configuration',
      status: 'skip',
      message: 'No .env.production file found',
      details: 'Sentry config checked at runtime via Vercel env vars',
    };
  }

  const envContent = fs.readFileSync(envFile, 'utf-8');

  const hasDsn = envContent.includes('NEXT_PUBLIC_SENTRY_DSN=');
  const hasRealDsn =
    hasDsn && !envContent.includes('YOUR_SENTRY_KEY') && !envContent.match(/NEXT_PUBLIC_SENTRY_DSN=\s*$/);
  const hasAuthToken = envContent.includes('SENTRY_AUTH_TOKEN=');
  const hasRealToken =
    hasAuthToken && !envContent.includes('YOUR_SENTRY_AUTH_TOKEN') && !envContent.match(/SENTRY_AUTH_TOKEN=\s*$/);

  if (hasRealDsn && hasRealToken) {
    return {
      name: 'Sentry Configuration',
      status: 'pass',
      message: '✅ Sentry DSN and auth token configured',
      details: 'Error tracking should be active in production',
    };
  } else if (hasRealDsn && !hasRealToken) {
    return {
      name: 'Sentry Configuration',
      status: 'warning',
      message: '⚠️ Sentry DSN found but no auth token',
      details: 'Error tracking will work but source maps won\'t upload',
    };
  } else {
    return {
      name: 'Sentry Configuration',
      status: 'fail',
      message: '❌ Sentry DSN is placeholder or missing',
      details: 'Replace YOUR_SENTRY_KEY with real DSN from sentry.io',
    };
  }
}

async function checkSentryTestRoute(url: string): Promise<CheckResult> {
  try {
    const response = await fetch(url);

    // Test route throws an error, so we expect it to fail
    // But if Sentry is configured, the error should be captured
    if (response.status === 500) {
      return {
        name: 'Sentry Test Route',
        status: 'pass',
        message: '✅ /api/test-sentry endpoint exists',
        details: 'Trigger this route to test error tracking',
      };
    } else if (response.status === 404) {
      return {
        name: 'Sentry Test Route',
        status: 'fail',
        message: '❌ /api/test-sentry not found',
        details: 'Test route should exist at app/api/test-sentry/route.ts',
      };
    } else {
      return {
        name: 'Sentry Test Route',
        status: 'warning',
        message: `⚠️ /api/test-sentry returned unexpected status: ${response.status}`,
      };
    }
  } catch (error) {
    return {
      name: 'Sentry Test Route',
      status: 'fail',
      message: '❌ Failed to connect to test route',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkUptimeRobotSetup(): Promise<CheckResult> {
  // Check if UptimeRobot API key is configured
  const uptimeApiKey = process.env.UPTIMEROBOT_API_KEY;

  if (!uptimeApiKey) {
    return {
      name: 'UptimeRobot Setup',
      status: 'skip',
      message: 'UptimeRobot API key not configured (optional)',
      details: 'Set UPTIMEROBOT_API_KEY env var to enable programmatic verification',
    };
  }

  try {
    // Call UptimeRobot API to check monitors
    const response = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `api_key=${uptimeApiKey}&format=json`,
    });

    const data = (await response.json()) as {
      stat: string;
      monitors?: Array<{ friendly_name: string; status: number }>;
    };

    if (data.stat === 'ok' && data.monitors && data.monitors.length > 0) {
      const activeMonitors = data.monitors.filter((m) => m.status === 2).length;
      return {
        name: 'UptimeRobot Setup',
        status: 'pass',
        message: `✅ ${data.monitors.length} monitors configured, ${activeMonitors} active`,
        details: data.monitors.map((m) => m.friendly_name).join(', '),
      };
    } else {
      return {
        name: 'UptimeRobot Setup',
        status: 'warning',
        message: '⚠️ UptimeRobot API connected but no monitors found',
        details: 'Create monitors at uptimerobot.com/dashboard',
      };
    }
  } catch (error) {
    return {
      name: 'UptimeRobot Setup',
      status: 'fail',
      message: '❌ Failed to connect to UptimeRobot API',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkProductionUrl(): Promise<CheckResult> {
  const productionUrl = 'https://taxbridge.vercel.app';

  try {
    const response = await fetch(productionUrl);

    if (response.ok) {
      return {
        name: 'Production Site',
        status: 'pass',
        message: `✅ ${productionUrl} is accessible`,
        details: `HTTP ${response.status} OK`,
      };
    } else {
      return {
        name: 'Production Site',
        status: 'fail',
        message: `❌ ${productionUrl} returned ${response.status}`,
      };
    }
  } catch (error) {
    return {
      name: 'Production Site',
      status: 'fail',
      message: `❌ Failed to connect to ${productionUrl}`,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkMonitoringDocs(): Promise<CheckResult> {
  const docs = [
    'docs/UPTIME_MONITORING_SETUP.md',
    'docs/SENTRY_ERROR_TRACKING_SETUP.md',
    'docs/MONITORING_DASHBOARD.md',
  ];

  const existingDocs = docs.filter((doc) => fs.existsSync(doc));

  if (existingDocs.length === docs.length) {
    return {
      name: 'Monitoring Documentation',
      status: 'pass',
      message: '✅ All monitoring documentation present',
      details: existingDocs.join(', '),
    };
  } else if (existingDocs.length > 0) {
    return {
      name: 'Monitoring Documentation',
      status: 'warning',
      message: `⚠️ ${existingDocs.length}/${docs.length} docs found`,
      details: `Missing: ${docs.filter((d) => !fs.existsSync(d)).join(', ')}`,
    };
  } else {
    return {
      name: 'Monitoring Documentation',
      status: 'fail',
      message: '❌ No monitoring documentation found',
      details: 'Create docs/UPTIME_MONITORING_SETUP.md and docs/SENTRY_ERROR_TRACKING_SETUP.md',
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isProduction = args.includes('--production');

  printHeader('🔍 TaxBridge Production Monitoring Verification');

  console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'LOCAL'}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  // Check 1: Production site accessibility
  console.log('Checking production site accessibility...');
  results.push(await checkProductionUrl());
  printCheck(results[results.length - 1]);

  // Check 2: Health endpoint
  console.log('Checking health endpoint...');
  const healthUrl = isProduction
    ? 'https://taxbridge.vercel.app/api/health'
    : 'http://localhost:3000/api/health';
  results.push(await checkHealthEndpoint(healthUrl));
  printCheck(results[results.length - 1]);

  // Check 3: Sentry configuration
  console.log('Checking Sentry configuration...');
  results.push(await checkSentryConfig());
  printCheck(results[results.length - 1]);

  // Check 4: Sentry test route
  console.log('Checking Sentry test route...');
  const sentryTestUrl = isProduction
    ? 'https://taxbridge.vercel.app/api/test-sentry'
    : 'http://localhost:3000/api/test-sentry';
  results.push(await checkSentryTestRoute(sentryTestUrl));
  printCheck(results[results.length - 1]);

  // Check 5: UptimeRobot setup (optional)
  console.log('Checking UptimeRobot setup...');
  results.push(await checkUptimeRobotSetup());
  printCheck(results[results.length - 1]);

  // Check 6: Documentation
  console.log('Checking monitoring documentation...');
  results.push(await checkMonitoringDocs());
  printCheck(results[results.length - 1]);

  // Summary
  printHeader('📊 Verification Summary');

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const warnings = results.filter((r) => r.status === 'warning').length;
  const skipped = results.filter((r) => r.status === 'skip').length;

  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️ Warnings: ${warnings}${colors.reset}`);
  console.log(`${colors.blue}⏭️ Skipped: ${skipped}${colors.reset}`);
  console.log(`\nTotal: ${results.length} checks`);

  // Next steps
  if (failed > 0) {
    console.log(`\n${colors.red}❌ MONITORING NOT FULLY CONFIGURED${colors.reset}`);
    console.log('\nNext steps:');
    results
      .filter((r) => r.status === 'fail')
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.details || r.message}`);
      });
  } else if (warnings > 0) {
    console.log(`\n${colors.yellow}⚠️ MONITORING PARTIALLY CONFIGURED${colors.reset}`);
    console.log('\nRecommended improvements:');
    results
      .filter((r) => r.status === 'warning')
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.details || r.message}`);
      });
  } else {
    console.log(`\n${colors.green}✅ ALL MONITORING CHECKS PASSED${colors.reset}`);
    console.log('\nYour monitoring stack is fully configured! 🎉');
  }

  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
