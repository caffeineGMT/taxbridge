/**
 * Non-Converting Calculator Users Query System
 *
 * Identifies users who completed the calculator but haven't converted to paid.
 * Used for feedback collection campaign.
 */

import { db as getDb } from './db/init';

export interface NonConvertingUser {
  userId: number;
  email: string;
  firstName: string | null;
  firstCalculationAt: string;
  lastCalculationAt: string;
  totalCalculations: number;
  daysSinceFirstCalculation: number;
  subscriptionTier: string; // Should be 'free'
  alreadySentFeedbackRequest: boolean;
}

/**
 * Get non-converting calculator users eligible for feedback request
 *
 * Criteria:
 * 1. Completed at least 1 tax calculation
 * 2. Subscription tier is 'free' (not paid)
 * 3. First calculation was 3-30 days ago (warm leads, not too old)
 * 4. Haven't been sent a feedback request yet
 */
export function getNonConvertingUsers(params: {
  minCalculations?: number;
  minDaysSinceFirst?: number;
  maxDaysSinceFirst?: number;
  limit?: number;
}): NonConvertingUser[] {
  const db = getDb;

  const {
    minCalculations = 1,
    minDaysSinceFirst = 3,
    maxDaysSinceFirst = 30,
    limit = 100,
  } = params;

  const stmt = db.prepare(`
    WITH calculator_usage AS (
      SELECT
        up.id as user_id,
        up.email,
        up.first_name,
        up.subscription_tier,
        MIN(tc.created_at) as first_calc_timestamp,
        MAX(tc.created_at) as last_calc_timestamp,
        COUNT(*) as total_calculations
      FROM user_profiles up
      LEFT JOIN tax_calculations tc ON up.id = tc.user_id
      WHERE tc.id IS NOT NULL -- Has at least one calculation
        AND up.subscription_tier = 'free' -- Not a paid customer
      GROUP BY up.id
    ),
    with_dates AS (
      SELECT
        *,
        datetime(first_calc_timestamp, 'unixepoch') as first_calculation_at,
        datetime(last_calc_timestamp, 'unixepoch') as last_calculation_at,
        CAST((julianday('now') - julianday(first_calc_timestamp, 'unixepoch')) AS INTEGER) as days_since_first
      FROM calculator_usage
    ),
    with_feedback_status AS (
      SELECT
        wd.*,
        CASE WHEN cfr.id IS NOT NULL THEN 1 ELSE 0 END as already_sent_feedback_request
      FROM with_dates wd
      LEFT JOIN calculator_feedback_requests cfr ON wd.user_id = cfr.user_id
    )
    SELECT * FROM with_feedback_status
    WHERE total_calculations >= ?
      AND days_since_first >= ?
      AND days_since_first <= ?
      AND already_sent_feedback_request = 0
    ORDER BY total_calculations DESC, days_since_first ASC
    LIMIT ?
  `);

  const results = stmt.all(
    minCalculations,
    minDaysSinceFirst,
    maxDaysSinceFirst,
    limit
  ) as any[];

  return results.map(r => ({
    userId: r.user_id,
    email: r.email,
    firstName: r.first_name,
    firstCalculationAt: r.first_calculation_at,
    lastCalculationAt: r.last_calculation_at,
    totalCalculations: r.total_calculations,
    daysSinceFirstCalculation: r.days_since_first,
    subscriptionTier: r.subscription_tier,
    alreadySentFeedbackRequest: Boolean(r.already_sent_feedback_request),
  }));
}

/**
 * Get users who need a reminder (sent initial email 5+ days ago, no response yet)
 */
export function getUsersNeedingReminder(): Array<NonConvertingUser & { discountCode: string; requestSentAt: string }> {
  const db = getDb;

  const stmt = db.prepare(`
    SELECT
      cfr.user_id,
      up.email,
      up.first_name,
      cfr.first_calculation_at,
      cfr.last_calculation_at,
      cfr.total_calculations,
      CAST((julianday('now') - julianday(cfr.first_calculation_at)) AS INTEGER) as days_since_first,
      'free' as subscription_tier,
      1 as already_sent_feedback_request,
      cfr.discount_code,
      cfr.request_sent_at
    FROM calculator_feedback_requests cfr
    INNER JOIN user_profiles up ON cfr.user_id = up.id
    WHERE cfr.responded = 0
      AND cfr.reminder_count = 0
      AND julianday('now') - julianday(cfr.request_sent_at) >= 5
    ORDER BY cfr.request_sent_at ASC
    LIMIT 50
  `);

  return stmt.all() as any[];
}

/**
 * Get campaign statistics
 */
export function getFeedbackCampaignStats(): {
  totalRequestsSent: number;
  totalResponses: number;
  totalDiscountsUsed: number;
  responseRate: number;
  discountUsageRate: number;
  responseToConversionRate: number;
  totalRemindersSent: number;
  responsesAfterReminder: number;
} {
  const db = getDb;

  const stmt = db.prepare(`
    SELECT * FROM calculator_feedback_campaign_stats
  `);

  const result = stmt.get() as any;

  return {
    totalRequestsSent: result?.total_requests_sent || 0,
    totalResponses: result?.total_responses || 0,
    totalDiscountsUsed: result?.total_discounts_used || 0,
    responseRate: result?.response_rate || 0,
    discountUsageRate: result?.discount_usage_rate || 0,
    responseToConversionRate: result?.response_to_conversion_rate || 0,
    totalRemindersSent: result?.total_reminders_sent || 0,
    responsesAfterReminder: result?.responses_after_reminder || 0,
  };
}

/**
 * Get top reasons why users didn't convert
 */
export function getTopFeedbackReasons(limit: number = 10): Array<{
  reasonCategory: string;
  responseCount: number;
  percentage: number;
  sampleResponses: string;
}> {
  const db = getDb;

  const stmt = db.prepare(`
    SELECT * FROM calculator_feedback_top_reasons
    LIMIT ?
  `);

  return stmt.all(limit) as any[];
}

/**
 * Get recent feedback responses with full details
 */
export function getRecentFeedbackResponses(limit: number = 20): Array<{
  responseId: number;
  userId: number;
  email: string;
  stoppedReason: string;
  pricePerception: string | null;
  wouldConsiderLater: boolean;
  likelihoodToPurchase: number | null;
  calculatorRating: number | null;
  submittedAt: string;
  discountCode: string;
  discountUsed: boolean;
}> {
  const db = getDb;

  const stmt = db.prepare(`
    SELECT
      cfr.id as response_id,
      cfr.user_id,
      cfr.email,
      cfr.stopped_reason,
      cfr.price_perception,
      cfr.would_consider_later,
      cfr.likelihood_to_purchase,
      cfr.calculator_rating,
      datetime(cfr.submitted_at, 'unixepoch') as submitted_at,
      cfq.discount_code,
      cfq.discount_used
    FROM calculator_feedback_responses cfr
    LEFT JOIN calculator_feedback_requests cfq ON cfr.user_id = cfq.user_id
    ORDER BY cfr.submitted_at DESC
    LIMIT ?
  `);

  return stmt.all(limit) as any[];
}
