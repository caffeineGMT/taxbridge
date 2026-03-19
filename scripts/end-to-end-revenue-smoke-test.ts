/**
 * END-TO-END REVENUE SMOKE TEST
 *
 * Complete production payment flow test with REAL credit card:
 * 1. ✅ Prerequisites verification
 * 2. 📋 Calculator completion (manual)
 * 3. 👤 User signup (manual)
 * 4. 💳 Checkout & payment (manual + automated verification)
 * 5. 🔍 Stripe dashboard verification (guided)
 * 6. ✅ Access verification (automated)
 * 7. 💰 Refund (automated)
 * 8. 📄 Generate test report
 *
 * ⚠️  CRITICAL: This uses LIVE Stripe mode - REAL money will be charged
 * ⚠️  You will be charged $49/year (Basic) or $79/year (Pro)
 * ⚠️  Refund will be issued automatically at the end
 *
 * Usage: npx tsx scripts/end-to-end-revenue-smoke-test.ts
 *
 * Timeline: ~30 minutes
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { getDatabase } from '../lib/db';

// Load production environment
dotenv.config({ path: '.env.production' });
dotenv.config({ path: '.env.local' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

interface TestResult {
  timestamp: string;
  step: string;
  status: 'PASS' | 'FAIL' | 'SKIP' | 'MANUAL';
  details: any;
  duration?: number;
  error?: string;
}

const testResults: TestResult[] = [];
let stripe: Stripe;

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string, icon: string = '📋') {
  console.log('\n' + '━'.repeat(80));
  log(`${icon} ${title}`, 'bright');
  console.log('━'.repeat(80) + '\n');
}

function recordResult(step: string, status: TestResult['status'], details: any, error?: string) {
  testResults.push({
    timestamp: new Date().toISOString(),
    step,
    status,
    details,
    error,
  });
}

async function step1_Prerequisites(): Promise<boolean> {
  logSection('STEP 1: Prerequisites Verification', '🔍');

  const startTime = Date.now();

  try {
    // Check environment variables
    const requiredVars = [
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'STRIPE_BASIC_PRICE_ID',
      'STRIPE_PRO_PRICE_ID',
      'NEXT_PUBLIC_APP_URL',
    ];

    const missingVars = requiredVars.filter(v => {
      const value = process.env[v];
      return !value || value.includes('YOUR_') || value.includes('XXXXX');
    });

    if (missingVars.length > 0) {
      log('❌ Missing or placeholder environment variables:', 'red');
      missingVars.forEach(v => console.log(`   • ${v}`));
      recordResult('Prerequisites', 'FAIL', { missingVars }, 'Environment variables not configured');
      return false;
    }

    // Verify LIVE mode
    const isLiveMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') &&
                       process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_');

    if (!isLiveMode) {
      log('❌ Stripe is in TEST mode (requires LIVE mode)', 'red');
      recordResult('Prerequisites', 'FAIL', { mode: 'TEST' }, 'Stripe not in LIVE mode');
      return false;
    }

    // Test Stripe API connection
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
      typescript: true,
    });

    const account = await stripe.accounts.retrieve();

    // Test database connection
    const db = getDatabase();
    const dbTest = db.prepare('SELECT 1 as test').get() as { test: number };

    if (dbTest.test !== 1) {
      throw new Error('Database connection failed');
    }

    // Test production site accessibility
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const siteResponse = await fetch(appUrl);

    if (!siteResponse.ok) {
      log(`⚠️  Production site returned ${siteResponse.status}`, 'yellow');
    }

    log('✅ All prerequisites met', 'green');
    console.log(`   Stripe Account: ${account.business_profile?.name || account.id}`);
    console.log(`   Mode: LIVE`);
    console.log(`   Production URL: ${appUrl}`);
    console.log(`   Database: Connected`);

    const duration = Date.now() - startTime;
    recordResult('Prerequisites', 'PASS', {
      stripeAccountId: account.id,
      mode: 'LIVE',
      appUrl,
      databaseConnected: true,
    });

    return true;
  } catch (error) {
    log(`❌ Prerequisites check failed: ${error instanceof Error ? error.message : String(error)}`, 'red');
    recordResult('Prerequisites', 'FAIL', {}, error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function step2_CalculatorCompletion(): Promise<{ email: string; yearlyIncome: number; rsuValue: number }> {
  logSection('STEP 2: Calculator Completion (Manual)', '📊');

  console.log('Manual Steps:');
  console.log('1. Open browser and navigate to: ' + colors.cyan + process.env.NEXT_PUBLIC_APP_URL + colors.reset);
  console.log('2. Complete the tax calculator with test data');
  console.log('3. Recommended test data:');
  console.log('   • Visa Type: H-1B');
  console.log('   • Yearly Income: $150,000');
  console.log('   • RSU Value: $50,000');
  console.log('   • Canadian Province: Ontario');
  console.log('   • Working remotely from Canada: Yes\n');

  const continueTest = await question('Have you completed the calculator? (yes/no): ');
  if (continueTest.toLowerCase() !== 'yes') {
    log('⏭️  Test cancelled at calculator step', 'yellow');
    recordResult('Calculator Completion', 'SKIP', {}, 'User cancelled');
    process.exit(0);
  }

  // Collect test data for report
  const email = await question('Enter the email you will use for signup (for verification): ');
  const yearlyIncome = parseInt(await question('Enter yearly income used ($): ') || '150000');
  const rsuValue = parseInt(await question('Enter RSU value used ($): ') || '50000');

  log('✅ Calculator completion recorded', 'green');
  recordResult('Calculator Completion', 'MANUAL', { email, yearlyIncome, rsuValue });

  return { email, yearlyIncome, rsuValue };
}

async function step3_UserSignup(email: string): Promise<string> {
  logSection('STEP 3: User Signup (Manual)', '👤');

  console.log('Manual Steps:');
  console.log('1. Click "Sign Up" or "Create Account"');
  console.log(`2. Use email: ${colors.cyan}${email}${colors.reset}`);
  console.log('3. Complete the signup process');
  console.log('4. Verify email if required\n');

  const signupDone = await question('Have you completed signup and are logged in? (yes/no): ');
  if (signupDone.toLowerCase() !== 'yes') {
    log('⏭️  Test cancelled at signup step', 'yellow');
    recordResult('User Signup', 'SKIP', { email }, 'User cancelled');
    process.exit(0);
  }

  // Verify user exists in database
  try {
    const db = getDatabase();
    const user = db.prepare('SELECT * FROM user_profiles WHERE email = ?').get(email) as any;

    if (!user) {
      log('⚠️  User not found in database yet (may take a few seconds)', 'yellow');
      console.log('   Waiting 10 seconds for Clerk webhook to sync...\n');
      await new Promise(resolve => setTimeout(resolve, 10000));

      const userRetry = db.prepare('SELECT * FROM user_profiles WHERE email = ?').get(email) as any;
      if (!userRetry) {
        log('❌ User still not found in database', 'red');
        recordResult('User Signup', 'FAIL', { email }, 'User not found in database');
        return '';
      }

      log('✅ User found in database', 'green');
      console.log(`   User ID: ${userRetry.id}`);
      console.log(`   Tier: ${userRetry.subscription_tier}`);
      recordResult('User Signup', 'PASS', {
        email,
        userId: userRetry.id,
        tier: userRetry.subscription_tier,
      });

      return userRetry.clerk_user_id;
    }

    log('✅ User found in database', 'green');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Tier: ${user.subscription_tier}`);
    recordResult('User Signup', 'PASS', {
      email,
      userId: user.id,
      tier: user.subscription_tier,
    });

    return user.clerk_user_id;
  } catch (error) {
    log(`⚠️  Could not verify user in database: ${error instanceof Error ? error.message : String(error)}`, 'yellow');
    recordResult('User Signup', 'MANUAL', { email }, 'Database verification skipped');
    return '';
  }
}

async function step4_CheckoutAndPayment(email: string): Promise<{
  sessionId: string;
  subscriptionId: string;
  customerId: string;
  amountPaid: number;
}> {
  logSection('STEP 4: Checkout & Payment (Manual + Automated)', '💳');

  // Ask which plan to test
  console.log('Which subscription plan do you want to test?');
  console.log('1. Basic - $49/year (5 RSU entries)');
  console.log('2. Pro - $79/year (Unlimited RSUs, all features)\n');

  const planChoice = await question('Enter 1 or 2: ');
  const priceId = planChoice === '1'
    ? process.env.STRIPE_BASIC_PRICE_ID!
    : process.env.STRIPE_PRO_PRICE_ID!;
  const planName = planChoice === '1' ? 'Basic' : 'Pro';
  const expectedAmount = planChoice === '1' ? 49 : 79;

  console.log(`\n${colors.cyan}Testing ${planName} plan ($${expectedAmount}/year)${colors.reset}\n`);

  console.log('Manual Steps:');
  console.log('1. Navigate to the Pricing page');
  console.log(`2. Click "Subscribe" for the ${planName} plan`);
  console.log('3. Complete Stripe Checkout with a REAL credit card');
  console.log('4. Return to this terminal after payment completes\n');

  log('⚠️  You will be charged $' + expectedAmount + ' to your REAL credit card', 'yellow');
  log('⚠️  A refund will be issued automatically at the end of this test\n', 'yellow');

  const proceedPayment = await question('Ready to proceed with payment? (yes/no): ');
  if (proceedPayment.toLowerCase() !== 'yes') {
    log('⏭️  Test cancelled before payment', 'yellow');
    recordResult('Checkout & Payment', 'SKIP', { planName }, 'User cancelled');
    process.exit(0);
  }

  console.log('\n⏳ Waiting for payment to complete...');
  console.log('   (This script will poll Stripe for the payment)\n');

  await question('Press Enter when you have completed the payment in your browser... ');

  // Poll Stripe for recent checkout sessions
  console.log('\n🔍 Searching for your payment in Stripe...\n');

  const maxAttempts = 20;
  let attempt = 0;
  let session: Stripe.Checkout.Session | null = null;

  while (attempt < maxAttempts) {
    attempt++;

    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
      expand: ['data.subscription', 'data.customer'],
    });

    // Find session matching this test
    session = sessions.data.find(s =>
      s.customer_email === email &&
      s.payment_status === 'paid' &&
      (s.created * 1000) > (Date.now() - 600000) // Within last 10 minutes
    ) || null;

    if (session) {
      log('✅ Payment found!', 'green');
      break;
    }

    process.stdout.write(`\r   Attempt ${attempt}/${maxAttempts}... `);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  if (!session) {
    log('\n❌ Payment not found in Stripe', 'red');
    console.log('\nPlease check:');
    console.log('  • Payment actually completed?');
    console.log('  • Correct email used?');
    console.log('  • Check Stripe Dashboard: https://dashboard.stripe.com/payments');

    recordResult('Checkout & Payment', 'FAIL', { email, planName }, 'Payment not found');
    throw new Error('Payment not found');
  }

  console.log('');
  console.log(`   Session ID: ${colors.cyan}${session.id}${colors.reset}`);
  console.log(`   Customer: ${colors.cyan}${typeof session.customer === 'string' ? session.customer : session.customer?.id}${colors.reset}`);
  console.log(`   Amount Paid: ${colors.green}$${(session.amount_total || 0) / 100}${colors.reset}`);
  console.log(`   Status: ${colors.green}${session.payment_status}${colors.reset}`);

  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id || '';

  const customerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id || '';

  recordResult('Checkout & Payment', 'PASS', {
    sessionId: session.id,
    subscriptionId,
    customerId,
    amountPaid: (session.amount_total || 0) / 100,
    planName,
  });

  return {
    sessionId: session.id,
    subscriptionId,
    customerId,
    amountPaid: (session.amount_total || 0) / 100,
  };
}

async function step5_StripeDashboardVerification(sessionId: string): Promise<boolean> {
  logSection('STEP 5: Stripe Dashboard Verification (Guided)', '🔍');

  console.log('Manual Verification Steps:\n');

  console.log('1️⃣  Verify Payment in Stripe Dashboard:');
  console.log(`   ${colors.cyan}https://dashboard.stripe.com/payments${colors.reset}`);
  console.log(`   • Search for session: ${sessionId}`);
  console.log(`   • Status should be: ${colors.green}Succeeded${colors.reset}`);
  console.log('');

  console.log('2️⃣  Verify Subscription Created:');
  console.log(`   ${colors.cyan}https://dashboard.stripe.com/subscriptions${colors.reset}`);
  console.log(`   • Look for the newest subscription`);
  console.log(`   • Status should be: ${colors.green}Active${colors.reset}`);
  console.log('');

  console.log('3️⃣  Verify Webhook Delivery:');
  console.log(`   ${colors.cyan}https://dashboard.stripe.com/webhooks${colors.reset}`);
  console.log(`   • Click on your webhook endpoint`);
  console.log(`   • Check recent events for: ${colors.cyan}checkout.session.completed${colors.reset}`);
  console.log(`   • Status should be: ${colors.green}Succeeded${colors.reset}`);
  console.log('');

  // Automated verification
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    const subscription = typeof session.subscription === 'object' && session.subscription
      ? session.subscription
      : await stripe.subscriptions.retrieve(session.subscription as string);

    log('✅ Automated Verification:', 'green');
    console.log(`   Payment Status: ${session.payment_status}`);
    console.log(`   Subscription Status: ${subscription.status}`);
    console.log(`   Subscription ID: ${subscription.id}`);

    // Check webhook events
    const events = await stripe.events.list({
      type: 'checkout.session.completed',
      limit: 10,
    });

    const webhookEvent = events.data.find(e => {
      const data = e.data.object as Stripe.Checkout.Session;
      return data.id === sessionId;
    });

    if (webhookEvent) {
      log('   Webhook Event: Found', 'green');
    } else {
      log('   Webhook Event: Not found (may take a few seconds)', 'yellow');
    }

  } catch (error) {
    log(`⚠️  Automated verification failed: ${error instanceof Error ? error.message : String(error)}`, 'yellow');
  }

  console.log('');
  const dashboardConfirm = await question('Have you verified all items in Stripe Dashboard? (yes/no): ');

  if (dashboardConfirm.toLowerCase() !== 'yes') {
    log('⚠️  Dashboard verification skipped', 'yellow');
    recordResult('Stripe Dashboard Verification', 'SKIP', { sessionId }, 'User skipped');
    return false;
  }

  log('✅ Stripe Dashboard verification complete', 'green');
  recordResult('Stripe Dashboard Verification', 'PASS', { sessionId });
  return true;
}

async function step6_AccessVerification(email: string): Promise<boolean> {
  logSection('STEP 6: Access Verification (Automated)', '✅');

  try {
    const db = getDatabase();
    const user = db.prepare('SELECT * FROM user_profiles WHERE email = ?').get(email) as any;

    if (!user) {
      log('❌ User not found in database', 'red');
      recordResult('Access Verification', 'FAIL', { email }, 'User not found');
      return false;
    }

    // Verify subscription tier upgraded
    const expectedTiers = ['pro', 'basic'];
    if (!expectedTiers.includes(user.subscription_tier)) {
      log(`❌ User tier not upgraded. Current: ${user.subscription_tier}`, 'red');
      recordResult('Access Verification', 'FAIL', {
        email,
        tier: user.subscription_tier,
        expected: expectedTiers,
      }, 'Tier not upgraded');
      return false;
    }

    // Verify subscription status
    if (user.subscription_status !== 'active') {
      log(`❌ Subscription not active. Current: ${user.subscription_status}`, 'red');
      recordResult('Access Verification', 'FAIL', {
        email,
        status: user.subscription_status,
      }, 'Subscription not active');
      return false;
    }

    // Verify Stripe IDs present
    if (!user.stripe_customer_id || !user.stripe_subscription_id) {
      log('❌ Stripe IDs not saved to database', 'red');
      recordResult('Access Verification', 'FAIL', {
        email,
        customerId: user.stripe_customer_id,
        subscriptionId: user.stripe_subscription_id,
      }, 'Stripe IDs missing');
      return false;
    }

    log('✅ Database verification passed', 'green');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Tier: ${colors.green}${user.subscription_tier}${colors.reset}`);
    console.log(`   Status: ${colors.green}${user.subscription_status}${colors.reset}`);
    console.log(`   Stripe Customer: ${user.stripe_customer_id}`);
    console.log(`   Stripe Subscription: ${user.stripe_subscription_id}`);

    console.log('\n📋 Manual Access Verification:\n');
    console.log('Please verify in your browser:');
    console.log('1. Dashboard shows upgraded tier badge');
    console.log('2. Can add more than 1 RSU entry (for Basic tier: max 5, Pro tier: unlimited)');
    console.log('3. PDF export button is enabled (not showing upgrade modal)');
    console.log('4. Multi-year dashboard is accessible (Pro tier only)');
    console.log('');

    const accessConfirm = await question('Have you verified access to paid features? (yes/no): ');

    if (accessConfirm.toLowerCase() !== 'yes') {
      log('⚠️  Access verification incomplete', 'yellow');
      recordResult('Access Verification', 'MANUAL', {
        email,
        tier: user.subscription_tier,
        status: user.subscription_status,
      });
      return false;
    }

    log('✅ Access verification complete', 'green');
    recordResult('Access Verification', 'PASS', {
      email,
      userId: user.id,
      tier: user.subscription_tier,
      status: user.subscription_status,
      stripeCustomerId: user.stripe_customer_id,
      stripeSubscriptionId: user.stripe_subscription_id,
    });

    return true;
  } catch (error) {
    log(`❌ Access verification failed: ${error instanceof Error ? error.message : String(error)}`, 'red');
    recordResult('Access Verification', 'FAIL', { email }, error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function step7_Refund(sessionId: string, subscriptionId: string): Promise<boolean> {
  logSection('STEP 7: Refund (Automated)', '💰');

  log('⚠️  This will refund the payment and cancel the subscription', 'yellow');
  const refundConfirm = await question('\nProceed with refund? (yes/no): ');

  if (refundConfirm.toLowerCase() !== 'yes') {
    log('⏭️  Refund skipped', 'yellow');
    recordResult('Refund', 'SKIP', { sessionId, subscriptionId }, 'User declined');
    return false;
  }

  try {
    // Get session to find payment intent
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.payment_intent) {
      log('❌ No payment intent found (cannot refund)', 'red');
      recordResult('Refund', 'FAIL', { sessionId }, 'No payment intent');
      return false;
    }

    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent.id;

    // Create refund
    console.log('\n🔄 Creating refund...');
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: {
        reason: 'end_to_end_smoke_test',
        testDate: new Date().toISOString(),
      },
    });

    log(`✅ Refund created: ${refund.id}`, 'green');
    console.log(`   Amount: $${(refund.amount / 100).toFixed(2)}`);
    console.log(`   Status: ${refund.status}`);

    // Cancel subscription
    console.log('\n🔄 Cancelling subscription...');
    const cancelledSub = await stripe.subscriptions.cancel(subscriptionId);

    log(`✅ Subscription cancelled: ${cancelledSub.id}`, 'green');
    console.log(`   Status: ${cancelledSub.status}`);
    console.log(`   Cancelled at: ${new Date((cancelledSub.canceled_at || 0) * 1000).toLocaleString()}`);

    recordResult('Refund', 'PASS', {
      refundId: refund.id,
      refundAmount: refund.amount / 100,
      refundStatus: refund.status,
      subscriptionId: cancelledSub.id,
      subscriptionStatus: cancelledSub.status,
    });

    return true;
  } catch (error) {
    log(`❌ Refund failed: ${error instanceof Error ? error.message : String(error)}`, 'red');
    recordResult('Refund', 'FAIL', { sessionId, subscriptionId }, error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function step8_GenerateReport(): Promise<void> {
  logSection('STEP 8: Generating Test Report', '📄');

  const reportPath = path.join(process.cwd(), 'docs', 'END_TO_END_REVENUE_SMOKE_TEST_REPORT.md');

  const passCount = testResults.filter(r => r.status === 'PASS').length;
  const failCount = testResults.filter(r => r.status === 'FAIL').length;
  const skipCount = testResults.filter(r => r.status === 'SKIP').length;
  const manualCount = testResults.filter(r => r.status === 'MANUAL').length;

  const overallStatus = failCount > 0 ? 'FAILED' : passCount >= 5 ? 'PASSED' : 'PARTIAL';

  const report = `# End-to-End Revenue Smoke Test Report

**Date**: ${new Date().toLocaleString()}
**Overall Status**: ${overallStatus === 'PASSED' ? '✅' : overallStatus === 'FAILED' ? '❌' : '⚠️'} ${overallStatus}
**Test Duration**: ${((Date.now() - parseInt(testResults[0]?.timestamp || '0')) / 1000 / 60).toFixed(1)} minutes

---

## Executive Summary

${passCount} PASS | ${failCount} FAIL | ${skipCount} SKIP | ${manualCount} MANUAL

${overallStatus === 'PASSED'
  ? '✅ **REVENUE PIPELINE VERIFIED** - Production payments are working correctly. Safe to launch.'
  : overallStatus === 'FAILED'
  ? '❌ **REVENUE PIPELINE BROKEN** - Critical issues found. DO NOT LAUNCH until resolved.'
  : '⚠️ **INCOMPLETE TEST** - Some steps were skipped or require manual verification.'
}

---

## Test Results

${testResults.map((result, index) => `
### ${index + 1}. ${result.step}

**Status**: ${result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : result.status === 'SKIP' ? '⏭️' : '📝'} ${result.status}
**Timestamp**: ${new Date(result.timestamp).toLocaleString()}
${result.error ? `**Error**: ${result.error}  ` : ''}

**Details**:
\`\`\`json
${JSON.stringify(result.details, null, 2)}
\`\`\`
`).join('\n')}

---

## Stripe Dashboard Links

${testResults.find(r => r.step === 'Checkout & Payment')?.details?.sessionId
  ? `- **Payment**: https://dashboard.stripe.com/payments/${testResults.find(r => r.step === 'Checkout & Payment')?.details?.sessionId}
- **Subscription**: https://dashboard.stripe.com/subscriptions/${testResults.find(r => r.step === 'Checkout & Payment')?.details?.subscriptionId}
- **Customer**: https://dashboard.stripe.com/customers/${testResults.find(r => r.step === 'Checkout & Payment')?.details?.customerId}`
  : '(Payment details not available)'
}

---

## Recommendations

${failCount > 0
  ? `### ❌ Critical Issues Found

${testResults.filter(r => r.status === 'FAIL').map(r => `- **${r.step}**: ${r.error || 'Failed'}`).join('\n')}

**Action Required**: Fix these issues before launching to customers.
`
  : ''
}

${overallStatus === 'PASSED'
  ? `### ✅ Launch Checklist

All revenue pipeline checks passed. Before launching:

- [ ] Verify Stripe Dashboard shows payment and active subscription
- [ ] Verify webhook events are being delivered successfully
- [ ] Verify user database was updated correctly
- [ ] Verify refund was processed successfully
- [ ] Monitor Sentry for any errors during the test
- [ ] Set up Stripe alerts for failed payments
- [ ] Document this test in Product Hunt launch checklist
`
  : ''
}

---

## Next Steps

1. Review this report and address any failures
2. If all passed, proceed with Product Hunt launch
3. Monitor first real customer payments closely
4. Set up automated revenue monitoring dashboard

---

**Report Generated**: ${new Date().toISOString()}
**Generated By**: end-to-end-revenue-smoke-test.ts
`;

  // Ensure docs directory exists
  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, report, 'utf-8');

  log(`✅ Test report saved to: ${reportPath}`, 'green');
  console.log('');

  // Print summary
  logSection('TEST SUMMARY', '📊');
  console.log(`Overall Status: ${overallStatus === 'PASSED' ? colors.green : overallStatus === 'FAILED' ? colors.red : colors.yellow}${overallStatus}${colors.reset}`);
  console.log(`Pass Rate: ${passCount} / ${testResults.length} (${((passCount / testResults.length) * 100).toFixed(1)}%)`);
  console.log('');
  console.log('Results:');
  console.log(`  ✅ Passed: ${passCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log(`  ⏭️  Skipped: ${skipCount}`);
  console.log(`  📝 Manual: ${manualCount}`);
  console.log('');

  recordResult('Generate Report', 'PASS', { reportPath, overallStatus });
}

async function main() {
  console.clear();
  console.log('━'.repeat(80));
  log('  💳 END-TO-END REVENUE SMOKE TEST', 'bright');
  log('  Complete Production Payment Flow Verification', 'cyan');
  console.log('━'.repeat(80));
  console.log('');

  log('⚠️  WARNING: This test uses LIVE Stripe mode', 'yellow');
  log('⚠️  You will be charged REAL money to your credit card', 'yellow');
  log('⚠️  A refund will be issued automatically at the end', 'yellow');
  console.log('');
  log('📋 Test Flow:', 'cyan');
  console.log('  1. Prerequisites verification (automated)');
  console.log('  2. Calculator completion (manual)');
  console.log('  3. User signup (manual)');
  console.log('  4. Checkout & payment (manual + automated)');
  console.log('  5. Stripe dashboard verification (guided)');
  console.log('  6. Access verification (automated)');
  console.log('  7. Refund (automated)');
  console.log('  8. Generate report (automated)');
  console.log('');
  log('⏱️  Estimated time: 30 minutes', 'dim');
  console.log('');

  const proceed = await question('Ready to start? (yes/no): ');
  if (proceed.toLowerCase() !== 'yes') {
    log('\n❌ Test cancelled', 'red');
    rl.close();
    return;
  }

  try {
    // Step 1: Prerequisites
    const prereqsPassed = await step1_Prerequisites();
    if (!prereqsPassed) {
      log('\n❌ Cannot proceed - prerequisites not met', 'red');
      rl.close();
      return;
    }

    // Step 2: Calculator
    const { email, yearlyIncome, rsuValue } = await step2_CalculatorCompletion();

    // Step 3: Signup
    const clerkUserId = await step3_UserSignup(email);

    // Step 4: Checkout & Payment
    const { sessionId, subscriptionId, customerId, amountPaid } = await step4_CheckoutAndPayment(email);

    // Step 5: Stripe Dashboard
    await step5_StripeDashboardVerification(sessionId);

    // Step 6: Access Verification
    await step6_AccessVerification(email);

    // Step 7: Refund
    await step7_Refund(sessionId, subscriptionId);

    // Step 8: Generate Report
    await step8_GenerateReport();

    log('\n✅ END-TO-END REVENUE SMOKE TEST COMPLETE', 'green');
    console.log('');

  } catch (error) {
    log(`\n❌ Test failed: ${error instanceof Error ? error.message : String(error)}`, 'red');

    // Generate report even on failure
    await step8_GenerateReport();
  } finally {
    rl.close();
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  rl.close();
  process.exit(1);
});
