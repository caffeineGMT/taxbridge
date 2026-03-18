#!/usr/bin/env tsx

/**
 * Mark a community post as posted
 * Usage: npm run launch:mark-posted <POST_ID> <POST_URL>
 */

import { CommunityPostTracker } from '../../lib/community-posting/tracker';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Error: Missing required arguments\n');
  console.log('Usage: npm run launch:mark-posted <POST_ID> <POST_URL>');
  console.log('\nExample:');
  console.log('  npm run launch:mark-posted reddit-pfc https://reddit.com/r/PersonalFinanceCanada/comments/xyz123\n');
  process.exit(1);
}

const [postId, postUrl] = args;

async function main() {
  const tracker = new CommunityPostTracker();

  // Get the post
  const post = tracker.getPost(postId);
  if (!post) {
    console.error(`❌ Error: Post with ID "${postId}" not found\n`);
    console.log('Available post IDs:');
    const allPosts = tracker.getAllPosts();
    allPosts.forEach(p => {
      console.log(`  - ${p.id} (${p.platform} - ${p.community})`);
    });
    tracker.close();
    process.exit(1);
  }

  // Mark as posted
  tracker.markAsPosted(postId, postUrl);

  console.log('✅ Post marked as posted!\n');
  console.log(`Post ID: ${postId}`);
  console.log(`Platform: ${post.platform}`);
  console.log(`Community: ${post.community}`);
  console.log(`Post URL: ${postUrl}`);
  console.log(`Posted at: ${new Date().toISOString()}\n`);

  console.log('📊 Next steps:');
  console.log('1. Set a 10-minute timer to check for comments');
  console.log('2. Respond to ALL comments within 10 minutes');
  console.log(`3. Update metrics hourly: npm run launch:update-metrics ${postId}`);
  console.log('4. Track engagement in PostHog dashboard\n');

  // Show updated stats
  const stats = tracker.getSummaryStats();
  console.log(`Progress: ${stats.postedPosts}/${stats.totalPosts} posts completed\n`);

  tracker.close();
}

main().catch(console.error);
