import { NextRequest, NextResponse } from 'next/server';
import {
  getReengagementMetrics,
  getDiscountCodeStats,
  getCohortAnalysis,
  getUsersWhoClickedButDidntConvert,
} from '@/lib/db/queries/reengagement-campaign';
import { getEmailStats } from '@/lib/db/queries/drip-campaign';
import { handleApiError } from '@/lib/api-error-handler';

// Configure route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/reengagement
 *
 * Re-engagement email campaign analytics dashboard
 *
 * Returns:
 * - Overall campaign performance (open/click/conversion rates)
 * - Discount code effectiveness
 * - Cohort analysis (calculator users by week)
 * - Users who clicked but didn't convert (for follow-up)
 * - Comparison with drip campaign performance
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access (optional - add authentication here)
    // const session = await getServerSession();
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const cohortWeeks = parseInt(searchParams.get('cohortWeeks') || '12');

    // Get re-engagement campaign metrics
    const reengagementMetrics = getReengagementMetrics();

    // Get discount code performance
    const discountStats = getDiscountCodeStats();

    // Get cohort analysis
    const cohortAnalysis = getCohortAnalysis(cohortWeeks);

    // Get users who clicked but didn't convert (potential for follow-up)
    const clickedNoConversion = getUsersWhoClickedButDidntConvert();

    // Get drip campaign metrics for comparison
    const dripMetrics = getEmailStats();

    // Calculate aggregate stats
    const totalReengagementSent = reengagementMetrics.reduce((sum, m) => sum + m.total_sent, 0);
    const totalReengagementRevenue = reengagementMetrics.reduce((sum, m) => sum + m.total_revenue, 0);
    const totalReengagementConversions = reengagementMetrics.reduce((sum, m) => sum + m.total_conversions, 0);

    const avgOpenRate = totalReengagementSent > 0
      ? reengagementMetrics.reduce((sum, m) => sum + m.open_rate, 0) / reengagementMetrics.length
      : 0;

    const avgClickRate = totalReengagementSent > 0
      ? reengagementMetrics.reduce((sum, m) => sum + m.click_rate, 0) / reengagementMetrics.length
      : 0;

    const avgConversionRate = totalReengagementSent > 0
      ? reengagementMetrics.reduce((sum, m) => sum + m.conversion_rate, 0) / reengagementMetrics.length
      : 0;

    const response = {
      timestamp: new Date().toISOString(),

      // Summary stats
      summary: {
        total_emails_sent: totalReengagementSent,
        total_conversions: totalReengagementConversions,
        total_revenue: totalReengagementRevenue,
        avg_open_rate: parseFloat(avgOpenRate.toFixed(2)),
        avg_click_rate: parseFloat(avgClickRate.toFixed(2)),
        avg_conversion_rate: parseFloat(avgConversionRate.toFixed(2)),
        revenue_per_email: totalReengagementSent > 0
          ? parseFloat((totalReengagementRevenue / totalReengagementSent).toFixed(2))
          : 0,
      },

      // Per-email performance
      campaign_performance: reengagementMetrics.map(m => ({
        email_type: m.event_type,
        sent: m.total_sent,
        opened: m.total_opened,
        clicked: m.total_clicked,
        conversions: m.total_conversions,
        open_rate: `${m.open_rate}%`,
        click_rate: `${m.click_rate}%`,
        conversion_rate: `${m.conversion_rate}%`,
        revenue: `$${m.total_revenue.toFixed(2)}`,
        revenue_per_email: `$${m.revenue_per_email.toFixed(2)}`,
      })),

      // Discount code effectiveness
      discount_codes: discountStats.map(d => ({
        code: d.discount_code,
        conversions: d.total_conversions,
        revenue: `$${d.total_revenue.toFixed(2)}`,
        avg_revenue: `$${d.avg_revenue_per_conversion.toFixed(2)}`,
      })),

      // Cohort analysis
      cohorts: cohortAnalysis.map(c => ({
        week: c.cohort_week,
        calculator_users: c.total_calculator_users,
        converted: c.converted_users,
        conversion_rate: `${c.conversion_rate}%`,
        avg_days_to_convert: c.avg_days_to_conversion ? `${c.avg_days_to_conversion} days` : 'N/A',
        revenue: `$${c.total_revenue.toFixed(2)}`,
      })),

      // Opportunity: Users who clicked but didn't convert
      follow_up_opportunities: {
        count: clickedNoConversion.length,
        users: clickedNoConversion.slice(0, 20).map(u => ({ // Limit to 20 for display
          user_id: u.user_id,
          email: u.email,
          first_name: u.first_name,
          email_type: u.event_type,
          clicked_at: u.clicked_at,
          days_since_click: u.days_since_click,
        })),
      },

      // Comparison: Drip vs Re-engagement
      comparison: {
        drip_campaign: {
          total_sent: dripMetrics.reduce((sum, m) => sum + m.total_sent, 0),
          avg_open_rate: parseFloat(
            (dripMetrics.reduce((sum, m) => sum + m.open_rate, 0) / dripMetrics.length || 0).toFixed(2)
          ),
          avg_click_rate: parseFloat(
            (dripMetrics.reduce((sum, m) => sum + m.click_rate, 0) / dripMetrics.length || 0).toFixed(2)
          ),
        },
        reengagement_campaign: {
          total_sent: totalReengagementSent,
          avg_open_rate: parseFloat(avgOpenRate.toFixed(2)),
          avg_click_rate: parseFloat(avgClickRate.toFixed(2)),
        },
      },

      // Recommendations
      recommendations: generateRecommendations(reengagementMetrics, cohortAnalysis),
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error, { route: '/api/analytics/reengagement', method: request.method });
  }
}

/**
 * Generate actionable recommendations based on campaign performance
 */
function generateRecommendations(
  metrics: any[],
  cohorts: any[]
): string[] {
  const recommendations: string[] = [];

  // Check open rates
  const avgOpenRate = metrics.reduce((sum, m) => sum + m.open_rate, 0) / metrics.length;
  if (avgOpenRate < 20) {
    recommendations.push('📧 Low open rates (<20%). Test different subject lines with A/B testing.');
  }

  // Check click rates
  const avgClickRate = metrics.reduce((sum, m) => sum + m.click_rate, 0) / metrics.length;
  if (avgClickRate < 5) {
    recommendations.push('🖱️ Low click rates (<5%). Improve email copy and CTA prominence.');
  }

  // Check conversion rates
  const avgConversionRate = metrics.reduce((sum, m) => sum + m.conversion_rate, 0) / metrics.length;
  if (avgConversionRate < 2) {
    recommendations.push('💰 Low conversion rates (<2%). Consider stronger discounts or better value proposition.');
  } else if (avgConversionRate > 5) {
    recommendations.push('🎯 High conversion rates (>5%). Consider reducing discount to maximize revenue.');
  }

  // Check Day 3 vs Day 7 vs Day 14 performance
  const day3 = metrics.find(m => m.event_type === 'reengagement_day3');
  const day7 = metrics.find(m => m.event_type === 'reengagement_day7');
  const day14 = metrics.find(m => m.event_type === 'reengagement_day14');

  if (day3 && day7 && day3.conversion_rate < day7.conversion_rate * 0.5) {
    recommendations.push('📊 Day 3 underperforming vs Day 7. Consider adding discount earlier or improving Day 3 case study.');
  }

  if (day14 && day7 && day14.conversion_rate > day7.conversion_rate) {
    recommendations.push('⏰ Day 14 (urgency) performing better than Day 7. Consider adding more urgency messaging earlier.');
  }

  // Check cohort conversion trends
  if (cohorts.length >= 4) {
    const recentCohorts = cohorts.slice(0, 4);
    const avgRecentConversion = recentCohorts.reduce((sum, c) => sum + c.conversion_rate, 0) / 4;

    const olderCohorts = cohorts.slice(4, 8);
    if (olderCohorts.length >= 4) {
      const avgOlderConversion = olderCohorts.reduce((sum, c) => sum + c.conversion_rate, 0) / 4;

      if (avgRecentConversion < avgOlderConversion * 0.8) {
        recommendations.push('📉 Conversion rate declining. Investigate recent product or pricing changes.');
      } else if (avgRecentConversion > avgOlderConversion * 1.2) {
        recommendations.push('📈 Conversion rate improving! Document what\'s working and double down.');
      }
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Campaign performing well! Monitor metrics and continue A/B testing.');
  }

  return recommendations;
}
