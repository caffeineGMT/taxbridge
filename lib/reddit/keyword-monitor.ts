/**
 * Reddit Keyword Monitor
 *
 * DISABLED: This module is temporarily disabled due to security vulnerabilities
 * in the snoowrap package (CVE-2023-28155, CVE-2023-43646).
 *
 * To re-enable: Refactor to use direct Reddit API calls with axios.
 * See lib/reddit/config.ts for implementation guidance.
 */

import Database from 'better-sqlite3';

export interface MonitoredPost {
  redditId: string;
  subreddit: string;
  title: string;
  author: string;
  url: string;
  permalink: string;
  matchedKeywords: string[];
  createdUtc: number;
}

export class RedditKeywordMonitor {
  private db: Database.Database;

  constructor() {
    this.db = new Database('data/taxbridge.db');
  }

  async monitorKeywords(): Promise<MonitoredPost[]> {
    throw new Error(
      'Reddit automation temporarily disabled due to security vulnerabilities. ' +
      'See lib/reddit/config.ts for details.'
    );
  }

  getRecentPosts(hours: number = 24): MonitoredPost[] {
    const cutoff = Date.now() / 1000 - (hours * 3600);

    const posts = this.db.prepare(`
      SELECT
        reddit_id as redditId,
        subreddit,
        title,
        author,
        url,
        permalink,
        matched_keywords as matchedKeywordsJson,
        created_utc as createdUtc
      FROM reddit_posts
      WHERE created_utc > ?
      ORDER BY created_utc DESC
    `).all(cutoff) as Array<Omit<MonitoredPost, 'matchedKeywords'> & { matchedKeywordsJson: string }>;

    return posts.map(post => ({
      ...post,
      matchedKeywords: JSON.parse(post.matchedKeywordsJson),
    }));
  }

  close() {
    this.db.close();
  }
}
