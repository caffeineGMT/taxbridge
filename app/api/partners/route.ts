import { NextRequest, NextResponse } from 'next/server';
import {
  getAllPartners,
  getPartnersByType,
  getPartnersByStatus,
  createPartner,
  PartnerInput,
} from '@/lib/db/queries/partners';
import { logger } from '@/lib/logger';
import { applyAuthRateLimit } from '@/lib/apply-rate-limiting';

/**
 * GET /api/partners
 * Get all partners, optionally filtered by type or status
 */
export async function GET(request: NextRequest) {
  const rateLimitResult = await applyAuthRateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as
      | 'immigration_lawyer'
      | 'cpa'
      | 'other'
      | null;
    const status = searchParams.get('status') as
      | 'prospect'
      | 'contacted'
      | 'interested'
      | 'active'
      | 'inactive'
      | 'rejected'
      | null;

    let partners;

    if (type) {
      partners = await getPartnersByType(type);
    } else if (status) {
      partners = await getPartnersByStatus(status);
    } else {
      partners = await getAllPartners();
    }

    return NextResponse.json({ partners }, { status: 200 });
  } catch (error) {
    logger.error('Failed to fetch partners', { error });
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/partners
 * Create a new partner
 */
export async function POST(request: NextRequest) {
  const rateLimitResult = await applyAuthRateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.partner_type ||
      !body.name ||
      !body.firm_name ||
      !body.email ||
      !body.referral_code
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: partner_type, name, firm_name, email, referral_code',
        },
        { status: 400 }
      );
    }

    // Validate partner_type
    if (!['immigration_lawyer', 'cpa', 'other'].includes(body.partner_type)) {
      return NextResponse.json(
        { error: 'Invalid partner_type. Must be immigration_lawyer, cpa, or other' },
        { status: 400 }
      );
    }

    // Generate unique referral code if not provided
    const referralCode =
      body.referral_code ||
      `${body.partner_type.toUpperCase()}_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

    const partnerInput: PartnerInput = {
      partner_type: body.partner_type,
      name: body.name,
      firm_name: body.firm_name,
      email: body.email,
      phone: body.phone,
      website: body.website,
      specialization: body.specialization,
      estimated_client_count: body.estimated_client_count,
      location_city: body.location_city,
      location_state: body.location_state,
      location_country: body.location_country || 'USA',
      revenue_share_percentage: body.revenue_share_percentage || 30.0,
      referral_code: referralCode,
      notes: body.notes,
    };

    const partnerId = await createPartner(partnerInput);

    logger.info('Partner created', {
      partnerId,
      partner_type: partnerInput.partner_type,
      firm_name: partnerInput.firm_name,
    });

    return NextResponse.json(
      { partnerId, referral_code: referralCode },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Failed to create partner', { error });
    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}
