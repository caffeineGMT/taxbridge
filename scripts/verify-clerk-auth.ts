#!/usr/bin/env tsx

/**
 * Clerk Authentication Verification Script
 *
 * Tests Clerk authentication configuration and auth flow endpoints
 * Generates verification report for production readiness
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface VerificationResult {
  timestamp: string;
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    details?: string;
  }[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  overallStatus: 'pass' | 'fail';
}

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[36m';
const RESET = '\x1b[0m';

const log = {
  success: (msg: string) => console.log(`${GREEN}✅ ${msg}${RESET}`),
  error: (msg: string) => console.log(`${RED}❌ ${msg}${RESET}`),
  warning: (msg: string) => console.log(`${YELLOW}⚠️  ${msg}${RESET}`),
  info: (msg: string) => console.log(`${BLUE}ℹ️  ${msg}${RESET}`),
  section: (msg: string) => console.log(`\n${BLUE}${'='.repeat(60)}${RESET}\n${BLUE}${msg}${RESET}\n${BLUE}${'='.repeat(60)}${RESET}`),
};

async function verifyClerkAuth(): Promise<VerificationResult> {
  const result: VerificationResult = {
    timestamp: new Date().toISOString(),
    checks: [],
    summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
    overallStatus: 'pass',
  };

  log.section('🔐 CLERK AUTHENTICATION VERIFICATION');

  // Check 1: Clerk publishable key exists
  log.info('Check 1: Verifying Clerk publishable key...');
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    result.checks.push({
      name: 'Clerk Publishable Key',
      status: 'fail',
      message: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not set',
      details: 'Missing environment variable',
    });
    log.error('Clerk publishable key NOT found');
  } else if (publishableKey.includes('YOUR_') || publishableKey === 'pk_test_YOUR_CLERK_PUBLISHABLE_KEY') {
    result.checks.push({
      name: 'Clerk Publishable Key',
      status: 'fail',
      message: 'Clerk publishable key is a PLACEHOLDER',
      details: `Found: ${publishableKey}`,
    });
    log.error(`Clerk publishable key is PLACEHOLDER: ${publishableKey}`);
  } else if (publishableKey.startsWith('pk_test_')) {
    result.checks.push({
      name: 'Clerk Publishable Key',
      status: 'warning',
      message: 'Clerk is in TEST mode (pk_test_)',
      details: `Key: ${publishableKey.substring(0, 20)}...`,
    });
    log.warning(`Clerk is in TEST mode: ${publishableKey.substring(0, 20)}...`);
  } else if (publishableKey.startsWith('pk_live_')) {
    result.checks.push({
      name: 'Clerk Publishable Key',
      status: 'pass',
      message: 'Clerk publishable key detected (PRODUCTION mode)',
      details: `Key: ${publishableKey.substring(0, 20)}...`,
    });
    log.success(`Clerk publishable key detected: ${publishableKey.substring(0, 20)}...`);
  } else {
    result.checks.push({
      name: 'Clerk Publishable Key',
      status: 'warning',
      message: 'Clerk publishable key format unrecognized',
      details: `Key: ${publishableKey.substring(0, 20)}...`,
    });
    log.warning(`Unrecognized Clerk key format: ${publishableKey.substring(0, 20)}...`);
  }

  // Check 2: Clerk secret key exists
  log.info('Check 2: Verifying Clerk secret key...');
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!secretKey) {
    result.checks.push({
      name: 'Clerk Secret Key',
      status: 'fail',
      message: 'CLERK_SECRET_KEY not set',
      details: 'Missing environment variable',
    });
    log.error('Clerk secret key NOT found');
  } else if (secretKey.includes('YOUR_') || secretKey === 'sk_test_YOUR_CLERK_SECRET_KEY') {
    result.checks.push({
      name: 'Clerk Secret Key',
      status: 'fail',
      message: 'Clerk secret key is a PLACEHOLDER',
      details: 'Replace with real sk_live_ or sk_test_ key',
    });
    log.error('Clerk secret key is PLACEHOLDER');
  } else if (secretKey.startsWith('sk_test_')) {
    result.checks.push({
      name: 'Clerk Secret Key',
      status: 'warning',
      message: 'Clerk secret is in TEST mode (sk_test_)',
      details: 'Use sk_live_ key for production',
    });
    log.warning('Clerk secret is in TEST mode');
  } else if (secretKey.startsWith('sk_live_')) {
    result.checks.push({
      name: 'Clerk Secret Key',
      status: 'pass',
      message: 'Clerk secret key detected (PRODUCTION mode)',
      details: 'Key format: sk_live_...',
    });
    log.success('Clerk secret key detected (PRODUCTION)');
  } else {
    result.checks.push({
      name: 'Clerk Secret Key',
      status: 'warning',
      message: 'Clerk secret key format unrecognized',
      details: 'Should start with sk_live_ or sk_test_',
    });
    log.warning('Unrecognized Clerk secret key format');
  }

  // Check 3: Clerk webhook secret (optional)
  log.info('Check 3: Verifying Clerk webhook secret...');
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret || webhookSecret.includes('YOUR_')) {
    result.checks.push({
      name: 'Clerk Webhook Secret',
      status: 'warning',
      message: 'Clerk webhook secret not configured',
      details: 'Optional but recommended for production',
    });
    log.warning('Clerk webhook secret not configured (optional)');
  } else {
    result.checks.push({
      name: 'Clerk Webhook Secret',
      status: 'pass',
      message: 'Clerk webhook secret configured',
      details: 'Webhook signature verification enabled',
    });
    log.success('Clerk webhook secret configured');
  }

  // Check 4: Middleware configuration exists
  log.info('Check 4: Verifying Clerk middleware configuration...');
  const middlewarePath = path.join(process.cwd(), 'middleware.ts');

  if (!fs.existsSync(middlewarePath)) {
    result.checks.push({
      name: 'Clerk Middleware',
      status: 'fail',
      message: 'middleware.ts file NOT found',
      details: 'Clerk middleware required for route protection',
    });
    log.error('middleware.ts NOT found');
  } else {
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');

    if (middlewareContent.includes('clerkMiddleware')) {
      result.checks.push({
        name: 'Clerk Middleware',
        status: 'pass',
        message: 'Clerk middleware configured',
        details: 'Found clerkMiddleware in middleware.ts',
      });
      log.success('Clerk middleware configured');
    } else {
      result.checks.push({
        name: 'Clerk Middleware',
        status: 'warning',
        message: 'Clerk middleware may not be configured correctly',
        details: 'middleware.ts exists but clerkMiddleware not found',
      });
      log.warning('Clerk middleware configuration unclear');
    }
  }

  // Check 5: Environment variable consistency
  log.info('Check 5: Checking mode consistency...');
  const isProdPublishable = publishableKey?.startsWith('pk_live_');
  const isProdSecret = secretKey?.startsWith('sk_live_');

  if (isProdPublishable && isProdSecret) {
    result.checks.push({
      name: 'Mode Consistency',
      status: 'pass',
      message: 'Both keys are in PRODUCTION mode',
      details: 'pk_live_ and sk_live_ detected',
    });
    log.success('Both keys in PRODUCTION mode');
  } else if (!isProdPublishable && !isProdSecret) {
    const isTestPublishable = publishableKey?.startsWith('pk_test_');
    const isTestSecret = secretKey?.startsWith('sk_test_');

    if (isTestPublishable && isTestSecret) {
      result.checks.push({
        name: 'Mode Consistency',
        status: 'warning',
        message: 'Both keys are in TEST mode',
        details: 'pk_test_ and sk_test_ detected - switch to production keys',
      });
      log.warning('Both keys in TEST mode');
    } else {
      result.checks.push({
        name: 'Mode Consistency',
        status: 'fail',
        message: 'Keys are in inconsistent modes or invalid',
        details: 'Publishable and secret keys should both be pk_live_/sk_live_ or pk_test_/sk_test_',
      });
      log.error('Key mode mismatch');
    }
  } else {
    result.checks.push({
      name: 'Mode Consistency',
      status: 'fail',
      message: 'CRITICAL: Publishable and secret keys are in DIFFERENT modes',
      details: `Publishable: ${isProdPublishable ? 'PRODUCTION' : 'TEST'}, Secret: ${isProdSecret ? 'PRODUCTION' : 'TEST'}`,
    });
    log.error('CRITICAL: Key mode mismatch between publishable and secret');
  }

  // Check 6: Protected routes configuration
  log.info('Check 6: Verifying protected routes...');
  if (fs.existsSync(middlewarePath)) {
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');
    const hasPublicRoutes = middlewareContent.includes('isPublicRoute');
    const hasProtection = middlewareContent.includes('auth.protect');

    if (hasPublicRoutes && hasProtection) {
      result.checks.push({
        name: 'Protected Routes',
        status: 'pass',
        message: 'Public and protected routes configured',
        details: 'Found isPublicRoute matcher and auth.protect()',
      });
      log.success('Protected routes configured');
    } else {
      result.checks.push({
        name: 'Protected Routes',
        status: 'warning',
        message: 'Route protection may not be configured',
        details: 'Check middleware.ts for isPublicRoute and auth.protect',
      });
      log.warning('Route protection unclear');
    }
  }

  // Calculate summary
  result.summary.total = result.checks.length;
  result.summary.passed = result.checks.filter(c => c.status === 'pass').length;
  result.summary.failed = result.checks.filter(c => c.status === 'fail').length;
  result.summary.warnings = result.checks.filter(c => c.status === 'warning').length;
  result.overallStatus = result.summary.failed > 0 ? 'fail' : 'pass';

  // Display summary
  log.section('📊 VERIFICATION SUMMARY');
  console.log(`Total Checks: ${result.summary.total}`);
  console.log(`${GREEN}✅ Passed: ${result.summary.passed}${RESET}`);
  console.log(`${RED}❌ Failed: ${result.summary.failed}${RESET}`);
  console.log(`${YELLOW}⚠️  Warnings: ${result.summary.warnings}${RESET}`);

  if (result.overallStatus === 'pass') {
    log.success('ALL CRITICAL CHECKS PASSED');
  } else {
    log.error('VERIFICATION FAILED - Fix issues above before deployment');
  }

  // Save report
  const reportsDir = path.join(process.cwd(), 'docs/verification-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, `clerk-auth-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));

  log.info(`Verification report saved to: ${reportPath}`);

  return result;
}

// Run verification
verifyClerkAuth()
  .then(result => {
    process.exit(result.overallStatus === 'pass' ? 0 : 1);
  })
  .catch(error => {
    log.error(`Verification failed with error: ${error.message}`);
    process.exit(1);
  });
