import { NextRequest, NextResponse } from 'next/server';
import { getABTestAnalytics, getWinningVariant, type ABTestResult } from '@/lib/email/ab-testing';

export const dynamic = 'force-dynamic';

interface WinnerAnalysis {
  event_type: string;
  winner: 'A' | 'B' | 'TIE';
  confidence: number;
  is_significant: boolean;
  lift: number;
}

/**
 * GET /api/analytics/email-ab-tests
 *
 * Returns A/B test analytics for email drip campaign optimizations:
 * - Day 1: Personalized savings estimate test
 * - Day 3: Enhanced social proof test
 * - Day 7: Tax deadline urgency test
 */
export async function GET(request: NextRequest) {
  try {
    // Get all A/B test results from database
    const results: ABTestResult[] = getABTestAnalytics();

    // Calculate winners for each email type
    const eventTypes = ['drip_welcome', 'drip_day3', 'drip_day7', 'drip_day14'] as const;
    const winners: WinnerAnalysis[] = [];

    for (const eventType of eventTypes) {
      const { winner, confidence, isSignificant } = getWinningVariant(eventType);

      if (winner) {
        // Find both variants to calculate lift
        const variantA = results.find(r => r.event_type === eventType && r.variant === 'A');
        const variantB = results.find(r => r.event_type === eventType && r.variant === 'B');

        let lift = 0;
        if (variantA && variantB && variantA.conversion_rate > 0) {
          lift = ((variantB.conversion_rate - variantA.conversion_rate) / variantA.conversion_rate) * 100;
        }

        winners.push({
          event_type: eventType,
          winner: winner.variant === 'A' ? 'A' : winner.variant === 'B' ? 'B' : 'TIE',
          confidence,
          is_significant: isSignificant,
          lift,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      winners,
      metadata: {
        total_tests: eventTypes.length,
        significant_results: winners.filter(w => w.is_significant).length,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching A/B test analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch A/B test analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
