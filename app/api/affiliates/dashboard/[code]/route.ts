/**
 * Affiliate Dashboard API
 * GET /api/affiliates/dashboard/[code] - Get affiliate stats and data
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAffiliatePartnerByReferralCode,
  getAffiliateReferralsWithUser,
} from '@/lib/db/queries/affiliates';
import {
  getAffiliateDashboardStats,
  getAffiliatePayouts,
  getAffiliateBySlug,
  getLeaderboard,
} from '@/lib/db/queries/influencer-affiliates';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Try both referral code and custom slug
    let partner = getAffiliatePartnerByReferralCode(code);
    if (!partner) {
      partner = getAffiliateBySlug(code) as any;
    }

    if (!partner) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    if (partner.status !== 'approved') {
      return NextResponse.json({
        partner: {
          id: partner.id,
          partner_name: partner.partner_name,
          firm_name: partner.firm_name,
          status: partner.status,
        },
        message: partner.status === 'pending'
          ? 'Your application is under review. We will notify you within 24-48 hours.'
          : 'Your application was not approved.',
      });
    }

    // Get dashboard stats
    const stats = getAffiliateDashboardStats(partner.id);
    const referrals = getAffiliateReferralsWithUser(partner.id);
    const payouts = getAffiliatePayouts(partner.id);

    // Get current month leaderboard position
    const leaderboard = getLeaderboard();
    const leaderboardPosition = leaderboard.findIndex(
      entry => entry.affiliate_id === partner!.id
    ) + 1;

    return NextResponse.json({
      partner: {
        id: partner.id,
        partner_name: partner.partner_name,
        firm_name: partner.firm_name,
        email: partner.email,
        referral_code: partner.referral_code,
        commission_rate: partner.commission_rate,
        status: partner.status,
        created_at: partner.created_at,
        approved_at: partner.approved_at,
      },
      stats,
      referrals,
      payouts,
      leaderboardPosition: leaderboardPosition || null,
      referralUrl: `https://taxbridge.app/signup?ref=${(partner as any).custom_referral_slug || partner.referral_code}`,
    });
  } catch (error) {
    console.error('[Affiliate] Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
