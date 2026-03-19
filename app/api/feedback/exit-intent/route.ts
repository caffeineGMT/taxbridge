/**
 * Exit Intent Survey API Route
 *
 * Stores exit intent survey responses (bounce prevention)
 * PostHog tracking happens client-side before this call
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { reason, email, page, timeOnPage } = body;

    // Validate required fields
    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        { error: 'Exit reason is required' },
        { status: 400 }
      );
    }

    // Store in database (using Prisma/your DB client)
    console.log('Exit Intent Feedback received:', {
      userId: userId || 'anonymous',
      reason,
      email,
      page,
      timeOnPage,
      timestamp: new Date().toISOString(),
    });

    // Optional: Store in database
    // await prisma.exitIntentFeedback.create({
    //   data: {
    //     userId,
    //     reason,
    //     email,
    //     page,
    //     timeOnPage,
    //   },
    // });

    // If email was provided, could trigger follow-up email campaign
    // if (email) {
    //   await sendFollowUpEmail(email, reason);
    // }

    return NextResponse.json({
      success: true,
      message: 'Exit intent feedback received',
    });
  } catch (error) {
    console.error('Exit Intent API error:', error);
    return NextResponse.json(
      { error: 'Failed to save exit intent feedback' },
      { status: 500 }
    );
  }
}
