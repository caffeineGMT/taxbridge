/**
 * Conversion Experiments API
 *
 * Tracks exposure and conversion events for 3 simultaneous A/B tests:
 * 1. Pricing headline
 * 2. Free tier limit
 * 3. Social proof placement
 *
 * Stores data for real-time experiment analytics dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface ExperimentEvent {
  event: 'exposure' | 'conversion';
  headline_variant: string;
  free_tier_variant: string;
  social_proof_variant: string;
  experiment_session: string;
  conversionType?: 'signup' | 'checkout' | 'paid';
  timestamp: string;
}

// In-memory storage for experiment metrics (in production, use Postgres)
const experimentMetrics = new Map<string, {
  exposures: number;
  signups: number;
  checkouts: number;
  paid: number;
}>();

function getMetricKey(headline: string, freeTier: string, socialProof: string): string {
  return `${headline}__${freeTier}__${socialProof}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExperimentEvent = await request.json();
    const { event, headline_variant, free_tier_variant, social_proof_variant, conversionType } = body;

    const key = getMetricKey(headline_variant, free_tier_variant, social_proof_variant);

    // Initialize metrics if not exists
    if (!experimentMetrics.has(key)) {
      experimentMetrics.set(key, {
        exposures: 0,
        signups: 0,
        checkouts: 0,
        paid: 0,
      });
    }

    const metrics = experimentMetrics.get(key)!;

    // Update metrics
    if (event === 'exposure') {
      metrics.exposures += 1;
    } else if (event === 'conversion' && conversionType) {
      if (conversionType === 'signup') metrics.signups += 1;
      else if (conversionType === 'checkout') metrics.checkouts += 1;
      else if (conversionType === 'paid') metrics.paid += 1;
    }

    return NextResponse.json({
      success: true,
      metrics: {
        key,
        ...metrics,
        conversion_rate: metrics.exposures > 0 ? (metrics.paid / metrics.exposures) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Error tracking conversion experiment:', error);
    return NextResponse.json(
      { error: 'Failed to track experiment event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return all experiment metrics
    const results: Record<string, any> = {};

    experimentMetrics.forEach((metrics, key) => {
      const [headline, freeTier, socialProof] = key.split('__');

      results[key] = {
        headline_variant: headline,
        free_tier_variant: freeTier,
        social_proof_variant: socialProof,
        metrics: {
          exposures: metrics.exposures,
          signups: metrics.signups,
          checkouts: metrics.checkouts,
          paid: metrics.paid,
          signup_rate: metrics.exposures > 0 ? (metrics.signups / metrics.exposures) * 100 : 0,
          checkout_rate: metrics.exposures > 0 ? (metrics.checkouts / metrics.exposures) * 100 : 0,
          conversion_rate: metrics.exposures > 0 ? (metrics.paid / metrics.exposures) * 100 : 0,
        },
      };
    });

    // Calculate best performing variants for each experiment
    const analysis = {
      headline: calculateBestVariant(results, 'headline_variant'),
      freeTier: calculateBestVariant(results, 'free_tier_variant'),
      socialProof: calculateBestVariant(results, 'social_proof_variant'),
    };

    return NextResponse.json({
      success: true,
      experiments: results,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching conversion experiments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiment data' },
      { status: 500 }
    );
  }
}

function calculateBestVariant(
  results: Record<string, any>,
  variantType: 'headline_variant' | 'free_tier_variant' | 'social_proof_variant'
): Record<string, { exposures: number; conversions: number; rate: number }> {
  const variantStats: Record<string, { exposures: number; conversions: number }> = {};

  // Aggregate metrics by variant
  Object.values(results).forEach((result: any) => {
    const variant = result[variantType];
    if (!variantStats[variant]) {
      variantStats[variant] = { exposures: 0, conversions: 0 };
    }

    variantStats[variant].exposures += result.metrics.exposures;
    variantStats[variant].conversions += result.metrics.paid;
  });

  // Calculate conversion rates
  const variantRates: Record<string, { exposures: number; conversions: number; rate: number }> = {};
  Object.entries(variantStats).forEach(([variant, stats]) => {
    variantRates[variant] = {
      ...stats,
      rate: stats.exposures > 0 ? (stats.conversions / stats.exposures) * 100 : 0,
    };
  });

  return variantRates;
}
