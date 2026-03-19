/**
 * Pricing Experiment Analysis Script
 *
 * Run this after the 2-week experiment (April 3, 2026) to analyze results
 * and determine the winning price point.
 *
 * Usage: npm run pricing:analyze
 *
 * Analyzes:
 * - Conversion rates by variant
 * - Revenue per visitor
 * - Statistical significance
 * - Recommendations
 */

console.log('═══════════════════════════════════════════════════════');
console.log('  TaxBridge Pricing Experiment Analysis');
console.log('  Experiment: annual_pricing_test_march_2026');
console.log('═══════════════════════════════════════════════════════\n');

async function analyzePricingExperiment() {
  console.log('📊 Fetching experiment data from PostHog and Stripe...\n');

  // Fetch data from monitoring API
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const response = await fetch(`${apiUrl}/api/admin/pricing-experiment-stats`, {
    headers: {
      // Add auth headers if needed
    },
  });

  if (!response.ok) {
    console.error(`❌ Failed to fetch stats: ${response.status} ${response.statusText}`);
    console.error('   Make sure you\'re logged in as an admin');
    process.exit(1);
  }

  const stats = await response.json();

  // Display results
  console.log('📈 EXPERIMENT RESULTS\n');
  console.log(`Duration: ${stats.experiment.start} to ${stats.experiment.end}`);
  console.log(`Status: ${stats.experiment.status}\n`);

  console.log('VARIANT PERFORMANCE:');
  console.log('─'.repeat(90));
  console.log(
    `${'Variant'.padEnd(12)} | ${'Price'.padEnd(8)} | ${'Exposures'.padEnd(10)} | ${'Conversions'.padEnd(12)} | ${'Conv Rate'.padEnd(10)} | ${'Revenue'.padEnd(10)}`
  );
  console.log('─'.repeat(90));

  const variants = stats.variants.sort((a: any, b: any) => b.rate - a.rate);

  variants.forEach((v: any) => {
    const convRate = `${v.rate.toFixed(2)}%`;
    const convRateWithCI = `${v.rate.toFixed(2)}% (${v.lower.toFixed(1)}-${v.upper.toFixed(1)}%)`;
    const revenue = `$${v.revenue.toLocaleString()}`;

    console.log(
      `${v.variant.padEnd(12)} | ${('$' + v.price).padEnd(8)} | ${v.exposures.toString().padEnd(10)} | ${v.conversions.toString().padEnd(12)} | ${convRateWithCI.padEnd(10)} | ${revenue.padEnd(10)}`
    );
  });

  console.log('─'.repeat(90));
  console.log(`${'TOTAL'.padEnd(12)} | ${'-'.padEnd(8)} | ${stats.totals.exposures.toString().padEnd(10)} | ${stats.totals.conversions.toString().padEnd(12)} | ${stats.totals.avgConversionRate.toFixed(2)}% | $${stats.totals.revenue.toLocaleString()}\n`);

  // Statistical significance
  console.log('\n🔬 STATISTICAL SIGNIFICANCE:\n');

  const comparisons = stats.comparisons;
  console.log('annual_39 vs annual_79 (current price):');
  console.log(`  p-value: ${comparisons.annual_39_vs_79.pValue.toFixed(4)}`);
  console.log(`  Significant: ${comparisons.annual_39_vs_79.isSignificant ? '✅ YES' : '❌ NO'}`);
  console.log(`  Effect size: ${comparisons.annual_39_vs_79.effect}\n`);

  console.log('annual_39 vs annual_49:');
  console.log(`  p-value: ${comparisons.annual_39_vs_49.pValue.toFixed(4)}`);
  console.log(`  Significant: ${comparisons.annual_39_vs_49.isSignificant ? '✅ YES' : '❌ NO'}`);
  console.log(`  Effect size: ${comparisons.annual_39_vs_49.effect}\n`);

  // Recommendation
  console.log('\n💡 RECOMMENDATION:\n');
  console.log(`Winner by conversion rate: ${stats.winner.byConversionRate || 'No clear winner'}`);
  console.log(`Winner by revenue: ${stats.winner.byRevenue || 'No clear winner'}`);
  console.log(`Confidence: ${stats.winner.confidence.toFixed(1)}%`);
  console.log(`\n${stats.winner.recommendation}\n`);

  // Revenue projections
  console.log('\n📈 ANNUAL REVENUE PROJECTIONS (extrapolated):\n');

  const monthlyVisitors = 1000; // Adjust based on actual traffic
  const annualVisitors = monthlyVisitors * 12;

  console.log(`Assuming ${monthlyVisitors.toLocaleString()} visitors/month (${annualVisitors.toLocaleString()}/year):\n`);

  variants.forEach((v: any) => {
    const annualConversions = Math.round((v.rate / 100) * annualVisitors);
    const annualRevenue = annualConversions * v.price;
    const liftVs79 = ((annualRevenue - (variants.find((x: any) => x.variant === 'annual_79')?.revenue || 0)) / (variants.find((x: any) => x.variant === 'annual_79')?.revenue || 1)) * 100;

    console.log(`${v.variant}: ${annualConversions.toLocaleString()} customers × $${v.price} = $${annualRevenue.toLocaleString()}/year (${liftVs79 > 0 ? '+' : ''}${liftVs79.toFixed(0)}% vs $79)`);
  });

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Analysis complete! See above for recommendations.');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('📝 Next steps:');
  console.log('  1. Review winning variant');
  console.log('  2. Update pricing page to remove losers');
  console.log('  3. Announce pricing to existing users (grandfather early adopters)');
  console.log('  4. Document results in docs/PRICING_EXPERIMENT_RESULTS_MARCH_2026.md\n');
}

analyzePricingExperiment().catch((error) => {
  console.error('\n❌ Analysis failed:');
  console.error(error.message);
  process.exit(1);
});
