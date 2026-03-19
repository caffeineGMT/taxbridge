#!/usr/bin/env tsx

/**
 * Test Script for Re-engagement Email Campaign
 *
 * Tests:
 * - User targeting (calculator users who didn't convert)
 * - Email template generation
 * - Database recording (email_events, calculator_sessions, email_conversions)
 * - Conversion tracking
 * - Analytics queries
 */

import { getDatabase } from '@/lib/db';
import {
  getUsersForReengagement,
  recordCalculatorSession,
  recordReengagementEmailSent,
  trackEmailConversion,
  getReengagementMetrics,
  getDiscountCodeStats,
  getCohortAnalysis,
} from '@/lib/db/queries/reengagement-campaign';
import {
  getReengagementDay3EmailData,
  getReengagementDay7EmailData,
  getReengagementDay14EmailData,
} from '@/lib/email/reengagement-campaign-templates';

interface TestUser {
  email: string;
  first_name: string;
  first_calculation_date: string;
  is_paid: boolean;
}

/**
 * Create test users for re-engagement campaign
 */
function createTestUsers() {
  const db = getDatabase();

  console.log('🧪 Creating test users for re-engagement campaign...\n');

  const testUsers: TestUser[] = [
    // Day 3 - Calculator user who didn't convert
    {
      email: 'reengagement.day3@example.com',
      first_name: 'Day3User',
      first_calculation_date: 'DATE(\'now\', \'-3 days\')',
      is_paid: false,
    },
    // Day 7 - Calculator user who didn't convert
    {
      email: 'reengagement.day7@example.com',
      first_name: 'Day7User',
      first_calculation_date: 'DATE(\'now\', \'-7 days\')',
      is_paid: false,
    },
    // Day 14 - Calculator user who didn't convert
    {
      email: 'reengagement.day14@example.com',
      first_name: 'Day14User',
      first_calculation_date: 'DATE(\'now\', \'-14 days\')',
      is_paid: false,
    },
    // Paid user (should NOT receive re-engagement emails)
    {
      email: 'paid.user@example.com',
      first_name: 'PaidUser',
      first_calculation_date: 'DATE(\'now\', \'-3 days\')',
      is_paid: true,
    },
    // Recent user (too early for re-engagement)
    {
      email: 'recent.user@example.com',
      first_name: 'RecentUser',
      first_calculation_date: 'DATE(\'now\', \'-1 day\')',
      is_paid: false,
    },
  ];

  // Delete existing test users
  const deleteUserStmt = db.prepare(`
    DELETE FROM user_profiles
    WHERE email LIKE '%@example.com'
  `);
  const deleted = deleteUserStmt.run();
  console.log(`🗑️  Cleaned up ${deleted.changes} existing test users\n`);

  // Insert test users and calculator sessions
  testUsers.forEach((user) => {
    // Insert user profile
    const insertUserStmt = db.prepare(`
      INSERT INTO user_profiles (
        clerk_user_id,
        email,
        first_name,
        last_name,
        us_state,
        canada_province,
        filing_status,
        subscription_status,
        created_at,
        email_preferences
      )
      VALUES (?, ?, ?, 'User', 'WA', 'BC', 'single', ?, DATE('now', '-30 days'), ?)
    `);

    const clerkUserId = `test_${user.email.replace('@example.com', '')}`;
    const subscriptionStatus = user.is_paid ? 'active' : null;
    const emailPrefs = '{"marketing_emails": true}';

    insertUserStmt.run(clerkUserId, user.email, user.first_name, subscriptionStatus, emailPrefs);

    // Get user ID
    const userId = db.prepare('SELECT id FROM user_profiles WHERE email = ?').get(user.email) as { id: number };

    // Insert calculator session
    const insertSessionStmt = db.prepare(`
      INSERT INTO calculator_sessions (
        user_id,
        session_id,
        first_calculation_at,
        last_calculation_at,
        total_calculations,
        converted_to_paid,
        created_at
      )
      VALUES (?, ?, ${user.first_calculation_date}, ${user.first_calculation_date}, 3, ?, ${user.first_calculation_date})
    `);

    insertSessionStmt.run(userId.id, `session_${user.email}`, user.is_paid ? 1 : 0);

    console.log(`✓ Created: ${user.email} (calculated ${user.first_calculation_date}, paid: ${user.is_paid})`);
  });

  console.log(`\n✅ Created ${testUsers.length} test users\n`);
}

/**
 * Test email targeting logic
 */
function testEmailTargeting() {
  console.log('🎯 Testing re-engagement email targeting logic...\n');

  const tests = [
    {
      eventType: 'reengagement_day3' as const,
      dayOffset: 3 as const,
      expectedEmail: 'reengagement.day3@example.com',
      shouldNotInclude: ['paid.user@example.com', 'recent.user@example.com'],
    },
    {
      eventType: 'reengagement_day7' as const,
      dayOffset: 7 as const,
      expectedEmail: 'reengagement.day7@example.com',
      shouldNotInclude: ['paid.user@example.com', 'recent.user@example.com'],
    },
    {
      eventType: 'reengagement_day14' as const,
      dayOffset: 14 as const,
      expectedEmail: 'reengagement.day14@example.com',
      shouldNotInclude: ['paid.user@example.com', 'recent.user@example.com'],
    },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test) => {
    const users = getUsersForReengagement(test.dayOffset, test.eventType);

    console.log(`\n📧 ${test.eventType} (Day ${test.dayOffset}):`);
    console.log(`   Expected: ${test.expectedEmail}`);
    console.log(`   Found: ${users.map((u) => u.email).join(', ') || 'None'}`);

    // Check if expected user is in the results
    const hasExpected = users.some((u) => u.email === test.expectedEmail);

    // Check if paid/recent users are NOT in the results
    const hasUnwanted = users.some((u) => test.shouldNotInclude.includes(u.email));

    if (hasExpected && !hasUnwanted) {
      console.log(`   ✅ PASS - Correct targeting`);
      passed++;
    } else {
      console.log(`   ❌ FAIL - Incorrect targeting`);
      if (!hasExpected) {
        console.log(`      Missing expected user: ${test.expectedEmail}`);
      }
      if (hasUnwanted) {
        console.log(`      Included unwanted users (paid/recent)`);
      }
      failed++;
    }
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('\n✨ All tests passed! Email targeting is working correctly.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logic in lib/db/queries/reengagement-campaign.ts\n');
  }
}

/**
 * Test email template generation
 */
function testEmailTemplates() {
  console.log('\n📝 Testing email template generation...\n');

  const testParams = {
    firstName: 'John',
    email: 'test@example.com',
    calculationsSaved: 3,
    estimatedTaxSavings: 8500,
    discountCode: 'SAVE20',
  };

  let passed = 0;
  let failed = 0;

  // Test Day 3 template
  try {
    const day3 = getReengagementDay3EmailData(testParams);
    if (day3.subject && day3.html && day3.text && day3.data) {
      console.log('✅ Day 3 template generated successfully');
      console.log(`   Subject: ${day3.subject}`);
      passed++;
    } else {
      console.log('❌ Day 3 template missing fields');
      failed++;
    }
  } catch (error) {
    console.log('❌ Day 3 template error:', error);
    failed++;
  }

  // Test Day 7 template
  try {
    const day7 = getReengagementDay7EmailData(testParams);
    if (day7.subject && day7.html && day7.text && day7.data && day7.data.discountCode === 'SAVE20') {
      console.log('✅ Day 7 template generated successfully');
      console.log(`   Subject: ${day7.subject}`);
      console.log(`   Discount Code: ${day7.data.discountCode}`);
      passed++;
    } else {
      console.log('❌ Day 7 template missing fields or discount code');
      failed++;
    }
  } catch (error) {
    console.log('❌ Day 7 template error:', error);
    failed++;
  }

  // Test Day 14 template
  try {
    const day14 = getReengagementDay14EmailData(testParams);
    if (day14.subject && day14.html && day14.text && day14.data && day14.data.discountCode === 'SAVE20') {
      console.log('✅ Day 14 template generated successfully');
      console.log(`   Subject: ${day14.subject}`);
      console.log(`   Discount Code: ${day14.data.discountCode}`);
      passed++;
    } else {
      console.log('❌ Day 14 template missing fields or discount code');
      failed++;
    }
  } catch (error) {
    console.log('❌ Day 14 template error:', error);
    failed++;
  }

  console.log(`\n📊 Template Tests: ${passed} passed, ${failed} failed\n`);
}

/**
 * Test conversion tracking
 */
function testConversionTracking() {
  console.log('\n💰 Testing conversion tracking...\n');

  const db = getDatabase();

  // Get a test user
  const testUser = db.prepare(`
    SELECT id FROM user_profiles WHERE email = 'reengagement.day3@example.com'
  `).get() as { id: number } | undefined;

  if (!testUser) {
    console.log('❌ Test user not found. Run createTestUsers() first.');
    return;
  }

  // Record a re-engagement email sent
  const emailEventId = recordReengagementEmailSent(
    testUser.id,
    'reengagement_day7',
    { test: true },
    'A',
    'reengagement_day7'
  );

  console.log(`✓ Email event recorded (ID: ${emailEventId})`);

  // Track a conversion
  const conversionSuccess = trackEmailConversion({
    userId: testUser.id,
    conversionType: 'free_to_pro',
    revenueAmount: 39.20,
    discountCode: 'SAVE20',
    metadata: { test: true },
  });

  if (conversionSuccess) {
    console.log('✅ Conversion tracked successfully');

    // Verify conversion was recorded
    const conversion = db.prepare(`
      SELECT * FROM email_conversions WHERE user_id = ?
    `).get(testUser.id) as any;

    if (conversion) {
      console.log(`   Conversion Type: ${conversion.conversion_type}`);
      console.log(`   Revenue: $${conversion.revenue_amount}`);
      console.log(`   Discount Code: ${conversion.discount_code}`);
      console.log(`   Email Event ID: ${conversion.email_event_id}`);
    }
  } else {
    console.log('❌ Conversion tracking failed');
  }

  console.log('');
}

/**
 * Test analytics queries
 */
function testAnalytics() {
  console.log('\n📊 Testing analytics queries...\n');

  try {
    // Test metrics
    const metrics = getReengagementMetrics();
    console.log(`✅ Metrics query returned ${metrics.length} rows`);
    if (metrics.length > 0) {
      metrics.forEach((m) => {
        console.log(`   ${m.event_type}: ${m.total_sent} sent, ${m.conversion_rate}% conversion`);
      });
    }

    // Test discount stats
    const discountStats = getDiscountCodeStats();
    console.log(`\n✅ Discount stats query returned ${discountStats.length} rows`);
    if (discountStats.length > 0) {
      discountStats.forEach((d) => {
        console.log(`   ${d.discount_code}: ${d.total_conversions} conversions, $${d.total_revenue} revenue`);
      });
    }

    // Test cohort analysis
    const cohorts = getCohortAnalysis(4);
    console.log(`\n✅ Cohort analysis query returned ${cohorts.length} rows`);
    if (cohorts.length > 0) {
      cohorts.slice(0, 3).forEach((c) => {
        console.log(`   ${c.cohort_week}: ${c.total_calculator_users} users, ${c.conversion_rate}% conversion`);
      });
    }
  } catch (error) {
    console.error('❌ Analytics query error:', error);
  }

  console.log('');
}

/**
 * Cleanup test data
 */
function cleanup() {
  const db = getDatabase();

  console.log('🧹 Cleaning up test data...\n');

  const tables = ['email_conversions', 'email_events', 'calculator_sessions', 'user_profiles'];

  tables.forEach((table) => {
    const stmt = db.prepare(`
      DELETE FROM ${table}
      WHERE user_id IN (SELECT id FROM user_profiles WHERE email LIKE '%@example.com')
        OR email LIKE '%@example.com'
    `);

    try {
      const result = stmt.run();
      console.log(`✓ Cleaned ${table}: ${result.changes} rows`);
    } catch (error) {
      // Ignore errors for tables that don't have the column
    }
  });

  console.log('\n✅ Cleanup complete\n');
}

/**
 * Main test execution
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--cleanup')) {
    cleanup();
    return;
  }

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Re-engagement Email Campaign - Test Suite            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  createTestUsers();
  testEmailTargeting();
  testEmailTemplates();
  testConversionTracking();
  testAnalytics();

  console.log('\n💡 Tips:');
  console.log('   - Run migration: npm run db:migrate');
  console.log('   - Test cron: curl http://localhost:3000/api/cron/reengagement-campaign');
  console.log('   - View analytics: curl http://localhost:3000/api/analytics/reengagement');
  console.log('   - Cleanup: tsx scripts/test-reengagement-campaign.ts --cleanup');
  console.log('');
}

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}
