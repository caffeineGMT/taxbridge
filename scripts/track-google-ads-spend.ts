/**
 * Google Ads Daily Spend Tracker
 *
 * Manually track daily Google Ads spend in PostHog for ROI calculation
 *
 * Usage:
 *   npm run track-ads-spend 16.50 2026-03-19
 *   npm run track-ads-spend 16.50  (uses today's date)
 */

import { PostHog } from 'posthog-node';

const posthog = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
  {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
  }
);

async function trackDailySpend(spend: number, date: string, campaign?: string) {
  if (!spend || spend <= 0) {
    console.error('❌ Error: Spend must be a positive number');
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.error('❌ Error: NEXT_PUBLIC_POSTHOG_KEY not set in environment');
    process.exit(1);
  }

  try {
    posthog.capture({
      distinctId: 'google-ads-system',
      event: 'google_ads_daily_spend',
      properties: {
        spend,
        date,
        campaign: campaign || 'all-campaigns',
        currency: 'USD',
        source: 'manual-entry',
        timestamp: new Date().toISOString(),
      },
    });

    await posthog.shutdown();

    console.log('✅ Successfully tracked Google Ads spend:');
    console.log(`   Date:     ${date}`);
    console.log(`   Spend:    $${spend.toFixed(2)}`);
    console.log(`   Campaign: ${campaign || 'all-campaigns'}`);
    console.log('');
    console.log('📊 View in PostHog dashboard: https://app.posthog.com');
    console.log('');

  } catch (error) {
    console.error('❌ Error tracking spend:', error);
    process.exit(1);
  }
}

// Parse command-line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('');
  console.log('📊 Google Ads Daily Spend Tracker');
  console.log('');
  console.log('Usage:');
  console.log('  npm run track-ads-spend <spend> [date] [campaign]');
  console.log('');
  console.log('Examples:');
  console.log('  npm run track-ads-spend 16.50');
  console.log('  npm run track-ads-spend 16.50 2026-03-19');
  console.log('  npm run track-ads-spend 12.30 2026-03-19 h1b-rsu-tax');
  console.log('');
  console.log('Arguments:');
  console.log('  spend     Daily ad spend in USD (required)');
  console.log('  date      Date in YYYY-MM-DD format (optional, defaults to today)');
  console.log('  campaign  Campaign name (optional, defaults to "all-campaigns")');
  console.log('');
  process.exit(0);
}

const spend = parseFloat(args[0]);
const date = args[1] || new Date().toISOString().split('T')[0];
const campaign = args[2];

if (isNaN(spend)) {
  console.error('❌ Error: Invalid spend amount. Must be a number.');
  console.error('   Example: npm run track-ads-spend 16.50');
  process.exit(1);
}

// Validate date format (YYYY-MM-DD)
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error('❌ Error: Invalid date format. Use YYYY-MM-DD.');
  console.error('   Example: npm run track-ads-spend 16.50 2026-03-19');
  process.exit(1);
}

trackDailySpend(spend, date, campaign);
