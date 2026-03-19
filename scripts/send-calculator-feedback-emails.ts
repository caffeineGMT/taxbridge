#!/usr/bin/env tsx
/**
 * Send Calculator Feedback Emails - Automation Script
 *
 * Sends feedback collection emails to non-converting calculator users.
 * Offers 20% discount for their feedback.
 *
 * Usage:
 *   npm run feedback:send               # Send to eligible users (default: 10)
 *   npm run feedback:send -- --limit 50 # Send to 50 users
 *   npm run feedback:send -- --dry-run  # Preview without sending
 */

import { getNonConvertingUsers, getUsersNeedingReminder } from '../lib/queries/non-converting-users';
import { generateDiscountCode } from '../lib/discount-codes';
import {
  getCalculatorFeedbackEmail,
  getCalculatorFeedbackReminderEmail,
} from '../lib/email-templates/calculator-feedback';
import { db as getDb } from '../lib/db/init';
import crypto from 'crypto';

// Email sending service (placeholder - replace with actual service)
async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  // TODO: Replace with actual email service (SendGrid, Resend, etc.)
  console.log(`📧 [EMAIL] To: ${params.to}`);
  console.log(`📧 [SUBJECT] ${params.subject}`);
  console.log(`📧 [PREVIEW] ${params.text.slice(0, 200)}...`);

  // Placeholder - in production, use real email service
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  // await sgMail.send({
  //   to: params.to,
  //   from: 'michael@taxbridge.app',
  //   subject: params.subject,
  //   html: params.html,
  //   text: params.text,
  // });

  return { success: true };
}

async function sendInitialFeedbackEmails(limit: number, dryRun: boolean): Promise<{
  sent: number;
  failed: number;
  skipped: number;
}> {
  console.log('🔍 Finding non-converting calculator users...\n');

  const users = getNonConvertingUsers({
    minCalculations: 1,
    minDaysSinceFirst: 3,
    maxDaysSinceFirst: 30,
    limit,
  });

  console.log(`✅ Found ${users.length} eligible users\n`);

  if (users.length === 0) {
    console.log('✨ No eligible users found. Campaign criteria:');
    console.log('   - Completed at least 1 tax calculation');
    console.log('   - Subscription tier = free (not paid)');
    console.log('   - First calculation 3-30 days ago');
    console.log('   - No feedback request sent yet\n');
    return { sent: 0, failed: 0, skipped: 0 };
  }

  const db = getDb;
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      // Generate unique discount code (20% off, valid 30 days)
      const discount = generateDiscountCode({
        userId: user.userId,
        email: user.email,
        discountPercent: 20,
        validDays: 30,
        createdFor: 'calculator_feedback',
        metadata: {
          campaign: 'feedback_2026_q1',
          totalCalculations: user.totalCalculations,
          daysSinceFirst: user.daysSinceFirstCalculation,
        },
      });

      // Generate secure tracking token
      const token = crypto
        .createHash('sha256')
        .update(`${user.userId}-calculator-feedback-2026`)
        .digest('hex')
        .slice(0, 16);

      // Build response tracking link
      const responseLink = `https://taxbridge.app/feedback-response?userId=${user.userId}&token=${token}`;

      // Format date
      const completedDate = new Date(user.firstCalculationAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      // Generate email
      const emailData = {
        firstName: user.firstName || 'there',
        email: user.email,
        calculatorCompletedAt: completedDate,
        totalCalculations: user.totalCalculations,
        responseTrackingLink: responseLink,
        discountCode: discount.code,
      };

      const email = getCalculatorFeedbackEmail(emailData);

      console.log(`📬 Sending to: ${user.email}`);
      console.log(`   User ID: ${user.userId}`);
      console.log(`   Calculations: ${user.totalCalculations}`);
      console.log(`   Days since first: ${user.daysSinceFirstCalculation}`);
      console.log(`   Discount code: ${discount.code}`);
      console.log(`   Response link: ${responseLink}`);

      if (!dryRun) {
        // Send email
        const result = await sendEmail({
          to: user.email,
          subject: email.subject,
          html: email.html,
          text: email.text,
        });

        if (result.success) {
          // Record in database
          db.prepare(`
            INSERT INTO calculator_feedback_requests (
              user_id, email, first_calculation_at, last_calculation_at,
              total_calculations, request_sent_at, discount_code,
              utm_campaign, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'feedback_campaign_2026_q1', ?, ?)
          `).run(
            user.userId,
            user.email,
            user.firstCalculationAt,
            user.lastCalculationAt,
            user.totalCalculations,
            new Date().toISOString(),
            discount.code,
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000)
          );

          sent++;
          console.log(`   ✅ Sent successfully\n`);
        } else {
          failed++;
          console.error(`   ❌ Failed: ${result.error}\n`);
        }
      } else {
        skipped++;
        console.log(`   🔷 DRY RUN - Email not sent\n`);
      }

    } catch (error: any) {
      failed++;
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }

  return { sent, failed, skipped };
}

async function sendReminderEmails(dryRun: boolean): Promise<{
  sent: number;
  failed: number;
  skipped: number;
}> {
  console.log('🔔 Finding users needing reminders...\n');

  const users = getUsersNeedingReminder();

  console.log(`✅ Found ${users.length} users needing reminders\n`);

  if (users.length === 0) {
    return { sent: 0, failed: 0, skipped: 0 };
  }

  const db = getDb;
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      // Generate secure tracking token
      const token = crypto
        .createHash('sha256')
        .update(`${user.userId}-calculator-feedback-2026`)
        .digest('hex')
        .slice(0, 16);

      // Build response tracking link
      const responseLink = `https://taxbridge.app/feedback-response?userId=${user.userId}&token=${token}`;

      // Format date
      const completedDate = new Date(user.firstCalculationAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      // Generate reminder email
      const emailData = {
        firstName: user.firstName || 'there',
        email: user.email,
        calculatorCompletedAt: completedDate,
        totalCalculations: user.totalCalculations,
        responseTrackingLink: responseLink,
        discountCode: user.discountCode,
      };

      const email = getCalculatorFeedbackReminderEmail(emailData);

      console.log(`📬 Sending reminder to: ${user.email}`);
      console.log(`   Original request: ${new Date(user.requestSentAt).toLocaleDateString()}`);
      console.log(`   Discount code: ${user.discountCode}`);

      if (!dryRun) {
        const result = await sendEmail({
          to: user.email,
          subject: email.subject,
          html: email.html,
          text: email.text,
        });

        if (result.success) {
          // Update database
          db.prepare(`
            UPDATE calculator_feedback_requests
            SET reminder_sent_at = ?, reminder_count = reminder_count + 1, updated_at = ?
            WHERE user_id = ?
          `).run(
            new Date().toISOString(),
            Math.floor(Date.now() / 1000),
            user.userId
          );

          sent++;
          console.log(`   ✅ Reminder sent\n`);
        } else {
          failed++;
          console.error(`   ❌ Failed: ${result.error}\n`);
        }
      } else {
        skipped++;
        console.log(`   🔷 DRY RUN - Reminder not sent\n`);
      }

    } catch (error: any) {
      failed++;
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }

  return { sent, failed, skipped };
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const remindersOnly = args.includes('--reminders-only');
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;

  console.log('\n' + '='.repeat(70));
  console.log('📧 CALCULATOR FEEDBACK EMAIL CAMPAIGN');
  console.log('='.repeat(70) + '\n');

  if (dryRun) {
    console.log('🔷 DRY RUN MODE - No emails will be sent\n');
  }

  if (remindersOnly) {
    // Send reminders only
    console.log('🔔 REMINDER MODE - Sending reminders to non-responders\n');
    const reminderResults = await sendReminderEmails(dryRun);

    console.log('\n' + '='.repeat(70));
    console.log('📊 REMINDER RESULTS');
    console.log('='.repeat(70));
    console.log(`✅ Sent: ${reminderResults.sent}`);
    console.log(`❌ Failed: ${reminderResults.failed}`);
    if (dryRun) console.log(`🔷 Skipped (dry run): ${reminderResults.skipped}`);
    console.log('');

  } else {
    // Send initial emails
    console.log(`📨 Sending initial feedback requests (limit: ${limit})\n`);
    const initialResults = await sendInitialFeedbackEmails(limit, dryRun);

    console.log('\n' + '='.repeat(70));
    console.log('📊 INITIAL EMAIL RESULTS');
    console.log('='.repeat(70));
    console.log(`✅ Sent: ${initialResults.sent}`);
    console.log(`❌ Failed: ${initialResults.failed}`);
    if (dryRun) console.log(`🔷 Skipped (dry run): ${initialResults.skipped}`);
    console.log('');

    // Also check for reminders
    const reminderResults = await sendReminderEmails(dryRun);
    if (reminderResults.sent + reminderResults.failed + reminderResults.skipped > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('📊 REMINDER RESULTS');
      console.log('='.repeat(70));
      console.log(`✅ Sent: ${reminderResults.sent}`);
      console.log(`❌ Failed: ${reminderResults.failed}`);
      if (dryRun) console.log(`🔷 Skipped (dry run): ${reminderResults.skipped}`);
      console.log('');
    }
  }

  console.log('✨ Campaign complete!\n');
  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
