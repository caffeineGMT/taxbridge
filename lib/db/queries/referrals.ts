/**
 * User Referral Program Database Queries
 * User-to-user viral referrals with rewards
 */

import { getDatabase } from '../index';
import { nanoid } from 'nanoid';

export interface Referral {
  id: number;
  referrer_user_id: number;
  referred_user_id: number;
  referral_code: string;
  status: 'pending' | 'completed' | 'rewarded';
  reward_granted: boolean;
  reward_type: 'free_month' | 'discount' | 'credit' | null;
  reward_value: number | null;
  created_at: string;
  completed_at: string | null;
  rewarded_at: string | null;
}

export interface LeaderboardEntry {
  id: number;
  user_id: number;
  month: string;
  referral_count: number;
  conversion_count: number;
  total_reward_value: number;
  rank: number | null;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardWithUser extends LeaderboardEntry {
  email: string;
  first_name: string | null;
  last_name: string | null;
}

/**
 * Generate a unique 8-character referral code
 */
export function generateUserReferralCode(): string {
  return nanoid(8).toUpperCase();
}

/**
 * Get or generate referral code for a user
 */
export function getUserReferralCode(userId: number): string {
  const db = getDatabase();

  // Check if user already has a code
  const user = db.prepare('SELECT referral_code FROM user_profiles WHERE id = ?').get(userId) as { referral_code: string | null } | undefined;

  if (user?.referral_code) {
    return user.referral_code;
  }

  // Generate new code
  const code = generateUserReferralCode();

  // Update user profile
  db.prepare('UPDATE user_profiles SET referral_code = ? WHERE id = ?').run(code, userId);

  return code;
}

/**
 * Get user by referral code
 */
export function getUserByReferralCode(code: string): { id: number; email: string | null } | undefined {
  const db = getDatabase();

  const stmt = db.prepare('SELECT id, email FROM user_profiles WHERE referral_code = ?');
  return stmt.get(code) as { id: number; email: string | null } | undefined;
}

/**
 * Create a referral record
 */
export function createReferral(referrerUserId: number, referredUserId: number, code: string): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO referrals (referrer_user_id, referred_user_id, referral_code, status)
    VALUES (?, ?, ?, 'pending')
  `);

  try {
    const result = stmt.run(referrerUserId, referredUserId, code);
    return result.lastInsertRowid as number;
  } catch (error) {
    // Ignore duplicates (user already referred)
    console.warn('Referral already exists:', { referrerUserId, referredUserId });
    return -1;
  }
}

/**
 * Mark referral as completed (when referred user subscribes)
 */
export function completeReferral(referralId: number): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE referrals
    SET status = 'completed',
        completed_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'pending'
  `);

  stmt.run(referralId);
}

/**
 * Grant referral reward (extend subscription for referrer)
 */
export function grantReferralReward(
  referralId: number,
  rewardType: 'free_month' | 'discount' | 'credit',
  rewardValue: number
): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE referrals
    SET status = 'rewarded',
        reward_granted = 1,
        reward_type = ?,
        reward_value = ?,
        rewarded_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(rewardType, rewardValue, referralId);
}

/**
 * Get all referrals for a user (as referrer)
 */
export function getUserReferrals(userId: number): Referral[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM referrals
    WHERE referrer_user_id = ?
    ORDER BY created_at DESC
  `);

  return stmt.all(userId) as Referral[];
}

/**
 * Get referral stats for a user
 */
export function getUserReferralStats(userId: number): {
  total_referrals: number;
  successful_conversions: number;
  rewards_earned: number;
  pending_referrals: number;
} {
  const db = getDatabase();

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_referrals,
      SUM(CASE WHEN status IN ('completed', 'rewarded') THEN 1 ELSE 0 END) as successful_conversions,
      COALESCE(SUM(CASE WHEN reward_granted = 1 THEN reward_value ELSE 0 END), 0) as rewards_earned,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_referrals
    FROM referrals
    WHERE referrer_user_id = ?
  `).get(userId) as {
    total_referrals: number;
    successful_conversions: number;
    rewards_earned: number;
    pending_referrals: number;
  };

  return stats;
}

/**
 * Get referral by referred user (to check if user was referred)
 */
export function getReferralByReferredUser(referredUserId: number): Referral | undefined {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM referrals
    WHERE referred_user_id = ?
  `);

  return stmt.get(referredUserId) as Referral | undefined;
}

/**
 * Update monthly leaderboard entry
 */
export function updateLeaderboardEntry(userId: number, month: string): void {
  const db = getDatabase();

  // Get stats for the month
  const stats = db.prepare(`
    SELECT
      COUNT(*) as referral_count,
      SUM(CASE WHEN status IN ('completed', 'rewarded') THEN 1 ELSE 0 END) as conversion_count,
      COALESCE(SUM(CASE WHEN reward_granted = 1 THEN reward_value ELSE 0 END), 0) as total_reward_value
    FROM referrals
    WHERE referrer_user_id = ?
      AND strftime('%Y-%m', created_at) = ?
  `).get(userId, month) as {
    referral_count: number;
    conversion_count: number;
    total_reward_value: number;
  };

  // Upsert leaderboard entry
  db.prepare(`
    INSERT INTO referral_leaderboard (user_id, month, referral_count, conversion_count, total_reward_value)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, month) DO UPDATE SET
      referral_count = excluded.referral_count,
      conversion_count = excluded.conversion_count,
      total_reward_value = excluded.total_reward_value,
      updated_at = CURRENT_TIMESTAMP
  `).run(userId, month, stats.referral_count, stats.conversion_count, stats.total_reward_value);

  // Update ranks for the month
  updateLeaderboardRanks(month);
}

/**
 * Update leaderboard ranks for a given month
 */
export function updateLeaderboardRanks(month: string): void {
  const db = getDatabase();

  // Get all entries for the month sorted by conversion count
  const entries = db.prepare(`
    SELECT id FROM referral_leaderboard
    WHERE month = ?
    ORDER BY conversion_count DESC, total_reward_value DESC
  `).all(month) as { id: number }[];

  // Update ranks
  const updateStmt = db.prepare('UPDATE referral_leaderboard SET rank = ? WHERE id = ?');

  entries.forEach((entry, index) => {
    updateStmt.run(index + 1, entry.id);
  });
}

/**
 * Get top referrers for a month
 */
export function getMonthlyLeaderboard(month: string, limit: number = 10): LeaderboardWithUser[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      l.*,
      u.email,
      u.first_name,
      u.last_name
    FROM referral_leaderboard l
    JOIN user_profiles u ON l.user_id = u.id
    WHERE l.month = ?
    ORDER BY l.rank ASC
    LIMIT ?
  `);

  return stmt.all(month, limit) as LeaderboardWithUser[];
}

/**
 * Get current month leaderboard
 */
export function getCurrentMonthLeaderboard(limit: number = 10): LeaderboardWithUser[] {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  return getMonthlyLeaderboard(currentMonth, limit);
}

/**
 * Get user's leaderboard position for current month
 */
export function getUserLeaderboardPosition(userId: number): LeaderboardEntry | undefined {
  const db = getDatabase();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const stmt = db.prepare(`
    SELECT * FROM referral_leaderboard
    WHERE user_id = ? AND month = ?
  `);

  return stmt.get(userId, currentMonth) as LeaderboardEntry | undefined;
}
