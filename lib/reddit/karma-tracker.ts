import Database from 'better-sqlite3';
import { getRedditClient } from './config';
import Snoowrap from 'snoowrap';

export class RedditKarmaTracker {
  private db: Database.Database;
  private reddit: Snoowrap;

  constructor() {
    this.db = new Database('data/taxbridge.db');
    this.reddit = getRedditClient();
  }

  async trackKarma(): Promise<void> {
    const username = process.env.REDDIT_USERNAME || '';

    console.log(`📊 Tracking karma for u/${username}...`);

    try {
      const user = await this.reddit.getUser(username).fetch();

      const accountAgeDays = Math.floor((Date.now() / 1000 - user.created_utc) / 86400);

      this.db.prepare(`
        INSERT INTO reddit_account_metrics (
          account_name,
          karma,
          comment_karma,
          link_karma,
          account_age_days
        ) VALUES (?, ?, ?, ?, ?)
      `).run(
        username,
        user.link_karma + user.comment_karma,
        user.comment_karma,
        user.link_karma,
        accountAgeDays
      );

      console.log(`✅ Karma tracked:`);
      console.log(`   Total: ${user.link_karma + user.comment_karma}`);
      console.log(`   Comment: ${user.comment_karma}`);
      console.log(`   Link: ${user.link_karma}`);
      console.log(`   Account age: ${accountAgeDays} days`);

      // Check if account is ready for promotional content
      const isReady = this.isAccountReady(user.comment_karma, accountAgeDays);
      if (isReady) {
        console.log(`\n🎉 Account is ready for promotional content!`);
      } else {
        console.log(`\n⏳ Keep building karma before promotional posts`);
        console.log(`   Recommended: 100+ comment karma, 30+ day account age`);
      }
    } catch (error) {
      console.error(`❌ Error tracking karma:`, error);
    }
  }

  isAccountReady(commentKarma: number, accountAgeDays: number): boolean {
    // Criteria: 100+ comment karma AND 30+ day account age
    return commentKarma >= 100 && accountAgeDays >= 30;
  }

  getKarmaHistory(days: number = 30): Array<{
    karma: number;
    commentKarma: number;
    linkKarma: number;
    recordedAt: string;
  }> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return this.db.prepare(`
      SELECT
        karma,
        comment_karma as commentKarma,
        link_karma as linkKarma,
        recorded_at as recordedAt
      FROM reddit_account_metrics
      WHERE recorded_at >= ?
      ORDER BY recorded_at DESC
    `).all(cutoff.toISOString()) as any[];
  }

  close() {
    this.db.close();
  }
}
