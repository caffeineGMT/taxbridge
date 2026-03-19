/**
 * Calculator Feedback Response API Endpoint
 *
 * Captures and stores feedback from non-converting calculator users.
 * Tracks responses for 20% discount code delivery and analytics.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db as getDb } from '@/lib/db/init';
import crypto from 'crypto';

export const runtime = 'nodejs';

interface FeedbackResponse {
  userId: number;
  email: string;
  stoppedReason: string; // Main question: What stopped you?
  stoppedReasonsCategorized?: string[]; // Categories selected
  pricePerception?: 'too_expensive' | 'fair' | 'cheap' | 'unsure';
  missingFeatures?: string;
  competitorConsidered?: string;
  trustConcerns?: string;
  timingReason?: string;
  wouldConsiderLater?: boolean;
  likelihoodToPurchase?: number; // 1-10
  additionalFeedback?: string;
  calculatorRating?: number; // 1-5
  testimonialText?: string;
  testimonialPermission?: 'yes_full_name' | 'yes_initials' | 'yes_anonymous' | 'no';
  token: string; // Security token
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as FeedbackResponse;

    const {
      userId,
      email,
      stoppedReason,
      stoppedReasonsCategorized,
      pricePerception,
      missingFeatures,
      competitorConsidered,
      trustConcerns,
      timingReason,
      wouldConsiderLater,
      likelihoodToPurchase,
      additionalFeedback,
      calculatorRating,
      testimonialText,
      testimonialPermission,
      token,
    } = body;

    // Validate required fields
    if (!userId || !email || !stoppedReason || !token) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email, stoppedReason, token' },
        { status: 400 }
      );
    }

    // Validate token (security check)
    const expectedToken = crypto
      .createHash('sha256')
      .update(`${userId}-calculator-feedback-2026`)
      .digest('hex')
      .slice(0, 16);

    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 403 }
      );
    }

    const db = getDb;

    // Insert feedback response
    const stmt = db.prepare(`
      INSERT INTO calculator_feedback_responses (
        user_id, email, stopped_reason, stopped_reasons_categorized,
        price_perception, missing_features, competitor_considered,
        trust_concerns, timing_reason, would_consider_later,
        likelihood_to_purchase, additional_feedback, calculator_rating,
        testimonial_text, testimonial_permission, response_source,
        utm_campaign, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'email_link', 'feedback_campaign_2026_q1', ?)
      RETURNING id
    `);

    const result = stmt.get(
      userId,
      email,
      stoppedReason,
      stoppedReasonsCategorized ? stoppedReasonsCategorized.join(',') : null,
      pricePerception || null,
      missingFeatures || null,
      competitorConsidered || null,
      trustConcerns || null,
      timingReason || null,
      wouldConsiderLater ? 1 : 0,
      likelihoodToPurchase || null,
      additionalFeedback || null,
      calculatorRating || null,
      testimonialText || null,
      testimonialPermission || 'no',
      Math.floor(Date.now() / 1000)
    ) as { id: number };

    const responseId = result.id;

    // Update calculator_feedback_requests to mark as responded
    db.prepare(`
      UPDATE calculator_feedback_requests
      SET responded = 1, responded_at = ?, response_id = ?, updated_at = ?
      WHERE user_id = ? AND responded = 0
    `).run(
      new Date().toISOString(),
      responseId,
      Math.floor(Date.now() / 1000),
      userId
    );

    console.log(`✅ Calculator feedback received: Response ID ${responseId} from ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback! Your 20% discount code is still valid for 30 days.',
      responseId,
    });

  } catch (error: any) {
    console.error('Error saving calculator feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve all feedback responses (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    // Admin auth
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDb;

    // Get all responses with associated request data
    const stmt = db.prepare(`
      SELECT
        cfr.id as response_id,
        cfr.user_id,
        cfr.email,
        cfr.stopped_reason,
        cfr.stopped_reasons_categorized,
        cfr.price_perception,
        cfr.missing_features,
        cfr.competitor_considered,
        cfr.trust_concerns,
        cfr.timing_reason,
        cfr.would_consider_later,
        cfr.likelihood_to_purchase,
        cfr.additional_feedback,
        cfr.calculator_rating,
        cfr.testimonial_text,
        cfr.testimonial_permission,
        cfr.submitted_at,
        cfq.total_calculations,
        cfq.first_calculation_at,
        cfq.discount_code,
        cfq.discount_used
      FROM calculator_feedback_responses cfr
      LEFT JOIN calculator_feedback_requests cfq ON cfr.user_id = cfq.user_id
      ORDER BY cfr.submitted_at DESC
    `);

    const responses = stmt.all();

    // Get campaign stats
    const statsStmt = db.prepare(`
      SELECT * FROM calculator_feedback_campaign_stats
    `);
    const stats = statsStmt.get();

    // Get top reasons
    const reasonsStmt = db.prepare(`
      SELECT * FROM calculator_feedback_top_reasons LIMIT 10
    `);
    const topReasons = reasonsStmt.all();

    return NextResponse.json({
      total: responses.length,
      stats,
      topReasons,
      responses,
    });

  } catch (error: any) {
    console.error('Error retrieving feedback:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve feedback', details: error.message },
      { status: 500 }
    );
  }
}
