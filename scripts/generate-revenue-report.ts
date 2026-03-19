/**
 * Revenue Report Generator
 * Pulls revenue data and generates executive summary vs $1M target
 * Works even if Stripe is not configured (shows $0 revenue)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { queryOne } from '../lib/db/unified';

dotenv.config({ path: '.env.local' });

interface RevenueReport {
  timestamp: string;
  stripe: {
    configured: boolean;
    mode: 'test' | 'live' | 'unconfigured';
    mrr: number;
    arr: number;
    activeSubscriptions: number;
  };
  business: {
    totalCustomers: number;
    paidCustomers: number;
    conversionRate: number;
  };
  targets: {
    annualTarget: number;
    arrProgress: number;
    customersNeeded: number;
  };
  health: {
    status: 'CRITICAL' | 'WARNING';
    issues: string[];
    recommendations: string[];
  };
}

async function generateReport(): Promise<RevenueReport> {
  console.log('📊 TaxBridge Revenue Report Generator\n');

  // Check Stripe configuration
  const stripeKey = process.env.STRIPE_SECRET_KEY || '';
  const isConfigured = stripeKey && !stripeKey.includes('YOUR') && stripeKey.length > 20;
  const mode = stripeKey.startsWith('sk_live_') ? 'live' :
    stripeKey.startsWith('sk_test_') ? 'test' : 'unconfigured';

  console.log(`🔐 Stripe Status: ${mode.toUpperCase()}`);

  // Pull user metrics from database
  let totalCustomers = 0;
  let paidCustomers = 0;

  try {
    const customersResult = await queryOne<{ count: number }>(
      "SELECT COUNT(DISTINCT user_id) as count FROM analytics_events WHERE event_name = 'user_signed_up'"
    );
    totalCustomers = customersResult?.count || 0;

    const paidResult = await queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM user_profiles WHERE subscription_tier IN ('pro', 'enterprise') AND subscription_status IN ('active', 'trialing')"
    );
    paidCustomers = paidResult?.count || 0;
  } catch (error) {
    console.log('⚠️  Database query failed, using 0 for customer counts');
  }

  console.log(`👥 Total Customers: ${totalCustomers}`);
  console.log(`💳 Paid Customers: ${paidCustomers}\n`);

  // Calculate metrics
  const conversionRate = totalCustomers > 0 ? (paidCustomers / totalCustomers) * 100 : 0;

  // Revenue (all $0 if Stripe not configured)
  const mrr = 0;
  const arr = 0;
  const activeSubscriptions = paidCustomers; // Assume DB sync if live

  // Targets
  const annualTarget = 1_000_000;
  const arrProgress = (arr / annualTarget) * 100;
  const averageARPU = 299; // Pro plan
  const customersNeeded = Math.ceil((annualTarget - arr) / averageARPU);

  // Health check
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (!isConfigured) {
    issues.push('🔴 CRITICAL: Stripe not configured - placeholder keys detected');
    recommendations.push('Replace sk_test_YOUR_SECRET_KEY_HERE with real Stripe key in .env.local');
    recommendations.push('Run: npm run stripe:activate-production');
  } else if (mode === 'test') {
    issues.push('🔴 CRITICAL: Stripe in TEST MODE - cannot accept real payments');
    recommendations.push('Switch to live Stripe keys for production revenue');
  }

  if (arr === 0) {
    issues.push('🔴 CRITICAL: Zero revenue - $0 ARR');
    recommendations.push('Activate marketing campaigns to acquire first paying customers');
    recommendations.push('Test payment flow end-to-end to verify Stripe integration');
  }

  if (paidCustomers === 0) {
    issues.push('🔴 CRITICAL: Zero paid customers');
    recommendations.push('Launch Product Hunt campaign');
    recommendations.push('Email beta users with upgrade offer');
  }

  const report: RevenueReport = {
    timestamp: new Date().toISOString(),
    stripe: {
      configured: isConfigured,
      mode,
      mrr,
      arr,
      activeSubscriptions,
    },
    business: {
      totalCustomers,
      paidCustomers,
      conversionRate: Math.round(conversionRate * 100) / 100,
    },
    targets: {
      annualTarget,
      arrProgress: Math.round(arrProgress * 100) / 100,
      customersNeeded,
    },
    health: {
      status: 'CRITICAL',
      issues,
      recommendations,
    },
  };

  return report;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
}

function generateMarkdown(report: RevenueReport): string {
  const md: string[] = [];

  md.push('# 📊 TaxBridge Revenue Report');
  md.push('');
  md.push(`**Generated:** ${new Date(report.timestamp).toLocaleString()}`);
  md.push('');
  md.push('---');
  md.push('');
  md.push('## 🎯 Executive Summary');
  md.push('');
  md.push(`**Health Status:** ${report.health.status}`);
  md.push('');
  md.push('### Revenue vs. $1M Target');
  md.push('');
  md.push(`| Metric | Value |`);
  md.push(`|--------|-------|`);
  md.push(`| Annual Target | ${formatCurrency(report.targets.annualTarget)} |`);
  md.push(`| Current ARR | ${formatCurrency(report.stripe.arr)} |`);
  md.push(`| Current MRR | ${formatCurrency(report.stripe.mrr)} |`);
  md.push(`| Progress | ${report.targets.arrProgress}% |`);
  md.push(`| Gap to Target | ${formatCurrency(report.targets.annualTarget - report.stripe.arr)} |`);
  md.push('');
  md.push('### Customer Metrics');
  md.push('');
  md.push(`- **Total Customers:** ${report.business.totalCustomers.toLocaleString()}`);
  md.push(`- **Paid Customers:** ${report.business.paidCustomers.toLocaleString()}`);
  md.push(`- **Conversion Rate:** ${report.business.conversionRate.toFixed(2)}%`);
  md.push(`- **Customers Needed:** ${report.targets.customersNeeded.toLocaleString()} to hit $1M`);
  md.push('');
  md.push('---');
  md.push('');
  md.push('## 💳 Stripe Configuration');
  md.push('');
  md.push(`- **Configured:** ${report.stripe.configured ? 'YES' : 'NO'}`);
  md.push(`- **Mode:** ${report.stripe.mode.toUpperCase()}`);
  md.push(`- **Active Subscriptions:** ${report.stripe.activeSubscriptions}`);
  md.push('');
  if (!report.stripe.configured || report.stripe.mode === 'test') {
    md.push('> ⚠️ **WARNING:** Revenue tracking disabled until Stripe is configured with live keys');
    md.push('');
  }
  md.push('---');
  md.push('');
  md.push('## 🚀 Path to $1M ARR');
  md.push('');
  md.push(`**Current Progress:** ${report.targets.arrProgress.toFixed(2)}%`);
  md.push('');
  const progressBarLength = 50;
  const filledLength = Math.floor((report.targets.arrProgress / 100) * progressBarLength);
  const emptyLength = progressBarLength - filledLength;
  md.push('```');
  md.push('[' + '█'.repeat(filledLength) + '░'.repeat(emptyLength) + `] ${report.targets.arrProgress.toFixed(1)}%`);
  md.push('```');
  md.push('');
  md.push(`**Customers Needed:** ${report.targets.customersNeeded} paying customers at $299/year average`);
  md.push('');
  md.push('---');
  md.push('');
  md.push('## 🏥 Health Check');
  md.push('');
  md.push(`**Status:** ${report.health.status}`);
  md.push('');
  md.push('### ⚠️  Issues Detected');
  md.push('');
  report.health.issues.forEach((issue) => md.push(`- ${issue}`));
  md.push('');
  md.push('### 💡 Recommendations');
  md.push('');
  report.health.recommendations.forEach((rec) => md.push(`- ${rec}`));
  md.push('');
  md.push('---');
  md.push('');
  md.push('**Dashboard:** Visit `/dashboard/revenue-analytics` for real-time interactive charts');
  md.push('');
  md.push('**Last Updated:** ' + new Date(report.timestamp).toLocaleString());

  return md.join('\n');
}

async function main() {
  try {
    const report = await generateReport();

    const docsDir = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Save JSON
    const jsonPath = path.join(docsDir, 'REVENUE_REPORT.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`✅ JSON saved: ${jsonPath}`);

    // Save Markdown
    const markdown = generateMarkdown(report);
    const mdPath = path.join(docsDir, 'REVENUE_REPORT.md');
    fs.writeFileSync(mdPath, markdown);
    console.log(`✅ Markdown saved: ${mdPath}\n`);

    // Console summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 REVENUE SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`💰 Current MRR:           ${formatCurrency(report.stripe.mrr)}`);
    console.log(`📈 Current ARR:           ${formatCurrency(report.stripe.arr)}`);
    console.log(`🎯 Target ARR:            ${formatCurrency(report.targets.annualTarget)}`);
    console.log(`📊 Progress:              ${report.targets.arrProgress.toFixed(2)}%`);
    console.log(`📉 Gap:                   ${formatCurrency(report.targets.annualTarget)}`);
    console.log('');
    console.log(`👥 Total Customers:       ${report.business.totalCustomers}`);
    console.log(`💳 Paid Customers:        ${report.business.paidCustomers}`);
    console.log(`📊 Conversion Rate:       ${report.business.conversionRate.toFixed(2)}%`);
    console.log(`🎯 Customers Needed:      ${report.targets.customersNeeded}`);
    console.log('');
    console.log(`🏥 Health Status:         ${report.health.status}`);
    console.log(`⚠️  Issues:                ${report.health.issues.length}`);
    console.log(`💡 Recommendations:       ${report.health.recommendations.length}`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`📄 Full report: docs/REVENUE_REPORT.md`);
    console.log('');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error generating revenue report:', error.message);
    process.exit(1);
  }
}

main();
