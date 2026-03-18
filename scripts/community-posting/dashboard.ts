#!/usr/bin/env tsx

/**
 * Launch Day Dashboard - Real-time metrics and status
 * Usage: npm run launch:dashboard
 */

import { CommunityPostTracker } from '../../lib/community-posting/tracker';

function formatTime(timeStr: string): string {
  return timeStr || 'N/A';
}

function formatMetric(value: number | undefined | null): string {
  return value?.toString() || '0';
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'posted': return '✅';
    case 'pending': return '⏳';
    case 'failed': return '❌';
    default: return '❓';
  }
}

function printProgressBar(current: number, total: number, width: number = 30): string {
  const percentage = (current / total) * 100;
  const filled = Math.floor((current / total) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${current}/${total} (${percentage.toFixed(0)}%)`;
}

async function main() {
  const tracker = new CommunityPostTracker();

  console.clear();
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 TAXBRIDGE PRODUCT HUNT LAUNCH - COMMUNITY POSTING DASHBOARD');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Summary stats
  const stats = tracker.getSummaryStats();

  console.log('📊 OVERALL METRICS\n');
  console.log(`Posts: ${printProgressBar(stats.postedPosts, stats.totalPosts)}`);
  console.log(`Pending Responses: ${stats.pendingResponses}\n`);

  console.log('Engagement:');
  console.log(`  👍 Upvotes: ${stats.totalUpvotes}`);
  console.log(`  💬 Comments: ${stats.totalComments}`);
  console.log(`  👁️  Impressions: ${stats.totalImpressions}`);
  console.log(`  🤝 Engagements: ${stats.totalEngagements}`);
  console.log(`  🔗 Clicks: ${stats.totalClicks}`);
  console.log(`  ✨ Conversions: ${stats.totalConversions}`);
  console.log(`  💰 Revenue: $${stats.totalRevenue.toFixed(2)}\n`);

  // Platform breakdown
  console.log('───────────────────────────────────────────────────────────────\n');
  console.log('📱 PLATFORM BREAKDOWN\n');

  const platformBreakdown = tracker.getPlatformBreakdown() as any[];
  platformBreakdown.forEach(platform => {
    console.log(`${platform.platform}:`);
    console.log(`  Posts: ${platform.posted_count}/${platform.post_count}`);
    console.log(`  Upvotes: ${platform.total_upvotes || 0}`);
    console.log(`  Comments: ${platform.total_comments || 0}`);
    console.log(`  Clicks: ${platform.total_clicks || 0}`);
    console.log(`  Conversions: ${platform.total_conversions || 0}`);
    console.log(`  Revenue: $${(platform.total_revenue || 0).toFixed(2)}\n`);
  });

  // Individual post status
  console.log('───────────────────────────────────────────────────────────────\n');
  console.log('📝 POST STATUS\n');

  const allPosts = tracker.getAllPosts();
  allPosts.forEach(post => {
    console.log(`${getStatusEmoji(post.status)} ${post.platform} - ${post.community}`);
    console.log(`   ID: ${post.id}`);
    console.log(`   Scheduled: ${post.scheduled_time} PST`);
    if (post.posted_at) {
      console.log(`   Posted: ${formatTime(post.posted_at)}`);
      console.log(`   URL: ${post.post_url || 'N/A'}`);
      console.log(`   Metrics: ${formatMetric(post.upvotes)}↑ ${formatMetric(post.comments)}💬 ${formatMetric(post.clicks)}🔗`);
    }
    console.log('');
  });

  // Pending responses
  const pendingResponses = tracker.getPendingResponses();
  if (pendingResponses.length > 0) {
    console.log('───────────────────────────────────────────────────────────────\n');
    console.log('⚠️  PENDING RESPONSES (RESPOND WITHIN 10 MINUTES!)\n');

    pendingResponses.forEach(response => {
      console.log(`Post: ${response.post_id}`);
      console.log(`User: ${response.username}`);
      console.log(`Comment: ${response.comment_text.substring(0, 100)}...`);
      console.log(`Time: ${response.created_at}`);
      console.log('');
    });
  }

  // Success criteria check
  console.log('───────────────────────────────────────────────────────────────\n');
  console.log('🎯 SUCCESS CRITERIA\n');

  const criteria = [
    { label: 'All 15 posts published', target: 15, current: stats.postedPosts, met: stats.postedPosts >= 15 },
    { label: '200+ total upvotes', target: 200, current: stats.totalUpvotes, met: stats.totalUpvotes >= 200 },
    { label: '500+ UTM-tagged clicks', target: 500, current: stats.totalClicks, met: stats.totalClicks >= 500 },
    { label: '50+ comments/discussions', target: 50, current: stats.totalComments, met: stats.totalComments >= 50 },
    { label: '10+ conversions', target: 10, current: stats.totalConversions, met: stats.totalConversions >= 10 }
  ];

  criteria.forEach(c => {
    const status = c.met ? '✅' : '⏳';
    const progress = `${c.current}/${c.target}`;
    console.log(`${status} ${c.label.padEnd(30)} ${progress}`);
  });

  const metCriteria = criteria.filter(c => c.met).length;
  const totalCriteria = criteria.length;
  console.log(`\nOverall: ${metCriteria}/${totalCriteria} criteria met\n`);

  console.log('───────────────────────────────────────────────────────────────\n');
  console.log('💡 QUICK ACTIONS\n');
  console.log('Mark post as posted:');
  console.log('  npm run launch:mark-posted <POST_ID> <POST_URL>\n');
  console.log('Update metrics:');
  console.log('  npm run launch:update-metrics <POST_ID>\n');
  console.log('Check pending responses:');
  console.log('  npm run launch:check-responses\n');
  console.log('Refresh dashboard:');
  console.log('  npm run launch:dashboard\n');

  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`Last updated: ${new Date().toLocaleString()}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  tracker.close();
}

main().catch(console.error);
