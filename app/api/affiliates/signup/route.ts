/**
 * Influencer Affiliate Signup API
 * POST /api/affiliates/signup - Submit influencer affiliate application
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAffiliatePartnerByEmail,
} from '@/lib/db/queries/affiliates';
import {
  createInfluencerAffiliate,
  getAffiliateBySlug,
} from '@/lib/db/queries/influencer-affiliates';
import { handleApiError } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      partner_name,
      firm_name,
      email,
      partner_type,
      platform,
      platform_url,
      audience_size,
      content_niche,
      custom_referral_slug,
      payout_method,
      paypal_email,
    } = body;

    // Validate required fields
    if (!partner_name || !firm_name || !email || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: name, channel name, email, and platform are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existingPartner = getAffiliatePartnerByEmail(email);
    if (existingPartner) {
      return NextResponse.json(
        { error: 'An affiliate application already exists for this email' },
        { status: 409 }
      );
    }

    // Check if custom slug is taken
    if (custom_referral_slug) {
      const slugRegex = /^[a-z0-9-]{2,30}$/;
      if (!slugRegex.test(custom_referral_slug)) {
        return NextResponse.json(
          { error: 'Custom referral slug must be 2-30 characters, lowercase letters, numbers, and hyphens only' },
          { status: 400 }
        );
      }

      const existingSlug = getAffiliateBySlug(custom_referral_slug);
      if (existingSlug) {
        return NextResponse.json(
          { error: 'This referral slug is already taken. Please choose another.' },
          { status: 409 }
        );
      }
    }

    // Validate payout method
    if (payout_method === 'paypal' && !paypal_email) {
      return NextResponse.json(
        { error: 'PayPal email is required when PayPal is selected as payout method' },
        { status: 400 }
      );
    }

    // Create influencer affiliate with 30% commission (higher than standard 20%)
    const partnerId = createInfluencerAffiliate({
      partner_name,
      firm_name,
      email,
      commission_rate: 0.30, // 30% for influencers
      partner_type: partner_type || 'influencer',
      custom_referral_slug: custom_referral_slug || undefined,
      platform,
      platform_url,
      audience_size: parseInt(audience_size) || 0,
      content_niche,
      paypal_email,
      payout_method: payout_method || 'stripe',
    });

    logger.info(
      `[Affiliate] New influencer application: ${firm_name} (${email}), platform: ${platform}, audience: ${audience_size}`
    );

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully! We will review and get back to you within 24-48 hours.',
      partner_id: partnerId,
    });
  } catch (error: any) {
    // console.error('[Affiliate] Influencer signup error:', error);

    if (error.message?.includes('UNIQUE constraint')) {
      return NextResponse.json(
        { error: 'This email or referral slug is already in use.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}
