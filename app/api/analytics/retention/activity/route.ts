/**
 * User Activity Tracking API
 * Records user activity for retention analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { logUserActivity } from '@/lib/db/queries/retention-analytics';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, activityType, metadata } = body;

    if (!userId || !activityType) {
      return NextResponse.json(
        { error: 'userId and activityType required' },
        { status: 400 }
      );
    }

    await logUserActivity(userId, activityType, metadata);

    return NextResponse.json({
      success: true,
      message: 'Activity logged',
    });
  } catch (error) {
    console.error('[Activity Tracking] Error:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}
