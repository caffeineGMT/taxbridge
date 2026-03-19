/**
 * Enhanced Cancellation Survey API with Retention Analytics Integration
 * Records churn reasons and integrates with retention tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { recordChurnSurvey } from '@/lib/db/queries/retention-analytics';
import { trackEvent } from '@/lib/analytics/posthog';
import { handleApiError } from '@/lib/api-error-handler';

export interface CancellationSurveyRequest {
  token: string;
  userId: number;
  primaryReason: string;
  secondaryReasons?: string[];
  satisfactionScore?: number;
  wouldRecommend?: boolean;
  wouldReturn?: boolean;
  feedbackText?: string;
  featureRequests?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CancellationSurveyRequest = await req.json();

    const {
      token,
      userId,
      primaryReason,
      secondaryReasons,
      satisfactionScore,
      wouldRecommend,
      wouldReturn,
      feedbackText,
      featureRequests,
    } = body;

    // Validation
    if (!token || !userId || !primaryReason) {
      return NextResponse.json(
        { error: 'Missing required fields: token, userId, primaryReason' },
        { status: 400 }
      );
    }

    // Validate token format (survey_USERID_TIMESTAMP)
    const tokenParts = token.split('_');
    if (tokenParts.length < 3 || parseInt(tokenParts[1]) !== userId) {
      return NextResponse.json(
        { error: 'Invalid survey token' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Get user subscription data for context
    const userProfile = db
      .prepare(
        `
      SELECT
        up.subscription_tier,
        up.created_at,
        up.stripe_subscription_id,
        COUNT(DISTINCT re.id) as total_calculations,
        MAX(al.activity_date) as last_active_date
      FROM user_profiles up
      LEFT JOIN rsu_entries re ON re.user_id = up.id
      LEFT JOIN user_activity_log al ON al.user_id = up.id
      WHERE up.id = ?
      GROUP BY up.id
    `
      )
      .get(userId) as any;

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate subscription duration
    const subscriptionDurationDays = userProfile.created_at
      ? Math.floor((Date.now() - userProfile.created_at * 1000) / (1000 * 60 * 60 * 24))
      : null;

    // Record in retention analytics table
    await recordChurnSurvey({
      userId,
      surveyToken: token,
      primaryReason,
      secondaryReasons,
      featureRequests,
      satisfactionScore,
      wouldRecommend,
      wouldReturn,
      feedbackText,
      subscriptionDurationDays: subscriptionDurationDays || undefined,
      totalCalculations: userProfile.total_calculations || 0,
      lastActiveDate: userProfile.last_active_date || undefined,
    });

    // Also store in analytics_events for backwards compatibility
    db.prepare(
      `
      INSERT INTO analytics_events (user_id, event_name, metadata)
      VALUES (?, 'cancellation_survey_submitted', ?)
    `
    ).run(
      userId,
      JSON.stringify({
        survey_token: token,
        primary_reason: primaryReason,
        secondary_reasons: secondaryReasons,
        satisfaction_score: satisfactionScore,
        would_recommend: wouldRecommend,
        would_return: wouldReturn,
        feature_requests: featureRequests,
        feedback_text: feedbackText,
        submitted_at: new Date().toISOString(),
      })
    );

    // Track in PostHog for real-time monitoring
    trackEvent('subscription_cancelled', {
      userId: userId.toString(),
      churnReason: primaryReason,
      satisfactionScore,
      wouldReturn: wouldReturn ?? false,
      subscriptionDuration: subscriptionDurationDays || 0,
      totalCalculations: userProfile.total_calculations || 0,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback. Your response has been recorded.',
      data: {
        recorded_at: new Date().toISOString(),
        subscription_duration_days: subscriptionDurationDays,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/survey/cancellation-enhanced', method: req.method });
  }
}

/**
 * GET: Generate survey token for user
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Generate token: survey_USERID_TIMESTAMP
    const token = `survey_${userId}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      token,
      expires_in: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/survey/cancellation-enhanced', method: req.method });
  }
}
