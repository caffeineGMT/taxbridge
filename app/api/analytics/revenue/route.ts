/**
 * Revenue Analytics API
 * Fetches real-time Stripe metrics for CEO dashboard:
 * - MRR (Monthly Recurring Revenue)
 * - ARR (Annual Recurring Revenue)
 * - Customer count
 * - Churn rate
 * - Revenue growth
 * - Active subscriptions by tier
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getDatabase } from '@/lib/db';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';
import type { Database } from 'better-sqlite3';

export const dynamic = 'force-dynamic';

/**
 * Extract channel from signup event metadata
 */
function getChannelFromMetadata(metadata: string | null): string {
  if (!metadata) return 'direct';

  try {
    const parsed = JSON.parse(metadata);

    // Check for explicit source
    if (parsed.source === 'product_hunt' || parsed.source === 'producthunt') return 'productHunt';
    if (parsed.source === 'organic' || parsed.utm_source === 'organic') return 'organic';
    if (parsed.source === 'google' || parsed.utm_source === 'google') return 'paidAds';
    if (parsed.source === 'referral' || parsed.utm_source === 'referral') return 'referral';

    // Check UTM parameters
    if (parsed.utm_source === 'product-hunt' || parsed.utm_source === 'producthunt') return 'productHunt';
    if (parsed.utm_source === 'google-ads' || parsed.utm_campaign?.includes('google')) return 'paidAds';
    if (parsed.utm_medium === 'organic' || parsed.utm_medium === 'seo') return 'organic';

    // Check referrer
    if (parsed.referrer?.includes('producthunt.com')) return 'productHunt';
    if (parsed.referrer?.includes('google.com')) return 'organic';

    return 'direct';
  } catch {
    return 'direct';
  }
}

/**
 * Get channel attribution for paid customers
 */
function getChannelAttribution(
  db: any,
  avgRevenuePerCustomer: number
): {
  revenueByChannel: Record<string, number>;
  customersByChannel: Record<string, number>;
} {
  try {
    // Query signup events for paid users to determine acquisition channel
    const channelQuery = (db as Database).prepare(`
      SELECT
        up.id,
        up.subscription_tier,
        ae.metadata
      FROM user_profiles up
      LEFT JOIN analytics_events ae ON ae.user_id = up.id AND ae.event_name = 'user_signed_up'
      WHERE up.subscription_tier IN ('pro', 'enterprise')
        AND up.subscription_status = 'active'
    `);

    const results = channelQuery.all() as Array<{
      id: number;
      subscription_tier: string;
      metadata: string | null;
    }>;

    const revenueByChannel: Record<string, number> = {
      organic: 0,
      productHunt: 0,
      paidAds: 0,
      referral: 0,
      direct: 0,
    };

    const customersByChannel: Record<string, number> = {
      organic: 0,
      productHunt: 0,
      paidAds: 0,
      referral: 0,
      direct: 0,
    };

    results.forEach((row) => {
      const channel = getChannelFromMetadata(row.metadata);

      // Add customer to channel count
      customersByChannel[channel] = (customersByChannel[channel] || 0) + 1;

      // Add revenue based on tier (simplified - using average)
      // Pro tier: ~$49/year = $4.08/month
      // Enterprise tier: ~$299/year = $24.92/month
      const tierRevenue = row.subscription_tier === 'enterprise' ? 24.92 : 4.08;
      revenueByChannel[channel] = (revenueByChannel[channel] || 0) + tierRevenue;
    });

    return {
      revenueByChannel: {
        organic: Math.round(revenueByChannel.organic * 100) / 100,
        productHunt: Math.round(revenueByChannel.productHunt * 100) / 100,
        paidAds: Math.round(revenueByChannel.paidAds * 100) / 100,
        referral: Math.round(revenueByChannel.referral * 100) / 100,
        direct: Math.round(revenueByChannel.direct * 100) / 100,
      },
      customersByChannel,
    };
  } catch (error) {
    logger.error('Error fetching channel attribution', { error });
    return {
      revenueByChannel: { organic: 0, productHunt: 0, paidAds: 0, referral: 0, direct: 0 },
      customersByChannel: { organic: 0, productHunt: 0, paidAds: 0, referral: 0, direct: 0 },
    };
  }
}

interface RevenueMetrics {
  mrr: number;
  arr: number;
  totalCustomers: number;
  activeSubscriptions: number;
  churnRate: number;
  growthRate: number;
  subscriptionsByTier: {
    pro: number;
    enterprise: number;
  };
  revenueByTier: {
    pro: number;
    enterprise: number;
  };
  newCustomersThisMonth: number;
  churnedCustomersThisMonth: number;
  lifetimeValue: number;
  customerAcquisitionCost: number;
  ltvcacRatio: number;
  revenueByChannel: {
    organic: number;
    productHunt: number;
    paidAds: number;
    referral: number;
    direct: number;
  };
  customersByChannel: {
    organic: number;
    productHunt: number;
    paidAds: number;
    referral: number;
    direct: number;
  };
}

export async function GET(req: NextRequest) {
  // Rate limiting for admin endpoints
  const rateLimitResult = await rateLimit(req, RateLimitPresets.STRICT);
  if (rateLimitResult) return rateLimitResult;

  try {
    const db = getDatabase();
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
    });

    // Calculate MRR from active subscriptions
    let mrr = 0;
    let subscriptionsByTier = { pro: 0, enterprise: 0 };
    let revenueByTier = { pro: 0, enterprise: 0 };

    for (const sub of subscriptions.data) {
      const monthlyAmount = sub.items.data.reduce((total, item) => {
        const price = item.price;
        let amount = price.unit_amount || 0;

        // Convert annual to monthly
        if (price.recurring?.interval === 'year') {
          amount = amount / 12;
        }

        return total + (amount * (item.quantity || 1));
      }, 0) / 100; // Convert cents to dollars

      mrr += monthlyAmount;

      // Categorize by tier (check price ID or metadata)
      const tier = sub.metadata?.tier || 'pro';
      if (tier === 'pro') {
        subscriptionsByTier.pro++;
        revenueByTier.pro += monthlyAmount;
      } else if (tier === 'enterprise') {
        subscriptionsByTier.enterprise++;
        revenueByTier.enterprise += monthlyAmount;
      }
    }

    const arr = mrr * 12;
    const activeSubscriptions = subscriptions.data.length;

    // Get total customer count from Stripe
    const customers = await stripe.customers.list({ limit: 1 });
    const totalCustomers = customers.has_more ? 100 : customers.data.length;

    // Calculate churn rate from database (churned this month / active at start of month)
    const activeAtStartOfMonthResult = (db as any).prepare(`
      SELECT COUNT(*) as count FROM user_profiles
      WHERE subscription_status = 'active'
      AND created_at < ?
    `).get(firstDayOfMonth.getTime()) as { count: number } | undefined;
    const activeAtStartOfMonth = activeAtStartOfMonthResult?.count || 0;

    const churnedThisMonthResult = (db as any).prepare(`
      SELECT COUNT(*) as count FROM user_profiles
      WHERE subscription_status = 'canceled'
      AND updated_at >= ?
    `).get(firstDayOfMonth.getTime()) as { count: number } | undefined;
    const churnedCustomersThisMonth = churnedThisMonthResult?.count || 0;

    const churnRate = activeAtStartOfMonth > 0
      ? (churnedCustomersThisMonth / activeAtStartOfMonth) * 100
      : 0;

    // Calculate new customers this month
    const newCustomersThisMonth = Array.isArray(db.prepare(`
      SELECT COUNT(*) as count FROM user_profiles
      WHERE subscription_status = 'active'
      AND created_at >= ?
    `).all([firstDayOfMonth.getTime()]))
      ? (db.prepare(`
          SELECT COUNT(*) as count FROM user_profiles
          WHERE subscription_status = 'active'
          AND created_at >= ?
        `).all([firstDayOfMonth.getTime()]) as Array<{ count: number }>)[0]?.count || 0
      : 0;

    // Calculate MRR growth rate (this month vs last month)
    // For simplicity, using active subscription count as proxy
    const activeLastMonth = Array.isArray(db.prepare(`
      SELECT COUNT(*) as count FROM user_profiles
      WHERE subscription_status = 'active'
      AND created_at < ?
    `).all([firstDayOfLastMonth.getTime()]))
      ? (db.prepare(`
          SELECT COUNT(*) as count FROM user_profiles
          WHERE subscription_status = 'active'
          AND created_at < ?
        `).all([firstDayOfLastMonth.getTime()]) as Array<{ count: number }>)[0]?.count || 0
      : 0;

    const growthRate = activeLastMonth > 0
      ? ((activeSubscriptions - activeLastMonth) / activeLastMonth) * 100
      : 0;

    // Calculate LTV (simplified: average revenue per user * average customer lifetime)
    // Average customer lifetime = 1 / churn rate (in months)
    const avgMonthlyRevenuePerUser = activeSubscriptions > 0 ? mrr / activeSubscriptions : 0;
    const avgCustomerLifetimeMonths = churnRate > 0 ? 1 / (churnRate / 100) : 12; // Default 12 months if no churn
    const lifetimeValue = avgMonthlyRevenuePerUser * avgCustomerLifetimeMonths;

    // Calculate CAC (Customer Acquisition Cost)
    // For now, using a placeholder - this should be pulled from marketing spend data
    // Typical SaaS CAC is $100-500
    const marketingSpendThisMonth = 500; // TODO: Pull from actual marketing data
    const customerAcquisitionCost = newCustomersThisMonth > 0
      ? marketingSpendThisMonth / newCustomersThisMonth
      : 0;

    // Calculate LTV:CAC ratio (should be > 3 for healthy SaaS)
    const ltvcacRatio = customerAcquisitionCost > 0 ? lifetimeValue / customerAcquisitionCost : 0;

    // Get channel attribution data
    const channelAttribution = getChannelAttribution(db, avgMonthlyRevenuePerUser);

    const metrics: RevenueMetrics = {
      mrr,
      arr,
      totalCustomers,
      activeSubscriptions,
      churnRate,
      growthRate,
      subscriptionsByTier,
      revenueByTier,
      newCustomersThisMonth,
      churnedCustomersThisMonth,
      lifetimeValue,
      customerAcquisitionCost,
      ltvcacRatio,
      revenueByChannel: channelAttribution.revenueByChannel,
      customersByChannel: channelAttribution.customersByChannel,
    };

    logger.info('Revenue metrics fetched', {
      endpoint: '/api/analytics/revenue',
      mrr,
      arr,
      activeSubscriptions,
    });

    return NextResponse.json(metrics);

  } catch (error) {
    logger.error('Error fetching revenue metrics', {
      endpoint: '/api/analytics/revenue',
      error: error instanceof Error ? error : new Error(String(error)),
    });

    Sentry.captureException(error, {
      tags: { route: '/api/analytics/revenue', level: 'error' },
    });

    return NextResponse.json(
      { error: 'Failed to fetch revenue metrics' },
      { status: 500 }
    );
  }
}
