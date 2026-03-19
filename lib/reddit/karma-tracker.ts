/**
 * Reddit Karma Tracker
 *
 * DISABLED: This module is temporarily disabled due to security vulnerabilities
 * in the snoowrap package (CVE-2023-28155, CVE-2023-43646).
 *
 * To re-enable: Refactor to use direct Reddit API calls with axios.
 * See lib/reddit/config.ts for implementation guidance.
 */

import Database from 'better-sqlite3';

export class RedditKarmaTracker {
  private db: Database.Database;

  constructor() {
    this.db = new Database('data/taxbridge.db');
  }

  async trackKarma(): Promise<void> {
    throw new Error(
      'Reddit automation temporarily disabled due to security vulnerabilities. ' +
      'See lib/reddit/config.ts for details.'
    );
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
