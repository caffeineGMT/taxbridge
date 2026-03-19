import { getDatabase } from '@/lib/db';

export interface UserForDripEmail {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  email_preferences: string;
}

export interface EmailEventRow {
  id: number;
  user_id: number;
  event_type: 'drip_day1' | 'drip_day3' | 'drip_day5' | 'drip_day7';
  sent_at: string;
  opened_at: string | null;
  clicked_at: string | null;
  metadata: string | null;
  ab_variant?: 'A' | 'B';
  utm_campaign?: string | null;
}

/**
 * Get users who should receive a drip email based on day offset
 * @param eventType - Type of drip email ('drip_day1', 'drip_day3', 'drip_day5', 'drip_day7')
 * @param dayOffset - Number of days since signup (1, 3, 5, 7)
 * @returns Array of users who should receive the email
 */
export function getUsersForDripEmail(
  eventType: 'drip_day1' | 'drip_day3' | 'drip_day5' | 'drip_day7',
  dayOffset: number
): UserForDripEmail[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      up.id,
      up.email,
      up.first_name,
      up.last_name,
      up.created_at,
      up.email_preferences
    FROM user_profiles up
    LEFT JOIN email_events ee
      ON up.id = ee.user_id
      AND ee.event_type = ?
    WHERE
      -- Email address exists
      up.email IS NOT NULL
      AND up.email != ''
      -- User was created exactly N days ago (accounting for timezone)
      AND DATE(up.created_at) = DATE('now', '-' || ? || ' days')
      -- User hasn't received this email yet
      AND ee.id IS NULL
      -- User hasn't unsubscribed from marketing emails
      AND (
        up.email_preferences IS NULL
        OR json_extract(up.email_preferences, '$.marketing_emails') != 0
      )
    ORDER BY up.created_at ASC
  `);

  const results = stmt.all(eventType, dayOffset) as UserForDripEmail[];

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
 * Record that an email was sent to a user (with A/B test tracking)
 */
export function recordEmailSent(
  userId: number,
  eventType: 'drip_day1' | 'drip_day3' | 'drip_day5' | 'drip_day7',
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
    'drip-campaign',
    utmCampaign || eventType
  );

  return result.lastInsertRowid as number;
}

/**
 * Record email open event (webhook from SendGrid)
 */
export function recordEmailOpened(userId: number, eventType: string): boolean {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE email_events
    SET opened_at = CURRENT_TIMESTAMP
    WHERE user_id = ? AND event_type = ? AND opened_at IS NULL
  `);

  const result = stmt.run(userId, eventType);
  return result.changes > 0;
}

/**
 * Record email click event (webhook from SendGrid)
 */
export function recordEmailClicked(userId: number, eventType: string): boolean {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE email_events
    SET clicked_at = CURRENT_TIMESTAMP
    WHERE user_id = ? AND event_type = ? AND clicked_at IS NULL
  `);

  const result = stmt.run(userId, eventType);
  return result.changes > 0;
}

/**
 * Get email statistics for analytics
 */
export interface EmailStats {
  event_type: string;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  open_rate: number;
  click_rate: number;
}

export function getEmailStats(eventType?: string): EmailStats[] {
  const db = getDatabase();

  let query = `
    SELECT
      event_type,
      COUNT(*) as total_sent,
      COUNT(opened_at) as total_opened,
      COUNT(clicked_at) as total_clicked,
      ROUND(CAST(COUNT(opened_at) AS FLOAT) / COUNT(*) * 100, 2) as open_rate,
      ROUND(CAST(COUNT(clicked_at) AS FLOAT) / COUNT(*) * 100, 2) as click_rate
    FROM email_events
  `;

  if (eventType) {
    query += ` WHERE event_type = ?`;
  }

  query += ` GROUP BY event_type ORDER BY event_type`;

  const stmt = db.prepare(query);
  const results = eventType ? stmt.all(eventType) : stmt.all();

  return results as EmailStats[];
}

/**
 * Update user email preferences
 */
export function updateEmailPreferences(
  email: string,
  preferences: { marketing_emails: boolean }
): boolean {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE user_profiles
    SET email_preferences = json(?),
        updated_at = CURRENT_TIMESTAMP
    WHERE email = ?
  `);

  const result = stmt.run(JSON.stringify(preferences), email);
  return result.changes > 0;
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string): UserForDripEmail | undefined {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      id,
      email,
      first_name,
      last_name,
      created_at,
      email_preferences
    FROM user_profiles
    WHERE email = ?
  `);

  return stmt.get(email) as UserForDripEmail | undefined;
}

/**
 * Check if user has unsubscribed
 */
export function hasUserUnsubscribed(email: string): boolean {
  const user = getUserByEmail(email);
  if (!user || !user.email_preferences) {
    return false;
  }

  try {
    const prefs = JSON.parse(user.email_preferences);
    return prefs.marketing_emails === false;
  } catch {
    return false;
  }
}
