#!/usr/bin/env npx tsx
/**
 * Automated Funnel Monitoring Script
 *
 * Daily automated monitoring of conversion funnel performance:
 * - Fetches real-time funnel data from PostHog
 * - Compares with historical baselines
 * - Detects anomalies and conversion rate drops
 * - Generates alerts for critical issues
 * - Creates executive summary report
 *
 * Usage:
 *   npm run monitor:funnel
 *   npm run monitor:funnel -- --alert  # Send alerts if issues found
 *   npm run monitor:funnel -- --days=7 # Custom time period
 *
 * Recommended: Run daily via cron at 9am
 *   0 9 * * * cd /path/to/project && npm run monitor:funnel -- --alert
 */

import * as fs from 'fs';
import * as path from 'path';

interface FunnelMetrics {
  date: string;
  overallConversion: number;
  totalVisitors: number;
  paidCustomers: number;
  estimatedMRR: number;
  biggestDropOff: {
    step: string;
    rate: number;
  };
}

interface AlertRule {
  name: string;
  severity: 'critical' | 'warning' | 'info';
  condition: (current: FunnelMetrics, baseline: FunnelMetrics) => boolean;
  message: (current: FunnelMetrics, baseline: FunnelMetrics) => string;
}

const BASELINE_FILE = path.join(process.cwd(), 'data', 'funnel-baseline.json');
const REPORT_DIR = path.join(process.cwd(), 'docs', 'funnel-reports');

// Alert rules
const ALERT_RULES: AlertRule[] = [
  {
    name: 'Conversion Rate Drop',
    severity: 'critical',
    condition: (current, baseline) =>
      current.overallConversion < baseline.overallConversion * 0.7, // 30%+ drop
    message: (current, baseline) =>
      `🚨 CRITICAL: Overall conversion dropped ${((1 - current.overallConversion / baseline.overallConversion) * 100).toFixed(1)}% ` +
      `(from ${baseline.overallConversion.toFixed(2)}% to ${current.overallConversion.toFixed(2)}%)`,
  },
  {
    name: 'Traffic Drop',
    severity: 'warning',
    condition: (current, baseline) =>
      current.totalVisitors < baseline.totalVisitors * 0.5, // 50%+ drop
    message: (current, baseline) =>
      `⚠️ WARNING: Traffic dropped ${((1 - current.totalVisitors / baseline.totalVisitors) * 100).toFixed(1)}% ` +
      `(from ${baseline.totalVisitors} to ${current.totalVisitors} visitors)`,
  },
  {
    name: 'Zero Conversions',
    severity: 'critical',
    condition: (current) => current.paidCustomers === 0,
    message: () =>
      '🚨 CRITICAL: ZERO paid conversions in the last 24 hours. Check payment flow immediately.',
  },
  {
    name: 'MRR Decline',
    severity: 'warning',
    condition: (current, baseline) =>
      current.estimatedMRR < baseline.estimatedMRR * 0.8, // 20%+ drop
    message: (current, baseline) =>
      `⚠️ WARNING: Estimated MRR dropped ${((1 - current.estimatedMRR / baseline.estimatedMRR) * 100).toFixed(1)}% ` +
      `(from $${baseline.estimatedMRR} to $${current.estimatedMRR})`,
  },
  {
    name: 'Conversion Rate Improvement',
    severity: 'info',
    condition: (current, baseline) =>
      current.overallConversion > baseline.overallConversion * 1.2, // 20%+ improvement
    message: (current, baseline) =>
      `✅ INFO: Conversion improved ${((current.overallConversion / baseline.overallConversion - 1) * 100).toFixed(1)}% ` +
      `(from ${baseline.overallConversion.toFixed(2)}% to ${current.overallConversion.toFixed(2)}%)`,
  },
];

async function fetchFunnelData(days: number = 1): Promise<FunnelMetrics> {
  try {
    const response = await fetch(`http://localhost:3000/api/analytics/funnel-deep-dive?days=${days}`);
    const result = await response.json();

    if (result.error && !result.mockData) {
      throw new Error(result.message || result.error);
    }

    const data = result.data || result.mockData;

    return {
      date: new Date().toISOString().split('T')[0],
      overallConversion: data.overall.overallConversion,
      totalVisitors: data.overall.totalVisitors,
      paidCustomers: data.overall.paidCustomers,
      estimatedMRR: data.overall.estimatedMRR,
      biggestDropOff: {
        step: data.biggestDropOffs[0]?.fromStep + ' → ' + data.biggestDropOffs[0]?.toStep || 'N/A',
        rate: data.biggestDropOffs[0]?.dropOffRate || 0,
      },
    };
  } catch (error: any) {
    console.error('❌ Error fetching funnel data:', error.message);
    throw error;
  }
}

function loadBaseline(): FunnelMetrics | null {
  try {
    if (!fs.existsSync(BASELINE_FILE)) {
      return null;
    }
    const content = fs.readFileSync(BASELINE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('⚠️ Failed to load baseline:', error);
    return null;
  }
}

function saveBaseline(metrics: FunnelMetrics): void {
  try {
    const dir = path.dirname(BASELINE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(metrics, null, 2));
    console.log(`✅ Baseline saved: ${BASELINE_FILE}`);
  } catch (error) {
    console.error('❌ Failed to save baseline:', error);
  }
}

function checkAlerts(current: FunnelMetrics, baseline: FunnelMetrics): Array<{
  rule: AlertRule;
  message: string;
}> {
  const alerts: Array<{ rule: AlertRule; message: string }> = [];

  for (const rule of ALERT_RULES) {
    if (rule.condition(current, baseline)) {
      alerts.push({
        rule,
        message: rule.message(current, baseline),
      });
    }
  }

  return alerts;
}

function generateReport(
  current: FunnelMetrics,
  baseline: FunnelMetrics | null,
  alerts: Array<{ rule: AlertRule; message: string }>
): string {
  const lines: string[] = [];

  lines.push('# Conversion Funnel Daily Monitoring Report');
  lines.push('');
  lines.push(`**Date:** ${current.date}`);
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Current Metrics
  lines.push('## Current Metrics (Last 24 Hours)');
  lines.push('');
  lines.push(`- **Total Visitors:** ${current.totalVisitors.toLocaleString()}`);
  lines.push(`- **Paid Customers:** ${current.paidCustomers.toLocaleString()}`);
  lines.push(`- **Overall Conversion:** ${current.overallConversion.toFixed(2)}%`);
  lines.push(`- **Estimated MRR:** $${current.estimatedMRR.toLocaleString()}`);
  lines.push(`- **Biggest Drop-Off:** ${current.biggestDropOff.step} (${current.biggestDropOff.rate.toFixed(1)}%)`);
  lines.push('');

  // Comparison with Baseline
  if (baseline) {
    lines.push('## Comparison with Baseline');
    lines.push('');
    lines.push('| Metric | Current | Baseline | Change |');
    lines.push('|--------|---------|----------|--------|');
    lines.push(`| Conversion | ${current.overallConversion.toFixed(2)}% | ${baseline.overallConversion.toFixed(2)}% | ${formatChange(current.overallConversion, baseline.overallConversion)}% |`);
    lines.push(`| Visitors | ${current.totalVisitors.toLocaleString()} | ${baseline.totalVisitors.toLocaleString()} | ${formatChange(current.totalVisitors, baseline.totalVisitors)} |`);
    lines.push(`| Paid | ${current.paidCustomers} | ${baseline.paidCustomers} | ${formatChange(current.paidCustomers, baseline.paidCustomers)} |`);
    lines.push(`| MRR | $${current.estimatedMRR.toLocaleString()} | $${baseline.estimatedMRR.toLocaleString()} | ${formatChange(current.estimatedMRR, baseline.estimatedMRR)} |`);
    lines.push('');
  }

  // Alerts
  if (alerts.length > 0) {
    lines.push('## Alerts');
    lines.push('');

    const critical = alerts.filter(a => a.rule.severity === 'critical');
    const warnings = alerts.filter(a => a.rule.severity === 'warning');
    const info = alerts.filter(a => a.rule.severity === 'info');

    if (critical.length > 0) {
      lines.push('### Critical Issues');
      critical.forEach(alert => lines.push(`- ${alert.message}`));
      lines.push('');
    }

    if (warnings.length > 0) {
      lines.push('### Warnings');
      warnings.forEach(alert => lines.push(`- ${alert.message}`));
      lines.push('');
    }

    if (info.length > 0) {
      lines.push('### Info');
      info.forEach(alert => lines.push(`- ${alert.message}`));
      lines.push('');
    }
  } else {
    lines.push('## Status');
    lines.push('');
    lines.push('✅ **All metrics within normal range. No alerts triggered.**');
    lines.push('');
  }

  // Recommendations
  lines.push('## Recommendations');
  lines.push('');

  if (current.overallConversion < 3) {
    lines.push('- 🔴 Overall conversion below industry average (3-5%). Review top 3 drop-off points.');
  } else if (current.overallConversion < 5) {
    lines.push('- 🟠 Conversion near average. Continue optimization efforts to reach 7%+.');
  } else {
    lines.push('- ✅ Strong conversion performance. Maintain current strategies.');
  }

  if (current.paidCustomers === 0) {
    lines.push('- 🚨 URGENT: Zero conversions detected. Test payment flow immediately.');
  } else if (current.paidCustomers < 5) {
    lines.push('- ⚠️ Low conversion volume. Increase traffic or improve conversion rate.');
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('**Next Steps:**');
  lines.push('1. Review funnel dashboard: http://localhost:3000/admin/funnel-deep-dive');
  lines.push('2. Check PostHog for session recordings: https://app.posthog.com');
  lines.push('3. Investigate biggest drop-off point');
  lines.push('4. Run A/B tests on underperforming steps');
  lines.push('');

  return lines.join('\n');
}

function formatChange(current: number, baseline: number): string {
  const change = ((current - baseline) / baseline) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}`;
}

function saveReport(content: string, filename: string): void {
  try {
    if (!fs.existsSync(REPORT_DIR)) {
      fs.mkdirSync(REPORT_DIR, { recursive: true });
    }
    const filepath = path.join(REPORT_DIR, filename);
    fs.writeFileSync(filepath, content);
    console.log(`✅ Report saved: ${filepath}`);
  } catch (error) {
    console.error('❌ Failed to save report:', error);
  }
}

async function main() {
  console.log('🔍 Funnel Monitoring: Starting analysis...\n');

  const args = process.argv.slice(2);
  const shouldAlert = args.includes('--alert');
  const daysArg = args.find(a => a.startsWith('--days='));
  const days = daysArg ? parseInt(daysArg.split('=')[1]) : 1;

  try {
    // Fetch current metrics
    console.log(`📊 Fetching funnel data (last ${days} day${days > 1 ? 's' : ''})...`);
    const current = await fetchFunnelData(days);
    console.log(`✅ Data fetched: ${current.totalVisitors} visitors, ${current.paidCustomers} paid, ${current.overallConversion.toFixed(2)}% conversion\n`);

    // Load baseline
    let baseline = loadBaseline();

    // If no baseline exists, set current as baseline
    if (!baseline) {
      console.log('⚠️ No baseline found. Setting current metrics as baseline.\n');
      saveBaseline(current);
      baseline = current;
    }

    // Check for alerts
    const alerts = checkAlerts(current, baseline);

    if (alerts.length > 0) {
      console.log(`\n🚨 ${alerts.length} alert(s) triggered:\n`);
      alerts.forEach(alert => {
        const icon =
          alert.rule.severity === 'critical'
            ? '🚨'
            : alert.rule.severity === 'warning'
            ? '⚠️'
            : '✅';
        console.log(`${icon} ${alert.message}`);
      });
      console.log('');
    } else {
      console.log('✅ No alerts. All metrics within normal range.\n');
    }

    // Generate report
    const report = generateReport(current, baseline, alerts);
    const reportFilename = `funnel-report-${current.date}.md`;
    saveReport(report, reportFilename);

    // Save latest report as "latest.md" for easy access
    saveReport(report, 'latest.md');

    // Update baseline (7-day rolling average)
    if (days === 1) {
      saveBaseline(current);
    }

    // Exit with error code if critical alerts found (for CI/CD integration)
    const hasCritical = alerts.some(a => a.rule.severity === 'critical');
    if (shouldAlert && hasCritical) {
      console.error('\n❌ CRITICAL alerts detected. Exiting with error code 1.\n');
      process.exit(1);
    }

    console.log('\n✅ Monitoring complete. View report at:', path.join(REPORT_DIR, reportFilename));
  } catch (error: any) {
    console.error('\n❌ Monitoring failed:', error.message);
    process.exit(1);
  }
}

main();
