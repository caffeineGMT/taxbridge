#!/usr/bin/env tsx

/**
 * Stripe Revenue Reality Check
 *
 * Queries Stripe API for ACTUAL revenue metrics:
 * - Total customers (active subscriptions)
 * - MRR (Monthly Recurring Revenue)
 * - Total revenue (all-time)
 * - Failed payments
 *
 * Usage: npm run verify:stripe:revenue
 */

import Stripe from 'stripe';
import { writeFileSync } from 'fs';
import { join } from 'path';

// ANSI color codes for terminal output
const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
};

interface RevenueMetrics {
  timestamp: string;
  stripeMode: 'test' | 'live' | 'unknown';
  totalCustomers: number;
  activeSubscriptions: number;
  mrr: number; // in cents
  totalRevenue: number; // in cents
  failedPayments: number;
  successfulPayments: number;
  churnedCustomers: number;
  trialUsers: number;
  subscriptionBreakdown: {
    active: number;
    canceled: number;
    incomplete: number;
    trialing: number;
    past_due: number;
  };
  revenueBreakdown: {
    subscriptions: number; // in cents
    oneTime: number; // in cents
  };
  paymentMethodBreakdown: {
    card: number;
    other: number;
  };
  rawData?: any; // For debugging
}

async function queryStripeRevenue(): Promise<RevenueMetrics> {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not found in environment variables');
  }

  // Check if key is placeholder
  if (secretKey.includes('YOUR_SECRET_KEY') || secretKey.includes('PLACEHOLDER')) {
    console.log(`${COLORS.RED}${COLORS.BOLD}⚠️  STRIPE KEY IS PLACEHOLDER${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}Cannot query revenue data - Stripe key is a placeholder value${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}To fix: Replace with actual Stripe secret key from dashboard${COLORS.RESET}\n`);

    return {
      timestamp: new Date().toISOString(),
      stripeMode: 'unknown',
      totalCustomers: 0,
      activeSubscriptions: 0,
      mrr: 0,
      totalRevenue: 0,
      failedPayments: 0,
      successfulPayments: 0,
      churnedCustomers: 0,
      trialUsers: 0,
      subscriptionBreakdown: {
        active: 0,
        canceled: 0,
        incomplete: 0,
        trialing: 0,
        past_due: 0,
      },
      revenueBreakdown: {
        subscriptions: 0,
        oneTime: 0,
      },
      paymentMethodBreakdown: {
        card: 0,
        other: 0,
      },
    };
  }

  // Determine mode from key prefix
  const isTestMode = secretKey.startsWith('sk_test_');
  const isLiveMode = secretKey.startsWith('sk_live_');
  const stripeMode = isLiveMode ? 'live' : isTestMode ? 'test' : 'unknown';

  console.log(`${COLORS.CYAN}${COLORS.BOLD}🔍 Querying Stripe API...${COLORS.RESET}`);
  console.log(`${COLORS.BLUE}Mode: ${stripeMode.toUpperCase()}${COLORS.RESET}`);
  console.log(`${COLORS.BLUE}Key: ${secretKey.substring(0, 12)}...${COLORS.RESET}\n`);

  if (isTestMode) {
    console.log(`${COLORS.YELLOW}⚠️  WARNING: Using TEST MODE data${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}This is NOT production revenue - replace with live keys${COLORS.RESET}\n`);
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
  });

  try {
    // Query all customers
    console.log(`${COLORS.CYAN}Fetching customers...${COLORS.RESET}`);
    const customersResponse = await stripe.customers.list({
      limit: 100, // Adjust if you have more than 100 customers
    });
    const totalCustomers = customersResponse.data.length;

    // Query all subscriptions
    console.log(`${COLORS.CYAN}Fetching subscriptions...${COLORS.RESET}`);
    const subscriptionsResponse = await stripe.subscriptions.list({
      limit: 100,
      status: 'all',
    });

    const subscriptions = subscriptionsResponse.data;
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const trialingSubscriptions = subscriptions.filter(s => s.status === 'trialing').length;
    const canceledSubscriptions = subscriptions.filter(s => s.status === 'canceled').length;
    const incompleteSubscriptions = subscriptions.filter(s => s.status === 'incomplete').length;
    const pastDueSubscriptions = subscriptions.filter(s => s.status === 'past_due').length;

    // Calculate MRR from active subscriptions
    let mrr = 0;
    for (const sub of subscriptions) {
      if (sub.status === 'active' || sub.status === 'trialing') {
        for (const item of sub.items.data) {
          const amount = item.price.unit_amount || 0;
          const interval = item.price.recurring?.interval;

          if (interval === 'month') {
            mrr += amount;
          } else if (interval === 'year') {
            mrr += Math.round(amount / 12); // Convert annual to monthly
          }
        }
      }
    }

    // Query all charges (payments)
    console.log(`${COLORS.CYAN}Fetching charges...${COLORS.RESET}`);
    const chargesResponse = await stripe.charges.list({
      limit: 100,
    });

    const charges = chargesResponse.data;
    const successfulCharges = charges.filter(c => c.status === 'succeeded');
    const failedCharges = charges.filter(c => c.status === 'failed');

    // Calculate total revenue from successful charges
    const totalRevenue = successfulCharges.reduce((sum, charge) => sum + charge.amount, 0);

    // Revenue breakdown
    const subscriptionCharges = charges.filter(c => c.invoice !== null);
    const oneTimeCharges = charges.filter(c => c.invoice === null);
    const subscriptionRevenue = subscriptionCharges
      .filter(c => c.status === 'succeeded')
      .reduce((sum, charge) => sum + charge.amount, 0);
    const oneTimeRevenue = oneTimeCharges
      .filter(c => c.status === 'succeeded')
      .reduce((sum, charge) => sum + charge.amount, 0);

    // Payment method breakdown
    const cardPayments = charges.filter(c => c.payment_method_details?.type === 'card').length;
    const otherPayments = charges.length - cardPayments;

    // Count churned customers (had subscription, now canceled)
    const churnedCustomers = canceledSubscriptions;

    const metrics: RevenueMetrics = {
      timestamp: new Date().toISOString(),
      stripeMode,
      totalCustomers,
      activeSubscriptions,
      mrr,
      totalRevenue,
      failedPayments: failedCharges.length,
      successfulPayments: successfulCharges.length,
      churnedCustomers,
      trialUsers: trialingSubscriptions,
      subscriptionBreakdown: {
        active: activeSubscriptions,
        canceled: canceledSubscriptions,
        incomplete: incompleteSubscriptions,
        trialing: trialingSubscriptions,
        past_due: pastDueSubscriptions,
      },
      revenueBreakdown: {
        subscriptions: subscriptionRevenue,
        oneTime: oneTimeRevenue,
      },
      paymentMethodBreakdown: {
        card: cardPayments,
        other: otherPayments,
      },
      rawData: {
        customersCount: customersResponse.data.length,
        subscriptionsCount: subscriptions.length,
        chargesCount: charges.length,
      },
    };

    return metrics;
  } catch (error: any) {
    console.error(`${COLORS.RED}❌ Error querying Stripe API:${COLORS.RESET}`, error.message);
    throw error;
  }
}

function formatCurrency(amountInCents: number): string {
  return `$${(amountInCents / 100).toFixed(2)}`;
}

function printMetrics(metrics: RevenueMetrics): void {
  console.log(`\n${COLORS.BOLD}${COLORS.MAGENTA}╔═══════════════════════════════════════════════════════╗${COLORS.RESET}`);
  console.log(`${COLORS.BOLD}${COLORS.MAGENTA}║           STRIPE REVENUE REALITY CHECK               ║${COLORS.RESET}`);
  console.log(`${COLORS.BOLD}${COLORS.MAGENTA}╚═══════════════════════════════════════════════════════╝${COLORS.RESET}\n`);

  console.log(`${COLORS.BOLD}📊 MODE: ${metrics.stripeMode.toUpperCase()}${COLORS.RESET}`);
  console.log(`${COLORS.BOLD}📅 Generated: ${new Date(metrics.timestamp).toLocaleString()}${COLORS.RESET}\n`);

  // Key Metrics
  console.log(`${COLORS.BOLD}${COLORS.CYAN}═══ KEY METRICS ═══${COLORS.RESET}`);
  console.log(`💰 MRR (Monthly Recurring Revenue): ${COLORS.GREEN}${COLORS.BOLD}${formatCurrency(metrics.mrr)}${COLORS.RESET}`);
  console.log(`💵 Total Revenue (All-Time): ${COLORS.GREEN}${COLORS.BOLD}${formatCurrency(metrics.totalRevenue)}${COLORS.RESET}`);
  console.log(`👥 Total Customers: ${COLORS.BLUE}${metrics.totalCustomers}${COLORS.RESET}`);
  console.log(`✅ Active Subscriptions: ${COLORS.GREEN}${metrics.activeSubscriptions}${COLORS.RESET}`);
  console.log(`⏳ Trial Users: ${COLORS.YELLOW}${metrics.trialUsers}${COLORS.RESET}`);
  console.log(`❌ Churned Customers: ${COLORS.RED}${metrics.churnedCustomers}${COLORS.RESET}\n`);

  // Payment Stats
  console.log(`${COLORS.BOLD}${COLORS.CYAN}═══ PAYMENT STATS ═══${COLORS.RESET}`);
  console.log(`✅ Successful Payments: ${COLORS.GREEN}${metrics.successfulPayments}${COLORS.RESET}`);
  console.log(`❌ Failed Payments: ${COLORS.RED}${metrics.failedPayments}${COLORS.RESET}`);
  const successRate = metrics.successfulPayments + metrics.failedPayments > 0
    ? ((metrics.successfulPayments / (metrics.successfulPayments + metrics.failedPayments)) * 100).toFixed(1)
    : '0.0';
  console.log(`📈 Success Rate: ${COLORS.GREEN}${successRate}%${COLORS.RESET}\n`);

  // Subscription Breakdown
  console.log(`${COLORS.BOLD}${COLORS.CYAN}═══ SUBSCRIPTION BREAKDOWN ═══${COLORS.RESET}`);
  console.log(`Active: ${COLORS.GREEN}${metrics.subscriptionBreakdown.active}${COLORS.RESET}`);
  console.log(`Trialing: ${COLORS.YELLOW}${metrics.subscriptionBreakdown.trialing}${COLORS.RESET}`);
  console.log(`Canceled: ${COLORS.RED}${metrics.subscriptionBreakdown.canceled}${COLORS.RESET}`);
  console.log(`Incomplete: ${COLORS.YELLOW}${metrics.subscriptionBreakdown.incomplete}${COLORS.RESET}`);
  console.log(`Past Due: ${COLORS.RED}${metrics.subscriptionBreakdown.past_due}${COLORS.RESET}\n`);

  // Revenue Breakdown
  console.log(`${COLORS.BOLD}${COLORS.CYAN}═══ REVENUE BREAKDOWN ═══${COLORS.RESET}`);
  console.log(`Subscriptions: ${COLORS.GREEN}${formatCurrency(metrics.revenueBreakdown.subscriptions)}${COLORS.RESET}`);
  console.log(`One-Time: ${COLORS.GREEN}${formatCurrency(metrics.revenueBreakdown.oneTime)}${COLORS.RESET}\n`);

  // Payment Methods
  console.log(`${COLORS.BOLD}${COLORS.CYAN}═══ PAYMENT METHODS ═══${COLORS.RESET}`);
  console.log(`Card: ${COLORS.BLUE}${metrics.paymentMethodBreakdown.card}${COLORS.RESET}`);
  console.log(`Other: ${COLORS.BLUE}${metrics.paymentMethodBreakdown.other}${COLORS.RESET}\n`);

  // Warnings
  if (metrics.stripeMode === 'test') {
    console.log(`${COLORS.RED}${COLORS.BOLD}⚠️  WARNING: TEST MODE DATA${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}These numbers are NOT real revenue. Replace with live Stripe keys.${COLORS.RESET}\n`);
  }

  if (metrics.mrr === 0 && metrics.totalRevenue === 0) {
    console.log(`${COLORS.RED}${COLORS.BOLD}⚠️  ZERO REVENUE${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}No revenue detected. Check:${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}1. Are you using the correct Stripe account?${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}2. Is Stripe in production mode?${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}3. Have any payments been processed?${COLORS.RESET}\n`);
  }
}

function generateMarkdownReport(metrics: RevenueMetrics): string {
  const date = new Date(metrics.timestamp).toISOString().split('T')[0].replace(/-/g, '');

  const report = `# Stripe Revenue Report - ${new Date(metrics.timestamp).toLocaleDateString()}

**Generated:** ${new Date(metrics.timestamp).toLocaleString()}
**Stripe Mode:** ${metrics.stripeMode.toUpperCase()}
**Report ID:** revenue-report-${date}

---

## 🎯 Executive Summary

${metrics.stripeMode === 'test' ? '⚠️ **WARNING: TEST MODE DATA** - These numbers are NOT real revenue. Replace with live Stripe keys.\n\n' : ''}${metrics.mrr === 0 && metrics.totalRevenue === 0 ? '⚠️ **ZERO REVENUE DETECTED** - No payments have been processed.\n\n' : ''}| Metric | Value |
|--------|-------|
| **MRR (Monthly Recurring Revenue)** | **${formatCurrency(metrics.mrr)}** |
| **Total Revenue (All-Time)** | **${formatCurrency(metrics.totalRevenue)}** |
| **Total Customers** | ${metrics.totalCustomers} |
| **Active Subscriptions** | ${metrics.activeSubscriptions} |
| **Trial Users** | ${metrics.trialUsers} |
| **Churned Customers** | ${metrics.churnedCustomers} |

---

## 💳 Payment Statistics

| Metric | Count |
|--------|-------|
| Successful Payments | ${metrics.successfulPayments} |
| Failed Payments | ${metrics.failedPayments} |
| Success Rate | ${metrics.successfulPayments + metrics.failedPayments > 0 ? ((metrics.successfulPayments / (metrics.successfulPayments + metrics.failedPayments)) * 100).toFixed(1) : '0.0'}% |

### Failed Payments Breakdown

${metrics.failedPayments === 0 ? '✅ No failed payments detected.' : `⚠️ **${metrics.failedPayments} failed payments** - requires investigation.

**Common causes:**
- Insufficient funds
- Expired/invalid cards
- Card declined by bank
- 3D Secure authentication failed

**Action Required:**
1. Review failed charges in Stripe dashboard
2. Set up automated retry logic
3. Email customers to update payment methods
`}

---

## 📊 Subscription Breakdown

| Status | Count |
|--------|-------|
| Active | ${metrics.subscriptionBreakdown.active} |
| Trialing | ${metrics.subscriptionBreakdown.trialing} |
| Canceled | ${metrics.subscriptionBreakdown.canceled} |
| Incomplete | ${metrics.subscriptionBreakdown.incomplete} |
| Past Due | ${metrics.subscriptionBreakdown.past_due} |

**Churn Rate:** ${metrics.totalCustomers > 0 ? ((metrics.churnedCustomers / metrics.totalCustomers) * 100).toFixed(1) : '0.0'}%

---

## 💰 Revenue Breakdown

| Source | Amount |
|--------|--------|
| Subscription Revenue | ${formatCurrency(metrics.revenueBreakdown.subscriptions)} |
| One-Time Revenue | ${formatCurrency(metrics.revenueBreakdown.oneTime)} |
| **Total** | **${formatCurrency(metrics.totalRevenue)}** |

---

## 💳 Payment Methods

| Method | Count |
|--------|-------|
| Card | ${metrics.paymentMethodBreakdown.card} |
| Other | ${metrics.paymentMethodBreakdown.other} |

---

## 📈 Growth Metrics

| Metric | Value | Formula |
|--------|-------|---------|
| ARR (Annual Recurring Revenue) | ${formatCurrency(metrics.mrr * 12)} | MRR × 12 |
| ARPU (Avg Revenue Per User) | ${metrics.activeSubscriptions > 0 ? formatCurrency(Math.round(metrics.mrr / metrics.activeSubscriptions)) : '$0.00'} | MRR ÷ Active Subscriptions |
| Customer Lifetime Value (est.) | ${metrics.activeSubscriptions > 0 ? formatCurrency(Math.round((metrics.mrr / metrics.activeSubscriptions) * 12)) : '$0.00'} | ARPU × 12 months |

---

## ⚠️ Action Items

${metrics.stripeMode === 'test' ? '### 🔴 CRITICAL: Activate Production Mode\n\n- [ ] Replace test Stripe keys with live keys\n- [ ] Test payment flow with real credit card\n- [ ] Verify webhooks are configured\n- [ ] Enable production mode in Stripe dashboard\n\n' : ''}${metrics.failedPayments > 0 ? `### 🟠 HIGH: Address Failed Payments\n\n- [ ] Review ${metrics.failedPayments} failed charges in Stripe dashboard\n- [ ] Set up Stripe automatic payment retries\n- [ ] Email affected customers to update payment methods\n- [ ] Add Stripe Radar for fraud prevention\n\n` : ''}${metrics.mrr === 0 ? '### 🟡 MEDIUM: Zero MRR\n\n- [ ] Verify pricing is configured correctly\n- [ ] Check if subscriptions are being created\n- [ ] Review checkout flow for errors\n- [ ] Test end-to-end payment flow\n\n' : ''}${metrics.subscriptionBreakdown.incomplete > 0 ? `### 🟡 MEDIUM: Incomplete Subscriptions\n\n- [ ] Investigate ${metrics.subscriptionBreakdown.incomplete} incomplete subscriptions\n- [ ] Common causes: 3D Secure failed, payment declined\n- [ ] Send recovery emails to complete signup\n\n` : ''}---

## 📝 Notes

- This report was generated automatically by \`scripts/verify-stripe-revenue.ts\`
- Data source: Stripe API ${metrics.stripeMode} mode
- For manual verification: [Stripe Dashboard](https://dashboard.stripe.com/${metrics.stripeMode === 'test' ? 'test/' : ''}dashboard)

---

## 🔧 Technical Details

\`\`\`json
${JSON.stringify({
  timestamp: metrics.timestamp,
  stripeMode: metrics.stripeMode,
  rawCounts: metrics.rawData,
}, null, 2)}
\`\`\`

---

**Report Generated By:** TaxBridge Revenue Monitoring System
**Next Update:** Run \`npm run verify:stripe:revenue\` anytime
`;

  return report;
}

async function main() {
  try {
    console.log(`${COLORS.BOLD}${COLORS.CYAN}Starting Stripe Revenue Reality Check...${COLORS.RESET}\n`);

    const metrics = await queryStripeRevenue();

    printMetrics(metrics);

    // Generate markdown report
    const date = new Date(metrics.timestamp).toISOString().split('T')[0].replace(/-/g, '');
    const markdownReport = generateMarkdownReport(metrics);

    const reportPath = join(process.cwd(), 'docs', `revenue-report-${date}.md`);
    writeFileSync(reportPath, markdownReport, 'utf-8');

    console.log(`${COLORS.GREEN}✅ Report saved to: ${COLORS.BOLD}docs/revenue-report-${date}.md${COLORS.RESET}\n`);

    // Also save JSON for programmatic access
    const jsonPath = join(process.cwd(), 'docs', `revenue-report-${date}.json`);
    writeFileSync(jsonPath, JSON.stringify(metrics, null, 2), 'utf-8');

    console.log(`${COLORS.GREEN}✅ JSON data saved to: ${COLORS.BOLD}docs/revenue-report-${date}.json${COLORS.RESET}\n`);

    console.log(`${COLORS.BOLD}${COLORS.MAGENTA}════════════════════════════════════════════════════════${COLORS.RESET}\n`);
  } catch (error: any) {
    console.error(`${COLORS.RED}${COLORS.BOLD}❌ Revenue check failed:${COLORS.RESET}`, error.message);
    process.exit(1);
  }
}

main();
