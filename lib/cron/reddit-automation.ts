#!/usr/bin/env tsx
import 'dotenv/config';
import * as cron from 'node-cron';
import { RedditKeywordMonitor } from '../reddit/keyword-monitor';
import { RedditCommentGenerator } from '../reddit/comment-generator';
import { RedditCommentPoster } from '../reddit/comment-poster';
import { RedditKarmaTracker } from '../reddit/karma-tracker';
import { logger } from '@/lib/logger';

logger.info('🤖 Reddit Automation Scheduler Started');
logger.info('='.repeat(60));

// 1. Monitor keywords every 2 hours
cron.schedule('0 */2 * * *', async () => {
  logger.info(`\n[${new Date().toISOString()}] Running keyword monitoring...`);

  const monitor = new RedditKeywordMonitor();
  const generator = new RedditCommentGenerator();

  try {
    const newPosts = await monitor.monitorKeywords();

    if (newPosts.length > 0) {
      logger.info(`Found ${newPosts.length} new posts, generating drafts...`);
      const postIds = newPosts.map(p => p.redditId);
      await generator.createCommentDrafts(postIds);
      logger.info('✅ Drafts created for review');
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
  logger.info(`\n[${new Date().toISOString()}] Updating metrics...`);

  const poster = new RedditCommentPoster();
  const karmaTracker = new RedditKarmaTracker();

  try {
    await poster.updateMetrics();
    await karmaTracker.trackKarma();
    logger.info('✅ Metrics updated');
  } catch (error) {
    console.error('❌ Error updating metrics:', error);
  } finally {
    poster.close();
    karmaTracker.close();
  }
});

// 3. Check for approved comments to post every 6 hours
cron.schedule('0 */6 * * *', async () => {
  logger.info(`\n[${new Date().toISOString()}] Checking for approved comments...`);

  const poster = new RedditCommentPoster();

  try {
    const posted = await poster.postApprovedComments();
    if (posted > 0) {
      logger.info(`✅ Posted ${posted} comments`);
    }
  } catch (error) {
    console.error('❌ Error posting comments:', error);
  } finally {
    poster.close();
  }
});

logger.info('\n📅 Scheduled jobs:');
logger.info('• Keyword monitoring: Every 2 hours');
logger.info('• Metrics update: Daily at 9 AM');
logger.info('• Post approved comments: Every 6 hours');
logger.info('\nPress Ctrl+C to stop...\n');

// Keep the process alive
process.on('SIGINT', () => {
  logger.info('\n\n👋 Stopping Reddit automation scheduler...');
  process.exit(0);
});
