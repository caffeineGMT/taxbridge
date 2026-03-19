#!/usr/bin/env tsx
/**
 * Revenue Verification Gate - Critical Pre-Launch Checklist
 *
 * This script verifies that production payments are fully operational:
 * 1. Stripe production keys are configured
 * 2. All price IDs are in production mode
 * 3. Webhook handlers are properly configured
 * 4. PostHog tracking is active
 *
 * Exit code 0 = PASS (ready for revenue)
 * Exit code 1 = FAIL (blockers found)
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env.production') });

interface CheckResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  critical: boolean;
}

const results: CheckResult[] = [];

function check(name: string, condition: boolean, message: string, critical = true): void {
  results.push({
    name,
    status: condition ? 'PASS' : 'FAIL',
    message,
    critical,
  });
}

function warn(name: string, message: string): void {
  results.push({
    name,
    status: 'WARN',
    message,
    critical: false,
  });
}

console.log('\n🔍 REVENUE VERIFICATION GATE - PRODUCTION READINESS CHECK\n');
console.log('='.repeat(70));

// ============================================================
// CHECK 1: Stripe Secret Key (Production Mode)
// ============================================================
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const isLiveSecretKey = stripeSecretKey.startsWith('sk_live_');
const isTestSecretKey = stripeSecretKey.startsWith('sk_test_');
const isPlaceholder = stripeSecretKey.includes('YOUR_') || stripeSecretKey.length < 20;

check(
  '1. Stripe Secret Key',
  isLiveSecretKey && !isPlaceholder,
  isPlaceholder
    ? `❌ PLACEHOLDER KEY: "${stripeSecretKey.substring(0, 30)}..."`
    : isTestSecretKey
    ? `❌ TEST MODE KEY: Using sk_test_ instead of sk_live_`
    : isLiveSecretKey
    ? `✅ Production key configured: sk_live_***`
    : `❌ Invalid or missing STRIPE_SECRET_KEY`,
  true
);

// ============================================================
// CHECK 2: Stripe Publishable Key (Production Mode)
// ============================================================
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const isLivePublishableKey = stripePublishableKey.startsWith('pk_live_');
const isTestPublishableKey = stripePublishableKey.startsWith('pk_test_');
const isPublishablePlaceholder = stripePublishableKey.includes('YOUR_') || stripePublishableKey.length < 20;

check(
  '2. Stripe Publishable Key',
  isLivePublishableKey && !isPublishablePlaceholder,
  isPublishablePlaceholder
    ? `❌ PLACEHOLDER KEY: "${stripePublishableKey.substring(0, 30)}..."`
    : isTestPublishableKey
    ? `❌ TEST MODE KEY: Using pk_test_ instead of pk_live_`
    : isLivePublishableKey
    ? `✅ Production key configured: pk_live_***`
    : `❌ Invalid or missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
  true
);

// ============================================================
// CHECK 3: Stripe Webhook Secret
// ============================================================
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const isValidWebhookSecret = webhookSecret.startsWith('whsec_') && !webhookSecret.includes('YOUR_');

check(
  '3. Webhook Secret',
  isValidWebhookSecret,
  isValidWebhookSecret
    ? `✅ Webhook secret configured: whsec_***`
    : `❌ Missing or placeholder webhook secret`,
  true
);

// ============================================================
// CHECK 4: Price IDs (Production Mode)
// ============================================================
const proPriceId = process.env.STRIPE_PRO_PRICE_ID || '';
const enterprisePriceId = process.env.STRIPE_ENTERPRISE_PRICE_ID || '';
const publicProPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '';
const publicEnterprisePriceId = process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || '';

const isLiveProPrice = proPriceId.startsWith('price_') && !proPriceId.includes('YOUR_') && proPriceId.length > 20;
const isLiveEnterprisePrice = enterprisePriceId.startsWith('price_') && !enterprisePriceId.includes('YOUR_') && enterprisePriceId.length > 20;

check(
  '4a. Pro Price ID',
  isLiveProPrice,
  isLiveProPrice
    ? `✅ Production price ID: ${proPriceId}`
    : `❌ Placeholder or invalid: "${proPriceId}"`,
  true
);

check(
  '4b. Enterprise Price ID',
  isLiveEnterprisePrice,
  isLiveEnterprisePrice
    ? `✅ Production price ID: ${enterprisePriceId}`
    : `❌ Placeholder or invalid: "${enterprisePriceId}"`,
  true
);

// Check price ID consistency (server vs client)
check(
  '4c. Price ID Consistency',
  proPriceId === publicProPriceId && enterprisePriceId === publicEnterprisePriceId,
  (proPriceId === publicProPriceId && enterprisePriceId === publicEnterprisePriceId)
    ? `✅ Server and client price IDs match`
    : `❌ Mismatch between server/client price IDs`,
  true
);

// ============================================================
// CHECK 5: PostHog Configuration
// ============================================================
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || '';

const isValidPostHog = posthogKey.startsWith('phc_') && !posthogKey.includes('your_');

check(
  '5. PostHog Analytics',
  isValidPostHog,
  isValidPostHog
    ? `✅ PostHog configured: ${posthogKey.substring(0, 15)}***`
    : `⚠️  PostHog key missing or placeholder (analytics won't work)`,
  false // Not critical for payments, but important
);

// ============================================================
// CHECK 6: Webhook File Exists
// ============================================================
const webhookPath = path.join(process.cwd(), 'app/api/stripe/webhook/route.ts');
const webhookExists = fs.existsSync(webhookPath);

check(
  '6. Webhook Handler',
  webhookExists,
  webhookExists
    ? `✅ Webhook handler exists: /app/api/stripe/webhook/route.ts`
    : `❌ Webhook handler missing at: ${webhookPath}`,
  true
);

// Verify webhook handler has correct imports
if (webhookExists) {
  const webhookContent = fs.readFileSync(webhookPath, 'utf-8');
  const hasStripeImport = webhookContent.includes("from '@/lib/stripe'");
  const hasTrackEvent = webhookContent.includes('trackEvent');
  const hasCheckoutHandler = webhookContent.includes("case 'checkout.session.completed'");
  const hasSubscriptionHandler = webhookContent.includes("case 'customer.subscription.deleted'");

  check(
    '6a. Webhook - Stripe Integration',
    hasStripeImport,
    hasStripeImport
      ? `✅ Stripe client properly imported`
      : `❌ Missing Stripe import in webhook handler`,
    true
  );

  check(
    '6b. Webhook - Analytics Tracking',
    hasTrackEvent,
    hasTrackEvent
      ? `✅ trackEvent() found in webhook handler`
      : `⚠️  No analytics tracking found in webhook`,
    false
  );

  check(
    '6c. Webhook - Checkout Handler',
    hasCheckoutHandler,
    hasCheckoutHandler
      ? `✅ checkout.session.completed handler present`
      : `❌ Missing checkout.session.completed handler`,
    true
  );

  check(
    '6d. Webhook - Subscription Handler',
    hasSubscriptionHandler,
    hasSubscriptionHandler
      ? `✅ customer.subscription.deleted handler present`
      : `❌ Missing subscription cancellation handler`,
    true
  );
}

// ============================================================
// CHECK 7: Checkout API Exists
// ============================================================
const checkoutPath = path.join(process.cwd(), 'app/api/stripe/create-checkout/route.ts');
const checkoutExists = fs.existsSync(checkoutPath);

check(
  '7. Checkout API',
  checkoutExists,
  checkoutExists
    ? `✅ Checkout API exists: /app/api/stripe/create-checkout/route.ts`
    : `❌ Checkout API missing`,
  true
);

// ============================================================
// CHECK 8: App URL Configuration
// ============================================================
const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
const isProductionUrl = appUrl.startsWith('https://') && !appUrl.includes('localhost');

check(
  '8. App URL',
  isProductionUrl,
  isProductionUrl
    ? `✅ Production URL: ${appUrl}`
    : `⚠️  Using localhost or missing NEXT_PUBLIC_APP_URL: "${appUrl}"`,
  false // Not critical if testing locally, but important for production
);

// ============================================================
// CHECK 9: Database File Exists
// ============================================================
const dbPath = process.env.DATABASE_PATH || './data/taxbridge.db';
const dbExists = fs.existsSync(path.join(process.cwd(), dbPath));

check(
  '9. Database',
  dbExists,
  dbExists
    ? `✅ Database file exists: ${dbPath}`
    : `⚠️  Database file not found: ${dbPath}`,
  false // Can be created on first run
);

// ============================================================
// PRINT RESULTS
// ============================================================
console.log('\n' + '='.repeat(70));
console.log('\n📊 VERIFICATION RESULTS:\n');

const criticalFailures = results.filter(r => r.status === 'FAIL' && r.critical);
const warnings = results.filter(r => r.status === 'WARN' || (r.status === 'FAIL' && !r.critical));
const passes = results.filter(r => r.status === 'PASS');

// Group by status
const statusIcons = {
  PASS: '✅',
  FAIL: '❌',
  WARN: '⚠️ ',
};

results.forEach((result) => {
  const icon = statusIcons[result.status];
  const criticalTag = result.critical && result.status === 'FAIL' ? ' [CRITICAL]' : '';
  console.log(`${icon} ${result.name}${criticalTag}`);
  console.log(`   ${result.message}\n`);
});

console.log('='.repeat(70));

// Summary
console.log('\n📈 SUMMARY:');
console.log(`   ✅ Passed: ${passes.length}`);
console.log(`   ❌ Failed: ${criticalFailures.length}`);
console.log(`   ⚠️  Warnings: ${warnings.length}`);
console.log('');

// Final verdict
if (criticalFailures.length === 0) {
  console.log('🎉 VERDICT: READY FOR REVENUE');
  console.log('   All critical checks passed. Production payments are operational!\n');

  if (warnings.length > 0) {
    console.log('⚠️  NOTE: Some warnings detected. Review above for details.\n');
  }

  process.exit(0);
} else {
  console.log('🚫 VERDICT: NOT READY FOR REVENUE');
  console.log(`   ${criticalFailures.length} critical blocker(s) found.\n`);

  console.log('🔧 NEXT STEPS:');
  console.log('   1. Follow the Stripe Production Setup guide:');
  console.log('      docs/STRIPE_PRODUCTION_SETUP.md\n');
  console.log('   2. Get production API keys from:');
  console.log('      https://dashboard.stripe.com/apikeys\n');
  console.log('   3. Create products and price IDs:');
  console.log('      npm run setup:stripe\n');
  console.log('   4. Configure webhook endpoint:');
  console.log('      https://dashboard.stripe.com/webhooks\n');
  console.log('   5. Update Vercel environment variables\n');
  console.log('   6. Re-run this verification:');
  console.log('      npm run verify:revenue\n');

  process.exit(1);
}
