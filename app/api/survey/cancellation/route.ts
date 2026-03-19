/**
 * Cancellation Survey Response API
 * Handles submission of cancellation survey responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, answers } = body;

    if (!token || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: token, answers' },
        { status: 400 }
      );
    }

    // Extract user ID from token (format: survey_USERID_TIMESTAMP)
    const tokenParts = token.split('_');
    if (tokenParts.length < 3) {
      return NextResponse.json(
        { error: 'Invalid survey token' },
        { status: 400 }
      );
    }

    const userId = parseInt(tokenParts[1]);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID in token' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Check if survey was already submitted
    const existingSubmission = db.prepare(`
      SELECT id FROM analytics_events
      WHERE user_id = ?
        AND event_name = 'cancellation_survey_submitted'
        AND metadata LIKE ?
    `).get(userId, `%${token}%`);

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'Survey already submitted' },
        { status: 400 }
      );
    }

    // Store survey responses
    db.prepare(`
      INSERT INTO analytics_events (user_id, event_name, metadata)
      VALUES (?, 'cancellation_survey_submitted', ?)
    `).run(userId, JSON.stringify({
      survey_token: token,
      question1: answers.question1,
      question2: answers.question2,
      question3: answers.question3,
      submitted_at: new Date().toISOString(),
    }));

    // Track the survey submission event
    trackEvent(userId, 'cancellation_survey_submitted', {
      survey_token: token,
      would_return: answers.question3,
    });

    return NextResponse.json({
      success: true,
      message: 'Survey response recorded',
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/survey/cancellation', method: req.method });
  }
}
