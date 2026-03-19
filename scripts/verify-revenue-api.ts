/**
 * Revenue API Verification Script
 *
 * Tests the /api/analytics/revenue endpoint to ensure:
 * 1. API returns 200 OK
 * 2. All required metrics are present
 * 3. Data types are correct
 * 4. Metrics are within expected ranges
 *
 * Usage: npm run verify:revenue
 */

async function verifyRevenueAPI() {
  console.log('🔍 Testing Revenue API Endpoint...\n');

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const endpoint = `${baseUrl}/api/analytics/revenue`;

    console.log(`📡 Fetching: ${endpoint}`);
    const startTime = Date.now();

    const response = await fetch(endpoint);
    const duration = Date.now() - startTime;

    console.log(`⏱️  Response time: ${duration}ms`);

    if (!response.ok) {
      console.error(`❌ API returned ${response.status}: ${response.statusText}`);
      process.exit(1);
    }

    console.log('✅ API returned 200 OK\n');

    const data = await response.json();

    // Define expected metrics
    const requiredMetrics = [
      'mrr',
      'arr',
      'totalCustomers',
      'activeSubscriptions',
      'churnRate',
      'growthRate',
      'subscriptionsByTier',
      'revenueByTier',
      'newCustomersThisMonth',
      'churnedCustomersThisMonth',
      'lifetimeValue',
      'customerAcquisitionCost',
      'ltvcacRatio',
      'revenueByChannel',
      'customersByChannel',
    ];

    console.log('📊 Validating Metrics:\n');

    let allPassed = true;

    // Check all required metrics are present
    for (const metric of requiredMetrics) {
      if (data[metric] === undefined) {
        console.error(`❌ Missing metric: ${metric}`);
        allPassed = false;
      } else {
        console.log(`✅ ${metric}: Present`);
      }
    }

    console.log('\n💰 Revenue Metrics:\n');

    // Validate numeric metrics
    const numericMetrics = [
      'mrr',
      'arr',
      'totalCustomers',
      'activeSubscriptions',
      'churnRate',
      'growthRate',
      'newCustomersThisMonth',
      'churnedCustomersThisMonth',
      'lifetimeValue',
      'customerAcquisitionCost',
      'ltvcacRatio',
    ];

    for (const metric of numericMetrics) {
      const value = data[metric];
      if (typeof value !== 'number') {
        console.error(`❌ ${metric} is not a number: ${typeof value}`);
        allPassed = false;
      } else if (value < 0) {
        console.error(`❌ ${metric} is negative: ${value}`);
        allPassed = false;
      } else {
        console.log(`  ✅ ${metric}: ${value.toFixed(2)}`);
      }
    }

    console.log('\n📈 Business Metrics:\n');

    // Display key business metrics
    console.log(`  MRR: $${data.mrr.toFixed(2)}`);
    console.log(`  ARR: $${data.arr.toFixed(2)}`);
    console.log(`  Total Customers: ${data.totalCustomers}`);
    console.log(`  Active Subscriptions: ${data.activeSubscriptions}`);
    console.log(`  Churn Rate: ${data.churnRate.toFixed(1)}%`);
    console.log(`  Growth Rate: ${data.growthRate.toFixed(1)}%`);
    console.log(`  LTV: $${data.lifetimeValue.toFixed(2)}`);
    console.log(`  CAC: $${data.customerAcquisitionCost.toFixed(2)}`);
    console.log(`  LTV:CAC Ratio: ${data.ltvcacRatio.toFixed(2)}`);

    console.log('\n🎯 Health Check:\n');

    // Health checks
    if (data.arr === data.mrr * 12) {
      console.log('  ✅ ARR calculation correct (MRR × 12)');
    } else {
      console.error(`  ❌ ARR calculation wrong. Expected ${data.mrr * 12}, got ${data.arr}`);
      allPassed = false;
    }

    if (data.churnRate <= 5) {
      console.log('  ✅ Churn rate healthy (<5%)');
    } else if (data.churnRate <= 10) {
      console.log('  ⚠️  Churn rate elevated (5-10%)');
    } else {
      console.log('  ❌ Churn rate critical (>10%)');
    }

    if (data.ltvcacRatio >= 3) {
      console.log('  ✅ LTV:CAC ratio healthy (>3)');
    } else if (data.ltvcacRatio >= 1) {
      console.log('  ⚠️  LTV:CAC ratio marginal (1-3)');
    } else {
      console.log('  ❌ LTV:CAC ratio unprofitable (<1)');
    }

    console.log('\n🔗 Channel Breakdown:\n');

    // Display channel attribution
    const channels = ['organic', 'productHunt', 'paidAds', 'referral', 'direct'];
    for (const channel of channels) {
      const revenue = data.revenueByChannel[channel] || 0;
      const customers = data.customersByChannel[channel] || 0;
      console.log(`  ${channel}: $${revenue.toFixed(2)}/mo (${customers} customers)`);
    }

    console.log('\n📦 Subscription Tiers:\n');

    // Display tier breakdown
    console.log(`  Pro: ${data.subscriptionsByTier.pro} subscriptions ($${data.revenueByTier.pro.toFixed(2)}/mo)`);
    console.log(`  Enterprise: ${data.subscriptionsByTier.enterprise} subscriptions ($${data.revenueByTier.enterprise.toFixed(2)}/mo)`);

    console.log('\n' + '='.repeat(60) + '\n');

    if (allPassed) {
      console.log('✅ ALL TESTS PASSED - Revenue API is working correctly!');
      console.log(`\n📍 Dashboard: ${baseUrl}/admin/revenue\n`);
      process.exit(0);
    } else {
      console.error('❌ SOME TESTS FAILED - Review errors above');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error testing revenue API:', error);
    process.exit(1);
  }
}

// Run verification
verifyRevenueAPI();
