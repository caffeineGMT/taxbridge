import { NextRequest, NextResponse } from 'next/server';
import {
  updateEmailPreferences,
  getUserByEmail,
} from '@/lib/db/queries/drip-campaign';
import { isValidEmail } from '@/lib/email/sendgrid';
import { handleApiError } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/unsubscribe
 * Unsubscribe a user from marketing emails
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    // Update email preferences
    const success = updateEmailPreferences(email, {
      marketing_emails: false,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    logger.info(`✓ User unsubscribed: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from marketing emails',
      email,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/unsubscribe', method: request.method });
  }
}

/**
 * GET /api/unsubscribe?email=xxx
 * Alternative endpoint for email client one-click unsubscribe
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.redirect(new URL('/unsubscribe', request.url));
  }

  // Perform unsubscribe
  try {
    if (!isValidEmail(email)) {
      return NextResponse.redirect(
        new URL(`/unsubscribe?error=invalid_email`, request.url)
      );
    }

    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.redirect(
        new URL(`/unsubscribe?email=${encodeURIComponent(email)}&error=not_found`, request.url)
      );
    }

    const success = updateEmailPreferences(email, {
      marketing_emails: false,
    });

    if (success) {
      logger.info(`✓ User unsubscribed via GET: ${email}`);
      return NextResponse.redirect(
        new URL(`/unsubscribe?email=${encodeURIComponent(email)}&success=true`, request.url)
      );
    } else {
      return NextResponse.redirect(
        new URL(`/unsubscribe?email=${encodeURIComponent(email)}&error=failed`, request.url)
      );
    }
  } catch (error) {
    // console.error('Unsubscribe GET error:', error);
    return NextResponse.redirect(
      new URL(`/unsubscribe?email=${encodeURIComponent(email || '')}&error=server_error`, request.url)
    );
  }
}
