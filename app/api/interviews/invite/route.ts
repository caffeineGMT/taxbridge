/**
 * Customer Interview Invitation API
 * POST /api/interviews/invite
 *
 * Purpose: Send interview invitation emails to qualified paid users
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert } from '@/lib/db/unified';
import { getPaidUsers } from '@/lib/customer-success';
import {
  getInterviewInvitationEmailData,
  generateInterviewCalendarUrl,
  generateInterviewSurveyUrl,
} from '@/lib/email/customer-interview-templates';
import { sendEmail } from '@/lib/email/sendgrid';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_ids, batch_send } = body;

    // If user_ids provided, invite specific users
    // If batch_send=true, invite all qualified users

    let targetUsers: any[] = [];

    if (user_ids && Array.isArray(user_ids)) {
      // Specific users
      for (const userId of user_ids) {
        const user = await queryOne<any>(`
          SELECT * FROM user_profiles WHERE id = $1
        `, [userId]);

        if (user) targetUsers.push(user);
      }
    } else if (batch_send) {
      // All qualified paid users
      const paidUsers = await getPaidUsers();

      // Filter to qualified candidates:
      // - Pro or Enterprise
      // - Subscribed for 14+ days (past honeymoon phase)
      // - Completed 1+ calculations (engaged)
      // - Haven't been invited in the last 90 days
      targetUsers = paidUsers.filter(user =>
        user.days_since_subscription >= 14 &&
        user.calculations_completed >= 1
      );

      // Check if already invited recently
      const filteredUsers = [];
      for (const user of targetUsers) {
        const recentInvite = await queryOne<any>(`
          SELECT id FROM customer_interviews
          WHERE user_id = $1 AND invited_at > $2
        `, [user.id, Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60)]);

        if (!recentInvite) {
          filteredUsers.push(user);
        }
      }

      targetUsers = filteredUsers;
    } else {
      return NextResponse.json(
        { error: 'Must provide user_ids or set batch_send=true' },
        { status: 400 }
      );
    }

    if (targetUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No qualified users to invite',
        invited_count: 0
      });
    }

    // Send invitations
    const results = [];

    for (const user of targetUsers) {
      try {
        // Calculate days since subscription
        const daysSinceSubscription = Math.floor(
          (Date.now() / 1000 - user.created_at) / (60 * 60 * 24)
        );

        // Get calculation count
        const calcCount = await queryOne<{ count: number }>(`
          SELECT COUNT(*) as count FROM tax_calculations WHERE user_id = $1
        `, [user.id]);

        const calculationsCompleted = calcCount?.count || 0;

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

        // Create interview record
        const interviewId = await insert(`
          INSERT INTO customer_interviews (
            user_id, email, interview_type, status,
            video_call_url, survey_url,
            incentive_offered, subscription_tier,
            days_since_subscription, calculations_completed
          ) VALUES ($1, $2, 'video_call', 'invited', $3, $4, '$25 Amazon gift card', $5, $6, $7)
        `, [
          user.id,
          user.email,
          calendarUrl,
          surveyUrl,
          user.subscription_tier,
          daysSinceSubscription,
          calculationsCompleted,
        ]);

        // Send email
        const emailData = getInterviewInvitationEmailData({
          firstName: user.first_name || '',
          email: user.email || '',
          subscriptionTier: user.subscription_tier as 'pro' | 'enterprise',
          daysSinceSubscription,
          calculationsCompleted,
          calendarUrl,
          surveyUrl,
        });

        await sendEmail({
          to: user.email,
          from: {
            email: 'michael@taxbridge.app',
            name: 'Michael from TaxBridge',
          },
          subject: emailData.subject,
          templateId: 'd-interview-invite', // SendGrid template
          dynamicTemplateData: emailData,
        });

        results.push({
          user_id: user.id,
          email: user.email,
          interview_id: interviewId,
          status: 'invited',
        });

        console.log(`[INTERVIEW INVITE] Sent to ${user.email} (interview #${interviewId})`);

      } catch (error: any) {
        // console.error(`[INTERVIEW INVITE] Failed for user ${user.id}:`, error);
        results.push({
          user_id: user.id,
          email: user.email,
          status: 'failed',
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.status === 'invited').length;

    return NextResponse.json({
      success: true,
      message: `Invited ${successCount} of ${targetUsers.length} users`,
      invited_count: successCount,
      results,
    });

  } catch (error: any) {
    return handleApiError(error, { route: '/api/interviews/invite', method: req.method });
  }
}
