/**
 * Product Hunt Launch Metrics API
 *
 * Serves real-time Product Hunt metrics to the launch dashboard.
 * Endpoint: GET /api/product-hunt
 */

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { createProductHuntClient } from '@/lib/product-hunt/client';

export const dynamic = 'force-dynamic';

interface LaunchMetrics {
  timestamp: string;
  hour: number;
  ranking: number;
  upvotes: number;
  comments: number;
  websiteClicks: number;
  velocity: number;
  projectedFinalUpvotes: number;
  estimatedFinalRanking: number;
  actions: string[];
  alerts: string[];
}

interface LaunchData {
  productId: string;
  productSlug: string;
  launchDate: string;
  targetUpvotes: number;
  targetRanking: number;
  metrics: LaunchMetrics[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';

    // Path to stored metrics
    const dataPath = path.join(process.cwd(), 'data', 'launch-metrics.json');

    // Try to load existing data
    let launchData: LaunchData | null = null;

    try {
      const data = await fs.readFile(dataPath, 'utf-8');
      launchData = JSON.parse(data);
    } catch (error) {
      // No data yet - return empty state
      return NextResponse.json({
        status: 'not_launched',
        message: 'No launch data found. Run `npm run launch:monitor` to start tracking.',
        data: null,
      });
    }

    // If refresh requested, fetch latest data
    if (refresh && launchData?.productId) {
      const client = createProductHuntClient();

      try {
        const metrics = await client.getProductMetrics(launchData.productId);
        const todayProducts = await client.getTodayProducts();

        if (metrics) {
          const velocity = client.calculateVelocity(metrics);
          const projection = client.estimateFinalRanking(metrics, todayProducts);

          const newMetrics: LaunchMetrics = {
            timestamp: new Date().toISOString(),
            hour: metrics.hoursSinceLaunch,
            ranking: metrics.ranking,
            upvotes: metrics.upvotes,
            comments: metrics.comments,
            websiteClicks: metrics.websiteClicks,
            velocity,
            projectedFinalUpvotes: projection.projectedUpvotes,
            estimatedFinalRanking: projection.estimated,
            actions: [],
            alerts: [],
          };

          // Update launch data
          launchData.metrics.push(newMetrics);
          await fs.writeFile(dataPath, JSON.stringify(launchData, null, 2));
        }
      } catch (error) {
        console.error('Error fetching fresh metrics:', error);
        // Continue with existing data
      }
    }

    // Calculate summary statistics
    const latestMetrics = launchData.metrics[launchData.metrics.length - 1];
    const hoursSinceLaunch = latestMetrics?.hour || 0;
    const hoursRemaining = Math.max(0, 24 - hoursSinceLaunch);

    const summary = {
      currentRanking: latestMetrics?.ranking || 0,
      currentUpvotes: latestMetrics?.upvotes || 0,
      currentComments: latestMetrics?.comments || 0,
      currentVelocity: latestMetrics?.velocity || 0,
      projectedFinalUpvotes: latestMetrics?.projectedFinalUpvotes || 0,
      estimatedFinalRanking: latestMetrics?.estimatedFinalRanking || 0,
      targetUpvotes: launchData.targetUpvotes,
      targetRanking: launchData.targetRanking,
      hoursSinceLaunch,
      hoursRemaining,
      isOnTrack: (latestMetrics?.ranking || 999) <= launchData.targetRanking,
      upvotesGap: launchData.targetUpvotes - (latestMetrics?.upvotes || 0),
    };

    // Get velocity trend (last 3 hours)
    const recentMetrics = launchData.metrics.slice(-3);
    const velocityTrend = recentMetrics.length >= 2
      ? recentMetrics[recentMetrics.length - 1].velocity - recentMetrics[0].velocity
      : 0;

    return NextResponse.json({
      status: 'launched',
      launchDate: launchData.launchDate,
      productSlug: launchData.productSlug,
      summary,
      velocityTrend,
      metrics: launchData.metrics,
      latestMetrics,
      alerts: latestMetrics?.alerts || [],
      actions: latestMetrics?.actions || [],
    });

  } catch (error) {
    console.error('Error in Product Hunt API:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        data: null,
      },
      { status: 500 }
    );
  }
}
