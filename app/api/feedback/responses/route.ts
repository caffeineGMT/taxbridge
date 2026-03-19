/**
 * Get Feedback Responses API
 * GET /api/feedback/responses?campaign_id=123
 *
 * Purpose: Get all responses for a specific campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/unified';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaign_id');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'campaign_id parameter is required' },
        { status: 400 }
      );
    }

    // Get all responses for this campaign
    const responses = await query<any>(`
      SELECT * FROM user_feedback_responses
      WHERE campaign_id = $1
      ORDER BY created_at DESC
    `, [parseInt(campaignId)]);

    return NextResponse.json({
      success: true,
      campaign_id: parseInt(campaignId),
      total_responses: responses.length,
      responses,
    });

  } catch (error: any) {
    return handleApiError(error, { route: '/api/feedback/responses', method: req.method });
  }
}
