/**
 * Pre-Flight Verification Script for Live Payment Test
 *
 * Checks all prerequisites before executing live payment test:
 * - Production deployment status
 * - Stripe configuration (production mode)
 * - Database accessibility
 * - Webhook endpoint health
 *
 * Run: npx tsx scripts/verify-payment-test-prerequisites.ts
 */

import { config } from 'dotenv';
import { getDatabase } from '../lib/db';
import Stripe from 'stripe';

// Load environment variables
config({ path: '.env.local' });

interface VerificationResult {
  check: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

const results: VerificationResult[] = [];

async function checkDatabaseConnection(): Promise<VerificationResult> {
  try {
    const db = getDatabase();
    const result = db.prepare('SELECT 1 as test').get() as { test: number };

    if (result.test === 1) {
      // Check if user_profiles table exists
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_profiles'").all();

      if (tables.length > 0) {
        // Count existing users
        const userCount = db.prepare('SELECT COUNT(*) as count FROM user_profiles').get() as { count: number };

        return {
          check: 'Database Connection',
          status: 'PASS',
          message: 'Database connected and schema verified',
          details: {
            dbPath: process.env.DATABASE_PATH || './data/taxbridge.db',
            userCount: userCount.count,
          },
        };
      } else {
        return {
          check: 'Database Connection',
          status: 'FAIL',
          message: 'user_profiles table not found',
        };
      }
    }

    return {
      check: 'Database Connection',
      status: 'FAIL',
      message: 'Database query failed',
    };
  } catch (error) {
    return {
      check: 'Database Connection',
      status: 'FAIL',
      message: `Database error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function checkStripeConfiguration(): Promise<VerificationResult> {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY || '';
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    const proPriceId = process.env.STRIPE_PRO_PRICE_ID || '';

    // Check if keys are production keys (start with sk_live_ / pk_live_)
    const isProductionMode = secretKey.startsWith('sk_live_') && publishableKey.startsWith('pk_live_');

    if (!isProductionMode) {
      return {
        check: 'Stripe Configuration',
        status: 'FAIL',
        message: 'Stripe is in TEST mode (using sk_test_/pk_test_ keys)',
        details: {
          secretKeyPrefix: secretKey.substring(0, 8) + '...',
          publishableKeyPrefix: publishableKey.substring(0, 8) + '...',
          mode: 'TEST',
          action: 'Switch to production keys in Vercel environment variables',
        },
      };
    }

    // Verify webhook secret exists
    if (!webhookSecret || webhookSecret.includes('YOUR_')) {
      return {
        check: 'Stripe Configuration',
        status: 'FAIL',
        message: 'Stripe webhook secret not configured',
        details: {
          webhookSecret: webhookSecret ? 'Present but contains placeholder' : 'Not set',
        },
      };
    }

    // Verify price IDs
    if (!proPriceId || proPriceId.includes('YOUR_') || !proPriceId.startsWith('price_')) {
      return {
        check: 'Stripe Configuration',
        status: 'FAIL',
        message: 'Stripe Pro price ID not configured',
        details: {
          proPriceId: proPriceId || 'Not set',
          action: 'Run: npm run setup:stripe to create products and get price IDs',
        },
      };
    }

    // Test Stripe API connection
    try {
      const stripe = new Stripe(secretKey, {
        apiVersion: '2024-06-20',
        typescript: true,
      });

      const account = await stripe.accounts.retrieve();

      return {
        check: 'Stripe Configuration',
        status: 'PASS',
        message: 'Stripe configured in PRODUCTION mode',
        details: {
          mode: 'LIVE',
          accountId: account.id,
          businessName: account.business_profile?.name || 'Not set',
          proPriceId,
          webhookSecretConfigured: true,
        },
      };
    } catch (apiError) {
      return {
        check: 'Stripe Configuration',
        status: 'FAIL',
        message: `Stripe API connection failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`,
      };
    }
  } catch (error) {
    return {
      check: 'Stripe Configuration',
      status: 'FAIL',
      message: `Configuration error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function checkProductionDeployment(): Promise<VerificationResult> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    if (!appUrl || appUrl.includes('localhost')) {
      return {
        check: 'Production Deployment',
        status: 'FAIL',
        message: 'NEXT_PUBLIC_APP_URL not set to production domain',
        details: {
          currentUrl: appUrl || 'Not set',
          expectedUrl: 'https://cross-border-tax.vercel.app or custom domain',
        },
      };
    }

    // Test if production site is accessible
    const response = await fetch(appUrl);
    const isAccessible = response.ok;

    if (!isAccessible) {
      return {
        check: 'Production Deployment',
        status: 'WARNING',
        message: `Production site returned ${response.status}`,
        details: {
          url: appUrl,
          status: response.status,
        },
      };
    }

    // Test webhook endpoint
    const webhookUrl = `${appUrl}/api/stripe/webhook`;
    const webhookResponse = await fetch(webhookUrl, { method: 'POST' });

    // Webhook should return 400 (missing signature) if it's working
    const webhookWorking = webhookResponse.status === 400;

    return {
      check: 'Production Deployment',
      status: webhookWorking ? 'PASS' : 'WARNING',
      message: webhookWorking
        ? 'Production deployment accessible, webhook endpoint responding'
        : 'Production deployment accessible, but webhook endpoint may have issues',
      details: {
        appUrl,
        siteStatus: response.status,
        webhookStatus: webhookResponse.status,
        webhookExpected: 400,
      },
    };
  } catch (error) {
    return {
      check: 'Production Deployment',
      status: 'FAIL',
      message: `Deployment check failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function checkClerkConfiguration(): Promise<VerificationResult> {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  const secretKey = process.env.CLERK_SECRET_KEY || '';

  const isProduction = publishableKey.startsWith('pk_live_') && secretKey.startsWith('sk_live_');

  if (!isProduction) {
    return {
      check: 'Clerk Authentication',
      status: 'WARNING',
      message: 'Clerk is in TEST mode (test users only)',
      details: {
        mode: 'TEST',
        note: 'Can proceed with test, but users will be in test environment',
      },
    };
  }

  return {
    check: 'Clerk Authentication',
    status: 'PASS',
    message: 'Clerk configured in PRODUCTION mode',
    details: {
      mode: 'LIVE',
    },
  };
}

async function runAllChecks() {
  console.log('🔍 Running Pre-Flight Verification for Live Payment Test\n');
  console.log('=' .repeat(80));
  console.log('');

  // Run all checks
  results.push(await checkDatabaseConnection());
  results.push(await checkStripeConfiguration());
  results.push(await checkProductionDeployment());
  results.push(await checkClerkConfiguration());

  // Print results
  for (const result of results) {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`${icon} ${result.check}: ${result.status}`);
    console.log(`   ${result.message}`);

    if (result.details) {
      console.log('   Details:', JSON.stringify(result.details, null, 2).replace(/\n/g, '\n   '));
    }

    console.log('');
  }

  console.log('=' .repeat(80));
  console.log('');

  // Summary
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const warnCount = results.filter(r => r.status === 'WARNING').length;

  console.log(`Summary: ${passCount} PASS, ${failCount} FAIL, ${warnCount} WARNING`);
  console.log('');

  if (failCount > 0) {
    console.log('❌ PREREQUISITES NOT MET - Cannot proceed with live payment test');
    console.log('');
    console.log('Action Required:');

    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`  • ${r.check}: ${r.message}`);
        if (r.details?.action) {
          console.log(`    → ${r.details.action}`);
        }
      });

    process.exit(1);
  } else if (warnCount > 0) {
    console.log('⚠️  WARNINGS DETECTED - Review before proceeding');
    console.log('');

    results
      .filter(r => r.status === 'WARNING')
      .forEach(r => {
        console.log(`  • ${r.check}: ${r.message}`);
      });

    console.log('');
    console.log('You can proceed with testing, but review the warnings above.');
  } else {
    console.log('✅ ALL PREREQUISITES MET - Ready for live payment test!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Review docs/LIVE_PAYMENT_TEST_REPORT.md');
    console.log('  2. Have real credit card ready (will charge $299, then refund)');
    console.log('  3. Access to Stripe Dashboard for refund processing');
    console.log('  4. Execute test following the test plan');
  }
}

// Run checks
runAllChecks().catch((error) => {
  console.error('Fatal error running verification:', error);
  process.exit(1);
});
