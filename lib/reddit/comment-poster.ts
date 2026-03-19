/**
 * Reddit Comment Poster
 *
 * DISABLED: This module is temporarily disabled due to security vulnerabilities
 * in the snoowrap package (CVE-2023-28155, CVE-2023-43646).
 *
 * To re-enable: Refactor to use direct Reddit API calls with axios.
 * See lib/reddit/config.ts for implementation guidance.
 */

import Database from 'better-sqlite3';

export class RedditCommentPoster {
  private db: Database.Database;

  constructor() {
    this.db = new Database('data/taxbridge.db');
  }

  async postApprovedComments(): Promise<number> {
    throw new Error(
      'Reddit automation temporarily disabled due to security vulnerabilities. ' +
      'See lib/reddit/config.ts for details.'
    );
  }

  async updateMetrics(): Promise<void> {
    throw new Error(
      'Reddit automation temporarily disabled due to security vulnerabilities. ' +
      'See lib/reddit/config.ts for details.'
    );
  }

  close() {
    this.db.close();
  }
}
