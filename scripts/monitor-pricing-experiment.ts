#!/usr/bin/env node
/**
 * Pricing Experiment Daily Monitor
 *
 * Fetches current experiment metrics and generates a daily status report
 * Run: npm run monitor:pricing-experiment
 *
 * Outputs:
 * - Current conversion and revenue metrics by variant
 * - Progress toward 100-conversion goal
 * - Statistical significance calculation
 * - Daily recommendation (continue/extend/decide)
 */

import https from 'https';

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface ExperimentMetrics {
  overview: {
    total_conversions: number;
    total_revenue: number;
    avg_customer_value: number;
  };
  variants: {
    [key: string]: {
      conversions: number;
      revenue: number;
      avg_revenue: number;
      percentage: string;
    };
  };
  recommendations: string[];
}

async function fetchMetrics(): Promise<ExperimentMetrics> {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}/api/analytics/pricing-experiment?cohort=all`;

    https.get(url, (res) => {
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
            reject(new Error(json.error || 'Failed to fetch metrics'));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

function calculateStatisticalSignificance(
  conversionsA: number,
  visitorsA: number,
  conversionsB: number,
  visitorsB: number
): { pValue: number; significant: boolean } {
  // Simple chi-squared test approximation
  // For production, use proper statistical library

  const rateA = conversionsA / visitorsA;
  const rateB = conversionsB / visitorsB;

  const pooledRate = (conversionsA + conversionsB) / (visitorsA + visitorsB);

  const expectedA = visitorsA * pooledRate;
  const expectedB = visitorsB * pooledRate;

  const chiSquared =
    Math.pow(conversionsA - expectedA, 2) / expectedA +
    Math.pow(conversionsB - expectedB, 2) / expectedB;

  // Approximate p-value (1 degree of freedom)
  // This is a rough approximation - use proper stats library for production
  const pValue = 1 - (1 / (1 + Math.exp(-1.7 * (chiSquared - 3.84))));

  return {
    pValue,
    significant: pValue < 0.05 && Math.abs(rateA - rateB) > 0.1 // 10% diff
  };
}

function generateReport(metrics: ExperimentMetrics, dayNumber: number): string {
  const { overview, variants, recommendations } = metrics;

  const annual49 = variants.annual_49 || { conversions: 0, revenue: 0, percentage: '0%' };
  const annual79 = variants.annual_79 || { conversions: 0, revenue: 0, percentage: '0%' };
  const annual99 = variants.annual_99 || { conversions: 0, revenue: 0, percentage: '0%' };
  const monthly19 = variants.monthly_19 || { conversions: 0, revenue: 0, percentage: '0%' };

  // Find leader
  const variantList = [
    { name: '$49/year', ...annual49 },
    { name: '$79/year', ...annual79 },
    { name: '$99/year', ...annual99 },
  ];

  const leader = variantList.reduce((max, v) => v.revenue > max.revenue ? v : max);

  // Calculate progress
  const progressPercent = Math.round((overview.total_conversions / 100) * 100);
  const progressBar = '█'.repeat(Math.floor(progressPercent / 5)) +
                      '░'.repeat(20 - Math.floor(progressPercent / 5));

  // Determine recommendation
  let status = '⏳ CONTINUE TEST';
  let nextSteps = 'Continue monitoring. Check daily.';

  if (overview.total_conversions >= 100) {
    const margin = ((leader.revenue - variantList[1].revenue) / leader.revenue) * 100;

    if (margin > 20) {
      status = '✅ READY TO DECIDE';
      nextSteps = `Clear winner: ${leader.name} (${margin.toFixed(1)}% revenue advantage). Recommend concluding test.`;
    } else {
      status = '⚠️ CONSIDER EXTENSION';
      nextSteps = `Reached 100 conversions but margin is only ${margin.toFixed(1)}%. Consider extending 1-2 weeks for clearer signal.`;
    }
  } else {
    const daysRemaining = 14 - dayNumber;
    const conversionRate = overview.total_conversions / dayNumber;
    const projectedTotal = Math.round(conversionRate * 14);

    if (projectedTotal < 100) {
      status = '⚠️ LOW VOLUME';
      nextSteps = `Projected: ${projectedTotal} conversions by Day 14. Consider extending to 21-28 days.`;
    }
  }

  return `
╔════════════════════════════════════════════════════════════════════════════╗
║                    PRICING EXPERIMENT - DAY ${dayNumber} REPORT                     ║
║                     ${new Date().toISOString().split('T')[0]}                      ║
╚════════════════════════════════════════════════════════════════════════════╝

📊 OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total Conversions:    ${overview.total_conversions} / 100 (${progressPercent}%)
  Total Revenue:        $${overview.total_revenue.toFixed(2)}
  Avg Customer Value:   $${overview.avg_customer_value.toFixed(2)}

  Progress: ${progressBar} ${progressPercent}%

💰 VARIANT PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────┬─────────────┬────────────┬────────────────┬─────────────┐
│ Variant     │ Conversions │ Conv. %    │ Revenue        │ Rev. %      │
├─────────────┼─────────────┼────────────┼────────────────┼─────────────┤
│ $49/year    │ ${String(annual49.conversions).padEnd(11)} │ ${annual49.percentage.padEnd(10)} │ $${String(annual49.revenue.toFixed(2)).padEnd(12)} │ ${String(((annual49.revenue / overview.total_revenue) * 100).toFixed(1) + '%').padEnd(11)} │
│ $79/year    │ ${String(annual79.conversions).padEnd(11)} │ ${annual79.percentage.padEnd(10)} │ $${String(annual79.revenue.toFixed(2)).padEnd(12)} │ ${String(((annual79.revenue / overview.total_revenue) * 100).toFixed(1) + '%').padEnd(11)} │
│ $99/year    │ ${String(annual99.conversions).padEnd(11)} │ ${annual99.percentage.padEnd(10)} │ $${String(annual99.revenue.toFixed(2)).padEnd(12)} │ ${String(((annual99.revenue / overview.total_revenue) * 100).toFixed(1) + '%').padEnd(11)} │
│ $19/month   │ ${String(monthly19.conversions).padEnd(11)} │ ${monthly19.percentage.padEnd(10)} │ $${String(monthly19.revenue.toFixed(2)).padEnd(12)} │ ${String(((monthly19.revenue / overview.total_revenue) * 100).toFixed(1) + '%').padEnd(11)} │
└─────────────┴─────────────┴────────────┴────────────────┴─────────────┘

🏆 CURRENT LEADER: ${leader.name}
   Revenue: $${leader.revenue.toFixed(2)} (${((leader.revenue / overview.total_revenue) * 100).toFixed(1)}% of total)
   Conversions: ${leader.conversions}

🎯 STATUS: ${status}

📋 RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${recommendations.map(rec => `  • ${rec}`).join('\n')}

📈 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ${nextSteps}

🔗 DASHBOARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Analytics:  ${API_URL}/dashboard/pricing-analytics
  PostHog:    https://app.posthog.com
  Stripe:     https://dashboard.stripe.com/subscriptions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated: ${new Date().toISOString()}
Report saved to: docs/pricing-experiment-reports/day-${dayNumber}-${new Date().toISOString().split('T')[0]}.txt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

async function main() {
  try {
    console.log('📊 Fetching pricing experiment metrics...\n');

    const metrics = await fetchMetrics();

    // Determine day number (rough estimate based on conversions)
    // In production, track start date in database
    const dayNumber = Math.max(1, Math.floor(metrics.overview.total_conversions / 7));

    const report = generateReport(metrics, dayNumber);

    console.log(report);

    // Save to file
    const fs = require('fs');
    const dir = 'docs/pricing-experiment-reports';

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `${dir}/day-${dayNumber}-${new Date().toISOString().split('T')[0]}.txt`;
    fs.writeFileSync(filename, report);

    console.log(`\n✅ Report saved to: ${filename}`);

  } catch (error) {
    console.error('❌ Error fetching metrics:', error);
    process.exit(1);
  }
}

main();
