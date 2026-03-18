/**
 * Community Post Tracking System
 * Tracks post execution, engagement metrics, and conversions
 */

import Database from 'better-sqlite3';
import path from 'path';
import { CommunityPost } from './posts';

const DB_PATH = path.join(process.cwd(), 'data', 'community-posts.db');

export interface PostRecord {
  id: string;
  platform: string;
  community: string;
  scheduledTime: string;
  postedAt?: string;
  postUrl?: string;
  status: 'pending' | 'posted' | 'failed';
  upvotes?: number;
  comments?: number;
  impressions?: number;
  engagements?: number;
  clicks?: number;
  conversions?: number;
  revenue?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EngagementUpdate {
  upvotes?: number;
  comments?: number;
  impressions?: number;
  engagements?: number;
  clicks?: number;
  conversions?: number;
  revenue?: number;
}

export class CommunityPostTracker {
  private db: Database.Database;

  constructor(dbPath: string = DB_PATH) {
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        community TEXT NOT NULL,
        scheduled_time TEXT NOT NULL,
        posted_at TEXT,
        post_url TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        upvotes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        engagements INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        conversions INTEGER DEFAULT 0,
        revenue REAL DEFAULT 0,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_posts_status ON community_posts(status);
      CREATE INDEX IF NOT EXISTS idx_posts_platform ON community_posts(platform);
      CREATE INDEX IF NOT EXISTS idx_posts_posted_at ON community_posts(posted_at);

      CREATE TABLE IF NOT EXISTS post_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id TEXT NOT NULL,
        username TEXT,
        comment_text TEXT,
        comment_url TEXT,
        responded BOOLEAN DEFAULT 0,
        response_text TEXT,
        responded_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (post_id) REFERENCES community_posts(id)
      );

      CREATE INDEX IF NOT EXISTS idx_responses_post_id ON post_responses(post_id);
      CREATE INDEX IF NOT EXISTS idx_responses_responded ON post_responses(responded);

      CREATE TABLE IF NOT EXISTS utm_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id TEXT NOT NULL,
        utm_source TEXT NOT NULL,
        utm_medium TEXT NOT NULL,
        utm_campaign TEXT NOT NULL,
        utm_content TEXT NOT NULL,
        timestamp TEXT NOT NULL DEFAULT (datetime('now')),
        visitor_id TEXT,
        converted BOOLEAN DEFAULT 0,
        conversion_value REAL DEFAULT 0,
        FOREIGN KEY (post_id) REFERENCES community_posts(id)
      );

      CREATE INDEX IF NOT EXISTS idx_utm_post_id ON utm_tracking(post_id);
      CREATE INDEX IF NOT EXISTS idx_utm_source ON utm_tracking(utm_source);
      CREATE INDEX IF NOT EXISTS idx_utm_converted ON utm_tracking(converted);
    `);
  }

  // Initialize posts from template
  initializePosts(posts: CommunityPost[]) {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO community_posts (
        id, platform, community, scheduled_time, status
      ) VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((posts) => {
      for (const post of posts) {
        stmt.run(post.id, post.platform, post.community, post.scheduledTime, post.status);
      }
    });

    insertMany(posts);
  }

  // Mark post as posted
  markAsPosted(postId: string, postUrl: string) {
    const stmt = this.db.prepare(`
      UPDATE community_posts
      SET status = 'posted',
          post_url = ?,
          posted_at = datetime('now'),
          updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(postUrl, postId);
  }

  // Mark post as failed
  markAsFailed(postId: string, notes: string) {
    const stmt = this.db.prepare(`
      UPDATE community_posts
      SET status = 'failed',
          notes = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(notes, postId);
  }

  // Update engagement metrics
  updateEngagement(postId: string, metrics: EngagementUpdate) {
    const updates: string[] = [];
    const values: any[] = [];

    if (metrics.upvotes !== undefined) {
      updates.push('upvotes = ?');
      values.push(metrics.upvotes);
    }
    if (metrics.comments !== undefined) {
      updates.push('comments = ?');
      values.push(metrics.comments);
    }
    if (metrics.impressions !== undefined) {
      updates.push('impressions = ?');
      values.push(metrics.impressions);
    }
    if (metrics.engagements !== undefined) {
      updates.push('engagements = ?');
      values.push(metrics.engagements);
    }
    if (metrics.clicks !== undefined) {
      updates.push('clicks = ?');
      values.push(metrics.clicks);
    }
    if (metrics.conversions !== undefined) {
      updates.push('conversions = ?');
      values.push(metrics.conversions);
    }
    if (metrics.revenue !== undefined) {
      updates.push('revenue = ?');
      values.push(metrics.revenue);
    }

    if (updates.length === 0) return;

    updates.push("updated_at = datetime('now')");
    values.push(postId);

    const stmt = this.db.prepare(`
      UPDATE community_posts
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
  }

  // Add comment/response to track
  addResponse(postId: string, username: string, commentText: string, commentUrl?: string) {
    const stmt = this.db.prepare(`
      INSERT INTO post_responses (post_id, username, comment_text, comment_url)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(postId, username, commentText, commentUrl);
  }

  // Mark response as responded
  markResponsed(responseId: number, responseText: string) {
    const stmt = this.db.prepare(`
      UPDATE post_responses
      SET responded = 1,
          response_text = ?,
          responded_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(responseText, responseId);
  }

  // Get pending responses (not yet responded to)
  getPendingResponses(postId?: string): any[] {
    let query = `
      SELECT * FROM post_responses
      WHERE responded = 0
    `;

    if (postId) {
      query += ` AND post_id = ?`;
      return this.db.prepare(query).all(postId);
    }

    return this.db.prepare(query).all();
  }

  // Track UTM click
  trackUTMClick(postId: string, utmSource: string, utmMedium: string, utmCampaign: string, utmContent: string, visitorId?: string) {
    const stmt = this.db.prepare(`
      INSERT INTO utm_tracking (post_id, utm_source, utm_medium, utm_campaign, utm_content, visitor_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(postId, utmSource, utmMedium, utmCampaign, utmContent, visitorId);
  }

  // Track conversion from UTM
  trackConversion(postId: string, visitorId: string, conversionValue: number) {
    const stmt = this.db.prepare(`
      UPDATE utm_tracking
      SET converted = 1,
          conversion_value = ?
      WHERE post_id = ? AND visitor_id = ?
    `);

    stmt.run(conversionValue, postId, visitorId);
  }

  // Get all posts
  getAllPosts(): PostRecord[] {
    return this.db.prepare('SELECT * FROM community_posts ORDER BY scheduled_time').all() as PostRecord[];
  }

  // Get posts by status
  getPostsByStatus(status: 'pending' | 'posted' | 'failed'): PostRecord[] {
    return this.db.prepare('SELECT * FROM community_posts WHERE status = ? ORDER BY scheduled_time').all(status) as PostRecord[];
  }

  // Get post by ID
  getPost(postId: string): PostRecord | undefined {
    return this.db.prepare('SELECT * FROM community_posts WHERE id = ?').get(postId) as PostRecord | undefined;
  }

  // Get summary statistics
  getSummaryStats() {
    const totalPosts = this.db.prepare('SELECT COUNT(*) as count FROM community_posts').get() as { count: number };
    const postedPosts = this.db.prepare("SELECT COUNT(*) as count FROM community_posts WHERE status = 'posted'").get() as { count: number };
    const pendingPosts = this.db.prepare("SELECT COUNT(*) as count FROM community_posts WHERE status = 'pending'").get() as { count: number };

    const totalEngagement = this.db.prepare(`
      SELECT
        SUM(upvotes) as total_upvotes,
        SUM(comments) as total_comments,
        SUM(impressions) as total_impressions,
        SUM(engagements) as total_engagements,
        SUM(clicks) as total_clicks,
        SUM(conversions) as total_conversions,
        SUM(revenue) as total_revenue
      FROM community_posts
      WHERE status = 'posted'
    `).get() as any;

    const pendingResponses = this.db.prepare('SELECT COUNT(*) as count FROM post_responses WHERE responded = 0').get() as { count: number };

    return {
      totalPosts: totalPosts.count,
      postedPosts: postedPosts.count,
      pendingPosts: pendingPosts.count,
      totalUpvotes: totalEngagement.total_upvotes || 0,
      totalComments: totalEngagement.total_comments || 0,
      totalImpressions: totalEngagement.total_impressions || 0,
      totalEngagements: totalEngagement.total_engagements || 0,
      totalClicks: totalEngagement.total_clicks || 0,
      totalConversions: totalEngagement.total_conversions || 0,
      totalRevenue: totalEngagement.total_revenue || 0,
      pendingResponses: pendingResponses.count
    };
  }

  // Get platform breakdown
  getPlatformBreakdown() {
    return this.db.prepare(`
      SELECT
        platform,
        COUNT(*) as post_count,
        SUM(CASE WHEN status = 'posted' THEN 1 ELSE 0 END) as posted_count,
        SUM(upvotes) as total_upvotes,
        SUM(comments) as total_comments,
        SUM(clicks) as total_clicks,
        SUM(conversions) as total_conversions,
        SUM(revenue) as total_revenue
      FROM community_posts
      GROUP BY platform
      ORDER BY posted_count DESC
    `).all();
  }

  close() {
    this.db.close();
  }
}
