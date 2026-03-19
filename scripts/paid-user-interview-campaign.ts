#!/usr/bin/env ts-node

/**
 * Paid User Interview Campaign
 *
 * Task: [P1-HIGH] Paid User Outreach - Customer Success Interviews
 *
 * Purpose:
 * 1. Check if ANY paid users exist in the database
 * 2. If paid users exist, send them interview invitations with:
 *    - Key questions: "What almost stopped you from buying?"
 *    - Key questions: "What feature would make you refer 3 friends?"
 *    - Collect testimonials
 *    - Offer $20 Amazon gift card
 *
 * Usage:
 *   npm run tsx scripts/paid-user-interview-campaign.ts [--dry-run] [--all]
 *
 * Options:
 *   --dry-run: Preview who would receive emails without sending
 *   --all: Send to ALL paid users (default: only qualified ones)
 */

import { getPaidUsers } from '../lib/customer-success';
import {
  getInterviewInvitationEmailData,
  generateInterviewCalendarUrl,
  generateInterviewSurveyUrl,
} from '../lib/email/customer-interview-templates';
import { sendEmail } from '../lib/email/sendgrid';
import { query, queryOne, insert } from '../lib/db/unified';
import { logger } from '../lib/logger';

// Parse command line args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const sendToAll = args.includes('--all');

interface CampaignStats {
  total_paid_users: number;
  qualified_users: number;
  already_invited: number;
  emails_sent: number;
  errors: number;
}

const stats: CampaignStats = {
  total_paid_users: 0,
  qualified_users: 0,
  already_invited: 0,
  emails_sent: 0,
  errors: 0,
};

/**
 * Main campaign execution
 */
async function main() {
  console.log('📧 PAID USER INTERVIEW CAMPAIGN');
  console.log('================================\n');
  console.log(`Mode: ${isDryRun ? '🧪 DRY RUN (no emails will be sent)' : '✅ LIVE'}`);
  console.log(`Filter: ${sendToAll ? 'All paid users' : 'Qualified users only (14+ days, 1+ calculations)'}`);
  console.log('');

  try {
    // Step 1: Check if ANY paid users exist
    console.log('👥 Step 1: Checking for paid users...');
    const paidUsers = await getPaidUsers();
    stats.total_paid_users = paidUsers.length;

    if (paidUsers.length === 0) {
      console.log('');
      console.log('⚠️  NO PAID USERS FOUND');
      console.log('');
      console.log('Result: No paid users exist in the database.');
      console.log('Action: No emails will be sent.');
      console.log('');
      console.log('Revenue Status: ZERO paid users - revenue activation has not happened yet.');
      console.log('');
      return;
    }

    console.log(`✅ Found ${paidUsers.length} paid users\n`);

    // Step 2: Filter to qualified users (unless --all flag is set)
    console.log('🎯 Step 2: Filtering to qualified candidates...');

    let qualifiedUsers = paidUsers;

    if (!sendToAll) {
      // Qualification criteria:
      // - Subscribed for 14+ days (past honeymoon, has experience to share)
      // - Completed 1+ calculations (engaged with product)
      qualifiedUsers = paidUsers.filter(user =>
        user.days_since_subscription >= 14 &&
        user.calculations_completed >= 1
      );

      console.log(`Filtered ${paidUsers.length} paid users → ${qualifiedUsers.length} qualified`);
      console.log(`  • Must have: 14+ days subscribed, 1+ calculations completed`);
    } else {
      console.log(`Using all ${paidUsers.length} paid users (--all flag)`);
    }

    stats.qualified_users = qualifiedUsers.length;

    if (qualifiedUsers.length === 0) {
      console.log('');
      console.log('⚠️  NO QUALIFIED USERS');
      console.log('');
      console.log('Result: Paid users exist, but none meet qualification criteria.');
      console.log('Criteria: 14+ days subscribed AND 1+ calculations completed');
      console.log('');
      console.log('Recommendation: Wait for users to age or use --all flag to send anyway.');
      console.log('');
      return;
    }

    console.log('');

    // Step 3: Check who has already been invited (don't spam)
    console.log('🔍 Step 3: Checking for recent invitations (avoid duplicates)...');

    const targetUsers = [];
    for (const user of qualifiedUsers) {
      const recentInvite = await queryOne<any>(`
        SELECT id, invited_at FROM customer_interviews
        WHERE user_id = $1 AND invited_at > $2
        ORDER BY invited_at DESC LIMIT 1
      `, [user.id, Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60)]);

      if (recentInvite) {
        stats.already_invited++;
        const daysSinceInvite = Math.floor((Date.now() / 1000 - recentInvite.invited_at) / (60 * 60 * 24));
        console.log(`  ⏭️  ${user.email} - Already invited ${daysSinceInvite} days ago (skipping)`);
      } else {
        targetUsers.push(user);
      }
    }

    console.log(`\nFiltered ${qualifiedUsers.length} qualified → ${targetUsers.length} to invite`);
    console.log(`  • ${stats.already_invited} users already invited in last 90 days (skipped)`);
    console.log('');

    if (targetUsers.length === 0) {
      console.log('⚠️  NO USERS TO INVITE');
      console.log('');
      console.log('Result: All qualified users have already been invited recently.');
      console.log('');
      return;
    }

    // Step 4: Preview or send emails
    console.log('📨 Step 4: Sending interview invitations...\n');

    if (isDryRun) {
      console.log('🧪 DRY RUN MODE - Preview of emails that would be sent:\n');
    }

    for (const user of targetUsers) {
      try {
        // Generate URLs
        const calendarUrl = generateInterviewCalendarUrl({
          firstName: user.first_name || '',
          email: user.email || '',
          userId: user.id,
          subscriptionTier: user.subscription_tier,
        });

        const surveyUrl = generateInterviewSurveyUrl({
          email: user.email || '',
          userId: user.id,
          subscriptionTier: user.subscription_tier,
        });

        // Get email data
        const emailData = getInterviewInvitationEmailData({
          firstName: user.first_name || '',
          email: user.email || '',
          subscriptionTier: user.subscription_tier as 'pro' | 'enterprise',
          daysSinceSubscription: user.days_since_subscription,
          calculationsCompleted: user.calculations_completed,
          calendarUrl,
          surveyUrl,
        });

        if (isDryRun) {
          // Dry run - just log
          console.log(`  📧 PREVIEW: ${user.email}`);
          console.log(`     → Subject: "${emailData.subject}"`);
          console.log(`     → Tier: ${user.subscription_tier}`);
          console.log(`     → Days subscribed: ${user.days_since_subscription}`);
          console.log(`     → Calculations: ${user.calculations_completed}`);
          console.log(`     → Incentive: $20 Amazon gift card`);
          console.log(`     → Calendar: ${calendarUrl.substring(0, 50)}...`);
          console.log('');
          stats.emails_sent++;
        } else {
          // Live mode - actually send

          // 1. Create interview record in database
          const interviewId = await insert(`
            INSERT INTO customer_interviews (
              user_id, email, interview_type, status,
              video_call_url, survey_url,
              incentive_offered, subscription_tier,
              days_since_subscription, calculations_completed
            ) VALUES ($1, $2, 'video_call', 'invited', $3, $4, '$20 Amazon gift card', $5, $6, $7)
          `, [
            user.id,
            user.email,
            calendarUrl,
            surveyUrl,
            user.subscription_tier,
            user.days_since_subscription,
            user.calculations_completed,
          ]);

          // 2. Send email via SendGrid
          await sendEmail({
            to: user.email || '',
            from: {
              email: 'michael@taxbridge.app',
              name: 'Michael from TaxBridge',
            },
            subject: emailData.subject,
            templateId: 'd-interview-invite', // SendGrid template
            dynamicTemplateData: emailData,
          });

          console.log(`  ✅ SENT: ${user.email} (interview #${interviewId})`);
          console.log(`     → Subject: "${emailData.subject}"`);
          console.log(`     → Tier: ${user.subscription_tier} | Days: ${user.days_since_subscription} | Calcs: ${user.calculations_completed}`);
          console.log('');

          logger.info(`[INTERVIEW CAMPAIGN] Sent to ${user.email} (interview #${interviewId})`);
          stats.emails_sent++;
        }

      } catch (error: any) {
        console.error(`  ❌ ERROR: ${user.email} - ${error.message}`);
        logger.error(`[INTERVIEW CAMPAIGN] Failed for ${user.email}:`, error);
        stats.errors++;
      }
    }

    // Step 5: Summary
    console.log('\n================================');
    console.log('📊 CAMPAIGN SUMMARY\n');
    console.log(`Total paid users:        ${stats.total_paid_users}`);
    console.log(`Qualified users:         ${stats.qualified_users}`);
    console.log(`Already invited:         ${stats.already_invited}`);
    console.log(`Emails sent:             ${stats.emails_sent}`);
    console.log(`Errors:                  ${stats.errors}`);
    console.log('');

    if (isDryRun) {
      console.log('⚠️  DRY RUN MODE - No actual emails were sent');
      console.log('To send for real, run without --dry-run flag');
    } else {
      console.log('✅ Campaign completed successfully!');
      console.log('');
      console.log('Next Steps:');
      console.log('  1. Monitor responses via /app/admin/customer-success/page.tsx');
      console.log('  2. Watch for calendar bookings via Calendly');
      console.log('  3. Send $20 Amazon gift cards after interviews complete');
      console.log('  4. Document insights in /api/interviews/submit');
    }
    console.log('');

  } catch (error: any) {
    console.error('\n❌ FATAL ERROR:', error.message);
    logger.error('[INTERVIEW CAMPAIGN] Fatal error:', error);
    process.exit(1);
  }
}

// Execute
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
