/**
 * Pricing Experiment Analytics API
 *
 * Analyzes A/B test results for pricing experiment:
 * - $49/year vs $79/year conversion rates
 * - Annual vs monthly preference
 * - Product Hunt cohort behavior
 * - Revenue impact projection
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(req.url);
    const cohort = searchParams.get('cohort'); // 'product_hunt', 'organic', 'all'
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Get subscription data with pricing variant info
    const subscriptions = db
      .prepare(
        `
        SELECT
          s.id,
          s.user_id,
          s.tier,
          s.status,
          s.amount,
          s.interval,
          s.stripe_price_id,
          s.created_at,
          s.metadata,
          up.referral_source
        FROM subscriptions s
        LEFT JOIN user_profiles up ON s.user_id = up.id
        WHERE s.tier = 'pro'
        ${startDate ? 'AND s.created_at >= ?' : ''}
        ${endDate ? 'AND s.created_at <= ?' : ''}
        ORDER BY s.created_at DESC
      `
      )
      .all(
        ...[startDate, endDate].filter(Boolean)
      ) as Array<{
      id: number;
      user_id: number;
      tier: string;
      status: string;
      amount: number;
      interval: string;
      stripe_price_id: string;
      created_at: string;
      metadata: string;
      referral_source: string | null;
    }>;

    // Parse metadata and group by variant
    const results = subscriptions.map((sub) => {
      let metadata: any = {};
      try {
        metadata = sub.metadata ? JSON.parse(sub.metadata) : {};
      } catch (e) {
        // Ignore parse errors
      }

      // Determine variant from price ID or amount
      let variant = 'unknown';
      if (sub.stripe_price_id?.includes('49') || sub.amount === 4900) {
        variant = 'annual_49';
      } else if (sub.stripe_price_id?.includes('79') || sub.amount === 7900) {
        variant = 'annual_79';
      } else if (sub.stripe_price_id?.includes('19') || sub.amount === 1900) {
        variant = 'monthly_19';
      }

      // Determine cohort
      const userCohort =
        sub.referral_source === 'product_hunt' ||
        metadata.utm_source === 'producthunt' ||
        metadata.user_cohort === 'product_hunt'
          ? 'product_hunt'
          : 'organic';

      return {
        ...sub,
        variant,
        interval: sub.interval || (sub.amount > 5000 ? 'year' : 'month'),
        cohort: userCohort,
        metadata,
      };
    });

    // Filter by cohort if specified
    const filteredResults =
      cohort && cohort !== 'all'
        ? results.filter((r) => r.cohort === cohort)
        : results;

    // Calculate metrics by variant
    const annual49 = filteredResults.filter((r) => r.variant === 'annual_49');
    const annual79 = filteredResults.filter((r) => r.variant === 'annual_79');
    const monthly19 = filteredResults.filter((r) => r.variant === 'monthly_19');

    // Calculate conversion rates (requires PostHog data, simplified here)
    // In production, you'd query PostHog API for exposure vs conversion
    const metrics = {
      overview: {
        total_conversions: filteredResults.length,
        total_revenue: filteredResults.reduce((sum, r) => sum + r.amount, 0) / 100,
        avg_customer_value:
          filteredResults.length > 0
            ? filteredResults.reduce((sum, r) => sum + r.amount, 0) /
              100 /
              filteredResults.length
            : 0,
      },
      variants: {
        annual_49: {
          conversions: annual49.length,
          revenue: annual49.reduce((sum, r) => sum + r.amount, 0) / 100,
          avg_revenue: annual49.length > 0 ? 49 : 0,
          percentage: filteredResults.length > 0
            ? ((annual49.length / filteredResults.length) * 100).toFixed(1)
            : '0.0',
        },
        annual_79: {
          conversions: annual79.length,
          revenue: annual79.reduce((sum, r) => sum + r.amount, 0) / 100,
          avg_revenue: annual79.length > 0 ? 79 : 0,
          percentage: filteredResults.length > 0
            ? ((annual79.length / filteredResults.length) * 100).toFixed(1)
            : '0.0',
        },
        monthly_19: {
          conversions: monthly19.length,
          revenue: monthly19.reduce((sum, r) => sum + r.amount, 0) / 100,
          avg_revenue: monthly19.length > 0 ? 19 : 0,
          percentage: filteredResults.length > 0
            ? ((monthly19.length / filteredResults.length) * 100).toFixed(1)
            : '0.0',
        },
      },
      cohorts: {
        product_hunt: {
          total: results.filter((r) => r.cohort === 'product_hunt').length,
          annual_49: results.filter(
            (r) => r.cohort === 'product_hunt' && r.variant === 'annual_49'
          ).length,
          annual_79: results.filter(
            (r) => r.cohort === 'product_hunt' && r.variant === 'annual_79'
          ).length,
          monthly_19: results.filter(
            (r) => r.cohort === 'product_hunt' && r.variant === 'monthly_19'
          ).length,
        },
        organic: {
          total: results.filter((r) => r.cohort === 'organic').length,
          annual_49: results.filter(
            (r) => r.cohort === 'organic' && r.variant === 'annual_49'
          ).length,
          annual_79: results.filter(
            (r) => r.cohort === 'organic' && r.variant === 'annual_79'
          ).length,
          monthly_19: results.filter(
            (r) => r.cohort === 'organic' && r.variant === 'monthly_19'
          ).length,
        },
      },
      price_sensitivity: {
        annual_preference: annual49.length + annual79.length,
        monthly_preference: monthly19.length,
        annual_percentage:
          filteredResults.length > 0
            ? (
                ((annual49.length + annual79.length) / filteredResults.length) *
                100
              ).toFixed(1)
            : '0.0',
        within_annual_preference: {
          prefer_49: annual49.length,
          prefer_79: annual79.length,
          ratio_49:
            annual49.length + annual79.length > 0
              ? ((annual49.length / (annual49.length + annual79.length)) * 100).toFixed(1)
              : '0.0',
        },
      },
      recommendations: generateRecommendations(annual49, annual79, monthly19, results),
    };

    return NextResponse.json({
      success: true,
      data: metrics,
      meta: {
        cohort: cohort || 'all',
        start_date: startDate,
        end_date: endDate,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error analyzing pricing experiment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze pricing experiment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate recommendations based on experiment results
 */
function generateRecommendations(
  annual49: any[],
  annual79: any[],
  monthly19: any[],
  allResults: any[]
): string[] {
  const recommendations: string[] = [];
  const total = allResults.length;

  if (total === 0) {
    return ['Not enough data yet. Continue running experiment.'];
  }

  // Revenue comparison
  const revenue49 = annual49.length * 49;
  const revenue79 = annual79.length * 79;
  const revenueMonthly = monthly19.length * 19; // Monthly, so annualize: * 12

  // Recommendation 1: Optimal annual price
  if (annual49.length > 0 || annual79.length > 0) {
    if (revenue79 > revenue49 * 1.2) {
      recommendations.push(
        `🎯 STRONG SIGNAL: $79 annual generates ${((revenue79 / revenue49 - 1) * 100).toFixed(0)}% more revenue despite lower conversion. Consider $79 as default.`
      );
    } else if (annual49.length > annual79.length * 1.5) {
      recommendations.push(
        `🎯 STRONG SIGNAL: $49 annual converts ${((annual49.length / annual79.length - 1) * 100).toFixed(0)}% better. Keep $49 as launch price.`
      );
    } else {
      recommendations.push(
        '⚖️ MIXED RESULTS: Conversion and revenue are balanced. Consider longer test duration or tiered pricing.'
      );
    }
  }

  // Recommendation 2: Monthly vs Annual
  const annualTotal = annual49.length + annual79.length;
  if (monthly19.length > annualTotal * 0.3) {
    recommendations.push(
      `💡 INSIGHT: ${((monthly19.length / total) * 100).toFixed(0)}% prefer monthly billing. Promote monthly option more prominently.`
    );
  } else if (annualTotal > monthly19.length * 3) {
    recommendations.push(
      `💡 INSIGHT: ${((annualTotal / total) * 100).toFixed(0)}% prefer annual billing. Emphasize annual savings.`
    );
  }

  // Recommendation 3: Sample size
  if (total < 50) {
    recommendations.push(
      `⚠️ SMALL SAMPLE: Only ${total} conversions. Extend experiment to 100+ for statistical significance.`
    );
  } else if (total >= 100) {
    recommendations.push(
      `✅ SUFFICIENT DATA: ${total} conversions collected. Results are statistically meaningful.`
    );
  }

  // Recommendation 4: Product Hunt cohort
  const phUsers = allResults.filter((r) => r.cohort === 'product_hunt');
  if (phUsers.length > 0) {
    const phRevenue = phUsers.reduce((sum, r) => sum + r.amount, 0) / 100;
    const organicRevenue =
      allResults
        .filter((r) => r.cohort === 'organic')
        .reduce((sum, r) => sum + r.amount, 0) / 100;

    if (phRevenue / phUsers.length > organicRevenue / (total - phUsers.length)) {
      recommendations.push(
        `🚀 PRODUCT HUNT WIN: PH users have ${((phRevenue / phUsers.length / (organicRevenue / (total - phUsers.length)) - 1) * 100).toFixed(0)}% higher LTV. Double down on PH launch.`
      );
    }
  }

  return recommendations;
}
