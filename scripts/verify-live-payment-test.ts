/**
 * Live Payment Test - Database Verification Helper
 *
 * Quick verification script to check user subscription status during live testing.
 * Run at each step of the live payment test to verify database state.
 *
 * Usage:
 *   tsx scripts/verify-live-payment-test.ts [email]
 *   tsx scripts/verify-live-payment-test.ts youremail+livetest@gmail.com
 */

import { getDatabase } from '../lib/db';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '━'.repeat(80));
  log(`  ${title}`, 'bright');
  console.log('━'.repeat(80) + '\n');
}

interface UserProfile {
  id: number;
  clerk_user_id: string;
  email: string;
  subscription_tier: string;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: number;
  updated_at: number;
}

function verifyUser(email: string) {
  try {
    const db = getDatabase();

    logSection('🔍 Live Payment Test - User Verification');

    // Find user by email
    const user = db.prepare(`
      SELECT * FROM user_profiles
      WHERE email = ? OR email LIKE ?
    `).get(email, `%${email}%`) as UserProfile | undefined;

    if (!user) {
      log('❌ User not found', 'red');
      console.log(`   Email: ${email}`);
      console.log(`   Searched for: ${email} or %${email}%`);
      console.log('\n💡 Make sure the user account has been created first.');
      process.exit(1);
    }

    // Display user information
    log('✅ User Found', 'green');
    console.log(`\n📧 Email: ${colors.cyan}${user.email}${colors.reset}`);
    console.log(`🆔 User ID: ${colors.cyan}${user.id}${colors.reset}`);
    console.log(`👤 Clerk ID: ${colors.dim}${user.clerk_user_id}${colors.reset}`);

    // Subscription status
    logSection('💳 Subscription Status');

    const tier = user.subscription_tier;
    const tierColor = tier === 'pro' ? 'green' : tier === 'enterprise' ? 'magenta' : 'yellow';
    log(`Tier: ${tier.toUpperCase()}`, tierColor);

    const status = user.subscription_status || 'none';
    const statusColor = status === 'active' ? 'green' : status === 'canceled' ? 'red' : 'yellow';
    console.log(`Status: ${colors[statusColor]}${status}${colors.reset}`);

    // Stripe integration
    logSection('🔗 Stripe Integration');

    if (user.stripe_customer_id) {
      log(`✓ Customer ID: ${user.stripe_customer_id}`, 'green');
    } else {
      log('✗ No Stripe Customer ID', 'yellow');
    }

    if (user.stripe_subscription_id) {
      log(`✓ Subscription ID: ${user.stripe_subscription_id}`, 'green');
    } else {
      log('✗ No Stripe Subscription ID', 'yellow');
    }

    // RSU entries count
    const rsuCount = db.prepare(`
      SELECT COUNT(*) as count FROM rsu_entries WHERE user_id = ?
    `).get(user.id) as { count: number };

    logSection('📊 User Data');
    console.log(`RSU Entries: ${colors.cyan}${rsuCount.count}${colors.reset}`);

    // Timestamps
    const createdDate = new Date(user.created_at * 1000).toLocaleString();
    const updatedDate = new Date(user.updated_at * 1000).toLocaleString();
    console.log(`Created: ${colors.dim}${createdDate}${colors.reset}`);
    console.log(`Updated: ${colors.dim}${updatedDate}${colors.reset}`);

    // Test expectations
    logSection('🎯 Live Test Expectations');

    console.log('\n📝 Expected State Based on Tier:\n');

    if (tier === 'free') {
      log('FREE TIER:', 'yellow');
      console.log('  • No Stripe IDs (before payment)');
      console.log('  • Status: null or "canceled"');
      console.log('  • RSU Limit: 1 entry');
      console.log('  • PDF Export: Blocked (shows upgrade modal)');
    } else if (tier === 'pro') {
      log('PRO TIER:', 'green');
      console.log('  • Stripe Customer ID: Required');
      console.log('  • Stripe Subscription ID: Required');
      console.log('  • Status: "active"');
      console.log('  • RSU Limit: Unlimited');
      console.log('  • PDF Export: Enabled');
    } else if (tier === 'enterprise') {
      log('ENTERPRISE TIER:', 'magenta');
      console.log('  • Stripe Customer ID: Required');
      console.log('  • Stripe Subscription ID: Required');
      console.log('  • Status: "active"');
      console.log('  • All Features: Enabled');
    }

    // Validation checks
    logSection('✅ Validation Checks');

    const checks = [
      {
        name: 'User exists',
        pass: !!user,
        expected: 'User profile created',
        actual: user ? 'Found' : 'Not found',
      },
      {
        name: 'Email matches',
        pass: user.email.includes(email.replace('%', '')),
        expected: email,
        actual: user.email,
      },
      {
        name: 'Tier is valid',
        pass: ['free', 'pro', 'enterprise'].includes(tier),
        expected: 'free, pro, or enterprise',
        actual: tier,
      },
    ];

    // Tier-specific checks
    if (tier === 'pro' || tier === 'enterprise') {
      checks.push({
        name: 'Has Stripe Customer ID',
        pass: !!user.stripe_customer_id,
        expected: 'cus_...',
        actual: user.stripe_customer_id || 'NULL',
      });
      checks.push({
        name: 'Has Stripe Subscription ID',
        pass: !!user.stripe_subscription_id,
        expected: 'sub_...',
        actual: user.stripe_subscription_id || 'NULL',
      });
      checks.push({
        name: 'Status is active',
        pass: user.subscription_status === 'active',
        expected: 'active',
        actual: user.subscription_status || 'NULL',
      });
    }

    checks.forEach((check) => {
      const icon = check.pass ? '✓' : '✗';
      const color = check.pass ? 'green' : 'red';
      log(`${icon} ${check.name}`, color);
      if (!check.pass) {
        console.log(`  Expected: ${check.expected}`);
        console.log(`  Actual: ${check.actual}`);
      }
    });

    const allPassed = checks.every((c) => c.pass);

    console.log('\n' + '━'.repeat(80));
    if (allPassed) {
      log('✅ ALL CHECKS PASSED', 'green');
    } else {
      log('⚠️  SOME CHECKS FAILED', 'yellow');
      console.log('Review the failed checks above.');
    }
    console.log('━'.repeat(80) + '\n');

    // Copy-paste friendly output
    logSection('📋 Copy-Paste Summary');
    console.log(`User ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Tier: ${user.subscription_tier}`);
    console.log(`Status: ${user.subscription_status || 'none'}`);
    console.log(`Customer ID: ${user.stripe_customer_id || 'NULL'}`);
    console.log(`Subscription ID: ${user.stripe_subscription_id || 'NULL'}`);
    console.log(`RSU Count: ${rsuCount.count}`);

    console.log('\n');

    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    log('\n❌ Error during verification:', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Main
const email = process.argv[2];

if (!email) {
  log('❌ Email parameter required', 'red');
  console.log('\nUsage:');
  console.log('  tsx scripts/verify-live-payment-test.ts <email>');
  console.log('\nExample:');
  console.log('  tsx scripts/verify-live-payment-test.ts youremail+livetest@gmail.com');
  console.log('  tsx scripts/verify-live-payment-test.ts livetest');
  process.exit(1);
}

verifyUser(email);
