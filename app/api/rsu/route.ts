import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUserProfileByClerkId, insertRSUEntry } from '@/lib/db';
import { RSUEventSchema } from '@/lib/types';
import { handleApiError } from '@/lib/api-error-handler';
import { getFreeTierLimit, hasExceededLimit, getUpgradeMessage } from '@/lib/free-tier-limits';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const userProfile = await getUserProfileByClerkId(clerkUserId);

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const body = await request.json();

    // Validate the request body
    const validationResult = RSUEventSchema.omit({ id: true, createdAt: true }).safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Dynamic free tier limit enforcement based on A/B test variant
    // Get variant from request header (set by client-side experiment)
    const freeTierVariant = request.headers.get('x-free-tier-variant');
    const limitConfig = getFreeTierLimit(freeTierVariant);

    // Check subscription limits based on user's A/B test variant
    const { getRSUEntries } = await import('@/lib/db');
    const existingEntries = await getRSUEntries(userProfile.id);

    if (userProfile.subscription_tier === 'free' && hasExceededLimit(existingEntries.length, limitConfig)) {
      return NextResponse.json(
        {
          error: 'Free tier limit reached',
          upgradeRequired: true,
          currentCount: existingEntries.length,
          limit: limitConfig.maxRSUEntries === 'unlimited' ? 'unlimited' : limitConfig.maxRSUEntries,
          variant: limitConfig.variant,
          message: getUpgradeMessage(limitConfig),
        },
        { status: 403 }
      );
    }

    // Insert RSU entry
    const rsuEntryId = await insertRSUEntry({
      user_id: userProfile.id,
      vest_date: data.vestingDate,
      fmv_usd: data.fmvUsd,
      shares: data.shares,
      employer: data.employer as 'Meta' | 'Amazon' | 'Google' | 'Microsoft',
      ticker_symbol: data.tickerSymbol,
    });

    return NextResponse.json({
      success: true,
      id: rsuEntryId,
      message: 'RSU entry created successfully',
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/rsu', method: request.method });
  }
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const userProfile = await getUserProfileByClerkId(clerkUserId);

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { getRSUEntries } = await import('@/lib/db');
    const entries = await getRSUEntries(userProfile.id);

    return NextResponse.json({ entries });
  } catch (error) {
    return handleApiError(error, { route: '/api/rsu', method: request.method });
  }
}
