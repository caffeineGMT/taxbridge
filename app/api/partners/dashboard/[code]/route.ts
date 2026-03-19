/**
 * Partner Dashboard API Route
 * GET /api/partners/dashboard/[code] - Get partner stats and referrals
 */

import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import {
  getAffiliatePartnerByReferralCode,
  getAffiliateReferralsWithUser,
} from '@/lib/db/queries/affiliates';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Get partner by referral code
    const partner = getAffiliatePartnerByReferralCode(code);

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Check authentication - user must be logged in and email must match partner email
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (userEmail !== partner.email) {
      return NextResponse.json(
        { error: 'Unauthorized access to this dashboard' },
        { status: 403 }
      );
    }

    // Get referrals with masked user info
    const referrals = getAffiliateReferralsWithUser(partner.id);

    return NextResponse.json({
      partner,
      referrals,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/partners/dashboard/[code]', method: req.method });
  }
}
