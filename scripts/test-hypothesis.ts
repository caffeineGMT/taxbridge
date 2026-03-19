#!/usr/bin/env tsx
/**
 * Hypothesis Test Analyzer
 *
 * Tests the primary hypothesis:
 * "Lower price point ($29/year) will increase conversion rate by 3x"
 *
 * Measures:
 * - Conversion rate lift (actual vs hypothesis)
 * - Statistical significance
 * - Revenue impact
 * - Volume increase
 *
 * Usage: npm run test:hypothesis
 */

import https from 'https';

interface HypothesisTest {
  hypothesis: string;
  metric: string;
  baseline: number;
  target: number;
  actual: number;
  status: 'exceeded' | 'met' | 'failed' | 'insufficient_data';
  confidence: number;
}

async function fetchExperimentData(): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const path = '/api/analytics/pricing-experiment-stats?days=14&cohort=all';

    https.get(`${url}${path}`, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.success) {
            resolve(json.data);
          } else {
            reject(new Error(json.error || 'Failed to fetch data'));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

function calculateZScore(p1: number, n1: number, p2: number, n2: number): number {
  // Two-proportion z-test
  const pPool = (p1 * n1 + p2 * n2) / (n1 + n2);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));

  if (se === 0) return 0;

  return (p1 - p2) / se;
}

function zToConfidence(z: number): number {
  // Approximate confidence level from z-score
  // |z| > 1.96 = 95% confidence (p < 0.05)
  // |z| > 2.576 = 99% confidence (p < 0.01)

  const absZ = Math.abs(z);

  if (absZ >= 2.576) return 99;
  if (absZ >= 1.96) return 95;
  if (absZ >= 1.645) return 90;
  if (absZ >= 1.28) return 80;
  return 50; // Not significant
}

async function testHypotheses(data: any): Promise<HypothesisTest[]> {
  const annual29 = data.variants.find((v: any) => v.variant === 'annual_29');
  const annual49 = data.variants.find((v: any) => v.variant === 'annual_49');
  const annual79 = data.variants.find((v: any) => v.variant === 'annual_79');

  if (!annual29 || !annual49 || !annual79) {
    throw new Error('Missing variant data');
  }

  const tests: HypothesisTest[] = [];

  // PRIMARY HYPOTHESIS: $29 achieves 3x conversion rate vs $79
  const h1ConversionLift = annual29.conversionRate / annual79.conversionRate;
  const h1ZScore = calculateZScore(
    annual29.conversionRate / 100,
    annual29.exposures,
    annual79.conversionRate / 100,
    annual79.exposures
  );

  tests.push({
    hypothesis: '$29/year achieves 3x conversion rate vs $79/year baseline',
    metric: 'Conversion Rate Multiplier',
    baseline: 1.0,
    target: 3.0,
    actual: h1ConversionLift,
    status:
      annual29.conversions < 33 || annual79.conversions < 33
        ? 'insufficient_data'
        : h1ConversionLift >= 3.0
        ? 'exceeded'
        : h1ConversionLift >= 2.5
        ? 'met'
        : 'failed',
    confidence: zToConfidence(h1ZScore),
  });

  // SECONDARY HYPOTHESIS: $29 generates higher total revenue than $79
  const h2RevenueLift = (annual29.revenue / annual79.revenue) * 100 - 100;

  tests.push({
    hypothesis: '$29/year generates higher total revenue than $79/year',
    metric: 'Revenue Lift (%)',
    baseline: 0,
    target: 20, // 20% revenue increase
    actual: h2RevenueLift,
    status:
      annual29.conversions < 33 || annual79.conversions < 33
        ? 'insufficient_data'
        : h2RevenueLift >= 50
        ? 'exceeded'
        : h2RevenueLift >= 20
        ? 'met'
        : 'failed',
    confidence: annual29.conversions >= 33 ? 95 : 50,
  });

  // TERTIARY HYPOTHESIS: $49 is the revenue sweet spot (beats both $29 and $79)
  const h3RevenueVs29 = (annual49.revenue / annual29.revenue) * 100 - 100;
  const h3RevenueVs79 = (annual49.revenue / annual79.revenue) * 100 - 100;

  tests.push({
    hypothesis: '$49/year beats both $29 and $79 in total revenue',
    metric: 'Revenue Advantage (%)',
    baseline: 0,
    target: 10, // 10% advantage
    actual: Math.min(h3RevenueVs29, h3RevenueVs79),
    status:
      annual49.conversions < 33
        ? 'insufficient_data'
        : h3RevenueVs29 >= 10 && h3RevenueVs79 >= 10
        ? 'exceeded'
        : h3RevenueVs29 >= 0 && h3RevenueVs79 >= 0
        ? 'met'
        : 'failed',
    confidence: annual49.conversions >= 33 ? 95 : 50,
  });

  // VOLUME HYPOTHESIS: $29 achieves 80+ conversions (high volume target)
  tests.push({
    hypothesis: '$29/year achieves 80+ conversions in 14 days (high volume)',
    metric: 'Conversion Count',
    baseline: 33,
    target: 80,
    actual: annual29.conversions,
    status:
      annual29.conversions >= 80
        ? 'exceeded'
        : annual29.conversions >= 50
        ? 'met'
        : annual29.conversions >= 33
        ? 'failed'
        : 'insufficient_data',
    confidence: annual29.conversions >= 33 ? 95 : 50,
  });

  return tests;
}

function generateReport(tests: HypothesisTest[], data: any): string {
  const passCount = tests.filter(t => t.status === 'exceeded' || t.status === 'met').length;
  const failCount = tests.filter(t => t.status === 'failed').length;
  const pendingCount = tests.filter(t => t.status === 'insufficient_data').length;

  const overallStatus =
    pendingCount > 0
      ? '⏳ IN PROGRESS - Need more data'
      : passCount >= 3
      ? '✅ VALIDATED - Hypotheses confirmed'
      : '❌ FAILED - Hypotheses not supported';

  return `
╔════════════════════════════════════════════════════════════════════════════╗
║               PRICING EXPERIMENT - HYPOTHESIS TEST RESULTS                 ║
║                        $29 vs $49 vs $79 Analysis                          ║
║                          ${new Date().toISOString().split('T')[0]}                          ║
╚════════════════════════════════════════════════════════════════════════════╝

📊 OVERALL STATUS: ${overallStatus}

SUMMARY:
  ✅ Passed:    ${passCount}/4 hypotheses
  ❌ Failed:    ${failCount}/4 hypotheses
  ⏳ Pending:   ${pendingCount}/4 hypotheses (need 33+ conversions per variant)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${tests.map((test, idx) => {
  const statusIcon =
    test.status === 'exceeded'
      ? '🎯'
      : test.status === 'met'
      ? '✅'
      : test.status === 'failed'
      ? '❌'
      : '⏳';

  const statusText =
    test.status === 'exceeded'
      ? 'EXCEEDED'
      : test.status === 'met'
      ? 'MET'
      : test.status === 'failed'
      ? 'FAILED'
      : 'INSUFFICIENT DATA';

  return `
HYPOTHESIS ${idx + 1}: ${statusIcon} ${statusText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Statement:   ${test.hypothesis}
  Metric:      ${test.metric}
  Baseline:    ${test.baseline.toFixed(2)}
  Target:      ${test.target.toFixed(2)}
  Actual:      ${test.actual.toFixed(2)}
  Confidence:  ${test.confidence}%
  Status:      ${statusText}
`;
}).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 VARIANT PERFORMANCE SNAPSHOT:

┌─────────────┬─────────────┬────────────┬────────────┬────────────────┐
│ Variant     │ Conversions │ Conv Rate  │ Revenue    │ Rev/Visitor    │
├─────────────┼─────────────┼────────────┼────────────┼────────────────┤
${data.variants.map((v: any) => {
  const name = v.variant === 'annual_29' ? '$29/year' : v.variant === 'annual_49' ? '$49/year' : v.variant === 'annual_79' ? '$79/year' : '$19/month';
  return `│ ${name.padEnd(11)} │ ${String(v.conversions).padEnd(11)} │ ${(v.conversionRate.toFixed(2) + '%').padEnd(10)} │ $${String(v.revenue.toFixed(2)).padEnd(9)} │ $${v.revenuePerVisitor.toFixed(2).padEnd(13)} │`;
}).join('\n')}
└─────────────┴─────────────┴────────────┴────────────┴────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 RECOMMENDATIONS:

${tests[0].status === 'exceeded'
  ? '  ✅ PRIMARY HYPOTHESIS VALIDATED: $29 achieves 3x conversion lift\n     → Proceed with $29 pricing for high-volume strategy'
  : tests[0].status === 'met'
  ? '  ⚠️  PRIMARY HYPOTHESIS PARTIALLY MET: $29 shows strong lift but <3x\n     → Consider $29 for promotional campaigns, not default'
  : tests[0].status === 'failed'
  ? '  ❌ PRIMARY HYPOTHESIS FAILED: $29 does not achieve 3x lift\n     → Do NOT proceed with $29 as default pricing'
  : '  ⏳ PRIMARY HYPOTHESIS PENDING: Need more data (33+ conversions/variant)\n     → Continue test, check back in 3-5 days'
}

${tests[2].status === 'exceeded' || tests[2].status === 'met'
  ? '  ✅ SWEET SPOT IDENTIFIED: $49 beats both $29 and $79 in revenue\n     → Recommend $49 as default pricing for revenue optimization'
  : tests[2].status === 'insufficient_data'
  ? '  ⏳ SWEET SPOT TEST PENDING: Need more $49 conversions\n     → Continue monitoring $49 variant'
  : '  ℹ️  $49 is not the revenue leader\n     → Compare $29 vs $79 for winner'
}

${data.totals.conversions >= 100
  ? '  ✅ SUFFICIENT SAMPLE SIZE: 100+ conversions achieved\n     → Results are statistically reliable'
  : `  ⏳ SAMPLE SIZE: ${data.totals.conversions}/100 conversions\n     → Need ${100 - data.totals.conversions} more conversions for statistical confidence`
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 NEXT STEPS:

${
  passCount >= 3 && data.totals.conversions >= 100
    ? `  1. ✅ CONCLUDE EXPERIMENT - Sufficient data collected
  2. Update pricing page to winner variant
  3. Archive losing variants in Stripe
  4. Document results in docs/PRICING_EXPERIMENT_RESULTS_2026.md
  5. Grandfather existing customers at their original price`
    : data.totals.conversions >= 100
    ? `  1. ⚠️  REVIEW MIXED RESULTS - Some hypotheses failed
  2. Consider extending test or trying different price points
  3. Analyze cohort behavior (Product Hunt vs organic)
  4. Consult with stakeholders on next steps`
    : `  1. ⏳ CONTINUE TEST - Need ${100 - data.totals.conversions} more conversions
  2. Monitor daily with: npm run monitor:pricing-experiment
  3. Check back when 100+ conversions achieved
  4. Consider traffic boost: Google Ads, Product Hunt, Reddit`
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated: ${new Date().toISOString()}
Report saved to: docs/hypothesis-test-results/test-${new Date().toISOString().split('T')[0]}.txt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

async function main() {
  try {
    console.log('🔬 Fetching experiment data for hypothesis testing...\n');

    const data = await fetchExperimentData();

    console.log('🧪 Running hypothesis tests...\n');

    const tests = await testHypotheses(data);

    const report = generateReport(tests, data);

    console.log(report);

    // Save report to file
    const fs = await import('fs');
    const path = await import('path');

    const dir = path.join(process.cwd(), 'docs', 'hypothesis-test-results');

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = path.join(dir, `test-${new Date().toISOString().split('T')[0]}.txt`);
    fs.writeFileSync(filename, report);

    console.log(`\n✅ Report saved to: ${filename}`);

  } catch (error) {
    console.error('❌ Hypothesis test failed:', error);
    process.exit(1);
  }
}

main();
