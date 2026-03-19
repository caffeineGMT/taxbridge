/**
 * Customer Success Outreach Script
 *
 * Run this script to:
 * 1. Identify all paid users
 * 2. Calculate churn risks
 * 3. Send appropriate outreach emails
 * 4. Log all activities
 *
 * Usage: node scripts/customer-success-outreach.ts [--dry-run] [--type=all|checkin|feedback|churn|concierge]
 */

import {
  getPaidUsers,
  getChurnRiskUsers,
  saveChurnRiskTracking,
  logOutreachEmail,
  hasReceivedOutreach,
  calculateChurnRiskScore,
  getChurnRiskLevel,
} from '../lib/customer-success';

import { sendEmail } from '../lib/email/sendgrid';

import {
  getPaidUserCheckinEmailData,
  getFeedbackRequestEmailData,
  getChurnPreventionEmailData,
  getConciergeOnboardingEmailData,
  generateFeedbackSurveyUrl,
  generateCalendarUrl,
  generateCancellationUrl,
  CUSTOMER_SUCCESS_TEMPLATES,
} from '../lib/email/customer-success-templates';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const typeArg = args.find(arg => arg.startsWith('--type='));
const outreachType = typeArg ? typeArg.split('=')[1] : 'all';

console.log('🎯 Customer Success Outreach Script');
console.log(`Mode: ${isDryRun ? 'DRY RUN (no emails sent)' : 'LIVE'}`);
console.log(`Type: ${outreachType}`);
console.log('---\n');

interface OutreachStats {
  total_paid_users: number;
  checkin_emails_sent: number;
  feedback_emails_sent: number;
  churn_emails_sent: number;
  concierge_emails_sent: number;
  churn_risks_identified: number;
  errors: number;
}

const stats: OutreachStats = {
  total_paid_users: 0,
  checkin_emails_sent: 0,
  feedback_emails_sent: 0,
  churn_emails_sent: 0,
  concierge_emails_sent: 0,
  churn_risks_identified: 0,
  errors: 0,
};

async function main() {
  try {
    // Step 1: Get all paid users
    console.log('📊 Fetching paid users...');
    const paidUsers = await getPaidUsers();
    stats.total_paid_users = paidUsers.length;

    console.log(`✓ Found ${paidUsers.length} paid users\n`);

    if (paidUsers.length === 0) {
      console.log('ℹ️  No paid users found. Exiting.');
      return;
    }

    // Step 2: Calculate and save churn risks
    console.log('🔍 Calculating churn risks...');
    const churnRisks = await getChurnRiskUsers();
    stats.churn_risks_identified = churnRisks.length;

    console.log(`✓ Identified ${churnRisks.length} users at risk of churning\n`);

    // Save churn risk tracking
    for (const risk of churnRisks) {
      try {
        await saveChurnRiskTracking(risk);
        console.log(`  📝 Saved churn risk for ${risk.email}: ${risk.risk_level} (score: ${risk.churn_risk_score})`);
      } catch (error) {
        console.error(`  ✗ Error saving churn risk for ${risk.email}:`, error);
        stats.errors++;
      }
    }

    console.log('\n---\n');

    // Step 3: Send outreach emails
    console.log('📧 Sending outreach emails...\n');

    for (const user of paidUsers) {
      try {
        // Check-in email (Day 7)
        if (
          (outreachType === 'all' || outreachType === 'checkin') &&
          user.days_since_subscription === 7 &&
          !(await hasReceivedOutreach(user.id, 'paid_user_checkin', 60))
        ) {
          await sendCheckinEmail(user);
          stats.checkin_emails_sent++;
        }

        // Feedback request (Day 14)
        if (
          (outreachType === 'all' || outreachType === 'feedback') &&
          user.days_since_subscription === 14 &&
          !(await hasReceivedOutreach(user.id, 'feedback_request', 60))
        ) {
          await sendFeedbackEmail(user);
          stats.feedback_emails_sent++;
        }

        // Churn prevention (High/Critical risk)
        const churnScore = calculateChurnRiskScore(user);
        const riskLevel = getChurnRiskLevel(churnScore);

        if (
          (outreachType === 'all' || outreachType === 'churn') &&
          (riskLevel === 'high' || riskLevel === 'critical') &&
          !(await hasReceivedOutreach(user.id, 'churn_prevention', 14))
        ) {
          await sendChurnPreventionEmail(user, churnScore);
          stats.churn_emails_sent++;
        }

        // Concierge onboarding (Days 1-3)
        if (
          (outreachType === 'all' || outreachType === 'concierge') &&
          user.days_since_subscription >= 1 &&
          user.days_since_subscription <= 3 &&
          !(await hasReceivedOutreach(user.id, 'concierge_onboarding', 60))
        ) {
          await sendConciergeEmail(user);
          stats.concierge_emails_sent++;
        }
      } catch (error) {
        console.error(`✗ Error processing user ${user.email}:`, error);
        stats.errors++;
      }
    }

    // Step 4: Print summary
    console.log('\n---\n');
    console.log('📊 OUTREACH SUMMARY\n');
    console.log(`Total paid users: ${stats.total_paid_users}`);
    console.log(`Churn risks identified: ${stats.churn_risks_identified}`);
    console.log(`\nEmails sent:`);
    console.log(`  • Check-in emails: ${stats.checkin_emails_sent}`);
    console.log(`  • Feedback requests: ${stats.feedback_emails_sent}`);
    console.log(`  • Churn prevention: ${stats.churn_emails_sent}`);
    console.log(`  • Concierge onboarding: ${stats.concierge_emails_sent}`);
    console.log(`\nTotal emails: ${stats.checkin_emails_sent + stats.feedback_emails_sent + stats.churn_emails_sent + stats.concierge_emails_sent}`);
    console.log(`Errors: ${stats.errors}`);

    if (isDryRun) {
      console.log('\n⚠️  DRY RUN MODE - No emails were actually sent');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Helper functions for sending specific email types
async function sendCheckinEmail(user: any) {
  const emailData = getPaidUserCheckinEmailData({
    firstName: user.first_name || 'there',
    email: user.email || '',
    subscriptionTier: user.subscription_tier as 'pro' | 'enterprise',
    subscriptionDate: new Date((user.created_at) * 1000),
    calculationsCompleted: user.calculations_completed || 0,
    feedbackUrl: generateFeedbackSurveyUrl({
      email: user.email || '',
      userId: user.id,
      subscriptionTier: user.subscription_tier,
    }),
    calendarUrl: generateCalendarUrl({
      firstName: user.first_name || 'there',
      email: user.email || '',
      type: 'onboarding',
    }),
  });

  if (!isDryRun) {
    const sent = await sendEmail({
      to: user.email || '',
      templateId: CUSTOMER_SUCCESS_TEMPLATES.PAID_USER_CHECKIN,
      dynamicData: emailData,
    });

    if (sent) {
      await logOutreachEmail({
        user_id: user.id,
        email: user.email || '',
        template_type: 'paid_user_checkin',
        email_subject: emailData.subject,
        subscription_tier: user.subscription_tier,
        days_since_subscription: user.days_since_subscription,
      });
    }
  }

  console.log(`✓ [CHECKIN] ${user.email} (Day ${user.days_since_subscription})`);
}

async function sendFeedbackEmail(user: any) {
  const emailData = getFeedbackRequestEmailData({
    firstName: user.first_name || 'there',
    email: user.email || '',
    subscriptionTier: user.subscription_tier as 'pro' | 'enterprise',
    calculationsCompleted: user.calculations_completed || 0,
    feedbackSurveyUrl: generateFeedbackSurveyUrl({
      email: user.email || '',
      userId: user.id,
      subscriptionTier: user.subscription_tier,
    }),
  });

  if (!isDryRun) {
    const sent = await sendEmail({
      to: user.email || '',
      templateId: CUSTOMER_SUCCESS_TEMPLATES.FEEDBACK_REQUEST,
      dynamicData: emailData,
    });

    if (sent) {
      await logOutreachEmail({
        user_id: user.id,
        email: user.email || '',
        template_type: 'feedback_request',
        email_subject: emailData.subject,
        subscription_tier: user.subscription_tier,
        days_since_subscription: user.days_since_subscription,
      });
    }
  }

  console.log(`✓ [FEEDBACK] ${user.email} (Day ${user.days_since_subscription})`);
}

async function sendChurnPreventionEmail(user: any, churnScore: number) {
  const emailData = getChurnPreventionEmailData({
    firstName: user.first_name || 'there',
    email: user.email || '',
    subscriptionTier: user.subscription_tier as 'pro' | 'enterprise',
    subscriptionDate: new Date(user.created_at * 1000),
    lastLoginDate: user.last_login_at ? new Date(user.last_login_at * 1000) : null,
    calculationsCompleted: user.calculations_completed || 0,
    churnRiskScore: churnScore,
    calendarUrl: generateCalendarUrl({
      firstName: user.first_name || 'there',
      email: user.email || '',
      type: 'churn-prevention',
    }),
    cancellationUrl: generateCancellationUrl({
      email: user.email || '',
      userId: user.id,
    }),
  });

  if (!isDryRun) {
    const sent = await sendEmail({
      to: user.email || '',
      templateId: CUSTOMER_SUCCESS_TEMPLATES.CHURN_PREVENTION,
      dynamicData: emailData,
    });

    if (sent) {
      await logOutreachEmail({
        user_id: user.id,
        email: user.email || '',
        template_type: 'churn_prevention',
        email_subject: emailData.subject,
        subscription_tier: user.subscription_tier,
        days_since_subscription: user.days_since_subscription,
        churn_risk_score: churnScore,
      });
    }
  }

  console.log(`✓ [CHURN] ${user.email} (Risk score: ${churnScore})`);
}

async function sendConciergeEmail(user: any) {
  const emailData = getConciergeOnboardingEmailData({
    firstName: user.first_name || 'there',
    email: user.email || '',
    subscriptionTier: user.subscription_tier as 'pro' | 'enterprise',
    calendarUrl: generateCalendarUrl({
      firstName: user.first_name || 'there',
      email: user.email || '',
      type: 'onboarding',
    }),
  });

  if (!isDryRun) {
    const sent = await sendEmail({
      to: user.email || '',
      templateId: CUSTOMER_SUCCESS_TEMPLATES.CONCIERGE_ONBOARDING,
      dynamicData: emailData,
    });

    if (sent) {
      await logOutreachEmail({
        user_id: user.id,
        email: user.email || '',
        template_type: 'concierge_onboarding',
        email_subject: emailData.subject,
        subscription_tier: user.subscription_tier,
        days_since_subscription: user.days_since_subscription,
      });
    }
  }

  console.log(`✓ [CONCIERGE] ${user.email} (Day ${user.days_since_subscription})`);
}

// Run the script
main().catch(console.error);
