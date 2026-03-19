#!/usr/bin/env tsx
/**
 * User Interview Campaign - Automated Email Script
 *
 * Sends interview invitation emails to calculator users who haven't converted to paid.
 * Offers $20 Amazon gift card for 15-minute interview.
 *
 * Usage:
 *   npm run interview:invite               # Send to 10 eligible users (default)
 *   npm run interview:invite -- --limit=50 # Send to 50 users
 *   npm run interview:invite -- --dry-run  # Preview without sending
 *   npm run interview:remind               # Send reminders to non-responders
 */

import {
  getEligibleCalculatorUsers,
  getUsersNeedingInterviewReminder,
  recordInterviewInvitation,
  recordInterviewReminder,
  getInterviewCampaignStats,
} from '../lib/db/queries/user-interview-campaign';
import {
  getUserInterviewInvitationEmail,
  getUserInterviewReminderEmail,
  generateInterviewTrackingToken,
  generateCalendlyLink,
} from '../lib/email-templates/user-interview-campaign';

// Email sending service
async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  // TODO: Replace with actual email service (SendGrid, Resend, etc.)

  // For now, just log the email details
  console.log(`\n📧 [EMAIL] To: ${params.to}`);
  console.log(`📧 [SUBJECT] ${params.subject}`);
  console.log(`📧 [PREVIEW] ${params.text.slice(0, 300)}...\n`);

  // Placeholder - in production, use real email service:
  // Example with Resend:
  // const { Resend } = require('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'Michael @ TaxBridge <michael@taxbridge.app>',
  //   to: params.to,
  //   subject: params.subject,
  //   html: params.html,
  //   text: params.text,
  // });

  return { success: true };
}

/**
 * Send initial interview invitations
 */
async function sendInterviewInvitations(limit: number, dryRun: boolean): Promise<{
  sent: number;
  failed: number;
  skipped: number;
}> {
  console.log('🔍 Finding calculator users eligible for interviews...\n');

  const users = getEligibleCalculatorUsers({
    minCalculations: 1,
    minDaysSinceFirst: 3,
    maxDaysSinceFirst: 90,
    limit,
  });

  console.log(`✅ Found ${users.length} eligible users\n`);

  if (users.length === 0) {
    console.log('✨ No eligible users found. Eligibility criteria:');
    console.log('   - Completed at least 1 tax calculation');
    console.log('   - Subscription tier = free (not paid)');
    console.log('   - First calculation 3-90 days ago');
    console.log('   - No interview invitation sent yet');
    console.log('   - Has valid email\n');
    return { sent: 0, failed: 0, skipped: 0 };
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      // Generate tracking token
      const trackingToken = generateInterviewTrackingToken({
        userId: user.userId,
        email: user.email,
        timestamp: Date.now(),
      });

      // Generate Calendly link
      const calendlyLink = generateCalendlyLink({
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        interviewTrackingToken: trackingToken,
      });

      // Format date
      const completedDate = new Date(user.firstCalculationAt * 1000).toLocaleDateString('en-US', {
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
        calendlyLink,
        interviewTrackingToken: trackingToken,
      };

      const email = getUserInterviewInvitationEmail(emailData);

      console.log(`📬 Sending to: ${user.email}`);
      console.log(`   User ID: ${user.userId}`);
      console.log(`   Name: ${user.firstName || 'N/A'} ${user.lastName || ''}`);
      console.log(`   Calculations: ${user.totalCalculations}`);
      console.log(`   Days since first: ${user.daysSinceFirstCalculation}`);
      console.log(`   Calendly link: ${calendlyLink}`);
      console.log(`   Tracking token: ${trackingToken}`);

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
          recordInterviewInvitation({
            userId: user.userId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            firstCalculationAt: user.firstCalculationAt,
            lastCalculationAt: user.lastCalculationAt,
            totalCalculations: user.totalCalculations,
            calendlyLink,
            trackingToken,
          });

          sent++;
          console.log(`   ✅ Invitation sent successfully\n`);
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

/**
 * Send reminder emails to non-responders
 */
async function sendInterviewReminders(dryRun: boolean): Promise<{
  sent: number;
  failed: number;
  skipped: number;
}> {
  console.log('🔔 Finding users needing interview reminders...\n');

  const users = getUsersNeedingInterviewReminder();

  console.log(`✅ Found ${users.length} users needing reminders\n`);

  if (users.length === 0) {
    return { sent: 0, failed: 0, skipped: 0 };
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      // Format date
      const completedDate = new Date(user.firstCalculationAt * 1000).toLocaleDateString('en-US', {
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
        calendlyLink: user.calendlyLink,
        interviewTrackingToken: user.trackingToken,
      };

      const email = getUserInterviewReminderEmail(emailData);

      console.log(`📬 Sending reminder to: ${user.email}`);
      console.log(`   Original invitation: ${new Date(user.invitationSentAt * 1000).toLocaleDateString()}`);
      console.log(`   Reminder count: ${user.reminderCount}`);

      if (!dryRun) {
        const result = await sendEmail({
          to: user.email,
          subject: email.subject,
          html: email.html,
          text: email.text,
        });

        if (result.success) {
          // Record reminder sent
          recordInterviewReminder(user.invitationId);

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

/**
 * Display campaign statistics
 */
function displayCampaignStats() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 CAMPAIGN STATISTICS');
  console.log('='.repeat(70));

  const stats = getInterviewCampaignStats();

  console.log(`\n📧 Invitations:`);
  console.log(`   Total sent: ${stats.totalInvited}`);
  console.log(`   Bookings: ${stats.totalBooked} (${stats.conversionRate.toFixed(1)}% conversion)`);
  console.log(`   Completed: ${stats.totalCompleted} (${stats.completionRate.toFixed(1)}% completion)`);

  console.log(`\n💰 Gift Cards:`);
  console.log(`   Sent: ${stats.totalGiftCardsSent}`);
  console.log(`   Total spent: $${stats.totalSpent}`);

  console.log(`\n⏱️  Interview Metrics:`);
  if (stats.avgInterviewDuration !== null) {
    console.log(`   Average duration: ${stats.avgInterviewDuration.toFixed(1)} minutes`);
  } else {
    console.log(`   Average duration: N/A (no completed interviews yet)`);
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const remindersOnly = args.includes('--reminders-only');
  const statsOnly = args.includes('--stats');
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;

  console.log('\n' + '='.repeat(70));
  console.log('🎙️  USER INTERVIEW CAMPAIGN');
  console.log('='.repeat(70) + '\n');

  if (dryRun) {
    console.log('🔷 DRY RUN MODE - No emails will be sent\n');
  }

  // Stats only mode
  if (statsOnly) {
    displayCampaignStats();
    process.exit(0);
  }

  // Reminders only mode
  if (remindersOnly) {
    console.log('🔔 REMINDER MODE - Sending reminders to non-responders\n');
    const reminderResults = await sendInterviewReminders(dryRun);

    console.log('\n' + '='.repeat(70));
    console.log('📊 REMINDER RESULTS');
    console.log('='.repeat(70));
    console.log(`✅ Sent: ${reminderResults.sent}`);
    console.log(`❌ Failed: ${reminderResults.failed}`);
    if (dryRun) console.log(`🔷 Skipped (dry run): ${reminderResults.skipped}`);
    console.log('');

    displayCampaignStats();
    process.exit(0);
  }

  // Send initial invitations
  console.log(`📨 Sending interview invitations (limit: ${limit})\n`);
  const invitationResults = await sendInterviewInvitations(limit, dryRun);

  console.log('\n' + '='.repeat(70));
  console.log('📊 INVITATION RESULTS');
  console.log('='.repeat(70));
  console.log(`✅ Sent: ${invitationResults.sent}`);
  console.log(`❌ Failed: ${invitationResults.failed}`);
  if (dryRun) console.log(`🔷 Skipped (dry run): ${invitationResults.skipped}`);
  console.log('');

  // Also check for reminders
  const reminderResults = await sendInterviewReminders(dryRun);
  if (reminderResults.sent + reminderResults.failed + reminderResults.skipped > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('📊 REMINDER RESULTS');
    console.log('='.repeat(70));
    console.log(`✅ Sent: ${reminderResults.sent}`);
    console.log(`❌ Failed: ${reminderResults.failed}`);
    if (dryRun) console.log(`🔷 Skipped (dry run): ${reminderResults.skipped}`);
    console.log('');
  }

  // Display campaign stats
  displayCampaignStats();

  console.log('✨ Campaign complete!\n');
  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
