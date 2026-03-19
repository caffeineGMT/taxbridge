/**
 * API Route: Revenue Analytics
 * Calculates LTV, CAC, and conversion funnel metrics from database + PostHog
 */

import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { query, queryOne } from '@/lib/db/unified';
import { handleApiError } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

interface RevenueMetrics {
  ltv: number;
  cac: number;
  ltvCacRatio: number;
  paybackPeriod: number;
  conversionFunnel: {
    visitors: number;
    signups: number;
    profileCompleted: number;
    firstCalculation: number;
    paidConversions: number;
    visitorToSignup: number;
    signupToProfile: number;
    profileToCalculation: number;
    calculationToPaid: number;
    overallConversion: number;
  };
  cohortAnalysis: {
    month: string;
    signups: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  }[];
}

export async function GET() {
  try {
    // === Conversion Funnel Metrics ===
    const signupsResult = await queryOne<{ count: number }>(
      "SELECT COUNT(DISTINCT user_id) as count FROM analytics_events WHERE event_name = 'user_signed_up'"
    );
    const signups = signupsResult?.count || 0;

    const profileCompletedResult = await queryOne<{ count: number }>(
      "SELECT COUNT(DISTINCT user_id) as count FROM analytics_events WHERE event_name = 'profile_completed'"
    );
    const profileCompleted = profileCompletedResult?.count || 0;

    const firstCalculationResult = await queryOne<{ count: number }>(
      "SELECT COUNT(DISTINCT user_id) as count FROM analytics_events WHERE event_name = 'tax_calculation_viewed'"
    );
    const firstCalculation = firstCalculationResult?.count || 0;

    const paidConversionsResult = await queryOne<{ count: number }>(
      "SELECT COUNT(DISTINCT user_id) as count FROM analytics_events WHERE event_name IN ('upgraded_to_pro', 'upgraded_to_enterprise')"
    );
    const paidConversions = paidConversionsResult?.count || 0;

    // Estimate visitors (assume 10x signups for now - in production, use PostHog pageviews)
    const visitors = signups * 10;

    const conversionFunnel = {
      visitors,
      signups,
      profileCompleted,
      firstCalculation,
      paidConversions,
      visitorToSignup: visitors > 0 ? (signups / visitors) * 100 : 0,
      signupToProfile: signups > 0 ? (profileCompleted / signups) * 100 : 0,
      profileToCalculation: profileCompleted > 0 ? (firstCalculation / profileCompleted) * 100 : 0,
      calculationToPaid: firstCalculation > 0 ? (paidConversions / firstCalculation) * 100 : 0,
      overallConversion: visitors > 0 ? (paidConversions / visitors) * 100 : 0,
    };

    // === LTV Calculation ===
    // LTV = Average Revenue Per User * Average Customer Lifespan
    // For simplicity: Pro = $299/year, Enterprise = $2000/year
    // Average lifespan = 1 / churn rate (assuming 5% monthly churn = 20 months)
    const averageChurnRate = 0.05; // 5% monthly churn
    const averageLifespanMonths = 1 / averageChurnRate;

    const proUsersResult = await queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM user_profiles WHERE subscription_tier = 'pro' AND subscription_status IN ('active', 'trialing')"
    );
    const proUsers = proUsersResult?.count || 0;

    const enterpriseUsersResult = await queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM user_profiles WHERE subscription_tier = 'enterprise' AND subscription_status IN ('active', 'trialing')"
    );
    const enterpriseUsers = enterpriseUsersResult?.count || 0;

    const totalPaidUsers = proUsers + enterpriseUsers;
    const averageRevenue = totalPaidUsers > 0
      ? ((proUsers * 299) + (enterpriseUsers * 2000)) / totalPaidUsers
      : 0;

    const ltv = (averageRevenue / 12) * averageLifespanMonths; // Monthly revenue * lifespan

    // === CAC Calculation ===
    // CAC = Total Marketing Spend / New Customers
    // For MVP: assume $50 CAC per customer (placeholder - in production, track actual spend)
    const estimatedMarketingSpend = paidConversions * 50;
    const cac = paidConversions > 0 ? estimatedMarketingSpend / paidConversions : 0;

    // === LTV:CAC Ratio ===
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;

    // === Payback Period ===
    // Payback Period (months) = CAC / Average Monthly Revenue
    const averageMonthlyRevenue = averageRevenue / 12;
    const paybackPeriod = averageMonthlyRevenue > 0 ? cac / averageMonthlyRevenue : 0;

    // === Cohort Analysis ===
    // Group signups by month and track their conversion to paid
    const cohortRows = await query<{
      month: string;
      signups: number;
      conversions: number;
    }>(
      `SELECT
        strftime('%Y-%m', datetime(created_at, 'unixepoch')) as month,
        COUNT(DISTINCT ae.user_id) as signups,
        COUNT(DISTINCT CASE WHEN up.subscription_tier IN ('pro', 'enterprise') THEN ae.user_id END) as conversions
      FROM analytics_events ae
      LEFT JOIN user_profiles up ON ae.user_id = up.id
      WHERE ae.event_name = 'user_signed_up'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12`
    );

    const cohortAnalysis = cohortRows.map((row) => ({
      month: row.month,
      signups: row.signups,
      conversions: row.conversions,
      revenue: row.conversions * averageRevenue,
      conversionRate: row.signups > 0 ? (row.conversions / row.signups) * 100 : 0,
    }));

    const metrics: RevenueMetrics = {
      ltv: Math.round(ltv * 100) / 100,
      cac: Math.round(cac * 100) / 100,
      ltvCacRatio: Math.round(ltvCacRatio * 100) / 100,
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      conversionFunnel: {
        ...conversionFunnel,
        visitorToSignup: Math.round(conversionFunnel.visitorToSignup * 100) / 100,
        signupToProfile: Math.round(conversionFunnel.signupToProfile * 100) / 100,
        profileToCalculation: Math.round(conversionFunnel.profileToCalculation * 100) / 100,
        calculationToPaid: Math.round(conversionFunnel.calculationToPaid * 100) / 100,
        overallConversion: Math.round(conversionFunnel.overallConversion * 100) / 100,
      },
      cohortAnalysis,
    };

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    // console.error('Error calculating revenue metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate revenue metrics',
      },
      { status: 500 }
    );
  }
}
