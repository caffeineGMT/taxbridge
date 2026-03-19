#!/usr/bin/env tsx
/**
 * Revenue Dashboard Verification Script
 *
 * Tests all revenue dashboard API endpoints and validates:
 * - Stripe customer count
 * - MRR calculation
 * - PostHog signup funnel
 * - Traffic sources attribution
 *
 * Usage: npm run verify:revenue-dashboard
 */

import fetch from 'node-fetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.vercel.app';
const LOCAL_URL = 'http://localhost:3000';

// Try production first, fall back to local
const BASE_URL = process.env.VERIFY_LOCAL === 'true' ? LOCAL_URL : API_BASE_URL;

interface TestResult {
  endpoint: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  data?: any;
}

const results: TestResult[] = [];

function logResult(result: TestResult) {
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${result.endpoint}: ${result.message}`);
  results.push(result);
}

async function testRevenueAPI() {
  console.log('\n📊 Testing Revenue API...\n');

  try {
    const response = await fetch(`${BASE_URL}/api/analytics/revenue`);

    if (!response.ok) {
      logResult({
        endpoint: '/api/analytics/revenue',
        status: 'FAIL',
        message: `HTTP ${response.status} - ${response.statusText}`,
      });
      return;
    }

    const data = await response.json();

    // Validate structure
    const requiredFields = ['mrr', 'arr', 'totalCustomers', 'activeSubscriptions', 'churnRate'];
    const missingFields = requiredFields.filter(field => !(field in data));

    if (missingFields.length > 0) {
      logResult({
        endpoint: '/api/analytics/revenue',
        status: 'FAIL',
        message: `Missing fields: ${missingFields.join(', ')}`,
      });
      return;
    }

    // Check if data is real (not all zeros)
    const hasRealData = data.mrr > 0 || data.activeSubscriptions > 0 || data.totalCustomers > 0;

    logResult({
      endpoint: '/api/analytics/revenue',
      status: 'PASS',
      message: `MRR: $${data.mrr}, Customers: ${data.totalCustomers}, Active Subs: ${data.activeSubscriptions}`,
      data: {
        mrr: data.mrr,
        arr: data.arr,
        totalCustomers: data.totalCustomers,
        activeSubscriptions: data.activeSubscriptions,
        hasRealData,
      },
    });

    // Channel attribution check
    if (data.revenueByChannel && data.customersByChannel) {
      const totalChannelRevenue = Object.values(data.revenueByChannel).reduce((a: any, b: any) => a + b, 0);
      logResult({
        endpoint: '/api/analytics/revenue (channels)',
        status: totalChannelRevenue > 0 ? 'PASS' : 'WARN',
        message: `Channel Revenue: $${totalChannelRevenue}/mo`,
        data: data.revenueByChannel,
      });
    }

  } catch (error: any) {
    logResult({
      endpoint: '/api/analytics/revenue',
      status: 'FAIL',
      message: `Error: ${error.message}`,
    });
  }
}

async function testFunnelAPI() {
  console.log('\n🔍 Testing Funnel API...\n');

  try {
    const response = await fetch(`${BASE_URL}/api/analytics/funnel?timeRange=30d`);

    if (!response.ok) {
      logResult({
        endpoint: '/api/analytics/funnel',
        status: 'FAIL',
        message: `HTTP ${response.status} - ${response.statusText}`,
      });
      return;
    }

    const data = await response.json();

    // Validate structure
    if (!Array.isArray(data.funnel) || data.funnel.length === 0) {
      logResult({
        endpoint: '/api/analytics/funnel',
        status: 'FAIL',
        message: 'Funnel data is empty or invalid',
      });
      return;
    }

    const funnelSteps = data.funnel.map((step: any) => `${step.name}: ${step.count}`).join(', ');

    logResult({
      endpoint: '/api/analytics/funnel',
      status: 'PASS',
      message: `${data.funnel.length} steps, Overall CR: ${data.overallConversionRate}%, Biggest drop: ${data.biggestDropOffStep} (${data.biggestDropOffRate}%)`,
      data: {
        steps: data.funnel.length,
        totalVisitors: data.totalVisitors,
        totalConversions: data.totalConversions,
        overallConversionRate: data.overallConversionRate,
      },
    });

    // Validate each funnel step
    data.funnel.forEach((step: any, index: number) => {
      if (!step.name || step.count === undefined || step.conversionRate === undefined) {
        logResult({
          endpoint: `/api/analytics/funnel (step ${index})`,
          status: 'WARN',
          message: `Step ${index} has missing data`,
        });
      }
    });

  } catch (error: any) {
    logResult({
      endpoint: '/api/analytics/funnel',
      status: 'FAIL',
      message: `Error: ${error.message}`,
    });
  }
}

async function testTrafficSourcesAPI() {
  console.log('\n📡 Testing Traffic Sources API...\n');

  try {
    const response = await fetch(`${BASE_URL}/api/analytics/traffic-sources?timeRange=30d`);

    if (!response.ok) {
      logResult({
        endpoint: '/api/analytics/traffic-sources',
        status: 'FAIL',
        message: `HTTP ${response.status} - ${response.statusText}`,
      });
      return;
    }

    const data = await response.json();

    // Validate structure
    if (!Array.isArray(data.sources)) {
      logResult({
        endpoint: '/api/analytics/traffic-sources',
        status: 'FAIL',
        message: 'Sources data is not an array',
      });
      return;
    }

    const channelSummary = data.sources
      .map((s: any) => `${s.channel}: ${s.signups} signups, $${s.revenue}/mo`)
      .join('; ');

    logResult({
      endpoint: '/api/analytics/traffic-sources',
      status: 'PASS',
      message: `${data.sources.length} channels tracked, Total: ${data.totalSignups} signups, $${data.totalRevenue}/mo`,
      data: {
        channels: data.sources.length,
        totalVisitors: data.totalVisitors,
        totalSignups: data.totalSignups,
        totalConversions: data.totalConversions,
        totalRevenue: data.totalRevenue,
        topChannel: data.topChannel,
      },
    });

    // Validate each source
    if (data.sources.length === 0) {
      logResult({
        endpoint: '/api/analytics/traffic-sources',
        status: 'WARN',
        message: 'No traffic sources found (expected at least Direct)',
      });
    }

  } catch (error: any) {
    logResult({
      endpoint: '/api/analytics/traffic-sources',
      status: 'FAIL',
      message: `Error: ${error.message}`,
    });
  }
}

async function testDashboardPage() {
  console.log('\n🎨 Testing Dashboard Page...\n');

  try {
    const response = await fetch(`${BASE_URL}/admin/revenue`);

    if (!response.ok) {
      logResult({
        endpoint: '/admin/revenue',
        status: 'FAIL',
        message: `HTTP ${response.status} - ${response.statusText}`,
      });
      return;
    }

    const html = await response.text();

    // Check for key elements
    const hasTitle = html.includes('CEO Revenue Dashboard') || html.includes('Revenue Dashboard');
    const hasMetrics = html.includes('MRR') || html.includes('ARR');
    const hasFunnel = html.includes('Conversion Funnel') || html.includes('funnel');

    if (!hasTitle && !hasMetrics && !hasFunnel) {
      logResult({
        endpoint: '/admin/revenue',
        status: 'WARN',
        message: 'Dashboard page loaded but content may be missing',
      });
      return;
    }

    logResult({
      endpoint: '/admin/revenue',
      status: 'PASS',
      message: 'Dashboard page renders successfully',
    });

  } catch (error: any) {
    logResult({
      endpoint: '/admin/revenue',
      status: 'FAIL',
      message: `Error: ${error.message}`,
    });
  }
}

async function main() {
  console.log('🚀 Revenue Dashboard Verification\n');
  console.log(`Testing against: ${BASE_URL}\n`);
  console.log('='.repeat(60));

  await testRevenueAPI();
  await testFunnelAPI();
  await testTrafficSourcesAPI();
  await testDashboardPage();

  console.log('\n' + '='.repeat(60));
  console.log('\n📋 Summary\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARN').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`📊 Total: ${results.length}`);

  if (failed > 0) {
    console.log('\n❌ VERIFICATION FAILED');
    console.log('\nFailed tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.endpoint}: ${r.message}`);
    });
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️  VERIFICATION PASSED WITH WARNINGS');
    console.log('\nWarnings:');
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`  - ${r.endpoint}: ${r.message}`);
    });
  } else {
    console.log('\n✅ ALL TESTS PASSED');
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📍 Next Steps:\n');
  console.log('1. Visit the dashboard: ' + BASE_URL + '/admin/revenue');
  console.log('2. Verify Stripe connection if MRR = $0');
  console.log('3. Check PostHog integration for funnel tracking');
  console.log('4. Monitor traffic sources for attribution data\n');
}

main().catch(console.error);
