import { getDatabase } from '@/lib/db';

/**
 * Attribution Tracking Library
 *
 * Tracks user acquisition channels, conversion funnels, and revenue attribution.
 * Integrates with PostHog for UTM parameter capture and Stripe for revenue tracking.
 */

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface ChannelConversion {
  id: number;
  user_id: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer_url: string | null;
  landing_page: string | null;
  landed_at: number | null;
  signed_up_at: number | null;
  first_calculation_at: number | null;
  upgraded_at: number | null;
  subscription_tier: string | null;
  subscription_amount: number | null;
  lifetime_value: number;
  created_at: number;
  updated_at: number;
}

export interface ChannelPerformance {
  utm_source: string;
  utm_campaign: string | null;
  total_users: number;
  signups: number;
  calculator_users: number;
  paid_conversions: number;
  signup_rate_pct: number;
  conversion_rate_pct: number;
  total_revenue: number;
  avg_revenue_per_conversion: number;
  total_ad_spend: number;
  cost_per_acquisition: number;
  roi_pct: number;
}

/**
 * Track user landing with UTM parameters (first-touch attribution)
 */
export function trackUserAttribution(
  userId: number,
  utmParams: UTMParams,
  landingPage: string,
  referrer?: string
): void {
  try {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);

    // Check if attribution already exists (first-touch only)
    const existing = db
      .prepare('SELECT id FROM channel_conversions WHERE user_id = ?')
      .get(userId);

    if (existing) {
      // Attribution already recorded (first-touch attribution model)
      return;
    }

    // Insert new attribution record
    db.prepare(`
      INSERT INTO channel_conversions (
        user_id,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        referrer_url,
        landing_page,
        landed_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      utmParams.utm_source || null,
      utmParams.utm_medium || null,
      utmParams.utm_campaign || null,
      utmParams.utm_term || null,
      utmParams.utm_content || null,
      referrer || null,
      landingPage,
      now,
      now,
      now
    );
  } catch (error) {
    console.error('Failed to track user attribution:', error);
  }
}

/**
 * Update conversion funnel event timestamps
 */
export function trackConversionEvent(
  userId: number,
  eventType: 'signed_up' | 'first_calculation' | 'upgraded',
  metadata?: {
    subscription_tier?: 'pro' | 'enterprise';
    subscription_amount?: number;
  }
): void {
  try {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);

    const fieldMap = {
      signed_up: 'signed_up_at',
      first_calculation: 'first_calculation_at',
      upgraded: 'upgraded_at',
    };

    const field = fieldMap[eventType];

    if (eventType === 'upgraded' && metadata) {
      // Track upgrade with revenue data
      db.prepare(`
        UPDATE channel_conversions
        SET ${field} = ?,
            subscription_tier = ?,
            subscription_amount = ?,
            lifetime_value = COALESCE(lifetime_value, 0) + ?,
            updated_at = ?
        WHERE user_id = ?
      `).run(
        now,
        metadata.subscription_tier || null,
        metadata.subscription_amount || null,
        metadata.subscription_amount || 0,
        now,
        userId
      );
    } else {
      // Track other conversion events
      db.prepare(`
        UPDATE channel_conversions
        SET ${field} = ?,
            updated_at = ?
        WHERE user_id = ?
      `).run(now, now, userId);
    }
  } catch (error) {
    console.error(`Failed to track ${eventType} event:`, error);
  }
}

/**
 * Get channel performance summary (last 30 days by default)
 */
export function getChannelPerformance(days = 30): ChannelPerformance[] {
  try {
    const db = getDatabase();

    const results = db.prepare(`
      SELECT
        cc.utm_source,
        cc.utm_campaign,

        -- Traffic
        COUNT(DISTINCT cc.user_id) as total_users,
        COUNT(DISTINCT CASE WHEN cc.signed_up_at IS NOT NULL THEN cc.user_id END) as signups,
        COUNT(DISTINCT CASE WHEN cc.first_calculation_at IS NOT NULL THEN cc.user_id END) as calculator_users,
        COUNT(DISTINCT CASE WHEN cc.upgraded_at IS NOT NULL THEN cc.user_id END) as paid_conversions,

        -- Conversion rates
        ROUND(
          COUNT(DISTINCT CASE WHEN cc.signed_up_at IS NOT NULL THEN cc.user_id END) * 100.0 /
          NULLIF(COUNT(DISTINCT cc.user_id), 0),
          2
        ) as signup_rate_pct,

        ROUND(
          COUNT(DISTINCT CASE WHEN cc.upgraded_at IS NOT NULL THEN cc.user_id END) * 100.0 /
          NULLIF(COUNT(DISTINCT CASE WHEN cc.signed_up_at IS NOT NULL THEN cc.user_id END), 0),
          2
        ) as conversion_rate_pct,

        -- Revenue
        COALESCE(SUM(CASE WHEN cc.upgraded_at IS NOT NULL THEN cc.subscription_amount ELSE 0 END), 0) as total_revenue,
        ROUND(
          COALESCE(SUM(CASE WHEN cc.upgraded_at IS NOT NULL THEN cc.subscription_amount ELSE 0 END), 0) /
          NULLIF(COUNT(DISTINCT CASE WHEN cc.upgraded_at IS NOT NULL THEN cc.user_id END), 0),
          2
        ) as avg_revenue_per_conversion,

        -- Ad spend
        COALESCE(
          (SELECT SUM(amount) FROM ad_spend_log
           WHERE ad_spend_log.utm_source = cc.utm_source
           AND (ad_spend_log.utm_campaign = cc.utm_campaign OR cc.utm_campaign IS NULL)
           AND spend_date >= date('now', '-${days} days')
          ),
          0
        ) as total_ad_spend,

        -- CAC
        ROUND(
          COALESCE(
            (SELECT SUM(amount) FROM ad_spend_log
             WHERE ad_spend_log.utm_source = cc.utm_source
             AND (ad_spend_log.utm_campaign = cc.utm_campaign OR cc.utm_campaign IS NULL)
             AND spend_date >= date('now', '-${days} days')
            ),
            0
          ) /
          NULLIF(COUNT(DISTINCT CASE WHEN cc.upgraded_at IS NOT NULL THEN cc.user_id END), 0),
          2
        ) as cost_per_acquisition,

        -- ROI
        ROUND(
          (COALESCE(SUM(CASE WHEN cc.upgraded_at IS NOT NULL THEN cc.subscription_amount ELSE 0 END), 0) -
           COALESCE(
             (SELECT SUM(amount) FROM ad_spend_log
              WHERE ad_spend_log.utm_source = cc.utm_source
              AND (ad_spend_log.utm_campaign = cc.utm_campaign OR cc.utm_campaign IS NULL)
              AND spend_date >= date('now', '-${days} days')
             ),
             0
           )) /
          NULLIF(
            COALESCE(
              (SELECT SUM(amount) FROM ad_spend_log
               WHERE ad_spend_log.utm_source = cc.utm_source
               AND (ad_spend_log.utm_campaign = cc.utm_campaign OR cc.utm_campaign IS NULL)
               AND spend_date >= date('now', '-${days} days')
              ),
              0
            ),
            0
          ) * 100,
          2
        ) as roi_pct

      FROM channel_conversions cc
      WHERE cc.landed_at >= unixepoch('now', '-${days} days')
        AND cc.utm_source IS NOT NULL
      GROUP BY cc.utm_source, cc.utm_campaign
      ORDER BY paid_conversions DESC, total_revenue DESC
    `).all() as ChannelPerformance[];

    return results;
  } catch (error) {
    console.error('Failed to get channel performance:', error);
    return [];
  }
}

/**
 * Get top performing channels by revenue
 */
export function getTopChannelsByRevenue(limit = 10): {
  utm_source: string;
  total_users: number;
  paid_conversions: number;
  total_revenue: number;
  conversion_rate_pct: number;
}[] {
  try {
    const db = getDatabase();

    return db.prepare(`
      SELECT
        utm_source,
        COUNT(DISTINCT user_id) as total_users,
        COUNT(DISTINCT CASE WHEN upgraded_at IS NOT NULL THEN user_id END) as paid_conversions,
        COALESCE(SUM(CASE WHEN upgraded_at IS NOT NULL THEN subscription_amount ELSE 0 END), 0) as total_revenue,

        ROUND(
          COUNT(DISTINCT CASE WHEN upgraded_at IS NOT NULL THEN user_id END) * 100.0 /
          NULLIF(COUNT(DISTINCT CASE WHEN signed_up_at IS NOT NULL THEN user_id END), 0),
          2
        ) as conversion_rate_pct

      FROM channel_conversions
      WHERE landed_at >= unixepoch('now', '-30 days')
        AND utm_source IS NOT NULL
      GROUP BY utm_source
      HAVING paid_conversions > 0
      ORDER BY total_revenue DESC
      LIMIT ?
    `).all(limit) as any[];
  } catch (error) {
    console.error('Failed to get top channels:', error);
    return [];
  }
}

/**
 * Get underperforming channels (low conversion rate, minimum traffic)
 */
export function getUnderperformingChannels(
  minSignups = 10,
  maxConversionRate = 5.0
): {
  utm_source: string;
  utm_campaign: string | null;
  total_users: number;
  signups: number;
  paid_conversions: number;
  conversion_rate_pct: number;
  total_revenue: number;
}[] {
  try {
    const db = getDatabase();

    return db.prepare(`
      SELECT
        utm_source,
        utm_campaign,
        COUNT(DISTINCT user_id) as total_users,
        COUNT(DISTINCT CASE WHEN signed_up_at IS NOT NULL THEN user_id END) as signups,
        COUNT(DISTINCT CASE WHEN upgraded_at IS NOT NULL THEN user_id END) as paid_conversions,

        ROUND(
          COUNT(DISTINCT CASE WHEN upgraded_at IS NOT NULL THEN user_id END) * 100.0 /
          NULLIF(COUNT(DISTINCT CASE WHEN signed_up_at IS NOT NULL THEN user_id END), 0),
          2
        ) as conversion_rate_pct,

        COALESCE(SUM(CASE WHEN upgraded_at IS NOT NULL THEN subscription_amount ELSE 0 END), 0) as total_revenue

      FROM channel_conversions
      WHERE landed_at >= unixepoch('now', '-30 days')
        AND signed_up_at IS NOT NULL
        AND utm_source IS NOT NULL
      GROUP BY utm_source, utm_campaign
      HAVING signups >= ?
        AND (conversion_rate_pct < ? OR conversion_rate_pct IS NULL)
      ORDER BY conversion_rate_pct ASC
    `).all(minSignups, maxConversionRate) as any[];
  } catch (error) {
    console.error('Failed to get underperforming channels:', error);
    return [];
  }
}

/**
 * Log ad spend for a channel (manual entry or API import)
 */
export function logAdSpend(
  utmSource: string,
  amount: number,
  spendDate: string, // YYYY-MM-DD
  options?: {
    utmCampaign?: string;
    platform?: string;
    campaignId?: string;
    notes?: string;
  }
): void {
  try {
    const db = getDatabase();

    db.prepare(`
      INSERT OR REPLACE INTO ad_spend_log (
        utm_source,
        utm_campaign,
        spend_date,
        amount,
        platform,
        campaign_id,
        notes,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      utmSource,
      options?.utmCampaign || null,
      spendDate,
      amount,
      options?.platform || null,
      options?.campaignId || null,
      options?.notes || null,
      Math.floor(Date.now() / 1000)
    );
  } catch (error) {
    console.error('Failed to log ad spend:', error);
  }
}

/**
 * Get total ad spend by channel
 */
export function getAdSpendByChannel(days = 30): {
  utm_source: string;
  utm_campaign: string | null;
  total_spend: number;
  spend_days: number;
}[] {
  try {
    const db = getDatabase();

    return db.prepare(`
      SELECT
        utm_source,
        utm_campaign,
        SUM(amount) as total_spend,
        COUNT(DISTINCT spend_date) as spend_days
      FROM ad_spend_log
      WHERE spend_date >= date('now', '-${days} days')
      GROUP BY utm_source, utm_campaign
      ORDER BY total_spend DESC
    `).all() as any[];
  } catch (error) {
    console.error('Failed to get ad spend by channel:', error);
    return [];
  }
}

/**
 * Get overall attribution metrics summary
 */
export function getAttributionSummary(days = 30): {
  total_users: number;
  total_signups: number;
  total_conversions: number;
  total_revenue: number;
  total_ad_spend: number;
  overall_roi: number;
  avg_cac: number;
  avg_ltv: number;
} {
  try {
    const db = getDatabase();

    const result = db.prepare(`
      SELECT
        COUNT(DISTINCT user_id) as total_users,
        COUNT(DISTINCT CASE WHEN signed_up_at IS NOT NULL THEN user_id END) as total_signups,
        COUNT(DISTINCT CASE WHEN upgraded_at IS NOT NULL THEN user_id END) as total_conversions,
        COALESCE(SUM(CASE WHEN upgraded_at IS NOT NULL THEN subscription_amount ELSE 0 END), 0) as total_revenue,

        (SELECT COALESCE(SUM(amount), 0)
         FROM ad_spend_log
         WHERE spend_date >= date('now', '-${days} days')) as total_ad_spend,

        -- ROI
        ROUND(
          (COALESCE(SUM(CASE WHEN upgraded_at IS NOT NULL THEN subscription_amount ELSE 0 END), 0) -
           (SELECT COALESCE(SUM(amount), 0) FROM ad_spend_log WHERE spend_date >= date('now', '-${days} days'))) /
          NULLIF((SELECT COALESCE(SUM(amount), 0) FROM ad_spend_log WHERE spend_date >= date('now', '-${days} days')), 0) * 100,
          2
        ) as overall_roi,

        -- CAC
        ROUND(
          (SELECT COALESCE(SUM(amount), 0) FROM ad_spend_log WHERE spend_date >= date('now', '-${days} days')) /
          NULLIF(COUNT(DISTINCT CASE WHEN upgraded_at IS NOT NULL THEN user_id END), 0),
          2
        ) as avg_cac,

        -- LTV
        ROUND(
          COALESCE(SUM(CASE WHEN upgraded_at IS NOT NULL THEN subscription_amount ELSE 0 END), 0) /
          NULLIF(COUNT(DISTINCT CASE WHEN upgraded_at IS NOT NULL THEN user_id END), 0),
          2
        ) as avg_ltv

      FROM channel_conversions
      WHERE landed_at >= unixepoch('now', '-${days} days')
    `).get() as any;

    return {
      total_users: result.total_users || 0,
      total_signups: result.total_signups || 0,
      total_conversions: result.total_conversions || 0,
      total_revenue: result.total_revenue || 0,
      total_ad_spend: result.total_ad_spend || 0,
      overall_roi: result.overall_roi || 0,
      avg_cac: result.avg_cac || 0,
      avg_ltv: result.avg_ltv || 0,
    };
  } catch (error) {
    console.error('Failed to get attribution summary:', error);
    return {
      total_users: 0,
      total_signups: 0,
      total_conversions: 0,
      total_revenue: 0,
      total_ad_spend: 0,
      overall_roi: 0,
      avg_cac: 0,
      avg_ltv: 0,
    };
  }
}
