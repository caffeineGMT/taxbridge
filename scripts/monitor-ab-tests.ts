#!/usr/bin/env node
/**
 * A/B Test Monitoring Dashboard - March 2026
 *
 * Monitors landing page A/B test performance in real-time.
 * Run daily to check variant performance, traffic distribution, and guardrail metrics.
 *
 * Usage:
 *   npm run monitor:ab-tests
 *   node scripts/monitor-ab-tests.ts
 *
 * Requirements:
 *   - PostHog API key (optional, falls back to manual analysis)
 *   - Internet connection
 */

import fs from 'fs';
import path from 'path';

// ==================== CONFIGURATION ====================

const CONFIG = {
  // PostHog Configuration (optional - leave blank if not using PostHog)
  POSTHOG_API_KEY: process.env.POSTHOG_API_KEY || '',
  POSTHOG_PROJECT_ID: process.env.POSTHOG_PROJECT_ID || '',

  // Test configuration
  START_DATE: '2026-03-19', // Test start date
  DURATION_DAYS: 7, // Test duration
  MIN_VISITORS_PER_VARIANT: 1000, // Minimum sample size

  // Experiments being monitored
  EXPERIMENTS: {
    'landing-headline-roi-test': {
      name: 'Headline ROI Emphasis',
      variants: ['control', 'moderate-savings', 'aggressive-savings', 'urgency-savings'],
    },
    'landing-hero-media-test': {
      name: 'Video Hero vs Static',
      variants: ['static', 'video-autoplay', 'video-click', 'animated-stats'],
    },
    'landing-pricing-visibility-test': {
      name: 'Pricing Visibility',
      variants: ['hidden', 'price-only', 'full-pricing', 'value-comparison'],
    },
  },

  // Guardrail thresholds
  GUARDRAILS: {
    MAX_BOUNCE_RATE: 0.65, // 65% max bounce rate
    MAX_PAGE_LOAD_TIME: 3000, // 3 seconds max load time
    MIN_TRAFFIC_BALANCE: 0.20, // 20% min traffic per variant
    MAX_TRAFFIC_BALANCE: 0.30, // 30% max traffic per variant
  },
};

// ==================== TYPES ====================

interface VariantData {
  variant: string;
  visitors: number;
  signups: number;
  paidSignups: number;
  bounces: number;
  conversionRate: number;
  paidConversionRate: number;
  bounceRate: number;
}

interface ExperimentResults {
  experimentName: string;
  humanName: string;
  totalVisitors: number;
  variants: VariantData[];
  winner?: string;
  winnerLift?: number;
  isStatisticallySignificant: boolean;
}

// ==================== MONITORING FUNCTIONS ====================

/**
 * Calculate days since test started
 */
function getDaysSinceStart(): number {
  const start = new Date(CONFIG.START_DATE);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if we have PostHog credentials
 */
function hasPostHogConfig(): boolean {
  return !!(CONFIG.POSTHOG_API_KEY && CONFIG.POSTHOG_PROJECT_ID);
}

/**
 * Fetch PostHog data (if configured)
 */
async function fetchPostHogData(experimentName: string): Promise<VariantData[] | null> {
  if (!hasPostHogConfig()) {
    return null;
  }

  // TODO: Implement PostHog API calls
  // This is a placeholder - actual implementation would use PostHog API
  console.log(`[INFO] PostHog integration not implemented yet. Use manual analysis below.`);
  return null;
}

/**
 * Calculate statistical significance using chi-squared test
 */
function calculateStatisticalSignificance(
  controlVisitors: number,
  controlConversions: number,
  variantVisitors: number,
  variantConversions: number
): { pValue: number; isSignificant: boolean } {
  // Chi-squared test calculation
  const controlRate = controlConversions / controlVisitors;
  const variantRate = variantConversions / variantVisitors;

  const pooledRate = (controlConversions + variantConversions) / (controlVisitors + variantVisitors);

  const expectedControlConversions = controlVisitors * pooledRate;
  const expectedVariantConversions = variantVisitors * pooledRate;

  const chiSquared =
    Math.pow(controlConversions - expectedControlConversions, 2) / expectedControlConversions +
    Math.pow(variantConversions - expectedVariantConversions, 2) / expectedVariantConversions;

  // Degrees of freedom = 1 for 2x2 contingency table
  // Critical value for p < 0.05 with df=1 is 3.841
  const isSignificant = chiSquared > 3.841;
  const pValue = isSignificant ? 0.04 : 0.1; // Simplified approximation

  return { pValue, isSignificant };
}

/**
 * Analyze experiment results and determine winner
 */
function analyzeExperiment(variants: VariantData[]): {
  winner: string | null;
  lift: number | null;
  isSignificant: boolean;
} {
  if (variants.length === 0) {
    return { winner: null, lift: null, isSignificant: false };
  }

  // Find control variant
  const control = variants.find((v) => v.variant === 'control' || v.variant === 'static' || v.variant === 'hidden');
  if (!control) {
    return { winner: null, lift: null, isSignificant: false };
  }

  // Compare all variants against control
  let bestVariant = control;
  let bestLift = 0;
  let isSignificant = false;

  for (const variant of variants) {
    if (variant.variant === control.variant) continue;

    const lift = ((variant.conversionRate - control.conversionRate) / control.conversionRate) * 100;

    // Check statistical significance
    const { isSignificant: sigTest } = calculateStatisticalSignificance(
      control.visitors,
      control.signups,
      variant.visitors,
      variant.signups
    );

    if (lift > bestLift && sigTest) {
      bestVariant = variant;
      bestLift = lift;
      isSignificant = true;
    }
  }

  return {
    winner: bestVariant.variant,
    lift: bestLift,
    isSignificant,
  };
}

/**
 * Generate monitoring report
 */
function generateReport(results: ExperimentResults[]): string {
  const daysSinceStart = getDaysSinceStart();
  const daysRemaining = Math.max(0, CONFIG.DURATION_DAYS - daysSinceStart);

  let report = `
═══════════════════════════════════════════════════════════
        A/B TEST MONITORING DASHBOARD
        Landing Page Conversion Optimization
═══════════════════════════════════════════════════════════

📅 TEST STATUS
  Start Date: ${CONFIG.START_DATE}
  Duration: ${CONFIG.DURATION_DAYS} days
  Days Elapsed: ${daysSinceStart} / ${CONFIG.DURATION_DAYS}
  Days Remaining: ${daysRemaining}
  ${daysRemaining === 0 ? '🎉 TEST COMPLETE - ANALYZE RESULTS' : '⏳ Test in progress'}

`;

  // Overall summary
  const totalVisitors = results.reduce((sum, exp) => sum + exp.totalVisitors, 0);
  report += `
📊 TRAFFIC SUMMARY
  Total Visitors: ${totalVisitors.toLocaleString()}
  Target: ${(CONFIG.MIN_VISITORS_PER_VARIANT * 12).toLocaleString()} (12 variants × 1000 min)
  Progress: ${((totalVisitors / (CONFIG.MIN_VISITORS_PER_VARIANT * 12)) * 100).toFixed(1)}%
  ${totalVisitors >= CONFIG.MIN_VISITORS_PER_VARIANT * 12 ? '✅' : '⚠️'} Sample size ${totalVisitors >= CONFIG.MIN_VISITORS_PER_VARIANT * 12 ? 'adequate' : 'insufficient'}

`;

  // Per-experiment results
  for (const experiment of results) {
    report += `
───────────────────────────────────────────────────────────
🧪 ${experiment.humanName.toUpperCase()}
───────────────────────────────────────────────────────────

Total Visitors: ${experiment.totalVisitors.toLocaleString()}
Minimum per variant: ${CONFIG.MIN_VISITORS_PER_VARIANT.toLocaleString()}

Variant Performance:
`;

    for (const variant of experiment.variants) {
      const trafficShare = (variant.visitors / experiment.totalVisitors) * 100;
      const trafficBalanceOK =
        trafficShare >= CONFIG.GUARDRAILS.MIN_TRAFFIC_BALANCE * 100 &&
        trafficShare <= CONFIG.GUARDRAILS.MAX_TRAFFIC_BALANCE * 100;

      report += `
  ${variant.variant.padEnd(20)} ${trafficBalanceOK ? '✅' : '⚠️'}
    Visitors:         ${variant.visitors.toLocaleString().padStart(8)} (${trafficShare.toFixed(1)}%)
    Signups:          ${variant.signups.toLocaleString().padStart(8)}
    Conversion Rate:  ${(variant.conversionRate * 100).toFixed(2)}%
    Paid Signups:     ${variant.paidSignups.toLocaleString().padStart(8)}
    Paid Conv Rate:   ${(variant.paidConversionRate * 100).toFixed(2)}%
    Bounce Rate:      ${(variant.bounceRate * 100).toFixed(1)}% ${variant.bounceRate < CONFIG.GUARDRAILS.MAX_BOUNCE_RATE ? '✅' : '❌'}
`;
    }

    // Winner analysis
    if (experiment.winner) {
      report += `
🏆 CURRENT LEADER: ${experiment.winner}
   Lift vs Control: +${experiment.winnerLift?.toFixed(1)}%
   Statistical Significance: ${experiment.isStatisticallySignificant ? '✅ YES (p < 0.05)' : '❌ NO - Need more data'}
`;
    } else {
      report += `
⏳ No clear winner yet - need more data
`;
    }
  }

  report += `
═══════════════════════════════════════════════════════════
                    NEXT STEPS
═══════════════════════════════════════════════════════════

${daysRemaining > 0 ? `⏳ CONTINUE MONITORING (${daysRemaining} days remaining)` : '🎉 TEST COMPLETE'}

1. Check traffic distribution daily
2. Monitor conversion rates by variant
3. Watch guardrail metrics (bounce rate, load time)
${daysRemaining === 0 ? '4. Declare winners and implement (see AB_TEST_DEPLOYMENT_GUIDE.md)\n5. Run: node scripts/implement-ab-winners.ts' : ''}

═══════════════════════════════════════════════════════════

📖 Documentation: /docs/AB_TEST_DEPLOYMENT_GUIDE.md
📊 PostHog Dashboard: https://app.posthog.com (if configured)
🔬 Stat Significance Calc: https://www.evanmiller.org/ab-testing/chi-squared.html

`;

  return report;
}

/**
 * Save report to file
 */
function saveReport(report: string, filename: string): void {
  const reportsDir = path.join(process.cwd(), 'docs', 'ab-test-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filepath = path.join(reportsDir, filename);
  fs.writeFileSync(filepath, report, 'utf-8');
  console.log(`\n✅ Report saved: ${filepath}\n`);
}

// ==================== MANUAL DATA ENTRY ====================

/**
 * Prompt for manual data entry (if PostHog not configured)
 */
function promptManualData(): ExperimentResults[] {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                  MANUAL DATA ENTRY MODE                    ║
╚════════════════════════════════════════════════════════════╝

PostHog is not configured. Please enter data manually.

Where to find this data:
1. PostHog dashboard (if configured): https://app.posthog.com
2. Google Analytics (if configured)
3. Server logs analysis
4. Manual counting from user database

For each experiment, you'll enter:
- Visitors per variant
- Signups per variant
- Paid signups per variant
- Bounces per variant

Press Ctrl+C to skip manual entry and use placeholder data.

`);

  // Placeholder data for demonstration
  // In production, you would use readline to prompt for input
  const placeholderResults: ExperimentResults[] = [
    {
      experimentName: 'landing-headline-roi-test',
      humanName: 'Headline ROI Emphasis',
      totalVisitors: 4000,
      variants: [
        {
          variant: 'control',
          visitors: 1000,
          signups: 30,
          paidSignups: 3,
          bounces: 600,
          conversionRate: 0.03,
          paidConversionRate: 0.003,
          bounceRate: 0.6,
        },
        {
          variant: 'moderate-savings',
          visitors: 1000,
          signups: 35,
          paidSignups: 4,
          bounces: 580,
          conversionRate: 0.035,
          paidConversionRate: 0.004,
          bounceRate: 0.58,
        },
        {
          variant: 'aggressive-savings',
          visitors: 1000,
          signups: 42,
          paidSignups: 5,
          bounces: 550,
          conversionRate: 0.042,
          paidConversionRate: 0.005,
          bounceRate: 0.55,
        },
        {
          variant: 'urgency-savings',
          visitors: 1000,
          signups: 38,
          paidSignups: 4,
          bounces: 570,
          conversionRate: 0.038,
          paidConversionRate: 0.004,
          bounceRate: 0.57,
        },
      ],
      winner: 'aggressive-savings',
      winnerLift: 40,
      isStatisticallySignificant: true,
    },
    {
      experimentName: 'landing-hero-media-test',
      humanName: 'Video Hero vs Static',
      totalVisitors: 4000,
      variants: [
        {
          variant: 'static',
          visitors: 1000,
          signups: 30,
          paidSignups: 3,
          bounces: 600,
          conversionRate: 0.03,
          paidConversionRate: 0.003,
          bounceRate: 0.6,
        },
        {
          variant: 'video-autoplay',
          visitors: 1000,
          signups: 28,
          paidSignups: 2,
          bounces: 650,
          conversionRate: 0.028,
          paidConversionRate: 0.002,
          bounceRate: 0.65,
        },
        {
          variant: 'video-click',
          visitors: 1000,
          signups: 36,
          paidSignups: 4,
          bounces: 580,
          conversionRate: 0.036,
          paidConversionRate: 0.004,
          bounceRate: 0.58,
        },
        {
          variant: 'animated-stats',
          visitors: 1000,
          signups: 32,
          paidSignups: 3,
          bounces: 590,
          conversionRate: 0.032,
          paidConversionRate: 0.003,
          bounceRate: 0.59,
        },
      ],
      winner: 'video-click',
      winnerLift: 20,
      isStatisticallySignificant: true,
    },
    {
      experimentName: 'landing-pricing-visibility-test',
      humanName: 'Pricing Visibility',
      totalVisitors: 4000,
      variants: [
        {
          variant: 'hidden',
          visitors: 1000,
          signups: 30,
          paidSignups: 2,
          bounces: 600,
          conversionRate: 0.03,
          paidConversionRate: 0.002,
          bounceRate: 0.6,
        },
        {
          variant: 'price-only',
          visitors: 1000,
          signups: 28,
          paidSignups: 3,
          bounces: 620,
          conversionRate: 0.028,
          paidConversionRate: 0.003,
          bounceRate: 0.62,
        },
        {
          variant: 'full-pricing',
          visitors: 1000,
          signups: 26,
          paidSignups: 4,
          bounces: 640,
          conversionRate: 0.026,
          paidConversionRate: 0.004,
          bounceRate: 0.64,
        },
        {
          variant: 'value-comparison',
          visitors: 1000,
          signups: 32,
          paidSignups: 5,
          bounces: 580,
          conversionRate: 0.032,
          paidConversionRate: 0.005,
          bounceRate: 0.58,
        },
      ],
      winner: 'value-comparison',
      winnerLift: 6.7,
      isStatisticallySignificant: false,
    },
  ];

  console.log(`
⚠️  Using placeholder data for demonstration.
    Replace with real data from your analytics platform.
`);

  return placeholderResults;
}

// ==================== MAIN EXECUTION ====================

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║       A/B TEST MONITORING DASHBOARD - MARCH 2026           ║
╚════════════════════════════════════════════════════════════╝
`);

  // Check PostHog configuration
  if (hasPostHogConfig()) {
    console.log(`✅ PostHog configured`);
    console.log(`   API Key: ${CONFIG.POSTHOG_API_KEY.substring(0, 10)}...`);
    console.log(`   Project ID: ${CONFIG.POSTHOG_PROJECT_ID}\n`);
  } else {
    console.log(`⚠️  PostHog NOT configured (using manual data entry mode)\n`);
  }

  // Fetch or prompt for data
  let results: ExperimentResults[];

  if (hasPostHogConfig()) {
    console.log(`Fetching data from PostHog...\n`);
    // TODO: Implement PostHog API integration
    results = promptManualData(); // Fallback for now
  } else {
    results = promptManualData();
  }

  // Analyze experiments
  for (const experiment of results) {
    const analysis = analyzeExperiment(experiment.variants);
    experiment.winner = analysis.winner ?? undefined;
    experiment.winnerLift = analysis.lift ?? undefined;
    experiment.isStatisticallySignificant = analysis.isSignificant;
  }

  // Generate report
  const report = generateReport(results);
  console.log(report);

  // Save report
  const timestamp = new Date().toISOString().split('T')[0];
  const daysSince = getDaysSinceStart();
  const filename = `ab-test-day-${daysSince}-${timestamp}.txt`;
  saveReport(report, filename);

  // Exit
  process.exit(0);
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Error running monitoring dashboard:', error);
    process.exit(1);
  });
}

export { main, analyzeExperiment, generateReport };
