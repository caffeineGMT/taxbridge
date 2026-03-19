/**
 * Partner Signup API Endpoint
 * Handles new partner applications
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAffiliatePartner } from '@/lib/db/queries/affiliates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { partner_name, firm_name, email, phone, website, partner_type, message } = body;

    // Validate required fields
    if (!partner_name || !firm_name || !email || !partner_type) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    // Create affiliate partner application
    const affiliateId = createAffiliatePartner({
      partner_name,
      firm_name,
      email,
      commission_rate: 0.30, // 30% commission
    });

    // TODO: Send notification email to admin about new partner application
    // TODO: Send confirmation email to partner

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      affiliate_id: affiliateId,
    });
  } catch (error) {
    console.error('[Partner Signup] Error:', error);

    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Email already registered', message: 'A partner with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to process application' },
      { status: 500 }
    );
  }
}
