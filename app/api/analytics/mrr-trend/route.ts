/**
 * API Route: MRR Trend
 * Calculates historical MRR for the last 90 days
 * Shows MRR growth/decline over time
 */

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

interface MRRDataPoint {
  date: string;
  mrr: number;
  activeSubscriptions: number;
  newMRR: number;
  churnedMRR: number;
  expansionMRR: number;
  netMRRGrowth: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90');

    // Calculate date range
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const startTimestamp = Math.floor(startDate.getTime() / 1000);

    // Fetch all subscriptions (including canceled ones)
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      status: 'all',
    });

    // Initialize MRR tracking by day
    const mrrByDay = new Map<string, MRRDataPoint>();

    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      mrrByDay.set(dateKey, {
        date: dateKey,
        mrr: 0,
        activeSubscriptions: 0,
        newMRR: 0,
        churnedMRR: 0,
        expansionMRR: 0,
        netMRRGrowth: 0,
      });
    }

    // Process each subscription
    subscriptions.data.forEach((sub) => {
      const priceAmount = sub.items.data[0]?.price?.unit_amount || 0;
      const interval = sub.items.data[0]?.price?.recurring?.interval;

      // Calculate MRR
      let mrr = 0;
      if (interval === 'month') {
        mrr = priceAmount / 100;
      } else if (interval === 'year') {
        mrr = (priceAmount / 100) / 12;
      }

      const createdDate = new Date(sub.created * 1000);
      const canceledDate = sub.canceled_at ? new Date(sub.canceled_at * 1000) : null;

      // For each day, check if this subscription was active
      Array.from(mrrByDay.keys()).forEach((dateKey) => {
        const checkDate = new Date(dateKey);

        // Was this subscription active on this date?
        const wasActive =
          createdDate <= checkDate &&
          (!canceledDate || canceledDate > checkDate);

        if (wasActive) {
          const dayData = mrrByDay.get(dateKey)!;
          dayData.mrr += mrr;
          dayData.activeSubscriptions += 1;

          // Check if it was a new subscription on this date
          const sameDay = createdDate.toISOString().split('T')[0] === dateKey;
          if (sameDay) {
            dayData.newMRR += mrr;
          }

          // Check if it was canceled on this date
          if (canceledDate) {
            const canceledSameDay = canceledDate.toISOString().split('T')[0] === dateKey;
            if (canceledSameDay) {
              dayData.churnedMRR += mrr;
            }
          }
        }
      });
    });

    // Convert to array and sort by date
    const mrrTrendArray = Array.from(mrrByDay.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate net MRR growth and round values
    const mrrTrendWithGrowth = mrrTrendArray.map((day, index) => {
      const previousDay = index > 0 ? mrrTrendArray[index - 1] : null;
      const netMRRGrowth = previousDay
        ? day.mrr - previousDay.mrr
        : 0;

      return {
        ...day,
        mrr: Math.round(day.mrr * 100) / 100,
        newMRR: Math.round(day.newMRR * 100) / 100,
        churnedMRR: Math.round(day.churnedMRR * 100) / 100,
        expansionMRR: Math.round(day.expansionMRR * 100) / 100,
        netMRRGrowth: Math.round(netMRRGrowth * 100) / 100,
      };
    });

    // Calculate summary metrics
    const latestMRR = mrrTrendWithGrowth[mrrTrendWithGrowth.length - 1]?.mrr || 0;
    const earliestMRR = mrrTrendWithGrowth[0]?.mrr || 0;
    const mrrGrowth = earliestMRR > 0
      ? ((latestMRR - earliestMRR) / earliestMRR) * 100
      : 0;

    const totalNewMRR = mrrTrendWithGrowth.reduce((sum, day) => sum + day.newMRR, 0);
    const totalChurnedMRR = mrrTrendWithGrowth.reduce((sum, day) => sum + day.churnedMRR, 0);
    const netMRRChange = latestMRR - earliestMRR;

    return NextResponse.json({
      success: true,
      data: {
        mrrTrend: mrrTrendWithGrowth,
        summary: {
          currentMRR: latestMRR,
          startingMRR: earliestMRR,
          mrrGrowth: Math.round(mrrGrowth * 100) / 100,
          netMRRChange: Math.round(netMRRChange * 100) / 100,
          totalNewMRR: Math.round(totalNewMRR * 100) / 100,
          totalChurnedMRR: Math.round(totalChurnedMRR * 100) / 100,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching MRR trend:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch MRR trend',
      },
      { status: 500 }
    );
  }
}
