import { NextRequest, NextResponse } from 'next/server';
import { trackEmailConversion } from '@/lib/db/queries/reengagement-campaign';
import { getUserByClerkId } from '@/lib/db';

// Configure route as dynamic
export const dynamic = 'force-dynamic';

/**
 * POST /api/track/email-conversion
 *
 * Track conversions from email campaigns (drip + re-engagement)
 * Call this endpoint when a user upgrades after receiving an email
 *
 * USAGE:
 * - Stripe webhook (on subscription created)
 * - Checkout success page (on payment completion)
 * - Dashboard upgrade flow (on free -> pro transition)
 *
 * REQUEST BODY:
 * {
 *   "userId": number,
 *   "clerkUserId": string, // Alternative to userId
 *   "conversionType": "calculator_to_signup" | "free_to_pro" | "trial_to_paid" | "reactivation",
 *   "revenueAmount": number,
 *   "discountCode": string (optional),
 *   "metadata": object (optional)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { userId, clerkUserId, conversionType, revenueAmount } = body;

    if (!userId && !clerkUserId) {
      return NextResponse.json(
        { error: 'Either userId or clerkUserId is required' },
        { status: 400 }
      );
    }

    if (!conversionType) {
      return NextResponse.json(
        { error: 'conversionType is required' },
        { status: 400 }
      );
    }

    // Get user ID from Clerk ID if needed
    let resolvedUserId = userId;
    if (!resolvedUserId && clerkUserId) {
      const userProfile = await getUserByClerkId(clerkUserId);
      if (!userProfile) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      resolvedUserId = userProfile.id;
    }

    // Track conversion
    const success = trackEmailConversion({
      userId: resolvedUserId,
      conversionType,
      revenueAmount: revenueAmount || 0,
      discountCode: body.discountCode,
      attributionWindowHours: body.attributionWindowHours || 168, // 7 days default
      metadata: body.metadata,
    });

    if (success) {
      console.log(`✅ Email conversion tracked: User ${resolvedUserId} - ${conversionType} - $${revenueAmount}`);

      return NextResponse.json({
        success: true,
        message: 'Conversion tracked successfully',
        userId: resolvedUserId,
        conversionType,
        revenueAmount: revenueAmount || 0,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to track conversion' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error tracking email conversion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/track/email-conversion?userId=123
 *
 * Check if a user has a tracked email conversion
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    const { getDatabase } = await import('@/lib/db');
    const db = getDatabase();

    const conversions = db.prepare(`
      SELECT
        id,
        conversion_type,
        revenue_amount,
        discount_code,
        converted_at,
        attribution_window_hours
      FROM email_conversions
      WHERE user_id = ?
      ORDER BY converted_at DESC
    `).all(parseInt(userId));

    return NextResponse.json({
      userId: parseInt(userId),
      conversions,
      totalRevenue: conversions.reduce((sum, c: any) => sum + (c.revenue_amount || 0), 0),
      conversionCount: conversions.length,
    });
  } catch (error) {
    console.error('❌ Error fetching email conversions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
