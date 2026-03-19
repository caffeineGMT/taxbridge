import { NextResponse } from 'next/server';
import {
  getChannelPerformance,
  getTopChannelsByRevenue,
  getUnderperformingChannels,
  getAttributionSummary,
  getAdSpendByChannel,
} from '@/lib/analytics/attribution';

/**
 * GET /api/analytics/attribution
 *
 * Returns comprehensive attribution data for the dashboard:
 * - Overall metrics (users, conversions, revenue, ROI)
 * - Channel performance breakdown
 * - Top performing channels
 * - Underperforming channels (for optimization)
 * - Ad spend by channel
 *
 * Query params:
 * - days: Number of days to look back (default: 30)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    // Validate days parameter
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Invalid days parameter. Must be between 1 and 365.' },
        { status: 400 }
      );
    }

    // Fetch all attribution data in parallel
    const [
      summary,
      channelPerformance,
      topChannels,
      underperformingChannels,
      adSpend,
    ] = await Promise.all([
      Promise.resolve(getAttributionSummary(days)),
      Promise.resolve(getChannelPerformance(days)),
      Promise.resolve(getTopChannelsByRevenue(10)),
      Promise.resolve(getUnderperformingChannels(10, 5.0)),
      Promise.resolve(getAdSpendByChannel(days)),
    ]);

    return NextResponse.json({
      success: true,
      period: {
        days,
        start_date: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
      },
      summary,
      channels: channelPerformance,
      top_channels: topChannels,
      underperforming_channels: underperformingChannels,
      ad_spend: adSpend,
    });
  } catch (error) {
    console.error('Attribution API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch attribution data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
