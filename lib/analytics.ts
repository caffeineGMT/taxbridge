import { getDatabase } from './db';

/**
 * Supported analytics event types
 */
export type AnalyticsEvent =
  | 'user_signed_up'
  | 'profile_completed'
  | 'rsu_entry_created'
  | 'tax_calculation_viewed'
  | 'ftc_optimizer_used'
  | 'pdf_exported'
  | 'forms_checklist_opened'
  | 'upgraded_to_pro'
  | 'upgraded_to_enterprise'
  | 'downgraded_to_free'
  | 'notification_clicked'
  | 'cancellation_survey_email_sent'
  | 'cancellation_survey_submitted'
  | 'subscription_canceled'
  | 'subscription_paused'
  | 'subscription_resumed'
  | 'refund_issued'
  | 'charge_refunded'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'invoice_created';

/**
 * Track an analytics event for a user
 * @param userId - The user ID
 * @param eventName - The event name
 * @param metadata - Optional metadata as a key-value object
 */
export function trackEvent(
  userId: number,
  eventName: AnalyticsEvent,
  metadata?: Record<string, any>
): void {
  try {
    const db = getDatabase();

    const stmt = db.prepare(`
      INSERT INTO analytics_events (user_id, event_name, metadata)
      VALUES (?, ?, ?)
    `);

    stmt.run(
      userId,
      eventName,
      metadata ? JSON.stringify(metadata) : null
    );
  } catch (error) {
    // Silently fail analytics tracking to not break user experience
    console.error('Analytics tracking error:', error);
  }
}

/**
 * Get analytics events for a user
 */
export function getUserEvents(userId: number, limit = 100): AnalyticsEventRow[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM analytics_events
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);

  return stmt.all(userId, limit) as AnalyticsEventRow[];
}

/**
 * Get all analytics events with optional filters
 */
export function getEvents(options?: {
  eventName?: AnalyticsEvent;
  startDate?: number; // Unix timestamp
  endDate?: number; // Unix timestamp
  limit?: number;
}): AnalyticsEventRow[] {
  const db = getDatabase();

  let query = 'SELECT * FROM analytics_events WHERE 1=1';
  const params: any[] = [];

  if (options?.eventName) {
    query += ' AND event_name = ?';
    params.push(options.eventName);
  }

  if (options?.startDate) {
    query += ' AND created_at >= ?';
    params.push(options.startDate);
  }

  if (options?.endDate) {
    query += ' AND created_at <= ?';
    params.push(options.endDate);
  }

  query += ' ORDER BY created_at DESC';

  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }

  const stmt = db.prepare(query);
  return stmt.all(...params) as AnalyticsEventRow[];
}

/**
 * Analytics event row structure
 */
export interface AnalyticsEventRow {
  id: number;
  user_id: number;
  event_name: AnalyticsEvent;
  metadata: string | null;
  created_at: number;
}

/**
 * Get conversion funnel metrics
 */
export function getConversionFunnel() {
  const db = getDatabase();

  const signups = db
    .prepare("SELECT COUNT(*) as count FROM analytics_events WHERE event_name = 'user_signed_up'")
    .get() as { count: number };

  const profileCompleted = db
    .prepare("SELECT COUNT(*) as count FROM analytics_events WHERE event_name = 'profile_completed'")
    .get() as { count: number };

  const firstRSU = db
    .prepare("SELECT COUNT(DISTINCT user_id) as count FROM analytics_events WHERE event_name = 'rsu_entry_created'")
    .get() as { count: number };

  const upgradedToPro = db
    .prepare("SELECT COUNT(DISTINCT user_id) as count FROM analytics_events WHERE event_name IN ('upgraded_to_pro', 'upgraded_to_enterprise')")
    .get() as { count: number };

  return {
    signups: signups.count,
    profileCompleted: profileCompleted.count,
    firstRSU: firstRSU.count,
    upgradedToPro: upgradedToPro.count,
  };
}

/**
 * Get Daily Active Users (DAU) for the last N days
 */
export function getDAU(days = 30) {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT DATE(created_at, 'unixepoch') as date, COUNT(DISTINCT user_id) as count
    FROM analytics_events
    WHERE created_at >= unixepoch('now', '-${days} days')
    GROUP BY date
    ORDER BY date ASC
  `);

  return stmt.all() as Array<{ date: string; count: number }>;
}

/**
 * Get feature usage statistics
 */
export function getFeatureUsage() {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT event_name, COUNT(*) as count
    FROM analytics_events
    WHERE event_name IN (
      'tax_calculation_viewed',
      'ftc_optimizer_used',
      'pdf_exported',
      'forms_checklist_opened'
    )
    GROUP BY event_name
    ORDER BY count DESC
  `);

  return stmt.all() as Array<{ event_name: string; count: number }>;
}

/**
 * Get Monthly Recurring Revenue (MRR)
 */
export function getMRR() {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      subscription_tier as tier,
      COUNT(*) as count,
      CASE
        WHEN subscription_tier = 'pro' THEN COUNT(*) * 299
        WHEN subscription_tier = 'enterprise' THEN COUNT(*) * 2000
        ELSE 0
      END as annual_revenue
    FROM user_profiles
    WHERE subscription_tier != 'free'
    AND (subscription_status = 'active' OR subscription_status = 'trialing')
    GROUP BY subscription_tier
  `);

  const results = stmt.all() as Array<{
    tier: string;
    count: number;
    annual_revenue: number;
  }>;

  const totalAnnual = results.reduce((sum, r) => sum + r.annual_revenue, 0);
  const totalMRR = totalAnnual / 12;

  return {
    tiers: results,
    totalAnnual,
    totalMRR,
  };
}
