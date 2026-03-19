/**
 * Automated Experiment Results Analyzer
 *
 * Calculates statistical significance and generates rollout recommendations
 * for Free Tier Optimization Experiment
 */

interface VariantData {
  exposures: number;
  conversions: number;
}

interface AnalysisResult {
  variant: string;
  conversionRate: number;
  zScore: number;
  pValue: number;
  isSignificant: boolean;
  relativeLift: number;
  confidence: '95%' | '90%' | 'Not significant';
  recommendation: string;
}

/**
 * Calculate Z-score for two proportions
 * https://www.statology.org/z-test-two-proportions/
 */
function calculateZScore(
  p1: number, // Baseline conversion rate
  p2: number, // Test conversion rate
  n1: number, // Baseline sample size
  n2: number  // Test sample size
): number {
  // Pooled proportion
  const pPool = (p1 * n1 + p2 * n2) / (n1 + n2);

  // Standard error
  const se = Math.sqrt(pPool * (1 - pPool) * (1/n1 + 1/n2));

  // Z-score
  return (p2 - p1) / se;
}

/**
 * Calculate p-value from z-score (two-tailed test)
 */
function calculatePValue(zScore: number): number {
  // Approximation using standard normal distribution
  const z = Math.abs(zScore);

  // Using complementary error function approximation
  const t = 1 / (1 + 0.2316419 * z);
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  // Two-tailed test
  return 2 * prob;
}

/**
 * Analyze experiment results and generate recommendations
 */
export function analyzeExperiment(
  baseline: VariantData,
  variantA: VariantData,
  variantC: VariantData
): {
  variantA: AnalysisResult;
  variantC: AnalysisResult;
  winner: 'baseline' | 'variantA' | 'variantC';
  recommendation: string;
} {
  const baselineRate = baseline.conversions / baseline.exposures;

  // Analyze Variant A (Limited 5)
  const variantARate = variantA.conversions / variantA.exposures;
  const zScoreA = calculateZScore(baselineRate, variantARate, baseline.exposures, variantA.exposures);
  const pValueA = calculatePValue(zScoreA);
  const relativeLiftA = ((variantARate - baselineRate) / baselineRate) * 100;

  const resultA: AnalysisResult = {
    variant: 'limited_5',
    conversionRate: variantARate * 100,
    zScore: zScoreA,
    pValue: pValueA,
    isSignificant: pValueA < 0.05,
    relativeLift: relativeLiftA,
    confidence: pValueA < 0.05 ? '95%' : pValueA < 0.10 ? '90%' : 'Not significant',
    recommendation: '',
  };

  // Analyze Variant C (Unlimited Gated)
  const variantCRate = variantC.conversions / variantC.exposures;
  const zScoreC = calculateZScore(baselineRate, variantCRate, baseline.exposures, variantC.exposures);
  const pValueC = calculatePValue(zScoreC);
  const relativeLiftC = ((variantCRate - baselineRate) / baselineRate) * 100;

  const resultC: AnalysisResult = {
    variant: 'unlimited_gated',
    conversionRate: variantCRate * 100,
    zScore: zScoreC,
    pValue: pValueC,
    isSignificant: pValueC < 0.05,
    relativeLift: relativeLiftC,
    confidence: pValueC < 0.05 ? '95%' : pValueC < 0.10 ? '90%' : 'Not significant',
    recommendation: '',
  };

  // Determine winner
  let winner: 'baseline' | 'variantA' | 'variantC' = 'baseline';
  let recommendation = '';

  const rates = [
    { name: 'baseline', rate: baselineRate, significant: true },
    { name: 'variantA', rate: variantARate, significant: resultA.isSignificant },
    { name: 'variantC', rate: variantCRate, significant: resultC.isSignificant },
  ];

  // Find highest conversion rate among statistically significant variants
  const significantRates = rates.filter(r => r.significant);
  const best = significantRates.reduce((prev, curr) =>
    curr.rate > prev.rate ? curr : prev
  );

  winner = best.name as any;

  // Generate recommendations
  if (winner === 'baseline') {
    recommendation = `Keep current configuration (10 RSU entries). Neither test variant showed statistically significant improvement over baseline (${(baselineRate * 100).toFixed(2)}% conversion).`;
    resultA.recommendation = `Variant A (5 entries) did not significantly outperform baseline. ${resultA.isSignificant ? `Performance was ${relativeLiftA > 0 ? 'better' : 'worse'} by ${Math.abs(relativeLiftA).toFixed(1)}%` : 'Not statistically significant'}.`;
    resultC.recommendation = `Variant C (unlimited) did not significantly outperform baseline. ${resultC.isSignificant ? `Performance was ${relativeLiftC > 0 ? 'better' : 'worse'} by ${Math.abs(relativeLiftC).toFixed(1)}%` : 'Not statistically significant'}.`;
  } else if (winner === 'variantA') {
    recommendation = `🏆 Roll out Variant A (5 RSU entries) - showed ${relativeLiftA.toFixed(1)}% conversion lift with ${resultA.confidence} confidence. Update lib/free-tier-limits.ts to set default to 'limited_5'.`;
    resultA.recommendation = `WINNER - Implement this variant. Expected impact: ${relativeLiftA > 0 ? '+' : ''}${relativeLiftA.toFixed(1)}% conversion lift.`;
    resultC.recommendation = `Did not win. ${resultC.isSignificant ? `Performed ${relativeLiftC > 0 ? 'better' : 'worse'} than baseline by ${Math.abs(relativeLiftC).toFixed(1)}%` : 'Not statistically significant'}.`;
  } else {
    recommendation = `🏆 Roll out Variant C (unlimited with gating) - showed ${relativeLiftC.toFixed(1)}% conversion lift with ${resultC.confidence} confidence. Update lib/free-tier-limits.ts to set default to 'unlimited_gated'. Add 50-entry soft cap to prevent abuse.`;
    resultC.recommendation = `WINNER - Implement this variant. Expected impact: ${relativeLiftC > 0 ? '+' : ''}${relativeLiftC.toFixed(1)}% conversion lift. IMPORTANT: Add abuse prevention (50-entry soft cap).`;
    resultA.recommendation = `Did not win. ${resultA.isSignificant ? `Performed ${relativeLiftA > 0 ? 'better' : 'worse'} than baseline by ${Math.abs(relativeLiftA).toFixed(1)}%` : 'Not statistically significant'}.`;
  }

  return {
    variantA: resultA,
    variantC: resultC,
    winner,
    recommendation,
  };
}

/**
 * Generate formatted report from experiment data
 */
export function generateReport(
  experimentData: {
    limited_5: VariantData;
    limited_10: VariantData;
    unlimited_gated: VariantData;
  }
): string {
  const analysis = analyzeExperiment(
    experimentData.limited_10, // Baseline
    experimentData.limited_5,  // Variant A
    experimentData.unlimited_gated // Variant C
  );

  const report = `
# Free Tier Optimization Experiment - Results

**Experiment Date:** ${new Date().toISOString().split('T')[0]}
**Total Exposures:** ${experimentData.limited_5.exposures + experimentData.limited_10.exposures + experimentData.unlimited_gated.exposures}
**Winner:** ${analysis.winner === 'baseline' ? 'Baseline (10 entries)' : analysis.winner === 'variantA' ? 'Variant A (5 entries)' : 'Variant C (unlimited gated)'}

---

## 📊 Executive Summary

${analysis.recommendation}

---

## 🏆 Variant Performance

### Variant A: Limited 5 Entries
- **Exposures:** ${experimentData.limited_5.exposures}
- **Conversions:** ${experimentData.limited_5.conversions}
- **Conversion Rate:** ${analysis.variantA.conversionRate.toFixed(2)}%
- **Lift vs Baseline:** ${analysis.variantA.relativeLift > 0 ? '+' : ''}${analysis.variantA.relativeLift.toFixed(1)}%
- **Statistical Significance:** ${analysis.variantA.isSignificant ? `✅ YES (p=${analysis.variantA.pValue.toFixed(4)})` : `❌ NO (p=${analysis.variantA.pValue.toFixed(4)})`}
- **Confidence:** ${analysis.variantA.confidence}

**Recommendation:** ${analysis.variantA.recommendation}

---

### Variant B: Limited 10 Entries (BASELINE)
- **Exposures:** ${experimentData.limited_10.exposures}
- **Conversions:** ${experimentData.limited_10.conversions}
- **Conversion Rate:** ${((experimentData.limited_10.conversions / experimentData.limited_10.exposures) * 100).toFixed(2)}%
- **Baseline metric**

---

### Variant C: Unlimited with Feature Gating
- **Exposures:** ${experimentData.unlimited_gated.exposures}
- **Conversions:** ${experimentData.unlimited_gated.conversions}
- **Conversion Rate:** ${analysis.variantC.conversionRate.toFixed(2)}%
- **Lift vs Baseline:** ${analysis.variantC.relativeLift > 0 ? '+' : ''}${analysis.variantC.relativeLift.toFixed(1)}%
- **Statistical Significance:** ${analysis.variantC.isSignificant ? `✅ YES (p=${analysis.variantC.pValue.toFixed(4)})` : `❌ NO (p=${analysis.variantC.pValue.toFixed(4)})`}
- **Confidence:** ${analysis.variantC.confidence}

**Recommendation:** ${analysis.variantC.recommendation}

---

## 🔧 Implementation Steps

${analysis.winner !== 'baseline' ? `
1. Update \`lib/free-tier-limits.ts\`:
   \`\`\`typescript
   const DEFAULT_FREE_TIER: FreeTierVariant = '${analysis.winner === 'variantA' ? 'limited_5' : 'unlimited_gated'}';
   \`\`\`

2. Deploy to production

3. Monitor conversion rate for next 30 days

4. Update pricing page copy to reflect new limit

${analysis.winner === 'variantC' ? '5. Add 50-entry soft cap to prevent abuse\n' : ''}
` : `
No code changes needed - continue with current 10-entry limit.

Focus optimization efforts on other conversion levers:
- Pricing ($29 vs $49 vs $79)
- Messaging (value prop headlines)
- Onboarding flow
`}

---

**Analysis completed:** ${new Date().toISOString()}
`;

  return report;
}

/**
 * API endpoint to generate analysis report
 */
export async function GET() {
  try {
    // Fetch experiment data
    const response = await fetch('/api/analytics/conversion-experiments');
    const data = await response.json();

    // Aggregate by free tier variant
    const variantData: Record<string, VariantData> = {
      limited_5: { exposures: 0, conversions: 0 },
      limited_10: { exposures: 0, conversions: 0 },
      unlimited_gated: { exposures: 0, conversions: 0 },
    };

    Object.values(data.experiments).forEach((exp: any) => {
      const variant = exp.free_tier_variant;
      if (variantData[variant]) {
        variantData[variant].exposures += exp.metrics.exposures;
        variantData[variant].conversions += exp.metrics.paid;
      }
    });

    // Generate report
    const report = generateReport(variantData as any);

    return new Response(report, {
      headers: { 'Content-Type': 'text/markdown' },
    });
  } catch (error) {
    return new Response('Error generating report', { status: 500 });
  }
}
