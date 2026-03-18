#!/usr/bin/env tsx
import 'dotenv/config';
import Database from 'better-sqlite3';

function main() {
  console.log('📊 Reddit Organic Growth Dashboard');
  console.log('='.repeat(60));

  const db = new Database('data/taxbridge.db');

  // Account metrics
  const latestKarma = db.prepare(`
    SELECT karma, comment_karma, link_karma, account_age_days, recorded_at
    FROM reddit_account_metrics
    ORDER BY recorded_at DESC
    LIMIT 1
  `).get() as {
    karma: number;
    comment_karma: number;
    link_karma: number;
    account_age_days: number;
    recorded_at: string;
  } | undefined;

  console.log('\n🎯 Account Status');
  console.log('-'.repeat(60));
  if (latestKarma) {
    console.log(`Total Karma: ${latestKarma.karma}`);
    console.log(`Comment Karma: ${latestKarma.comment_karma}`);
    console.log(`Link Karma: ${latestKarma.link_karma}`);
    console.log(`Account Age: ${latestKarma.account_age_days} days`);
    console.log(`Last Updated: ${latestKarma.recorded_at}`);

    const isReady = latestKarma.comment_karma >= 100 && latestKarma.account_age_days >= 30;
    console.log(`\n${isReady ? '✅ Ready for promotional content' : '⏳ Building karma...'}`);
  } else {
    console.log('No karma data yet. Run: npm run reddit:update-metrics');
  }

  // Posts monitored
  const postStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN date(discovered_at) = date('now') THEN 1 END) as today
    FROM reddit_posts
  `).get() as { total: number; today: number };

  console.log('\n📝 Posts Monitored');
  console.log('-'.repeat(60));
  console.log(`Total Posts: ${postStats.total}`);
  console.log(`Today: ${postStats.today}`);

  // Comments status
  const commentStats = db.prepare(`
    SELECT
      status,
      COUNT(*) as count
    FROM reddit_comments
    GROUP BY status
  `).all() as Array<{ status: string; count: number }>;

  console.log('\n💬 Comments Status');
  console.log('-'.repeat(60));
  const statusMap = commentStats.reduce((acc, row) => {
    acc[row.status] = row.count;
    return acc;
  }, {} as Record<string, number>);

  console.log(`Pending Review: ${statusMap.pending || 0}`);
  console.log(`Approved: ${statusMap.approved || 0}`);
  console.log(`Posted: ${statusMap.posted || 0}`);
  console.log(`Rejected: ${statusMap.rejected || 0}`);

  // Comment performance
  const topComments = db.prepare(`
    SELECT
      c.content,
      c.subreddit,
      m.score,
      m.upvotes,
      c.posted_at
    FROM reddit_comments c
    JOIN reddit_comment_metrics m ON c.comment_id = m.comment_id
    WHERE c.status = 'posted'
    ORDER BY m.score DESC
    LIMIT 5
  `).all() as Array<{
    content: string;
    subreddit: string;
    score: number;
    upvotes: number;
    posted_at: string;
  }>;

  if (topComments.length > 0) {
    console.log('\n🏆 Top Performing Comments');
    console.log('-'.repeat(60));
    topComments.forEach((comment, i) => {
      const preview = comment.content.substring(0, 60) + '...';
      console.log(`${i + 1}. [${comment.score} pts] r/${comment.subreddit}: "${preview}"`);
    });
  }

  // Ultimate guides
  const guideStats = db.prepare(`
    SELECT
      status,
      COUNT(*) as count
    FROM reddit_ultimate_guides
    GROUP BY status
  `).all() as Array<{ status: string; count: number }>;

  if (guideStats.length > 0) {
    console.log('\n📚 Ultimate Guides');
    console.log('-'.repeat(60));
    guideStats.forEach(row => {
      console.log(`${row.status}: ${row.count}`);
    });
  }

  // Conversion tracking (estimated from UTM)
  const conversionStats = db.prepare(`
    SELECT
      SUM(clicks) as total_clicks,
      SUM(signups) as total_signups
    FROM reddit_comment_metrics
  `).get() as { total_clicks: number; total_signups: number } | undefined;

  if (conversionStats && conversionStats.total_clicks > 0) {
    console.log('\n📈 Conversion Metrics');
    console.log('-'.repeat(60));
    console.log(`Total Clicks: ${conversionStats.total_clicks}`);
    console.log(`Total Signups: ${conversionStats.total_signups}`);
    const conversionRate = (conversionStats.total_signups / conversionStats.total_clicks) * 100;
    console.log(`Conversion Rate: ${conversionRate.toFixed(2)}%`);
  }

  db.close();

  console.log('\n' + '='.repeat(60));
  console.log('Dashboard last updated:', new Date().toISOString());
}

main();
