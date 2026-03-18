#!/usr/bin/env tsx

/**
 * Update engagement metrics for a community post
 * Usage: npm run launch:update-metrics <POST_ID>
 */

import { CommunityPostTracker } from '../../lib/community-posting/tracker';
import readline from 'readline';

const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('❌ Error: Missing required argument\n');
  console.log('Usage: npm run launch:update-metrics <POST_ID>');
  console.log('\nExample:');
  console.log('  npm run launch:update-metrics reddit-pfc\n');
  process.exit(1);
}

const postId = args[0];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function main() {
  const tracker = new CommunityPostTracker();

  // Get the post
  const post = tracker.getPost(postId);
  if (!post) {
    console.error(`❌ Error: Post with ID "${postId}" not found\n`);
    console.log('Available post IDs:');
    const allPosts = tracker.getPostsByStatus('posted');
    allPosts.forEach(p => {
      console.log(`  - ${p.id} (${p.platform} - ${p.community})`);
    });
    tracker.close();
    rl.close();
    process.exit(1);
  }

  console.log(`📊 Updating metrics for: ${post.platform} - ${post.community}\n`);
  console.log(`Current metrics:`);
  console.log(`  Upvotes: ${post.upvotes || 0}`);
  console.log(`  Comments: ${post.comments || 0}`);
  console.log(`  Impressions: ${post.impressions || 0}`);
  console.log(`  Engagements: ${post.engagements || 0}`);
  console.log(`  Clicks: ${post.clicks || 0}`);
  console.log(`  Conversions: ${post.conversions || 0}`);
  console.log(`  Revenue: $${post.revenue || 0}\n`);

  // Prompt for new metrics
  const metrics: any = {};

  const upvotes = await question(`Upvotes (current: ${post.upvotes || 0}): `);
  if (upvotes) metrics.upvotes = parseInt(upvotes);

  const comments = await question(`Comments (current: ${post.comments || 0}): `);
  if (comments) metrics.comments = parseInt(comments);

  const impressions = await question(`Impressions (current: ${post.impressions || 0}): `);
  if (impressions) metrics.impressions = parseInt(impressions);

  const engagements = await question(`Engagements (current: ${post.engagements || 0}): `);
  if (engagements) metrics.engagements = parseInt(engagements);

  const clicks = await question(`Clicks (current: ${post.clicks || 0}): `);
  if (clicks) metrics.clicks = parseInt(clicks);

  const conversions = await question(`Conversions (current: ${post.conversions || 0}): `);
  if (conversions) metrics.conversions = parseInt(conversions);

  const revenue = await question(`Revenue $ (current: ${post.revenue || 0}): `);
  if (revenue) metrics.revenue = parseFloat(revenue);

  // Update metrics
  if (Object.keys(metrics).length > 0) {
    tracker.updateEngagement(postId, metrics);
    console.log('\n✅ Metrics updated successfully!\n');

    // Show updated post
    const updatedPost = tracker.getPost(postId);
    console.log(`Updated metrics:`);
    console.log(`  Upvotes: ${updatedPost?.upvotes || 0}`);
    console.log(`  Comments: ${updatedPost?.comments || 0}`);
    console.log(`  Impressions: ${updatedPost?.impressions || 0}`);
    console.log(`  Engagements: ${updatedPost?.engagements || 0}`);
    console.log(`  Clicks: ${updatedPost?.clicks || 0}`);
    console.log(`  Conversions: ${updatedPost?.conversions || 0}`);
    console.log(`  Revenue: $${updatedPost?.revenue || 0}\n`);
  } else {
    console.log('\n⚠️  No metrics updated (all fields empty)\n');
  }

  // Show summary stats
  const stats = tracker.getSummaryStats();
  console.log('📈 Overall Launch Metrics:');
  console.log(`  Total Upvotes: ${stats.totalUpvotes}`);
  console.log(`  Total Comments: ${stats.totalComments}`);
  console.log(`  Total Clicks: ${stats.totalClicks}`);
  console.log(`  Total Conversions: ${stats.totalConversions}`);
  console.log(`  Total Revenue: $${stats.totalRevenue.toFixed(2)}\n`);

  tracker.close();
  rl.close();
}

main().catch(console.error);
