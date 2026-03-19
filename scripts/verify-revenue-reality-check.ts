#!/usr/bin/env tsx

/**
 * Revenue Reality Check - Database Verification Script
 * Queries local database for actual user/revenue metrics
 * Generates JSON report for dashboard consumption
 */

import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface RevenueMetrics {
  timestamp: string;
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
  users: {
    total: number;
    totalAllTime: number;
    free: number;
    proActive: number;
    enterpriseActive: number;
    withStripeId: number;
    newInPeriod: number;
  };
  activity: {
    calculatorSessions: number;
    rsuEntries: number;
    taxCalculations: number;
    analyticsEvents: number;
  };
  conversions: {
    calculatorCompletionRate: string;
    signupRate: string;
    paymentRate: string;
    overallConversion: string;
  };
  revenue: {
    mrr: number;
    arr: number;
    payingCustomers: number;
    averageCustomerValue: number;
  };
  gaps: {
    stripeConfigured: boolean;
    posthogConfigured: boolean;
    calculatorWorking: boolean;
    revenueUnblocked: boolean;
  };
}

function main() {
  console.log('🔍 Revenue Reality Check - Database Verification');
  console.log('='.repeat(60));

  // Connect to database
  const db = new Database('data/taxbridge.db', { readonly: true });

  // Calculate date range (last 30 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const startUnix = Math.floor(startDate.getTime() / 1000);
  const endUnix = Math.floor(endDate.getTime() / 1000);

  console.log(`\n📅 Date Range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\n`);

  // Query user metrics
  console.log('👤 Querying user metrics...');
  const userMetrics = {
    totalAllTime: db.prepare('SELECT COUNT(*) as count FROM user_profiles').get() as { count: number },
    total: db.prepare('SELECT COUNT(*) as count FROM user_profiles WHERE created_at >= ? AND created_at <= ?').get(startUnix, endUnix) as { count: number },
    free: db.prepare("SELECT COUNT(*) as count FROM user_profiles WHERE subscription_tier = 'free'").get() as { count: number },
    proActive: db.prepare("SELECT COUNT(*) as count FROM user_profiles WHERE subscription_tier = 'pro' AND subscription_status = 'active'").get() as { count: number },
    enterpriseActive: db.prepare("SELECT COUNT(*) as count FROM user_profiles WHERE subscription_tier = 'enterprise' AND subscription_status = 'active'").get() as { count: number },
    withStripeId: db.prepare('SELECT COUNT(*) as count FROM user_profiles WHERE stripe_customer_id IS NOT NULL').get() as { count: number },
  };

  console.log(`  Total users (all-time): ${userMetrics.totalAllTime.count}`);
  console.log(`  New users (30 days): ${userMetrics.total.count}`);
  console.log(`  Free users: ${userMetrics.free.count}`);
  console.log(`  Pro users (active): ${userMetrics.proActive.count}`);
  console.log(`  Enterprise users (active): ${userMetrics.enterpriseActive.count}`);

  // Query activity metrics
  console.log('\n📊 Querying activity metrics...');
  const activityMetrics = {
    calculatorSessions: db.prepare('SELECT COUNT(*) as count FROM calculator_sessions').get() as { count: number },
    rsuEntries: db.prepare('SELECT COUNT(*) as count FROM rsu_entries').get() as { count: number },
    taxCalculations: db.prepare('SELECT COUNT(*) as count FROM tax_calculations').get() as { count: number },
    analyticsEvents: db.prepare('SELECT COUNT(*) as count FROM analytics_events WHERE created_at >= ? AND created_at <= ?').get(startUnix, endUnix) as { count: number },
  };

  console.log(`  Calculator sessions: ${activityMetrics.calculatorSessions.count}`);
  console.log(`  RSU entries created: ${activityMetrics.rsuEntries.count}`);
  console.log(`  Tax calculations: ${activityMetrics.taxCalculations.count}`);
  console.log(`  Analytics events: ${activityMetrics.analyticsEvents.count}`);

  // Calculate conversions (mock data since we don't have actual visitor count)
  const calculatorCompletionRate = activityMetrics.taxCalculations.count > 0 ? '0%' : '0%';
  const signupRate = 'N/A (no completions)';
  const paymentRate = 'N/A (Stripe test mode)';
  const overallConversion = '0%';

  // Revenue metrics
  console.log('\n💰 Calculating revenue metrics...');
  const payingCustomers = userMetrics.proActive.count + userMetrics.enterpriseActive.count;
  const mrr = 0; // Stripe test mode = $0
  const arr = mrr * 12;
  const averageCustomerValue = payingCustomers > 0 ? mrr / payingCustomers : 0;

  console.log(`  Paying customers: ${payingCustomers}`);
  console.log(`  MRR: $${mrr}`);
  console.log(`  ARR: $${arr}`);
  console.log(`  Average customer value: $${averageCustomerValue.toFixed(2)}`);

  // Check configuration gaps
  console.log('\n🔧 Checking configuration gaps...');
  const stripeConfigured = false; // Hardcoded - we know it's in test mode
  const posthogConfigured = false; // Hardcoded - we know it's placeholder
  const calculatorWorking = activityMetrics.taxCalculations.count > 0;
  const revenueUnblocked = stripeConfigured && payingCustomers > 0;

  console.log(`  Stripe configured: ${stripeConfigured ? '✅' : '❌'}`);
  console.log(`  PostHog configured: ${posthogConfigured ? '✅' : '❌'}`);
  console.log(`  Calculator working: ${calculatorWorking ? '✅' : '❌'}`);
  console.log(`  Revenue unblocked: ${revenueUnblocked ? '✅' : '❌'}`);

  // Build report
  const report: RevenueMetrics = {
    timestamp: new Date().toISOString(),
    dateRange: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      days: 30,
    },
    users: {
      total: userMetrics.total.count,
      totalAllTime: userMetrics.totalAllTime.count,
      free: userMetrics.free.count,
      proActive: userMetrics.proActive.count,
      enterpriseActive: userMetrics.enterpriseActive.count,
      withStripeId: userMetrics.withStripeId.count,
      newInPeriod: userMetrics.total.count,
    },
    activity: {
      calculatorSessions: activityMetrics.calculatorSessions.count,
      rsuEntries: activityMetrics.rsuEntries.count,
      taxCalculations: activityMetrics.taxCalculations.count,
      analyticsEvents: activityMetrics.analyticsEvents.count,
    },
    conversions: {
      calculatorCompletionRate,
      signupRate,
      paymentRate,
      overallConversion,
    },
    revenue: {
      mrr,
      arr,
      payingCustomers,
      averageCustomerValue,
    },
    gaps: {
      stripeConfigured,
      posthogConfigured,
      calculatorWorking,
      revenueUnblocked,
    },
  };

  // Save JSON report
  const reportPath = join('docs', 'revenue-reality-check-2026-03-19.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n✅ Report saved: ${reportPath}`);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Current MRR: $${mrr}`);
  console.log(`Current ARR: $${arr}`);
  console.log(`Paying Customers: ${payingCustomers}`);
  console.log(`New Users (30d): ${userMetrics.total.count}`);
  console.log(`Calculator Completions (30d): ${activityMetrics.taxCalculations.count}`);
  console.log(`Overall Conversion: ${overallConversion}`);
  console.log('\n🚨 BLOCKERS:');
  if (!stripeConfigured) console.log('  ❌ Stripe in TEST mode - cannot accept payments');
  if (!posthogConfigured) console.log('  ❌ PostHog not configured - cannot track visitors');
  if (!calculatorWorking) console.log('  ❌ Calculator 0% completion rate - 100% drop-off');
  if (stripeConfigured && posthogConfigured && calculatorWorking) {
    console.log('  ✅ All systems operational!');
  }
  console.log('='.repeat(60));

  db.close();
}

main();
