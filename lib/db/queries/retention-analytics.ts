/**
 * Retention Analytics Queries
 * Database queries for cohort analysis, retention rates, and churn analysis
 */

import { query, queryOne, insert, getDatabase, isPostgres } from '../unified';

// ============================================================================
// COHORT MANAGEMENT
// ============================================================================

export interface UserCohort {
  id: number;
  user_id: number;
  cohort_date: string;
  cohort_week: string;
  cohort_month: string;
  signup_source?: string;
  signup_utm_campaign?: string;
  signup_utm_source?: string;
  signup_utm_medium?: string;
  created_at: number;
}

/**
 * Assign user to cohort (called on user signup)
 */
export async function assignUserToCohort(
  userId: number,
  signupDate: Date,
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  }
): Promise<number> {
  const cohortDate = signupDate.toISOString().split('T')[0];
  const cohortWeek = getISOWeek(signupDate);
  const cohortMonth = cohortDate.substring(0, 7); // YYYY-MM

  return insert(
    `
    INSERT INTO user_cohorts (
      user_id, cohort_date, cohort_week, cohort_month,
      signup_utm_source, signup_utm_medium, signup_utm_campaign
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT(user_id) DO NOTHING
  `,
    [
      userId,
      cohortDate,
      cohortWeek,
      cohortMonth,
      utm?.source || null,
      utm?.medium || null,
      utm?.campaign || null,
    ]
  );
}

/**
 * Get ISO week format (YYYY-Www)
 */
function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = Math.ceil(
    ((d.getTime() - week1.getTime()) / 86400000 + 1) / 7
  );
  return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

// ============================================================================
// ACTIVITY TRACKING
// ============================================================================

export interface UserActivity {
  id: number;
  user_id: number;
  activity_date: string;
  activity_type: string;
  metadata?: string;
  created_at: number;
}

/**
 * Log user activity for retention calculation
 */
export async function logUserActivity(
  userId: number,
  activityType: string,
  metadata?: Record<string, any>
): Promise<number> {
  const activityDate = new Date().toISOString().split('T')[0];

  return insert(
    `
    INSERT INTO user_activity_log (user_id, activity_date, activity_type, metadata)
    VALUES ($1, $2, $3, $4)
  `,
    [userId, activityDate, activityType, metadata ? JSON.stringify(metadata) : null]
  );
}

/**
 * Get last activity date for a user
 */
export async function getLastActivityDate(userId: number): Promise<string | null> {
  const result = await queryOne<{ activity_date: string }>(
    `
    SELECT activity_date
    FROM user_activity_log
    WHERE user_id = $1
    ORDER BY activity_date DESC
    LIMIT 1
  `,
    [userId]
  );

  return result?.activity_date || null;
}

// ============================================================================
// RETENTION CALCULATIONS
// ============================================================================

export interface RetentionData {
  cohort_month: string;
  cohort_size: number;
  day_1_retained: number;
  day_7_retained: number;
  day_30_retained: number;
  day_90_retained: number;
  day_1_retention_rate: number;
  day_7_retention_rate: number;
  day_30_retention_rate: number;
  day_90_retention_rate: number;
}

/**
 * Calculate retention rates for a specific cohort month
 */
export async function calculateRetentionRates(
  cohortMonth: string
): Promise<RetentionData | null> {
  const result = await queryOne<RetentionData>(
    `
    WITH cohort_users AS (
      SELECT user_id, cohort_date
      FROM user_cohorts
      WHERE cohort_month = $1
    ),
    retention_check AS (
      SELECT
        cu.user_id,
        MAX(CASE
          WHEN ${isPostgres ? 'EXTRACT(EPOCH FROM (CAST(a.activity_date AS DATE) - CAST(cu.cohort_date AS DATE)))::INTEGER / 86400' : 'julianday(a.activity_date) - julianday(cu.cohort_date)'} BETWEEN 1 AND 1
          THEN 1 ELSE 0
        END) as retained_day_1,
        MAX(CASE
          WHEN ${isPostgres ? 'EXTRACT(EPOCH FROM (CAST(a.activity_date AS DATE) - CAST(cu.cohort_date AS DATE)))::INTEGER / 86400' : 'julianday(a.activity_date) - julianday(cu.cohort_date)'} BETWEEN 1 AND 7
          THEN 1 ELSE 0
        END) as retained_day_7,
        MAX(CASE
          WHEN ${isPostgres ? 'EXTRACT(EPOCH FROM (CAST(a.activity_date AS DATE) - CAST(cu.cohort_date AS DATE)))::INTEGER / 86400' : 'julianday(a.activity_date) - julianday(cu.cohort_date)'} BETWEEN 1 AND 30
          THEN 1 ELSE 0
        END) as retained_day_30,
        MAX(CASE
          WHEN ${isPostgres ? 'EXTRACT(EPOCH FROM (CAST(a.activity_date AS DATE) - CAST(cu.cohort_date AS DATE)))::INTEGER / 86400' : 'julianday(a.activity_date) - julianday(cu.cohort_date)'} BETWEEN 1 AND 90
          THEN 1 ELSE 0
        END) as retained_day_90
      FROM cohort_users cu
      LEFT JOIN user_activity_log a ON a.user_id = cu.user_id
      GROUP BY cu.user_id
    )
    SELECT
      $1 as cohort_month,
      COUNT(*) as cohort_size,
      SUM(retained_day_1) as day_1_retained,
      SUM(retained_day_7) as day_7_retained,
      SUM(retained_day_30) as day_30_retained,
      SUM(retained_day_90) as day_90_retained,
      ROUND(SUM(retained_day_1) * 100.0 / COUNT(*), 2) as day_1_retention_rate,
      ROUND(SUM(retained_day_7) * 100.0 / COUNT(*), 2) as day_7_retention_rate,
      ROUND(SUM(retained_day_30) * 100.0 / COUNT(*), 2) as day_30_retention_rate,
      ROUND(SUM(retained_day_90) * 100.0 / COUNT(*), 2) as day_90_retention_rate
    FROM retention_check
  `,
    [cohortMonth]
  );

  return result;
}

/**
 * Get retention data for all cohorts (last 12 months)
 */
export async function getAllCohortRetention(): Promise<RetentionData[]> {
  return query<RetentionData>(
    `
    SELECT DISTINCT cohort_month
    FROM user_cohorts
    WHERE cohort_month >= ${isPostgres ? "TO_CHAR(NOW() - INTERVAL '12 months', 'YYYY-MM')" : "date('now', '-12 months')"}
    ORDER BY cohort_month DESC
  `
  ).then(async (cohorts) => {
    const results: RetentionData[] = [];
    for (const cohort of cohorts) {
      const data = await calculateRetentionRates(cohort.cohort_month);
      if (data) results.push(data);
    }
    return results;
  });
}

/**
 * Save retention snapshot (for performance optimization)
 */
export async function saveRetentionSnapshot(data: RetentionData): Promise<void> {
  const snapshotDate = new Date().toISOString().split('T')[0];

  if (isPostgres) {
    await query(
      `
      INSERT INTO retention_snapshots (
        cohort_month, cohort_size,
        day_1_retained, day_7_retained, day_30_retained, day_90_retained,
        snapshot_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (cohort_month, snapshot_date)
      DO UPDATE SET
        cohort_size = $2,
        day_1_retained = $3,
        day_7_retained = $4,
        day_30_retained = $5,
        day_90_retained = $6
    `,
      [
        data.cohort_month,
        data.cohort_size,
        data.day_1_retained,
        data.day_7_retained,
        data.day_30_retained,
        data.day_90_retained,
        snapshotDate,
      ]
    );
  } else {
    await query(
      `
      INSERT OR REPLACE INTO retention_snapshots (
        cohort_month, cohort_size,
        day_1_retained, day_7_retained, day_30_retained, day_90_retained,
        snapshot_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [
        data.cohort_month,
        data.cohort_size,
        data.day_1_retained,
        data.day_7_retained,
        data.day_30_retained,
        data.day_90_retained,
        snapshotDate,
      ]
    );
  }
}

// ============================================================================
// CHURN ANALYSIS
// ============================================================================

export interface ChurnSurveyResponse {
  id: number;
  user_id: number;
  survey_token: string;
  primary_reason: string;
  secondary_reasons?: string;
  feature_requests?: string;
  satisfaction_score?: number;
  would_recommend?: boolean;
  would_return?: boolean;
  feedback_text?: string;
  subscription_duration_days?: number;
  total_calculations?: number;
  last_active_date?: string;
  submitted_at: number;
}

/**
 * Record churn survey response
 */
export async function recordChurnSurvey(data: {
  userId: number;
  surveyToken: string;
  primaryReason: string;
  secondaryReasons?: string[];
  featureRequests?: string;
  satisfactionScore?: number;
  wouldRecommend?: boolean;
  wouldReturn?: boolean;
  feedbackText?: string;
  subscriptionDurationDays?: number;
  totalCalculations?: number;
  lastActiveDate?: string;
}): Promise<number> {
  return insert(
    `
    INSERT INTO churn_survey_responses (
      user_id, survey_token, primary_reason, secondary_reasons,
      feature_requests, satisfaction_score, would_recommend, would_return,
      feedback_text, subscription_duration_days, total_calculations, last_active_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `,
    [
      data.userId,
      data.surveyToken,
      data.primaryReason,
      data.secondaryReasons ? JSON.stringify(data.secondaryReasons) : null,
      data.featureRequests || null,
      data.satisfactionScore || null,
      data.wouldRecommend ?? null,
      data.wouldReturn ?? null,
      data.feedbackText || null,
      data.subscriptionDurationDays || null,
      data.totalCalculations || null,
      data.lastActiveDate || null,
    ]
  );
}

export interface ChurnReasonSummary {
  primary_reason: string;
  response_count: number;
  percentage: number;
  avg_satisfaction: number;
  return_likelihood_pct: number;
}

/**
 * Get aggregated churn reasons
 */
export async function getChurnReasonsSummary(): Promise<ChurnReasonSummary[]> {
  return query<ChurnReasonSummary>(`
    SELECT * FROM churn_reasons_summary
  `);
}

/**
 * Get all churn survey responses
 */
export async function getAllChurnSurveys(): Promise<ChurnSurveyResponse[]> {
  return query<ChurnSurveyResponse>(`
    SELECT * FROM churn_survey_responses
    ORDER BY submitted_at DESC
  `);
}

// ============================================================================
// FEATURE USAGE TRACKING
// ============================================================================

export interface FeatureUsage {
  id: number;
  user_id: number;
  feature_name: string;
  usage_date: string;
  usage_count: number;
  total_time_seconds: number;
  created_at: number;
  updated_at: number;
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(
  userId: number,
  featureName: string,
  timeSeconds: number = 0
): Promise<void> {
  const usageDate = new Date().toISOString().split('T')[0];

  if (isPostgres) {
    await query(
      `
      INSERT INTO feature_usage (user_id, feature_name, usage_date, usage_count, total_time_seconds)
      VALUES ($1, $2, $3, 1, $4)
      ON CONFLICT (user_id, feature_name, usage_date)
      DO UPDATE SET
        usage_count = feature_usage.usage_count + 1,
        total_time_seconds = feature_usage.total_time_seconds + $4,
        updated_at = EXTRACT(EPOCH FROM NOW())::BIGINT
    `,
      [userId, featureName, usageDate, timeSeconds]
    );
  } else {
    await query(
      `
      INSERT INTO feature_usage (user_id, feature_name, usage_date, usage_count, total_time_seconds)
      VALUES ($1, $2, $3, 1, $4)
      ON CONFLICT (user_id, feature_name, usage_date)
      DO UPDATE SET
        usage_count = usage_count + 1,
        total_time_seconds = total_time_seconds + $4,
        updated_at = unixepoch()
    `,
      [userId, featureName, usageDate, timeSeconds]
    );
  }
}

export interface FeatureRetentionCorrelation {
  feature_name: string;
  users_using_feature: number;
  day_30_retained: number;
  retention_rate_pct: number;
  avg_usage_per_user: number;
  total_usages: number;
}

/**
 * Get feature usage correlation with retention
 */
export async function getFeatureRetentionCorrelation(): Promise<
  FeatureRetentionCorrelation[]
> {
  return query<FeatureRetentionCorrelation>(`
    SELECT * FROM feature_retention_correlation
  `);
}

/**
 * Get top features by usage
 */
export async function getTopFeatures(limit: number = 10): Promise<
  Array<{
    feature_name: string;
    total_users: number;
    total_usage_count: number;
    avg_time_seconds: number;
  }>
> {
  return query(
    `
    SELECT
      feature_name,
      COUNT(DISTINCT user_id) as total_users,
      SUM(usage_count) as total_usage_count,
      ROUND(AVG(total_time_seconds), 2) as avg_time_seconds
    FROM feature_usage
    WHERE usage_date >= ${isPostgres ? "CURRENT_DATE - INTERVAL '30 days'" : "date('now', '-30 days')"}
    GROUP BY feature_name
    ORDER BY total_usage_count DESC
    LIMIT $1
  `,
    [limit]
  );
}
