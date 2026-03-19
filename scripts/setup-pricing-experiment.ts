/**
 * Setup Pricing Experiment - Create Stripe Price Products
 *
 * Creates:
 * 1. $79/year Pro plan (A/B/C test variant B)
 * 2. $99/year Pro plan (A/B/C test variant C)
 * 3. $19/month Pro plan (new monthly option)
 *
 * Run: npx ts-node scripts/setup-pricing-experiment.ts
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

async function setupPricingExperiment() {
  console.log('🚀 Setting up pricing experiment products...\n');

  try {
    // Get or create Pro product
    let product: Stripe.Product;

    const existingProducts = await stripe.products.search({
      query: 'name:"TaxBridge Pro"',
    });

    if (existingProducts.data.length > 0) {
      product = existingProducts.data[0];
      console.log('✅ Found existing Pro product:', product.id);
    } else {
      product = await stripe.products.create({
        name: 'TaxBridge Pro',
        description: 'Advanced cross-border tax calculations for H-1B and TN visa holders',
        metadata: {
          tier: 'pro',
        },
      });
      console.log('✅ Created Pro product:', product.id);
    }

    // Create $79/year price (A/B/C test variant B)
    const price79Annual = await stripe.prices.create({
      product: product.id,
      unit_amount: 7900, // $79.00
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      nickname: 'Pro Annual $79 (Variant B)',
      metadata: {
        tier: 'pro',
        variant: 'annual_79',
        experiment: 'pricing_test_2026_q1',
      },
    });
    console.log('✅ Created $79/year price:', price79Annual.id);

    // Create $99/year price (A/B/C test variant C)
    const price99Annual = await stripe.prices.create({
      product: product.id,
      unit_amount: 9900, // $99.00
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      nickname: 'Pro Annual $99 (Variant C)',
      metadata: {
        tier: 'pro',
        variant: 'annual_99',
        experiment: 'pricing_test_2026_q1',
      },
    });
    console.log('✅ Created $99/year price:', price99Annual.id);

    // Create $19/month price (new monthly option)
    const price19Monthly = await stripe.prices.create({
      product: product.id,
      unit_amount: 1900, // $19.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      nickname: 'Pro Monthly $19',
      metadata: {
        tier: 'pro',
        variant: 'monthly_19',
      },
    });
    console.log('✅ Created $19/month price:', price19Monthly.id);

    // Get existing $49/year price
    const price49Annual = process.env.STRIPE_PRO_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
    console.log('✅ Existing $49/year price:', price49Annual);

    console.log('\n' + '='.repeat(70));
    console.log('✅ PRICING EXPERIMENT SETUP COMPLETE\n');
    console.log('Add these to your .env.local file:\n');
    console.log(`STRIPE_PRO_PRICE_ID_49=${price49Annual}`);
    console.log(`STRIPE_PRO_PRICE_ID_79=${price79Annual.id}`);
    console.log(`STRIPE_PRO_PRICE_ID_MONTHLY=${price19Monthly.id}`);
    console.log('\nOr use these directly in your code:');
    console.log(`- Annual $49 (Variant A): ${price49Annual}`);
    console.log(`- Annual $79 (Variant B): ${price79Annual.id}`);
    console.log(`- Monthly $19: ${price19Monthly.id}`);
    console.log('='.repeat(70) + '\n');

    // Create a summary file
    const summary = {
      created_at: new Date().toISOString(),
      product_id: product.id,
      prices: {
        annual_49: price49Annual,
        annual_79: price79Annual.id,
        monthly_19: price19Monthly.id,
      },
      experiment_config: {
        name: 'pricing_test_2026_q1',
        variants: {
          A: { price: 49, interval: 'year', price_id: price49Annual },
          B: { price: 79, interval: 'year', price_id: price79Annual.id },
        },
        monthly_option: { price: 19, interval: 'month', price_id: price19Monthly.id },
      },
    };

    const fs = require('fs');
    fs.writeFileSync(
      'PRICING_EXPERIMENT_SETUP.json',
      JSON.stringify(summary, null, 2)
    );
    console.log('📝 Configuration saved to PRICING_EXPERIMENT_SETUP.json\n');

  } catch (error) {
    console.error('❌ Error setting up pricing experiment:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    process.exit(1);
  }
}

setupPricingExperiment();
