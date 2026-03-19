/**
 * Retention Analytics API
 * GET /api/analytics/retention - Fetch cohort retention data, churn triggers, and inactive users
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCohortRetentionMetrics,
  getChurnTriggers,
  getInactiveUsers,
  getRetentionSummary,
} from '@/lib/analytics/retention';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'all';

    // Return specific metric or all metrics
    if (metric === 'cohorts') {
      const cohorts = getCohortRetentionMetrics();
      return NextResponse.json({ cohorts });
    }

    if (metric === 'churn-triggers') {
      const triggers = getChurnTriggers();
      return NextResponse.json({ triggers });
    }

    if (metric === 'inactive-users') {
      const days = parseInt(searchParams.get('days') || '7', 10);
      const users = getInactiveUsers(days);
      return NextResponse.json({ users });
    }

    if (metric === 'summary') {
      const summary = getRetentionSummary();
      return NextResponse.json({ summary });
    }

    // Return all metrics by default
    const [cohorts, triggers, summary] = [
      getCohortRetentionMetrics(),
      getChurnTriggers(),
      getRetentionSummary(),
    ];

    return NextResponse.json({
      cohorts,
      triggers,
      summary,
    });
  } catch (error) {
    console.error('Retention analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch retention analytics' },
      { status: 500 }
    );
  }
}
