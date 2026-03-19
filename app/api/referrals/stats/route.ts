/**
 * Referral Stats API Route
 * GET /api/referrals/stats
 * Returns comprehensive viral metrics for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserProfileByClerkId } from '@/lib/db';
import {
  getUserViralMetrics,
  getUserClickStats,
  getUserShareStats,
} from '@/lib/db/queries/referral-tracking';
import { getUserReferralStats, getUserReferralCode } from '@/lib/db/queries/referrals';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserProfileByClerkId(clerkUserId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get referral code
    const referralCode = getUserReferralCode(user.id);

    // Get all stats
    const viralMetrics = getUserViralMetrics(user.id);
    const clickStats = getUserClickStats(user.id);
    const shareStats = getUserShareStats(user.id);
    const referralStats = getUserReferralStats(user.id);

    const stats = {
      referral_code: referralCode,
      referral_link: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${referralCode}`,

      // Viral metrics
      viral_metrics: {
        shares: viralMetrics.shares,
        clicks: viralMetrics.clicks,
        conversions: viralMetrics.conversions,
        click_to_share_ratio: parseFloat(viralMetrics.click_to_share_ratio.toFixed(2)),
        conversion_rate_percent: parseFloat(viralMetrics.conversion_rate.toFixed(2)),
        viral_coefficient: parseFloat(viralMetrics.viral_coefficient.toFixed(2)),
      },

      // Click stats
      clicks: {
        total: clickStats.total_clicks,
        last_7_days: clickStats.clicks_last_7_days,
        last_30_days: clickStats.clicks_last_30_days,
        by_source: clickStats.clicks_by_source,
      },

      // Share stats
      shares: {
        total: shareStats.total_shares,
        last_7_days: shareStats.shares_last_7_days,
        last_30_days: shareStats.shares_last_30_days,
        by_platform: shareStats.shares_by_platform,
      },

      // Referral stats
      referrals: {
        total: referralStats.total_referrals,
        successful_conversions: referralStats.successful_conversions,
        pending: referralStats.pending_referrals,
        rewards_earned: referralStats.rewards_earned,
        conversion_rate_percent:
          referralStats.total_referrals > 0
            ? parseFloat(((referralStats.successful_conversions / referralStats.total_referrals) * 100).toFixed(2))
            : 0,
      },
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    logger.error('Failed to get referral stats', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to get stats', details: error.message },
      { status: 500 }
    );
  }
}
