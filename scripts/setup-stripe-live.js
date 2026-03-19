#!/usr/bin/env node
/**
 * Stripe Live Mode Setup Script
 *
 * Creates Pro plan product and price in Stripe Live mode
 * Run this ONCE when activating revenue
 *
 * Usage:
 *   export STRIPE_SECRET_KEY="sk_live_..."
 *   export STRIPE_PUBLISHABLE_KEY="pk_live_..."
 *   npm run stripe:setup-live
 *
 * DO NOT commit API keys to git!
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PLAN = {
  name: 'TaxBridge Pro',
  description: 'Full access to US-Canada cross-border tax calculations, multi-year tracking, and AI tax advisor',
  price: 4900, // $49.00 in cents
  currency: 'usd',
  interval: 'year',
  features: [
    'Unlimited RSU entries',
    'Multi-year tax tracking',
    'AI Tax Advisor (Claude Sonnet 4)',
    'Form 1116 Foreign Tax Credit automation',
    'Quarterly estimated tax calculations',
    'Priority email support',
    'PDF tax summary export',
    'Early access to new features',
  ],
};

async function setupLiveStripe() {
  console.log('\n🚀 TaxBridge Stripe Live Mode Setup\n');

  // Validation
  if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
    console.error('❌ Error: STRIPE_SECRET_KEY must start with sk_live_');
    console.error('   You are using TEST mode keys. Switch to LIVE mode in Stripe Dashboard.');
    process.exit(1);
  }

  if (!process.env.STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_')) {
    console.error('❌ Error: STRIPE_PUBLISHABLE_KEY must start with pk_live_');
    console.error('   You are using TEST mode keys. Switch to LIVE mode in Stripe Dashboard.');
    process.exit(1);
  }

  try {
    // Step 1: Create Product
    console.log('📦 Creating product...');
    const product = await stripe.products.create({
      name: PLAN.name,
      description: PLAN.description,
      metadata: {
        tier: 'pro',
        features: JSON.stringify(PLAN.features),
      },
    });

    console.log(`✅ Product created: ${product.id}`);
    console.log(`   Name: ${product.name}`);

    // Step 2: Create Price
    console.log('\n💰 Creating price...');
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: PLAN.price,
      currency: PLAN.currency,
      recurring: {
        interval: PLAN.interval,
      },
      metadata: {
        tier: 'pro',
        interval: PLAN.interval,
      },
    });

    console.log(`✅ Price created: ${price.id}`);
    console.log(`   Amount: $${PLAN.price / 100}/${PLAN.interval}`);
    console.log(`   Currency: ${PLAN.currency.toUpperCase()}`);

    // Step 3: Display configuration
    console.log('\n📋 Add these to .env.production (or Vercel environment variables):\n');
    console.log(`STRIPE_PRO_PRICE_ID=${price.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=${price.id}`);
    console.log(`STRIPE_PRO_PRODUCT_ID=${product.id}`);

    console.log('\n🎯 Next Steps:\n');
    console.log('1. Set up webhook endpoint:');
    console.log('   URL: https://taxbridge.app/api/stripe/webhook');
    console.log('   Events: checkout.session.completed, customer.subscription.updated, etc.');
    console.log('   Copy webhook signing secret → STRIPE_WEBHOOK_SECRET\n');
    console.log('2. Update environment variables in Vercel');
    console.log('3. Test payment flow on staging environment');
    console.log('4. Deploy to production: vercel --prod');
    console.log('5. Verify payment with test card: 4242 4242 4242 4242\n');

    console.log('✅ Stripe Live Mode setup complete!\n');
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);

    if (error.code === 'api_key_expired') {
      console.error('\n💡 Your API key has expired. Generate a new one in Stripe Dashboard.');
    } else if (error.type === 'StripeAuthenticationError') {
      console.error('\n💡 Authentication failed. Check your STRIPE_SECRET_KEY is correct.');
    }

    process.exit(1);
  }
}

// Run setup
setupLiveStripe();
