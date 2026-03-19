#!/usr/bin/env tsx
/**
 * Stripe Price Creation Automation
 *
 * Creates all required price IDs for the pricing experiment:
 * - $29/year Pro (competitor match)
 * - $49/year Pro (value tier, default)
 * - $79/year Pro (premium)
 * - $19/month Pro (all variants)
 *
 * Usage:
 *   npm run stripe:create-experiment-prices
 *
 * Requirements:
 *   - STRIPE_SECRET_KEY set in environment (live mode)
 *   - Stripe CLI installed (optional, for testing)
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.startsWith('sk_test_')) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY must be set to a LIVE mode key');
  console.error('   Current key:', STRIPE_SECRET_KEY ? 'sk_test_...' : 'NOT SET');
  console.error('   Get your live key from: https://dashboard.stripe.com/apikeys');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

interface PriceConfig {
  amount: number;
  interval: 'month' | 'year';
  nickname: string;
  description: string;
  variant?: string;
  metadata: Record<string, string>;
}

const PRICES_TO_CREATE: PriceConfig[] = [
  {
    amount: 2900, // $29.00 in cents
    interval: 'year',
    nickname: 'pro_annual_29',
    description: 'Pro Annual - Competitor Match ($29/year)',
    variant: 'annual_29',
    metadata: {
      variant: 'annual_29',
      experiment: 'annual_pricing_competitive_test_2026_q1',
      positioning: 'competitor_match',
      tier: 'pro',
    },
  },
  {
    amount: 4900, // $49.00 in cents
    interval: 'year',
    nickname: 'pro_annual_49',
    description: 'Pro Annual - Value Tier ($49/year)',
    variant: 'annual_49',
    metadata: {
      variant: 'annual_49',
      experiment: 'annual_pricing_competitive_test_2026_q1',
      positioning: 'value_tier',
      default: 'true',
      tier: 'pro',
    },
  },
  {
    amount: 7900, // $79.00 in cents
    interval: 'year',
    nickname: 'pro_annual_79',
    description: 'Pro Annual - Premium ($79/year)',
    variant: 'annual_79',
    metadata: {
      variant: 'annual_79',
      experiment: 'annual_pricing_competitive_test_2026_q1',
      positioning: 'premium',
      tier: 'pro',
    },
  },
  {
    amount: 1900, // $19.00 in cents
    interval: 'month',
    nickname: 'pro_monthly_19',
    description: 'Pro Monthly ($19/month)',
    metadata: {
      billing_interval: 'monthly',
      shared_across_variants: 'true',
      tier: 'pro',
    },
  },
];

async function findOrCreateProduct(): Promise<string> {
  console.log('🔍 Looking for TaxBridge Pro product...\n');

  // Search for existing product
  const products = await stripe.products.search({
    query: 'name:"TaxBridge Pro"',
  });

  if (products.data.length > 0) {
    const product = products.data[0];
    console.log(`✅ Found existing product: ${product.id}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Created: ${new Date(product.created * 1000).toISOString()}\n`);
    return product.id;
  }

  console.log('📦 Creating new TaxBridge Pro product...\n');

  const product = await stripe.products.create({
    name: 'TaxBridge Pro',
    description: 'US-Canada cross-border tax calculator for H-1B/TN visa holders with RSUs',
    metadata: {
      tier: 'pro',
      created_for: 'pricing_experiment_2026_q1',
    },
  });

  console.log(`✅ Created product: ${product.id}\n`);
  return product.id;
}

async function createPrice(productId: string, config: PriceConfig): Promise<Stripe.Price> {
  console.log(`💰 Creating price: ${config.nickname}...`);
  console.log(`   Amount: $${(config.amount / 100).toFixed(2)} ${config.interval}`);

  const price = await stripe.prices.create({
    product: productId,
    currency: 'usd',
    unit_amount: config.amount,
    recurring: {
      interval: config.interval,
    },
    nickname: config.nickname,
    metadata: config.metadata,
  });

  console.log(`   ✅ Created: ${price.id}\n`);
  return price;
}

async function generateEnvVars(prices: Stripe.Price[]) {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  ENVIRONMENT VARIABLES FOR .env.production');
  console.log('═══════════════════════════════════════════════════════\n');

  const annual29 = prices.find(p => p.nickname === 'pro_annual_29');
  const annual49 = prices.find(p => p.nickname === 'pro_annual_49');
  const annual79 = prices.find(p => p.nickname === 'pro_annual_79');
  const monthly19 = prices.find(p => p.nickname === 'pro_monthly_19');

  console.log('# Pricing Experiment - Production Price IDs');
  console.log(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_29=${annual29?.id || 'MISSING'}`);
  console.log(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=${annual49?.id || 'MISSING'}`);
  console.log(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79=${annual79?.id || 'MISSING'}`);
  console.log(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY=${monthly19?.id || 'MISSING'}`);
  console.log('');
  console.log('# Legacy names (for backwards compatibility)');
  console.log(`STRIPE_PRO_PRICE_ID=${annual49?.id || 'MISSING'}`);
  console.log('');

  console.log('═══════════════════════════════════════════════════════\n');

  console.log('📋 NEXT STEPS:\n');
  console.log('1. Copy the environment variables above');
  console.log('2. Add them to Vercel:');
  console.log('   → https://vercel.com/your-org/taxbridge/settings/environment-variables');
  console.log('3. Redeploy production after updating env vars');
  console.log('4. Test each price variant in checkout\n');

  // Save to file for easy reference
  const envContent = `
# Generated by stripe:create-experiment-prices on ${new Date().toISOString()}

NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_29=${annual29?.id || 'MISSING'}
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=${annual49?.id || 'MISSING'}
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79=${annual79?.id || 'MISSING'}
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY=${monthly19?.id || 'MISSING'}

# Legacy
STRIPE_PRO_PRICE_ID=${annual49?.id || 'MISSING'}
`.trim();

  const fs = await import('fs');
  const path = await import('path');

  const outputPath = path.join(process.cwd(), 'docs', 'STRIPE_EXPERIMENT_PRICE_IDS.txt');
  fs.writeFileSync(outputPath, envContent);

  console.log(`💾 Price IDs saved to: ${outputPath}\n`);
}

async function verifyPrices() {
  console.log('🔍 Verifying created prices...\n');

  const prices = await stripe.prices.list({
    limit: 10,
  });

  const experimentPrices = prices.data.filter(p =>
    p.metadata?.experiment === 'annual_pricing_competitive_test_2026_q1'
  );

  if (experimentPrices.length === 0) {
    console.warn('⚠️  No experiment prices found. Did creation fail?\n');
    return;
  }

  console.log('✅ Experiment prices verified:\n');
  console.log('┌─────────────────┬──────────────────────────────┬─────────┬──────────┐');
  console.log('│ Nickname        │ Price ID                      │ Amount  │ Interval │');
  console.log('├─────────────────┼──────────────────────────────┼─────────┼──────────┤');

  experimentPrices.forEach(p => {
    const amount = `$${(p.unit_amount! / 100).toFixed(2)}`;
    const interval = p.recurring?.interval || 'N/A';
    const nickname = p.nickname || 'N/A';
    const id = p.id;

    console.log(
      `│ ${nickname.padEnd(15)} │ ${id.padEnd(28)} │ ${amount.padEnd(7)} │ ${interval.padEnd(8)} │`
    );
  });

  console.log('└─────────────────┴──────────────────────────────┴─────────┴──────────┘\n');
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║       Stripe Pricing Experiment - Price Creation Automation       ║');
  console.log('║              $29 vs $49 vs $79 Competitive Test                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Find or create product
    const productId = await findOrCreateProduct();

    // Step 2: Create all prices
    console.log('💰 Creating prices for experiment...\n');
    const createdPrices: Stripe.Price[] = [];

    for (const config of PRICES_TO_CREATE) {
      const price = await createPrice(productId, config);
      createdPrices.push(price);
    }

    console.log(`✅ Created ${createdPrices.length} prices successfully!\n`);

    // Step 3: Generate environment variables
    await generateEnvVars(createdPrices);

    // Step 4: Verify prices
    await verifyPrices();

    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✅ SUCCESS! All prices created');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('🔗 Quick Links:\n');
    console.log(`   Stripe Dashboard: https://dashboard.stripe.com/products/${productId}`);
    console.log(`   Subscriptions:    https://dashboard.stripe.com/subscriptions`);
    console.log(`   API Keys:         https://dashboard.stripe.com/apikeys\n`);

  } catch (error) {
    console.error('\n❌ ERROR creating prices:\n');

    if (error instanceof Stripe.errors.StripeError) {
      console.error(`   Type: ${error.type}`);
      console.error(`   Message: ${error.message}`);
      console.error(`   Code: ${error.code || 'N/A'}`);

      if (error.type === 'StripeAuthenticationError') {
        console.error('\n   💡 TIP: Check your STRIPE_SECRET_KEY is correct and in LIVE mode');
      }
    } else {
      console.error(error);
    }

    process.exit(1);
  }
}

main();
