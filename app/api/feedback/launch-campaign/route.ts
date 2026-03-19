/**
 * Launch User Feedback Campaign API
 * POST /api/feedback/launch-campaign
 *
 * Purpose: Launch a user feedback collection campaign
 * - Detects paid vs free users
 * - Sends targeted emails
 * - Tracks campaign progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, update } from '@/lib/db/unified';
import { getPaidUsers } from '@/lib/customer-success';
import {
  getPaidUserFeedbackEmailData,
  getFreeUserFeedbackEmailData,
  generateFeedbackSurveyUrl,
  logFeedbackEmailSent,
} from '@/lib/email/user-feedback-templates';
import { sendEmail, sendBulkEmails } from '@/lib/email/sendgrid';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      campaign_name,
      campaign_description,
      target_user_type, // 'paid', 'free', or 'auto' (auto-detect)
      target_responses = 5,
      dry_run = false, // if true, don't send emails, just report what would happen
    } = body;

    // Validate
    if (!campaign_name) {
      return NextResponse.json(
        { error: 'campaign_name is required' },
        { status: 400 }
      );
    }

    console.log(`[FEEDBACK CAMPAIGN] Starting campaign: ${campaign_name}`);

    // Step 1: Detect user types
    const paidUsers = await getPaidUsers();
    const allUsers = await query<any>(`
      SELECT * FROM user_profiles WHERE email IS NOT NULL
    `);
    const freeUsers = allUsers.filter(u => u.subscription_tier === 'free');

    console.log(`[FEEDBACK CAMPAIGN] Found ${paidUsers.length} paid users, ${freeUsers.length} free users`);

    // Step 2: Auto-detect campaign type if 'auto'
    let actualTargetUserType = target_user_type;
    let campaignType = '';

    if (target_user_type === 'auto') {
      if (paidUsers.length > 0) {
        actualTargetUserType = 'paid';
        campaignType = 'paid_purchase_barriers';
        console.log(`[FEEDBACK CAMPAIGN] Auto-detected: PAID users exist (${paidUsers.length})`);
      } else if (freeUsers.length > 0) {
        actualTargetUserType = 'free';
        campaignType = 'free_upgrade_barriers';
        console.log(`[FEEDBACK CAMPAIGN] Auto-detected: NO paid users, targeting FREE users (${freeUsers.length})`);
      } else {
        return NextResponse.json(
          {
            error: 'No users found',
            message: 'Database has no users (paid or free). Cannot launch campaign.',
            paid_users: 0,
            free_users: 0,
          },
          { status: 400 }
        );
      }
    } else {
      campaignType = actualTargetUserType === 'paid' ? 'paid_purchase_barriers' : 'free_upgrade_barriers';
    }

    // Step 3: Select target users
    let targetUsers: any[] = [];
    if (actualTargetUserType === 'paid') {
      targetUsers = paidUsers.filter(u => u.email);
    } else if (actualTargetUserType === 'free') {
      targetUsers = freeUsers.filter(u => u.email);
    }

    if (targetUsers.length === 0) {
      return NextResponse.json(
        {
          error: 'No eligible users',
          message: `No ${actualTargetUserType} users with email addresses found.`,
          paid_users: paidUsers.length,
          free_users: freeUsers.length,
        },
        { status: 400 }
      );
    }

    console.log(`[FEEDBACK CAMPAIGN] Targeting ${targetUsers.length} ${actualTargetUserType} users`);

    // Step 4: Create campaign record
    const campaignId = await insert(`
      INSERT INTO user_feedback_campaigns (
        campaign_type, campaign_name, campaign_description,
        target_user_type, target_responses,
        email_subject, survey_url, incentive_offered,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      campaignType,
      campaign_name,
      campaign_description || `${actualTargetUserType === 'paid' ? 'Paid' : 'Free'} user feedback collection`,
      actualTargetUserType,
      target_responses,
      actualTargetUserType === 'paid'
        ? "Quick favor? What almost stopped you from subscribing? ($10 gift card)"
        : "Quick question: What's stopping you from upgrading? ($10 gift card)",
      `https://taxbridge.app/survey/user-feedback`,
      '$10 Amazon gift card',
      dry_run ? 'draft' : 'active',
    ]);

    console.log(`[FEEDBACK CAMPAIGN] Created campaign ID: ${campaignId}`);

    // Step 5: Send emails
    const emailResults: any[] = [];

    for (const user of targetUsers) {
      try {
        // Generate survey URL
        const surveyUrl = generateFeedbackSurveyUrl({
          email: user.email,
          userId: user.id,
          userType: actualTargetUserType,
          campaignId,
        });

        // Get email data
        let emailData: any;
        if (actualTargetUserType === 'paid') {
          emailData = getPaidUserFeedbackEmailData({
            firstName: user.first_name || '',
            email: user.email,
            subscriptionTier: user.subscription_tier as 'pro' | 'enterprise',
            daysSinceSubscription: Math.floor((Date.now() / 1000 - user.created_at) / (60 * 60 * 24)),
            calculationsCompleted: user.calculations_completed || 0,
            surveyUrl,
            campaignId,
          });
        } else {
          emailData = getFreeUserFeedbackEmailData({
            firstName: user.first_name || '',
            email: user.email,
            daysSinceSignup: Math.floor((Date.now() / 1000 - user.created_at) / (60 * 60 * 24)),
            calculationsCompleted: user.calculations_completed || 0,
            surveyUrl,
            campaignId,
          });
        }

        // Create email tracking record
        const trackingId = await insert(`
          INSERT INTO feedback_email_tracking (
            campaign_id, user_id, email, subject, template_id, status
          ) VALUES ($1, $2, $3, $4, $5, 'sent')
        `, [
          campaignId,
          user.id,
          user.email,
          emailData.subject,
          actualTargetUserType === 'paid' ? 'd-paid-feedback' : 'd-free-feedback',
        ]);

        // Send email (unless dry run)
        if (!dry_run) {
          await sendEmail({
            to: user.email,
            from: {
              email: 'michael@taxbridge.app',
              name: 'Michael from TaxBridge',
            },
            subject: emailData.subject,
            templateId: actualTargetUserType === 'paid' ? 'd-paid-feedback' : 'd-free-feedback',
            dynamicData: emailData,
          });

          console.log(`[FEEDBACK CAMPAIGN] Sent email to ${user.email}`);
        } else {
          console.log(`[FEEDBACK CAMPAIGN] [DRY RUN] Would send email to ${user.email}`);
        }

        emailResults.push({
          user_id: user.id,
          email: user.email,
          tracking_id: trackingId,
          status: dry_run ? 'dry_run' : 'sent',
        });

      } catch (error: any) {
        // console.error(`[FEEDBACK CAMPAIGN] Failed to send to ${user.email}:`, error);
        emailResults.push({
          user_id: user.id,
          email: user.email,
          status: 'failed',
          error: error.message,
        });
      }
    }

    // Step 6: Update campaign with sent count
    const sentCount = emailResults.filter(r => r.status === 'sent').length;

    if (!dry_run) {
      await update(`
        UPDATE user_feedback_campaigns
        SET total_sent = $1, launched_at = $2
        WHERE id = $3
      `, [sentCount, Math.floor(Date.now() / 1000), campaignId]);
    }

    // Step 7: Return summary
    return NextResponse.json({
      success: true,
      campaign_id: campaignId,
      campaign_type: campaignType,
      target_user_type: actualTargetUserType,
      target_responses,
      total_users_found: targetUsers.length,
      emails_sent: sentCount,
      emails_failed: emailResults.filter(r => r.status === 'failed').length,
      dry_run,
      message: dry_run
        ? `DRY RUN: Would send ${sentCount} emails to ${actualTargetUserType} users`
        : `Campaign launched! Sent ${sentCount} emails to ${actualTargetUserType} users. Target: ${target_responses} responses.`,
      email_results: emailResults,
      next_steps: [
        'Check /admin/feedback-campaigns for real-time stats',
        `Survey URL: https://taxbridge.app/survey/user-feedback`,
        `Responses will appear at /admin/feedback-responses`,
        `Campaign will auto-complete after ${target_responses} responses`,
      ],
    });

  } catch (error: any) {
    return handleApiError(error, { route: '/api/feedback/launch-campaign', method: req.method });
  }
}

/**
 * GET /api/feedback/launch-campaign
 * Get campaign status
 */
export async function GET(req: NextRequest) {
  try {
    // Get all campaigns
    const campaigns = await query<any>(`
      SELECT * FROM user_feedback_campaigns ORDER BY created_at DESC
    `);

    // Get paid/free user counts
    const paidUsers = await getPaidUsers();
    const allUsers = await query<any>(`
      SELECT * FROM user_profiles WHERE email IS NOT NULL
    `);
    const freeUsers = allUsers.filter(u => u.subscription_tier === 'free');

    return NextResponse.json({
      success: true,
      total_campaigns: campaigns.length,
      active_campaigns: campaigns.filter(c => c.status === 'active').length,
      paid_users_available: paidUsers.length,
      free_users_available: freeUsers.length,
      campaigns,
      recommendation: paidUsers.length > 0
        ? `Launch PAID user campaign - ask "What almost stopped you from subscribing?"`
        : freeUsers.length > 0
        ? `Launch FREE user campaign - ask "Why didn't you upgrade?"`
        : 'No users available - cannot launch campaign yet',
    });

  } catch (error: any) {
    return handleApiError(error, { route: '/api/feedback/launch-campaign', method: req.method });
  }
}
