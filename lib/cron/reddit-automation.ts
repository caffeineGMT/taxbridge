#!/usr/bin/env tsx
import 'dotenv/config';
import * as cron from 'node-cron';
import { RedditKeywordMonitor } from '../reddit/keyword-monitor';
import { RedditCommentGenerator } from '../reddit/comment-generator';
import { RedditCommentPoster } from '../reddit/comment-poster';
import { RedditKarmaTracker } from '../reddit/karma-tracker';

console.log('🤖 Reddit Automation Scheduler Started');
console.log('='.repeat(60));

// 1. Monitor keywords every 2 hours
cron.schedule('0 */2 * * *', async () => {
  console.log(`\n[${new Date().toISOString()}] Running keyword monitoring...`);

  const monitor = new RedditKeywordMonitor();
  const generator = new RedditCommentGenerator();

  try {
    const newPosts = await monitor.monitorKeywords();

    if (newPosts.length > 0) {
      console.log(`Found ${newPosts.length} new posts, generating drafts...`);
      const postIds = newPosts.map(p => p.redditId);
      await generator.createCommentDrafts(postIds);
      console.log('✅ Drafts created for review');
    }
  } catch (error) {
    console.error('❌ Error in keyword monitoring:', error);
  } finally {
    monitor.close();
    generator.close();
  }
});

// 2. Update metrics daily at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log(`\n[${new Date().toISOString()}] Updating metrics...`);

  const poster = new RedditCommentPoster();
  const karmaTracker = new RedditKarmaTracker();

  try {
    await poster.updateMetrics();
    await karmaTracker.trackKarma();
    console.log('✅ Metrics updated');
  } catch (error) {
    console.error('❌ Error updating metrics:', error);
  } finally {
    poster.close();
    karmaTracker.close();
  }
});

// 3. Check for approved comments to post every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log(`\n[${new Date().toISOString()}] Checking for approved comments...`);

  const poster = new RedditCommentPoster();

  try {
    const posted = await poster.postApprovedComments();
    if (posted > 0) {
      console.log(`✅ Posted ${posted} comments`);
    }
  } catch (error) {
    console.error('❌ Error posting comments:', error);
  } finally {
    poster.close();
  }
});

console.log('\n📅 Scheduled jobs:');
console.log('• Keyword monitoring: Every 2 hours');
console.log('• Metrics update: Daily at 9 AM');
console.log('• Post approved comments: Every 6 hours');
console.log('\nPress Ctrl+C to stop...\n');

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping Reddit automation scheduler...');
  process.exit(0);
});
