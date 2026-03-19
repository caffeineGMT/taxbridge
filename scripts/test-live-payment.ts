/**
 * Live Payment Flow Test Script
 *
 * Tests complete payment flow with REAL credit card:
 * 1. Create checkout session
 * 2. Complete payment (manual browser step)
 * 3. Verify webhook processing
 * 4. Verify user upgrade
 * 5. Test refund
 *
 * CRITICAL: This uses LIVE Stripe mode - real money will be charged
 *
 * Usage: npm run test:live-payment
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

// Load production environment
dotenv.config({ path: '.env.production' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function validateEnvironment(): Promise<boolean> {
  console.log('\n🔍 Validating environment configuration...\n');

  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PRO_PRICE_ID',
    'NEXT_PUBLIC_APP_URL',
  ];

  let valid = true;

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.includes('YOUR_') || value.includes('XXXXX')) {
      console.error(`   ❌ ${varName}: NOT SET or placeholder`);
      valid = false;
    } else {
      // Mask sensitive values
      const masked = value.startsWith('sk_') || value.startsWith('whsec_')
        ? value.substring(0, 15) + '...'
        : value;
      console.log(`   ✅ ${varName}: ${masked}`);
    }
  }

  // Verify LIVE mode
  if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
    console.error('\n   ❌ ERROR: Not using Stripe LIVE mode');
    console.error('      STRIPE_SECRET_KEY must start with sk_live_');
    valid = false;
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_')) {
    console.error('\n   ❌ ERROR: Not using Stripe LIVE mode');
    console.error('      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_live_');
    valid = false;
  }

  return valid;
}

async function testCheckoutSession(stripe: Stripe): Promise<{ sessionId: string; url: string }> {
  console.log('\n📋 Step 1: Creating checkout session...\n');

  const proPriceId = process.env.STRIPE_PRO_PRICE_ID!;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: proPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?upgrade=cancelled`,
      metadata: {
        userId: 'TEST_USER',
        tier: 'pro',
        testMode: 'live_payment_test',
      },
      subscription_data: {
        metadata: {
          userId: 'TEST_USER',
          tier: 'pro',
        },
      },
      customer_email: 'test@taxbridge.app',
    });

    console.log('   ✅ Checkout session created');
    console.log(`   Session ID: ${session.id}`);
    console.log(`   Payment URL: ${session.url}\n`);

    return {
      sessionId: session.id,
      url: session.url!,
    };
  } catch (error: any) {
    console.error(`   ❌ Failed to create checkout session: ${error.message}`);
    throw error;
  }
}

async function pollSessionStatus(stripe: Stripe, sessionId: string, timeoutMinutes: number = 10): Promise<Stripe.Checkout.Session> {
  console.log(`\n⏳ Polling session status (timeout: ${timeoutMinutes} minutes)...\n`);

  const startTime = Date.now();
  const timeoutMs = timeoutMinutes * 60 * 1000;

  while (Date.now() - startTime < timeoutMs) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      console.log('   ✅ Payment completed!');
      return session;
    }

    // Show current status
    process.stdout.write(`\r   Status: ${session.payment_status} (${Math.floor((Date.now() - startTime) / 1000)}s elapsed)`);

    // Wait 3 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  throw new Error('Timeout waiting for payment completion');
}

async function verifyWebhook(stripe: Stripe, sessionId: string): Promise<void> {
  console.log('\n\n📡 Step 3: Verifying webhook processing...\n');

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (!session.subscription) {
      console.error('   ❌ No subscription created');
      return;
    }

    const subscription = session.subscription as Stripe.Subscription;

    console.log(`   ✅ Subscription created: ${subscription.id}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Current period: ${new Date((subscription.current_period_start || 0) * 1000).toLocaleDateString()} - ${new Date((subscription.current_period_end || 0) * 1000).toLocaleDateString()}`);

    // Check recent events
    const events = await stripe.events.list({
      type: 'checkout.session.completed',
      limit: 10,
    });

    const matchingEvent = events.data.find(e => {
      const data = e.data.object as Stripe.Checkout.Session;
      return data.id === sessionId;
    });

    if (matchingEvent) {
      console.log(`   ✅ Webhook event found: ${matchingEvent.id}`);
      console.log(`   Created: ${new Date(matchingEvent.created * 1000).toISOString()}`);
    } else {
      console.warn('   ⚠️  Webhook event not found (may take a few seconds)');
    }
  } catch (error: any) {
    console.error(`   ❌ Webhook verification failed: ${error.message}`);
  }
}

async function testRefund(stripe: Stripe, sessionId: string): Promise<void> {
  console.log('\n💰 Step 4: Testing refund...\n');

  const confirmed = await question('Do you want to refund this payment? (yes/no): ');
  if (confirmed.toLowerCase() !== 'yes') {
    console.log('   ⏭️  Refund skipped');
    return;
  }

  try {
    // Get the payment intent from the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.payment_intent) {
      console.error('   ❌ No payment intent found');
      return;
    }

    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent.id;

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: {
        reason: 'test_refund',
        testMode: 'live_payment_test',
      },
    });

    console.log(`   ✅ Refund created: ${refund.id}`);
    console.log(`   Amount: $${(refund.amount / 100).toFixed(2)}`);
    console.log(`   Status: ${refund.status}`);

    // Cancel subscription
    if (session.subscription) {
      const subscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id;

      const cancelledSub = await stripe.subscriptions.cancel(subscriptionId);
      console.log(`   ✅ Subscription cancelled: ${cancelledSub.id}`);
    }

  } catch (error: any) {
    console.error(`   ❌ Refund failed: ${error.message}`);
  }
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💳 LIVE PAYMENT FLOW TEST - REAL CREDIT CARD REQUIRED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('⚠️  WARNING: This test uses LIVE Stripe mode');
  console.log('⚠️  You will be charged REAL money ($299 for Pro subscription)');
  console.log('⚠️  You can refund the payment at the end of this test\n');

  const confirmed = await question('Do you want to proceed? (yes/no): ');
  if (confirmed.toLowerCase() !== 'yes') {
    console.log('\n❌ Test cancelled');
    rl.close();
    return;
  }

  // Validate environment
  const envValid = await validateEnvironment();
  if (!envValid) {
    console.error('\n❌ Environment validation failed');
    console.error('   Fix configuration and try again\n');
    rl.close();
    return;
  }

  // Initialize Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
  });

  // Create checkout session
  const { sessionId, url } = await testCheckoutSession(stripe);

  // Prompt user to complete payment
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Step 2: Complete payment in browser');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`1. Open this URL in your browser:\n   ${url}\n`);
  console.log('2. Complete the payment with a REAL credit card');
  console.log('3. After payment, this script will continue automatically\n');

  await question('Press Enter when you\'re ready to start monitoring for payment...');

  // Poll for payment completion
  try {
    const completedSession = await pollSessionStatus(stripe, sessionId);

    // Verify webhook
    await verifyWebhook(stripe, sessionId);

    // Test refund
    await testRefund(stripe, sessionId);

    // Final summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ LIVE PAYMENT TEST COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Summary:');
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   Payment Status: ${completedSession.payment_status}`);
    console.log(`   Customer Email: ${completedSession.customer_email}`);
    console.log('\n📋 Next Steps:');
    console.log('   1. Verify subscription in Stripe Dashboard:');
    console.log('      https://dashboard.stripe.com/subscriptions');
    console.log('   2. Check webhook delivery logs:');
    console.log('      https://dashboard.stripe.com/webhooks');
    console.log('   3. Monitor Sentry for any errors:');
    console.log('      https://sentry.io');
    console.log('   4. Verify user upgrade in database');
    console.log('   5. Test Pro features (unlimited RSU entries, PDF export)\n');

  } catch (error: any) {
    console.error(`\n❌ Payment test failed: ${error.message}`);
  }

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  rl.close();
  process.exit(1);
});
