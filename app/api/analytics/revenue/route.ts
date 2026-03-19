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

export const dynamic = 'force-dynamic';

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

        return total + (amount * item.quantity);
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
    const activeAtStartOfMonth = Array.isArray(db.prepare(`
      SELECT COUNT(*) as count FROM user_profiles
      WHERE subscription_status = 'active'
      AND created_at < ?
    `).all([firstDayOfMonth.getTime()]))
      ? (db.prepare(`
          SELECT COUNT(*) as count FROM user_profiles
          WHERE subscription_status = 'active'
          AND created_at < ?
        `).all([firstDayOfMonth.getTime()]) as Array<{ count: number }>)[0]?.count || 0
      : 0;

    const churnedThisMonth = Array.isArray(db.prepare(`
      SELECT COUNT(*) as count FROM user_profiles
      WHERE subscription_status = 'canceled'
      AND updated_at >= ?
    `).all([firstDayOfMonth.getTime()]))
      ? (db.prepare(`
          SELECT COUNT(*) as count FROM user_profiles
          WHERE subscription_status = 'canceled'
          AND updated_at >= ?
        `).all([firstDayOfMonth.getTime()]) as Array<{ count: number }>)[0]?.count || 0
      : 0;

    const churnRate = activeAtStartOfMonth > 0
      ? (churnedThisMonth / activeAtStartOfMonth) * 100
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
