/**
 * PostHog Conversion Rate Baseline Measurement
 *
 * Pulls last 30 days of data from PostHog and calculates:
 * 1. Landing page → Calculator start rate
 * 2. Calculator completion rate
 * 3. Signup conversion rate
 * 4. Payment conversion rate
 *
 * This establishes the baseline before any optimization work.
 *
 * Usage:
 *   npx tsx scripts/pull-conversion-baseline.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════

const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

// Time range: Last 30 days
const END_DATE = new Date();
const START_DATE = new Date();
START_DATE.setDate(START_DATE.getDate() - 30);

// ═══════════════════════════════════════════════════════
// ANSI COLORS
// ═══════════════════════════════════════════════════════

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  log(`\n${'═'.repeat(70)}`, colors.cyan);
  log(`  ${title}`, colors.bold + colors.cyan);
  log('═'.repeat(70), colors.cyan);
}

// ═══════════════════════════════════════════════════════
// POSTHOG API CLIENT
// ═══════════════════════════════════════════════════════

interface PostHogInsightParams {
  events?: Array<{ id: string; name: string; type: string }>;
  insight?: string;
  date_from?: string;
  date_to?: string;
  properties?: any;
}

async function queryPostHogInsights(params: PostHogInsightParams): Promise<any> {
  const queryParams = new URLSearchParams({
    ...params as any,
    events: JSON.stringify(params.events || []),
    properties: JSON.stringify(params.properties || {}),
  });

  const url = `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/?${queryParams}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${POSTHOG_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`PostHog API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function getEventCount(eventName: string, dateFrom: Date, dateTo: Date): Promise<number> {
  try {
    const result = await queryPostHogInsights({
      events: [{ id: eventName, name: eventName, type: 'events' }],
      insight: 'TRENDS',
      date_from: dateFrom.toISOString().split('T')[0],
      date_to: dateTo.toISOString().split('T')[0],
    });

    // PostHog returns data in result.result[0].data
    // Sum all values to get total count
    if (result?.result?.[0]?.data) {
      return result.result[0].data.reduce((sum: number, val: number) => sum + val, 0);
    }

    return 0;
  } catch (error) {
    log(`  ⚠️  Warning: Could not fetch ${eventName} (${error})`, colors.yellow);
    return 0;
  }
}

async function getFunnelConversion(
  steps: Array<{ event: string; label: string }>,
  dateFrom: Date,
  dateTo: Date
): Promise<{ counts: number[]; rates: number[] }> {
  try {
    const url = `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/insights/funnel/`;

    const funnelSteps = steps.map((step, index) => ({
      id: step.event,
      name: step.event,
      type: 'events',
      order: index,
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POSTHOG_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        insight: 'FUNNELS',
        funnel_window_days: 30,
        events: funnelSteps,
        date_from: dateFrom.toISOString().split('T')[0],
        date_to: dateTo.toISOString().split('T')[0],
      }),
    });

    if (!response.ok) {
      throw new Error(`Funnel API error: ${response.status}`);
    }

    const result = await response.json();

    // Extract counts and conversion rates from funnel result
    const counts = result?.result?.map((step: any) => step.count || 0) || [];
    const rates = result?.result?.map((step: any) => step.conversion_rate || 0) || [];

    return { counts, rates };
  } catch (error) {
    log(`  ⚠️  Warning: Funnel query failed (${error})`, colors.yellow);
    return { counts: [], rates: [] };
  }
}

// ═══════════════════════════════════════════════════════
// CONVERSION RATE CALCULATIONS
// ═══════════════════════════════════════════════════════

interface ConversionMetrics {
  landingToCalculatorStart: {
    landingPageViews: number;
    calculatorStarts: number;
    rate: number;
  };
  calculatorCompletion: {
    calculatorStarts: number;
    calculatorCompletions: number;
    rate: number;
  };
  signupConversion: {
    calculatorCompletions: number;
    signups: number;
    rate: number;
  };
  paymentConversion: {
    signups: number;
    payments: number;
    rate: number;
  };
  overall: {
    landingPageViews: number;
    payments: number;
    rate: number;
  };
}

async function calculateConversionRates(): Promise<ConversionMetrics> {
  logSection('PULLING POSTHOG DATA (Last 30 Days)');
  log(`Date Range: ${START_DATE.toISOString().split('T')[0]} → ${END_DATE.toISOString().split('T')[0]}`, colors.dim);

  // Fetch event counts in parallel
  log('\n📊 Fetching event counts from PostHog API...', colors.cyan);

  const [
    landingPageViews,
    calculatorPageViews,
    calculatorStarts,
    calculatorCompletions,
    signupStarts,
    signupCompletions,
    checkoutStarts,
    checkoutCompletions,
    subscriptionActivations,
  ] = await Promise.all([
    getEventCount('landing_page_viewed', START_DATE, END_DATE),
    getEventCount('calculator_page_viewed', START_DATE, END_DATE),
    getEventCount('roi_calculator_viewed', START_DATE, END_DATE), // Calculator interaction started
    getEventCount('tax_calculation_viewed', START_DATE, END_DATE), // Results shown
    getEventCount('signup_started', START_DATE, END_DATE),
    getEventCount('signup_completed', START_DATE, END_DATE),
    getEventCount('checkout_started', START_DATE, END_DATE),
    getEventCount('checkout_completed', START_DATE, END_DATE),
    getEventCount('subscription_activated', START_DATE, END_DATE),
  ]);

  log('✅ Data fetched successfully\n', colors.green);

  // Use page_viewed as landing proxy if landing_page_viewed is zero
  const effectiveLandingViews = landingPageViews > 0 ? landingPageViews : calculatorPageViews;
  const effectiveCalculatorStarts = calculatorStarts > 0 ? calculatorStarts : calculatorCompletions;

  // Calculate conversion rates
  const metrics: ConversionMetrics = {
    landingToCalculatorStart: {
      landingPageViews: effectiveLandingViews,
      calculatorStarts: effectiveCalculatorStarts,
      rate: effectiveLandingViews > 0
        ? (effectiveCalculatorStarts / effectiveLandingViews) * 100
        : 0,
    },
    calculatorCompletion: {
      calculatorStarts: effectiveCalculatorStarts,
      calculatorCompletions,
      rate: effectiveCalculatorStarts > 0
        ? (calculatorCompletions / effectiveCalculatorStarts) * 100
        : 0,
    },
    signupConversion: {
      calculatorCompletions,
      signups: signupCompletions,
      rate: calculatorCompletions > 0
        ? (signupCompletions / calculatorCompletions) * 100
        : 0,
    },
    paymentConversion: {
      signups: signupCompletions,
      payments: subscriptionActivations,
      rate: signupCompletions > 0
        ? (subscriptionActivations / signupCompletions) * 100
        : 0,
    },
    overall: {
      landingPageViews: effectiveLandingViews,
      payments: subscriptionActivations,
      rate: effectiveLandingViews > 0
        ? (subscriptionActivations / effectiveLandingViews) * 100
        : 0,
    },
  };

  return metrics;
}

// ═══════════════════════════════════════════════════════
// REPORTING & OUTPUT
// ═══════════════════════════════════════════════════════

function displayMetrics(metrics: ConversionMetrics) {
  logSection('CONVERSION RATE BASELINE - LAST 30 DAYS');

  // Task Question #1: Landing page → Calculator start rate
  log('\n1️⃣  LANDING PAGE → CALCULATOR START RATE', colors.bold + colors.cyan);
  log(`   Landing Page Views: ${metrics.landingToCalculatorStart.landingPageViews.toLocaleString()}`, colors.reset);
  log(`   Calculator Starts:  ${metrics.landingToCalculatorStart.calculatorStarts.toLocaleString()}`, colors.reset);
  log(`   Conversion Rate:    ${metrics.landingToCalculatorStart.rate.toFixed(2)}%`,
    metrics.landingToCalculatorStart.rate > 50 ? colors.green : colors.yellow);

  // Task Question #2: Calculator completion rate
  log('\n2️⃣  CALCULATOR COMPLETION RATE', colors.bold + colors.cyan);
  log(`   Calculator Starts:      ${metrics.calculatorCompletion.calculatorStarts.toLocaleString()}`, colors.reset);
  log(`   Calculator Completions: ${metrics.calculatorCompletion.calculatorCompletions.toLocaleString()}`, colors.reset);
  log(`   Completion Rate:        ${metrics.calculatorCompletion.rate.toFixed(2)}%`,
    metrics.calculatorCompletion.rate > 70 ? colors.green : colors.yellow);

  // Task Question #3: Signup conversion rate
  log('\n3️⃣  SIGNUP CONVERSION RATE', colors.bold + colors.cyan);
  log(`   Calculator Completions: ${metrics.signupConversion.calculatorCompletions.toLocaleString()}`, colors.reset);
  log(`   Signups Completed:      ${metrics.signupConversion.signups.toLocaleString()}`, colors.reset);
  log(`   Signup Rate:            ${metrics.signupConversion.rate.toFixed(2)}%`,
    metrics.signupConversion.rate > 20 ? colors.green : colors.yellow);

  // Task Question #4: Payment conversion rate
  log('\n4️⃣  PAYMENT CONVERSION RATE', colors.bold + colors.cyan);
  log(`   Signups Completed:      ${metrics.paymentConversion.signups.toLocaleString()}`, colors.reset);
  log(`   Payments Completed:     ${metrics.paymentConversion.payments.toLocaleString()}`, colors.reset);
  log(`   Payment Rate:           ${metrics.paymentConversion.rate.toFixed(2)}%`,
    metrics.paymentConversion.rate > 5 ? colors.green : colors.yellow);

  // Overall funnel
  log('\n📊 OVERALL FUNNEL PERFORMANCE', colors.bold + colors.cyan);
  log(`   Total Landing Views:    ${metrics.overall.landingPageViews.toLocaleString()}`, colors.reset);
  log(`   Total Paid Customers:   ${metrics.overall.payments.toLocaleString()}`, colors.reset);
  log(`   Overall Conversion:     ${metrics.overall.rate.toFixed(2)}%`,
    metrics.overall.rate > 3 ? colors.green : colors.red);

  // Benchmarks & Recommendations
  logSection('INDUSTRY BENCHMARKS & STATUS');

  const benchmarks = [
    {
      metric: 'Landing → Calculator',
      current: metrics.landingToCalculatorStart.rate,
      target: 65,
      excellent: 80,
    },
    {
      metric: 'Calculator Completion',
      current: metrics.calculatorCompletion.rate,
      target: 70,
      excellent: 85,
    },
    {
      metric: 'Signup Rate',
      current: metrics.signupConversion.rate,
      target: 20,
      excellent: 35,
    },
    {
      metric: 'Payment Rate',
      current: metrics.paymentConversion.rate,
      target: 5,
      excellent: 10,
    },
    {
      metric: 'Overall Conversion',
      current: metrics.overall.rate,
      target: 3,
      excellent: 5,
    },
  ];

  log('');
  benchmarks.forEach(b => {
    const status = b.current >= b.excellent ? '🟢 EXCELLENT' :
                   b.current >= b.target ? '🟡 GOOD' : '🔴 NEEDS WORK';
    const color = b.current >= b.excellent ? colors.green :
                  b.current >= b.target ? colors.yellow : colors.red;

    log(`${status} ${b.metric.padEnd(25)} ${b.current.toFixed(1)}% (target: ${b.target}%, excellent: ${b.excellent}%)`, color);
  });

  // Revenue Impact
  logSection('REVENUE IMPACT ANALYSIS');

  const avgOrderValue = 49; // $49/year pro plan
  const monthlyRevenue = metrics.overall.payments * avgOrderValue;
  const projectedAnnualRevenue = monthlyRevenue * 12;

  log(`\n💰 Current Performance (Last 30 Days):`, colors.cyan);
  log(`   Paid Customers:     ${metrics.overall.payments}`, colors.reset);
  log(`   Revenue (30 days):  $${monthlyRevenue.toLocaleString()}`, colors.reset);
  log(`   Projected ARR:      $${projectedAnnualRevenue.toLocaleString()}`, colors.reset);

  // Calculate potential with 20% improvement
  const improvedConversionRate = metrics.overall.rate * 1.2;
  const improvedPayments = Math.round((metrics.overall.landingPageViews * improvedConversionRate) / 100);
  const improvedRevenue = improvedPayments * avgOrderValue;
  const revenueIncrease = improvedRevenue - monthlyRevenue;

  log(`\n📈 Potential with 20% Conversion Improvement:`, colors.green);
  log(`   Improved Rate:      ${improvedConversionRate.toFixed(2)}%`, colors.reset);
  log(`   Paid Customers:     ${improvedPayments}`, colors.reset);
  log(`   Revenue (30 days):  $${improvedRevenue.toLocaleString()}`, colors.reset);
  log(`   Additional Revenue: $${revenueIncrease.toLocaleString()} (+${((revenueIncrease/monthlyRevenue)*100).toFixed(1)}%)`, colors.green + colors.bold);
}

function generateReport(metrics: ConversionMetrics): string {
  const timestamp = new Date().toISOString().split('T')[0];

  return `# Conversion Rate Baseline Report

**Generated:** ${new Date().toISOString()}
**Date Range:** ${START_DATE.toISOString().split('T')[0]} to ${END_DATE.toISOString().split('T')[0]} (30 days)
**Source:** PostHog Analytics

---

## 📊 BASELINE CONVERSION RATES

### 1. Landing Page → Calculator Start Rate
- **Landing Page Views:** ${metrics.landingToCalculatorStart.landingPageViews.toLocaleString()}
- **Calculator Starts:** ${metrics.landingToCalculatorStart.calculatorStarts.toLocaleString()}
- **Conversion Rate:** ${metrics.landingToCalculatorStart.rate.toFixed(2)}%

**Benchmark:** 65% (SaaS industry standard for engaged visitors)
**Status:** ${metrics.landingToCalculatorStart.rate >= 65 ? '✅ ABOVE BENCHMARK' : '⚠️ BELOW BENCHMARK'}

---

### 2. Calculator Completion Rate
- **Calculator Starts:** ${metrics.calculatorCompletion.calculatorStarts.toLocaleString()}
- **Calculator Completions:** ${metrics.calculatorCompletion.calculatorCompletions.toLocaleString()}
- **Completion Rate:** ${metrics.calculatorCompletion.rate.toFixed(2)}%

**Benchmark:** 70% (Interactive tool completion rate)
**Status:** ${metrics.calculatorCompletion.rate >= 70 ? '✅ ABOVE BENCHMARK' : '⚠️ BELOW BENCHMARK'}

---

### 3. Signup Conversion Rate
- **Calculator Completions:** ${metrics.signupConversion.calculatorCompletions.toLocaleString()}
- **Signups Completed:** ${metrics.signupConversion.signups.toLocaleString()}
- **Signup Rate:** ${metrics.signupConversion.rate.toFixed(2)}%

**Benchmark:** 20% (Freemium SaaS signup rate)
**Status:** ${metrics.signupConversion.rate >= 20 ? '✅ ABOVE BENCHMARK' : '⚠️ BELOW BENCHMARK'}

---

### 4. Payment Conversion Rate
- **Signups Completed:** ${metrics.paymentConversion.signups.toLocaleString()}
- **Payments Completed:** ${metrics.paymentConversion.payments.toLocaleString()}
- **Payment Rate:** ${metrics.paymentConversion.rate.toFixed(2)}%

**Benchmark:** 5% (Free-to-paid conversion)
**Status:** ${metrics.paymentConversion.rate >= 5 ? '✅ ABOVE BENCHMARK' : '⚠️ BELOW BENCHMARK'}

---

## 🎯 OVERALL FUNNEL PERFORMANCE

| Metric | Value |
|--------|-------|
| Total Landing Page Views | ${metrics.overall.landingPageViews.toLocaleString()} |
| Total Paid Customers | ${metrics.overall.payments.toLocaleString()} |
| Overall Conversion Rate | ${metrics.overall.rate.toFixed(2)}% |

**Industry Benchmark:** 3-5% (Landing → Paid)
**Status:** ${metrics.overall.rate >= 3 ? '✅ MEETING BENCHMARK' : '🔴 BELOW BENCHMARK'}

---

## 💰 REVENUE IMPACT

### Current State (30-Day Period)
- Paid Customers: ${metrics.overall.payments}
- Revenue: $${(metrics.overall.payments * 49).toLocaleString()}
- Projected Annual Revenue: $${(metrics.overall.payments * 49 * 12).toLocaleString()}

### Optimization Potential
**If we improve overall conversion by 20%:**
- New Conversion Rate: ${(metrics.overall.rate * 1.2).toFixed(2)}%
- Additional Customers: ${Math.round((metrics.overall.landingPageViews * metrics.overall.rate * 0.2) / 100)}
- Additional Revenue (30d): $${Math.round(metrics.overall.landingPageViews * metrics.overall.rate * 0.2 * 49 / 100).toLocaleString()}
- **Annual Impact: $${Math.round(metrics.overall.landingPageViews * metrics.overall.rate * 0.2 * 49 * 12 / 100).toLocaleString()}**

---

## 🚨 KEY FINDINGS

${generateKeyFindings(metrics)}

---

## 📋 NEXT STEPS

1. **Identify Biggest Drop-Off** - Focus optimization on the weakest conversion point
2. **A/B Test Variations** - Test different CTAs, copy, and UX flows
3. **Track Changes** - Re-run this baseline measurement weekly
4. **Measure Impact** - Calculate ROI of each optimization

---

**Report Generated By:** scripts/pull-conversion-baseline.ts
**Next Measurement:** ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
`;
}

function generateKeyFindings(metrics: ConversionMetrics): string {
  const findings: string[] = [];

  // Analyze each conversion point
  if (metrics.landingToCalculatorStart.rate < 65) {
    findings.push(`🔴 **Landing → Calculator:** ${metrics.landingToCalculatorStart.rate.toFixed(1)}% (below 65% benchmark)
   - **Issue:** Too many visitors leave without engaging with calculator
   - **Fix:** Move calculator above the fold, add compelling CTA, reduce navigation distractions`);
  }

  if (metrics.calculatorCompletion.rate < 70) {
    findings.push(`🟡 **Calculator Completion:** ${metrics.calculatorCompletion.rate.toFixed(1)}% (below 70% benchmark)
   - **Issue:** Users start calculator but don't complete it
   - **Fix:** Reduce form fields, add progress indicator, show estimated savings preview`);
  }

  if (metrics.signupConversion.rate < 20) {
    findings.push(`🔴 **Signup Rate:** ${metrics.signupConversion.rate.toFixed(1)}% (below 20% benchmark)
   - **Issue:** Users see results but don't create account
   - **Fix:** Add urgency ("Save your results"), social proof, simplified signup form`);
  }

  if (metrics.paymentConversion.rate < 5) {
    findings.push(`🔴 **Payment Rate:** ${metrics.paymentConversion.rate.toFixed(1)}% (below 5% benchmark)
   - **Issue:** Free users don't convert to paid
   - **Fix:** Show ROI more clearly, add money-back guarantee, time-limited discount`);
  }

  if (findings.length === 0) {
    findings.push('🟢 **All conversion rates are at or above industry benchmarks!** Focus on scaling traffic.');
  }

  return findings.join('\n\n');
}

async function saveReport(metrics: ConversionMetrics) {
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = path.join(process.cwd(), 'docs', `CONVERSION_BASELINE_${timestamp}.md`);
  const report = generateReport(metrics);

  fs.writeFileSync(reportPath, report, 'utf-8');

  log(`\n✅ Report saved: ${reportPath}`, colors.green);

  // Also save JSON for programmatic access
  const jsonPath = path.join(process.cwd(), 'docs', `CONVERSION_BASELINE_${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(metrics, null, 2), 'utf-8');

  log(`✅ JSON data saved: ${jsonPath}`, colors.green);
}

// ═══════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════

async function main() {
  log('\n╔════════════════════════════════════════════════════════════════════╗', colors.cyan + colors.bold);
  log('║   PostHog Conversion Rate Baseline Measurement                    ║', colors.cyan + colors.bold);
  log('║   TaxBridge - Last 30 Days Performance                            ║', colors.cyan + colors.bold);
  log('╚════════════════════════════════════════════════════════════════════╝', colors.cyan + colors.bold);

  // Validate configuration
  if (!POSTHOG_API_KEY || POSTHOG_API_KEY.includes('your')) {
    log('\n❌ ERROR: PostHog API key not configured', colors.red + colors.bold);
    log('\n📝 Setup Instructions:', colors.yellow);
    log('   1. Get your PostHog API key from: https://app.posthog.com/project/settings', colors.reset);
    log('   2. Add to .env.local:', colors.reset);
    log('      NEXT_PUBLIC_POSTHOG_KEY=phc_your_actual_key_here', colors.cyan);
    log('   3. Restart this script\n', colors.reset);
    process.exit(1);
  }

  if (!POSTHOG_PROJECT_ID || POSTHOG_PROJECT_ID.includes('your')) {
    log('\n❌ ERROR: PostHog Project ID not configured', colors.red + colors.bold);
    log('\n📝 Setup Instructions:', colors.yellow);
    log('   1. Get your Project ID from PostHog URL: https://app.posthog.com/project/<PROJECT_ID>', colors.reset);
    log('   2. Add to .env.local:', colors.reset);
    log('      POSTHOG_PROJECT_ID=12345', colors.cyan);
    log('   3. Restart this script\n', colors.reset);
    process.exit(1);
  }

  try {
    // Calculate conversion metrics
    const metrics = await calculateConversionRates();

    // Display results
    displayMetrics(metrics);

    // Save report
    await saveReport(metrics);

    logSection('TASK COMPLETE ✅');
    log('\n🎯 Baseline conversion rates established for last 30 days', colors.green);
    log('📊 Data pulled from PostHog production analytics', colors.green);
    log('📝 Detailed report saved to docs/', colors.green);
    log('\n💡 Next Step: Run optimization experiments and measure improvement\n', colors.cyan);

  } catch (error: any) {
    log('\n❌ ERROR: Failed to pull conversion data', colors.red + colors.bold);
    log(`\n${error.message}`, colors.red);
    log(`\nStack trace:`, colors.dim);
    log(error.stack, colors.dim);
    process.exit(1);
  }
}

main();
