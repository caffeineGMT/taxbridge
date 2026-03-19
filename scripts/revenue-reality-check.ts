#!/usr/bin/env tsx
/**
 * Revenue Reality Check - Pull Actual MRR and Paid User Count from Stripe
 *
 * This script connects to the Stripe API and pulls REAL revenue numbers:
 * - Total paid customers (lifetime)
 * - Active subscriptions
 * - Monthly Recurring Revenue (MRR)
 * - Annual Recurring Revenue (ARR)
 * - Revenue by plan type
 * - Subscription status breakdown
 * - Recent payment activity
 *
 * Usage:
 *   tsx scripts/revenue-reality-check.ts
 *   STRIPE_MODE=production tsx scripts/revenue-reality-check.ts
 */

import Stripe from 'stripe';
import * as fs from 'fs';
import * as path from 'path';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

interface RevenueMetrics {
  timestamp: string;
  stripeMode: 'test' | 'live' | 'unconfigured';
  keyStatus: {
    configured: boolean;
    keyPrefix: string;
    isPlaceholder: boolean;
  };
  customers: {
    total: number;
    withActiveSubscriptions: number;
    withCanceledSubscriptions: number;
  };
  subscriptions: {
    active: number;
    pastDue: number;
    canceled: number;
    trialing: number;
    incomplete: number;
    total: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    byPlan: Record<string, { count: number; mrr: number }>;
  };
  recentActivity: {
    paymentsLast30Days: number;
    totalRevenueLast30Days: number;
    newCustomersLast30Days: number;
    churnedCustomersLast30Days: number;
  };
  warnings: string[];
  errors: string[];
}

async function checkStripeConfiguration(): Promise<{
  configured: boolean;
  keyPrefix: string;
  isPlaceholder: boolean;
  mode: 'test' | 'live' | 'unconfigured';
  stripe?: Stripe;
  error?: string;
}> {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return {
      configured: false,
      keyPrefix: 'none',
      isPlaceholder: false,
      mode: 'unconfigured',
      error: 'STRIPE_SECRET_KEY environment variable not set',
    };
  }

  // Check for placeholder values
  const placeholderPatterns = [
    'YOUR_SECRET_KEY',
    'YOUR_LIVE_SECRET_KEY',
    'sk_test_YOUR',
    'sk_live_YOUR',
    'REPLACE_ME',
    'PLACEHOLDER',
  ];

  const isPlaceholder = placeholderPatterns.some((pattern) =>
    secretKey.includes(pattern)
  );

  if (isPlaceholder) {
    return {
      configured: false,
      keyPrefix: secretKey.substring(0, 15) + '...',
      isPlaceholder: true,
      mode: 'unconfigured',
      error: 'Stripe key is a placeholder value',
    };
  }

  // Determine mode from key prefix
  const mode = secretKey.startsWith('sk_live_') ? 'live' : 'test';

  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    });

    // Test the connection
    await stripe.customers.list({ limit: 1 });

    return {
      configured: true,
      keyPrefix: secretKey.substring(0, 15) + '...',
      isPlaceholder: false,
      mode,
      stripe,
    };
  } catch (error: any) {
    return {
      configured: false,
      keyPrefix: secretKey.substring(0, 15) + '...',
      isPlaceholder: false,
      mode,
      error: `Stripe API connection failed: ${error.message}`,
    };
  }
}

async function fetchRevenueMetrics(stripe: Stripe): Promise<RevenueMetrics> {
  const metrics: RevenueMetrics = {
    timestamp: new Date().toISOString(),
    stripeMode: stripe.apiKey.startsWith('sk_live_') ? 'live' : 'test',
    keyStatus: {
      configured: true,
      keyPrefix: stripe.apiKey.substring(0, 15) + '...',
      isPlaceholder: false,
    },
    customers: {
      total: 0,
      withActiveSubscriptions: 0,
      withCanceledSubscriptions: 0,
    },
    subscriptions: {
      active: 0,
      pastDue: 0,
      canceled: 0,
      trialing: 0,
      incomplete: 0,
      total: 0,
    },
    revenue: {
      mrr: 0,
      arr: 0,
      byPlan: {},
    },
    recentActivity: {
      paymentsLast30Days: 0,
      totalRevenueLast30Days: 0,
      newCustomersLast30Days: 0,
      churnedCustomersLast30Days: 0,
    },
    warnings: [],
    errors: [],
  };

  try {
    // Fetch all subscriptions
    console.log(`${colors.cyan}Fetching subscriptions...${colors.reset}`);
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      expand: ['data.customer'],
    });

    metrics.subscriptions.total = subscriptions.data.length;

    // Calculate MRR and categorize subscriptions
    for (const sub of subscriptions.data) {
      // Categorize by status
      switch (sub.status) {
        case 'active':
          metrics.subscriptions.active++;
          break;
        case 'past_due':
          metrics.subscriptions.pastDue++;
          break;
        case 'canceled':
          metrics.subscriptions.canceled++;
          break;
        case 'trialing':
          metrics.subscriptions.trialing++;
          break;
        case 'incomplete':
        case 'incomplete_expired':
          metrics.subscriptions.incomplete++;
          break;
      }

      // Calculate MRR only from active subscriptions
      if (sub.status === 'active') {
        const planAmount = sub.items.data[0]?.price.unit_amount || 0;
        const planInterval = sub.items.data[0]?.price.recurring?.interval || 'month';
        const planName = sub.items.data[0]?.price.nickname || 'Unknown Plan';

        // Convert to monthly revenue
        let monthlyAmount = planAmount / 100; // Convert cents to dollars
        if (planInterval === 'year') {
          monthlyAmount = monthlyAmount / 12;
        }

        metrics.revenue.mrr += monthlyAmount;

        // Track by plan
        if (!metrics.revenue.byPlan[planName]) {
          metrics.revenue.byPlan[planName] = { count: 0, mrr: 0 };
        }
        metrics.revenue.byPlan[planName].count++;
        metrics.revenue.byPlan[planName].mrr += monthlyAmount;
      }
    }

    metrics.revenue.arr = metrics.revenue.mrr * 12;

    // Fetch all customers
    console.log(`${colors.cyan}Fetching customers...${colors.reset}`);
    const customers = await stripe.customers.list({
      limit: 100,
    });

    metrics.customers.total = customers.data.length;

    // Count customers with active/canceled subscriptions
    for (const customer of customers.data) {
      const customerSubs = subscriptions.data.filter(
        (sub) =>
          (typeof sub.customer === 'string'
            ? sub.customer
            : sub.customer.id) === customer.id
      );

      const hasActive = customerSubs.some((sub) => sub.status === 'active');
      const hasCanceled = customerSubs.some((sub) => sub.status === 'canceled');

      if (hasActive) {
        metrics.customers.withActiveSubscriptions++;
      }
      if (hasCanceled && !hasActive) {
        metrics.customers.withCanceledSubscriptions++;
      }
    }

    // Fetch recent payment activity (last 30 days)
    console.log(`${colors.cyan}Fetching recent payments...${colors.reset}`);
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
    const charges = await stripe.charges.list({
      limit: 100,
      created: { gte: thirtyDaysAgo },
    });

    metrics.recentActivity.paymentsLast30Days = charges.data.filter(
      (c) => c.status === 'succeeded'
    ).length;
    metrics.recentActivity.totalRevenueLast30Days = charges.data
      .filter((c) => c.status === 'succeeded')
      .reduce((sum, c) => sum + c.amount, 0) / 100;

    // Count new customers in last 30 days
    const newCustomers = customers.data.filter(
      (c) => c.created >= thirtyDaysAgo
    );
    metrics.recentActivity.newCustomersLast30Days = newCustomers.length;

    // Count churned customers (subscriptions canceled in last 30 days)
    const churnedSubs = subscriptions.data.filter(
      (sub) => sub.status === 'canceled' && sub.canceled_at && sub.canceled_at >= thirtyDaysAgo
    );
    metrics.recentActivity.churnedCustomersLast30Days = churnedSubs.length;

    // Add warnings
    if (metrics.stripeMode === 'test') {
      metrics.warnings.push(
        '⚠️  WARNING: You are in TEST MODE. These are not real customers or revenue.'
      );
    }
    if (metrics.subscriptions.active === 0 && metrics.customers.total === 0) {
      metrics.warnings.push(
        '⚠️  WARNING: Zero customers and zero active subscriptions found.'
      );
    }
    if (metrics.revenue.mrr === 0) {
      metrics.warnings.push('⚠️  WARNING: Monthly Recurring Revenue is $0.');
    }

    return metrics;
  } catch (error: any) {
    metrics.errors.push(`Error fetching metrics: ${error.message}`);
    return metrics;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function printReport(metrics: RevenueMetrics): void {
  console.log('\n' + '='.repeat(80));
  console.log(
    `${colors.bright}${colors.magenta}TAXBRIDGE REVENUE REALITY CHECK${colors.reset}`
  );
  console.log('='.repeat(80));
  console.log(`Generated: ${new Date(metrics.timestamp).toLocaleString()}`);
  console.log('='.repeat(80) + '\n');

  // Stripe Configuration Status
  console.log(
    `${colors.bright}${colors.cyan}STRIPE CONFIGURATION${colors.reset}`
  );
  console.log(`Mode: ${colors.bright}${metrics.stripeMode.toUpperCase()}${colors.reset}`);
  console.log(`Key Prefix: ${metrics.keyStatus.keyPrefix}`);
  console.log(
    `Status: ${metrics.keyStatus.configured ? colors.green + '✓ Configured' : colors.red + '✗ Not Configured'}${colors.reset}\n`
  );

  // Revenue Summary
  console.log(`${colors.bright}${colors.cyan}REVENUE SUMMARY${colors.reset}`);
  const mrrColor = metrics.revenue.mrr > 0 ? colors.green : colors.red;
  console.log(
    `Monthly Recurring Revenue (MRR): ${mrrColor}${colors.bright}${formatCurrency(metrics.revenue.mrr)}${colors.reset}`
  );
  console.log(
    `Annual Recurring Revenue (ARR):  ${mrrColor}${colors.bright}${formatCurrency(metrics.revenue.arr)}${colors.reset}\n`
  );

  // Customer Summary
  console.log(`${colors.bright}${colors.cyan}CUSTOMER SUMMARY${colors.reset}`);
  console.log(`Total Customers: ${colors.bright}${metrics.customers.total}${colors.reset}`);
  console.log(
    `With Active Subscriptions: ${colors.bright}${metrics.customers.withActiveSubscriptions}${colors.reset}`
  );
  console.log(
    `With Canceled Subscriptions: ${colors.bright}${metrics.customers.withCanceledSubscriptions}${colors.reset}\n`
  );

  // Subscription Breakdown
  console.log(
    `${colors.bright}${colors.cyan}SUBSCRIPTION BREAKDOWN${colors.reset}`
  );
  console.log(
    `Active: ${colors.green}${metrics.subscriptions.active}${colors.reset}`
  );
  console.log(
    `Past Due: ${colors.yellow}${metrics.subscriptions.pastDue}${colors.reset}`
  );
  console.log(
    `Canceled: ${colors.red}${metrics.subscriptions.canceled}${colors.reset}`
  );
  console.log(`Trialing: ${metrics.subscriptions.trialing}`);
  console.log(`Incomplete: ${metrics.subscriptions.incomplete}`);
  console.log(
    `Total: ${colors.bright}${metrics.subscriptions.total}${colors.reset}\n`
  );

  // Revenue by Plan
  if (Object.keys(metrics.revenue.byPlan).length > 0) {
    console.log(`${colors.bright}${colors.cyan}REVENUE BY PLAN${colors.reset}`);
    Object.entries(metrics.revenue.byPlan)
      .sort((a, b) => b[1].mrr - a[1].mrr)
      .forEach(([planName, data]) => {
        console.log(
          `${planName}: ${data.count} subscribers × ${formatCurrency(data.mrr)} MRR`
        );
      });
    console.log();
  }

  // Recent Activity (Last 30 Days)
  console.log(
    `${colors.bright}${colors.cyan}RECENT ACTIVITY (LAST 30 DAYS)${colors.reset}`
  );
  console.log(
    `Successful Payments: ${colors.bright}${metrics.recentActivity.paymentsLast30Days}${colors.reset}`
  );
  console.log(
    `Revenue: ${colors.bright}${formatCurrency(metrics.recentActivity.totalRevenueLast30Days)}${colors.reset}`
  );
  console.log(
    `New Customers: ${colors.bright}${metrics.recentActivity.newCustomersLast30Days}${colors.reset}`
  );
  console.log(
    `Churned Customers: ${colors.bright}${metrics.recentActivity.churnedCustomersLast30Days}${colors.reset}\n`
  );

  // Warnings
  if (metrics.warnings.length > 0) {
    console.log(`${colors.bright}${colors.yellow}WARNINGS${colors.reset}`);
    metrics.warnings.forEach((warning) => {
      console.log(`${colors.yellow}${warning}${colors.reset}`);
    });
    console.log();
  }

  // Errors
  if (metrics.errors.length > 0) {
    console.log(`${colors.bright}${colors.red}ERRORS${colors.reset}`);
    metrics.errors.forEach((error) => {
      console.log(`${colors.red}${error}${colors.reset}`);
    });
    console.log();
  }

  console.log('='.repeat(80) + '\n');
}

async function main() {
  console.log(
    `${colors.bright}${colors.cyan}TaxBridge Revenue Reality Check${colors.reset}\n`
  );

  // Step 1: Check Stripe configuration
  console.log(`${colors.cyan}Checking Stripe configuration...${colors.reset}`);
  const config = await checkStripeConfiguration();

  if (!config.configured) {
    console.log(
      `\n${colors.red}${colors.bright}✗ STRIPE NOT CONFIGURED${colors.reset}\n`
    );
    console.log(`${colors.yellow}Issue: ${config.error}${colors.reset}`);
    console.log(`Key Status: ${config.keyPrefix}`);
    console.log(`Is Placeholder: ${config.isPlaceholder ? 'YES' : 'NO'}\n`);

    // Generate report with zero metrics
    const zeroMetrics: RevenueMetrics = {
      timestamp: new Date().toISOString(),
      stripeMode: 'unconfigured',
      keyStatus: {
        configured: false,
        keyPrefix: config.keyPrefix,
        isPlaceholder: config.isPlaceholder,
      },
      customers: {
        total: 0,
        withActiveSubscriptions: 0,
        withCanceledSubscriptions: 0,
      },
      subscriptions: {
        active: 0,
        pastDue: 0,
        canceled: 0,
        trialing: 0,
        incomplete: 0,
        total: 0,
      },
      revenue: {
        mrr: 0,
        arr: 0,
        byPlan: {},
      },
      recentActivity: {
        paymentsLast30Days: 0,
        totalRevenueLast30Days: 0,
        newCustomersLast30Days: 0,
        churnedCustomersLast30Days: 0,
      },
      warnings: [
        '⚠️  CRITICAL: Stripe is not configured. Cannot accept payments.',
        '⚠️  CRITICAL: Revenue is $0 because Stripe keys are placeholders.',
        '⚠️  ACTION REQUIRED: Replace placeholder Stripe keys with real keys from Stripe Dashboard.',
      ],
      errors: [config.error || 'Unknown configuration error'],
    };

    printReport(zeroMetrics);

    // Save report
    const reportPath = path.join(
      process.cwd(),
      'docs',
      'REVENUE_REALITY_CHECK.json'
    );
    fs.writeFileSync(reportPath, JSON.stringify(zeroMetrics, null, 2));
    console.log(
      `${colors.green}Report saved to: ${reportPath}${colors.reset}\n`
    );

    process.exit(1);
  }

  console.log(
    `${colors.green}✓ Stripe connected successfully${colors.reset}`
  );
  console.log(`Mode: ${colors.bright}${config.mode.toUpperCase()}${colors.reset}\n`);

  // Step 2: Fetch metrics
  const metrics = await fetchRevenueMetrics(config.stripe!);

  // Step 3: Print report
  printReport(metrics);

  // Step 4: Save report to file
  const reportPath = path.join(
    process.cwd(),
    'docs',
    'REVENUE_REALITY_CHECK.json'
  );
  fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2));
  console.log(
    `${colors.green}Report saved to: ${reportPath}${colors.reset}\n`
  );

  // Executive summary
  console.log(`${colors.bright}${colors.cyan}EXECUTIVE SUMMARY${colors.reset}`);
  if (metrics.revenue.mrr === 0) {
    console.log(
      `${colors.red}${colors.bright}STATUS: ZERO REVENUE${colors.reset}`
    );
    console.log(
      `${colors.yellow}Current MRR: $0${colors.reset}`
    );
    console.log(
      `${colors.yellow}Paid Customers: ${metrics.customers.withActiveSubscriptions}${colors.reset}`
    );
    if (metrics.stripeMode === 'test') {
      console.log(
        `\n${colors.red}ACTION REQUIRED: Move Stripe from TEST MODE to LIVE MODE${colors.reset}`
      );
    }
  } else {
    console.log(
      `${colors.green}${colors.bright}STATUS: REVENUE ACTIVE${colors.reset}`
    );
    console.log(
      `${colors.green}Current MRR: ${formatCurrency(metrics.revenue.mrr)}${colors.reset}`
    );
    console.log(
      `${colors.green}Paid Customers: ${metrics.customers.withActiveSubscriptions}${colors.reset}`
    );
  }
  console.log();
}

main().catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
