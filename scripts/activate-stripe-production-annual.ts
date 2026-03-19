/**
 * STRIPE PRODUCTION ACTIVATION - ANNUAL PRICING
 *
 * This script creates the LIVE Stripe products and price IDs for TaxBridge.
 *
 * CRITICAL PREREQUISITES:
 * 1. Get LIVE Stripe keys from https://dashboard.stripe.com/apikeys
 * 2. Toggle to "Production" mode (NOT test mode)
 * 3. Copy sk_live_... and pk_live_... keys
 * 4. Set STRIPE_SECRET_KEY=sk_live_... in your terminal:
 *    export STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY_HERE
 * 5. Run this script: npx tsx scripts/activate-stripe-production-annual.ts
 *
 * PRICING STRUCTURE:
 * - Basic Plan: $49/year (Annual only)
 * - Pro Plan: $79/year (Annual - Standard)
 * - Enterprise: Custom pricing (contact sales)
 */

import Stripe from 'stripe';

// ============================================================
// 1. ENVIRONMENT VALIDATION
// ============================================================

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY not found in environment');
  console.error('');
  console.error('Set your LIVE key in terminal:');
  console.error('  export STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY_HERE');
  console.error('');
  console.error('Get keys from: https://dashboard.stripe.com/apikeys (Production mode)');
  process.exit(1);
}

if (stripeSecretKey.startsWith('sk_test_')) {
  console.error('❌ CRITICAL ERROR: You are using a TEST key!');
  console.error('');
  console.error('This script is for PRODUCTION activation only.');
  console.error('Toggle to "Production" mode in Stripe Dashboard and get sk_live_ key.');
  console.error('');
  process.exit(1);
}

if (!stripeSecretKey.startsWith('sk_live_')) {
  console.error('❌ ERROR: Invalid Stripe key format');
  console.error('Expected: sk_live_...');
  console.error(`Got: ${stripeSecretKey.substring(0, 10)}...`);
  process.exit(1);
}

console.log('✅ VALIDATION PASSED: Using LIVE Stripe key\n');

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// ============================================================
// 2. CREATE PRODUCTS & PRICES
// ============================================================

async function createProductsAndPrices() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 STRIPE PRODUCTION ACTIVATION - ANNUAL PRICING');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const createdPrices: Record<string, string> = {};

  try {
    // --------------------------------------------------------
    // BASIC PLAN - $49/year
    // --------------------------------------------------------
    console.log('📦 Creating Basic Plan ($49/year)...');

    const basicProduct = await stripe.products.create({
      name: 'TaxBridge Basic',
      description: 'Essential cross-border tax calculations for H-1B/TN workers with RSUs',
      metadata: {
        tier: 'basic',
        billing_cycle: 'annual',
        features: JSON.stringify([
          'Up to 5 RSU entries per year',
          'Cross-border tax calculator',
          'FTC calculation',
          'PDF tax summary export',
          'Email support (48hr response)',
        ]),
      },
    });

    const basicAnnualPrice = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 4900, // $49.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        tier: 'basic',
        billing_cycle: 'annual',
        plan_name: 'Basic Annual',
      },
    });

    createdPrices.STRIPE_BASIC_PRICE_ID = basicAnnualPrice.id;
    console.log(`   ✓ Product: ${basicProduct.id}`);
    console.log(`   ✓ Price: ${basicAnnualPrice.id} ($49/year)\n`);

    // --------------------------------------------------------
    // PRO PLAN - $79/year (Standard)
    // --------------------------------------------------------
    console.log('📦 Creating Pro Plan ($79/year - Standard)...');

    const proProduct = await stripe.products.create({
      name: 'TaxBridge Pro',
      description: 'Complete tax optimization suite for cross-border professionals',
      metadata: {
        tier: 'pro',
        billing_cycle: 'annual',
        features: JSON.stringify([
          'Unlimited RSU entries',
          'Foreign Tax Credit optimizer',
          'Multi-year tax dashboard',
          'CSV bulk import',
          'Advanced tax scenarios',
          'PDF exports & reports',
          'Priority support (12hr response)',
          'Quarterly tax planning',
        ]),
      },
    });

    const proAnnualPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 7900, // $79.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        tier: 'pro',
        billing_cycle: 'annual',
        plan_name: 'Pro Annual',
      },
    });

    createdPrices.STRIPE_PRO_PRICE_ID = proAnnualPrice.id;
    console.log(`   ✓ Product: ${proProduct.id}`);
    console.log(`   ✓ Price: ${proAnnualPrice.id} ($79/year)\n`);

    // --------------------------------------------------------
    // ENTERPRISE PLAN - Custom Pricing (Product only)
    // --------------------------------------------------------
    console.log('📦 Creating Enterprise Plan (custom pricing)...');

    const enterpriseProduct = await stripe.products.create({
      name: 'TaxBridge Enterprise',
      description: 'White-label tax solution for accounting firms and immigration lawyers',
      metadata: {
        tier: 'enterprise',
        billing_cycle: 'custom',
        features: JSON.stringify([
          'All Pro features',
          'Client management dashboard',
          'White-label reports',
          'API access',
          'Custom integrations',
          'Dedicated account manager',
          'Custom contract terms',
          '24/7 priority support',
        ]),
      },
    });

    console.log(`   ✓ Product: ${enterpriseProduct.id} (no price - custom quotes)\n`);

    // --------------------------------------------------------
    // SUCCESS SUMMARY
    // --------------------------------------------------------
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS! Stripe products created in LIVE mode');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 COPY THESE TO VERCEL ENVIRONMENT VARIABLES:\n');
    console.log(`STRIPE_BASIC_PRICE_ID=${createdPrices.STRIPE_BASIC_PRICE_ID}`);
    console.log(`NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=${createdPrices.STRIPE_BASIC_PRICE_ID}`);
    console.log('');
    console.log(`STRIPE_PRO_PRICE_ID=${createdPrices.STRIPE_PRO_PRICE_ID}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=${createdPrices.STRIPE_PRO_PRICE_ID}`);
    console.log('');
    console.log(`STRIPE_ENTERPRISE_PRICE_ID=${enterpriseProduct.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=${enterpriseProduct.id}\n`);

    // --------------------------------------------------------
    // NEXT STEPS
    // --------------------------------------------------------
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 NEXT STEPS (CRITICAL - DO NOT SKIP):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('1. UPDATE VERCEL ENVIRONMENT VARIABLES:');
    console.log('   • Go to: https://vercel.com/your-project/settings/environment-variables');
    console.log('   • Set STRIPE_SECRET_KEY=sk_live_YOUR_KEY');
    console.log('   • Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY');
    console.log('   • Copy price IDs from above (STRIPE_BASIC_PRICE_ID, STRIPE_PRO_PRICE_ID)\n');

    console.log('2. SETUP STRIPE WEBHOOK:');
    console.log('   • Go to: https://dashboard.stripe.com/webhooks');
    console.log('   • Click "Add endpoint"');
    console.log('   • Endpoint URL: https://taxbridge.app/api/stripe/webhook');
    console.log('   • Select events:');
    console.log('     - checkout.session.completed');
    console.log('     - customer.subscription.updated');
    console.log('     - customer.subscription.deleted');
    console.log('     - invoice.payment_failed');
    console.log('     - invoice.payment_succeeded');
    console.log('   • Copy webhook signing secret (whsec_...)');
    console.log('   • Add to Vercel: STRIPE_WEBHOOK_SECRET=whsec_...\n');

    console.log('3. TEST CHECKOUT FLOW:');
    console.log('   • Use test card: 4242 4242 4242 4242');
    console.log('   • Any future expiry date (12/28)');
    console.log('   • Any 3-digit CVC (123)');
    console.log('   • Any 5-digit ZIP (12345)');
    console.log('   • Complete checkout for Pro plan ($79/year)');
    console.log('   • Verify webhook received in Stripe Dashboard → Webhooks → Recent events');
    console.log('   • Check subscription created: Dashboard → Customers\n');

    console.log('4. REFUND TEST TRANSACTION:');
    console.log('   • Go to: https://dashboard.stripe.com/payments');
    console.log('   • Find test payment');
    console.log('   • Click "Refund" → Full refund');
    console.log('   • Verify refund webhook received\n');

    console.log('5. VERIFY PRODUCTION REVENUE:');
    console.log('   • Monitor: https://dashboard.stripe.com/dashboard');
    console.log('   • Check MRR chart updates after first real subscription');
    console.log('   • Set up alerts for failed payments\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  IMPORTANT:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('• Revenue is BLOCKED until you complete ALL 5 steps above');
    console.log('• Use test card 4242... for testing (it will NOT charge real money)');
    console.log('• After successful test + refund, you\'re LIVE for real revenue');
    console.log('• First real customer = revenue starts flowing! 💰\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 PRICING SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Basic:      $49/year  (5 RSU entries)');
    console.log('Pro:        $79/year  (unlimited, priority support)');
    console.log('Enterprise: Custom    (white-label, API access)\n');

    console.log('View products: https://dashboard.stripe.com/products');
    console.log('');

  } catch (error: any) {
    console.error('\n❌ ERROR CREATING PRODUCTS:\n');
    console.error(error.message);

    if (error.code === 'invalid_request_error') {
      console.error('\n🔧 TROUBLESHOOTING:');
      console.error('• Verify Stripe API key is correct (sk_live_...)');
      console.error('• Check you have permission to create products in Stripe');
      console.error('• Make sure you\'re in Production mode (NOT test mode)');
      console.error('• Try refreshing your Stripe API key');
    }

    if (error.type === 'StripeAuthenticationError') {
      console.error('\n🔧 AUTHENTICATION FAILED:');
      console.error('Your Stripe key is invalid or expired.');
      console.error('Get a fresh key: https://dashboard.stripe.com/apikeys');
    }

    process.exit(1);
  }
}

// ============================================================
// 3. RUN ACTIVATION
// ============================================================

console.log('Starting Stripe production activation...\n');
createProductsAndPrices();
