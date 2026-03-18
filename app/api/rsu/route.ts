import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUserProfileByClerkId, insertRSUEntry } from '@/lib/db';
import { RSUEventSchema } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const userProfile = getUserProfileByClerkId(clerkUserId);

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

    // Check subscription limits (free tier: 10 RSU entries)
    const { getRSUEntries } = await import('@/lib/db');
    const existingEntries = getRSUEntries(userProfile.id);

    if (userProfile.subscription_tier === 'free' && existingEntries.length >= 10) {
      return NextResponse.json(
        {
          error: 'Free tier limit reached',
          upgradeRequired: true,
          currentCount: existingEntries.length,
          limit: 10,
        },
        { status: 403 }
      );
    }

    // Insert RSU entry
    const rsuEntryId = insertRSUEntry({
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
    console.error('Error creating RSU entry:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const userProfile = getUserProfileByClerkId(clerkUserId);

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { getRSUEntries } = await import('@/lib/db');
    const entries = getRSUEntries(userProfile.id);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching RSU entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
