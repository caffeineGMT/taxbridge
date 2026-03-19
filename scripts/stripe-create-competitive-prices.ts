/**
 * Stripe Competitive Pricing Setup - Create $29 and $49 Price IDs
 *
 * This script creates Stripe price IDs for the pricing experiment:
 * - $29/year (annual_29) - Competitor match pricing
 * - $49/year (annual_49) - Middle ground pricing
 * - $79/year (annual_79) - Premium pricing (already exists)
 *
 * PREREQUISITE: Stripe must be in PRODUCTION mode
 *
 * Usage: npm run stripe:create-competitive-prices
 */

import Stripe from 'stripe';
import * as fs from 'fs';
import * as path from 'path';

// ════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════════

const PRICE_TIERS = [
  {
    amount: 2900, // $29.00
    displayName: 'Pro Plan - Competitor Match ($29/year)',
    nickname: 'Pro Annual $29',
    envVar: 'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_29',
    description: 'Unlimited RSU entries, FTC optimizer, PDF export, AI tax advisor - Competitor match pricing',
  },
  {
    amount: 4900, // $49.00
    displayName: 'Pro Plan - Smart Value ($49/year)',
    nickname: 'Pro Annual $49',
    envVar: 'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID',
    description: 'Unlimited RSU entries, FTC optimizer, PDF export, AI tax advisor - Best value tier',
  },
  {
    amount: 7900, // $79.00
    displayName: 'Pro Plan - Premium ($79/year)',
    nickname: 'Pro Annual $79',
    envVar: 'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79',
    description: 'Unlimited RSU entries, FTC optimizer, PDF export, AI tax advisor, priority support',
  },
];

// ════════════════════════════════════════════════════════════════════════
// MAIN SCRIPT
// ════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════════════════');
  console.log('  🎯 STRIPE COMPETITIVE PRICING SETUP');
  console.log('  Creating $29, $49, $79 annual price IDs for A/B/C test');
  console.log('═══════════════════════════════════════════════════════════════════════\n');

  // Step 1: Check Stripe API key
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    console.error('❌ ERROR: STRIPE_SECRET_KEY not found in environment variables');
    console.error('   Add to .env.local: STRIPE_SECRET_KEY=sk_live_...\n');
    process.exit(1);
  }

  if (stripeKey.startsWith('sk_test_')) {
    console.error('❌ ERROR: Stripe is in TEST mode');
    console.error('   This script requires PRODUCTION Stripe keys (sk_live_...)');
    console.error('   Current key: ' + stripeKey.substring(0, 15) + '...\n');
    console.error('   ⚠️  DO NOT create production price IDs with test keys!\n');
    process.exit(1);
  }

  console.log('✅ Stripe Production mode detected');
  console.log(`   Key: ${stripeKey.substring(0, 15)}...${stripeKey.substring(stripeKey.length - 4)}\n`);

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-01-27.acacia',
  });

  // Step 2: Create or verify product
  console.log('Step 1: Checking for existing "Pro Plan" product...');

  let product: Stripe.Product;
  try {
    const products = await stripe.products.list({ limit: 100 });
    const existingProduct = products.data.find(p => p.name === 'Pro Plan');

    if (existingProduct) {
      product = existingProduct;
      console.log(`✅ Found existing product: ${product.id}\n`);
    } else {
      console.log('   Creating new "Pro Plan" product...');
      product = await stripe.products.create({
        name: 'Pro Plan',
        description: 'Unlimited RSU entries, Foreign Tax Credit optimizer, PDF export, AI tax advisor, priority support',
        metadata: {
          tier: 'pro',
          features: 'unlimited_rsu,ftc_optimizer,pdf_export,ai_advisor,priority_support',
        },
      });
      console.log(`✅ Created product: ${product.id}\n`);
    }
  } catch (error: any) {
    console.error('❌ Failed to create/retrieve product:', error.message);
    process.exit(1);
  }

  // Step 3: Create price IDs
  console.log('Step 2: Creating annual price IDs for A/B/C test...\n');

  const createdPrices: Array<{
    tier: string;
    amount: number;
    priceId: string;
    envVar: string;
  }> = [];

  for (const tier of PRICE_TIERS) {
    console.log(`   Creating: ${tier.displayName}...`);

    try {
      // Check if price already exists
      const existingPrices = await stripe.prices.list({
        product: product.id,
        active: true,
      });

      const exists = existingPrices.data.find(
        p => p.unit_amount === tier.amount && p.recurring?.interval === 'year'
      );

      if (exists) {
        console.log(`   ⚠️  Price already exists: ${exists.id}`);
        createdPrices.push({
          tier: tier.nickname,
          amount: tier.amount / 100,
          priceId: exists.id,
          envVar: tier.envVar,
        });
        continue;
      }

      // Create new price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: tier.amount,
        currency: 'usd',
        recurring: {
          interval: 'year',
        },
        nickname: tier.nickname,
        metadata: {
          tier: 'pro',
          experiment: 'annual_pricing_competitive_test_2026_q1',
          description: tier.description,
        },
      });

      console.log(`   ✅ Created: ${price.id}\n`);

      createdPrices.push({
        tier: tier.nickname,
        amount: tier.amount / 100,
        priceId: price.id,
        envVar: tier.envVar,
      });
    } catch (error: any) {
      console.error(`   ❌ Failed to create price:`, error.message);
    }
  }

  // Step 4: Display results
  console.log('\n═══════════════════════════════════════════════════════════════════════');
  console.log('  ✅ PRICE IDS CREATED SUCCESSFULLY');
  console.log('═══════════════════════════════════════════════════════════════════════\n');

  console.log('📋 Created Price IDs:\n');

  createdPrices.forEach((p, i) => {
    console.log(`${i + 1}. ${p.tier}: $${p.amount}/year`);
    console.log(`   Price ID: ${p.priceId}`);
    console.log(`   Env Var:  ${p.envVar}\n`);
  });

  // Step 5: Generate .env update instructions
  console.log('┌─────────────────────────────────────────────────────────────────────┐');
  console.log('│ 📝 NEXT STEPS - UPDATE ENVIRONMENT VARIABLES                        │');
  console.log('└─────────────────────────────────────────────────────────────────────┘\n');

  console.log('Copy these to your .env.production file:\n');

  const envUpdates = createdPrices.map(p => `${p.envVar}=${p.priceId}`).join('\n');
  console.log(envUpdates);
  console.log('');

  console.log('Then update in Vercel Dashboard:');
  console.log('1. Go to https://vercel.com/your-project/settings/environment-variables');
  console.log('2. Add each variable above to Production environment');
  console.log('3. Redeploy the site to pick up new price IDs\n');

  // Step 6: Save to file
  const outputPath = path.join(process.cwd(), 'docs', 'STRIPE_COMPETITIVE_PRICES.md');
  const markdown = `# Stripe Competitive Pricing - Price IDs

**Generated:** ${new Date().toISOString()}
**Product:** ${product.id} (Pro Plan)

## Price IDs Created

${createdPrices.map((p, i) => `
### ${i + 1}. ${p.tier}

- **Price:** $${p.amount}/year
- **Price ID:** \`${p.priceId}\`
- **Environment Variable:** \`${p.envVar}\`
`).join('\n')}

## Environment Variables

Add to \`.env.production\`:

\`\`\`bash
${envUpdates}
\`\`\`

## Vercel Configuration

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add each variable above to **Production** environment
3. Redeploy to activate

## A/B/C Test Configuration

The pricing experiment is already configured in \`hooks/use-pricing-experiment.ts\`:

- **annual_29**: 33% of users see $29/year (competitor match)
- **annual_49**: 33% of users see $49/year (best value)
- **annual_79**: 33% of users see $79/year (premium)

PostHog tracks which variant converts best.

## Expected Results

- **Higher conversion rate** at $29 and $49 price points
- **Lower revenue per customer** but higher volume
- **Net MRR increase** of $2K-$5K/month

Monitor results in PostHog dashboard: \`/admin/conversion-experiments\`

---

**Script:** \`scripts/stripe-create-competitive-prices.ts\`
`;

  fs.writeFileSync(outputPath, markdown);
  console.log(`✅ Documentation saved to: ${outputPath}\n`);

  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('  🎉 SETUP COMPLETE');
  console.log('  Pricing experiment is ready to activate!');
  console.log('═══════════════════════════════════════════════════════════════════════\n');

  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
}

export { main };
