/**
 * Affiliate Leaderboard API
 * GET /api/affiliates/leaderboard - Get monthly leaderboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/db/queries/influencer-affiliates';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') || undefined;

    const leaderboard = getLeaderboard(month);

    // Mask sensitive data for public view
    const publicLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      partner_name: entry.partner_name,
      firm_name: entry.firm_name,
      platform: entry.platform,
      tier: entry.tier,
      referral_count: entry.referral_count,
      conversion_count: entry.conversion_count,
      commission_earned: entry.commission_earned,
      bonus_earned: entry.bonus_earned,
    }));

    return NextResponse.json({
      month: month || new Date().toISOString().substring(0, 7),
      leaderboard: publicLeaderboard,
      bonuses: {
        first: 500,
        second: 250,
        third: 100,
      },
    });
  } catch (error) {
    console.error('[Affiliate] Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load leaderboard' },
      { status: 500 }
    );
  }
}
