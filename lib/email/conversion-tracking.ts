/**
 * Email Conversion Tracking Service
 *
 * Tracks when users convert to paid after receiving drip emails
 */

import { getDatabase } from '@/lib/db';

export interface ConversionData {
  userId: number;
  conversionType: 'free_to_pro' | 'trial_to_pro' | 'referral_signup';
  revenueAmount?: number;
  discountCode?: string;
  metadata?: Record<string, any>;
}

/**
 * Track email conversion when user upgrades to paid
 *
 * This should be called from Stripe webhook handler when a subscription is created
 */
export function trackEmailConversion(data: ConversionData): boolean {
  const db = getDatabase();

  try {
    // Find the most recent email event for this user within attribution window (7 days)
    const emailEventStmt = db.prepare(`
      SELECT id, event_type, sent_at
      FROM email_events
      WHERE user_id = ?
        AND converted_to_paid = 0
        AND datetime(sent_at) >= datetime('now', '-7 days')
      ORDER BY sent_at DESC
      LIMIT 1
    `);

    const emailEvent = emailEventStmt.get(data.userId) as
      | { id: number; event_type: string; sent_at: string }
      | undefined;

    // Calculate hours since email was sent
    let attributionWindowHours = 168; // Default 7 days
    if (emailEvent) {
      const sentAt = new Date(emailEvent.sent_at);
      const now = new Date();
      attributionWindowHours = Math.round((now.getTime() - sentAt.getTime()) / (1000 * 60 * 60));
    }

    // Insert conversion record
    const conversionStmt = db.prepare(`
      INSERT INTO email_conversions (
        user_id,
        email_event_id,
        conversion_type,
        revenue_amount,
        discount_code,
        attribution_window_hours,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    conversionStmt.run(
      data.userId,
      emailEvent?.id || null,
      data.conversionType,
      data.revenueAmount || null,
      data.discountCode || null,
      attributionWindowHours,
      data.metadata ? JSON.stringify(data.metadata) : null
    );

    // Update email_events table to mark conversion
    if (emailEvent) {
      const updateStmt = db.prepare(`
        UPDATE email_events
        SET converted_to_paid = 1,
            converted_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      updateStmt.run(emailEvent.id);
    }

    console.log(`✓ Conversion tracked for user ${data.userId} (email event: ${emailEvent?.id || 'none'})`);
    return true;
  } catch (error) {
    console.error('Error tracking email conversion:', error);
    return false;
  }
}

/**
 * Get conversion statistics
 */
export interface ConversionStats {
  total_conversions: number;
  total_revenue: number;
  average_revenue_per_conversion: number;
  conversion_rate: number;
  average_attribution_window_hours: number;
}

export function getConversionStats(
  startDate?: string,
  endDate?: string
): ConversionStats {
  const db = getDatabase();

  let query = `
    SELECT
      COUNT(*) as total_conversions,
      SUM(revenue_amount) as total_revenue,
      AVG(revenue_amount) as average_revenue_per_conversion,
      AVG(attribution_window_hours) as average_attribution_window_hours
    FROM email_conversions
    WHERE 1=1
  `;

  const params: any[] = [];

  if (startDate) {
    query += ` AND datetime(converted_at) >= datetime(?)`;
    params.push(startDate);
  }

  if (endDate) {
    query += ` AND datetime(converted_at) <= datetime(?)`;
    params.push(endDate);
  }

  const stmt = db.prepare(query);
  const result = stmt.get(...params) as any;

  // Calculate conversion rate (conversions / total drip emails sent)
  const totalEmailsStmt = db.prepare(`
    SELECT COUNT(*) as total_emails
    FROM email_events
    WHERE event_type IN ('drip_welcome', 'drip_day3', 'drip_day7', 'drip_day14')
  `);

  const totalEmailsResult = totalEmailsStmt.get() as any;
  const conversionRate = totalEmailsResult.total_emails > 0
    ? (result.total_conversions / totalEmailsResult.total_emails) * 100
    : 0;

  return {
    total_conversions: result.total_conversions || 0,
    total_revenue: result.total_revenue || 0,
    average_revenue_per_conversion: result.average_revenue_per_conversion || 0,
    conversion_rate: Math.round(conversionRate * 100) / 100,
    average_attribution_window_hours: result.average_attribution_window_hours || 0,
  };
}

/**
 * Get conversions by email type
 */
export interface ConversionByEmailType {
  event_type: string;
  total_conversions: number;
  conversion_rate: number;
  total_revenue: number;
}

export function getConversionsByEmailType(): ConversionByEmailType[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      ee.event_type,
      COUNT(ec.id) as total_conversions,
      SUM(ec.revenue_amount) as total_revenue,
      ROUND(CAST(COUNT(ec.id) AS FLOAT) / COUNT(ee.id) * 100, 2) as conversion_rate
    FROM email_events ee
    LEFT JOIN email_conversions ec ON ee.id = ec.email_event_id
    WHERE ee.event_type IN ('drip_welcome', 'drip_day3', 'drip_day7', 'drip_day14')
    GROUP BY ee.event_type
    ORDER BY ee.event_type
  `);

  return stmt.all() as ConversionByEmailType[];
}
