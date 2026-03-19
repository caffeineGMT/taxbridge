/**
 * Admin API - Approve Partner
 */

import { NextRequest, NextResponse } from 'next/server';
import { approveAffiliatePartner } from '@/lib/db/queries/affiliates';
import { handleApiError } from '@/lib/api-error-handler';

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
    return handleApiError(error, { route: '/api/admin/partners/[id]/approve', method: request.method });
  }
}
