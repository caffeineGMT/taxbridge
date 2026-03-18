#!/usr/bin/env tsx

/**
 * Test script for email drip campaign
 * Creates test users and verifies email targeting logic
 */

import { getDatabase } from '../lib/db/index.js';
import { getUsersForDripEmail } from '../lib/db/queries/drip-campaign.js';

interface TestUser {
  email: string;
  first_name: string;
  created_at: string;
  email_preferences?: string;
}

/**
 * Create test users for each drip email day
 */
function createTestUsers() {
  const db = getDatabase();

  console.log('🧪 Creating test users for drip campaign...\n');

  const testUsers: TestUser[] = [
    // Day 0 - Welcome (created today)
    {
      email: 'welcome.test@example.com',
      first_name: 'Welcome',
      created_at: 'DATE(\'now\')',
    },
    // Day 3 - FTC Education
    {
      email: 'day3.test@example.com',
      first_name: 'Day3',
      created_at: 'DATE(\'now\', \'-3 days\')',
    },
    // Day 7 - Feature Highlight
    {
      email: 'day7.test@example.com',
      first_name: 'Day7',
      created_at: 'DATE(\'now\', \'-7 days\')',
    },
    // Day 14 - Upgrade Offer
    {
      email: 'day14.test@example.com',
      first_name: 'Day14',
      created_at: 'DATE(\'now\', \'-14 days\')',
    },
    // Unsubscribed user (should NOT receive emails)
    {
      email: 'unsubscribed.test@example.com',
      first_name: 'Unsubscribed',
      created_at: 'DATE(\'now\', \'-3 days\')',
      email_preferences: '{"marketing_emails": false}',
    },
  ];

  // Delete existing test users
  const deleteStmt = db.prepare(`
    DELETE FROM user_profiles
    WHERE email LIKE '%.test@example.com'
  `);
  const deleted = deleteStmt.run();
  console.log(`🗑️  Cleaned up ${deleted.changes} existing test users\n`);

  // Insert test users
  const insertStmt = db.prepare(`
    INSERT INTO user_profiles (email, first_name, last_name, us_state, canada_province, filing_status, created_at, email_preferences)
    VALUES (?, ?, 'User', 'WA', 'BC', 'single', ${testUsers[0].created_at}, ?)
  `);

  testUsers.forEach((user, index) => {
    const createdAt = index === 0 ? user.created_at : user.created_at;
    const clerkUserId = `test_${user.email.replace('@example.com', '')}`;
    const stmt = db.prepare(`
      INSERT INTO user_profiles (clerk_user_id, email, first_name, last_name, us_state, canada_province, filing_status, created_at, email_preferences)
      VALUES (?, ?, ?, 'User', 'WA', 'BC', 'single', ${createdAt}, ?)
    `);

    stmt.run(clerkUserId, user.email, user.first_name, user.email_preferences || null);
    console.log(`✓ Created: ${user.email} (${user.created_at})`);
  });

  console.log(`\n✅ Created ${testUsers.length} test users\n`);
}

/**
 * Test email targeting for each drip type
 */
function testEmailTargeting() {
  console.log('🎯 Testing email targeting logic...\n');

  const tests = [
    { eventType: 'drip_welcome' as const, dayOffset: 0, expectedEmail: 'welcome.test@example.com' },
    { eventType: 'drip_day3' as const, dayOffset: 3, expectedEmail: 'day3.test@example.com' },
    { eventType: 'drip_day7' as const, dayOffset: 7, expectedEmail: 'day7.test@example.com' },
    { eventType: 'drip_day14' as const, dayOffset: 14, expectedEmail: 'day14.test@example.com' },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    const users = getUsersForDripEmail(test.eventType, test.dayOffset);

    console.log(`\n📧 ${test.eventType} (Day ${test.dayOffset}):`);
    console.log(`   Expected: ${test.expectedEmail}`);
    console.log(`   Found: ${users.map(u => u.email).join(', ') || 'None'}`);

    // Check if expected user is in the results
    const hasExpected = users.some(u => u.email === test.expectedEmail);

    // Check if unsubscribed user is NOT in the results
    const hasUnsubscribed = users.some(u => u.email === 'unsubscribed.test@example.com');

    if (hasExpected && !hasUnsubscribed) {
      console.log(`   ✅ PASS - Correct targeting`);
      passed++;
    } else {
      console.log(`   ❌ FAIL - Incorrect targeting`);
      if (!hasExpected) {
        console.log(`      Missing expected user: ${test.expectedEmail}`);
      }
      if (hasUnsubscribed) {
        console.log(`      Included unsubscribed user (should be filtered out)`);
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
    console.log('\n⚠️  Some tests failed. Check the logic in lib/db/queries/drip-campaign.ts\n');
  }
}

/**
 * Display test user creation dates
 */
function displayUserDates() {
  const db = getDatabase();

  console.log('\n📅 Test User Creation Dates:\n');

  const users = db.prepare(`
    SELECT email, first_name, created_at, email_preferences
    FROM user_profiles
    WHERE email LIKE '%.test@example.com'
    ORDER BY created_at DESC
  `).all();

  users.forEach((user: any) => {
    const prefs = user.email_preferences ? JSON.parse(user.email_preferences) : {};
    const subscribed = prefs.marketing_emails !== false;
    console.log(`   ${user.email.padEnd(35)} | ${user.created_at} | ${subscribed ? '✓ Subscribed' : '✗ Unsubscribed'}`);
  });

  console.log('');
}

/**
 * Cleanup test users
 */
function cleanup() {
  const db = getDatabase();

  const stmt = db.prepare(`
    DELETE FROM user_profiles
    WHERE email LIKE '%.test@example.com'
  `);

  const result = stmt.run();
  console.log(`🧹 Cleaned up ${result.changes} test users\n`);
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
  console.log('║  Email Drip Campaign - Test Suite                     ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  createTestUsers();
  displayUserDates();
  testEmailTargeting();

  console.log('\n💡 Tips:');
  console.log('   - Run "npm run db:migrate" if migrations haven\'t been applied');
  console.log('   - Test manual trigger: curl http://localhost:3000/api/cron/email-drip');
  console.log('   - Cleanup test users: tsx scripts/test-email-drip.ts --cleanup');
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
