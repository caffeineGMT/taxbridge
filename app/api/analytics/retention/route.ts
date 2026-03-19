/**
 * Retention Analytics API
 * Returns cohort retention rates, churn analysis, and feature correlation
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCohortRetention,
  calculateRetentionRates,
  getChurnReasonsSummary,
  getAllChurnSurveys,
  getFeatureRetentionCorrelation,
  getTopFeatures,
  saveRetentionSnapshot,
} from '@/lib/db/queries/retention-analytics';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cohortMonth = searchParams.get('cohort_month');
    const action = searchParams.get('action') || 'overview';

    switch (action) {
      case 'overview':
        return await getRetentionOverview();

      case 'cohort':
        if (!cohortMonth) {
          return NextResponse.json(
            { error: 'cohort_month parameter required' },
            { status: 400 }
          );
        }
        return await getCohortDetails(cohortMonth);

      case 'churn':
        return await getChurnAnalysis();

      case 'features':
        return await getFeatureAnalysis();

      case 'refresh':
        return await refreshRetentionData();

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: overview, cohort, churn, features, refresh' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Retention Analytics API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch retention analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get retention overview (all cohorts)
 */
async function getRetentionOverview() {
  const cohorts = await getAllCohortRetention();

  // Calculate aggregate metrics
  const totalUsers = cohorts.reduce((sum, c) => sum + c.cohort_size, 0);
  const avgDay1 =
    cohorts.reduce((sum, c) => sum + c.day_1_retention_rate, 0) / cohorts.length || 0;
  const avgDay7 =
    cohorts.reduce((sum, c) => sum + c.day_7_retention_rate, 0) / cohorts.length || 0;
  const avgDay30 =
    cohorts.reduce((sum, c) => sum + c.day_30_retention_rate, 0) / cohorts.length || 0;

  return NextResponse.json({
    success: true,
    data: {
      cohorts,
      summary: {
        total_users: totalUsers,
        total_cohorts: cohorts.length,
        avg_day_1_retention: Math.round(avgDay1 * 100) / 100,
        avg_day_7_retention: Math.round(avgDay7 * 100) / 100,
        avg_day_30_retention: Math.round(avgDay30 * 100) / 100,
        latest_cohort: cohorts[0]?.cohort_month || null,
      },
    },
  });
}

/**
 * Get detailed retention data for a specific cohort
 */
async function getCohortDetails(cohortMonth: string) {
  const data = await calculateRetentionRates(cohortMonth);

  if (!data) {
    return NextResponse.json(
      { error: 'Cohort not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data,
  });
}

/**
 * Get churn analysis (reasons, patterns)
 */
async function getChurnAnalysis() {
  const [reasonsSummary, allResponses] = await Promise.all([
    getChurnReasonsSummary(),
    getAllChurnSurveys(),
  ]);

  // Calculate additional insights
  const totalResponses = allResponses.length;
  const avgSatisfaction =
    allResponses.reduce((sum, r) => sum + (r.satisfaction_score || 0), 0) /
      totalResponses || 0;
  const wouldReturnPct =
    (allResponses.filter((r) => r.would_return).length / totalResponses) * 100 || 0;
  const wouldRecommendPct =
    (allResponses.filter((r) => r.would_recommend).length / totalResponses) * 100 || 0;

  // Top feature requests
  const featureRequests = allResponses
    .filter((r) => r.feature_requests)
    .map((r) => r.feature_requests)
    .filter((f): f is string => !!f);

  return NextResponse.json({
    success: true,
    data: {
      summary: {
        total_responses: totalResponses,
        avg_satisfaction_score: Math.round(avgSatisfaction * 100) / 100,
        would_return_pct: Math.round(wouldReturnPct * 100) / 100,
        would_recommend_pct: Math.round(wouldRecommendPct * 100) / 100,
      },
      reasons: reasonsSummary,
      feature_requests: featureRequests,
      recent_responses: allResponses.slice(0, 20), // Last 20 responses
    },
  });
}

/**
 * Get feature usage correlation with retention
 */
async function getFeatureAnalysis() {
  const [correlation, topFeatures] = await Promise.all([
    getFeatureRetentionCorrelation(),
    getTopFeatures(15),
  ]);

  // Categorize features by retention impact
  const highImpact = correlation.filter((f) => f.retention_rate_pct > 70);
  const mediumImpact = correlation.filter(
    (f) => f.retention_rate_pct >= 40 && f.retention_rate_pct <= 70
  );
  const lowImpact = correlation.filter((f) => f.retention_rate_pct < 40);

  return NextResponse.json({
    success: true,
    data: {
      correlation,
      top_features: topFeatures,
      impact_analysis: {
        high_impact_features: highImpact.length,
        medium_impact_features: mediumImpact.length,
        low_impact_features: lowImpact.length,
        features_by_impact: {
          high: highImpact,
          medium: mediumImpact,
          low: lowImpact,
        },
      },
    },
  });
}

/**
 * Refresh retention data (recalculate snapshots)
 */
async function refreshRetentionData() {
  const cohorts = await getAllCohortRetention();

  // Save snapshots for all cohorts
  for (const cohort of cohorts) {
    await saveRetentionSnapshot(cohort);
  }

  return NextResponse.json({
    success: true,
    message: `Refreshed retention data for ${cohorts.length} cohorts`,
    data: {
      cohorts_updated: cohorts.length,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * POST: Manually trigger retention calculation for testing
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cohort_month } = body;

    if (!cohort_month) {
      return NextResponse.json(
        { error: 'cohort_month required' },
        { status: 400 }
      );
    }

    const data = await calculateRetentionRates(cohort_month);

    if (!data) {
      return NextResponse.json(
        { error: 'Failed to calculate retention' },
        { status: 500 }
      );
    }

    // Save snapshot
    await saveRetentionSnapshot(data);

    return NextResponse.json({
      success: true,
      message: 'Retention data calculated and saved',
      data,
    });
  } catch (error) {
    console.error('[Retention Analytics POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate retention' },
      { status: 500 }
    );
  }
}
