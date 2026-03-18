/**
 * Instantly.ai Campaign Sync API
 * POST /api/outreach/sync - Sync campaign analytics from Instantly.ai
 *
 * Pulls latest metrics and updates local database
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCampaignAnalytics } from '@/lib/outreach/instantly-integration';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaign_id } = body;

    if (!campaign_id) {
      return NextResponse.json(
        { error: 'Missing campaign_id' },
        { status: 400 }
      );
    }

    if (!process.env.INSTANTLY_API_KEY) {
      return NextResponse.json(
        { error: 'INSTANTLY_API_KEY not configured' },
        { status: 503 }
      );
    }

    const analytics = await getCampaignAnalytics(campaign_id);

    return NextResponse.json({
      success: true,
      analytics,
      synced_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Sync] Error syncing campaign:', error);
    return NextResponse.json(
      { error: 'Failed to sync campaign data' },
      { status: 500 }
    );
  }
}
