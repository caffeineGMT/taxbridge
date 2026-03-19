/**
 * NPS Feedback API Route
 *
 * Stores NPS survey responses in the database
 * PostHog tracking happens client-side before this call
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();

    const { score, comment, trigger, page } = body;

    // Validate required fields
    if (typeof score !== 'number' || score < 0 || score > 10) {
      return NextResponse.json(
        { error: 'Invalid NPS score. Must be 0-10.' },
        { status: 400 }
      );
    }

    // Store in database (using Prisma/your DB client)
    // For now, we'll just log - you can add DB storage later
    console.log('NPS Feedback received:', {
      userId: userId || 'anonymous',
      score,
      comment,
      trigger,
      page,
      timestamp: new Date().toISOString(),
    });

    // Optional: Store in database
    // await prisma.npsFeedback.create({
    //   data: {
    //     userId,
    //     score,
    //     comment,
    //     trigger,
    //     page,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: 'NPS feedback received',
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/feedback/nps', method: req.method });
  }
}
