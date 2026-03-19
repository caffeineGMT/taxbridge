#!/usr/bin/env tsx
/**
 * Notification Cron Job
 * Runs daily to send notification reminders
 *
 * Triggers:
 * 1. Tax deadline reminders (30 days before April 15 US, April 30 Canada)
 * 2. FTC opportunity alerts
 * 3. Subscription renewal reminders (7 days before)
 * 4. New feature announcements (manual trigger)
 */

import { getDatabase } from '../db';
import {
  createNotification,
  getUsersWithUpcomingDeadlines,
  getUsersWithFTCOpportunities,
  getUsersWithUpcomingRenewals,
} from '../db/notifications';
import { sendEmail } from '../email/sendgrid';
import { getNotificationDigestEmailData } from '../email/templates';
import { logger } from '@/lib/logger';

interface NotificationJob {
  userId: number;
  email: string;
  firstName: string | null;
  notifications: Array<{
    type: 'deadline' | 'ftc_opportunity' | 'new_feature' | 'renewal';
    title: string;
    body: string;
  }>;
}

async function runNotificationCron() {
  logger.info('🔔 Starting notification cron job...\n');

  const jobs: Map<number, NotificationJob> = new Map();

  // 1. Check for tax deadline reminders (30 days before)
  logger.info('📅 Checking tax deadlines...');
  const usersWithDeadlines = getUsersWithUpcomingDeadlines(30);

  for (const user of usersWithDeadlines) {
    const deadlineType = user.deadline_type === 'us' ? 'US' : 'Canada';
    const title = `${deadlineType} Tax Deadline Approaching`;
    const body = `Your ${deadlineType} tax filing deadline (${user.deadline_date}) is 30 days away. You have ${user.rsu_count} RSU entries ready for filing.`;

    // Create in-app notification
    createNotification({
      user_id: user.user_id,
      type: 'deadline',
      title,
      body,
    });

    // Queue email
    if (!jobs.has(user.user_id)) {
      jobs.set(user.user_id, {
        userId: user.user_id,
        email: user.email,
        firstName: user.first_name,
        notifications: [],
      });
    }

    jobs.get(user.user_id)!.notifications.push({ type: 'deadline', title, body });
  }

  logger.info(`  ✓ Created ${usersWithDeadlines.length} deadline notifications\n`);

  // 2. Check for FTC opportunities
  logger.info('💰 Checking FTC opportunities...');
  const usersWithFTC = getUsersWithFTCOpportunities();

  for (const user of usersWithFTC) {
    const amount = Math.round(user.potential_ftc);
    const title = 'Foreign Tax Credit Opportunity Detected';
    const body = `You may qualify for $${amount.toLocaleString()} in foreign tax credits. Run the optimizer to claim your savings.`;

    // Create in-app notification
    createNotification({
      user_id: user.user_id,
      type: 'ftc_opportunity',
      title,
      body,
    });

    // Queue email
    if (!jobs.has(user.user_id)) {
      jobs.set(user.user_id, {
        userId: user.user_id,
        email: user.email,
        firstName: user.first_name,
        notifications: [],
      });
    }

    jobs.get(user.user_id)!.notifications.push({ type: 'ftc_opportunity', title, body });
  }

  logger.info(`  ✓ Created ${usersWithFTC.length} FTC opportunity notifications\n`);

  // 3. Check for subscription renewals (7 days before)
  logger.info('🔄 Checking subscription renewals...');
  const usersWithRenewals = getUsersWithUpcomingRenewals(7);

  for (const user of usersWithRenewals) {
    const tierName = user.subscription_tier === 'pro' ? 'Pro' : 'Enterprise';
    const price = user.subscription_tier === 'pro' ? '$299' : '$2,000';
    const title = 'Subscription Renewal Reminder';
    const body = `Your ${tierName} subscription renews in 7 days (${price}/year). Manage your billing settings anytime.`;

    // Create in-app notification
    createNotification({
      user_id: user.user_id,
      type: 'renewal',
      title,
      body,
    });

    // Queue email
    if (!jobs.has(user.user_id)) {
      jobs.set(user.user_id, {
        userId: user.user_id,
        email: user.email,
        firstName: user.first_name,
        notifications: [],
      });
    }

    jobs.get(user.user_id)!.notifications.push({ type: 'renewal', title, body });
  }

  logger.info(`  ✓ Created ${usersWithRenewals.length} renewal notifications\n`);

  // 4. Send email digests
  logger.info('📧 Sending email digests...');
  let emailsSent = 0;

  for (const [userId, job] of jobs.entries()) {
    // Check if user has email notifications enabled
    const db = getDatabase();
    const stmt = db.prepare('SELECT email_notifications_enabled FROM user_profiles WHERE id = ?');
    const userSettings = stmt.get(userId) as { email_notifications_enabled: number } | undefined;

    if (!userSettings || !userSettings.email_notifications_enabled) {
      logger.info(`  ⏭️  Skipping email for user ${userId} (notifications disabled)`);
      continue;
    }

    const emailData = getNotificationDigestEmailData({
      firstName: job.firstName || 'there',
      email: job.email,
      notifications: job.notifications,
    });

    const success = await sendEmail({
      to: job.email,
      templateId: process.env.SENDGRID_TEMPLATE_NOTIFICATION_DIGEST || 'd-notification-digest',
      dynamicData: emailData,
    });

    if (success) {
      emailsSent++;
    }
  }

  logger.info(`  ✓ Sent ${emailsSent} email digests\n`);

  // Summary
  logger.info('✅ Notification cron job completed');
  logger.info(`   Total users notified: ${jobs.size}`);
  logger.info(`   Email digests sent: ${emailsSent}\n`);
}

// Run if called directly
if (require.main === module) {
  runNotificationCron()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Notification cron job failed:', error);
      process.exit(1);
    });
}

export { runNotificationCron };
