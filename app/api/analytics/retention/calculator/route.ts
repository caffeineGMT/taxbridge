/**
 * Calculator Usage Tracking API
 * Specialized endpoint for calculator tracking with time measurement
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackCalculatorUse } from '@/lib/analytics/retention-tracking';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, calculationType, timeSeconds } = body;

    if (!userId || !calculationType) {
      return NextResponse.json(
        { error: 'userId and calculationType required' },
        { status: 400 }
      );
    }

    if (!['basic', 'ftc', 'multi_year'].includes(calculationType)) {
      return NextResponse.json(
        { error: 'Invalid calculationType. Use: basic, ftc, multi_year' },
        { status: 400 }
      );
    }

    await trackCalculatorUse(userId, calculationType, timeSeconds || 0);

    return NextResponse.json({
      success: true,
      message: 'Calculator usage tracked',
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/analytics/retention/calculator', method: req.method });
  }
}
