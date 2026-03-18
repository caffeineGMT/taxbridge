#!/usr/bin/env tsx
import 'dotenv/config';
import { RedditKeywordMonitor } from '../lib/reddit/keyword-monitor';
import { RedditCommentGenerator } from '../lib/reddit/comment-generator';

async function main() {
  console.log('🚀 Reddit Organic Growth - Keyword Monitoring');
  console.log('='.repeat(60));

  const monitor = new RedditKeywordMonitor();
  const generator = new RedditCommentGenerator();

  try {
    // 1. Monitor for new posts with target keywords
    const newPosts = await monitor.monitorKeywords();

    if (newPosts.length === 0) {
      console.log('\n✅ No new relevant posts found');
      return;
    }

    console.log(`\n🎯 Found ${newPosts.length} new relevant posts`);

    // 2. Generate comment drafts for human review
    console.log('\n🤖 Generating AI-powered comment drafts...');
    const postIds = newPosts.map(p => p.redditId);
    const drafts = await generator.createCommentDrafts(postIds);

    console.log(`\n✅ Created ${drafts.length} comment drafts for review`);
    console.log('\nNext steps:');
    console.log('1. Run: npm run reddit:review-drafts');
    console.log('2. Approve high-quality comments');
    console.log('3. Run: npm run reddit:post-comments');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    monitor.close();
    generator.close();
  }
}

main();
