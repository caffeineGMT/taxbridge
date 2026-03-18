#!/usr/bin/env tsx
import 'dotenv/config';
import { RedditCommentPoster } from '../lib/reddit/comment-poster';
import { RedditKarmaTracker } from '../lib/reddit/karma-tracker';

async function main() {
  console.log('📊 Reddit Metrics Update');
  console.log('='.repeat(60));

  const poster = new RedditCommentPoster();
  const karmaTracker = new RedditKarmaTracker();

  try {
    console.log('\n1️⃣ Updating comment metrics...');
    await poster.updateMetrics();

    console.log('\n2️⃣ Tracking account karma...');
    await karmaTracker.trackKarma();

    console.log('\n✅ Metrics update complete');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    poster.close();
    karmaTracker.close();
  }
}

main();
