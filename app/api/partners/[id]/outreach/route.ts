import { NextRequest, NextResponse } from 'next/server';
import {
  recordPartnerOutreach,
  getPartnerOutreachHistory,
  updatePartnerContactTimestamp,
  PartnerOutreachInput,
} from '@/lib/db/queries/partners';
import { logger } from '@/lib/logger';
import { applyRateLimiting } from '@/lib/apply-rate-limiting';

/**
 * GET /api/partners/[id]/outreach
 * Get outreach history for a partner
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResult = await applyRateLimiting(request, {
    id: 'partner-outreach-list',
    limit: 100,
  });
  if (rateLimitResult) return rateLimitResult;

  try {
    const { id } = await params;
    const partnerId = parseInt(id, 10);

    if (isNaN(partnerId)) {
      return NextResponse.json({ error: 'Invalid partner ID' }, { status: 400 });
    }

    const outreachHistory = await getPartnerOutreachHistory(partnerId);

    return NextResponse.json({ outreach: outreachHistory }, { status: 200 });
  } catch (error) {
    logger.error('Failed to fetch partner outreach history', { error });
    return NextResponse.json(
      { error: 'Failed to fetch outreach history' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/partners/[id]/outreach
 * Record a new outreach email to a partner
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResult = await applyRateLimiting(request, {
    id: 'partner-outreach-create',
    limit: 10,
  });
  if (rateLimitResult) return rateLimitResult;

  try {
    const { id } = await params;
    const partnerId = parseInt(id, 10);

    if (isNaN(partnerId)) {
      return NextResponse.json({ error: 'Invalid partner ID' }, { status: 400 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.email_subject || !body.email_body) {
      return NextResponse.json(
        { error: 'Missing required fields: email_subject, email_body' },
        { status: 400 }
      );
    }

    const outreachInput: PartnerOutreachInput = {
      partner_id: partnerId,
      email_subject: body.email_subject,
      email_body: body.email_body,
      notes: body.notes,
    };

    const outreachId = await recordPartnerOutreach(outreachInput);

    // Update partner's contact timestamp
    const isFirstContact = body.is_first_contact === true;
    await updatePartnerContactTimestamp(partnerId, isFirstContact);

    logger.info('Partner outreach recorded', {
      outreachId,
      partnerId,
      is_first_contact: isFirstContact,
    });

    return NextResponse.json({ outreachId }, { status: 201 });
  } catch (error) {
    logger.error('Failed to record partner outreach', { error });
    return NextResponse.json(
      { error: 'Failed to record outreach' },
      { status: 500 }
    );
  }
}
