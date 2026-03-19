/**
 * Track Referral Link Click API Route
 * POST /api/referrals/track-click
 * Records when someone clicks on a referral link
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackReferralClick } from '@/lib/db/queries/referral-tracking';
import { getUserByReferralCode } from '@/lib/db/queries/referrals';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, utm_source, utm_medium, utm_campaign, landing_page } = body;

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code required' }, { status: 400 });
    }

    // Get referrer user ID
    const referrer = getUserByReferralCode(referralCode);

    // Get visitor info from request
    const visitorIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const visitorUserAgent = request.headers.get('user-agent') || undefined;
    const visitorCountry = request.headers.get('cf-ipcountry') || undefined; // Cloudflare geo header

    // Track the click
    const clickId = trackReferralClick({
      referralCode,
      referrerUserId: referrer?.id,
      visitorIp,
      visitorCountry,
      visitorUserAgent,
      utmSource: utm_source,
      utmMedium: utm_medium,
      utmCampaign: utm_campaign,
      landingPage: landing_page,
    });

    logger.info('Referral click tracked', {
      clickId,
      referralCode,
      referrerId: referrer?.id,
      utmSource: utm_source,
    });

    return NextResponse.json({
      success: true,
      clickId,
      message: 'Click tracked successfully',
    });
  } catch (error: any) {
    logger.error('Failed to track referral click', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to track click', details: error.message },
      { status: 500 }
    );
  }
}
