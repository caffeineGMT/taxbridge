/**
 * Verify Stripe Production Configuration
 * Checks that all Stripe environment variables are correctly set for production
 *
 * Usage:
 *   npm run verify:stripe-production
 *   npx tsx scripts/verify-stripe-production.ts
 *   npx tsx scripts/verify-stripe-production.ts --debug
 *
 * Exit codes:
 *   0 = All checks passed (production mode active)
 *   1 = Critical checks failed (still in test mode or misconfigured)
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.production for verification
config({ path: resolve(process.cwd(), '.env.production') });

const DEBUG = process.argv.includes('--debug');

interface VerificationResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  value?: string;
}

const results: VerificationResult[] = [];

function check(name: string, condition: boolean, passMsg: string, failMsg: string, value?: string): void {
  results.push({
    name,
    status: condition ? 'pass' : 'fail',
    message: condition ? passMsg : failMsg,
    value: DEBUG ? value : undefined,
  });
}

function warn(name: string, message: string, value?: string): void {
  results.push({
    name,
    status: 'warning',
    message,
    value: DEBUG ? value : undefined,
  });
}

console.log('🔍 Verifying Stripe Production Configuration...\n');

// Check STRIPE_SECRET_KEY
const secretKey = process.env.STRIPE_SECRET_KEY || '';
const isPlaceholderSecret = secretKey.includes('YOUR') || secretKey.includes('_HERE');
const isTestSecret = secretKey.startsWith('sk_test_');
const isLiveSecret = secretKey.startsWith('sk_live_') && !isPlaceholderSecret;

check(
  'STRIPE_SECRET_KEY',
  isLiveSecret,
  '✓ Production secret key configured (sk_live_)',
  isPlaceholderSecret
    ? '✗ STRIPE_SECRET_KEY is a PLACEHOLDER - replace with real sk_live_ key'
    : isTestSecret
    ? '✗ Using TEST mode key (sk_test_) - REVENUE BLOCKED! Switch to sk_live_'
    : '✗ STRIPE_SECRET_KEY not found or invalid',
  secretKey.substring(0, 15) + '...'
);

if (isTestSecret) {
  warn('Secret Key Mode', '🔴 CRITICAL: Using TEST mode key. Revenue is BLOCKED until you switch to sk_live_');
} else if (isPlaceholderSecret) {
  warn('Secret Key Placeholder', '🔴 CRITICAL: Placeholder detected. Follow docs/STRIPE_PRODUCTION_ACTIVATION_CHECKLIST.md');
}

// Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const isPlaceholderPub = pubKey.includes('YOUR') || pubKey.includes('_HERE');
const isTestPub = pubKey.startsWith('pk_test_');
const isLivePub = pubKey.startsWith('pk_live_') && !isPlaceholderPub;

check(
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  isLivePub,
  '✓ Production publishable key configured (pk_live_)',
  isPlaceholderPub
    ? '✗ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is a PLACEHOLDER - replace with real pk_live_ key'
    : isTestPub
    ? '✗ Using TEST mode key (pk_test_) - REVENUE BLOCKED! Switch to pk_live_'
    : '✗ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not found or invalid',
  pubKey.substring(0, 15) + '...'
);

if (isTestPub) {
  warn('Publishable Key Mode', '🔴 CRITICAL: Using TEST mode key. Revenue is BLOCKED until you switch to pk_live_');
} else if (isPlaceholderPub) {
  warn('Publishable Key Placeholder', '🔴 CRITICAL: Placeholder detected. Follow docs/STRIPE_PRODUCTION_ACTIVATION_CHECKLIST.md');
}

// Check STRIPE_WEBHOOK_SECRET
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const isPlaceholderWebhook = webhookSecret.includes('YOUR') || webhookSecret.includes('_HERE');
const isValidWebhook = webhookSecret.startsWith('whsec_') && !isPlaceholderWebhook;

check(
  'STRIPE_WEBHOOK_SECRET',
  isValidWebhook,
  '✓ Webhook secret configured',
  isPlaceholderWebhook
    ? '✗ STRIPE_WEBHOOK_SECRET is a PLACEHOLDER - create webhook in Stripe dashboard'
    : '✗ STRIPE_WEBHOOK_SECRET not configured or invalid (must start with whsec_)',
  webhookSecret.substring(0, 15) + '...'
);

// Check Price IDs
const basicPriceId = process.env.STRIPE_BASIC_PRICE_ID || '';
const isPlaceholderBasic = basicPriceId.includes('YOUR') || basicPriceId.includes('_HERE');
const isValidBasic = basicPriceId.startsWith('price_') && !isPlaceholderBasic;

check(
  'STRIPE_BASIC_PRICE_ID',
  isValidBasic,
  '✓ Basic price ID configured ($49/year)',
  isPlaceholderBasic
    ? '✗ STRIPE_BASIC_PRICE_ID is a PLACEHOLDER - run setup script'
    : '✗ STRIPE_BASIC_PRICE_ID not configured or invalid (must start with price_)',
  basicPriceId
);

const proPriceId = process.env.STRIPE_PRO_PRICE_ID || '';
const isPlaceholderPro = proPriceId.includes('YOUR') || proPriceId.includes('_HERE');
const isValidPro = proPriceId.startsWith('price_') && !isPlaceholderPro;
check(
  'STRIPE_PRO_PRICE_ID',
  isValidPro,
  '✓ Pro price ID configured ($79/year)',
  isPlaceholderPro
    ? '✗ STRIPE_PRO_PRICE_ID is a PLACEHOLDER - run setup script'
    : '✗ STRIPE_PRO_PRICE_ID not configured or invalid (must start with price_)',
  proPriceId
);

const entPriceId = process.env.STRIPE_ENTERPRISE_PRICE_ID || '';
const isPlaceholderEnt = entPriceId.includes('YOUR') || entPriceId.includes('_HERE');
const isValidEnt = (entPriceId.startsWith('price_') || entPriceId.startsWith('prod_')) && !isPlaceholderEnt;

check(
  'STRIPE_ENTERPRISE_PRICE_ID',
  isValidEnt,
  '✓ Enterprise price ID configured',
  isPlaceholderEnt
    ? '✗ STRIPE_ENTERPRISE_PRICE_ID is a PLACEHOLDER - run setup script'
    : '✗ STRIPE_ENTERPRISE_PRICE_ID not configured or invalid',
  entPriceId
);

// Check public price IDs
const publicProPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
check(
  'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID',
  !!publicProPriceId && publicProPriceId.startsWith('price_'),
  '✓ Public Pro price ID configured',
  '✗ NEXT_PUBLIC_STRIPE_PRO_PRICE_ID not configured or invalid'
);

const publicEntPriceId = process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID;
check(
  'NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID',
  !!publicEntPriceId && publicEntPriceId.startsWith('price_'),
  '✓ Public Enterprise price ID configured',
  '✗ NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID not configured or invalid'
);

// Check APP_URL
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
check(
  'NEXT_PUBLIC_APP_URL',
  !!appUrl && (appUrl.startsWith('https://') || appUrl.startsWith('http://localhost')),
  appUrl?.includes('localhost')
    ? '⚠ Using localhost URL'
    : '✓ Production app URL configured',
  '✗ NEXT_PUBLIC_APP_URL not configured or invalid'
);

if (appUrl?.includes('localhost')) {
  warn('App URL', 'Using localhost. Update to production domain for live deployment.');
}

// Verify price IDs match between server and client
if (proPriceId !== publicProPriceId) {
  warn('Price ID Mismatch', 'STRIPE_PRO_PRICE_ID and NEXT_PUBLIC_STRIPE_PRO_PRICE_ID do not match!');
}

if (entPriceId !== publicEntPriceId) {
  warn('Price ID Mismatch', 'STRIPE_ENTERPRISE_PRICE_ID and NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID do not match!');
}

// Print results
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Configuration Status:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const passes = results.filter((r) => r.status === 'pass').length;
const fails = results.filter((r) => r.status === 'fail').length;
const warnings = results.filter((r) => r.status === 'warning').length;

results.forEach((result) => {
  const icon = result.status === 'pass' ? '✓' : result.status === 'warning' ? '⚠' : '✗';
  const color =
    result.status === 'pass' ? '\x1b[32m' : result.status === 'warning' ? '\x1b[33m' : '\x1b[31m';
  const reset = '\x1b[0m';

  console.log(`${color}${icon} ${result.name}${reset}`);
  console.log(`  ${result.message}`);
  if (DEBUG && result.value) {
    console.log(`  Value: ${result.value}`);
  }
  console.log();
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Summary: ${passes} passed, ${fails} failed, ${warnings} warnings`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const criticalIssues = fails > 0 || results.filter(r => r.status === 'warning' && r.message.includes('CRITICAL')).length > 0;

if (criticalIssues) {
  console.log('❌ STRIPE PRODUCTION MODE: INACTIVE\n');
  console.log('🔴 Revenue is BLOCKED. You cannot accept real payments.\n');
  console.log('Action required:');
  console.log('  1. Follow: docs/STRIPE_PRODUCTION_ACTIVATION_CHECKLIST.md');
  console.log('  2. Replace ALL test/placeholder keys with LIVE keys from Stripe dashboard');
  console.log('  3. Run this script again to verify: npm run verify:stripe-production\n');
  console.log('📖 Full setup guide: docs/STRIPE_PRODUCTION_ACTIVATION_CHECKLIST.md\n');
  process.exit(1);
} else if (warnings > 0) {
  console.log('⚠️  Configuration is valid but has warnings.');
  console.log('For production deployment, address warnings above.\n');
  console.log('🎉 Stripe Production Mode: ACTIVE (with warnings)\n');
  process.exit(0);
} else {
  console.log('🎉 SUCCESS: STRIPE PRODUCTION MODE IS ACTIVE\n');
  console.log('✅ All Stripe configuration checks passed!');
  console.log('✅ Revenue is unblocked - ready to accept live payments\n');
  console.log('Next steps:');
  console.log('  1. Test payment flow with real card (Step 7 in checklist)');
  console.log('  2. Refund test payment immediately');
  console.log('  3. Monitor Stripe Dashboard for incoming payments');
  console.log('  4. Set up Stripe alerts for failed payments\n');
  console.log('🚀 Ready for production deployment.\n');
  process.exit(0);
}
