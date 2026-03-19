/**
 * Verify Stripe Live Mode Configuration
 * Checks if Stripe is configured with live keys and validates price IDs
 *
 * Usage: npm run verify:stripe:live
 */

import Stripe from 'stripe';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const results: CheckResult[] = [];

function addResult(result: CheckResult): void {
  results.push(result);
}

function printResults(): void {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 STRIPE LIVE MODE VERIFICATION REPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const passes = results.filter((r) => r.status === 'pass').length;
  const fails = results.filter((r) => r.status === 'fail').length;
  const warnings = results.filter((r) => r.status === 'warning').length;

  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    const color =
      result.status === 'pass' ? '\x1b[32m' : result.status === 'warning' ? '\x1b[33m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(`${icon} ${color}${result.name}${reset}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Summary: ${passes} passed, ${fails} failed, ${warnings} warnings`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (fails > 0) {
    console.log('🚨 REVENUE BLOCKER: Stripe is NOT ready for production');
    console.log('📖 Fix the errors above before going live\n');
    return false;
  } else if (warnings > 0) {
    console.log('⚠️  Stripe configuration has warnings but is functional');
    console.log('Consider addressing warnings for optimal setup\n');
    return true;
  } else {
    console.log('🎉 SUCCESS! Stripe is configured for live production mode');
    console.log('💰 You can now accept real payments and generate revenue\n');
    return true;
  }
}

async function verifyStripeLive() {
  // 1. Check environment variables exist
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
  const entPriceId = process.env.STRIPE_ENTERPRISE_PRICE_ID;
  const publicProPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
  const publicEntPriceId = process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID;

  // 2. Check secret key is live mode
  if (!secretKey) {
    addResult({
      name: 'Secret Key',
      status: 'fail',
      message: 'STRIPE_SECRET_KEY not found in environment',
      details: 'Add your live key to .env.production or Vercel environment variables',
    });
  } else if (secretKey.startsWith('sk_test_')) {
    addResult({
      name: 'Secret Key',
      status: 'fail',
      message: 'Using TEST mode key (sk_test_...)',
      details: 'Replace with LIVE mode key (sk_live_...) from Stripe Dashboard',
    });
  } else if (secretKey === 'sk_live_YOUR_LIVE_SECRET_KEY_HERE') {
    addResult({
      name: 'Secret Key',
      status: 'fail',
      message: 'Using PLACEHOLDER key',
      details: 'Replace with real live key from https://dashboard.stripe.com/apikeys',
    });
  } else if (secretKey.startsWith('sk_live_')) {
    addResult({
      name: 'Secret Key',
      status: 'pass',
      message: 'Live mode secret key configured',
      details: `Key: ${secretKey.slice(0, 15)}...`,
    });
  } else {
    addResult({
      name: 'Secret Key',
      status: 'fail',
      message: 'Invalid secret key format',
      details: 'Must start with sk_live_ for production',
    });
  }

  // 3. Check publishable key is live mode
  if (!pubKey) {
    addResult({
      name: 'Publishable Key',
      status: 'fail',
      message: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not found',
    });
  } else if (pubKey.startsWith('pk_test_')) {
    addResult({
      name: 'Publishable Key',
      status: 'fail',
      message: 'Using TEST mode publishable key (pk_test_...)',
      details: 'Replace with LIVE mode key (pk_live_...)',
    });
  } else if (pubKey === 'pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE') {
    addResult({
      name: 'Publishable Key',
      status: 'fail',
      message: 'Using PLACEHOLDER publishable key',
      details: 'Replace with real live key from Stripe Dashboard',
    });
  } else if (pubKey.startsWith('pk_live_')) {
    addResult({
      name: 'Publishable Key',
      status: 'pass',
      message: 'Live mode publishable key configured',
    });
  } else {
    addResult({
      name: 'Publishable Key',
      status: 'fail',
      message: 'Invalid publishable key format',
    });
  }

  // 4. Check webhook secret
  if (!webhookSecret) {
    addResult({
      name: 'Webhook Secret',
      status: 'fail',
      message: 'STRIPE_WEBHOOK_SECRET not found',
      details: 'Get from https://dashboard.stripe.com/webhooks',
    });
  } else if (webhookSecret === 'whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE') {
    addResult({
      name: 'Webhook Secret',
      status: 'fail',
      message: 'Using PLACEHOLDER webhook secret',
      details: 'Replace with real webhook secret from Stripe Dashboard',
    });
  } else if (webhookSecret.startsWith('whsec_')) {
    addResult({
      name: 'Webhook Secret',
      status: 'pass',
      message: 'Webhook signing secret configured',
    });
  } else {
    addResult({
      name: 'Webhook Secret',
      status: 'warning',
      message: 'Webhook secret format unusual (should start with whsec_)',
    });
  }

  // 5. Check price IDs
  if (!proPriceId || proPriceId === 'price_YOUR_LIVE_PRO_PRICE_ID') {
    addResult({
      name: 'Pro Price ID',
      status: 'fail',
      message: 'Pro price ID not configured or using placeholder',
      details: 'Run: npm run setup:stripe to create live price IDs',
    });
  } else if (!proPriceId.startsWith('price_')) {
    addResult({
      name: 'Pro Price ID',
      status: 'fail',
      message: 'Invalid Pro price ID format',
      details: 'Must start with price_',
    });
  } else {
    addResult({
      name: 'Pro Price ID',
      status: 'pass',
      message: `Pro price configured: ${proPriceId}`,
    });
  }

  if (!entPriceId || entPriceId === 'price_YOUR_LIVE_ENTERPRISE_PRICE_ID') {
    addResult({
      name: 'Enterprise Price ID',
      status: 'fail',
      message: 'Enterprise price ID not configured or using placeholder',
      details: 'Run: npm run setup:stripe to create live price IDs',
    });
  } else if (!entPriceId.startsWith('price_')) {
    addResult({
      name: 'Enterprise Price ID',
      status: 'fail',
      message: 'Invalid Enterprise price ID format',
    });
  } else {
    addResult({
      name: 'Enterprise Price ID',
      status: 'pass',
      message: `Enterprise price configured: ${entPriceId}`,
    });
  }

  // 6. Check public price IDs match private ones
  if (proPriceId !== publicProPriceId) {
    addResult({
      name: 'Pro Price ID Sync',
      status: 'warning',
      message: 'STRIPE_PRO_PRICE_ID and NEXT_PUBLIC_STRIPE_PRO_PRICE_ID do not match',
      details: 'These should be identical for consistency',
    });
  } else if (proPriceId && proPriceId.startsWith('price_')) {
    addResult({
      name: 'Pro Price ID Sync',
      status: 'pass',
      message: 'Pro price IDs synchronized',
    });
  }

  if (entPriceId !== publicEntPriceId) {
    addResult({
      name: 'Enterprise Price ID Sync',
      status: 'warning',
      message: 'Enterprise price IDs do not match between server and client',
    });
  } else if (entPriceId && entPriceId.startsWith('price_')) {
    addResult({
      name: 'Enterprise Price ID Sync',
      status: 'pass',
      message: 'Enterprise price IDs synchronized',
    });
  }

  // 7. Test API connection (if valid keys)
  if (secretKey?.startsWith('sk_live_') && secretKey !== 'sk_live_YOUR_LIVE_SECRET_KEY_HERE') {
    try {
      const stripe = new Stripe(secretKey, {
        apiVersion: '2024-12-18.acacia',
        typescript: true,
      });

      // Test API connection
      const account = await stripe.accounts.retrieve();

      addResult({
        name: 'API Connection',
        status: 'pass',
        message: 'Successfully connected to Stripe API',
        details: `Account: ${account.business_profile?.name || account.id}`,
      });

      // Verify price IDs exist
      if (proPriceId && proPriceId.startsWith('price_')) {
        try {
          const price = await stripe.prices.retrieve(proPriceId);
          const amount = (price.unit_amount || 0) / 100;
          const interval = price.recurring?.interval || 'unknown';

          if (amount === 29 && interval === 'month') {
            addResult({
              name: 'Pro Price Validation',
              status: 'pass',
              message: `Pro price exists: $${amount}/${interval}`,
            });
          } else {
            addResult({
              name: 'Pro Price Validation',
              status: 'warning',
              message: `Pro price exists but amount/interval unexpected: $${amount}/${interval}`,
              details: 'Expected: $29/month',
            });
          }
        } catch (error: any) {
          addResult({
            name: 'Pro Price Validation',
            status: 'fail',
            message: 'Pro price ID does not exist in Stripe',
            details: error.message,
          });
        }
      }

      if (entPriceId && entPriceId.startsWith('price_')) {
        try {
          const price = await stripe.prices.retrieve(entPriceId);
          const amount = (price.unit_amount || 0) / 100;
          const interval = price.recurring?.interval || 'unknown';

          if (amount === 199 && interval === 'month') {
            addResult({
              name: 'Enterprise Price Validation',
              status: 'pass',
              message: `Enterprise price exists: $${amount}/${interval}`,
            });
          } else {
            addResult({
              name: 'Enterprise Price Validation',
              status: 'warning',
              message: `Enterprise price exists but amount/interval unexpected: $${amount}/${interval}`,
              details: 'Expected: $199/month',
            });
          }
        } catch (error: any) {
          addResult({
            name: 'Enterprise Price Validation',
            status: 'fail',
            message: 'Enterprise price ID does not exist in Stripe',
            details: error.message,
          });
        }
      }

      // Check for webhooks configured
      const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
      const prodWebhook = webhooks.data.find((wh) =>
        wh.url.includes('taxbridge.app') || wh.url.includes(process.env.NEXT_PUBLIC_APP_URL || '')
      );

      if (prodWebhook) {
        addResult({
          name: 'Webhook Endpoint',
          status: 'pass',
          message: 'Production webhook endpoint configured',
          details: `URL: ${prodWebhook.url}`,
        });
      } else {
        addResult({
          name: 'Webhook Endpoint',
          status: 'warning',
          message: 'No webhook endpoint found for production domain',
          details: 'Configure at https://dashboard.stripe.com/webhooks',
        });
      }

    } catch (error: any) {
      addResult({
        name: 'API Connection',
        status: 'fail',
        message: 'Failed to connect to Stripe API',
        details: error.message,
      });
    }
  }

  // Print all results
  const success = printResults();

  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Run verification
verifyStripeLive().catch((error) => {
  console.error('❌ Verification script error:', error);
  process.exit(1);
});
