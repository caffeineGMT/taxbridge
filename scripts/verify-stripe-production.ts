/**
 * Verify Stripe Production Configuration
 * Checks that all Stripe environment variables are correctly set for production
 */

interface VerificationResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const results: VerificationResult[] = [];

function check(name: string, condition: boolean, passMsg: string, failMsg: string): void {
  results.push({
    name,
    status: condition ? 'pass' : 'fail',
    message: condition ? passMsg : failMsg,
  });
}

function warn(name: string, message: string): void {
  results.push({
    name,
    status: 'warning',
    message,
  });
}

console.log('🔍 Verifying Stripe Production Configuration...\n');

// Check STRIPE_SECRET_KEY
const secretKey = process.env.STRIPE_SECRET_KEY;
check(
  'STRIPE_SECRET_KEY',
  !!secretKey,
  secretKey?.startsWith('sk_live_')
    ? '✓ Production secret key configured'
    : '⚠ Using test key (sk_test_)',
  '✗ STRIPE_SECRET_KEY not found'
);

if (secretKey?.startsWith('sk_test_')) {
  warn('Secret Key Mode', 'Using TEST mode key. Switch to sk_live_ for production.');
}

// Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
check(
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  !!pubKey,
  pubKey?.startsWith('pk_live_')
    ? '✓ Production publishable key configured'
    : '⚠ Using test key (pk_test_)',
  '✗ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not found'
);

if (pubKey?.startsWith('pk_test_')) {
  warn('Publishable Key Mode', 'Using TEST mode key. Switch to pk_live_ for production.');
}

// Check STRIPE_WEBHOOK_SECRET
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
check(
  'STRIPE_WEBHOOK_SECRET',
  !!webhookSecret && webhookSecret.startsWith('whsec_'),
  '✓ Webhook secret configured',
  '✗ STRIPE_WEBHOOK_SECRET not configured or invalid'
);

// Check Price IDs
const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
check(
  'STRIPE_PRO_PRICE_ID',
  !!proPriceId && proPriceId.startsWith('price_'),
  '✓ Pro price ID configured',
  '✗ STRIPE_PRO_PRICE_ID not configured or invalid'
);

const entPriceId = process.env.STRIPE_ENTERPRISE_PRICE_ID;
check(
  'STRIPE_ENTERPRISE_PRICE_ID',
  !!entPriceId && entPriceId.startsWith('price_'),
  '✓ Enterprise price ID configured',
  '✗ STRIPE_ENTERPRISE_PRICE_ID not configured or invalid'
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
  console.log(`  ${result.message}\n`);
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Summary: ${passes} passed, ${fails} failed, ${warnings} warnings`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (fails > 0) {
  console.log('❌ Configuration is incomplete. Please fix the failed checks above.');
  console.log('📖 See STRIPE_SETUP.md for detailed setup instructions.\n');
  process.exit(1);
} else if (warnings > 0) {
  console.log('⚠️  Configuration is valid but has warnings.');
  console.log('For production deployment, address warnings above.\n');
  process.exit(0);
} else {
  console.log('✅ All Stripe configuration checks passed!');
  console.log('🚀 Ready for production deployment.\n');
  process.exit(0);
}
