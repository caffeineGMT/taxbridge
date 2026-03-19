/**
 * Admin API - Reject Partner
 */

import { NextRequest, NextResponse } from 'next/server';
import { rejectAffiliatePartner } from '@/lib/db/queries/affiliates';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partnerId = parseInt(params.id);

    if (isNaN(partnerId)) {
      return NextResponse.json({ error: 'Invalid partner ID' }, { status: 400 });
    }

    const body = await request.json();
    const { reason } = body;

    // TODO: Add admin authentication check

    rejectAffiliatePartner(partnerId, reason);

    // TODO: Send rejection email to partner with reason

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin] Error rejecting partner:', error);
    return NextResponse.json({ error: 'Failed to reject partner' }, { status: 500 });
  }
}
