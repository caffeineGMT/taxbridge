/**
 * Landing Page Headline A/B Test - Results Analyzer
 *
 * Fetches experiment data from PostHog and generates comprehensive results report
 *
 * Usage:
 *   npx tsx scripts/analyze-headline-ab-test.ts
 *   npx tsx scripts/analyze-headline-ab-test.ts --export-csv
 *   npx tsx scripts/analyze-headline-ab-test.ts --daily-summary
 *
 * Requirements:
 *   - POSTHOG_PERSONAL_API_KEY in .env.local
 *   - Experiment must be running (landing-headline-cro-march-2026)
 */

import { createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';

// Configuration
const EXPERIMENT_NAME = 'landing-headline-cro-march-2026';
const EXPERIMENT_START = '2026-03-19';
const EXPERIMENT_END = '2026-04-02';
const POSTHOG_PROJECT_ID = process.env.NEXT_PUBLIC_POSTHOG_KEY?.split('_')[1] || '';
const POSTHOG_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

interface VariantMetrics {
  variant: string;
  variantName: string;
  totalVisitors: number;
  ctaClicks: number;
  ctaClickRate: number;
  calculatorCompletions: number;
  conversionRate: number;
  signups: number;
  signupRate: number;
  avgTimeToFirstAction?: number;
  bounceRate?: number;
}

interface ExperimentResults {
  experimentName: string;
  dateRange: { start: string; end: string };
  totalVisitors: number;
  variants: VariantMetrics[];
  winner?: {
    variant: string;
    improvement: number;
    confidenceLevel: number;
    isStatisticallySignificant: boolean;
  };
  generatedAt: string;
}

/**
 * Fetch events from PostHog API
 */
async function fetchPostHogEvents(
  eventName: string,
  filters?: Record<string, any>
): Promise<any[]> {
  if (!POSTHOG_API_KEY) {
    console.error('❌ POSTHOG_PERSONAL_API_KEY not found in environment');
    console.error('   Add it to .env.local to enable results fetching');
    return [];
  }

  const url = `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/events`;
  const params = new URLSearchParams({
    event: eventName,
    after: EXPERIMENT_START,
    before: EXPERIMENT_END,
    limit: '5000',
    ...Object.fromEntries(
      Object.entries(filters || {}).map(([k, v]) => [`properties[${k}]`, v])
    ),
  });

  try {
    const response = await fetch(`${url}?${params}`, {
      headers: {
        Authorization: `Bearer ${POSTHOG_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`PostHog API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Failed to fetch ${eventName} events:`, error);
    return [];
  }
}

/**
 * Calculate chi-square statistical significance
 */
function calculateChiSquare(
  variantA: { visitors: number; conversions: number },
  variantB: { visitors: number; conversions: number }
): { pValue: number; isSignificant: boolean } {
  const n1 = variantA.visitors;
  const n2 = variantB.visitors;
  const p1 = variantA.conversions / n1;
  const p2 = variantB.conversions / n2;
  const pPool = (variantA.conversions + variantB.conversions) / (n1 + n2);

  const zScore =
    (p1 - p2) / Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

  return {
    pValue,
    isSignificant: pValue < 0.05, // 95% confidence
  };
}

/**
 * Normal CDF approximation
 */
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const prob =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

/**
 * Analyze experiment results
 */
async function analyzeExperiment(): Promise<ExperimentResults> {
  console.log('📊 Fetching experiment data from PostHog...\n');

  // Fetch all relevant events
  const landingViews = await fetchPostHogEvents('landing_page_viewed', {
    experimentName: EXPERIMENT_NAME,
  });

  const ctaClicks = await fetchPostHogEvents('cta_button_clicked', {
    experimentName: EXPERIMENT_NAME,
  });

  const calculatorViews = await fetchPostHogEvents('tax_calculation_viewed');
  const signups = await fetchPostHogEvents('signup_completed');

  // Group by variant
  const variants = ['variant-a-savings', 'variant-b-professional', 'variant-c-speed'];
  const variantNames = {
    'variant-a-savings': 'Variant A: Save $5K+ on H1B RSU Taxes',
    'variant-b-professional': 'Variant B: Cross-Border Tax Calculator for Tech Workers',
    'variant-c-speed': 'Variant C: Know Your RSU Tax Bill in 2 Minutes',
  };

  const variantMetrics: VariantMetrics[] = variants.map((variant) => {
    const variantLandings = landingViews.filter(
      (e) => e.properties?.headlineVariant === variant
    );
    const variantCTAs = ctaClicks.filter(
      (e) => e.properties?.headlineVariant === variant
    );

    // Get unique person IDs who landed on this variant
    const variantVisitors = new Set(
      variantLandings.map((e) => e.properties?.distinct_id || e.distinct_id)
    );

    // Count conversions (calculator views) from these visitors
    const variantCalculator = calculatorViews.filter((e) => {
      const personId = e.properties?.distinct_id || e.distinct_id;
      return variantVisitors.has(personId);
    });

    const variantSignups = signups.filter((e) => {
      const personId = e.properties?.distinct_id || e.distinct_id;
      return variantVisitors.has(personId);
    });

    const totalVisitors = variantVisitors.size;
    const ctaClicks = new Set(variantCTAs.map((e) => e.distinct_id)).size;
    const calculatorCompletions = new Set(variantCalculator.map((e) => e.distinct_id))
      .size;
    const signupCount = new Set(variantSignups.map((e) => e.distinct_id)).size;

    return {
      variant,
      variantName: variantNames[variant as keyof typeof variantNames],
      totalVisitors,
      ctaClicks,
      ctaClickRate: totalVisitors > 0 ? (ctaClicks / totalVisitors) * 100 : 0,
      calculatorCompletions,
      conversionRate:
        totalVisitors > 0 ? (calculatorCompletions / totalVisitors) * 100 : 0,
      signups: signupCount,
      signupRate: totalVisitors > 0 ? (signupCount / totalVisitors) * 100 : 0,
    };
  });

  // Sort by conversion rate
  variantMetrics.sort((a, b) => b.conversionRate - a.conversionRate);

  // Determine winner and statistical significance
  let winner;
  if (variantMetrics.length >= 2 && variantMetrics[0].totalVisitors >= 100) {
    const control = variantMetrics[1]; // Second best as control
    const treatment = variantMetrics[0]; // Best performer

    const improvement =
      ((treatment.conversionRate - control.conversionRate) /
        control.conversionRate) *
      100;

    const significance = calculateChiSquare(
      {
        visitors: control.totalVisitors,
        conversions: control.calculatorCompletions,
      },
      {
        visitors: treatment.totalVisitors,
        conversions: treatment.calculatorCompletions,
      }
    );

    winner = {
      variant: treatment.variant,
      improvement: Math.round(improvement * 10) / 10,
      confidenceLevel: Math.round((1 - significance.pValue) * 100),
      isStatisticallySignificant: significance.isSignificant,
    };
  }

  return {
    experimentName: EXPERIMENT_NAME,
    dateRange: { start: EXPERIMENT_START, end: EXPERIMENT_END },
    totalVisitors: variantMetrics.reduce((sum, v) => sum + v.totalVisitors, 0),
    variants: variantMetrics,
    winner,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Print results to console
 */
function printResults(results: ExperimentResults) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  LANDING PAGE HEADLINE A/B TEST RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`📅 Date Range: ${results.dateRange.start} to ${results.dateRange.end}`);
  console.log(`👥 Total Visitors: ${results.totalVisitors.toLocaleString()}\n`);

  console.log('───────────────────────────────────────────────────────────────\n');

  results.variants.forEach((v, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
    console.log(`${medal} ${v.variantName}`);
    console.log(`   Variant ID: ${v.variant}`);
    console.log(`   Visitors: ${v.totalVisitors.toLocaleString()}`);
    console.log(`   CTA Clicks: ${v.ctaClicks} (${v.ctaClickRate.toFixed(1)}%)`);
    console.log(
      `   Calculator Completions: ${v.calculatorCompletions} (${v.conversionRate.toFixed(1)}%)`
    );
    console.log(`   Signups: ${v.signups} (${v.signupRate.toFixed(1)}%)`);
    console.log('');
  });

  console.log('───────────────────────────────────────────────────────────────\n');

  if (results.winner) {
    const winnerVariant = results.variants.find(
      (v) => v.variant === results.winner!.variant
    )!;

    console.log('🏆 WINNER DECLARED!\n');
    console.log(`   ${winnerVariant.variantName}`);
    console.log(`   Improvement: +${results.winner.improvement}%`);
    console.log(`   Confidence: ${results.winner.confidenceLevel}%`);
    console.log(
      `   Statistical Significance: ${results.winner.isStatisticallySignificant ? '✅ YES' : '❌ NO (need more data)'}\n`
    );

    if (!results.winner.isStatisticallySignificant) {
      console.log(
        '⚠️  Warning: Results not yet statistically significant (p < 0.05)'
      );
      console.log('   Continue test until significance is reached or 2 weeks elapsed\n');
    }
  } else {
    console.log('⏳ Not enough data yet to declare a winner\n');
    console.log('   Minimum: 100 visitors per variant\n');
  }

  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`Generated: ${new Date(results.generatedAt).toLocaleString()}`);
  console.log('\n📊 Full analysis guide: docs/POSTHOG_AB_TEST_ANALYSIS_GUIDE.md');
  console.log('📈 PostHog dashboard: https://app.posthog.com/insights\n');
}

/**
 * Export results to CSV
 */
async function exportToCSV(results: ExperimentResults) {
  const csvPath = `docs/ab-test-results-${new Date().toISOString().split('T')[0]}.csv`;

  const csvHeader =
    'Variant,Variant Name,Visitors,CTA Clicks,CTA Click Rate,Calculator Completions,Conversion Rate,Signups,Signup Rate\n';
  const csvRows = results.variants
    .map(
      (v) =>
        `"${v.variant}","${v.variantName}",${v.totalVisitors},${v.ctaClicks},${v.ctaClickRate.toFixed(2)},${v.calculatorCompletions},${v.conversionRate.toFixed(2)},${v.signups},${v.signupRate.toFixed(2)}`
    )
    .join('\n');

  await writeFile(csvPath, csvHeader + csvRows);
  console.log(`✅ Results exported to: ${csvPath}\n`);
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const exportCSV = args.includes('--export-csv');
  const dailySummary = args.includes('--daily-summary');

  try {
    const results = await analyzeExperiment();

    printResults(results);

    if (exportCSV) {
      await exportToCSV(results);
    }

    if (dailySummary) {
      // Save daily snapshot for trend analysis
      const snapshotPath = `docs/daily-snapshots/${new Date().toISOString().split('T')[0]}.json`;
      await writeFile(snapshotPath, JSON.stringify(results, null, 2));
      console.log(`📸 Daily snapshot saved: ${snapshotPath}\n`);
    }
  } catch (error) {
    console.error('❌ Error analyzing experiment:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { analyzeExperiment, type ExperimentResults, type VariantMetrics };
