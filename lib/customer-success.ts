/**
 * Customer Success Utilities
 *
 * Functions for identifying paid users, calculating churn risk,
 * and managing customer success outreach campaigns.
 */

import { query, queryOne, insert } from './db/unified';
import { UserProfileRow } from './db';

export interface PaidUserProfile extends UserProfileRow {
  days_since_subscription: number;
  last_login_at: number | null;
  calculations_completed: number;
  logins_last_30_days: number;
  features_used: string[];
}

export interface ChurnRiskProfile {
  user_id: number;
  email: string;
  first_name: string | null;
  subscription_tier: string;
  churn_risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  days_since_last_login: number;
  calculations_completed: number;
  days_since_subscription: number;
  logins_last_30_days: number;
  outreach_needed: boolean;
}

export interface FeedbackSubmission {
  user_id: number;
  email: string;
  nps_score?: number;
  satisfaction_score?: number;
  upgrade_reason?: string;
  most_used_features?: string;
  missing_features?: string;
  pain_points?: string;
  general_feedback?: string;
  feature_requests?: string;
  testimonial?: string;
  subscription_tier: string;
  days_since_subscription: number;
  calculations_completed: number;
  source?: string;
  utm_campaign?: string;
}

/**
 * Get all paid users (Pro and Enterprise)
 */
export async function getPaidUsers(): Promise<PaidUserProfile[]> {
  const users = await query<UserProfileRow>(`
    SELECT * FROM user_profiles
    WHERE subscription_tier IN ('pro', 'enterprise')
    ORDER BY created_at DESC
  `);

  // Enrich with engagement metrics
  const enrichedUsers = await Promise.all(
    users.map(async (user) => {
      const daysSinceSubscription = Math.floor(
        (Date.now() / 1000 - user.created_at) / (60 * 60 * 24)
      );

      // Get calculation count
      const calcCount = await queryOne<{ count: number }>(`
        SELECT COUNT(*) as count FROM tax_calculations WHERE user_id = $1
      `, [user.id]);

      // Get last login (from activity log if exists, otherwise use updated_at)
      const lastLogin = user.updated_at;

      // Get login count last 30 days (simplified - using updated_at as proxy)
      const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
      const loginsLast30 = user.updated_at > thirtyDaysAgo ? 1 : 0;

      // Get features used (simplified)
      const features: string[] = [];
      if (calcCount && calcCount.count > 0) features.push('calculator');
      if (user.us_state || user.canada_province) features.push('profile');

      return {
        ...user,
        days_since_subscription: daysSinceSubscription,
        last_login_at: lastLogin,
        calculations_completed: calcCount?.count || 0,
        logins_last_30_days: loginsLast30,
        features_used: features,
      };
    })
  );

  return enrichedUsers;
}

/**
 * Calculate churn risk score for a paid user
 *
 * Scoring algorithm:
 * - Days since last login (0-40 points): 0 days = 0, 7 days = 20, 14 days = 40
 * - Calculations completed (0-30 points): 0 calcs = 30, 1 = 20, 3+ = 0
 * - Days since subscription (0-20 points): <7 = 0, 7-14 = 10, 14-30 = 20
 * - Logins last 30 days (0-10 points): 10+ = 0, 5-9 = 5, 0-4 = 10
 *
 * Score ranges:
 * - 0-25: Low risk
 * - 26-50: Medium risk
 * - 51-75: High risk
 * - 76-100: Critical risk
 */
export function calculateChurnRiskScore(user: PaidUserProfile): number {
  let score = 0;

  // Days since last login (max 40 points)
  const daysSinceLogin = user.last_login_at
    ? Math.floor((Date.now() / 1000 - user.last_login_at) / (60 * 60 * 24))
    : 999;

  if (daysSinceLogin >= 30) score += 40;
  else if (daysSinceLogin >= 14) score += 30;
  else if (daysSinceLogin >= 7) score += 20;
  else if (daysSinceLogin >= 3) score += 10;

  // Calculations completed (max 30 points)
  if (user.calculations_completed === 0) score += 30;
  else if (user.calculations_completed === 1) score += 20;
  else if (user.calculations_completed === 2) score += 10;

  // Days since subscription (max 20 points)
  // New users who aren't engaged are at risk
  if (user.days_since_subscription >= 14 && user.days_since_subscription <= 30) {
    score += 20;
  } else if (user.days_since_subscription >= 7 && user.days_since_subscription < 14) {
    score += 10;
  }

  // Logins last 30 days (max 10 points)
  if (user.logins_last_30_days === 0) score += 10;
  else if (user.logins_last_30_days <= 4) score += 5;

  return Math.min(score, 100);
}

/**
 * Get churn risk level from score
 */
export function getChurnRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 76) return 'critical';
  if (score >= 51) return 'high';
  if (score >= 26) return 'medium';
  return 'low';
}

/**
 * Get all users at risk of churning
 */
export async function getChurnRiskUsers(): Promise<ChurnRiskProfile[]> {
  const paidUsers = await getPaidUsers();

  const churnProfiles: ChurnRiskProfile[] = paidUsers.map(user => {
    const churnScore = calculateChurnRiskScore(user);
    const riskLevel = getChurnRiskLevel(churnScore);

    const daysSinceLogin = user.last_login_at
      ? Math.floor((Date.now() / 1000 - user.last_login_at) / (60 * 60 * 24))
      : 999;

    return {
      user_id: user.id,
      email: user.email || '',
      first_name: user.first_name,
      subscription_tier: user.subscription_tier,
      churn_risk_score: churnScore,
      risk_level: riskLevel,
      days_since_last_login: daysSinceLogin,
      calculations_completed: user.calculations_completed,
      days_since_subscription: user.days_since_subscription,
      logins_last_30_days: user.logins_last_30_days,
      outreach_needed: riskLevel === 'high' || riskLevel === 'critical',
    };
  });

  // Filter to only medium/high/critical risk
  return churnProfiles.filter(p => p.churn_risk_score >= 26);
}

/**
 * Save churn risk tracking record
 */
export async function saveChurnRiskTracking(profile: ChurnRiskProfile): Promise<number> {
  return insert(`
    INSERT INTO churn_risk_tracking (
      user_id, email, churn_risk_score, risk_level,
      days_since_last_login, calculations_completed, days_since_subscription,
      logins_last_30_days, subscription_tier, subscription_started_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `, [
    profile.user_id,
    profile.email,
    profile.churn_risk_score,
    profile.risk_level,
    profile.days_since_last_login,
    profile.calculations_completed,
    profile.days_since_subscription,
    profile.logins_last_30_days,
    profile.subscription_tier,
    Math.floor(Date.now() / 1000) - (profile.days_since_subscription * 24 * 60 * 60),
  ]);
}

/**
 * Submit customer feedback
 */
export async function submitFeedback(feedback: FeedbackSubmission): Promise<number> {
  return insert(`
    INSERT INTO customer_feedback (
      user_id, email, nps_score, satisfaction_score,
      upgrade_reason, most_used_features, missing_features, pain_points,
      general_feedback, feature_requests, testimonial,
      subscription_tier, days_since_subscription, calculations_completed,
      source, utm_campaign
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
  `, [
    feedback.user_id,
    feedback.email,
    feedback.nps_score || null,
    feedback.satisfaction_score || null,
    feedback.upgrade_reason || null,
    feedback.most_used_features || null,
    feedback.missing_features || null,
    feedback.pain_points || null,
    feedback.general_feedback || null,
    feedback.feature_requests || null,
    feedback.testimonial || null,
    feedback.subscription_tier,
    feedback.days_since_subscription,
    feedback.calculations_completed,
    feedback.source || 'email-survey',
    feedback.utm_campaign || null,
  ]);
}

/**
 * Log customer success outreach email
 */
export async function logOutreachEmail(params: {
  user_id: number;
  email: string;
  template_type: 'paid_user_checkin' | 'feedback_request' | 'churn_prevention' | 'concierge_onboarding';
  email_subject: string;
  subscription_tier: string;
  days_since_subscription: number;
  churn_risk_score?: number;
}): Promise<number> {
  return insert(`
    INSERT INTO customer_success_outreach (
      user_id, email, template_type, email_subject,
      subscription_tier, days_since_subscription, churn_risk_score
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [
    params.user_id,
    params.email,
    params.template_type,
    params.email_subject,
    params.subscription_tier,
    params.days_since_subscription,
    params.churn_risk_score || null,
  ]);
}

/**
 * Check if user has already received a specific outreach email
 */
export async function hasReceivedOutreach(
  userId: number,
  templateType: string,
  withinDays: number = 30
): Promise<boolean> {
  const cutoffTime = Math.floor(Date.now() / 1000) - (withinDays * 24 * 60 * 60);

  const result = await queryOne<{ count: number }>(`
    SELECT COUNT(*) as count FROM customer_success_outreach
    WHERE user_id = $1 AND template_type = $2 AND sent_at > $3
  `, [userId, templateType, cutoffTime]);

  return (result?.count || 0) > 0;
}

/**
 * Get users who need specific outreach
 */
export async function getUsersNeedingOutreach(
  outreachType: 'checkin' | 'feedback' | 'churn' | 'concierge'
): Promise<PaidUserProfile[]> {
  const paidUsers = await getPaidUsers();

  return paidUsers.filter(async (user) => {
    switch (outreachType) {
      case 'checkin':
        // Send check-in email 7 days after subscription
        return user.days_since_subscription === 7 &&
               !(await hasReceivedOutreach(user.id, 'paid_user_checkin', 60));

      case 'feedback':
        // Send feedback request 14 days after subscription
        return user.days_since_subscription === 14 &&
               !(await hasReceivedOutreach(user.id, 'feedback_request', 60));

      case 'churn':
        // Send churn prevention if risk is high
        const churnScore = calculateChurnRiskScore(user);
        return churnScore >= 51 &&
               !(await hasReceivedOutreach(user.id, 'churn_prevention', 14));

      case 'concierge':
        // Send concierge offer 1-3 days after subscription
        return user.days_since_subscription >= 1 &&
               user.days_since_subscription <= 3 &&
               !(await hasReceivedOutreach(user.id, 'concierge_onboarding', 60));

      default:
        return false;
    }
  });
}

/**
 * Get NPS score summary
 */
export async function getNPSSummary(): Promise<{
  total_responses: number;
  average_score: number;
  promoters: number; // 9-10
  passives: number; // 7-8
  detractors: number; // 0-6
  nps_score: number; // (promoters - detractors) / total * 100
}> {
  const results = await query<{ nps_score: number }>(`
    SELECT nps_score FROM customer_feedback
    WHERE nps_score IS NOT NULL
    ORDER BY created_at DESC
  `);

  if (results.length === 0) {
    return {
      total_responses: 0,
      average_score: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
      nps_score: 0,
    };
  }

  const promoters = results.filter(r => r.nps_score >= 9).length;
  const passives = results.filter(r => r.nps_score >= 7 && r.nps_score <= 8).length;
  const detractors = results.filter(r => r.nps_score <= 6).length;
  const total = results.length;

  const npsScore = Math.round(((promoters - detractors) / total) * 100);
  const avgScore = results.reduce((sum, r) => sum + r.nps_score, 0) / total;

  return {
    total_responses: total,
    average_score: Math.round(avgScore * 10) / 10,
    promoters,
    passives,
    detractors,
    nps_score: npsScore,
  };
}

/**
 * Get all feedback sorted by recency
 */
export async function getAllFeedback(limit: number = 50): Promise<any[]> {
  return query(`
    SELECT * FROM customer_feedback
    ORDER BY created_at DESC
    LIMIT $1
  `, [limit]);
}

/**
 * Get feedback for a specific user
 */
export async function getUserFeedback(userId: number): Promise<any[]> {
  return query(`
    SELECT * FROM customer_feedback
    WHERE user_id = $1
    ORDER BY created_at DESC
  `, [userId]);
}
