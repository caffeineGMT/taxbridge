/**
 * Daily Revenue Metrics Tracker
 *
 * Fetches and caches daily revenue metrics for trend analysis
 * Run this daily via cron to build historical revenue data
 *
 * Usage:
 * - Daily cron: 0 0 * * * npm run revenue:track
 * - Manual: npm run revenue:track
 */

import { stripe } from '@/lib/stripe';
import { getDatabase } from '@/lib/db';
import { logger } from '@/lib/logger';
import fs from 'fs';
import path from 'path';

interface DailyRevenueSnapshot {
  date: string;
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  totalCustomers: number;
  churnRate: number;
  newCustomersToday: number;
  churnedCustomersToday: number;
  revenueByTier: {
    pro: number;
    enterprise: number;
  };
  revenueByChannel: {
    organic: number;
    productHunt: number;
    paidAds: number;
    referral: number;
    direct: number;
  };
}

async function trackDailyRevenue() {
  try {
    logger.info('Starting daily revenue tracking...');

    const db = getDatabase();
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD

    const startOfToday = new Date(today.setHours(0, 0, 0, 0)).getTime();
    const endOfToday = new Date(today.setHours(23, 59, 59, 999)).getTime();

    // Fetch all subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      status: 'all',
      limit: 100,
    });

    logger.info(`Fetched ${subscriptions.data.length} subscriptions from Stripe`);

    // Calculate metrics
    let mrr = 0;
    let activeCount = 0;
    let proRevenue = 0;
    let enterpriseRevenue = 0;
    let newToday = 0;
    let churnedToday = 0;

    subscriptions.data.forEach((sub) => {
      const amount = sub.items.data[0]?.price?.unit_amount || 0;
      const interval = sub.items.data[0]?.price?.recurring?.interval;
      const priceId = sub.items.data[0]?.price?.id;

      // Convert to MRR
      let monthlyRevenue = 0;
      if (interval === 'month') {
        monthlyRevenue = amount / 100;
      } else if (interval === 'year') {
        monthlyRevenue = amount / 100 / 12;
      }

      const createdDate = new Date(sub.created * 1000).getTime();
      const canceledDate = sub.canceled_at ? new Date(sub.canceled_at * 1000).getTime() : null;

      if (sub.status === 'active') {
        activeCount++;
        mrr += monthlyRevenue;

        // Categorize by tier
        const isPro =
          priceId?.includes('pro') ||
          priceId?.includes('basic') ||
          priceId === process.env.STRIPE_PRO_PRICE_ID;
        const isEnterprise =
          priceId?.includes('enterprise') || priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID;

        if (isPro) {
          proRevenue += monthlyRevenue;
        } else if (isEnterprise) {
          enterpriseRevenue += monthlyRevenue;
        }

        // New today
        if (createdDate >= startOfToday && createdDate <= endOfToday) {
          newToday++;
        }
      }

      // Churned today
      if (
        (sub.status === 'canceled' || sub.status === 'unpaid') &&
        canceledDate &&
        canceledDate >= startOfToday &&
        canceledDate <= endOfToday
      ) {
        churnedToday++;
      }
    });

    // Get total customers
    const customers = await stripe.customers.list({ limit: 1 });
    const totalCustomers = customers.has_more ? activeCount : customers.data.length;

    // Calculate churn rate (monthly)
    const totalAtStartOfMonth = activeCount + churnedToday;
    const churnRate = totalAtStartOfMonth > 0 ? (churnedToday / totalAtStartOfMonth) * 100 : 0;

    // Get channel attribution from database
    const channelQuery = (db as any).prepare(`
      SELECT
        COALESCE(
          CASE
            WHEN ae.metadata LIKE '%"source":"product_hunt"%' OR ae.metadata LIKE '%"utm_source":"producthunt"%' THEN 'productHunt'
            WHEN ae.metadata LIKE '%"source":"google"%' OR ae.metadata LIKE '%"utm_source":"google"%' THEN 'paidAds'
            WHEN ae.metadata LIKE '%"source":"referral"%' OR ae.metadata LIKE '%"utm_source":"referral"%' THEN 'referral'
            WHEN ae.metadata LIKE '%"source":"organic"%' OR ae.metadata LIKE '%"utm_medium":"organic"%' THEN 'organic'
            ELSE 'direct'
          END,
          'direct'
        ) as channel,
        COUNT(DISTINCT up.id) as customer_count,
        up.subscription_tier
      FROM user_profiles up
      LEFT JOIN analytics_events ae ON ae.user_id = up.id AND ae.event_name = 'user_signed_up'
      WHERE up.subscription_tier IN ('pro', 'enterprise')
        AND up.subscription_status = 'active'
      GROUP BY channel, up.subscription_tier
    `);

    const channelResults = channelQuery.all() as Array<{
      channel: string;
      customer_count: number;
      subscription_tier: string;
    }>;

    const revenueByChannel: Record<string, number> = {
      organic: 0,
      productHunt: 0,
      paidAds: 0,
      referral: 0,
      direct: 0,
    };

    const tierRevenue = {
      pro: 49 / 12, // $49/year = $4.08/month
      enterprise: 299 / 12, // $299/year = $24.92/month
    };

    channelResults.forEach((row) => {
      const channel = row.channel as keyof typeof revenueByChannel;
      const revenue =
        row.subscription_tier === 'pro'
          ? tierRevenue.pro * row.customer_count
          : tierRevenue.enterprise * row.customer_count;

      revenueByChannel[channel] = (revenueByChannel[channel] || 0) + revenue;
    });

    // Create snapshot
    const snapshot: DailyRevenueSnapshot = {
      date: dateString,
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(mrr * 12 * 100) / 100,
      activeSubscriptions: activeCount,
      totalCustomers,
      churnRate: Math.round(churnRate * 100) / 100,
      newCustomersToday: newToday,
      churnedCustomersToday: churnedToday,
      revenueByTier: {
        pro: Math.round(proRevenue * 100) / 100,
        enterprise: Math.round(enterpriseRevenue * 100) / 100,
      },
      revenueByChannel: {
        organic: Math.round(revenueByChannel.organic * 100) / 100,
        productHunt: Math.round(revenueByChannel.productHunt * 100) / 100,
        paidAds: Math.round(revenueByChannel.paidAds * 100) / 100,
        referral: Math.round(revenueByChannel.referral * 100) / 100,
        direct: Math.round(revenueByChannel.direct * 100) / 100,
      },
    };

    // Save to file system for historical tracking
    const dataDir = path.join(process.cwd(), 'data', 'revenue');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, `${dateString}.json`);
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));

    // Also append to a master CSV for easy analysis
    const csvPath = path.join(dataDir, 'revenue-history.csv');
    const csvExists = fs.existsSync(csvPath);

    const csvLine = [
      dateString,
      snapshot.mrr,
      snapshot.arr,
      snapshot.activeSubscriptions,
      snapshot.totalCustomers,
      snapshot.churnRate,
      snapshot.newCustomersToday,
      snapshot.churnedCustomersToday,
      snapshot.revenueByTier.pro,
      snapshot.revenueByTier.enterprise,
      snapshot.revenueByChannel.organic,
      snapshot.revenueByChannel.productHunt,
      snapshot.revenueByChannel.paidAds,
      snapshot.revenueByChannel.referral,
      snapshot.revenueByChannel.direct,
    ].join(',');

    if (!csvExists) {
      // Write header
      const header = [
        'date',
        'mrr',
        'arr',
        'active_subscriptions',
        'total_customers',
        'churn_rate',
        'new_customers',
        'churned_customers',
        'revenue_pro',
        'revenue_enterprise',
        'revenue_organic',
        'revenue_product_hunt',
        'revenue_paid_ads',
        'revenue_referral',
        'revenue_direct',
      ].join(',');
      fs.writeFileSync(csvPath, header + '\n' + csvLine + '\n');
    } else {
      fs.appendFileSync(csvPath, csvLine + '\n');
    }

    logger.info('Daily revenue tracking complete', {
      date: dateString,
      mrr: snapshot.mrr,
      arr: snapshot.arr,
      activeSubscriptions: snapshot.activeSubscriptions,
      newCustomers: snapshot.newCustomersToday,
    });

    console.log('\n✅ Revenue tracking successful!');
    console.log(`📊 MRR: $${snapshot.mrr.toFixed(2)}`);
    console.log(`📈 ARR: $${snapshot.arr.toFixed(2)}`);
    console.log(`👥 Active Subscriptions: ${snapshot.activeSubscriptions}`);
    console.log(`🆕 New Customers Today: ${snapshot.newCustomersToday}`);
    console.log(`📉 Churn Rate: ${snapshot.churnRate.toFixed(2)}%`);
    console.log(`\n💾 Saved to: ${filePath}\n`);

    process.exit(0);
  } catch (error) {
    logger.error('Error tracking daily revenue', { error });
    console.error('❌ Error tracking revenue:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  trackDailyRevenue();
}

export { trackDailyRevenue };
