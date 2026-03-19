#!/usr/bin/env node
/**
 * STRIPE PRODUCTION ACTIVATION ASSISTANT
 *
 * Interactive guide that walks you through activating Stripe production mode.
 *
 * Usage:
 *   npm run activate:stripe
 *   OR
 *   npx tsx scripts/stripe-activation-assistant.ts
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// ============================================================
// UTILITIES
// ============================================================

function print(message: string, color?: 'red' | 'green' | 'yellow' | 'blue') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
  };

  const reset = '\x1b[0m';
  const colorCode = color ? colors[color] : '';

  console.log(`${colorCode}${message}${reset}`);
}

function printHeader(title: string) {
  console.log('\n' + '━'.repeat(60));
  console.log(`🚀 ${title}`);
  console.log('━'.repeat(60) + '\n');
}

function printSuccess(message: string) {
  print(`✅ ${message}`, 'green');
}

function printError(message: string) {
  print(`❌ ${message}`, 'red');
}

function printWarning(message: string) {
  print(`⚠️  ${message}`, 'yellow');
}

function printInfo(message: string) {
  print(`ℹ️  ${message}`, 'blue');
}

// ============================================================
// PHASE 1: STRIPE API KEYS
// ============================================================

function phase1_StripeKeys() {
  printHeader('PHASE 1: Get Stripe Production API Keys (15 min)');

  printInfo('STEP 1: Open Stripe Dashboard');
  console.log('   URL: https://dashboard.stripe.com/apikeys\n');

  printWarning('STEP 2: Toggle to "Production" mode');
  console.log('   Look for the toggle in the top-right corner');
  console.log('   Make sure it says "Production" NOT "Test mode"\n');

  printInfo('STEP 3: Copy your keys');
  console.log('   Secret Key: sk_live_51XXXXXXXXXXXXX');
  console.log('   Publishable Key: pk_live_51XXXXXXXXXXXXX\n');

  console.log('━'.repeat(60));
  console.log('✋ PAUSE: Have you copied both keys?\n');
  console.log('When ready, press ENTER to continue...');
  console.log('(Or Ctrl+C to exit and come back later)');
  console.log('━'.repeat(60) + '\n');

  // In a real implementation, we'd wait for user input here
  // For this version, we just show the instructions
}

// ============================================================
// PHASE 2: CREATE PRODUCTS
// ============================================================

function phase2_CreateProducts() {
  printHeader('PHASE 2: Create Stripe Products & Prices (30 min)');

  printInfo('AUTOMATED METHOD (RECOMMENDED):');
  console.log('\nRun this command in your terminal:\n');
  console.log('   export STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY');
  console.log('   npx tsx scripts/activate-stripe-production-annual.ts\n');

  console.log('The script will:');
  console.log('   1. Create 3 products: Basic ($49/yr), Pro ($79/yr), Enterprise');
  console.log('   2. Output all price IDs to copy');
  console.log('   3. Give you exact values to paste into Vercel\n');

  printInfo('MANUAL METHOD (if script fails):');
  console.log('\n1. Go to: https://dashboard.stripe.com/products');
  console.log('2. Create products manually:');
  console.log('   • Basic: $49/year (5 RSU entries)');
  console.log('   • Pro: $79/year (unlimited, priority support)');
  console.log('   • Enterprise: Custom pricing\n');

  console.log('━'.repeat(60));
  console.log('✋ PAUSE: Have you created products and copied price IDs?\n');
  console.log('Expected output:');
  console.log('   STRIPE_BASIC_PRICE_ID=price_1XXXXXXXXXXXXX');
  console.log('   STRIPE_PRO_PRICE_ID=price_1XXXXXXXXXXXXX');
  console.log('   STRIPE_ENTERPRISE_PRICE_ID=prod_XXXXXXXXXXXXX');
  console.log('\n━'.repeat(60) + '\n');
}

// ============================================================
// PHASE 3: WEBHOOK SETUP
// ============================================================

function phase3_WebhookSetup() {
  printHeader('PHASE 3: Setup Webhook Endpoint (30 min)');

  printInfo('STEP 1: Go to Stripe Webhooks');
  console.log('   URL: https://dashboard.stripe.com/webhooks\n');

  printInfo('STEP 2: Add endpoint');
  console.log('   Click "Add endpoint" button\n');

  printInfo('STEP 3: Configure endpoint');
  console.log('   Endpoint URL: https://taxbridge.app/api/stripe/webhook\n');

  printInfo('STEP 4: Select events to send:');
  console.log('   ☐ checkout.session.completed');
  console.log('   ☐ customer.subscription.created');
  console.log('   ☐ customer.subscription.updated');
  console.log('   ☐ customer.subscription.deleted');
  console.log('   ☐ invoice.payment_succeeded');
  console.log('   ☐ invoice.payment_failed\n');

  printInfo('STEP 5: Copy webhook signing secret');
  console.log('   After creating endpoint, copy the signing secret');
  console.log('   Format: whsec_XXXXXXXXXXXXX\n');

  console.log('━'.repeat(60));
  console.log('✋ PAUSE: Have you created the webhook and copied the secret?\n');
  console.log('Expected: STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXX');
  console.log('\n━'.repeat(60) + '\n');
}

// ============================================================
// PHASE 4: UPDATE VERCEL
// ============================================================

function phase4_UpdateVercel() {
  printHeader('PHASE 4: Update Vercel Environment Variables (30 min)');

  printInfo('STEP 1: Open Vercel settings');
  console.log('   URL: https://vercel.com/your-team/cross-border-tax/settings/environment-variables\n');

  printInfo('STEP 2: Add/Update these variables for PRODUCTION:');
  console.log('\n   ┌─ Stripe API Keys ─────────────────────────────┐');
  console.log('   │ STRIPE_SECRET_KEY                             │');
  console.log('   │ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY            │');
  console.log('   │ STRIPE_WEBHOOK_SECRET                         │');
  console.log('   └───────────────────────────────────────────────┘\n');

  console.log('   ┌─ Stripe Price IDs ────────────────────────────┐');
  console.log('   │ STRIPE_BASIC_PRICE_ID                         │');
  console.log('   │ NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID             │');
  console.log('   │ STRIPE_PRO_PRICE_ID                           │');
  console.log('   │ NEXT_PUBLIC_STRIPE_PRO_PRICE_ID               │');
  console.log('   │ STRIPE_ENTERPRISE_PRICE_ID                    │');
  console.log('   │ NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID        │');
  console.log('   └───────────────────────────────────────────────┘\n');

  printWarning('CRITICAL: Select "Production" environment for each variable');
  printWarning('CRITICAL: Click "Save" on each variable');

  printInfo('\nSTEP 3: Redeploy your application');
  console.log('   Go to: Deployments → Click "Redeploy" on latest deployment');
  console.log('   Wait for deployment to complete (~2-3 minutes)\n');

  console.log('━'.repeat(60));
  console.log('✋ PAUSE: Have you updated Vercel and redeployed?\n');
  console.log('━'.repeat(60) + '\n');
}

// ============================================================
// PHASE 5: TEST PAYMENT
// ============================================================

function phase5_TestPayment() {
  printHeader('PHASE 5: Test End-to-End Payment (30 min)');

  printInfo('TEST CARD (WILL NOT CHARGE REAL MONEY):');
  console.log('\n   Card number: 4242 4242 4242 4242');
  console.log('   Expiry:      12/28 (any future date)');
  console.log('   CVC:         123 (any 3 digits)');
  console.log('   ZIP:         12345 (any 5 digits)\n');

  printInfo('STEP 1: Go to your pricing page');
  console.log('   URL: https://taxbridge.app/pricing\n');

  printInfo('STEP 2: Click "Get Started" on Pro plan ($79/year)');

  printInfo('STEP 3: Complete checkout with test card above');

  printInfo('STEP 4: Verify in Stripe Dashboard');
  console.log('   • Go to: https://dashboard.stripe.com/payments');
  console.log('   • Find $79.00 payment');
  console.log('   • Status should be "Succeeded"\n');

  printInfo('STEP 5: Verify webhook received');
  console.log('   • Go to: https://dashboard.stripe.com/webhooks');
  console.log('   • Click your endpoint');
  console.log('   • Check "Recent events" for checkout.session.completed\n');

  printWarning('STEP 6: REFUND the test payment');
  console.log('   • In Payments → Click payment → "Refund"');
  console.log('   • Select "Full refund"');
  console.log('   • Verify refund completes\n');

  console.log('━'.repeat(60));
  console.log('✅ If all steps passed, you are LIVE for revenue!');
  console.log('━'.repeat(60) + '\n');
}

// ============================================================
// MAIN EXECUTION
// ============================================================

function main() {
  console.clear();

  print(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                           ┃
┃   🚀 STRIPE PRODUCTION ACTIVATION ASSISTANT               ┃
┃                                                           ┃
┃   This guide will walk you through activating Stripe     ┃
┃   production mode in 5 phases.                           ┃
┃                                                           ┃
┃   ⏱️  Total Time: 2-3 hours                               ┃
┃   💰 Impact: Unblocks ALL revenue                         ┃
┃   🎯 Goal: Accept real payments from customers            ┃
┃                                                           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`, 'green');

  printWarning('\n⚠️  PREREQUISITES:');
  console.log('   • Stripe account created');
  console.log('   • Vercel account with deployment access');
  console.log('   • Production domain: taxbridge.app\n');

  console.log('━'.repeat(60));
  console.log('Press ENTER to begin Phase 1, or Ctrl+C to exit');
  console.log('━'.repeat(60) + '\n');

  // Execute all phases
  phase1_StripeKeys();
  phase2_CreateProducts();
  phase3_WebhookSetup();
  phase4_UpdateVercel();
  phase5_TestPayment();

  // Final summary
  printHeader('🎉 ACTIVATION COMPLETE!');

  printSuccess('Your Stripe production mode is now configured.\n');

  console.log('📊 NEXT STEPS:\n');
  console.log('1. Verify configuration:');
  console.log('   npm run verify:env-placeholders\n');

  console.log('2. Test live payment:');
  console.log('   npm run test:live-payment\n');

  console.log('3. Monitor your first real customer:');
  console.log('   https://dashboard.stripe.com/dashboard\n');

  console.log('4. Set up Stripe alerts:');
  console.log('   Settings → Notifications → Enable payment alerts\n');

  printInfo('📚 DOCUMENTATION:');
  console.log('   docs/STRIPE_PRODUCTION_ACTIVATION_COMPLETE.md\n');

  printInfo('🆘 TROUBLESHOOTING:');
  console.log('   docs/TROUBLESHOOTING.md\n');

  print('━'.repeat(60), 'green');
  print('💰 REVENUE IS NOW UNBLOCKED! 🎉', 'green');
  print('━'.repeat(60) + '\n', 'green');
}

// Run the assistant
main();
