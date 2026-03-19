/**
 * Viral Coefficient Analytics API
 * GET /api/analytics/viral-coefficient
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserProfileByClerkId } from '@/lib/db';
import {
  getCurrentViralCoefficient,
  getViralMetrics,
  updateTodayViralMetrics,
} from '@/lib/db/queries/viral-analytics';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserProfileByClerkId(clerkUserId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Admin only (or add role check here)
    // For now, allow all authenticated users to see metrics

    // Update today's metrics
    updateTodayViralMetrics();

    // Get current viral coefficient
    const current = getCurrentViralCoefficient();

    // Get last 30 days metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    const metrics = getViralMetrics(startDate, endDate);

    return NextResponse.json({
      current,
      history: metrics,
      analysis: {
        status: current.coefficient >= 1.0 ? 'viral' : 'sub-viral',
        message:
          current.coefficient >= 1.0
            ? '🚀 Viral loop is working! Each user brings in more than one new user on average.'
            : current.coefficient >= 0.5
              ? '📈 Good referral activity, but not yet viral. Keep optimizing!'
              : '💡 Focus on increasing referral incentives and sharing prompts.',
      },
    });
  } catch (error: any) {
    return handleApiError(error, { route: '/api/analytics/viral-coefficient', method: request.method });
  }
}
