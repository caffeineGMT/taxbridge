/**
 * API Route: Daily Revenue Metrics
 * Fetches daily revenue from Stripe for the last 90 days
 * Used for revenue trend visualization
 */

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { handleApiError } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

interface DailyRevenue {
  date: string;
  revenue: number;
  transactions: number;
  newCustomers: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90');

    // Calculate date range
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const startTimestamp = Math.floor(startDate.getTime() / 1000);

    // Fetch all charges from Stripe
    const charges = await stripe.charges.list({
      limit: 100,
      created: {
        gte: startTimestamp,
      },
    });

    // Fetch all subscriptions created in this period
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      created: {
        gte: startTimestamp,
      },
    });

    // Group revenue by day
    const revenueByDay = new Map<string, DailyRevenue>();

    // Initialize all days in range with zero values
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      revenueByDay.set(dateKey, {
        date: dateKey,
        revenue: 0,
        transactions: 0,
        newCustomers: 0,
      });
    }

    // Process charges
    charges.data.forEach((charge) => {
      if (charge.status === 'succeeded' && charge.amount > 0) {
        const chargeDate = new Date(charge.created * 1000);
        const dateKey = chargeDate.toISOString().split('T')[0];

        const dayData = revenueByDay.get(dateKey);
        if (dayData) {
          dayData.revenue += charge.amount / 100; // Convert cents to dollars
          dayData.transactions += 1;
        }
      }
    });

    // Process subscriptions (count new customers)
    subscriptions.data.forEach((sub) => {
      const subDate = new Date(sub.created * 1000);
      const dateKey = subDate.toISOString().split('T')[0];

      const dayData = revenueByDay.get(dateKey);
      if (dayData && sub.status !== 'canceled') {
        dayData.newCustomers += 1;
      }
    });

    // Convert map to array and sort by date
    const dailyRevenueArray = Array.from(revenueByDay.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate cumulative metrics
    let cumulativeRevenue = 0;
    let cumulativeCustomers = 0;

    const dailyRevenueWithCumulatives = dailyRevenueArray.map((day) => {
      cumulativeRevenue += day.revenue;
      cumulativeCustomers += day.newCustomers;

      return {
        ...day,
        cumulativeRevenue: Math.round(cumulativeRevenue * 100) / 100,
        cumulativeCustomers,
      };
    });

    // Calculate summary metrics
    const totalRevenue = dailyRevenueWithCumulatives.reduce((sum, day) => sum + day.revenue, 0);
    const totalTransactions = dailyRevenueWithCumulatives.reduce((sum, day) => sum + day.transactions, 0);
    const totalNewCustomers = dailyRevenueWithCumulatives.reduce((sum, day) => sum + day.newCustomers, 0);
    const avgDailyRevenue = totalRevenue / days;

    // Calculate growth rate (comparing first 30 days to last 30 days)
    const firstHalfRevenue = dailyRevenueWithCumulatives
      .slice(0, Math.floor(days / 2))
      .reduce((sum, day) => sum + day.revenue, 0);
    const secondHalfRevenue = dailyRevenueWithCumulatives
      .slice(Math.floor(days / 2))
      .reduce((sum, day) => sum + day.revenue, 0);
    const growthRate = firstHalfRevenue > 0
      ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        dailyRevenue: dailyRevenueWithCumulatives,
        summary: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalTransactions,
          totalNewCustomers,
          avgDailyRevenue: Math.round(avgDailyRevenue * 100) / 100,
          growthRate: Math.round(growthRate * 100) / 100,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    // console.error('Error fetching daily revenue:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch daily revenue',
      },
      { status: 500 }
    );
  }
}
