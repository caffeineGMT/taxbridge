/**
 * Feature Usage Tracking API
 * Records feature usage for correlation analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackFeatureUsage } from '@/lib/db/queries/retention-analytics';

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
    console.error('[Feature Tracking] Error:', error);
    return NextResponse.json(
      { error: 'Failed to track feature' },
      { status: 500 }
    );
  }
}
