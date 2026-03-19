/**
 * Setup Pricing Experiment V2 - $29/$49/$79 A/B/C Test
 *
 * Creates Stripe prices for the competitive pricing experiment:
 * 1. $29/year Pro plan (Variant A - Competitor Match)
 * 2. $49/year Pro plan (Variant B - Smart Choice - EXISTING)
 * 3. $79/year Pro plan (Variant C - Premium - EXISTING)
 * 4. $19/month Pro plan (Monthly option - EXISTING)
 *
 * HYPOTHESIS:
 * - Competitor research shows SimpleTax/Sprintax at $29/year
 * - Current $79 pricing may be conversion blocker
 * - Testing if lower price points increase conversion rate
 *
 * Run: npx ts-node scripts/setup-pricing-experiment-v2.ts
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

async function setupPricingExperimentV2() {
  console.log('🚀 Setting up Pricing Experiment V2: $29/$49/$79 A/B/C Test\n');
  console.log('📊 Hypothesis: Lower pricing increases conversion rate\n');

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
        description: 'Advanced cross-border tax calculations for H-1B and TN visa holders with unlimited RSU entries, FTC optimization, and professional reports',
        metadata: {
          tier: 'pro',
        },
      });
      console.log('✅ Created Pro product:', product.id);
    }

    // Create $29/year price (NEW - Variant A - Competitor Match)
    const price29Annual = await stripe.prices.create({
      product: product.id,
      unit_amount: 2900, // $29.00
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      nickname: 'Pro Annual $29 (Variant A - Competitor Match)',
      metadata: {
        tier: 'pro',
        variant: 'annual_29',
        experiment: 'pricing_competitive_test_2026_q1',
        value_prop: 'competitor_match',
        positioning: 'SimpleTax/Sprintax price parity',
      },
    });
    console.log('✅ Created $29/year price (NEW):', price29Annual.id);

    // Get existing $49/year price (Variant B - Smart Choice)
    const price49Annual = process.env.STRIPE_PRO_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
    console.log('✅ Existing $49/year price (Variant B):', price49Annual);

    // Get existing $79/year price (Variant C - Premium)
    const price79Annual = process.env.STRIPE_PRO_PRICE_ID_79 || process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79;
    console.log('✅ Existing $79/year price (Variant C):', price79Annual);

    // Get existing $19/month price
    const price19Monthly = process.env.STRIPE_PRO_PRICE_ID_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY;
    console.log('✅ Existing $19/month price:', price19Monthly);

    console.log('\n' + '='.repeat(80));
    console.log('✅ PRICING EXPERIMENT V2 SETUP COMPLETE\n');
    console.log('🎯 A/B/C TEST CONFIGURATION:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('│ Variant │ Price    │ Value Proposition          │ Hypothesis            │');
    console.log('├─────────┼──────────┼────────────────────────────┼───────────────────────┤');
    console.log('│ A       │ $29/year │ Competitor Match           │ Max conversions       │');
    console.log('│ B       │ $49/year │ Smart Choice (middle)      │ Balance conv + rev    │');
    console.log('│ C       │ $79/year │ Premium (current)          │ Max revenue per user  │');
    console.log('│ All     │ $19/mo   │ Monthly flexibility        │ Low commitment option │');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📝 Add these to your .env.local and .env.production files:\n');
    console.log(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_29=${price29Annual.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=${price49Annual}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79=${price79Annual}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY=${price19Monthly}`);
    console.log('');
    console.log('='.repeat(80) + '\n');

    // Create experiment configuration file
    const experimentConfig = {
      experiment_name: 'pricing_competitive_test_2026_q1',
      created_at: new Date().toISOString(),
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +14 days
      duration_days: 14,
      hypothesis: {
        problem: 'Current $79/year pricing may be too high vs competitors (SimpleTax $29, Sprintax $29)',
        test: 'Will lower pricing increase conversion rate enough to offset lower revenue per customer?',
        success_criteria: 'Variant with highest revenue per visitor wins (conversion_rate × price)',
      },
      product: {
        id: product.id,
        name: product.name,
      },
      variants: {
        A: {
          variant_id: 'annual_29',
          price: 29,
          interval: 'year',
          price_id: price29Annual.id,
          value_proposition: 'COMPETITOR MATCH: SimpleTax/Sprintax pricing - Limited time!',
          positioning: 'Market rate, maximum accessibility',
          target_cohort: 'Price-sensitive users, students, entry-level engineers',
          expected_conversion: 8, // 8% conversion rate estimate
          expected_revenue_per_visitor: 2.32, // 8% × $29
        },
        B: {
          variant_id: 'annual_49',
          price: 49,
          interval: 'year',
          price_id: price49Annual,
          value_proposition: 'SMART CHOICE: Best value for cross-border tax compliance',
          positioning: 'Middle ground, balanced value',
          target_cohort: 'Mid-career engineers, value-conscious buyers',
          expected_conversion: 5, // 5% conversion rate estimate
          expected_revenue_per_visitor: 2.45, // 5% × $49
        },
        C: {
          variant_id: 'annual_79',
          price: 79,
          interval: 'year',
          price_id: price79Annual,
          value_proposition: 'PREMIUM: Professional-grade tax optimization & support',
          positioning: 'Premium quality, professional support',
          target_cohort: 'Senior engineers, complex tax situations',
          expected_conversion: 3, // 3% conversion rate estimate
          expected_revenue_per_visitor: 2.37, // 3% × $79
        },
      },
      monthly_option: {
        price: 19,
        interval: 'month',
        price_id: price19Monthly,
        ltv: 228, // Assume 12-month retention
      },
      tracking: {
        posthog_experiment: 'pricing_experiment_variant',
        key_metrics: [
          'conversion_rate',
          'revenue_per_visitor',
          'average_order_value',
          'monthly_vs_annual_selection',
          'time_to_purchase',
        ],
        sample_size_target: 300, // 100 per variant
        minimum_conversions: 30, // 10 per variant for statistical significance
      },
      decision_criteria: {
        primary_metric: 'revenue_per_visitor',
        secondary_metrics: ['conversion_rate', 'customer_lifetime_value'],
        minimum_confidence: 0.90, // 90% statistical confidence
        minimum_revenue_lift: 0.10, // 10% revenue improvement to switch
      },
    };

    const configPath = path.join(process.cwd(), 'docs', 'PRICING_EXPERIMENT_V2_CONFIG.json');
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(experimentConfig, null, 2));

    console.log('📋 Experiment configuration saved to: docs/PRICING_EXPERIMENT_V2_CONFIG.json\n');

    // Create quick reference guide
    const quickReference = `# Pricing Experiment V2: Quick Reference

## Test Configuration
- **Start Date:** ${experimentConfig.start_date}
- **End Date:** ${experimentConfig.end_date}
- **Duration:** 14 days
- **Variants:** 3 (A/B/C split: 33/33/33)

## Price Points
| Variant | Price    | Value Prop             | Target Conversion |
|---------|----------|------------------------|-------------------|
| A       | $29/year | Competitor Match       | 8%                |
| B       | $49/year | Smart Choice           | 5%                |
| C       | $79/year | Premium                | 3%                |

## Success Metrics
- **Primary:** Revenue per visitor (conversion_rate × price)
- **Secondary:** Conversion rate, LTV, monthly vs annual selection
- **Decision Threshold:** 90% confidence, 10%+ revenue lift

## Tracking
- PostHog experiment: \`pricing_experiment_variant\`
- Events tracked: \`pricing_experiment_exposed\`, \`pricing_tier_selected\`, \`checkout_started\`, \`checkout_completed\`
- Sample size target: 300 visitors (100 per variant)

## Hypothesis
**Problem:** Current $79/year pricing may be too high vs competitors at $29/year
**Test:** Will lower price points increase conversion enough to offset lower revenue per customer?
**Winner:** Variant with highest revenue per visitor

## Daily Monitoring
Run: \`npm run monitor:pricing-experiment\`

Check PostHog dashboard daily for:
- Conversion rates by variant
- Revenue per visitor
- Statistical significance

## Decision Timeline
- **Day 7:** Mid-experiment check-in
- **Day 14:** Final analysis and decision
- **Day 15:** Implement winning variant for all users
`;

    const referencePath = path.join(process.cwd(), 'docs', 'PRICING_EXPERIMENT_V2_QUICK_REFERENCE.md');
    fs.writeFileSync(referencePath, quickReference);

    console.log('📘 Quick reference guide saved to: docs/PRICING_EXPERIMENT_V2_QUICK_REFERENCE.md\n');

    console.log('🎉 Setup complete! Next steps:\n');
    console.log('1. Add the price IDs to .env.local and .env.production');
    console.log('2. Deploy to production');
    console.log('3. Monitor daily with: npm run monitor:pricing-experiment');
    console.log('4. Check PostHog for real-time conversion data');
    console.log('5. Make decision after 14 days based on revenue per visitor\n');

  } catch (error) {
    console.error('❌ Error setting up pricing experiment:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    process.exit(1);
  }
}

setupPricingExperimentV2();
