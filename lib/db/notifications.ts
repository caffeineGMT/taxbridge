import { getDatabase } from './index';

export type NotificationType = 'deadline' | 'ftc_opportunity' | 'new_feature' | 'renewal';

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  created_at: number;
}

export interface CreateNotificationInput {
  user_id: number;
  type: NotificationType;
  title: string;
  body: string;
}

/**
 * Create a new notification
 */
export function createNotification(input: CreateNotificationInput): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO notifications (user_id, type, title, body)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(input.user_id, input.type, input.title, input.body);
  return result.lastInsertRowid as number;
}

/**
 * Get notifications for a user
 */
export function getUserNotifications(userId: number, limit = 10): Notification[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);

  return stmt.all(userId, limit) as Notification[];
}

/**
 * Get unread notification count for a user
 */
export function getUnreadCount(userId: number): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM notifications
    WHERE user_id = ? AND read = 0
  `);

  const result = stmt.get(userId) as { count: number };
  return result.count;
}

/**
 * Mark a notification as read
 */
export function markAsRead(notificationId: number): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE notifications
    SET read = 1
    WHERE id = ?
  `);

  stmt.run(notificationId);
}

/**
 * Mark all notifications as read for a user
 */
export function markAllAsRead(userId: number): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE notifications
    SET read = 1
    WHERE user_id = ? AND read = 0
  `);

  stmt.run(userId);
}

/**
 * Delete old read notifications (cleanup)
 */
export function deleteOldNotifications(daysOld = 30): number {
  const db = getDatabase();

  const cutoffTimestamp = Math.floor(Date.now() / 1000) - (daysOld * 24 * 60 * 60);

  const stmt = db.prepare(`
    DELETE FROM notifications
    WHERE read = 1 AND created_at < ?
  `);

  const result = stmt.run(cutoffTimestamp);
  return result.changes;
}

/**
 * Get users with upcoming tax deadlines (for cron job)
 */
export function getUsersWithUpcomingDeadlines(daysUntilDeadline: number): Array<{
  user_id: number;
  email: string;
  first_name: string | null;
  rsu_count: number;
  deadline_type: 'us' | 'canada';
  deadline_date: string;
}> {
  const db = getDatabase();

  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + daysUntilDeadline);

  // Check for US deadline (April 15)
  const usDeadline = new Date(now.getFullYear(), 3, 15); // April 15
  const canadaDeadline = new Date(now.getFullYear(), 3, 30); // April 30

  const users: Array<{
    user_id: number;
    email: string;
    first_name: string | null;
    rsu_count: number;
    deadline_type: 'us' | 'canada';
    deadline_date: string;
  }> = [];

  // Get users with RSU entries
  const stmt = db.prepare(`
    SELECT
      up.id as user_id,
      up.email,
      up.first_name,
      COUNT(r.id) as rsu_count
    FROM user_profiles up
    INNER JOIN rsu_entries r ON r.user_id = up.id
    WHERE up.email IS NOT NULL
    GROUP BY up.id
    HAVING rsu_count > 0
  `);

  const usersWithRSUs = stmt.all() as Array<{
    user_id: number;
    email: string;
    first_name: string | null;
    rsu_count: number;
  }>;

  // Calculate days until deadlines
  const daysUntilUS = Math.ceil((usDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilCanada = Math.ceil((canadaDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Add users if deadline is approaching
  usersWithRSUs.forEach(user => {
    if (daysUntilUS === daysUntilDeadline && daysUntilUS > 0) {
      users.push({
        ...user,
        deadline_type: 'us',
        deadline_date: usDeadline.toISOString().split('T')[0],
      });
    }
    if (daysUntilCanada === daysUntilDeadline && daysUntilCanada > 0) {
      users.push({
        ...user,
        deadline_type: 'canada',
        deadline_date: canadaDeadline.toISOString().split('T')[0],
      });
    }
  });

  return users;
}

/**
 * Get users with potential FTC opportunities (for cron job)
 */
export function getUsersWithFTCOpportunities(): Array<{
  user_id: number;
  email: string;
  first_name: string | null;
  potential_ftc: number;
}> {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      up.id as user_id,
      up.email,
      up.first_name,
      SUM(tc.ftc_eligible_usd) as potential_ftc
    FROM user_profiles up
    INNER JOIN tax_calculations tc ON tc.user_id = up.id
    WHERE up.email IS NOT NULL
      AND tc.ftc_eligible_usd > 0
      AND tc.tax_year = ?
    GROUP BY up.id
    HAVING potential_ftc > 1000
  `);

  const currentYear = new Date().getFullYear() - 1; // Last tax year
  return stmt.all(currentYear) as Array<{
    user_id: number;
    email: string;
    first_name: string | null;
    potential_ftc: number;
  }>;
}

/**
 * Get users with upcoming subscription renewals (for cron job)
 */
export function getUsersWithUpcomingRenewals(daysUntilRenewal: number): Array<{
  user_id: number;
  email: string;
  first_name: string | null;
  subscription_tier: string;
  renewal_date: string;
}> {
  const db = getDatabase();

  const targetTimestamp = Math.floor(Date.now() / 1000) + (daysUntilRenewal * 24 * 60 * 60);
  const dayAfterTarget = targetTimestamp + (24 * 60 * 60);

  const stmt = db.prepare(`
    SELECT
      id as user_id,
      email,
      first_name,
      subscription_tier,
      subscription_current_period_end as renewal_date
    FROM user_profiles
    WHERE email IS NOT NULL
      AND subscription_tier != 'free'
      AND subscription_status = 'active'
      AND datetime(subscription_current_period_end) >= datetime(?, 'unixepoch')
      AND datetime(subscription_current_period_end) < datetime(?, 'unixepoch')
  `);

  return stmt.all(targetTimestamp, dayAfterTarget) as Array<{
    user_id: number;
    email: string;
    first_name: string | null;
    subscription_tier: string;
    renewal_date: string;
  }>;
}
