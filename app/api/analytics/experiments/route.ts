/**
 * API Route: /api/analytics/experiments
 *
 * Fetches A/B test experiment data from PostHog
 * Returns metrics for all active experiments including variant performance
 */

import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // TODO: Integrate with PostHog API to fetch real experiment data
    // For now, return mock data matching the experiment configurations
    const experiments = [
      {
        experimentName: 'Calculator Completion Test',
        status: 'running',
        startDate: '2026-03-19',
        targetMetric: 'Reduce 28% drop-off (Calculator View → Completed)',
        variants: [
          {
            variantId: 'control',
            variantName: 'Control: Standard Form',
            impressions: 350,
            conversions: 252,
            conversionRate: 72.0,
            confidence: 0,
            isControl: true,
            isWinner: false,
          },
          {
            variantId: 'progressive',
            variantName: 'Progressive: Step-by-Step',
            impressions: 340,
            conversions: 272,
            conversionRate: 80.0,
            confidence: 87,
            isControl: false,
            isWinner: true,
          },
          {
            variantId: 'simplified',
            variantName: 'Simplified: Core + Advanced Toggle',
            impressions: 345,
            conversions: 262,
            conversionRate: 75.9,
            confidence: 62,
            isControl: false,
            isWinner: false,
          },
        ],
        winner: 'progressive',
        improvement: 11.1,
      },
      {
        experimentName: 'Signup Flow Test',
        status: 'running',
        startDate: '2026-03-19',
        targetMetric: 'Reduce 27% drop-off (Calc Completed → Signup Started)',
        variants: [
          {
            variantId: 'control',
            variantName: 'Control: Clerk Modal',
            impressions: 280,
            conversions: 154,
            conversionRate: 55.0,
            confidence: 0,
            isControl: true,
            isWinner: false,
          },
          {
            variantId: 'inline',
            variantName: 'Inline: Embedded + Social Proof',
            impressions: 275,
            conversions: 192,
            conversionRate: 69.8,
            confidence: 94,
            isControl: false,
            isWinner: true,
          },
          {
            variantId: 'lite',
            variantName: 'Lite: Magic Link (Email Only)',
            impressions: 270,
            conversions: 173,
            conversionRate: 64.1,
            confidence: 79,
            isControl: false,
            isWinner: false,
          },
        ],
        winner: 'inline',
        improvement: 26.9,
      },
      {
        experimentName: 'Pricing Page Test',
        status: 'running',
        startDate: '2026-03-19',
        targetMetric: 'Reduce 16% drop-off (Pricing View → Checkout Started)',
        variants: [
          {
            variantId: 'control',
            variantName: 'Control: Standard Pricing',
            impressions: 195,
            conversions: 98,
            conversionRate: 50.3,
            confidence: 0,
            isControl: true,
            isWinner: false,
          },
          {
            variantId: 'roi-focused',
            variantName: 'ROI-Focused: "$49 to save $2,500+"',
            impressions: 190,
            conversions: 119,
            conversionRate: 62.6,
            confidence: 91,
            isControl: false,
            isWinner: true,
          },
          {
            variantId: 'social-proof',
            variantName: 'Social Proof: Testimonials + Users',
            impressions: 188,
            conversions: 107,
            conversionRate: 56.9,
            confidence: 68,
            isControl: false,
            isWinner: false,
          },
        ],
        winner: 'roi-focused',
        improvement: 24.5,
      },
    ];

    return NextResponse.json({
      experiments,
      timeRange,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/analytics/experiments', method: request.method });
  }
}
