#!/usr/bin/env tsx

/**
 * Google Ads Budget Monitor
 *
 * Monitors campaign spend and sends alerts when:
 * - Daily spend exceeds $50 (budget limit)
 * - CPA exceeds $40 (2x target of $20)
 * - Conversion rate drops below 1%
 * - 50+ clicks with zero conversions
 */

import { logger } from '@/lib/logger';

const DAILY_BUDGET = 50;
const TARGET_CPA = 20;
const MAX_CPA = 40;
const MIN_CONVERSION_RATE = 0.01;
const ZERO_CONVERSION_CLICK_THRESHOLD = 50;

interface CampaignData {
  campaignName: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  date: string;
}

interface Alert {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  campaignName?: string;
  metric?: string;
  value?: number;
  threshold?: number;
}

async function fetchCampaignData(): Promise<CampaignData[]> {
  // In production, this would call Google Ads API
  // For now, return empty array - data will be added once Google Ads is connected

  // Example API call structure:
  // const response = await fetch(`https://googleads.googleapis.com/v15/customers/${customerId}/googleAds:searchStream`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${accessToken}`,
  //     'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     query: `
  //       SELECT
  //         campaign.name,
  //         metrics.impressions,
  //         metrics.clicks,
  //         metrics.conversions,
  //         metrics.cost_micros
  //       FROM campaign
  //       WHERE segments.date = TODAY
  //       AND campaign.name CONTAINS 'H1B'
  //     `
  //   })
  // });

  return [];
}

async function fetchPostHogConversions(): Promise<{ [campaignName: string]: number }> {
  // In production, query PostHog API for conversion counts
  // Example:
  // const response = await fetch('https://app.posthog.com/api/projects/:project_id/insights/trend/', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     events: [{ id: 'signup_completed', name: 'signup_completed', type: 'events' }],
  //     properties: [{ key: 'utm_source', value: 'google' }],
  //     date_from: 'dStart',
  //     date_to: 'dEnd',
  //   })
  // });

  return {
    'H1B RSU Tax Calculator': 0,
    'TN Visa Stock Tax': 0,
    'Cross Border Tax Tool': 0,
  };
}

function analyzeCampaignData(campaigns: CampaignData[]): Alert[] {
  const alerts: Alert[] = [];

  // Calculate total daily spend
  const totalSpend = campaigns.reduce((sum, c) => sum + c.cost, 0);

  if (totalSpend > DAILY_BUDGET) {
    alerts.push({
      severity: 'CRITICAL',
      message: `Daily spend exceeded budget: $${totalSpend.toFixed(2)} > $${DAILY_BUDGET}`,
      metric: 'daily_spend',
      value: totalSpend,
      threshold: DAILY_BUDGET,
    });
  } else if (totalSpend > DAILY_BUDGET * 0.9) {
    alerts.push({
      severity: 'WARNING',
      message: `Daily spend approaching budget: $${totalSpend.toFixed(2)} (${((totalSpend / DAILY_BUDGET) * 100).toFixed(1)}% of $${DAILY_BUDGET})`,
      metric: 'daily_spend',
      value: totalSpend,
      threshold: DAILY_BUDGET,
    });
  }

  // Analyze each campaign
  campaigns.forEach(campaign => {
    const ctr = campaign.clicks / Math.max(campaign.impressions, 1);
    const conversionRate = campaign.conversions / Math.max(campaign.clicks, 1);
    const cpa = campaign.cost / Math.max(campaign.conversions, 1);

    // Check CPA
    if (campaign.conversions > 0 && cpa > MAX_CPA) {
      alerts.push({
        severity: 'CRITICAL',
        message: `High CPA for "${campaign.campaignName}": $${cpa.toFixed(2)} > $${MAX_CPA} (target: $${TARGET_CPA})`,
        campaignName: campaign.campaignName,
        metric: 'cpa',
        value: cpa,
        threshold: MAX_CPA,
      });
    } else if (campaign.conversions > 0 && cpa > TARGET_CPA) {
      alerts.push({
        severity: 'WARNING',
        message: `CPA above target for "${campaign.campaignName}": $${cpa.toFixed(2)} > $${TARGET_CPA}`,
        campaignName: campaign.campaignName,
        metric: 'cpa',
        value: cpa,
        threshold: TARGET_CPA,
      });
    }

    // Check conversion rate
    if (campaign.clicks > 20 && conversionRate < MIN_CONVERSION_RATE) {
      alerts.push({
        severity: 'WARNING',
        message: `Low conversion rate for "${campaign.campaignName}": ${(conversionRate * 100).toFixed(2)}% < ${(MIN_CONVERSION_RATE * 100).toFixed(2)}%`,
        campaignName: campaign.campaignName,
        metric: 'conversion_rate',
        value: conversionRate,
        threshold: MIN_CONVERSION_RATE,
      });
    }

    // Check for zero conversions with significant spend
    if (campaign.clicks > ZERO_CONVERSION_CLICK_THRESHOLD && campaign.conversions === 0) {
      alerts.push({
        severity: 'CRITICAL',
        message: `Zero conversions for "${campaign.campaignName}" despite ${campaign.clicks} clicks (cost: $${campaign.cost.toFixed(2)})`,
        campaignName: campaign.campaignName,
        metric: 'conversions',
        value: 0,
        threshold: 1,
      });
    }

    // Check CTR
    if (campaign.impressions > 100 && ctr < 0.02) {
      alerts.push({
        severity: 'WARNING',
        message: `Low CTR for "${campaign.campaignName}": ${(ctr * 100).toFixed(2)}% (improve ad copy or pause campaign)`,
        campaignName: campaign.campaignName,
        metric: 'ctr',
        value: ctr,
        threshold: 0.02,
      });
    }
  });

  return alerts;
}

async function sendAlert(alert: Alert) {
  // In production, send to Slack, email, or other notification service
  logger.warn('Google Ads Alert', {
    severity: alert.severity,
    message: alert.message,
    campaignName: alert.campaignName,
    metric: alert.metric,
    value: alert.value,
    threshold: alert.threshold,
  });

  // Example Slack webhook:
  // if (alert.severity === 'CRITICAL') {
  //   await fetch(process.env.SLACK_WEBHOOK_URL!, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       text: `🚨 Google Ads Alert: ${alert.message}`,
  //       attachments: [
  //         {
  //           color: 'danger',
  //           fields: [
  //             { title: 'Campaign', value: alert.campaignName, short: true },
  //             { title: 'Metric', value: alert.metric, short: true },
  //             { title: 'Current Value', value: String(alert.value), short: true },
  //             { title: 'Threshold', value: String(alert.threshold), short: true },
  //           ]
  //         }
  //       ]
  //     })
  //   });
  // }
}

async function generateDailyReport(campaigns: CampaignData[], alerts: Alert[]) {
  const totalSpend = campaigns.reduce((sum, c) => sum + c.cost, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgCPA = totalConversions > 0 ? totalSpend / totalConversions : 0;

  const report = {
    date: new Date().toISOString().split('T')[0],
    summary: {
      totalSpend,
      totalClicks,
      totalConversions,
      avgCPA,
      budgetUtilization: (totalSpend / DAILY_BUDGET) * 100,
    },
    campaigns: campaigns.map(c => ({
      name: c.campaignName,
      spend: c.cost,
      clicks: c.clicks,
      conversions: c.conversions,
      cpa: c.conversions > 0 ? c.cost / c.conversions : 0,
      ctr: c.clicks / Math.max(c.impressions, 1),
      conversionRate: c.conversions / Math.max(c.clicks, 1),
    })),
    alerts: alerts.map(a => ({
      severity: a.severity,
      message: a.message,
    })),
  };

  logger.info('Google Ads Daily Report', report);

  return report;
}

async function main() {
  try {
    logger.info('Starting Google Ads budget monitor...');

    // Fetch campaign data
    const campaigns = await fetchCampaignData();

    // Fetch PostHog conversion data for cross-validation
    const posthogConversions = await fetchPostHogConversions();

    // Analyze data and generate alerts
    const alerts = analyzeCampaignData(campaigns);

    // Send critical alerts immediately
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
    for (const alert of criticalAlerts) {
      await sendAlert(alert);
    }

    // Generate daily report
    const report = await generateDailyReport(campaigns, alerts);

    // Log summary
    console.log('\n' + '='.repeat(60));
    console.log('GOOGLE ADS BUDGET MONITOR - DAILY REPORT');
    console.log('='.repeat(60));
    console.log(`Date: ${report.date}`);
    console.log(`\nBudget: $${DAILY_BUDGET.toFixed(2)}/day`);
    console.log(`Spend: $${report.summary.totalSpend.toFixed(2)} (${report.summary.budgetUtilization.toFixed(1)}%)`);
    console.log(`\nClicks: ${report.summary.totalClicks}`);
    console.log(`Conversions: ${report.summary.totalConversions}`);
    console.log(`Avg CPA: $${report.summary.avgCPA.toFixed(2)} (target: $${TARGET_CPA.toFixed(2)})`);

    if (alerts.length > 0) {
      console.log(`\n⚠️  ${alerts.length} Alert(s):`);
      alerts.forEach((alert, i) => {
        const icon = alert.severity === 'CRITICAL' ? '🚨' : alert.severity === 'WARNING' ? '⚠️' : 'ℹ️';
        console.log(`${i + 1}. ${icon} ${alert.message}`);
      });
    } else {
      console.log('\n✓ No alerts - all metrics within target');
    }

    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    logger.error('Error in budget monitor:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { fetchCampaignData, analyzeCampaignData, sendAlert, generateDailyReport };
