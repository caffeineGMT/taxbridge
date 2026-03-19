/**
 * Create Stripe Price for $39/year Pro Plan
 *
 * This script creates the new $39/year price point for the pricing experiment
 * based on competitor research showing market rate at $29/year.
 *
 * Run: npx tsx scripts/setup-stripe-price-39.ts
 *
 * Prerequisites:
 * - STRIPE_SECRET_KEY environment variable must be set to LIVE key (sk_live_...)
 * - Stripe account must be in production mode
 *
 * Outputs:
 * - Price ID for annual $39 plan
 * - Updates required for .env.production
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.error('   Set it with: export STRIPE_SECRET_KEY=sk_live_YOUR_KEY');
  process.exit(1);
}

if (STRIPE_SECRET_KEY.startsWith('sk_test_')) {
  console.error('❌ STRIPE_SECRET_KEY appears to be a TEST key (starts with sk_test_)');
  console.error('   This script requires a PRODUCTION key (sk_live_...)');
  console.error('   Get production keys from: https://dashboard.stripe.com/apikeys');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TaxBridge Stripe Price Setup: $39/year Pro Plan');
  console.log('═══════════════════════════════════════════════════════\n');

  // Step 1: Find or create the Pro product
  console.log('Step 1: Locating Pro product...');

  let products = await stripe.products.list({ limit: 100 });
  let proProduct = products.data.find(
    (p) => p.name === 'Pro' || p.metadata?.tier === 'pro'
  );

  if (!proProduct) {
    console.log('  Pro product not found. Creating new product...');
    proProduct = await stripe.products.create({
      name: 'Pro',
      description: 'Unlimited RSU entries, FTC optimizer, AI tax advisor, priority support',
      metadata: {
        tier: 'pro',
        features: 'unlimited_rsu,ftc_optimizer,ai_advisor,priority_support,csv_import,pdf_export',
      },
    });
    console.log(`  ✅ Created Pro product: ${proProduct.id}`);
  } else {
    console.log(`  ✅ Found existing Pro product: ${proProduct.id}`);
  }

  // Step 2: Create $39/year price
  console.log('\nStep 2: Creating $39/year price...');

  const annualPrice39 = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 3900, // $39.00 in cents
    currency: 'usd',
    recurring: {
      interval: 'year',
      interval_count: 1,
    },
    billing_scheme: 'per_unit',
    nickname: 'Pro Annual - $39/year (Competitor Price Match)',
    metadata: {
      tier: 'pro',
      interval: 'annual',
      experiment: 'annual_pricing_test_march_2026',
      variant: 'annual_39',
      pricing_rationale: 'Competitor research: market rate $29/year, testing $39 as middle ground vs current $79',
      valid_until: '2026-04-02', // 2-week experiment
    },
  });

  console.log(`  ✅ Created $39/year price: ${annualPrice39.id}`);

  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  ✅ Setup Complete!');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('📋 Add these to your .env.production:\n');
  console.log(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_39=${annualPrice39.id}`);
  console.log(`STRIPE_PRO_PRICE_ID_39=${annualPrice39.id}\n`);

  console.log('📊 Pricing Experiment Configuration:');
  console.log('  Variant: annual_39');
  console.log('  Price: $39/year');
  console.log('  Original Price: $79/year (shown as strikethrough)');
  console.log('  Discount: 50% off');
  console.log('  Duration: 2 weeks (March 19 - April 2, 2026)');
  console.log('  Allocation: 25% of new visitors\n');

  console.log('💡 Next Steps:');
  console.log('  1. Add environment variables to Vercel dashboard');
  console.log('  2. Deploy to production (git push)');
  console.log('  3. Monitor conversion rates in PostHog');
  console.log('  4. Run: npm run pricing:analyze (after 2 weeks)\n');

  console.log('📈 Expected Results (from competitor research):');
  console.log('  - Current conversion at $79: ~1.5%');
  console.log('  - Expected conversion at $39: ~6-8%');
  console.log('  - Revenue per 100 visitors: $118 → $234-$312 (+98-164%)');
  console.log('  - 2-week test sample: ~500 visitors → 30-40 conversions expected\n');

  console.log('🔗 Useful Links:');
  console.log('  - Stripe Dashboard: https://dashboard.stripe.com/prices');
  console.log('  - Competitor Analysis: docs/COMPETITOR_PRICING_ANALYSIS_2026.md');
  console.log('  - Experiment Tracking: /api/admin/pricing-experiment-stats\n');

  // Verification
  console.log('🔍 Verification:');
  const retrievedPrice = await stripe.prices.retrieve(annualPrice39.id);
  console.log(`  Product: ${retrievedPrice.product}`);
  console.log(`  Amount: $${(retrievedPrice.unit_amount || 0) / 100}/year`);
  console.log(`  Status: ${retrievedPrice.active ? 'Active ✅' : 'Inactive ❌'}`);
  console.log('\n✅ All systems ready for pricing experiment!');
}

main().catch((error) => {
  console.error('\n❌ Error creating Stripe price:');
  console.error(error.message);
  if (error.type === 'StripeAuthenticationError') {
    console.error('\n💡 Tip: Check your STRIPE_SECRET_KEY is correct and starts with sk_live_');
  }
  process.exit(1);
});
