import { NextRequest, NextResponse } from 'next/server';
import {
  getPartnerMetrics,
  getTopPerformingPartners,
} from '@/lib/db/queries/partners';
import { logger } from '@/lib/logger';
import { applyAuthRateLimit } from '@/lib/apply-rate-limiting';

/**
 * GET /api/partners/metrics
 * Get overall partnership program metrics
 */
export async function GET(request: NextRequest) {
  const rateLimitResult = await applyAuthRateLimit(request, {
    id: 'partner-metrics',
    limit: 50,
  });
  if (rateLimitResult) return rateLimitResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const partnerId = searchParams.get('partner_id');

    if (partnerId) {
      // Get metrics for a specific partner
      const partnerIdNum = parseInt(partnerId, 10);

      if (isNaN(partnerIdNum)) {
        return NextResponse.json(
          { error: 'Invalid partner ID' },
          { status: 400 }
        );
      }

      const metrics = await getPartnerMetrics(partnerIdNum);

      return NextResponse.json({ metrics }, { status: 200 });
    } else {
      // Get top performing partners
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const topPartners = await getTopPerformingPartners(limit);

      return NextResponse.json({ top_partners: topPartners }, { status: 200 });
    }
  } catch (error) {
    logger.error('Failed to fetch partner metrics', { error });
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
