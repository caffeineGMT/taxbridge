#!/usr/bin/env tsx
/**
 * Revenue Reality Check - Pull ACTUAL metrics from Stripe and PostHog
 *
 * This script queries:
 * 1. Stripe API - Total customers, active subscriptions, MRR, total revenue
 * 2. PostHog API - Calculator completions, signups, conversion rates
 *
 * Evidence output:
 * - docs/revenue-metrics/YYYY-MM-DD-HH-MM-SS/
 *   - stripe-metrics.json
 *   - posthog-metrics.json
 *   - revenue-summary.md
 *   - conversion-funnel.md
 *
 * Usage:
 *   npm run revenue:metrics
 *   tsx scripts/pull-revenue-metrics.ts
 */

import Stripe from 'stripe';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// ═══════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID || '';

// Date range for PostHog queries (last 30 days)
const DAYS_BACK = 30;
const END_DATE = new Date();
const START_DATE = new Date();
START_DATE.setDate(START_DATE.getDate() - DAYS_BACK);

// Output directory
const TIMESTAMP = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const OUTPUT_DIR = join(process.cwd(), 'docs', 'revenue-metrics', TIMESTAMP);

// ═══════════════════════════════════════════════════════
// STRIPE METRICS
// ═══════════════════════════════════════════════════════

interface StripeMetrics {
  totalCustomers: number;
  activeSubscriptions: number;
  mrr: number; // Monthly Recurring Revenue in cents
  arr: number; // Annual Recurring Revenue in cents
  totalRevenue: number; // Lifetime revenue in cents
  avgRevenuePerCustomer: number;
  churnRate: number;
  subscriptionsByPlan: {
    basic: number;
    pro: number;
    enterprise: number;
  };
  recentPayments: Array<{
    id: string;
    amount: number;
    status: string;
    created: number;
    customer: string;
  }>;
  mode: 'test' | 'live';
  timestamp: string;
}

async function pullStripeMetrics(): Promise<StripeMetrics> {
  console.log('📊 Pulling Stripe metrics...');

  // Check if we have real keys
  if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('YOUR_')) {
    console.error('❌ STRIPE_SECRET_KEY is placeholder - cannot pull real data');
    console.error('   Set real key in .env.local or .env.production');
    return createPlaceholderStripeMetrics();
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });

  const mode = STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'live' : 'test';
  console.log(`   Mode: ${mode.toUpperCase()}`);

  try {
    // 1. Total customers (lifetime)
    const customersResponse = await stripe.customers.list({ limit: 100 });
    const totalCustomers = customersResponse.data.length;
    console.log(`   ✅ Total customers: ${totalCustomers}`);

    // 2. Active subscriptions
    const subscriptionsResponse = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
    });
    const activeSubscriptions = subscriptionsResponse.data.length;
    console.log(`   ✅ Active subscriptions: ${activeSubscriptions}`);

    // 3. Calculate MRR and ARR
    let mrr = 0;
    const subscriptionsByPlan = {
      basic: 0,
      pro: 0,
      enterprise: 0,
    };

    for (const sub of subscriptionsResponse.data) {
      const amount = sub.items.data[0]?.price?.unit_amount || 0;
      const interval = sub.items.data[0]?.price?.recurring?.interval;

      // Convert to monthly recurring
      if (interval === 'month') {
        mrr += amount;
      } else if (interval === 'year') {
        mrr += Math.round(amount / 12);
      }

      // Count by plan (based on price amount)
      const yearlyAmount = interval === 'year' ? amount : amount * 12;
      if (yearlyAmount <= 5000) {
        subscriptionsByPlan.basic++;
      } else if (yearlyAmount <= 10000) {
        subscriptionsByPlan.pro++;
      } else {
        subscriptionsByPlan.enterprise++;
      }
    }

    const arr = mrr * 12;
    console.log(`   ✅ MRR: $${(mrr / 100).toFixed(2)}`);
    console.log(`   ✅ ARR: $${(arr / 100).toFixed(2)}`);

    // 4. Total revenue (sum of all successful charges)
    const chargesResponse = await stripe.charges.list({
      limit: 100,
    });
    const totalRevenue = chargesResponse.data
      .filter((charge) => charge.status === 'succeeded')
      .reduce((sum, charge) => sum + charge.amount, 0);
    console.log(`   ✅ Total revenue: $${(totalRevenue / 100).toFixed(2)}`);

    // 5. Average revenue per customer
    const avgRevenuePerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    // 6. Recent payments (last 10)
    const recentPayments = chargesResponse.data.slice(0, 10).map((charge) => ({
      id: charge.id,
      amount: charge.amount,
      status: charge.status,
      created: charge.created,
      customer: typeof charge.customer === 'string' ? charge.customer : '',
    }));

    // 7. Churn rate (simplified - would need historical data for accurate calc)
    const churnRate = 0; // TODO: Calculate from subscription cancellations

    const metrics: StripeMetrics = {
      totalCustomers,
      activeSubscriptions,
      mrr,
      arr,
      totalRevenue,
      avgRevenuePerCustomer,
      churnRate,
      subscriptionsByPlan,
      recentPayments,
      mode,
      timestamp: new Date().toISOString(),
    };

    console.log('✅ Stripe metrics pulled successfully\n');
    return metrics;
  } catch (error) {
    console.error('❌ Error pulling Stripe metrics:', error);
    throw error;
  }
}

function createPlaceholderStripeMetrics(): StripeMetrics {
  return {
    totalCustomers: 0,
    activeSubscriptions: 0,
    mrr: 0,
    arr: 0,
    totalRevenue: 0,
    avgRevenuePerCustomer: 0,
    churnRate: 0,
    subscriptionsByPlan: { basic: 0, pro: 0, enterprise: 0 },
    recentPayments: [],
    mode: 'test',
    timestamp: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════
// POSTHOG METRICS
// ═══════════════════════════════════════════════════════

interface PostHogMetrics {
  calculatorCompletions: number;
  signups: number;
  payments: number;
  conversionRates: {
    calculatorToSignup: number; // %
    signupToPayment: number; // %
    calculatorToPayment: number; // %
  };
  funnelSteps: {
    landingPageViews: number;
    calculatorStarts: number;
    calculatorCompletions: number;
    signups: number;
    payments: number;
  };
  dropOffPoints: Array<{
    step: string;
    users: number;
    dropOffRate: number; // %
  }>;
  timestamp: string;
}

async function pullPostHogMetrics(): Promise<PostHogMetrics> {
  console.log('📊 Pulling PostHog metrics...');

  if (!POSTHOG_API_KEY || POSTHOG_API_KEY.includes('your_') || !POSTHOG_PROJECT_ID) {
    console.error('❌ POSTHOG_API_KEY or PROJECT_ID is placeholder - cannot pull real data');
    console.error('   Set real keys in .env.local or .env.production');
    return createPlaceholderPostHogMetrics();
  }

  try {
    const baseUrl = 'https://app.posthog.com/api/projects';
    const headers = {
      'Authorization': `Bearer ${POSTHOG_API_KEY}`,
      'Content-Type': 'application/json',
    };

    // Query funnel data
    const funnelQuery = {
      events: [
        { id: 'landing_page_viewed', name: 'Landing Page Viewed' },
        { id: 'calculator_started', name: 'Calculator Started' },
        { id: 'calculator_completed', name: 'Calculator Completed' },
        { id: 'signup_completed', name: 'Signup Completed' },
        { id: 'payment_completed', name: 'Payment Completed' },
      ],
      date_from: START_DATE.toISOString().split('T')[0],
      date_to: END_DATE.toISOString().split('T')[0],
    };

    const response = await fetch(
      `${baseUrl}/${POSTHOG_PROJECT_ID}/insights/funnel/`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(funnelQuery),
      }
    );

    if (!response.ok) {
      throw new Error(`PostHog API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse funnel data
    const steps = data.result || [];
    const landingPageViews = steps[0]?.count || 0;
    const calculatorStarts = steps[1]?.count || 0;
    const calculatorCompletions = steps[2]?.count || 0;
    const signups = steps[3]?.count || 0;
    const payments = steps[4]?.count || 0;

    // Calculate conversion rates
    const calculatorToSignup = calculatorCompletions > 0
      ? (signups / calculatorCompletions) * 100
      : 0;
    const signupToPayment = signups > 0
      ? (payments / signups) * 100
      : 0;
    const calculatorToPayment = calculatorCompletions > 0
      ? (payments / calculatorCompletions) * 100
      : 0;

    // Calculate drop-off rates
    const dropOffPoints = [
      {
        step: 'Landing → Calculator',
        users: landingPageViews - calculatorStarts,
        dropOffRate: landingPageViews > 0
          ? ((landingPageViews - calculatorStarts) / landingPageViews) * 100
          : 0,
      },
      {
        step: 'Calculator Start → Complete',
        users: calculatorStarts - calculatorCompletions,
        dropOffRate: calculatorStarts > 0
          ? ((calculatorStarts - calculatorCompletions) / calculatorStarts) * 100
          : 0,
      },
      {
        step: 'Calculator → Signup',
        users: calculatorCompletions - signups,
        dropOffRate: calculatorCompletions > 0
          ? ((calculatorCompletions - signups) / calculatorCompletions) * 100
          : 0,
      },
      {
        step: 'Signup → Payment',
        users: signups - payments,
        dropOffRate: signups > 0
          ? ((signups - payments) / signups) * 100
          : 0,
      },
    ];

    const metrics: PostHogMetrics = {
      calculatorCompletions,
      signups,
      payments,
      conversionRates: {
        calculatorToSignup,
        signupToPayment,
        calculatorToPayment,
      },
      funnelSteps: {
        landingPageViews,
        calculatorStarts,
        calculatorCompletions,
        signups,
        payments,
      },
      dropOffPoints,
      timestamp: new Date().toISOString(),
    };

    console.log(`   ✅ Calculator completions: ${calculatorCompletions}`);
    console.log(`   ✅ Signups: ${signups}`);
    console.log(`   ✅ Payments: ${payments}`);
    console.log(`   ✅ Calculator→Signup: ${calculatorToSignup.toFixed(1)}%`);
    console.log(`   ✅ Signup→Payment: ${signupToPayment.toFixed(1)}%`);
    console.log('✅ PostHog metrics pulled successfully\n');

    return metrics;
  } catch (error) {
    console.error('❌ Error pulling PostHog metrics:', error);
    throw error;
  }
}

function createPlaceholderPostHogMetrics(): PostHogMetrics {
  return {
    calculatorCompletions: 0,
    signups: 0,
    payments: 0,
    conversionRates: {
      calculatorToSignup: 0,
      signupToPayment: 0,
      calculatorToPayment: 0,
    },
    funnelSteps: {
      landingPageViews: 0,
      calculatorStarts: 0,
      calculatorCompletions: 0,
      signups: 0,
      payments: 0,
    },
    dropOffPoints: [],
    timestamp: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════
// REPORT GENERATION
// ═══════════════════════════════════════════════════════

function generateRevenueSummary(
  stripe: StripeMetrics,
  posthog: PostHogMetrics
): string {
  const mrrUsd = stripe.mrr / 100;
  const arrUsd = stripe.arr / 100;
  const totalRevenueUsd = stripe.totalRevenue / 100;
  const avgRevenueUsd = stripe.avgRevenuePerCustomer / 100;

  return `# Revenue Metrics Summary

**Generated:** ${new Date().toISOString()}
**Period:** Last ${DAYS_BACK} days

## 🎯 Executive Summary

${stripe.mode === 'test' ? '⚠️ **WARNING: STRIPE IN TEST MODE - THESE ARE NOT REAL TRANSACTIONS**\n' : ''}
${!POSTHOG_API_KEY || POSTHOG_API_KEY.includes('your_') ? '⚠️ **WARNING: POSTHOG PLACEHOLDER KEYS - NO ANALYTICS DATA**\n' : ''}

### Revenue (Stripe)
- **MRR:** $${mrrUsd.toFixed(2)} ${stripe.mode === 'test' ? '(test)' : ''}
- **ARR:** $${arrUsd.toFixed(2)} ${stripe.mode === 'test' ? '(test)' : ''}
- **Total Revenue:** $${totalRevenueUsd.toFixed(2)} ${stripe.mode === 'test' ? '(test)' : ''}
- **Total Customers:** ${stripe.totalCustomers} ${stripe.mode === 'test' ? '(test)' : ''}
- **Active Subscriptions:** ${stripe.activeSubscriptions} ${stripe.mode === 'test' ? '(test)' : ''}
- **Avg Revenue/Customer:** $${avgRevenueUsd.toFixed(2)} ${stripe.mode === 'test' ? '(test)' : ''}

### Conversion Funnel (PostHog - Last ${DAYS_BACK} days)
- **Calculator Completions:** ${posthog.calculatorCompletions}
- **Signups:** ${posthog.signups}
- **Payments:** ${posthog.payments}

### Conversion Rates
- **Calculator → Signup:** ${posthog.conversionRates.calculatorToSignup.toFixed(1)}%
- **Signup → Payment:** ${posthog.conversionRates.signupToPayment.toFixed(1)}%
- **Calculator → Payment:** ${posthog.conversionRates.calculatorToPayment.toFixed(1)}%

## 📊 Detailed Metrics

### Stripe Subscriptions by Plan
- **Basic ($49/year):** ${stripe.subscriptionsByPlan.basic}
- **Pro ($79/year):** ${stripe.subscriptionsByPlan.pro}
- **Enterprise (Custom):** ${stripe.subscriptionsByPlan.enterprise}

### PostHog Funnel Breakdown
1. **Landing Page Views:** ${posthog.funnelSteps.landingPageViews}
2. **Calculator Starts:** ${posthog.funnelSteps.calculatorStarts}
3. **Calculator Completions:** ${posthog.funnelSteps.calculatorCompletions}
4. **Signups:** ${posthog.funnelSteps.signups}
5. **Payments:** ${posthog.funnelSteps.payments}

### Drop-off Analysis
${posthog.dropOffPoints.map((point) =>
  `- **${point.step}:** ${point.users} users dropped (${point.dropOffRate.toFixed(1)}%)`
).join('\n')}

## 🚨 Critical Issues

${stripe.mode === 'test' ? '1. **REVENUE BLOCKER:** Stripe is in TEST MODE\n   - Replace sk_test_ with sk_live_ keys\n   - Update all STRIPE_*_PRICE_ID with live price IDs\n   - See docs/STRIPE_PRODUCTION_SETUP.md\n\n' : ''}
${stripe.totalCustomers === 0 ? '2. **ZERO CUSTOMERS:** No customers in Stripe\n   - Verify payment flow works\n   - Check checkout implementation\n   - Test with real card\n\n' : ''}
${posthog.calculatorCompletions === 0 ? '3. **NO ANALYTICS:** PostHog not tracking events\n   - Verify POSTHOG_API_KEY is set\n   - Check event tracking in code\n   - See docs/POSTHOG_PRODUCTION_SETUP.md\n\n' : ''}

## 📈 Recommendations

${stripe.totalCustomers === 0 ? '1. **Activate Revenue Pipeline**\n   - Move Stripe to production mode (2 hours)\n   - Complete end-to-end payment test\n   - Monitor first real transaction\n\n' : ''}
${posthog.conversionRates.calculatorToSignup < 10 ? '2. **Improve Calculator → Signup Conversion**\n   - Current: ' + posthog.conversionRates.calculatorToSignup.toFixed(1) + '%\n   - Target: >15%\n   - Add CTA after calculator results\n   - Show value proposition\n\n' : ''}
${posthog.conversionRates.signupToPayment < 20 ? '3. **Improve Signup → Payment Conversion**\n   - Current: ' + posthog.conversionRates.signupToPayment.toFixed(1) + '%\n   - Target: >30%\n   - Reduce friction in checkout\n   - Add trust badges\n\n' : ''}

## 📋 Next Steps

1. **Fix Critical Blockers** (P0, 2-4 hours)
   ${stripe.mode === 'test' ? '- [ ] Move Stripe to production mode\n   ' : ''}
   ${!POSTHOG_API_KEY || POSTHOG_API_KEY.includes('your_') ? '- [ ] Activate PostHog analytics\n   ' : ''}
   ${stripe.totalCustomers === 0 ? '- [ ] Complete revenue smoke test\n   ' : ''}

2. **Establish Baseline** (P1, 1-2 days)
   - [ ] Run this script daily for 7 days
   - [ ] Document baseline conversion rates
   - [ ] Identify biggest drop-off points

3. **Optimize Conversion** (P2, 1-2 weeks)
   - [ ] A/B test landing page headlines
   - [ ] Improve calculator UX
   - [ ] Add social proof to checkout

---

**Files Generated:**
- \`stripe-metrics.json\` - Full Stripe data
- \`posthog-metrics.json\` - Full PostHog data
- \`revenue-summary.md\` - This summary

**How to Use:**
\`\`\`bash
# Run daily to track progress
npm run revenue:metrics

# Compare with previous days
diff docs/revenue-metrics/2026-03-19*/revenue-summary.md
\`\`\`
`;
}

function generateConversionFunnelReport(posthog: PostHogMetrics): string {
  return `# Conversion Funnel Deep Dive

**Generated:** ${new Date().toISOString()}
**Period:** Last ${DAYS_BACK} days

## 📊 Funnel Overview

\`\`\`
Landing Page (${posthog.funnelSteps.landingPageViews})
     ↓ ${posthog.dropOffPoints[0]?.dropOffRate.toFixed(1)}% drop-off
Calculator Start (${posthog.funnelSteps.calculatorStarts})
     ↓ ${posthog.dropOffPoints[1]?.dropOffRate.toFixed(1)}% drop-off
Calculator Complete (${posthog.funnelSteps.calculatorCompletions})
     ↓ ${posthog.dropOffPoints[2]?.dropOffRate.toFixed(1)}% drop-off
Signup (${posthog.funnelSteps.signups})
     ↓ ${posthog.dropOffPoints[3]?.dropOffRate.toFixed(1)}% drop-off
Payment (${posthog.funnelSteps.payments})
\`\`\`

## 🎯 Key Metrics

### Overall Conversion
- **Landing → Payment:** ${posthog.funnelSteps.landingPageViews > 0
    ? ((posthog.funnelSteps.payments / posthog.funnelSteps.landingPageViews) * 100).toFixed(2)
    : 0}%

### Critical Conversions
- **Calculator → Signup:** ${posthog.conversionRates.calculatorToSignup.toFixed(1)}%
- **Signup → Payment:** ${posthog.conversionRates.signupToPayment.toFixed(1)}%

## 🚨 Biggest Drop-off Points

${posthog.dropOffPoints
  .sort((a, b) => b.dropOffRate - a.dropOffRate)
  .map((point, index) => `${index + 1}. **${point.step}**
   - Drop-off: ${point.dropOffRate.toFixed(1)}%
   - Users lost: ${point.users}
`)
  .join('\n')}

## 💡 Optimization Opportunities

${posthog.dropOffPoints[0]?.dropOffRate > 50 ? `### 1. Landing Page → Calculator (${posthog.dropOffPoints[0].dropOffRate.toFixed(1)}% drop-off)
**Problem:** Most visitors aren't starting the calculator

**Solutions:**
- Add above-the-fold CTA
- Show example calculation results
- Add "Try Calculator" sticky button
- Reduce friction (no signup required)

**Target:** <40% drop-off

` : ''}
${posthog.dropOffPoints[1]?.dropOffRate > 30 ? `### 2. Calculator Start → Complete (${posthog.dropOffPoints[1].dropOffRate.toFixed(1)}% drop-off)
**Problem:** Users abandon mid-calculation

**Solutions:**
- Simplify input fields
- Add progress indicator
- Enable autosave
- Show preview results as they type

**Target:** <20% drop-off

` : ''}
${posthog.dropOffPoints[2]?.dropOffRate > 60 ? `### 3. Calculator → Signup (${posthog.dropOffPoints[2].dropOffRate.toFixed(1)}% drop-off)
**Problem:** Users see results but don't sign up

**Solutions:**
- Add strong CTA after results
- Show value of signing up (save results, multi-year, etc.)
- Offer email-only signup (reduce friction)
- Add social proof

**Target:** <50% drop-off

` : ''}
${posthog.dropOffPoints[3]?.dropOffRate > 70 ? `### 4. Signup → Payment (${posthog.dropOffPoints[3].dropOffRate.toFixed(1)}% drop-off)
**Problem:** Free users aren't converting to paid

**Solutions:**
- Increase free tier value (currently 1 RSU → 10 RSUs)
- Add friction to free tier (show paywall after 3 calculations)
- Email drip campaign (Days 1, 3, 7)
- Show ROI comparison ($79/year vs $5K+ tax savings)

**Target:** <60% drop-off

` : ''}

## 📈 A/B Test Ideas

### High Impact (>15% lift potential)
1. **Landing Page Headline**
   - Control: Current headline
   - Variant A: "Save $5K+ on H1B RSU Taxes"
   - Variant B: "Cross-Border Tax Calculator for Tech Workers"

2. **Calculator CTA**
   - Control: Current "Sign Up" button
   - Variant A: "See My Tax Savings"
   - Variant B: "Calculate My Taxes (Free)"

3. **Pricing Page**
   - Control: Current $79/year
   - Variant A: $49/year
   - Variant B: $29/year (competitor rate)

### Medium Impact (5-15% lift)
4. **Free Tier Limit**
   - Control: 1 RSU entry
   - Variant A: 3 RSU entries
   - Variant B: 10 RSU entries

5. **Social Proof**
   - Control: No testimonials
   - Variant A: Add 3 testimonials
   - Variant B: Add trust badges + testimonials

---

**Next Actions:**
1. Review biggest drop-off points
2. Implement top 2 optimization ideas
3. Set up A/B tests for high-impact changes
4. Re-run this report in 7 days to measure impact
`;
}

// ═══════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════

async function main() {
  console.log('🚀 Revenue Reality Check - Pulling Actual Metrics\n');
  console.log(`📅 Period: Last ${DAYS_BACK} days`);
  console.log(`📂 Output: ${OUTPUT_DIR}\n`);

  try {
    // Create output directory
    mkdirSync(OUTPUT_DIR, { recursive: true });

    // Pull metrics
    const stripeMetrics = await pullStripeMetrics();
    const posthogMetrics = await pullPostHogMetrics();

    // Generate reports
    const revenueSummary = generateRevenueSummary(stripeMetrics, posthogMetrics);
    const funnelReport = generateConversionFunnelReport(posthogMetrics);

    // Write files
    writeFileSync(
      join(OUTPUT_DIR, 'stripe-metrics.json'),
      JSON.stringify(stripeMetrics, null, 2)
    );
    console.log(`✅ Wrote: stripe-metrics.json`);

    writeFileSync(
      join(OUTPUT_DIR, 'posthog-metrics.json'),
      JSON.stringify(posthogMetrics, null, 2)
    );
    console.log(`✅ Wrote: posthog-metrics.json`);

    writeFileSync(join(OUTPUT_DIR, 'revenue-summary.md'), revenueSummary);
    console.log(`✅ Wrote: revenue-summary.md`);

    writeFileSync(join(OUTPUT_DIR, 'conversion-funnel.md'), funnelReport);
    console.log(`✅ Wrote: conversion-funnel.md`);

    // Print summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 REVENUE METRICS SUMMARY');
    console.log('═'.repeat(60));
    console.log(`\n${revenueSummary.split('\n').slice(0, 30).join('\n')}`);
    console.log('\n' + '═'.repeat(60));
    console.log(`\n✅ Full report: ${OUTPUT_DIR}`);

    // Exit with error if in test mode or zero customers
    if (stripeMetrics.mode === 'test') {
      console.error('\n❌ CRITICAL: Stripe is in TEST MODE');
      console.error('   See docs/STRIPE_PRODUCTION_SETUP.md');
      process.exit(1);
    }

    if (stripeMetrics.totalCustomers === 0) {
      console.error('\n⚠️  WARNING: Zero customers found');
      console.error('   Verify payment flow is working');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
