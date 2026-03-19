/**
 * PostHog UX Friction Monitoring Script
 *
 * Monitors key UX friction metrics and alerts when issues are detected.
 *
 * Usage:
 *   npm run monitor:ux-friction
 *   npm run monitor:ux-friction -- --verbose
 *   npm run monitor:ux-friction -- --slack-webhook=https://hooks.slack.com/...
 *
 * Schedule with cron:
 *   0 9 * * * cd /path/to/project && npm run monitor:ux-friction --slack-webhook=...
 */

import { PostHogAPI } from '@/lib/analytics/posthog-api';
import { logger } from '@/lib/logger';

interface FrictionMetric {
  name: string;
  description: string;
  currentValue: number;
  threshold: number;
  severity: 'P0' | 'P1' | 'P2';
  status: 'PASS' | 'WARN' | 'FAIL';
  issueUrl?: string;
}

interface MonitoringReport {
  timestamp: string;
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  metrics: FrictionMetric[];
  recentFixes: {
    issue: string;
    fixedAt: string;
    impactMeasured: boolean;
  }[];
  actionItems: string[];
}

/**
 * Fetch rage click events from PostHog
 */
async function fetchRageClickEvents(lastNDays: number = 7): Promise<number> {
  const posthog = new PostHogAPI();

  // Query PostHog for rage click events
  const rageClicks = await posthog.query({
    kind: 'EventsQuery',
    select: ['*'],
    where: [
      'event = "$rageclick"',
      `timestamp >= now() - interval ${lastNDays} day`,
    ],
  });

  return rageClicks.results.length;
}

/**
 * Calculate mobile calculator completion rate
 */
async function fetchMobileCalculatorCompletionRate(): Promise<number> {
  const posthog = new PostHogAPI();

  // Funnel: Mobile users who viewed calculator → completed calculator
  const funnel = await posthog.getFunnelInsight({
    steps: [
      { event: 'calculator_page_viewed', filters: { device_type: 'mobile' } },
      { event: 'tax_calculation_completed', filters: { device_type: 'mobile' } },
    ],
    dateRange: 'last_7_days',
  });

  const completionRate = funnel.steps[1].conversionRate * 100;
  return Math.round(completionRate);
}

/**
 * Calculate pricing page → checkout conversion rate
 */
async function fetchPricingToCheckoutRate(): Promise<number> {
  const posthog = new PostHogAPI();

  const funnel = await posthog.getFunnelInsight({
    steps: [
      { event: 'pricing_page_viewed' },
      { event: 'checkout_started' },
    ],
    dateRange: 'last_7_days',
  });

  const conversionRate = funnel.steps[1].conversionRate * 100;
  return Math.round(conversionRate);
}

/**
 * Fetch session recordings with specific friction patterns
 */
async function fetchFrictionSessionRecordings(): Promise<{
  rageClicks: number;
  mobileAbandonment: number;
  pricingAbandonment: number;
}> {
  const posthog = new PostHogAPI();

  const [rageClicks, mobileAbandonment, pricingAbandonment] = await Promise.all([
    // Rage clicks on calculator button
    posthog.getSessionRecordings({
      filters: {
        events: [{ event: '$rageclick', properties: { element: 'calculate-button' } }],
      },
      dateRange: 'last_7_days',
    }),

    // Mobile users who started calculator but abandoned
    posthog.getSessionRecordings({
      filters: {
        events: [{ event: 'calculator_page_viewed', properties: { device_type: 'mobile' } }],
        duration: { min: 30 }, // Stayed at least 30 seconds
        conversion: false, // Did NOT complete calculator
      },
      dateRange: 'last_7_days',
    }),

    // Users who viewed pricing but didn't start checkout
    posthog.getSessionRecordings({
      filters: {
        events: [{ event: 'pricing_page_viewed' }],
        duration: { min: 60 }, // Stayed at least 1 minute (high intent)
        conversion: false, // Did NOT start checkout
      },
      dateRange: 'last_7_days',
    }),
  ]);

  return {
    rageClicks: rageClicks.length,
    mobileAbandonment: mobileAbandonment.length,
    pricingAbandonment: pricingAbandonment.length,
  };
}

/**
 * Main monitoring function
 */
async function monitorUXFriction(): Promise<MonitoringReport> {
  logger.info('[UX Friction Monitor] Starting analysis...');

  const [
    rageClickCount,
    mobileCompletionRate,
    pricingConversionRate,
    sessionRecordings,
  ] = await Promise.all([
    fetchRageClickEvents(7),
    fetchMobileCalculatorCompletionRate(),
    fetchPricingToCheckoutRate(),
    fetchFrictionSessionRecordings(),
  ]);

  // Define metrics and thresholds
  const metrics: FrictionMetric[] = [
    {
      name: 'Calculator Rage Clicks',
      description: 'Number of rage click events on calculator button (last 7 days)',
      currentValue: rageClickCount,
      threshold: 5, // Alert if >5 rage clicks in 7 days
      severity: 'P0',
      status: rageClickCount <= 5 ? 'PASS' : 'FAIL',
      issueUrl: './docs/GITHUB_ISSUE_001_CALCULATOR_RAGE_CLICKS.md',
    },
    {
      name: 'Mobile Calculator Completion Rate',
      description: 'Percentage of mobile users who complete calculator',
      currentValue: mobileCompletionRate,
      threshold: 50, // Alert if <50%
      severity: 'P0',
      status: mobileCompletionRate >= 50 ? 'PASS' : 'FAIL',
      issueUrl: './docs/GITHUB_ISSUE_002_MOBILE_LAYOUT_BROKEN.md',
    },
    {
      name: 'Pricing → Checkout Conversion',
      description: 'Percentage of pricing page visitors who start checkout',
      currentValue: pricingConversionRate,
      threshold: 15, // Alert if <15%
      severity: 'P1',
      status: pricingConversionRate >= 15 ? 'PASS' : 'WARN',
      issueUrl: './docs/GITHUB_ISSUE_003_PRICING_TRUST_SIGNALS.md',
    },
    {
      name: 'Session Recordings: Rage Clicks',
      description: 'Number of session recordings showing rage click behavior',
      currentValue: sessionRecordings.rageClicks,
      threshold: 3,
      severity: 'P0',
      status: sessionRecordings.rageClicks <= 3 ? 'PASS' : 'FAIL',
    },
    {
      name: 'Session Recordings: Mobile Abandonment',
      description: 'Mobile users who abandoned calculator (>30s session)',
      currentValue: sessionRecordings.mobileAbandonment,
      threshold: 5,
      severity: 'P0',
      status: sessionRecordings.mobileAbandonment <= 5 ? 'PASS' : 'FAIL',
    },
    {
      name: 'Session Recordings: Pricing Abandonment',
      description: 'Users who abandoned pricing page (>60s session)',
      currentValue: sessionRecordings.pricingAbandonment,
      threshold: 10,
      severity: 'P1',
      status: sessionRecordings.pricingAbandonment <= 10 ? 'PASS' : 'WARN',
    },
  ];

  // Determine overall status
  const hasCriticalIssues = metrics.some(m => m.status === 'FAIL');
  const hasWarnings = metrics.some(m => m.status === 'WARN');

  const overallStatus: MonitoringReport['overallStatus'] = hasCriticalIssues
    ? 'CRITICAL'
    : hasWarnings
    ? 'DEGRADED'
    : 'HEALTHY';

  // Generate action items
  const actionItems: string[] = [];

  if (rageClickCount > 5) {
    actionItems.push(
      `🔴 P0: ${rageClickCount} rage clicks detected. Review Issue #001 - Calculator Submit Button.`
    );
  }

  if (mobileCompletionRate < 50) {
    actionItems.push(
      `🔴 P0: Mobile completion rate is ${mobileCompletionRate}% (target: 50%). Review Issue #002 - Mobile Layout.`
    );
  }

  if (pricingConversionRate < 15) {
    actionItems.push(
      `🟠 P1: Pricing conversion is ${pricingConversionRate}% (target: 15%). Review Issue #003 - Trust Signals.`
    );
  }

  if (sessionRecordings.rageClicks > 3) {
    actionItems.push(
      `🔴 Watch ${sessionRecordings.rageClicks} session recordings with rage clicks to identify new issues.`
    );
  }

  if (sessionRecordings.mobileAbandonment > 5) {
    actionItems.push(
      `🔴 Watch ${sessionRecordings.mobileAbandonment} mobile abandonment recordings to verify mobile fix.`
    );
  }

  if (actionItems.length === 0) {
    actionItems.push('✅ All metrics within healthy thresholds. Continue monitoring weekly.');
  }

  // Check recent fixes (placeholder - would query GitHub API or database)
  const recentFixes = [
    // Example:
    // {
    //   issue: '#001 - Calculator Rage Clicks',
    //   fixedAt: '2026-03-20',
    //   impactMeasured: true,
    // },
  ];

  const report: MonitoringReport = {
    timestamp: new Date().toISOString(),
    overallStatus,
    metrics,
    recentFixes,
    actionItems,
  };

  return report;
}

/**
 * Format report for console output
 */
function formatConsoleReport(report: MonitoringReport): void {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 UX Friction Monitoring Report');
  console.log('='.repeat(80));
  console.log(`📅 Timestamp: ${report.timestamp}`);
  console.log(`📊 Overall Status: ${getStatusEmoji(report.overallStatus)} ${report.overallStatus}`);
  console.log('='.repeat(80));

  console.log('\n📈 Metrics:\n');
  report.metrics.forEach((metric) => {
    const statusEmoji = metric.status === 'PASS' ? '✅' : metric.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${statusEmoji} ${metric.name}`);
    console.log(`   ${metric.description}`);
    console.log(`   Current: ${metric.currentValue} | Threshold: ${metric.threshold} | Severity: ${metric.severity}`);
    if (metric.issueUrl) {
      console.log(`   Issue: ${metric.issueUrl}`);
    }
    console.log('');
  });

  if (report.recentFixes.length > 0) {
    console.log('🛠️  Recent Fixes:\n');
    report.recentFixes.forEach((fix) => {
      console.log(`   • ${fix.issue} (fixed: ${fix.fixedAt})`);
      console.log(`     Impact measured: ${fix.impactMeasured ? '✅ Yes' : '⏳ Pending'}`);
    });
    console.log('');
  }

  console.log('📋 Action Items:\n');
  report.actionItems.forEach((item, i) => {
    console.log(`   ${i + 1}. ${item}`);
  });

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Send report to Slack
 */
async function sendSlackAlert(report: MonitoringReport, webhookUrl: string): Promise<void> {
  const color = report.overallStatus === 'HEALTHY' ? '#36a64f' : report.overallStatus === 'DEGRADED' ? '#ff9900' : '#ff0000';

  const failedMetrics = report.metrics.filter(m => m.status === 'FAIL');
  const warnMetrics = report.metrics.filter(m => m.status === 'WARN');

  const slackMessage = {
    text: `UX Friction Monitoring: ${report.overallStatus}`,
    attachments: [
      {
        color,
        title: '🔍 UX Friction Monitoring Report',
        fields: [
          {
            title: 'Overall Status',
            value: `${getStatusEmoji(report.overallStatus)} ${report.overallStatus}`,
            short: true,
          },
          {
            title: 'Timestamp',
            value: new Date(report.timestamp).toLocaleString(),
            short: true,
          },
          {
            title: '❌ Failed Metrics',
            value: failedMetrics.length > 0
              ? failedMetrics.map(m => `• ${m.name}: ${m.currentValue} (threshold: ${m.threshold})`).join('\n')
              : 'None',
          },
          {
            title: '⚠️ Warning Metrics',
            value: warnMetrics.length > 0
              ? warnMetrics.map(m => `• ${m.name}: ${m.currentValue} (threshold: ${m.threshold})`).join('\n')
              : 'None',
          },
          {
            title: '📋 Action Items',
            value: report.actionItems.join('\n'),
          },
        ],
        footer: 'TaxBridge UX Monitoring',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slackMessage),
  });

  logger.info('[UX Friction Monitor] Slack alert sent');
}

/**
 * Save report to file for historical tracking
 */
async function saveReportToFile(report: MonitoringReport): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const reportsDir = path.join(process.cwd(), 'docs', 'ux-monitoring-reports');
  await fs.mkdir(reportsDir, { recursive: true });

  const filename = `report-${new Date(report.timestamp).toISOString().split('T')[0]}.json`;
  const filepath = path.join(reportsDir, filename);

  await fs.writeFile(filepath, JSON.stringify(report, null, 2));

  logger.info(`[UX Friction Monitor] Report saved to ${filepath}`);
}

/**
 * Helper: Get emoji for status
 */
function getStatusEmoji(status: string): string {
  switch (status) {
    case 'HEALTHY':
    case 'PASS':
      return '✅';
    case 'DEGRADED':
    case 'WARN':
      return '⚠️';
    case 'CRITICAL':
    case 'FAIL':
      return '❌';
    default:
      return '❓';
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');
  const slackWebhook = args.find(arg => arg.startsWith('--slack-webhook='))?.split('=')[1];

  try {
    const report = await monitorUXFriction();

    // Always show console report
    formatConsoleReport(report);

    // Save to file for historical tracking
    await saveReportToFile(report);

    // Send Slack alert if webhook provided and status is not healthy
    if (slackWebhook && report.overallStatus !== 'HEALTHY') {
      await sendSlackAlert(report, slackWebhook);
    }

    // Exit with error code if critical issues detected
    if (report.overallStatus === 'CRITICAL') {
      process.exit(1);
    }

  } catch (error) {
    logger.error('[UX Friction Monitor] Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { monitorUXFriction, formatConsoleReport, sendSlackAlert };
