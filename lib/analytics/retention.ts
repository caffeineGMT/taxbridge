/**
 * Retention Analytics Library
 * Cohort analysis, churn tracking, and re-engagement triggers
 */

import { getDatabase } from '@/lib/db';

export interface CohortRetentionData {
  cohortMonth: string;
  cohortSize: number;
  day1Retained: number;
  day7Retained: number;
  day30Retained: number;
  day1RetentionRate: number;
  day7RetentionRate: number;
  day30RetentionRate: number;
}

export interface ChurnTrigger {
  triggerId: string;
  triggerName: string;
  usersAffected: number;
  avgDaysToChurn: number;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface InactiveUser {
  userId: number;
  email: string;
  firstName: string;
  lastActiveDate: string;
  daysSinceLastActive: number;
  totalCalculations: number;
  signupDate: string;
  hasCompletedProfile: boolean;
}

/**
 * Calculate retention metrics for all cohorts
 */
export function getCohortRetentionMetrics(): CohortRetentionData[] {
  const db = getDatabase();

  const query = `
    WITH user_cohorts_calculated AS (
      SELECT
        id as user_id,
        DATE(created_at, 'unixepoch') as signup_date,
        strftime('%Y-%m', created_at, 'unixepoch') as cohort_month
      FROM user_profiles
      WHERE created_at IS NOT NULL
    ),
    user_activity AS (
      SELECT DISTINCT
        user_id,
        DATE(created_at, 'unixepoch') as activity_date
      FROM analytics_events
      WHERE event_name IN (
        'tax_calculation_viewed',
        'rsu_entry_created',
        'ftc_optimizer_used',
        'profile_completed'
      )
    ),
    cohort_retention AS (
      SELECT
        c.cohort_month,
        COUNT(DISTINCT c.user_id) as cohort_size,

        -- Day 1 retention: active on signup day or next day
        COUNT(DISTINCT CASE
          WHEN EXISTS (
            SELECT 1 FROM user_activity a
            WHERE a.user_id = c.user_id
            AND julianday(a.activity_date) - julianday(c.signup_date) BETWEEN 0 AND 1
          )
          THEN c.user_id
        END) as day_1_retained,

        -- Day 7 retention: active within 7 days
        COUNT(DISTINCT CASE
          WHEN EXISTS (
            SELECT 1 FROM user_activity a
            WHERE a.user_id = c.user_id
            AND julianday(a.activity_date) - julianday(c.signup_date) BETWEEN 6 AND 8
          )
          THEN c.user_id
        END) as day_7_retained,

        -- Day 30 retention: active within 30 days
        COUNT(DISTINCT CASE
          WHEN EXISTS (
            SELECT 1 FROM user_activity a
            WHERE a.user_id = c.user_id
            AND julianday(a.activity_date) - julianday(c.signup_date) BETWEEN 28 AND 32
          )
          THEN c.user_id
        END) as day_30_retained

      FROM user_cohorts_calculated c
      WHERE c.cohort_month IS NOT NULL
      GROUP BY c.cohort_month
      HAVING cohort_size > 0
    )
    SELECT
      cohort_month,
      cohort_size,
      day_1_retained,
      day_7_retained,
      day_30_retained,
      ROUND(CAST(day_1_retained AS REAL) / cohort_size * 100, 2) as day_1_retention_rate,
      ROUND(CAST(day_7_retained AS REAL) / cohort_size * 100, 2) as day_7_retention_rate,
      ROUND(CAST(day_30_retained AS REAL) / cohort_size * 100, 2) as day_30_retention_rate
    FROM cohort_retention
    ORDER BY cohort_month DESC
    LIMIT 12
  `;

  const stmt = db.prepare(query);
  const results = stmt.all() as any[];

  return results.map(row => ({
    cohortMonth: row.cohort_month,
    cohortSize: row.cohort_size,
    day1Retained: row.day_1_retained,
    day7Retained: row.day_7_retained,
    day30Retained: row.day_30_retained,
    day1RetentionRate: row.day_1_retention_rate,
    day7RetentionRate: row.day_7_retention_rate,
    day30RetentionRate: row.day_30_retention_rate,
  }));
}

/**
 * Identify churn triggers by analyzing user behavior patterns
 */
export function getChurnTriggers(): ChurnTrigger[] {
  const db = getDatabase();

  // Analyze common patterns among churned users
  const triggers: ChurnTrigger[] = [];

  // Trigger 1: Never completed profile
  const profileIncompleteTrigger = db.prepare(`
    SELECT COUNT(*) as count
    FROM user_profiles
    WHERE (first_name IS NULL OR us_state IS NULL OR canada_province IS NULL)
    AND created_at < unixepoch('now', '-7 days')
    AND subscription_tier = 'free'
  `).get() as { count: number };

  if (profileIncompleteTrigger.count > 0) {
    triggers.push({
      triggerId: 'incomplete_profile',
      triggerName: 'Incomplete Profile',
      usersAffected: profileIncompleteTrigger.count,
      avgDaysToChurn: 14,
      description: 'Users who never completed their profile after signup',
      priority: 'high',
    });
  }

  // Trigger 2: Zero calculations after signup
  const noCalculationsTrigger = db.prepare(`
    SELECT COUNT(DISTINCT up.id) as count
    FROM user_profiles up
    LEFT JOIN analytics_events ae ON up.id = ae.user_id
      AND ae.event_name = 'tax_calculation_viewed'
    WHERE ae.id IS NULL
    AND up.created_at < unixepoch('now', '-3 days')
    AND up.subscription_tier = 'free'
  `).get() as { count: number };

  if (noCalculationsTrigger.count > 0) {
    triggers.push({
      triggerId: 'no_calculations',
      triggerName: 'No Tax Calculations',
      usersAffected: noCalculationsTrigger.count,
      avgDaysToChurn: 7,
      description: 'Users who signed up but never ran a tax calculation',
      priority: 'high',
    });
  }

  // Trigger 3: Inactive for 14+ days (had activity before)
  const inactiveTrigger = db.prepare(`
    SELECT COUNT(DISTINCT user_id) as count
    FROM (
      SELECT
        user_id,
        MAX(created_at) as last_active
      FROM analytics_events
      GROUP BY user_id
      HAVING last_active < unixepoch('now', '-14 days')
    )
  `).get() as { count: number };

  if (inactiveTrigger.count > 0) {
    triggers.push({
      triggerId: 'inactive_14_days',
      triggerName: 'Inactive 14+ Days',
      usersAffected: inactiveTrigger.count,
      avgDaysToChurn: 30,
      description: 'Previously active users who haven\'t logged in for 14+ days',
      priority: 'medium',
    });
  }

  // Trigger 4: Free users with multiple calculations (upgrade opportunity)
  const upgradeOpportunityTrigger = db.prepare(`
    SELECT COUNT(DISTINCT ae.user_id) as count
    FROM analytics_events ae
    JOIN user_profiles up ON ae.user_id = up.id
    WHERE ae.event_name = 'tax_calculation_viewed'
    AND up.subscription_tier = 'free'
    GROUP BY ae.user_id
    HAVING COUNT(*) >= 3
  `).get() as { count: number };

  if (upgradeOpportunityTrigger.count > 0) {
    triggers.push({
      triggerId: 'upgrade_opportunity',
      triggerName: 'Power Users on Free Plan',
      usersAffected: upgradeOpportunityTrigger.count,
      avgDaysToChurn: 45,
      description: 'Free users with 3+ calculations who might churn without upgrade',
      priority: 'medium',
    });
  }

  // Trigger 5: Trial expiring soon (3 days)
  const trialExpiringTrigger = db.prepare(`
    SELECT COUNT(*) as count
    FROM user_profiles
    WHERE trial_ends_at IS NOT NULL
    AND trial_ends_at > unixepoch('now')
    AND trial_ends_at < unixepoch('now', '+3 days')
  `).get() as { count: number };

  if (trialExpiringTrigger.count > 0) {
    triggers.push({
      triggerId: 'trial_expiring',
      triggerName: 'Trial Expiring Soon',
      usersAffected: trialExpiringTrigger.count,
      avgDaysToChurn: 3,
      description: 'Users with trials expiring in the next 3 days',
      priority: 'high',
    });
  }

  return triggers.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Get list of inactive users for re-engagement campaigns
 * @param daysSinceActive - Number of days since last activity (default: 7)
 */
export function getInactiveUsers(daysSinceActive: number = 7): InactiveUser[] {
  const db = getDatabase();

  const query = `
    SELECT
      up.id as user_id,
      up.email,
      up.first_name,
      DATE(MAX(ae.created_at), 'unixepoch') as last_active_date,
      CAST((julianday('now') - julianday(MAX(ae.created_at), 'unixepoch')) AS INTEGER) as days_since_last_active,
      COUNT(DISTINCT CASE WHEN ae.event_name = 'tax_calculation_viewed' THEN ae.id END) as total_calculations,
      DATE(up.created_at, 'unixepoch') as signup_date,
      CASE WHEN up.first_name IS NOT NULL AND up.us_state IS NOT NULL THEN 1 ELSE 0 END as has_completed_profile
    FROM user_profiles up
    LEFT JOIN analytics_events ae ON up.id = ae.user_id
    WHERE up.subscription_tier = 'free'
    AND up.email IS NOT NULL
    AND up.created_at < unixepoch('now', '-${daysSinceActive} days')
    GROUP BY up.id
    HAVING MAX(ae.created_at) < unixepoch('now', '-${daysSinceActive} days')
       OR MAX(ae.created_at) IS NULL
    ORDER BY days_since_last_active DESC
    LIMIT 500
  `;

  const stmt = db.prepare(query);
  const results = stmt.all() as any[];

  return results.map(row => ({
    userId: row.user_id,
    email: row.email,
    firstName: row.first_name || 'there',
    lastActiveDate: row.last_active_date || row.signup_date,
    daysSinceLastActive: row.days_since_last_active || 999,
    totalCalculations: row.total_calculations,
    signupDate: row.signup_date,
    hasCompletedProfile: Boolean(row.has_completed_profile),
  }));
}

/**
 * Get overall retention summary statistics
 */
export interface RetentionSummary {
  totalUsers: number;
  activeLastDay: number;
  activeLast7Days: number;
  activeLast30Days: number;
  churnedUsers: number;
  overallRetentionRate: number;
  avgDaysActive: number;
}

export function getRetentionSummary(): RetentionSummary {
  const db = getDatabase();

  const totalUsers = db.prepare(`
    SELECT COUNT(*) as count FROM user_profiles
  `).get() as { count: number };

  const activeLastDay = db.prepare(`
    SELECT COUNT(DISTINCT user_id) as count
    FROM analytics_events
    WHERE created_at >= unixepoch('now', '-1 day')
  `).get() as { count: number };

  const activeLast7Days = db.prepare(`
    SELECT COUNT(DISTINCT user_id) as count
    FROM analytics_events
    WHERE created_at >= unixepoch('now', '-7 days')
  `).get() as { count: number };

  const activeLast30Days = db.prepare(`
    SELECT COUNT(DISTINCT user_id) as count
    FROM analytics_events
    WHERE created_at >= unixepoch('now', '-30 days')
  `).get() as { count: number };

  const churnedUsers = db.prepare(`
    SELECT COUNT(DISTINCT user_id) as count
    FROM (
      SELECT user_id, MAX(created_at) as last_active
      FROM analytics_events
      GROUP BY user_id
      HAVING last_active < unixepoch('now', '-30 days')
    )
  `).get() as { count: number };

  const overallRetentionRate = totalUsers.count > 0
    ? (activeLast30Days.count / totalUsers.count) * 100
    : 0;

  return {
    totalUsers: totalUsers.count,
    activeLastDay: activeLastDay.count,
    activeLast7Days: activeLast7Days.count,
    activeLast30Days: activeLast30Days.count,
    churnedUsers: churnedUsers.count,
    overallRetentionRate: Math.round(overallRetentionRate * 100) / 100,
    avgDaysActive: 0, // TODO: Calculate average days active per user
  };
}

/**
 * Mark user as contacted for re-engagement (to prevent duplicate emails)
 */
export function markUserContacted(userId: number, campaignType: string): void {
  const db = getDatabase();

  try {
    db.prepare(`
      INSERT INTO analytics_events (user_id, event_name, metadata)
      VALUES (?, 'reengagement_email_sent', ?)
    `).run(userId, JSON.stringify({ campaignType, sentAt: new Date().toISOString() }));
  } catch (error) {
    console.error('Error marking user as contacted:', error);
  }
}

/**
 * Check if user was recently contacted for re-engagement
 */
export function wasRecentlyContacted(userId: number, daysWindow: number = 7): boolean {
  const db = getDatabase();

  const result = db.prepare(`
    SELECT COUNT(*) as count
    FROM analytics_events
    WHERE user_id = ?
    AND event_name = 'reengagement_email_sent'
    AND created_at >= unixepoch('now', '-${daysWindow} days')
  `).get(userId) as { count: number };

  return result.count > 0;
}
