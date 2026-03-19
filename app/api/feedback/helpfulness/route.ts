/**
 * Helpfulness Rating API Route
 *
 * Stores helpfulness ratings (thumbs up/down) from calculator results
 * PostHog tracking happens client-side before this call
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { handleApiError } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();

    const { helpful, comment, calculationAmount, page } = body;

    // Validate required fields
    if (typeof helpful !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid helpfulness rating. Must be boolean.' },
        { status: 400 }
      );
    }

    // Store in database (using Prisma/your DB client)
    logger.info('Helpfulness Feedback received:', {
      userId: userId || 'anonymous',
      helpful,
      comment,
      calculationAmount,
      page,
      timestamp: new Date().toISOString(),
    });

    // Optional: Store in database
    // await prisma.helpfulnessFeedback.create({
    //   data: {
    //     userId,
    //     helpful,
    //     comment,
    //     calculationAmount,
    //     page,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: 'Helpfulness feedback received',
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/feedback/helpfulness', method: req.method });
  }
}
