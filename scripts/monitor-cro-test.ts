#!/usr/bin/env node
/**
 * CRO Test Monitor - March 2026
 *
 * Monitors landing page CRO test progress:
 * - Tracks visitor count per variant
 * - Calculates conversion rates
 * - Identifies winning variant
 * - Alerts when statistical significance is reached
 *
 * Run: npx tsx scripts/monitor-cro-test.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// PostHog API (if available)
const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY || '';
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID || '';

// Test configuration
const TEST_CONFIG = {
  experimentName: 'landing-cro-march-2026',
  startDate: '2026-03-19',
  endDate: '2026-04-02',
  targetVisitorsPerVariant: 1000,
  variants: ['control', 'variant-1', 'variant-2', 'variant-3'],
  primaryMetric: 'CTA Click Rate',
  successThreshold: 0.15, // 15% lift
};

interface VariantStats {
  variant: string;
  visitors: number;
  ctaClicks: number;
  signups: number;
  clickRate: number;
  signupRate: number;
  progressPercent: number;
}

interface TestSummary {
  testName: string;
  status: 'running' | 'insufficient-data' | 'complete';
  daysElapsed: number;
  daysRemaining: number;
  totalVisitors: number;
  variantStats: VariantStats[];
  winningVariant: string | null;
  liftVsControl: number | null;
  statisticalSignificance: boolean;
  recommendedAction: string;
}

/**
 * Fetch test data from PostHog
 */
async function fetchPostHogData(): Promise<VariantStats[]> {
  console.log('📊 Fetching test data from PostHog...\n');

  // Mock data for demonstration
  // In production, integrate with PostHog API:
  // https://posthog.com/docs/api/insights

  const mockData: VariantStats[] = [
    {
      variant: 'control',
      visitors: 234,
      ctaClicks: 28,
      signups: 12,
      clickRate: 0.1197, // 11.97%
      signupRate: 0.0513, // 5.13%
      progressPercent: 23.4,
    },
    {
      variant: 'variant-1',
      visitors: 241,
      ctaClicks: 31,
      signups: 14,
      clickRate: 0.1286, // 12.86%
      signupRate: 0.0581, // 5.81%
      progressPercent: 24.1,
    },
    {
      variant: 'variant-2',
      visitors: 228,
      ctaClicks: 35,
      signups: 16,
      clickRate: 0.1535, // 15.35%
      signupRate: 0.0702, // 7.02%
      progressPercent: 22.8,
    },
    {
      variant: 'variant-3',
      visitors: 237,
      ctaClicks: 39,
      signups: 18,
      clickRate: 0.1646, // 16.46%
      signupRate: 0.0759, // 7.59%
      progressPercent: 23.7,
    },
  ];

  return mockData;
}

/**
 * Calculate statistical significance using Z-test for proportions
 */
function calculateSignificance(
  controlRate: number,
  controlSize: number,
  variantRate: number,
  variantSize: number
): { significant: boolean; pValue: number } {
  // Pooled proportion
  const pooled =
    (controlRate * controlSize + variantRate * variantSize) / (controlSize + variantSize);

  // Standard error
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / controlSize + 1 / variantSize));

  // Z-score
  const z = Math.abs(variantRate - controlRate) / se;

  // P-value (two-tailed, approximate)
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));

  return {
    significant: pValue < 0.05,
    pValue,
  };
}

/**
 * Normal cumulative distribution function (approximation)
 */
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const prob =
    d *
    t *
    (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

/**
 * Generate test summary report
 */
function generateTestSummary(variantStats: VariantStats[]): TestSummary {
  const startDate = new Date(TEST_CONFIG.startDate);
  const endDate = new Date(TEST_CONFIG.endDate);
  const today = new Date();

  const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const totalVisitors = variantStats.reduce((sum, v) => sum + v.visitors, 0);

  // Find control and best variant
  const control = variantStats.find((v) => v.variant === 'control');
  const sortedByClickRate = [...variantStats].sort((a, b) => b.clickRate - a.clickRate);
  const bestVariant = sortedByClickRate[0];

  let winningVariant: string | null = null;
  let liftVsControl: number | null = null;
  let statisticalSignificance = false;

  if (control && bestVariant.variant !== 'control') {
    const significance = calculateSignificance(
      control.clickRate,
      control.visitors,
      bestVariant.clickRate,
      bestVariant.visitors
    );

    if (significance.significant) {
      winningVariant = bestVariant.variant;
      liftVsControl = ((bestVariant.clickRate - control.clickRate) / control.clickRate) * 100;
      statisticalSignificance = true;
    }
  }

  // Determine status
  let status: TestSummary['status'] = 'running';
  if (totalVisitors < TEST_CONFIG.targetVisitorsPerVariant) {
    status = 'insufficient-data';
  } else if (daysRemaining <= 0 || statisticalSignificance) {
    status = 'complete';
  }

  // Recommended action
  let recommendedAction = 'Continue test - insufficient data';
  if (statisticalSignificance && liftVsControl && liftVsControl > TEST_CONFIG.successThreshold * 100) {
    recommendedAction = `✅ WINNER FOUND: Implement ${winningVariant} (+${liftVsControl.toFixed(1)}% lift)`;
  } else if (daysRemaining <= 0) {
    recommendedAction = 'Test complete - no significant winner. Consider extending or new test.';
  } else if (totalVisitors >= TEST_CONFIG.targetVisitorsPerVariant * 2) {
    recommendedAction = 'Continue monitoring - approaching significance threshold';
  }

  return {
    testName: TEST_CONFIG.experimentName,
    status,
    daysElapsed,
    daysRemaining,
    totalVisitors,
    variantStats,
    winningVariant,
    liftVsControl,
    statisticalSignificance,
    recommendedAction,
  };
}

/**
 * Print formatted report to console
 */
function printReport(summary: TestSummary) {
  console.clear();
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║          CRO TEST MONITOR - MARCH 2026                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Test: ${summary.testName}`);
  console.log(`📅 Day ${summary.daysElapsed} of 14 (${summary.daysRemaining} days remaining)`);
  console.log(`👥 Total Visitors: ${summary.totalVisitors.toLocaleString()} / ${(TEST_CONFIG.targetVisitorsPerVariant * 4).toLocaleString()} target`);
  console.log(`📈 Status: ${summary.status.toUpperCase()}\n`);

  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ VARIANT PERFORMANCE                                         │');
  console.log('└─────────────────────────────────────────────────────────────┘\n');

  // Table header
  console.log(
    `${'Variant'.padEnd(15)} ${'Visitors'.padEnd(12)} ${'CTR'.padEnd(10)} ${'Signups'.padEnd(10)} ${'Progress'.padEnd(10)}`
  );
  console.log('─'.repeat(70));

  // Sort by click rate
  const sorted = [...summary.variantStats].sort((a, b) => b.clickRate - a.clickRate);

  sorted.forEach((variant, index) => {
    const isBest = index === 0 && variant.variant !== 'control';
    const icon = isBest ? '🏆' : variant.variant === 'control' ? '📍' : '  ';

    const variantName = variant.variant.padEnd(13);
    const visitors = `${variant.visitors}/${TEST_CONFIG.targetVisitorsPerVariant}`.padEnd(12);
    const ctr = `${(variant.clickRate * 100).toFixed(2)}%`.padEnd(10);
    const signups = `${variant.signups} (${(variant.signupRate * 100).toFixed(1)}%)`.padEnd(10);
    const progress = `${variant.progressPercent.toFixed(1)}%`.padEnd(10);

    console.log(`${icon} ${variantName} ${visitors} ${ctr} ${signups} ${progress}`);
  });

  console.log('\n');

  // Statistical significance
  if (summary.statisticalSignificance && summary.winningVariant) {
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│ 🎉 STATISTICAL SIGNIFICANCE REACHED!                        │');
    console.log('└─────────────────────────────────────────────────────────────┘\n');
    console.log(`Winning Variant: ${summary.winningVariant.toUpperCase()}`);
    console.log(`Lift vs Control: +${summary.liftVsControl?.toFixed(2)}%`);
    console.log(`Confidence: >95% (p < 0.05)\n`);
  }

  // Recommendations
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ RECOMMENDATION                                              │');
  console.log('└─────────────────────────────────────────────────────────────┘\n');
  console.log(`${summary.recommendedAction}\n`);

  // Test details
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ TEST DETAILS                                                │');
  console.log('└─────────────────────────────────────────────────────────────┘\n');
  console.log(`Headline A: "Save $5K+ on RSU Taxes"`);
  console.log(`Headline B: "H1B Workers: Stop Overpaying Taxes"`);
  console.log(`CTA A: "Calculate Now"`);
  console.log(`CTA B: "See My Savings"`);
  console.log(``);
  console.log(`Control:   Headline A + CTA A`);
  console.log(`Variant 1: Headline A + CTA B`);
  console.log(`Variant 2: Headline B + CTA A`);
  console.log(`Variant 3: Headline B + CTA B`);
  console.log(``);

  console.log(`\n⏱️  Last updated: ${new Date().toLocaleTimeString()}`);
  console.log(`🔄 Run 'npm run monitor:cro' to refresh\n`);
}

/**
 * Main monitoring function
 */
async function main() {
  try {
    const variantStats = await fetchPostHogData();
    const summary = generateTestSummary(variantStats);
    printReport(summary);
  } catch (error) {
    console.error('❌ Error monitoring test:', error);
    process.exit(1);
  }
}

main();
