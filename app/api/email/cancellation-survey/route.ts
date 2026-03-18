/**
 * Cancellation Survey Email API
 * Sends a 3-question survey to users who canceled their subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendgrid';
import { getDatabase } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, userId } = body;

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, userId' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Generate unique survey token
    const surveyToken = `survey_${userId}_${Date.now()}`;

    // Store survey token in database for later tracking
    db.prepare(`
      INSERT INTO analytics_events (user_id, event_name, metadata)
      VALUES (?, 'cancellation_survey_sent', ?)
    `).run(userId, JSON.stringify({ survey_token: surveyToken }));

    const surveyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/survey/cancellation?token=${surveyToken}`;

    // Send email using SendGrid
    const emailSent = await sendEmail({
      to: email,
      templateId: process.env.SENDGRID_CANCELLATION_SURVEY_TEMPLATE_ID || 'd-cancellation-survey',
      dynamicData: {
        firstName: firstName || 'there',
        surveyUrl,
        question1: 'Why did you cancel your subscription?',
        question2: 'What could we improve to win you back?',
        question3: 'Would you consider coming back if we made improvements?',
      },
    });

    if (emailSent) {
      trackEvent(userId, 'cancellation_survey_email_sent', {
        email,
        survey_token: surveyToken,
      });

      return NextResponse.json({
        success: true,
        message: 'Cancellation survey email sent',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending cancellation survey email:', error);
    return NextResponse.json(
      { error: 'Failed to send cancellation survey email' },
      { status: 500 }
    );
  }
}
