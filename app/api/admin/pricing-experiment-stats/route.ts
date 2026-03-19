/**
 * Pricing Experiment Stats API
 *
 * Provides real-time conversion rate tracking for the pricing experiment
 * comparing $39 vs $49 vs $79 vs $99 annual pricing.
 *
 * GET /api/admin/pricing-experiment-stats
 *
 * Returns:
 * - Exposures by variant
 * - Conversions by variant
 * - Conversion rates
 * - Revenue projections
 * - Statistical significance
 */

import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// Admin check - ensure only admins can access experiment data
async function isAdmin() {
  const user = await currentUser();
  if (!user) return false;

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  return adminEmails.includes(user.emailAddresses[0]?.emailAddress || '');
}

// Calculate conversion rate with confidence interval
function calculateConversionRate(exposures: number, conversions: number) {
  if (exposures === 0) {
    return { rate: 0, lower: 0, upper: 0, conversions, exposures };
  }

  const rate = conversions / exposures;

  // 95% confidence interval using Wilson score interval
  const z = 1.96; // 95% confidence
  const p = rate;
  const n = exposures;

  const denominator = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / denominator;
  const margin = (z / denominator) * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));

  return {
    rate: Math.round(rate * 10000) / 100, // percentage with 2 decimals
    lower: Math.max(0, Math.round((centre - margin) * 10000) / 100),
    upper: Math.min(100, Math.round((centre + margin) * 10000) / 100),
    conversions,
    exposures,
  };
}

// Calculate statistical significance (chi-square test)
function calculateSignificance(
  exposures1: number,
  conversions1: number,
  exposures2: number,
  conversions2: number
): { pValue: number; isSignificant: boolean; effect: string } {
  // Chi-square test for comparing two proportions
  const total1 = exposures1;
  const success1 = conversions1;
  const failure1 = exposures1 - conversions1;

  const total2 = exposures2;
  const success2 = conversions2;
  const failure2 = exposures2 - conversions2;

  const totalSuccess = success1 + success2;
  const totalFailure = failure1 + failure2;
  const totalN = total1 + total2;

  if (totalN === 0 || totalSuccess === 0) {
    return { pValue: 1, isSignificant: false, effect: 'none' };
  }

  // Expected values
  const e11 = (total1 * totalSuccess) / totalN;
  const e12 = (total1 * totalFailure) / totalN;
  const e21 = (total2 * totalSuccess) / totalN;
  const e22 = (total2 * totalFailure) / totalN;

  // Chi-square statistic
  const chiSquare =
    Math.pow(success1 - e11, 2) / e11 +
    Math.pow(failure1 - e12, 2) / e12 +
    Math.pow(success2 - e21, 2) / e21 +
    Math.pow(failure2 - e22, 2) / e22;

  // Approximate p-value (simplified, degrees of freedom = 1)
  // For chi-square with df=1: p < 0.05 when chi-square > 3.84
  const pValue = chiSquare > 3.84 ? 0.04 : 0.50; // Rough approximation

  const rate1 = conversions1 / exposures1;
  const rate2 = conversions2 / exposures2;
  const liftPercent = ((rate1 - rate2) / rate2) * 100;

  return {
    pValue,
    isSignificant: pValue < 0.05 && chiSquare > 3.84,
    effect: Math.abs(liftPercent) > 20 ? 'large' : Math.abs(liftPercent) > 10 ? 'medium' : 'small',
  };
}

export async function GET() {
  try {
    // Check admin access
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Query PostHog events (simplified - in production, use PostHog API)
    // For now, we'll query our DB for tracking data

    const experimentStart = new Date('2026-03-19T00:00:00Z');
    const experimentEnd = new Date('2026-04-02T23:59:59Z');
    const now = new Date();

    // Mock data for now - replace with actual PostHog/DB queries
    const stats = {
      experiment: {
        name: 'annual_pricing_test_march_2026',
        start: experimentStart.toISOString(),
        end: experimentEnd.toISOString(),
        daysRemaining: Math.max(0, Math.ceil((experimentEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
        status: now < experimentEnd ? 'running' : 'completed',
      },
      variants: [
        {
          variant: 'annual_39',
          price: 39,
          exposures: 0, // Will be populated from PostHog
          conversions: 0,
          revenue: 0,
          ...calculateConversionRate(0, 0),
        },
        {
          variant: 'annual_49',
          price: 49,
          exposures: 0,
          conversions: 0,
          revenue: 0,
          ...calculateConversionRate(0, 0),
        },
        {
          variant: 'annual_79',
          price: 79,
          exposures: 0,
          conversions: 0,
          revenue: 0,
          ...calculateConversionRate(0, 0),
        },
        {
          variant: 'annual_99',
          price: 99,
          exposures: 0,
          conversions: 0,
          revenue: 0,
          ...calculateConversionRate(0, 0),
        },
      ],
      totals: {
        exposures: 0,
        conversions: 0,
        revenue: 0,
        avgConversionRate: 0,
        avgRevenuePerUser: 0,
      },
      comparisons: {
        // Compare $39 vs $79 (current price)
        annual_39_vs_79: calculateSignificance(0, 0, 0, 0),
        // Compare $39 vs $49
        annual_39_vs_49: calculateSignificance(0, 0, 0, 0),
      },
      projections: {
        // If experiment continues for 2 weeks with 1000 visitors
        annual_39: { expectedConversions: 0, expectedRevenue: 0 },
        annual_49: { expectedConversions: 0, expectedRevenue: 0 },
        annual_79: { expectedConversions: 0, expectedRevenue: 0 },
        annual_99: { expectedConversions: 0, expectedRevenue: 0 },
      },
      winner: {
        byConversionRate: null,
        byRevenue: null,
        recommendation: 'Insufficient data - continue experiment',
        confidence: 0,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[pricing-experiment-stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiment stats' },
      { status: 500 }
    );
  }
}
