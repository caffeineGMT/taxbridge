import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getABTestAnalytics,
  getWinningVariant,
} from '@/lib/email/ab-testing';
import {
  getConversionStats,
  getConversionsByEmailType,
} from '@/lib/email/conversion-tracking';
import { getEmailStats } from '@/lib/db/queries/drip-campaign';

/**
 * Email Drip Campaign Analytics API
 *
 * GET /api/analytics/email-drip
 * Returns comprehensive analytics for the email drip campaign including:
 * - A/B test performance
 * - Conversion metrics
 * - Email engagement stats
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check (admin only)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const eventType = searchParams.get('event_type') as
      | 'drip_welcome'
      | 'drip_day3'
      | 'drip_day7'
      | 'drip_day14'
      | null;

    // Gather all analytics data
    const analytics = {
      timestamp: new Date().toISOString(),

      // A/B test results
      ab_tests: eventType
        ? getABTestAnalytics(eventType)
        : getABTestAnalytics(),

      // Winning variants
      winning_variants: {
        welcome: getWinningVariant('drip_welcome'),
        day3: getWinningVariant('drip_day3'),
        day7: getWinningVariant('drip_day7'),
        day14: getWinningVariant('drip_day14'),
      },

      // Overall conversion stats
      conversion_stats: getConversionStats(),

      // Conversions by email type
      conversions_by_email: getConversionsByEmailType(),

      // Basic email engagement stats
      email_stats: eventType
        ? getEmailStats(eventType)
        : getEmailStats(),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching email analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update A/B test variant configuration
 *
 * POST /api/analytics/email-drip
 * Body: { event_type, variant, updates: { subject_line?, cta_text?, weight?, is_active? } }
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check (admin only)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { event_type, variant, updates } = body;

    if (!event_type || !variant || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields: event_type, variant, updates' },
        { status: 400 }
      );
    }

    // Import updateABVariant here to avoid circular dependency
    const { updateABVariant } = await import('@/lib/email/ab-testing');

    const success = updateABVariant(event_type, variant, updates);

    if (success) {
      return NextResponse.json({
        message: 'A/B variant updated successfully',
        event_type,
        variant,
        updates,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to update A/B variant' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating A/B variant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
