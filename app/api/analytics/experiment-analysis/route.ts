/**
 * Experiment Analysis API - Auto-generated Report
 *
 * GET /api/analytics/experiment-analysis
 * Returns statistical analysis and rollout recommendations
 */

import { NextResponse } from 'next/server';
import { analyzeExperiment, generateReport } from '@/lib/experiment-analyzer';

interface VariantMetrics {
  exposures: number;
  conversions: number;
}

export async function GET() {
  try {
    // Fetch raw experiment data
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/analytics/conversion-experiments`);

    if (!response.ok) {
      throw new Error('Failed to fetch experiment data');
    }

    const data = await response.json();

    // Aggregate metrics by free tier variant
    const variantData: Record<string, VariantMetrics> = {
      limited_5: { exposures: 0, conversions: 0 },
      limited_10: { exposures: 0, conversions: 0 },
      unlimited_gated: { exposures: 0, conversions: 0 },
    };

    // Sum up metrics across all experiment combinations
    Object.values(data.experiments || {}).forEach((exp: any) => {
      const variant = exp.free_tier_variant;
      if (variantData[variant]) {
        variantData[variant].exposures += exp.metrics.exposures || 0;
        variantData[variant].conversions += exp.metrics.paid || 0;
      }
    });

    // Perform statistical analysis
    const analysis = analyzeExperiment(
      variantData.limited_10, // Baseline
      variantData.limited_5,  // Variant A
      variantData.unlimited_gated // Variant C
    );

    // Generate markdown report
    const report = generateReport(variantData as any);

    return NextResponse.json({
      success: true,
      analysis: {
        winner: analysis.winner,
        recommendation: analysis.recommendation,
        variants: {
          limited_5: {
            ...variantData.limited_5,
            ...analysis.variantA,
          },
          limited_10: {
            ...variantData.limited_10,
            conversionRate: (variantData.limited_10.conversions / variantData.limited_10.exposures) * 100,
            isBaseline: true,
          },
          unlimited_gated: {
            ...variantData.unlimited_gated,
            ...analysis.variantC,
          },
        },
      },
      report, // Full markdown report
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Experiment analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze experiment data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
