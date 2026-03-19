/**
 * Feature Usage Tracking API
 * Records feature usage for correlation analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackFeatureUsage } from '@/lib/db/queries/retention-analytics';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, feature, timeSeconds } = body;

    if (!userId || !feature) {
      return NextResponse.json(
        { error: 'userId and feature required' },
        { status: 400 }
      );
    }

    await trackFeatureUsage(userId, feature, timeSeconds || 0);

    return NextResponse.json({
      success: true,
      message: 'Feature usage tracked',
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/analytics/retention/feature', method: req.method });
  }
}
