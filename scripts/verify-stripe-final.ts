#!/usr/bin/env tsx

/**
 * Stripe Production Mode - FINAL VERIFICATION
 *
 * This script performs comprehensive verification of Stripe configuration
 * and provides actionable feedback for manual steps.
 *
 * Usage: npm run verify:stripe:final
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface VerificationResult {
  category: string;
  check: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'MANUAL';
  details: string;
  action?: string;
}

const results: VerificationResult[] = [];

function addResult(result: VerificationResult) {
  results.push(result);
}

function printHeader(text: string) {
  console.log('\n' + '='.repeat(80));
  console.log(text.toUpperCase().padStart((80 + text.length) / 2));
  console.log('='.repeat(80) + '\n');
}

function printSection(title: string) {
  console.log('\n' + '-'.repeat(80));
  console.log(title);
  console.log('-'.repeat(80));
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'PASS': return '✅';
    case 'FAIL': return '❌';
    case 'WARNING': return '⚠️';
    case 'MANUAL': return '📋';
    default: return '❓';
  }
}

async function checkEnvironmentVariables() {
  printSection('1. ENVIRONMENT VARIABLES CHECK');

  const envPath = path.join(process.cwd(), '.env.production');

  if (!fs.existsSync(envPath)) {
    addResult({
      category: 'Environment',
      check: '.env.production file',
      status: 'FAIL',
      details: '.env.production file not found',
      action: 'Create .env.production file with Stripe keys'
    });
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = new Map<string, string>();

  // Parse environment variables
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([A-Z_]+)=(.+)$/);
    if (match) {
      const [, key, value] = match;
      envVars.set(key, value.trim());
    }
  });

  // Check each required Stripe variable
  const requiredVars = [
    { key: 'STRIPE_SECRET_KEY', prefix: 'sk_live_', length: 108 },
    { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', prefix: 'pk_live_', length: 108 },
    { key: 'STRIPE_WEBHOOK_SECRET', prefix: 'whsec_', length: 64 },
    { key: 'STRIPE_BASIC_PRICE_ID', prefix: 'price_', length: 29 },
    { key: 'STRIPE_PRO_PRICE_ID', prefix: 'price_', length: 29 },
    { key: 'NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID', prefix: 'price_', length: 29 },
    { key: 'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID', prefix: 'price_', length: 29 },
  ];

  for (const { key, prefix, length } of requiredVars) {
    const value = envVars.get(key) || '';
    const isPlaceholder = value.includes('YOUR_') || value.includes('PLACEHOLDER');
    const hasCorrectPrefix = value.startsWith(prefix);
    const hasCorrectLength = value.length >= length - 5 && value.length <= length + 10;

    if (!value || value === '') {
      addResult({
        category: 'Environment',
        check: key,
        status: 'FAIL',
        details: `${key} is not set`,
        action: `Set ${key} in .env.production`
      });
    } else if (isPlaceholder) {
      addResult({
        category: 'Environment',
        check: key,
        status: 'FAIL',
        details: `${key} contains placeholder value: "${value.substring(0, 40)}..."`,
        action: `Replace with real ${prefix}... key from Stripe dashboard`
      });
    } else if (!hasCorrectPrefix) {
      addResult({
        category: 'Environment',
        check: key,
        status: 'WARNING',
        details: `${key} does not start with "${prefix}" (starts with "${value.substring(0, 10)}...")`,
        action: `Verify this is the correct production key type`
      });
    } else if (!hasCorrectLength) {
      addResult({
        category: 'Environment',
        check: key,
        status: 'WARNING',
        details: `${key} length is ${value.length} (expected ~${length})`,
        action: `Verify this is a complete key`
      });
    } else {
      addResult({
        category: 'Environment',
        check: key,
        status: 'PASS',
        details: `${key} is set with valid ${prefix} key (${value.length} chars)`,
      });
    }
  }
}

async function checkVercelEnvironmentVariables() {
  printSection('2. VERCEL ENVIRONMENT VARIABLES CHECK');

  addResult({
    category: 'Vercel',
    check: 'Environment variables',
    status: 'MANUAL',
    details: 'Cannot automatically verify Vercel environment variables',
    action: 'Login to Vercel dashboard and verify: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables'
  });

  console.log('📋 Manual steps required:');
  console.log('   1. Open: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables');
  console.log('   2. Verify these variables are set with "Production" scope:');
  console.log('      - STRIPE_SECRET_KEY (starts with sk_live_)');
  console.log('      - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (starts with pk_live_)');
  console.log('      - STRIPE_WEBHOOK_SECRET (starts with whsec_)');
  console.log('      - STRIPE_BASIC_PRICE_ID (starts with price_)');
  console.log('      - STRIPE_PRO_PRICE_ID (starts with price_)');
  console.log('      - NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID (starts with price_)');
  console.log('      - NEXT_PUBLIC_STRIPE_PRO_PRICE_ID (starts with price_)');
  console.log('   3. Screenshot the environment variables page');
  console.log('   4. Save to: docs/screenshots/vercel-env-vars-YYYY-MM-DD.png');
}

async function checkStripeDashboard() {
  printSection('3. STRIPE DASHBOARD VERIFICATION (MANUAL)');

  addResult({
    category: 'Stripe Dashboard',
    check: 'Test/Live mode toggle',
    status: 'MANUAL',
    details: 'Cannot automatically verify Stripe dashboard mode',
    action: 'Login to Stripe and verify mode toggle is set to "Production"'
  });

  console.log('📋 Manual steps required:');
  console.log('   1. Open: https://dashboard.stripe.com/dashboard');
  console.log('   2. Check the mode toggle in the top-left corner');
  console.log('   3. Verify it shows "Production" (NOT "Test mode")');
  console.log('   4. Screenshot showing the toggle in Production mode');
  console.log('   5. Save to: docs/screenshots/stripe-production-mode-YYYY-MM-DD.png');
  console.log('');
  console.log('   CRITICAL: If toggle shows "Test mode", click it to switch to Production!');
}

async function checkStripeAPIKeys() {
  printSection('4. STRIPE API KEYS VERIFICATION (MANUAL)');

  addResult({
    category: 'Stripe API Keys',
    check: 'API keys page',
    status: 'MANUAL',
    details: 'Cannot automatically verify API keys in Stripe dashboard',
    action: 'Verify API keys in Stripe dashboard match .env.production'
  });

  console.log('📋 Manual steps required:');
  console.log('   1. Open: https://dashboard.stripe.com/apikeys');
  console.log('   2. Ensure "Viewing test data" toggle is OFF (Production mode)');
  console.log('   3. Verify "Publishable key" starts with: pk_live_');
  console.log('   4. Click "Reveal live key token" for Secret key');
  console.log('   5. Verify it starts with: sk_live_');
  console.log('   6. Screenshot the API keys page (blur the full keys if sharing)');
  console.log('   7. Save to: docs/screenshots/stripe-api-keys-YYYY-MM-DD.png');
  console.log('');
  console.log('   IMPORTANT: Do NOT screenshot the full secret key! Blur it or show only sk_live_XXXX...');
}

async function checkStripePrices() {
  printSection('5. STRIPE PRICE IDS VERIFICATION (MANUAL)');

  addResult({
    category: 'Stripe Prices',
    check: 'Price IDs existence',
    status: 'MANUAL',
    details: 'Cannot automatically verify price IDs in Stripe dashboard',
    action: 'Verify Basic and Pro price IDs exist in Stripe dashboard'
  });

  console.log('📋 Manual steps required:');
  console.log('   1. Open: https://dashboard.stripe.com/products');
  console.log('   2. Ensure "Viewing test data" toggle is OFF (Production mode)');
  console.log('   3. Verify these products exist:');
  console.log('      - TaxBridge Basic ($49/year)');
  console.log('      - TaxBridge Pro ($79/year)');
  console.log('   4. Click each product and verify the Price ID starts with: price_');
  console.log('   5. Screenshot the products page');
  console.log('   6. Save to: docs/screenshots/stripe-products-YYYY-MM-DD.png');
  console.log('');
  console.log('   If products don\'t exist, run: npm run stripe:setup:production');
}

async function checkStripeWebhook() {
  printSection('6. STRIPE WEBHOOK VERIFICATION (MANUAL)');

  addResult({
    category: 'Stripe Webhook',
    check: 'Webhook endpoint',
    status: 'MANUAL',
    details: 'Cannot automatically verify webhook configuration',
    action: 'Verify webhook endpoint is configured in Stripe dashboard'
  });

  console.log('📋 Manual steps required:');
  console.log('   1. Open: https://dashboard.stripe.com/webhooks');
  console.log('   2. Ensure "Viewing test data" toggle is OFF (Production mode)');
  console.log('   3. Verify a webhook endpoint exists with URL:');
  console.log('      https://taxbridge.vercel.app/api/stripe/webhook');
  console.log('   4. Verify these events are selected:');
  console.log('      ✓ checkout.session.completed');
  console.log('      ✓ customer.subscription.created');
  console.log('      ✓ customer.subscription.updated');
  console.log('      ✓ customer.subscription.deleted');
  console.log('      ✓ invoice.payment_succeeded');
  console.log('      ✓ invoice.payment_failed');
  console.log('      ✓ charge.refunded');
  console.log('   5. Click "Signing secret" and verify it starts with: whsec_');
  console.log('   6. Screenshot the webhook configuration');
  console.log('   7. Save to: docs/screenshots/stripe-webhook-YYYY-MM-DD.png');
  console.log('');
  console.log('   If webhook doesn\'t exist, create it following docs/STRIPE_WEBHOOK_VERIFICATION.md');
}

async function createTestPaymentGuide() {
  printSection('7. TEST PAYMENT PROCEDURE');

  addResult({
    category: 'Test Payment',
    check: '$1 test and refund',
    status: 'MANUAL',
    details: 'Test payment must be executed manually',
    action: 'Complete test payment and refund using test card'
  });

  const testGuide = `
# Test Payment Procedure - $1 Checkout Test

## Overview
This test verifies that Stripe production mode is working correctly by:
1. Completing a real checkout with Stripe test card
2. Verifying webhook events are processed
3. Immediately refunding the test payment

**IMPORTANT:** Use Stripe test card 4242 4242 4242 4242, NOT a real card!

## Prerequisites
✅ All environment variables set in Vercel
✅ Production deployed with latest env vars
✅ Stripe webhook configured
✅ Webhook secret added to Vercel

## Step-by-Step Test Procedure

### 1. Open Production Pricing Page
\`\`\`
URL: https://taxbridge.vercel.app/pricing
\`\`\`

- Screenshot the pricing page
- Save as: docs/screenshots/test-payment/01-pricing-page.png

### 2. Click "Subscribe to Pro - $79/year"
- Should redirect to Stripe Checkout
- Screenshot the Stripe Checkout page
- Save as: docs/screenshots/test-payment/02-stripe-checkout.png

### 3. Fill Out Checkout Form
Email: test@example.com
Card number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345

**CRITICAL:** DO NOT use a real card! Only use 4242 4242 4242 4242

### 4. Complete Payment
- Click "Subscribe"
- Wait for redirect back to site
- Screenshot the success page
- Save as: docs/screenshots/test-payment/03-success-page.png

### 5. Verify Stripe Dashboard
Open: https://dashboard.stripe.com/payments

- Verify payment appears with status "Succeeded"
- Amount should be $79.00
- Screenshot the payment
- Save as: docs/screenshots/test-payment/04-stripe-payment.png

### 6. Verify Webhook Events
Open: https://dashboard.stripe.com/webhooks

- Click on your webhook endpoint
- Check "Recent events" tab
- Verify 3+ events with "200 OK" status:
  - checkout.session.completed
  - customer.subscription.created
  - invoice.payment_succeeded
- Screenshot the webhook events
- Save as: docs/screenshots/test-payment/05-webhook-events.png

### 7. Check Database (Optional)
\`\`\`bash
# If you have database access
npm run db:check-subscription -- --email=test@example.com
\`\`\`

- Verify user's subscription_tier is "pro"
- Verify subscription_status is "active"

### 8. REFUND THE TEST PAYMENT
**CRITICAL:** Refund within 5 minutes to avoid any charges!

Open: https://dashboard.stripe.com/payments

1. Click the test payment ($79.00)
2. Click "Refund" button (top right)
3. Select "Full refund"
4. Click "Refund $79.00"
5. Verify status changes to "Refunded"
6. Screenshot the refund confirmation
7. Save as: docs/screenshots/test-payment/06-refund-confirmation.png

### 9. Verify Refund Webhook
Open: https://dashboard.stripe.com/webhooks

- Click on your webhook endpoint
- Verify new event: charge.refunded → 200 OK
- Screenshot the refund webhook event
- Save as: docs/screenshots/test-payment/07-refund-webhook.png

## Success Criteria Checklist

- [ ] Pricing page loaded successfully
- [ ] Stripe Checkout redirected correctly
- [ ] Test card payment succeeded
- [ ] Stripe Dashboard shows payment ($79.00 Succeeded)
- [ ] Webhook events show 3+ events with 200 OK
- [ ] Database updated (subscription_tier=pro)
- [ ] Refund processed successfully
- [ ] Refund webhook received (charge.refunded → 200 OK)
- [ ] All 7 screenshots captured

## If Test Fails

### Payment doesn't complete
- Check: Are you in Production mode (not Test mode)?
- Check: Did you use test card 4242 4242 4242 4242?
- Check: Are environment variables set in Vercel?

### Webhook events show errors (4xx/5xx)
- Check: Is webhook secret set in Vercel?
- Check: Is production deployed with latest env vars?
- Check: Check Vercel logs for webhook errors

### Refund fails
- Check: Is payment status "Succeeded" (not "Pending")?
- Wait 30 seconds and try again
- Contact Stripe support if issue persists

## Post-Test Actions

1. **Delete test customer** (optional):
   - Open: https://dashboard.stripe.com/customers
   - Find test@example.com
   - Click "..." → Delete customer

2. **Document results**:
   - Create verification report: docs/STRIPE_TEST_PAYMENT_RESULTS.md
   - Include all 7 screenshots
   - Note any issues encountered
   - Confirm all success criteria met

3. **Update task tracker**:
   - Mark task as complete
   - Link to verification report
   - Include screenshot evidence

## Timeline
- Test payment: 5 minutes
- Verification: 3 minutes
- Refund: 2 minutes
- Documentation: 5 minutes
**Total: 15 minutes**

## Support
- Stripe test cards: https://stripe.com/docs/testing
- Webhook troubleshooting: docs/STRIPE_WEBHOOK_VERIFICATION.md
- General setup: docs/STRIPE_PRODUCTION_EXECUTIVE_SUMMARY.md
`;

  fs.mkdirSync('docs/screenshots/test-payment', { recursive: true });
  fs.writeFileSync('docs/STRIPE_TEST_PAYMENT_PROCEDURE.md', testGuide.trim());

  console.log('📋 Test payment guide created: docs/STRIPE_TEST_PAYMENT_PROCEDURE.md');
  console.log('');
  console.log('Quick steps:');
  console.log('   1. Visit: https://taxbridge.vercel.app/pricing');
  console.log('   2. Click "Subscribe to Pro"');
  console.log('   3. Use test card: 4242 4242 4242 4242');
  console.log('   4. Complete payment ($79)');
  console.log('   5. Verify payment in Stripe dashboard');
  console.log('   6. REFUND immediately!');
  console.log('   7. Take 7 screenshots (see guide for details)');
}

async function generateSummary() {
  printSection('8. VERIFICATION SUMMARY');

  const categoryCounts = new Map<string, { pass: number; fail: number; warning: number; manual: number }>();

  results.forEach(result => {
    if (!categoryCounts.has(result.category)) {
      categoryCounts.set(result.category, { pass: 0, fail: 0, warning: 0, manual: 0 });
    }
    const counts = categoryCounts.get(result.category)!;
    switch (result.status) {
      case 'PASS': counts.pass++; break;
      case 'FAIL': counts.fail++; break;
      case 'WARNING': counts.warning++; break;
      case 'MANUAL': counts.manual++; break;
    }
  });

  console.log('\nResults by Category:');
  console.log('');

  categoryCounts.forEach((counts, category) => {
    const total = counts.pass + counts.fail + counts.warning + counts.manual;
    console.log(`${category}:`);
    console.log(`  ✅ PASS: ${counts.pass}/${total}`);
    if (counts.fail > 0) console.log(`  ❌ FAIL: ${counts.fail}/${total}`);
    if (counts.warning > 0) console.log(`  ⚠️  WARNING: ${counts.warning}/${total}`);
    if (counts.manual > 0) console.log(`  📋 MANUAL: ${counts.manual}/${total}`);
    console.log('');
  });

  const totalPass = results.filter(r => r.status === 'PASS').length;
  const totalFail = results.filter(r => r.status === 'FAIL').length;
  const totalWarning = results.filter(r => r.status === 'WARNING').length;
  const totalManual = results.filter(r => r.status === 'MANUAL').length;
  const total = results.length;

  console.log('Overall:');
  console.log(`  ✅ ${totalPass} passed`);
  console.log(`  ❌ ${totalFail} failed`);
  console.log(`  ⚠️  ${totalWarning} warnings`);
  console.log(`  📋 ${totalManual} manual checks required`);
  console.log(`  📊 Total: ${total} checks`);
  console.log('');

  const failures = results.filter(r => r.status === 'FAIL');
  if (failures.length > 0) {
    printSection('FAILED CHECKS - ACTION REQUIRED');
    failures.forEach((result, i) => {
      console.log(`\n${i + 1}. ${result.check}`);
      console.log(`   Category: ${result.category}`);
      console.log(`   Issue: ${result.details}`);
      if (result.action) {
        console.log(`   Action: ${result.action}`);
      }
    });
  }

  const manualChecks = results.filter(r => r.status === 'MANUAL');
  if (manualChecks.length > 0) {
    printSection('MANUAL CHECKS REQUIRED');
    manualChecks.forEach((result, i) => {
      console.log(`\n${i + 1}. ${result.check}`);
      console.log(`   ${result.details}`);
      if (result.action) {
        console.log(`   📋 ${result.action}`);
      }
    });
  }

  // Determine overall status
  console.log('');
  console.log('='.repeat(80));
  if (totalFail === 0 && totalWarning === 0 && totalManual === 0) {
    console.log('✅ STRIPE PRODUCTION MODE: ACTIVE');
    console.log('🎉 All automated checks passed! Revenue is unblocked.');
  } else if (totalFail > 0) {
    console.log('❌ STRIPE PRODUCTION MODE: INACTIVE');
    console.log(`🔴 ${totalFail} critical issue(s) must be fixed before going live.`);
  } else if (totalManual > 0) {
    console.log('📋 STRIPE PRODUCTION MODE: PENDING VERIFICATION');
    console.log(`⚠️  ${totalManual} manual check(s) required to confirm production status.`);
  }
  console.log('='.repeat(80));
  console.log('');
}

async function createQuickChecklist() {
  const checklist = `# Stripe Production Mode - Quick Verification Checklist

**Date:** ${new Date().toISOString().split('T')[0]}
**Task:** [P0-CRITICAL] Stripe Production Mode - FINAL VERIFICATION

Print this checklist and check off each item as you complete it.

## 1. Environment Variables ✓

- [ ] .env.production file exists
- [ ] STRIPE_SECRET_KEY starts with \`sk_live_\`
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY starts with \`pk_live_\`
- [ ] STRIPE_WEBHOOK_SECRET starts with \`whsec_\`
- [ ] STRIPE_BASIC_PRICE_ID starts with \`price_\`
- [ ] STRIPE_PRO_PRICE_ID starts with \`price_\`
- [ ] No placeholder values (no "YOUR_" strings)

## 2. Vercel Environment Variables ✓

- [ ] Login to Vercel: https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables
- [ ] All Stripe keys set with "Production" scope
- [ ] Screenshot saved: docs/screenshots/vercel-env-vars-YYYY-MM-DD.png

## 3. Stripe Dashboard - Mode Toggle ✓

- [ ] Login to Stripe: https://dashboard.stripe.com/dashboard
- [ ] Toggle in top-left shows "Production" (NOT "Test mode")
- [ ] Screenshot saved: docs/screenshots/stripe-production-mode-YYYY-MM-DD.png

## 4. Stripe Dashboard - API Keys ✓

- [ ] Open: https://dashboard.stripe.com/apikeys
- [ ] "Viewing test data" toggle is OFF
- [ ] Publishable key starts with \`pk_live_\`
- [ ] Secret key starts with \`sk_live_\` (revealed)
- [ ] Screenshot saved (with secret key blurred): docs/screenshots/stripe-api-keys-YYYY-MM-DD.png

## 5. Stripe Dashboard - Products/Prices ✓

- [ ] Open: https://dashboard.stripe.com/products
- [ ] "Viewing test data" toggle is OFF
- [ ] Product exists: TaxBridge Basic ($49/year)
- [ ] Product exists: TaxBridge Pro ($79/year)
- [ ] Both price IDs start with \`price_\`
- [ ] Screenshot saved: docs/screenshots/stripe-products-YYYY-MM-DD.png

## 6. Stripe Dashboard - Webhook ✓

- [ ] Open: https://dashboard.stripe.com/webhooks
- [ ] "Viewing test data" toggle is OFF
- [ ] Endpoint URL: https://taxbridge.vercel.app/api/stripe/webhook
- [ ] Events selected (7 total):
  - [ ] checkout.session.completed
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
  - [ ] invoice.payment_succeeded
  - [ ] invoice.payment_failed
  - [ ] charge.refunded
- [ ] Signing secret starts with \`whsec_\`
- [ ] Screenshot saved: docs/screenshots/stripe-webhook-YYYY-MM-DD.png

## 7. Test Payment - $1 Checkout ✓

- [ ] Visit: https://taxbridge.vercel.app/pricing
- [ ] Click "Subscribe to Pro"
- [ ] Stripe Checkout loads
- [ ] Fill form with test card: 4242 4242 4242 4242
- [ ] Payment succeeds ($79.00)
- [ ] Redirected back to site
- [ ] Screenshots saved (7 total):
  - [ ] 01-pricing-page.png
  - [ ] 02-stripe-checkout.png
  - [ ] 03-success-page.png
  - [ ] 04-stripe-payment.png
  - [ ] 05-webhook-events.png
  - [ ] 06-refund-confirmation.png
  - [ ] 07-refund-webhook.png

## 8. Stripe Dashboard - Verify Payment ✓

- [ ] Open: https://dashboard.stripe.com/payments
- [ ] Payment shows: $79.00 Succeeded
- [ ] Customer: test@example.com

## 9. Stripe Dashboard - Verify Webhooks ✓

- [ ] Open: https://dashboard.stripe.com/webhooks
- [ ] Click webhook endpoint
- [ ] Recent events tab shows:
  - [ ] checkout.session.completed → 200 OK
  - [ ] customer.subscription.created → 200 OK
  - [ ] invoice.payment_succeeded → 200 OK

## 10. REFUND Test Payment ✓

- [ ] Open payment in Stripe dashboard
- [ ] Click "Refund"
- [ ] Full refund: $79.00
- [ ] Refund confirmed
- [ ] Refund webhook received: charge.refunded → 200 OK

## 11. Documentation ✓

- [ ] All screenshots captured (minimum 10 total)
- [ ] Screenshots organized in docs/screenshots/
- [ ] Verification report created
- [ ] Task marked complete with evidence

## Final Verification

- [ ] ALL 70+ items above checked ✓
- [ ] No placeholder environment variables remain
- [ ] Stripe dashboard shows "Production" mode
- [ ] Test payment succeeded and refunded
- [ ] Webhook events all returned 200 OK
- [ ] Screenshot evidence saved

## Status

**Automated checks:** Run \`npm run verify:stripe:final\`

**Manual checks:** Complete this checklist

**Evidence:** Save all screenshots to \`docs/screenshots/\`

**Task completion:** ✅ Only after ALL items checked

---

**Completion Date:** _______________

**Completed By:** _______________

**Evidence Location:** docs/screenshots/stripe-verification-[DATE]/

**Task ID:** [P0-CRITICAL] Stripe Production Mode - FINAL VERIFICATION
`;

  fs.writeFileSync('docs/STRIPE_FINAL_VERIFICATION_CHECKLIST.md', checklist.trim());
  console.log('📋 Quick checklist created: docs/STRIPE_FINAL_VERIFICATION_CHECKLIST.md');
}

async function main() {
  printHeader('Stripe Production Mode - Final Verification');

  console.log('This verification script will:');
  console.log('  1. Check .env.production for valid Stripe keys');
  console.log('  2. Verify Vercel environment variables (manual)');
  console.log('  3. Verify Stripe dashboard mode toggle (manual)');
  console.log('  4. Verify Stripe API keys (manual)');
  console.log('  5. Verify Stripe price IDs exist (manual)');
  console.log('  6. Verify Stripe webhook configuration (manual)');
  console.log('  7. Generate test payment procedure');
  console.log('  8. Generate comprehensive summary');
  console.log('');

  await checkEnvironmentVariables();
  await checkVercelEnvironmentVariables();
  await checkStripeDashboard();
  await checkStripeAPIKeys();
  await checkStripePrices();
  await checkStripeWebhook();
  await createTestPaymentGuide();
  await createQuickChecklist();
  await generateSummary();

  printSection('NEXT STEPS');
  console.log('1. Review failed checks above and fix issues');
  console.log('2. Complete manual verification steps (login to Stripe/Vercel)');
  console.log('3. Take required screenshots');
  console.log('4. Follow test payment procedure: docs/STRIPE_TEST_PAYMENT_PROCEDURE.md');
  console.log('5. Use checklist: docs/STRIPE_FINAL_VERIFICATION_CHECKLIST.md');
  console.log('6. Create verification report with all evidence');
  console.log('7. Mark task complete ONLY after ALL checks pass');
  console.log('');

  // Save JSON report
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.status === 'PASS').length,
      failed: results.filter(r => r.status === 'FAIL').length,
      warnings: results.filter(r => r.status === 'WARNING').length,
      manualChecksRequired: results.filter(r => r.status === 'MANUAL').length,
    }
  };

  fs.mkdirSync('docs/verification-reports', { recursive: true });
  const reportPath = `docs/verification-reports/stripe-verification-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 JSON report saved: ${reportPath}`);

  // Exit with appropriate code
  const hasFailed = results.some(r => r.status === 'FAIL');
  process.exit(hasFailed ? 1 : 0);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
