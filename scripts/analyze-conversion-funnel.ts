/**
 * Conversion Funnel Drop-Off Analyzer
 *
 * Analyzes PostHog funnel data to identify conversion bottlenecks and generate
 * data-driven optimization recommendations.
 *
 * Usage: npx tsx scripts/analyze-conversion-funnel.ts
 */

import posthog from 'posthog-js';

interface FunnelStep {
  event: string;
  name: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
  dropOffCount: number;
}

interface FunnelAnalysis {
  overallConversionRate: number;
  biggestDropOffs: Array<{
    step: string;
    dropOffRate: number;
    dropOffCount: number;
    priority: 'P0' | 'P1' | 'P2';
    recommendations: string[];
  }>;
  quickWins: string[];
  projectedImpact: {
    currentMRR: number;
    projectedMRR: number;
    improvementPercent: number;
  };
}

/**
 * Funnel steps configuration
 */
const FUNNEL_STEPS = [
  { event: 'calculator_page_viewed', name: 'Calculator View' },
  { event: 'roi_calculation_viewed', name: 'Calculator Completed' },
  { event: 'signup_button_clicked', name: 'Signup Started' },
  { event: 'signup_completed', name: 'Signup Completed' },
  { event: 'pricing_page_viewed', name: 'Pricing Page Viewed' },
  { event: 'checkout_started', name: 'Checkout Started' },
  { event: 'subscription_activated', name: 'Payment Completed' },
];

/**
 * Analyze funnel drop-off points
 */
export async function analyzeFunnel(
  data: FunnelStep[]
): Promise<FunnelAnalysis> {
  const totalVisitors = data[0]?.count || 0;
  const totalConversions = data[data.length - 1]?.count || 0;
  const overallConversionRate = totalVisitors > 0
    ? (totalConversions / totalVisitors) * 100
    : 0;

  // Identify biggest drop-offs
  const dropOffs = data
    .filter(step => step.dropOffRate > 0)
    .map(step => ({
      step: step.name,
      dropOffRate: step.dropOffRate,
      dropOffCount: step.dropOffCount,
      priority: getPriority(step.dropOffRate),
      recommendations: getRecommendations(step.name, step.dropOffRate),
    }))
    .sort((a, b) => b.dropOffRate - a.dropOffRate);

  // Generate quick wins
  const quickWins = generateQuickWins(dropOffs);

  // Project revenue impact
  const projectedImpact = calculateImpact(
    overallConversionRate,
    dropOffs,
    totalVisitors
  );

  return {
    overallConversionRate,
    biggestDropOffs: dropOffs.slice(0, 3), // Top 3 drop-offs
    quickWins,
    projectedImpact,
  };
}

/**
 * Determine priority based on drop-off rate
 */
function getPriority(dropOffRate: number): 'P0' | 'P1' | 'P2' {
  if (dropOffRate >= 25) return 'P0'; // Critical
  if (dropOffRate >= 15) return 'P1'; // High
  return 'P2'; // Medium
}

/**
 * Get step-specific recommendations
 */
function getRecommendations(stepName: string, dropOffRate: number): string[] {
  const recommendations: Record<string, string[]> = {
    'Calculator View': [
      'Reduce input fields from 8 to 5 (salary, RSU value, province only)',
      'Add pre-filled example values to reduce friction',
      'Implement progressive disclosure: "Advanced Options" toggle',
    ],
    'Calculator Completed': [
      'Make results more visually compelling with charts',
      'Add "Save Your Calculation" CTA immediately after results',
      'Show social proof: "Join 1,247 users who saved their results"',
      'Add urgency: "Your calculation expires in 24 hours"',
    ],
    'Signup Started': [
      'Reduce signup form fields (email only for magic link)',
      'Remove password requirement (use passwordless login)',
      'Embed signup directly on results page (no modal)',
      'Add trust badges: "We never spam. 256-bit encryption."',
    ],
    'Signup Completed': [
      'Send immediate welcome email with next steps',
      'Show onboarding checklist to guide users',
      'Highlight key features in dashboard',
    ],
    'Pricing Page Viewed': [
      'Add testimonials with specific savings amounts',
      'Reframe price as investment: "$49 to save $2,500+"',
      'Add urgency timer: "Launch pricing ends in 48 hours"',
      'Display trust badges: SOC 2, CPA-reviewed, 30-day guarantee',
      'Show company logos: "Trusted by engineers at Google, Meta, Amazon"',
    ],
    'Checkout Started': [
      'Simplify Stripe checkout (pre-fill email)',
      'Add progress indicator: "Step 2 of 3"',
      'Show security badges on checkout page',
      'Enable Google Pay / Apple Pay for faster checkout',
      'Add exit-intent popup with discount code',
    ],
    'Payment Completed': [
      'Monitor Stripe error logs for payment failures',
      'Add payment retry flow for failed transactions',
      'Send abandoned checkout email after 1 hour',
    ],
  };

  return recommendations[stepName] || [
    'Analyze user session recordings to identify friction points',
    'Conduct user interviews to understand hesitation',
    'A/B test simplified vs detailed flow',
  ];
}

/**
 * Generate quick win recommendations
 */
function generateQuickWins(
  dropOffs: Array<{ step: string; dropOffRate: number; recommendations: string[] }>
): string[] {
  const quickWins: string[] = [];

  dropOffs.forEach(dropOff => {
    if (dropOff.step === 'Calculator Completed' && dropOff.dropOffRate > 20) {
      quickWins.push(
        '🚀 Add "Save Your Calculation" button immediately after results (24hr implementation)'
      );
    }
    if (dropOff.step === 'Signup Started' && dropOff.dropOffRate > 20) {
      quickWins.push(
        '🚀 Switch to magic link (passwordless) signup (8hr implementation)'
      );
    }
    if (dropOff.step === 'Pricing Page Viewed' && dropOff.dropOffRate > 15) {
      quickWins.push(
        '🚀 Add 3 testimonials with savings amounts to pricing page (4hr implementation)'
      );
      quickWins.push(
        '🚀 Add urgency timer: "Launch pricing ends March 31" (2hr implementation)'
      );
    }
    if (dropOff.step === 'Checkout Started' && dropOff.dropOffRate > 10) {
      quickWins.push(
        '🚀 Add exit-intent popup with 20% discount code (6hr implementation)'
      );
    }
  });

  return quickWins.slice(0, 5); // Top 5 quick wins
}

/**
 * Calculate projected revenue impact
 */
function calculateImpact(
  currentConversionRate: number,
  dropOffs: Array<{ dropOffRate: number }>,
  monthlyVisitors: number
): {
  currentMRR: number;
  projectedMRR: number;
  improvementPercent: number;
} {
  const avgPrice = 49; // Pro plan annual price
  const currentConversions = (monthlyVisitors * currentConversionRate) / 100;
  const currentMRR = currentConversions * avgPrice;

  // Conservative estimate: Reduce top 3 drop-offs by 30%
  const conservativeImprovement = dropOffs
    .slice(0, 3)
    .reduce((sum, d) => sum + d.dropOffRate * 0.3, 0);

  const projectedConversionRate = currentConversionRate + conservativeImprovement;
  const projectedConversions = (monthlyVisitors * projectedConversionRate) / 100;
  const projectedMRR = projectedConversions * avgPrice;

  const improvementPercent = ((projectedMRR - currentMRR) / currentMRR) * 100;

  return {
    currentMRR: Math.round(currentMRR),
    projectedMRR: Math.round(projectedMRR),
    improvementPercent: Math.round(improvementPercent),
  };
}

/**
 * Format analysis results for console output
 */
function formatAnalysisReport(analysis: FunnelAnalysis): string {
  const report: string[] = [];

  report.push('\n═══════════════════════════════════════════════════════');
  report.push('  CONVERSION FUNNEL ANALYSIS REPORT');
  report.push('═══════════════════════════════════════════════════════\n');

  report.push(`📊 Overall Conversion Rate: ${analysis.overallConversionRate.toFixed(2)}%`);
  report.push(`💰 Current MRR: $${analysis.projectedImpact.currentMRR.toLocaleString()}`);
  report.push(`🎯 Projected MRR: $${analysis.projectedImpact.projectedMRR.toLocaleString()}`);
  report.push(`📈 Improvement: +${analysis.projectedImpact.improvementPercent}%\n`);

  report.push('─────────────────────────────────────────────────────\n');
  report.push('🔴 BIGGEST DROP-OFF POINTS:\n');

  analysis.biggestDropOffs.forEach((dropOff, index) => {
    report.push(`${index + 1}. ${dropOff.step} [${dropOff.priority}]`);
    report.push(`   Drop-off: ${dropOff.dropOffRate.toFixed(1)}% (${dropOff.dropOffCount.toLocaleString()} users)\n`);
    report.push('   Recommendations:');
    dropOff.recommendations.forEach(rec => {
      report.push(`   • ${rec}`);
    });
    report.push('');
  });

  report.push('─────────────────────────────────────────────────────\n');
  report.push('⚡ QUICK WINS (High Impact, Low Effort):\n');

  analysis.quickWins.forEach((win, index) => {
    report.push(`${index + 1}. ${win}`);
  });

  report.push('\n═══════════════════════════════════════════════════════\n');

  return report.join('\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Analyzing conversion funnel...\n');

  // Mock data - Replace with actual PostHog API call in production
  const mockFunnelData: FunnelStep[] = [
    { event: 'calculator_page_viewed', name: 'Calculator View', count: 1000, conversionRate: 100, dropOffRate: 0, dropOffCount: 0 },
    { event: 'roi_calculation_viewed', name: 'Calculator Completed', count: 720, conversionRate: 72, dropOffRate: 28, dropOffCount: 280 },
    { event: 'signup_button_clicked', name: 'Signup Started', count: 450, conversionRate: 45, dropOffRate: 27, dropOffCount: 270 },
    { event: 'signup_completed', name: 'Signup Completed', count: 380, conversionRate: 38, dropOffRate: 7, dropOffCount: 70 },
    { event: 'pricing_page_viewed', name: 'Pricing Page Viewed', count: 280, conversionRate: 28, dropOffRate: 10, dropOffCount: 100 },
    { event: 'checkout_started', name: 'Checkout Started', count: 120, conversionRate: 12, dropOffRate: 16, dropOffCount: 160 },
    { event: 'subscription_activated', name: 'Payment Completed', count: 85, conversionRate: 8.5, dropOffRate: 3.5, dropOffCount: 35 },
  ];

  const analysis = await analyzeFunnel(mockFunnelData);
  const report = formatAnalysisReport(analysis);

  console.log(report);

  // Save report to file
  const fs = require('fs');
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `./docs/CONVERSION_ANALYSIS_${timestamp}.md`;

  const markdownReport = `# Conversion Funnel Analysis Report
**Generated:** ${new Date().toISOString()}

## Key Metrics

- **Overall Conversion Rate:** ${analysis.overallConversionRate.toFixed(2)}%
- **Current MRR:** $${analysis.projectedImpact.currentMRR.toLocaleString()}
- **Projected MRR:** $${analysis.projectedImpact.projectedMRR.toLocaleString()}
- **Projected Improvement:** +${analysis.projectedImpact.improvementPercent}%

## Biggest Drop-Off Points

${analysis.biggestDropOffs.map((dropOff, i) => `
### ${i + 1}. ${dropOff.step} [${dropOff.priority}]

- **Drop-off Rate:** ${dropOff.dropOffRate.toFixed(1)}%
- **Users Lost:** ${dropOff.dropOffCount.toLocaleString()}

**Recommendations:**
${dropOff.recommendations.map(rec => `- ${rec}`).join('\n')}
`).join('\n')}

## Quick Wins

${analysis.quickWins.map((win, i) => `${i + 1}. ${win}`).join('\n')}

## Next Steps

1. Implement top 3 quick wins within next 7 days
2. Run A/B tests on biggest drop-off points
3. Re-analyze funnel in 14 days to measure impact
4. Target 5%+ conversion lift (from ${analysis.overallConversionRate.toFixed(1)}% to ${(analysis.overallConversionRate * 1.05).toFixed(1)}%)
`;

  fs.writeFileSync(filename, markdownReport);
  console.log(`\n✅ Report saved to: ${filename}`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { analyzeFunnel, FunnelAnalysis, FunnelStep };
