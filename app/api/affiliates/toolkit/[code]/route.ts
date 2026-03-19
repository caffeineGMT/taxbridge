/**
 * Affiliate Toolkit API
 * GET /api/affiliates/toolkit/[code] - Get affiliate marketing toolkit content
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAffiliatePartnerByReferralCode,
} from '@/lib/db/queries/affiliates';
import { getAffiliateBySlug } from '@/lib/db/queries/influencer-affiliates';
import { generateAffiliateToolkit } from '@/lib/partners/affiliate-toolkit';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

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
      return NextResponse.json(
        { error: 'Affiliate not yet approved. Toolkit is available after approval.' },
        { status: 403 }
      );
    }

    const slug = (partner as any).custom_referral_slug || partner.referral_code;
    const toolkit = generateAffiliateToolkit(slug, partner.partner_name);

    return NextResponse.json({
      partner: {
        partner_name: partner.partner_name,
        firm_name: partner.firm_name,
        referral_code: partner.referral_code,
        commission_rate: partner.commission_rate,
      },
      toolkit,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/affiliates/toolkit/[code]', method: req.method });
  }
}
