import { NextRequest, NextResponse } from 'next/server';
import {
  getPartnerById,
  updatePartnerStatus,
  scheduleIntroCall,
  completeIntroCall,
  activatePartnership,
} from '@/lib/db/queries/partners';
import { logger } from '@/lib/logger';
import { applyAuthRateLimit } from '@/lib/apply-rate-limiting';

/**
 * GET /api/partners/[id]
 * Get a specific partner by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResult = await applyAuthRateLimit(request, {
    id: 'partner-details',
    limit: 100,
  });
  if (rateLimitResult) return rateLimitResult;

  try {
    const { id } = await params;
    const partnerId = parseInt(id, 10);

    if (isNaN(partnerId)) {
      return NextResponse.json({ error: 'Invalid partner ID' }, { status: 400 });
    }

    const partner = await getPartnerById(partnerId);

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json({ partner }, { status: 200 });
  } catch (error) {
    logger.error('Failed to fetch partner', { error });
    return NextResponse.json(
      { error: 'Failed to fetch partner' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/partners/[id]
 * Update partner status or schedule actions
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResult = await applyAuthRateLimit(request, {
    id: 'partner-update',
    limit: 20,
  });
  if (rateLimitResult) return rateLimitResult;

  try {
    const { id } = await params;
    const partnerId = parseInt(id, 10);

    if (isNaN(partnerId)) {
      return NextResponse.json({ error: 'Invalid partner ID' }, { status: 400 });
    }

    const body = await request.json();
    const { action, status, scheduled_at } = body;

    // Handle different actions
    if (action === 'update_status' && status) {
      if (
        !['prospect', 'contacted', 'interested', 'active', 'inactive', 'rejected'].includes(
          status
        )
      ) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      await updatePartnerStatus(partnerId, status);
      logger.info('Partner status updated', { partnerId, status });

      return NextResponse.json(
        { message: 'Partner status updated successfully' },
        { status: 200 }
      );
    } else if (action === 'schedule_call' && scheduled_at) {
      await scheduleIntroCall(partnerId, scheduled_at);
      logger.info('Intro call scheduled', { partnerId, scheduled_at });

      return NextResponse.json(
        { message: 'Intro call scheduled successfully' },
        { status: 200 }
      );
    } else if (action === 'complete_call') {
      await completeIntroCall(partnerId);
      logger.info('Intro call completed', { partnerId });

      return NextResponse.json(
        { message: 'Intro call marked as completed' },
        { status: 200 }
      );
    } else if (action === 'activate') {
      await activatePartnership(partnerId);
      logger.info('Partnership activated', { partnerId });

      return NextResponse.json(
        { message: 'Partnership activated successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid action or missing required fields' },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error('Failed to update partner', { error });
    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}
