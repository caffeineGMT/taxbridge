/**
 * Affiliate Click Tracking API
 * POST /api/affiliates/track - Record affiliate link click
 * GET /api/affiliates/track?ref=slug - Redirect with tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import {
  getAffiliatePartnerByReferralCode,
} from '@/lib/db/queries/affiliates';
import {
  getAffiliateBySlug,
  recordAffiliateClick,
} from '@/lib/db/queries/influencer-affiliates';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ref, landing_page } = body;

    if (!ref) {
      return NextResponse.json({ error: 'Missing ref parameter' }, { status: 400 });
    }

    // Look up affiliate by slug or referral code
    let partner = getAffiliateBySlug(ref);
    if (!partner) {
      partner = getAffiliatePartnerByReferralCode(ref) as any;
    }

    if (!partner || partner.status !== 'approved') {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    // Hash IP for privacy-safe tracking
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const ipHash = createHash('sha256').update(ip + 'taxbridge-salt').digest('hex').substring(0, 16);

    const userAgent = req.headers.get('user-agent') || undefined;

    recordAffiliateClick({
      affiliate_id: partner.id,
      referral_code: (partner as any).custom_referral_slug || partner.referral_code,
      ip_hash: ipHash,
      user_agent: userAgent,
      landing_page,
    });

    return NextResponse.json({ success: true, tracked: true });
  } catch (error) {
    // console.error('[Affiliate] Track error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get('ref');

  if (!ref) {
    return NextResponse.redirect(new URL('/signup', req.url));
  }

  // Look up affiliate
  let partner = getAffiliateBySlug(ref);
  if (!partner) {
    partner = getAffiliatePartnerByReferralCode(ref) as any;
  }

  if (partner && partner.status === 'approved') {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const ipHash = createHash('sha256').update(ip + 'taxbridge-salt').digest('hex').substring(0, 16);

    recordAffiliateClick({
      affiliate_id: partner.id,
      referral_code: ref,
      ip_hash: ipHash,
      user_agent: req.headers.get('user-agent') || undefined,
      landing_page: '/signup',
    });
  }

  // Redirect to signup with ref param preserved
  return NextResponse.redirect(new URL(`/signup?ref=${ref}`, req.url));
}
