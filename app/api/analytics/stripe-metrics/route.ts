/**
 * API Route: Stripe Metrics
 * Fetches real-time subscription and revenue metrics from Stripe
 */

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface SubscriptionMetrics {
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  canceledSubscriptions: number;
  churnRate: number;
  subscriptionsByTier: {
    pro: number;
    enterprise: number;
  };
  revenueByTier: {
    pro: number;
    enterprise: number;
  };
  mrrGrowth: number;
  newMRR: number;
  churnedMRR: number;
  expansionMRR: number;
}

export async function GET() {
  try {
    // Fetch all active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      status: 'all',
    });

    // Calculate date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Current period metrics
    let activeCount = 0;
    let trialingCount = 0;
    let canceledCount = 0;
    let totalMRR = 0;
    let proCount = 0;
    let enterpriseCount = 0;
    let proRevenue = 0;
    let enterpriseRevenue = 0;
    let currentPeriodMRR = 0;
    let newMRR = 0;
    let churnedMRR = 0;
    let expansionMRR = 0;

    // Previous period metrics (for growth calculation)
    let previousPeriodMRR = 0;

    subscriptions.data.forEach((sub) => {
      const priceId = sub.items.data[0]?.price?.id;
      const amount = sub.items.data[0]?.price?.unit_amount || 0;
      const interval = sub.items.data[0]?.price?.recurring?.interval;

      // Convert to MRR (monthly recurring revenue)
      let mrr = 0;
      if (interval === 'month') {
        mrr = amount / 100; // Convert cents to dollars
      } else if (interval === 'year') {
        mrr = (amount / 100) / 12; // Annual to monthly
      }

      // Categorize by tier
      const isPro = priceId?.includes('pro') || priceId === process.env.STRIPE_PRO_PRICE_ID;
      const isEnterprise = priceId?.includes('enterprise') || priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID;

      // Current status
      if (sub.status === 'active') {
        activeCount++;
        totalMRR += mrr;
        currentPeriodMRR += mrr;

        if (isPro) {
          proCount++;
          proRevenue += mrr;
        } else if (isEnterprise) {
          enterpriseCount++;
          enterpriseRevenue += mrr;
        }

        // Check if created in last 30 days (new MRR)
        const createdDate = new Date(sub.created * 1000);
        if (createdDate >= thirtyDaysAgo) {
          newMRR += mrr;
        }
      } else if (sub.status === 'trialing') {
        trialingCount++;
      } else if (sub.status === 'canceled' || sub.status === 'unpaid') {
        canceledCount++;

        // Check if canceled in last 30 days (churned MRR)
        const canceledDate = sub.canceled_at ? new Date(sub.canceled_at * 1000) : null;
        if (canceledDate && canceledDate >= thirtyDaysAgo) {
          churnedMRR += mrr;
        }
      }

      // Calculate previous period MRR (30-60 days ago)
      const createdDate = new Date(sub.created * 1000);
      const canceledDate = sub.canceled_at ? new Date(sub.canceled_at * 1000) : null;

      const wasActiveInPreviousPeriod =
        createdDate < thirtyDaysAgo &&
        (!canceledDate || canceledDate > thirtyDaysAgo);

      if (wasActiveInPreviousPeriod && (sub.status === 'active' || sub.status === 'canceled')) {
        previousPeriodMRR += mrr;
      }
    });

    // Calculate churn rate: (canceled in last 30 days / active at start of period) * 100
    const totalAtStartOfPeriod = activeCount + canceledCount;
    const churnRate = totalAtStartOfPeriod > 0
      ? (canceledCount / totalAtStartOfPeriod) * 100
      : 0;

    // Calculate MRR growth: ((current - previous) / previous) * 100
    const mrrGrowth = previousPeriodMRR > 0
      ? ((currentPeriodMRR - previousPeriodMRR) / previousPeriodMRR) * 100
      : 0;

    // Calculate expansion MRR (upgrades, add-ons)
    // For now, we'll approximate it as: newMRR - churnedMRR - growth
    expansionMRR = Math.max(0, currentPeriodMRR - previousPeriodMRR - newMRR + churnedMRR);

    const metrics: SubscriptionMetrics = {
      mrr: Math.round(totalMRR * 100) / 100,
      arr: Math.round(totalMRR * 12 * 100) / 100,
      activeSubscriptions: activeCount,
      trialingSubscriptions: trialingCount,
      canceledSubscriptions: canceledCount,
      churnRate: Math.round(churnRate * 100) / 100,
      subscriptionsByTier: {
        pro: proCount,
        enterprise: enterpriseCount,
      },
      revenueByTier: {
        pro: Math.round(proRevenue * 100) / 100,
        enterprise: Math.round(enterpriseRevenue * 100) / 100,
      },
      mrrGrowth: Math.round(mrrGrowth * 100) / 100,
      newMRR: Math.round(newMRR * 100) / 100,
      churnedMRR: Math.round(churnedMRR * 100) / 100,
      expansionMRR: Math.round(expansionMRR * 100) / 100,
    };

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching Stripe metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch Stripe metrics',
      },
      { status: 500 }
    );
  }
}
