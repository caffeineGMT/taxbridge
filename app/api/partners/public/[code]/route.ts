/**
 * Public Partner Info API
 * Returns public partner info for co-branded landing pages
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAffiliatePartnerByReferralCode } from '@/lib/db/queries/affiliates';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
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

    // Only return public info for approved partners
    if (partner.status !== 'approved') {
      return NextResponse.json(
        { error: 'Partner not active' },
        { status: 404 }
      );
    }

    // Return sanitized public data
    return NextResponse.json({
      partner: {
        firm_name: partner.firm_name,
        partner_name: partner.partner_name,
        referral_code: partner.referral_code,
        total_referrals: partner.total_referrals,
        status: partner.status
      }
    });
  } catch (error) {
    console.error('Error fetching partner info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
