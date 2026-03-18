#!/usr/bin/env tsx
/**
 * Update campaign statistics
 *
 * Recalculates campaign metrics based on current prospect statuses
 */

import { updateCampaignStats, getCampaignStats, getDashboardSummary } from '../lib/db/queries/enterprise-prospects';

async function updateStats() {
  console.log('📊 Updating campaign statistics...\n');

  // Update stats for campaign 1 (default)
  const campaignId = 1;
  updateCampaignStats(campaignId);

  // Get updated campaign data
  const campaign = getCampaignStats(campaignId);

  if (!campaign) {
    console.error('❌ Campaign not found');
    return;
  }

  console.log(`Campaign: ${campaign.campaign_name}\n`);

  // Display metrics
  console.log('📈 Current Metrics:');
  console.log(`  Total Prospects: ${campaign.total_prospects}`);
  console.log(`  Contacted: ${campaign.total_sent} (${Math.round((campaign.total_sent / campaign.total_prospects) * 100)}%)`);
  console.log(`  Opened: ${campaign.total_opened} (${campaign.total_sent > 0 ? Math.round((campaign.total_opened / campaign.total_sent) * 100) : 0}%)`);
  console.log(`  Clicked: ${campaign.total_clicked} (${campaign.total_sent > 0 ? Math.round((campaign.total_clicked / campaign.total_sent) * 100) : 0}%)`);
  console.log(`  Replied: ${campaign.total_replied} (${campaign.total_sent > 0 ? Math.round((campaign.total_replied / campaign.total_sent) * 100) : 0}%)`);
  console.log(`  Demos: ${campaign.total_demos}`);
  console.log(`  Trials: ${campaign.total_trials}`);
  console.log(`  Closed Won: ${campaign.total_closed_won}\n`);

  // Goal tracking
  console.log('🎯 Goal Progress:');
  const replyRate = campaign.total_sent > 0 ? (campaign.total_replied / campaign.total_sent) * 100 : 0;
  console.log(`  Reply Rate: ${replyRate.toFixed(1)}% / ${campaign.goal_reply_rate}% ${replyRate >= campaign.goal_reply_rate ? '✅' : '⏳'}`);
  console.log(`  Demos: ${campaign.total_demos} / ${campaign.goal_demo_count} ${campaign.total_demos >= campaign.goal_demo_count ? '✅' : '⏳'}`);
  console.log(`  Trials: ${campaign.total_trials} / ${campaign.goal_trial_count} ${campaign.total_trials >= campaign.goal_trial_count ? '✅' : '⏳'}`);
  console.log(`  Customers: ${campaign.total_closed_won} / ${campaign.goal_closed_won_count} ${campaign.total_closed_won >= campaign.goal_closed_won_count ? '✅' : '⏳'}\n`);

  // Revenue
  const currentARR = campaign.total_closed_won * 100000; // $100K per customer
  console.log('💰 Revenue:');
  console.log(`  Current ARR: $${currentARR.toLocaleString()}`);
  console.log(`  Goal ARR: $${campaign.goal_arr.toLocaleString()}`);
  console.log(`  Progress: ${Math.round((currentARR / campaign.goal_arr) * 100)}%\n`);

  // Dashboard summary
  const summary = getDashboardSummary();
  console.log('📋 Pipeline Breakdown:');
  console.log(`  Target: ${summary.total_prospects - summary.contacted}`);
  console.log(`  Contacted: ${summary.contacted}`);
  console.log(`  Replied: ${summary.replied}`);
  console.log(`  Demo Scheduled: ${summary.demo_scheduled}`);
  console.log(`  Trial Started: ${summary.trial_started}`);
  console.log(`  Closed Won: ${summary.closed_won}`);
  console.log(`  Closed Lost: ${summary.closed_lost}\n`);

  console.log('✅ Stats updated successfully!');
  console.log(`📊 View dashboard: http://localhost:3000/admin/outreach\n`);
}

updateStats().catch(console.error);
