/**
 * Get Feedback Campaigns API
 * GET /api/feedback/campaigns
 *
 * Purpose: Get all feedback campaigns and their stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/unified';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(req: NextRequest) {
  try {
    // Get all campaigns
    const campaigns = await query<any>(`
      SELECT * FROM user_feedback_campaigns
      ORDER BY created_at DESC
    `);

    // Get response counts for each
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const responseCount = await query<{ count: number }>(`
          SELECT COUNT(*) as count FROM user_feedback_responses
          WHERE campaign_id = $1
        `, [campaign.id]);

        return {
          ...campaign,
          total_responses: responseCount[0]?.count || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      campaigns: campaignsWithStats,
    });

  } catch (error: any) {
    return handleApiError(error, { route: '/api/feedback/campaigns', method: req.method });
  }
}
