#!/usr/bin/env tsx
/**
 * Production Deployment Verification Script
 *
 * Verifies that the CORRECT application is deployed to production.
 *
 * Expected: US-Canada Cross-Border Tax Calculator for H-1B/TN workers
 * Common Issue: Nigerian Tax Admin Dashboard deployed instead
 *
 * Usage: npm run verify:deployment
 *
 * Exit Codes:
 *  0 = Correct app deployed ✅
 *  1 = Wrong app deployed ❌
 */

interface VerificationCheck {
  name: string;
  test: () => Promise<boolean>;
  critical: boolean;
  errorMessage?: string;
}

const PRODUCTION_URL = 'https://taxbridge.vercel.app';

const checks: VerificationCheck[] = [
  {
    name: 'Homepage Accessibility',
    test: async () => {
      const response = await fetch(PRODUCTION_URL);
      return response.ok;
    },
    critical: true,
    errorMessage: 'Production site is down or unreachable',
  },
  {
    name: 'Correct Application Deployed (US-Canada Tax)',
    test: async () => {
      const response = await fetch(PRODUCTION_URL);
      const html = await response.text();
      return html.includes('H-1B') || html.includes('TN visa');
    },
    critical: true,
    errorMessage: '❌ DEPLOYMENT CRISIS: Wrong app deployed!\n' +
                  '   Expected: US-Canada Cross-Border Tax Calculator\n' +
                  '   See: docs/DEPLOYMENT_CRISIS_EXECUTIVE_SUMMARY.md',
  },
  {
    name: 'NOT Nigerian Tax App',
    test: async () => {
      const response = await fetch(PRODUCTION_URL);
      const html = await response.text();
      return !html.includes('Nigeria') && !html.includes('NRS compliance');
    },
    critical: true,
    errorMessage: '❌ Nigerian tax app detected in production\n' +
                  '   Action Required: Reconnect Vercel to correct repository',
  },
  {
    name: 'Calculator Route Exists',
    test: async () => {
      const response = await fetch(`${PRODUCTION_URL}/us-canada-tax-calculator`);
      return response.ok;
    },
    critical: false,
    errorMessage: 'Calculator route not found (404)',
  },
  {
    name: 'Pricing Page Exists',
    test: async () => {
      const response = await fetch(`${PRODUCTION_URL}/pricing`);
      return response.ok;
    },
    critical: false,
    errorMessage: 'Pricing page not found (404)',
  },
];

async function runVerification() {
  console.log('🔍 Production Deployment Verification');
  console.log(`📍 Target: ${PRODUCTION_URL}`);
  console.log(`⏰ Time: ${new Date().toISOString()}\n`);

  let passedChecks = 0;
  let failedChecks = 0;
  let criticalFailure = false;

  for (const check of checks) {
    process.stdout.write(`  ${check.name}... `);

    try {
      const passed = await check.test();

      if (passed) {
        console.log('✅');
        passedChecks++;
      } else {
        console.log('❌');
        failedChecks++;

        if (check.errorMessage) {
          console.log(`     ${check.errorMessage.replace(/\n/g, '\n     ')}`);
        }

        if (check.critical) {
          criticalFailure = true;
        }
      }
    } catch (error) {
      console.log('❌ ERROR');
      console.log(`     ${(error as Error).message}`);
      failedChecks++;

      if (check.critical) {
        criticalFailure = true;
      }
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Passed: ${passedChecks}/${checks.length}`);
  console.log(`   ❌ Failed: ${failedChecks}/${checks.length}`);

  if (criticalFailure) {
    console.log('\n🚨 CRITICAL FAILURE DETECTED');
    console.log('   DO NOT MARK TASKS COMPLETE');
    console.log('   DO NOT START NEW WORK');
    console.log('   ALERT CEO IMMEDIATELY');
    console.log('\n   See: docs/DEPLOYMENT_CRISIS_EXECUTIVE_SUMMARY.md');
    process.exit(1);
  }

  if (failedChecks > 0) {
    console.log('\n⚠️  Some checks failed (non-critical)');
    console.log('   Review failures and fix if needed');
    process.exit(0);
  }

  console.log('\n✅ All checks passed!');
  console.log('   Correct application is deployed');
  console.log('   Safe to continue work');
  process.exit(0);
}

// Run verification
runVerification().catch((error) => {
  console.error('\n❌ Verification script crashed:');
  console.error(error);
  process.exit(1);
});
