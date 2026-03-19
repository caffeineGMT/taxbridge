/**
 * Admin API - Approve Partner
 */

import { NextRequest, NextResponse } from 'next/server';
import { approveAffiliatePartner } from '@/lib/db/queries/affiliates';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partnerId = parseInt(params.id);

    if (isNaN(partnerId)) {
      return NextResponse.json({ error: 'Invalid partner ID' }, { status: 400 });
    }

    // TODO: Add admin authentication check

    approveAffiliatePartner(partnerId);

    // TODO: Send approval email to partner with referral code and dashboard link

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin] Error approving partner:', error);
    return NextResponse.json({ error: 'Failed to approve partner' }, { status: 500 });
  }
}
