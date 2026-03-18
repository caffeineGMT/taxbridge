#!/usr/bin/env tsx
import 'dotenv/config';
import { RedditCommentPoster } from '../lib/reddit/comment-poster';

async function main() {
  console.log('📤 Reddit Comment Posting');
  console.log('='.repeat(60));

  const poster = new RedditCommentPoster();

  try {
    const posted = await poster.postApprovedComments();

    if (posted > 0) {
      console.log(`\n✅ Successfully posted ${posted} comments`);
      console.log('\nNext steps:');
      console.log('1. Monitor comment performance in Reddit');
      console.log('2. Run: npm run reddit:update-metrics (daily)');
    } else {
      console.log('\n✅ No approved comments to post');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    poster.close();
  }
}

main();
