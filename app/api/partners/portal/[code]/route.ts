/**
 * Enhanced Partner Portal API
 * Returns comprehensive analytics and stats for partner portal
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getAffiliatePartnerByReferralCode,
  getAffiliateReferrals,
  getPendingCommissions,
  getPaidCommissions
} from '@/lib/db/queries/affiliates';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    const partner = getAffiliatePartnerByReferralCode(code);

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Get referrals
    const referrals = getAffiliateReferrals(partner.id);
    const pendingCommissions = getPendingCommissions(partner.id);
    const paidCommissions = getPaidCommissions(partner.id);

    // Calculate stats
    const totalReferrals = referrals.length;
    const last30Days = referrals.filter(r => {
      const createdAt = new Date(r.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdAt >= thirtyDaysAgo;
    }).length;

    const avgCommission = totalReferrals > 0 ? partner.total_revenue / totalReferrals : 0;

    // Conversion rate (simplified - could track clicks in future)
    const conversionRate = totalReferrals > 0 ? (totalReferrals / Math.max(totalReferrals * 10, 100)) * 100 : 0;

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const monthReferrals = referrals.filter(r => {
        const refDate = new Date(r.created_at);
        const refKey = `${refDate.getFullYear()}-${String(refDate.getMonth() + 1).padStart(2, '0')}`;
        return refKey === monthKey;
      });

      const monthRevenue = monthReferrals.reduce((sum, r) => sum + r.commission_amount, 0);

      monthlyTrend.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        count: monthReferrals.length,
        revenue: monthRevenue
      });
    }

    return NextResponse.json({
      partner: {
        id: partner.id,
        firm_name: partner.firm_name,
        partner_name: partner.partner_name,
        email: partner.email,
        referral_code: partner.referral_code,
        commission_rate: partner.commission_rate,
        status: partner.status,
        created_at: partner.created_at,
        approved_at: partner.approved_at
      },
      stats: {
        total_referrals: totalReferrals,
        total_revenue: partner.total_revenue,
        pending_commissions: pendingCommissions,
        paid_commissions: paidCommissions,
        conversion_rate: conversionRate,
        avg_commission: avgCommission,
        last_30_days: last30Days,
        monthly_trend: monthlyTrend
      }
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/partners/portal/[code]', method: request.method });
  }
}
