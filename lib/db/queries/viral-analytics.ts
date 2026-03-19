/**
 * Viral Coefficient Analytics
 * Tracks and calculates viral growth metrics
 */

import { getDatabase } from '../index';

export interface ViralMetric {
  id: number;
  date: string;
  total_users: number;
  new_signups: number;
  referred_signups: number;
  viral_coefficient: number;
  calculated_at: number;
}

/**
 * Calculate viral coefficient for a given date
 * Viral Coefficient = (New users from referrals) / (Total new users)
 *
 * A coefficient > 1.0 means exponential growth (viral loop working)
 * A coefficient < 1.0 means linear growth (referrals help but not viral)
 */
export function calculateViralCoefficient(date: string): {
  total_users: number;
  new_signups: number;
  referred_signups: number;
  viral_coefficient: number;
} {
  const db = getDatabase();

  // Get total users up to this date
  const totalUsers = db.prepare(`
    SELECT COUNT(*) as count
    FROM user_profiles
    WHERE created_at <= unixepoch(?)
  `).get(date) as { count: number };

  // Get new signups on this date
  const newSignups = db.prepare(`
    SELECT COUNT(*) as count
    FROM user_profiles
    WHERE date(created_at, 'unixepoch') = ?
  `).get(date) as { count: number };

  // Get referred signups on this date
  const referredSignups = db.prepare(`
    SELECT COUNT(DISTINCT r.referred_user_id) as count
    FROM referrals r
    JOIN user_profiles u ON r.referred_user_id = u.id
    WHERE date(u.created_at, 'unixepoch') = ?
  `).get(date) as { count: number };

  // Calculate viral coefficient
  const viralCoefficient = newSignups.count > 0
    ? referredSignups.count / newSignups.count
    : 0;

  return {
    total_users: totalUsers.count,
    new_signups: newSignups.count,
    referred_signups: referredSignups.count,
    viral_coefficient: viralCoefficient,
  };
}

/**
 * Update viral metrics for a date
 */
export function updateViralMetrics(date: string): void {
  const db = getDatabase();

  const metrics = calculateViralCoefficient(date);

  db.prepare(`
    INSERT INTO viral_metrics (date, total_users, new_signups, referred_signups, viral_coefficient)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      total_users = excluded.total_users,
      new_signups = excluded.new_signups,
      referred_signups = excluded.referred_signups,
      viral_coefficient = excluded.viral_coefficient,
      calculated_at = unixepoch()
  `).run(date, metrics.total_users, metrics.new_signups, metrics.referred_signups, metrics.viral_coefficient);
}

/**
 * Get viral metrics for a date range
 */
export function getViralMetrics(startDate: string, endDate: string): ViralMetric[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM viral_metrics
    WHERE date >= ? AND date <= ?
    ORDER BY date ASC
  `);

  return stmt.all(startDate, endDate) as ViralMetric[];
}

/**
 * Get current viral coefficient (last 30 days average)
 */
export function getCurrentViralCoefficient(): {
  coefficient: number;
  total_referrals: number;
  total_new_users: number;
  trend: 'growing' | 'stable' | 'declining';
} {
  const db = getDatabase();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];

  const metrics = db.prepare(`
    SELECT
      COALESCE(AVG(viral_coefficient), 0) as avg_coefficient,
      COALESCE(SUM(referred_signups), 0) as total_referrals,
      COALESCE(SUM(new_signups), 0) as total_new_users
    FROM viral_metrics
    WHERE date >= ?
  `).get(startDate) as {
    avg_coefficient: number;
    total_referrals: number;
    total_new_users: number;
  };

  // Calculate trend (compare first 15 days vs last 15 days)
  const midDate = new Date(thirtyDaysAgo);
  midDate.setDate(midDate.getDate() + 15);
  const midDateStr = midDate.toISOString().split('T')[0];

  const firstHalf = db.prepare(`
    SELECT COALESCE(AVG(viral_coefficient), 0) as avg_coefficient
    FROM viral_metrics
    WHERE date >= ? AND date < ?
  `).get(startDate, midDateStr) as { avg_coefficient: number };

  const secondHalf = db.prepare(`
    SELECT COALESCE(AVG(viral_coefficient), 0) as avg_coefficient
    FROM viral_metrics
    WHERE date >= ?
  `).get(midDateStr) as { avg_coefficient: number };

  let trend: 'growing' | 'stable' | 'declining' = 'stable';
  if (secondHalf.avg_coefficient > firstHalf.avg_coefficient * 1.1) {
    trend = 'growing';
  } else if (secondHalf.avg_coefficient < firstHalf.avg_coefficient * 0.9) {
    trend = 'declining';
  }

  return {
    coefficient: metrics.avg_coefficient,
    total_referrals: metrics.total_referrals,
    total_new_users: metrics.total_new_users,
    trend,
  };
}

/**
 * Update today's viral metrics
 */
export function updateTodayViralMetrics(): void {
  const today = new Date().toISOString().split('T')[0];
  updateViralMetrics(today);
}

/**
 * Backfill viral metrics for past dates
 */
export function backfillViralMetrics(days: number = 30): void {
  const db = getDatabase();

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    updateViralMetrics(dateStr);
  }
}
