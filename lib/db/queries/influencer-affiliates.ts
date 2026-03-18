/**
 * Influencer Affiliate Program Database Queries
 * Extended affiliate management for influencer/blogger/YouTuber partners
 */

import { getDatabase } from '../index';
import { AffiliatePartner } from './affiliates';

// Extended affiliate partner with influencer fields
export interface InfluencerAffiliate extends AffiliatePartner {
  partner_type: 'cpa' | 'influencer' | 'blogger' | 'youtuber' | 'forum_moderator';
  custom_referral_slug: string | null;
  platform: string | null;
  platform_url: string | null;
  audience_size: number;
  content_niche: string | null;
  tier: 'standard' | 'premium' | 'elite';
  paypal_email: string | null;
  payout_method: 'stripe' | 'paypal';
  notes: string | null;
  last_active_at: string | null;
}

export interface AffiliatePayout {
  id: number;
  affiliate_id: number;
  amount: number;
  payout_method: 'stripe' | 'paypal';
  payout_reference: string | null;
  period_start: string;
  period_end: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processed_at: string | null;
}

export interface LeaderboardEntry {
  id: number;
  affiliate_id: number;
  month: string;
  referral_count: number;
  conversion_count: number;
  revenue_generated: number;
  commission_earned: number;
  rank: number | null;
  bonus_earned: number;
  updated_at: string;
  // Joined fields
  partner_name?: string;
  firm_name?: string;
  platform?: string;
  tier?: string;
}

export interface InfluencerOutreach {
  id: number;
  influencer_name: string;
  platform: string;
  platform_url: string;
  audience_size: number;
  content_niche: string | null;
  email: string | null;
  contact_method: string | null;
  outreach_status: string;
  outreach_date: string | null;
  response_date: string | null;
  affiliate_id: number | null;
  notes: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface AffiliateClick {
  id: number;
  affiliate_id: number;
  referral_code: string;
  ip_hash: string | null;
  user_agent: string | null;
  landing_page: string | null;
  created_at: string;
}

// ============================================================================
// INFLUENCER AFFILIATE MANAGEMENT
// ============================================================================

/**
 * Create a new influencer affiliate with custom slug
 */
export function createInfluencerAffiliate(input: {
  partner_name: string;
  firm_name: string;
  email: string;
  commission_rate: number;
  partner_type: string;
  custom_referral_slug?: string;
  platform?: string;
  platform_url?: string;
  audience_size?: number;
  content_niche?: string;
  paypal_email?: string;
  payout_method?: string;
}): number {
  const db = getDatabase();

  // Generate slug from firm name if not provided
  const slug = input.custom_referral_slug || input.firm_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .substring(0, 20);

  // Also need a referral_code for the base table
  const { nanoid } = require('nanoid');
  const referralCode = nanoid(10).toUpperCase();

  const stmt = db.prepare(`
    INSERT INTO affiliate_partners (
      partner_name, firm_name, email, referral_code, commission_rate,
      partner_type, custom_referral_slug, platform, platform_url,
      audience_size, content_niche, paypal_email, payout_method
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    input.partner_name,
    input.firm_name,
    input.email,
    referralCode,
    input.commission_rate,
    input.partner_type,
    slug,
    input.platform || null,
    input.platform_url || null,
    input.audience_size || 0,
    input.content_niche || null,
    input.paypal_email || null,
    input.payout_method || 'stripe'
  );

  return result.lastInsertRowid as number;
}

/**
 * Get affiliate by custom slug (for /signup?ref=slug)
 */
export function getAffiliateBySlug(slug: string): InfluencerAffiliate | undefined {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM affiliate_partners
    WHERE custom_referral_slug = ? AND status = 'approved'
  `);
  return stmt.get(slug) as InfluencerAffiliate | undefined;
}

/**
 * Get all influencer affiliates
 */
export function getInfluencerAffiliates(filters?: {
  partner_type?: string;
  tier?: string;
  status?: string;
}): InfluencerAffiliate[] {
  const db = getDatabase();

  let query = 'SELECT * FROM affiliate_partners WHERE 1=1';
  const params: any[] = [];

  if (filters?.partner_type) {
    query += ' AND partner_type = ?';
    params.push(filters.partner_type);
  }
  if (filters?.tier) {
    query += ' AND tier = ?';
    params.push(filters.tier);
  }
  if (filters?.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  query += ' ORDER BY total_revenue DESC, total_referrals DESC';

  const stmt = db.prepare(query);
  return stmt.all(...params) as InfluencerAffiliate[];
}

/**
 * Update affiliate tier
 */
export function updateAffiliateTier(id: number, tier: 'standard' | 'premium' | 'elite'): void {
  const db = getDatabase();
  db.prepare('UPDATE affiliate_partners SET tier = ? WHERE id = ?').run(tier, id);
}

/**
 * Update affiliate commission rate
 */
export function updateAffiliateCommission(id: number, rate: number): void {
  const db = getDatabase();
  db.prepare('UPDATE affiliate_partners SET commission_rate = ? WHERE id = ?').run(rate, id);
}

/**
 * Update payout method
 */
export function updatePayoutMethod(id: number, method: 'stripe' | 'paypal', paypalEmail?: string): void {
  const db = getDatabase();
  if (method === 'paypal' && paypalEmail) {
    db.prepare('UPDATE affiliate_partners SET payout_method = ?, paypal_email = ? WHERE id = ?')
      .run(method, paypalEmail, id);
  } else {
    db.prepare('UPDATE affiliate_partners SET payout_method = ? WHERE id = ?')
      .run(method, id);
  }
}

// ============================================================================
// CLICK TRACKING
// ============================================================================

/**
 * Record an affiliate link click
 */
export function recordAffiliateClick(input: {
  affiliate_id: number;
  referral_code: string;
  ip_hash?: string;
  user_agent?: string;
  landing_page?: string;
}): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO affiliate_clicks (affiliate_id, referral_code, ip_hash, user_agent, landing_page)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    input.affiliate_id,
    input.referral_code,
    input.ip_hash || null,
    input.user_agent || null,
    input.landing_page || null
  );

  // Update last_active_at
  db.prepare('UPDATE affiliate_partners SET last_active_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(input.affiliate_id);

  return result.lastInsertRowid as number;
}

/**
 * Get click count for affiliate in date range
 */
export function getAffiliateClickCount(affiliateId: number, startDate?: string, endDate?: string): number {
  const db = getDatabase();

  let query = 'SELECT COUNT(*) as count FROM affiliate_clicks WHERE affiliate_id = ?';
  const params: any[] = [affiliateId];

  if (startDate) {
    query += ' AND created_at >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND created_at <= ?';
    params.push(endDate);
  }

  const result = db.prepare(query).get(...params) as { count: number };
  return result.count;
}

// ============================================================================
// LEADERBOARD
// ============================================================================

/**
 * Update or create leaderboard entry for current month
 */
export function updateLeaderboardEntry(affiliateId: number): void {
  const db = getDatabase();
  const month = new Date().toISOString().substring(0, 7); // YYYY-MM

  // Calculate stats for this month
  const monthStart = `${month}-01`;
  const nextMonth = new Date(new Date(monthStart).setMonth(new Date(monthStart).getMonth() + 1))
    .toISOString().substring(0, 10);

  const stats = db.prepare(`
    SELECT
      COUNT(*) as referral_count,
      SUM(CASE WHEN commission_status IN ('pending', 'paid') THEN 1 ELSE 0 END) as conversion_count,
      COALESCE(SUM(commission_amount), 0) as revenue
    FROM affiliate_referrals
    WHERE affiliate_id = ? AND created_at >= ? AND created_at < ?
  `).get(affiliateId, monthStart, nextMonth) as {
    referral_count: number;
    conversion_count: number;
    revenue: number;
  };

  const partner = db.prepare('SELECT commission_rate FROM affiliate_partners WHERE id = ?')
    .get(affiliateId) as { commission_rate: number } | undefined;

  const commissionEarned = stats.revenue;

  db.prepare(`
    INSERT INTO affiliate_leaderboard (affiliate_id, month, referral_count, conversion_count, revenue_generated, commission_earned)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(affiliate_id, month) DO UPDATE SET
      referral_count = excluded.referral_count,
      conversion_count = excluded.conversion_count,
      revenue_generated = excluded.revenue_generated,
      commission_earned = excluded.commission_earned,
      updated_at = CURRENT_TIMESTAMP
  `).run(affiliateId, month, stats.referral_count, stats.conversion_count, stats.revenue, commissionEarned);
}

/**
 * Get leaderboard for a given month (or current)
 */
export function getLeaderboard(month?: string): LeaderboardEntry[] {
  const db = getDatabase();
  const targetMonth = month || new Date().toISOString().substring(0, 7);

  const entries = db.prepare(`
    SELECT
      l.*,
      p.partner_name,
      p.firm_name,
      p.platform,
      p.tier
    FROM affiliate_leaderboard l
    JOIN affiliate_partners p ON l.affiliate_id = p.id
    WHERE l.month = ?
    ORDER BY l.commission_earned DESC, l.referral_count DESC
  `).all(targetMonth) as LeaderboardEntry[];

  // Assign ranks
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return entries;
}

/**
 * Calculate and apply monthly bonuses
 * #1 gets $500, #2 gets $250, #3 gets $100
 */
export function applyMonthlyBonuses(month?: string): void {
  const db = getDatabase();
  const targetMonth = month || new Date().toISOString().substring(0, 7);

  const bonuses = [500, 250, 100];
  const leaderboard = getLeaderboard(targetMonth);

  for (let i = 0; i < Math.min(3, leaderboard.length); i++) {
    if (leaderboard[i].referral_count > 0) {
      db.prepare(`
        UPDATE affiliate_leaderboard
        SET bonus_earned = ?, rank = ?
        WHERE affiliate_id = ? AND month = ?
      `).run(bonuses[i], i + 1, leaderboard[i].affiliate_id, targetMonth);
    }
  }

  // Update ranks for remaining entries
  for (let i = 3; i < leaderboard.length; i++) {
    db.prepare(`
      UPDATE affiliate_leaderboard
      SET rank = ?
      WHERE affiliate_id = ? AND month = ?
    `).run(i + 1, leaderboard[i].affiliate_id, targetMonth);
  }
}

// ============================================================================
// PAYOUTS
// ============================================================================

/**
 * Create a pending payout
 */
export function createPayout(input: {
  affiliate_id: number;
  amount: number;
  payout_method: 'stripe' | 'paypal';
  period_start: string;
  period_end: string;
}): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO affiliate_payouts (affiliate_id, amount, payout_method, period_start, period_end)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    input.affiliate_id,
    input.amount,
    input.payout_method,
    input.period_start,
    input.period_end
  );

  return result.lastInsertRowid as number;
}

/**
 * Mark payout as completed
 */
export function completePayout(payoutId: number, reference: string): void {
  const db = getDatabase();
  db.prepare(`
    UPDATE affiliate_payouts
    SET status = 'completed', payout_reference = ?, processed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(reference, payoutId);
}

/**
 * Get payouts for an affiliate
 */
export function getAffiliatePayouts(affiliateId: number): AffiliatePayout[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM affiliate_payouts WHERE affiliate_id = ? ORDER BY created_at DESC
  `).all(affiliateId) as AffiliatePayout[];
}

/**
 * Get all pending payouts
 */
export function getPendingPayouts(): (AffiliatePayout & { partner_name: string; firm_name: string })[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT p.*, a.partner_name, a.firm_name
    FROM affiliate_payouts p
    JOIN affiliate_partners a ON p.affiliate_id = a.id
    WHERE p.status = 'pending'
    ORDER BY p.created_at ASC
  `).all() as (AffiliatePayout & { partner_name: string; firm_name: string })[];
}

// ============================================================================
// OUTREACH MANAGEMENT
// ============================================================================

/**
 * Get all influencer outreach targets
 */
export function getInfluencerOutreachList(status?: string): InfluencerOutreach[] {
  const db = getDatabase();

  if (status) {
    return db.prepare(`
      SELECT * FROM influencer_outreach WHERE outreach_status = ? ORDER BY priority DESC, audience_size DESC
    `).all(status) as InfluencerOutreach[];
  }

  return db.prepare(`
    SELECT * FROM influencer_outreach ORDER BY priority DESC, audience_size DESC
  `).all() as InfluencerOutreach[];
}

/**
 * Update outreach status
 */
export function updateOutreachStatus(
  id: number,
  status: string,
  notes?: string
): void {
  const db = getDatabase();

  const updates: string[] = ['outreach_status = ?', 'updated_at = CURRENT_TIMESTAMP'];
  const params: any[] = [status];

  if (status === 'contacted') {
    updates.push('outreach_date = CURRENT_TIMESTAMP');
  }
  if (status === 'signed' || status === 'active' || status === 'declined') {
    updates.push('response_date = CURRENT_TIMESTAMP');
  }
  if (notes) {
    updates.push('notes = ?');
    params.push(notes);
  }

  params.push(id);

  db.prepare(`UPDATE influencer_outreach SET ${updates.join(', ')} WHERE id = ?`)
    .run(...params);
}

/**
 * Link outreach to affiliate
 */
export function linkOutreachToAffiliate(outreachId: number, affiliateId: number): void {
  const db = getDatabase();
  db.prepare('UPDATE influencer_outreach SET affiliate_id = ?, outreach_status = \'active\' WHERE id = ?')
    .run(affiliateId, outreachId);
}

/**
 * Get affiliate dashboard stats
 */
export function getAffiliateDashboardStats(affiliateId: number): {
  totalClicks: number;
  totalReferrals: number;
  totalRevenue: number;
  pendingCommission: number;
  paidCommission: number;
  conversionRate: number;
  last30DaysClicks: number;
  last30DaysReferrals: number;
} {
  const db = getDatabase();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const partner = db.prepare('SELECT * FROM affiliate_partners WHERE id = ?')
    .get(affiliateId) as InfluencerAffiliate | undefined;

  const totalClicks = (db.prepare(
    'SELECT COUNT(*) as c FROM affiliate_clicks WHERE affiliate_id = ?'
  ).get(affiliateId) as { c: number })?.c || 0;

  const last30DaysClicks = (db.prepare(
    'SELECT COUNT(*) as c FROM affiliate_clicks WHERE affiliate_id = ? AND created_at >= ?'
  ).get(affiliateId, thirtyDaysAgo) as { c: number })?.c || 0;

  const referralStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      COALESCE(SUM(CASE WHEN commission_status = 'pending' THEN commission_amount ELSE 0 END), 0) as pending,
      COALESCE(SUM(CASE WHEN commission_status = 'paid' THEN commission_amount ELSE 0 END), 0) as paid
    FROM affiliate_referrals WHERE affiliate_id = ?
  `).get(affiliateId) as { total: number; pending: number; paid: number };

  const last30DaysReferrals = (db.prepare(
    'SELECT COUNT(*) as c FROM affiliate_referrals WHERE affiliate_id = ? AND created_at >= ?'
  ).get(affiliateId, thirtyDaysAgo) as { c: number })?.c || 0;

  return {
    totalClicks,
    totalReferrals: partner?.total_referrals || 0,
    totalRevenue: partner?.total_revenue || 0,
    pendingCommission: referralStats.pending,
    paidCommission: referralStats.paid,
    conversionRate: totalClicks > 0 ? (referralStats.total / totalClicks) * 100 : 0,
    last30DaysClicks,
    last30DaysReferrals,
  };
}
