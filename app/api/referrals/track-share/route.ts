/**
 * Track Referral Share API Route
 * POST /api/referrals/track-share
 * Records when a user shares their referral link
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserProfileByClerkId } from '@/lib/db';
import { trackReferralShare } from '@/lib/db/queries/referral-tracking';
import { getUserReferralCode } from '@/lib/db/queries/referrals';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserProfileByClerkId(clerkUserId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { platform, metadata } = body;

    // Validate platform
    const validPlatforms = ['twitter', 'linkedin', 'email', 'copy_link', 'direct_email'];
    if (!platform || !validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform. Must be one of: ' + validPlatforms.join(', ') },
        { status: 400 }
      );
    }

    // Get user's referral code
    const referralCode = getUserReferralCode(user.id);

    // Track the share
    const shareId = trackReferralShare({
      referrerUserId: user.id,
      referralCode,
      sharePlatform: platform as any,
      shareMetadata: metadata,
    });

    logger.info('Referral share tracked', {
      shareId,
      userId: user.id,
      platform,
      referralCode,
    });

    return NextResponse.json({
      success: true,
      shareId,
      message: `Share tracked successfully on ${platform}`,
    });
  } catch (error: any) {
    logger.error('Failed to track referral share', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to track share', details: error.message },
      { status: 500 }
    );
  }
}
