import { getDatabase } from '@/lib/db';

export interface UserForReengagement {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  first_calculation_at: string;
  total_calculations: number;
  is_paid_user: boolean;
  email_preferences: string;
}

/**
 * Get users who completed calculator but didn't convert to paid
 * Target: Users who calculated taxes 3/7/14 days ago but haven't upgraded
 *
 * @param dayOffset - Number of days since first calculation (3, 7, or 14)
 * @param eventType - Type of re-engagement email ('reengagement_day3', 'reengagement_day7', 'reengagement_day14')
 * @returns Array of users who should receive the re-engagement email
 */
export function getUsersForReengagement(
  dayOffset: 3 | 7 | 14,
  eventType: 'reengagement_day3' | 'reengagement_day7' | 'reengagement_day14'
): UserForReengagement[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      up.id,
      up.email,
      up.first_name,
      up.last_name,
      up.created_at,
      up.email_preferences,
      cs.first_calculation_at,
      cs.total_calculations,
      COALESCE(up.subscription_status = 'active', 0) as is_paid_user
    FROM user_profiles up
    INNER JOIN calculator_sessions cs
      ON up.id = cs.user_id
    LEFT JOIN email_events ee
      ON up.id = ee.user_id
      AND ee.event_type = ?
    WHERE
      -- User has email
      up.email IS NOT NULL
      AND up.email != ''

      -- User completed calculator exactly N days ago
      AND DATE(cs.first_calculation_at) = DATE('now', '-' || ? || ' days')

      -- User is NOT a paid subscriber
      AND (up.subscription_status IS NULL OR up.subscription_status != 'active')

      -- User hasn't received this re-engagement email yet
      AND ee.id IS NULL

      -- User hasn't unsubscribed from marketing emails
      AND (
        up.email_preferences IS NULL
        OR json_extract(up.email_preferences, '$.marketing_emails') != 0
      )

      -- User has completed at least 1 calculation
      AND cs.total_calculations > 0

    ORDER BY cs.first_calculation_at ASC
  `);

  const results = stmt.all(eventType, dayOffset) as UserForReengagement[];

  return results.filter(user => {
    // Additional validation: parse email_preferences JSON
    if (!user.email_preferences) {
      return true; // Default to opted-in
    }

    try {
      const prefs = JSON.parse(user.email_preferences);
      return prefs.marketing_emails !== false;
    } catch {
      return true; // If JSON is invalid, default to opted-in
    }
  });
}

/**
 * Record calculator session (call this when user completes a calculation)
 */
export function recordCalculatorSession(
  userId: number,
  sessionId?: string
): number {
  const db = getDatabase();

  // Check if user already has a calculator session
  const existing = db.prepare(`
    SELECT id, total_calculations
    FROM calculator_sessions
    WHERE user_id = ?
  `).get(userId) as { id: number; total_calculations: number } | undefined;

  if (existing) {
    // Update existing session
    db.prepare(`
      UPDATE calculator_sessions
      SET
        last_calculation_at = CURRENT_TIMESTAMP,
        total_calculations = total_calculations + 1
      WHERE id = ?
    `).run(existing.id);

    return existing.id;
  } else {
    // Create new session
    const result = db.prepare(`
      INSERT INTO calculator_sessions (
        user_id,
        session_id,
        first_calculation_at,
        last_calculation_at,
        total_calculations
      )
      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
    `).run(userId, sessionId || `session_${Date.now()}`);

    return result.lastInsertRowid as number;
  }
}

/**
 * Record that a re-engagement email was sent
 */
export function recordReengagementEmailSent(
  userId: number,
  eventType: 'reengagement_day3' | 'reengagement_day7' | 'reengagement_day14',
  metadata?: Record<string, any>,
  abVariant?: 'A' | 'B',
  utmCampaign?: string
): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO email_events (
      user_id,
      event_type,
      sent_at,
      metadata,
      ab_variant,
      utm_source,
      utm_medium,
      utm_campaign
    )
    VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    userId,
    eventType,
    metadata ? JSON.stringify(metadata) : null,
    abVariant || 'A',
    'email',
    'reengagement-campaign',
    utmCampaign || eventType
  );

  return result.lastInsertRowid as number;
}

/**
 * Track email conversion (call this when user upgrades after receiving re-engagement email)
 */
export function trackEmailConversion(params: {
  userId: number;
  conversionType: 'calculator_to_signup' | 'free_to_pro' | 'trial_to_paid' | 'reactivation';
  revenueAmount?: number;
  discountCode?: string;
  attributionWindowHours?: number;
  metadata?: Record<string, any>;
}): boolean {
  const db = getDatabase();

  // Find the most recent re-engagement email sent to this user within attribution window
  const attributionWindow = params.attributionWindowHours || 168; // 7 days default

  const recentEmail = db.prepare(`
    SELECT id
    FROM email_events
    WHERE user_id = ?
      AND event_type IN ('reengagement_day3', 'reengagement_day7', 'reengagement_day14')
      AND julianday('now') - julianday(sent_at) <= ? / 24.0
    ORDER BY sent_at DESC
    LIMIT 1
  `).get(params.userId, attributionWindow) as { id: number } | undefined;

  const stmt = db.prepare(`
    INSERT INTO email_conversions (
      user_id,
      email_event_id,
      conversion_type,
      revenue_amount,
      discount_code,
      attribution_window_hours,
      metadata,
      converted_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  const result = stmt.run(
    params.userId,
    recentEmail?.id || null,
    params.conversionType,
    params.revenueAmount || 0,
    params.discountCode || null,
    attributionWindow,
    params.metadata ? JSON.stringify(params.metadata) : null
  );

  // Update calculator_sessions to mark as converted
  if (result.changes > 0) {
    db.prepare(`
      UPDATE calculator_sessions
      SET
        converted_to_paid = 1,
        converted_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(params.userId);
  }

  return result.changes > 0;
}

/**
 * Get re-engagement campaign performance metrics
 */
export interface ReengagementMetrics {
  event_type: string;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_conversions: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
  total_revenue: number;
  revenue_per_email: number;
}

export function getReengagementMetrics(): ReengagementMetrics[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM reengagement_performance
    ORDER BY event_type
  `);

  return stmt.all() as ReengagementMetrics[];
}

/**
 * Get conversion stats by discount code
 */
export interface DiscountCodeStats {
  discount_code: string;
  total_conversions: number;
  total_revenue: number;
  avg_revenue_per_conversion: number;
}

export function getDiscountCodeStats(): DiscountCodeStats[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      discount_code,
      COUNT(*) as total_conversions,
      SUM(revenue_amount) as total_revenue,
      ROUND(AVG(revenue_amount), 2) as avg_revenue_per_conversion
    FROM email_conversions
    WHERE discount_code IS NOT NULL
      AND conversion_type = 'free_to_pro'
    GROUP BY discount_code
    ORDER BY total_conversions DESC
  `);

  return stmt.all() as DiscountCodeStats[];
}

/**
 * Get user cohort analysis: calculator users by conversion status
 */
export interface CohortAnalysis {
  cohort_week: string;
  total_calculator_users: number;
  converted_users: number;
  conversion_rate: number;
  avg_days_to_conversion: number;
  total_revenue: number;
}

export function getCohortAnalysis(weeks: number = 12): CohortAnalysis[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      strftime('%Y-W%W', cs.first_calculation_at) as cohort_week,
      COUNT(DISTINCT cs.user_id) as total_calculator_users,
      COUNT(DISTINCT CASE WHEN cs.converted_to_paid = 1 THEN cs.user_id END) as converted_users,
      ROUND(
        CAST(COUNT(DISTINCT CASE WHEN cs.converted_to_paid = 1 THEN cs.user_id END) AS FLOAT) /
        COUNT(DISTINCT cs.user_id) * 100,
        2
      ) as conversion_rate,
      ROUND(
        AVG(
          CASE WHEN cs.converted_to_paid = 1
          THEN julianday(cs.converted_at) - julianday(cs.first_calculation_at)
          END
        ),
        1
      ) as avg_days_to_conversion,
      COALESCE(SUM(ec.revenue_amount), 0) as total_revenue
    FROM calculator_sessions cs
    LEFT JOIN email_conversions ec ON cs.user_id = ec.user_id
    WHERE cs.first_calculation_at >= date('now', '-' || ? || ' weeks')
    GROUP BY cohort_week
    ORDER BY cohort_week DESC
  `);

  return stmt.all(weeks) as CohortAnalysis[];
}

/**
 * Get users who clicked re-engagement email but didn't convert (for follow-up)
 */
export function getUsersWhoClickedButDidntConvert(): Array<{
  user_id: number;
  email: string;
  first_name: string;
  event_type: string;
  clicked_at: string;
  days_since_click: number;
}> {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      up.id as user_id,
      up.email,
      up.first_name,
      ee.event_type,
      ee.clicked_at,
      CAST(julianday('now') - julianday(ee.clicked_at) AS INTEGER) as days_since_click
    FROM email_events ee
    INNER JOIN user_profiles up ON ee.user_id = up.id
    LEFT JOIN email_conversions ec ON ee.id = ec.email_event_id
    WHERE
      ee.event_type IN ('reengagement_day3', 'reengagement_day7', 'reengagement_day14')
      AND ee.clicked_at IS NOT NULL
      AND ec.id IS NULL
      AND (up.subscription_status IS NULL OR up.subscription_status != 'active')
      AND julianday('now') - julianday(ee.clicked_at) <= 7
    ORDER BY ee.clicked_at DESC
  `);

  return stmt.all() as Array<{
    user_id: number;
    email: string;
    first_name: string;
    event_type: string;
    clicked_at: string;
    days_since_click: number;
  }>;
}

/**
 * Update email open/click tracking (webhook handlers)
 */
export function recordReengagementEmailOpened(
  userId: number,
  eventType: 'reengagement_day3' | 'reengagement_day7' | 'reengagement_day14'
): boolean {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE email_events
    SET opened_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
      AND event_type = ?
      AND opened_at IS NULL
  `);

  const result = stmt.run(userId, eventType);
  return result.changes > 0;
}

export function recordReengagementEmailClicked(
  userId: number,
  eventType: 'reengagement_day3' | 'reengagement_day7' | 'reengagement_day14'
): boolean {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE email_events
    SET
      clicked_at = CURRENT_TIMESTAMP,
      opened_at = COALESCE(opened_at, CURRENT_TIMESTAMP)
    WHERE user_id = ?
      AND event_type = ?
      AND clicked_at IS NULL
  `);

  const result = stmt.run(userId, eventType);
  return result.changes > 0;
}
