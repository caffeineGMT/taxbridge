/**
 * Referral Click and Share Tracking Queries
 * Track viral growth metrics: clicks, shares, conversions
 */

import { getDatabase } from '../index';

export interface ReferralClick {
  id: number;
  referral_code: string;
  referrer_user_id: number | null;
  visitor_ip: string | null;
  visitor_country: string | null;
  visitor_user_agent: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_page: string | null;
  created_at: number;
}

export interface ReferralShare {
  id: number;
  referrer_user_id: number;
  referral_code: string;
  share_platform: 'twitter' | 'linkedin' | 'email' | 'copy_link' | 'direct_email';
  share_metadata: string | null;
  created_at: number;
}

export interface ReferralAnalytics {
  id: number;
  referrer_user_id: number;
  period_type: 'daily' | 'weekly' | 'monthly';
  period_start: string;
  total_shares: number;
  total_clicks: number;
  total_conversions: number;
  conversion_rate: number;
  most_effective_platform: string | null;
  created_at: number;
  updated_at: number;
}

/**
 * Track a referral link click
 */
export function trackReferralClick(data: {
  referralCode: string;
  referrerUserId?: number;
  visitorIp?: string;
  visitorCountry?: string;
  visitorUserAgent?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
}): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO referral_clicks (
      referral_code,
      referrer_user_id,
      visitor_ip,
      visitor_country,
      visitor_user_agent,
      utm_source,
      utm_medium,
      utm_campaign,
      landing_page
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    data.referralCode,
    data.referrerUserId || null,
    data.visitorIp || null,
    data.visitorCountry || null,
    data.visitorUserAgent || null,
    data.utmSource || null,
    data.utmMedium || null,
    data.utmCampaign || null,
    data.landingPage || null
  );

  return result.lastInsertRowid as number;
}

/**
 * Track a referral share event
 */
export function trackReferralShare(data: {
  referrerUserId: number;
  referralCode: string;
  sharePlatform: ReferralShare['share_platform'];
  shareMetadata?: Record<string, any>;
}): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO referral_shares (
      referrer_user_id,
      referral_code,
      share_platform,
      share_metadata
    ) VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(
    data.referrerUserId,
    data.referralCode,
    data.sharePlatform,
    data.shareMetadata ? JSON.stringify(data.shareMetadata) : null
  );

  return result.lastInsertRowid as number;
}

/**
 * Get click stats for a user
 */
export function getUserClickStats(userId: number): {
  total_clicks: number;
  clicks_last_7_days: number;
  clicks_last_30_days: number;
  clicks_by_source: Array<{ source: string; count: number }>;
} {
  const db = getDatabase();

  // Get total clicks
  const totalClicks = db
    .prepare('SELECT COUNT(*) as count FROM referral_clicks WHERE referrer_user_id = ?')
    .get(userId) as { count: number };

  // Get clicks in last 7 days
  const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
  const last7Days = db
    .prepare('SELECT COUNT(*) as count FROM referral_clicks WHERE referrer_user_id = ? AND created_at >= ?')
    .get(userId, sevenDaysAgo) as { count: number };

  // Get clicks in last 30 days
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const last30Days = db
    .prepare('SELECT COUNT(*) as count FROM referral_clicks WHERE referrer_user_id = ? AND created_at >= ?')
    .get(userId, thirtyDaysAgo) as { count: number };

  // Get clicks by UTM source
  const bySource = db
    .prepare(`
      SELECT
        COALESCE(utm_source, 'direct') as source,
        COUNT(*) as count
      FROM referral_clicks
      WHERE referrer_user_id = ?
      GROUP BY utm_source
      ORDER BY count DESC
      LIMIT 10
    `)
    .all(userId) as Array<{ source: string; count: number }>;

  return {
    total_clicks: totalClicks.count,
    clicks_last_7_days: last7Days.count,
    clicks_last_30_days: last30Days.count,
    clicks_by_source: bySource,
  };
}

/**
 * Get share stats for a user
 */
export function getUserShareStats(userId: number): {
  total_shares: number;
  shares_last_7_days: number;
  shares_last_30_days: number;
  shares_by_platform: Array<{ platform: string; count: number }>;
} {
  const db = getDatabase();

  // Get total shares
  const totalShares = db
    .prepare('SELECT COUNT(*) as count FROM referral_shares WHERE referrer_user_id = ?')
    .get(userId) as { count: number };

  // Get shares in last 7 days
  const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
  const last7Days = db
    .prepare('SELECT COUNT(*) as count FROM referral_shares WHERE referrer_user_id = ? AND created_at >= ?')
    .get(userId, sevenDaysAgo) as { count: number };

  // Get shares in last 30 days
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const last30Days = db
    .prepare('SELECT COUNT(*) as count FROM referral_shares WHERE referrer_user_id = ? AND created_at >= ?')
    .get(userId, thirtyDaysAgo) as { count: number };

  // Get shares by platform
  const byPlatform = db
    .prepare(`
      SELECT
        share_platform as platform,
        COUNT(*) as count
      FROM referral_shares
      WHERE referrer_user_id = ?
      GROUP BY share_platform
      ORDER BY count DESC
    `)
    .all(userId) as Array<{ platform: string; count: number }>;

  return {
    total_shares: totalShares.count,
    shares_last_7_days: last7Days.count,
    shares_last_30_days: last30Days.count,
    shares_by_platform: byPlatform,
  };
}

/**
 * Get comprehensive viral metrics for a user
 */
export function getUserViralMetrics(userId: number): {
  shares: number;
  clicks: number;
  conversions: number;
  click_to_share_ratio: number;
  conversion_rate: number;
  viral_coefficient: number;
} {
  const db = getDatabase();

  const shareStats = getUserShareStats(userId);
  const clickStats = getUserClickStats(userId);

  // Get conversions from referrals table
  const conversions = db
    .prepare(`
      SELECT COUNT(*) as count
      FROM referrals
      WHERE referrer_user_id = ? AND status IN ('completed', 'rewarded')
    `)
    .get(userId) as { count: number };

  const shares = shareStats.total_shares;
  const clicks = clickStats.total_clicks;
  const conversionCount = conversions.count;

  // Calculate metrics
  const clickToShareRatio = shares > 0 ? clicks / shares : 0;
  const conversionRate = clicks > 0 ? (conversionCount / clicks) * 100 : 0;

  // Viral coefficient = (conversions per user) * (shares per user)
  // Simplified: if each referred user shares once, what's the growth factor?
  const viralCoefficient = conversionCount > 0 ? shares / conversionCount : 0;

  return {
    shares,
    clicks,
    conversions: conversionCount,
    click_to_share_ratio: clickToShareRatio,
    conversion_rate: conversionRate,
    viral_coefficient: viralCoefficient,
  };
}

/**
 * Get recent clicks for a user
 */
export function getUserRecentClicks(userId: number, limit: number = 20): ReferralClick[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM referral_clicks
    WHERE referrer_user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);

  return stmt.all(userId, limit) as ReferralClick[];
}

/**
 * Get recent shares for a user
 */
export function getUserRecentShares(userId: number, limit: number = 20): ReferralShare[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM referral_shares
    WHERE referrer_user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);

  return stmt.all(userId, limit) as ReferralShare[];
}

/**
 * Update or create daily analytics aggregation
 */
export function updateDailyAnalytics(userId: number, date: string): void {
  const db = getDatabase();

  // Get shares for the day
  const dateStart = new Date(date).getTime() / 1000;
  const dateEnd = dateStart + 24 * 60 * 60;

  const stats = db
    .prepare(`
      SELECT
        COUNT(DISTINCT s.id) as shares,
        COUNT(DISTINCT c.id) as clicks,
        COUNT(DISTINCT r.id) as conversions
      FROM (SELECT ? as user_id) u
      LEFT JOIN referral_shares s ON s.referrer_user_id = u.user_id
        AND s.created_at >= ? AND s.created_at < ?
      LEFT JOIN referral_clicks c ON c.referrer_user_id = u.user_id
        AND c.created_at >= ? AND c.created_at < ?
      LEFT JOIN referrals r ON r.referrer_user_id = u.user_id
        AND r.status IN ('completed', 'rewarded')
        AND unixepoch(r.completed_at) >= ?
        AND unixepoch(r.completed_at) < ?
    `)
    .get(userId, dateStart, dateEnd, dateStart, dateEnd, dateStart, dateEnd) as {
    shares: number;
    clicks: number;
    conversions: number;
  };

  const conversionRate = stats.clicks > 0 ? (stats.conversions / stats.clicks) * 100 : 0;

  // Get most effective platform
  const topPlatform = db
    .prepare(`
      SELECT share_platform
      FROM referral_shares
      WHERE referrer_user_id = ? AND created_at >= ? AND created_at < ?
      GROUP BY share_platform
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `)
    .get(userId, dateStart, dateEnd) as { share_platform: string } | undefined;

  // Upsert analytics record
  db.prepare(`
    INSERT INTO referral_analytics (
      referrer_user_id,
      period_type,
      period_start,
      total_shares,
      total_clicks,
      total_conversions,
      conversion_rate,
      most_effective_platform
    )
    VALUES (?, 'daily', ?, ?, ?, ?, ?, ?)
    ON CONFLICT(referrer_user_id, period_type, period_start) DO UPDATE SET
      total_shares = excluded.total_shares,
      total_clicks = excluded.total_clicks,
      total_conversions = excluded.total_conversions,
      conversion_rate = excluded.conversion_rate,
      most_effective_platform = excluded.most_effective_platform,
      updated_at = unixepoch()
  `).run(
    userId,
    date,
    stats.shares,
    stats.clicks,
    stats.conversions,
    conversionRate,
    topPlatform?.share_platform || null
  );
}

/**
 * Calculate share rate (what % of users share)
 * Target: 20% of users share their referral link
 */
export function getGlobalShareRate(): {
  total_users: number;
  users_who_shared: number;
  share_rate_percent: number;
  target_percent: number;
  on_target: boolean;
} {
  const db = getDatabase();

  // Get total users with referral codes
  const totalUsers = db
    .prepare('SELECT COUNT(*) as count FROM user_profiles WHERE referral_code IS NOT NULL')
    .get() as { count: number };

  // Get users who have shared at least once
  const usersWhoShared = db
    .prepare('SELECT COUNT(DISTINCT referrer_user_id) as count FROM referral_shares')
    .get() as { count: number };

  const shareRatePercent = totalUsers.count > 0 ? (usersWhoShared.count / totalUsers.count) * 100 : 0;
  const targetPercent = 20;

  return {
    total_users: totalUsers.count,
    users_who_shared: usersWhoShared.count,
    share_rate_percent: shareRatePercent,
    target_percent: targetPercent,
    on_target: shareRatePercent >= targetPercent,
  };
}
