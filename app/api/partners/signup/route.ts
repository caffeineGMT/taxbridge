/**
 * Partner Signup API Route
 * POST /api/partners/signup - Submit affiliate application
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createAffiliatePartner,
  getAffiliatePartnerByEmail,
} from '@/lib/db/queries/affiliates';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { partner_name, firm_name, email, commission_rate_requested } = body;

    // Validate required fields
    if (!partner_name || !firm_name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: partner_name, firm_name, email' },
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

    // Check if email already exists
    const existingPartner = getAffiliatePartnerByEmail(email);
    if (existingPartner) {
      return NextResponse.json(
        { error: 'An affiliate application already exists for this email' },
        { status: 409 }
      );
    }

    // Validate commission rate
    let commissionRate = 0.20; // Default 20%
    if (commission_rate_requested !== undefined) {
      const rate = parseFloat(commission_rate_requested);
      if (isNaN(rate) || rate < 0.1 || rate > 0.3) {
        return NextResponse.json(
          { error: 'Commission rate must be between 10% and 30%' },
          { status: 400 }
        );
      }
      commissionRate = rate;
    }

    // Create affiliate partner
    const partnerId = createAffiliatePartner({
      partner_name,
      firm_name,
      email,
      commission_rate: commissionRate,
    });

    // TODO: Send notification emails
    // - Admin notification about new application
    // - Confirmation email to partner

    console.log(`[Affiliate] New application: ${firm_name} (${email}), commission: ${(commissionRate * 100).toFixed(0)}%`);

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully. You will receive an email once your application is reviewed.',
      partner_id: partnerId,
    });
  } catch (error) {
    console.error('[Affiliate] Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}
