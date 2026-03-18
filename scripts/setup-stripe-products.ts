/**
 * Stripe Production Setup Script
 * Creates products and price IDs for TaxBridge subscription plans
 *
 * Prerequisites:
 * 1. Get your Stripe production keys from: https://dashboard.stripe.com/apikeys
 * 2. Update .env.local with production keys (STRIPE_SECRET_KEY=sk_live_...)
 * 3. Run: npm run setup:stripe
 */

import Stripe from 'stripe';

// Check for production secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  console.error('Please add your Stripe secret key to .env.local');
  process.exit(1);
}

if (stripeSecretKey.startsWith('sk_test_')) {
  console.warn('⚠️  WARNING: Using test mode key. For production, use sk_live_ key');
  console.warn('Get production keys from: https://dashboard.stripe.com/apikeys');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

async function setupStripeProducts() {
  console.log('🚀 Setting up TaxBridge subscription products...\n');

  try {
    // Create Pro Annual Product
    console.log('Creating Pro Annual product...');
    const proProduct = await stripe.products.create({
      name: 'TaxBridge Pro',
      description: 'Unlimited RSU entries, FTC optimizer, multi-year dashboard, PDF exports, and priority support',
      metadata: {
        tier: 'pro',
        features: JSON.stringify([
          'Unlimited RSU entries',
          'Foreign Tax Credit optimizer',
          'Multi-year tax dashboard',
          'PDF export & reports',
          'CSV bulk import',
          'Priority support (12hr response)',
        ]),
      },
    });
    console.log(`✓ Pro product created: ${proProduct.id}`);

    // Create Pro Annual Price
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 29900, // $299.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        tier: 'pro',
        billing_cycle: 'annual',
      },
    });
    console.log(`✓ Pro annual price created: ${proPrice.id}\n`);

    // Create Enterprise Annual Product
    console.log('Creating Enterprise Annual product...');
    const enterpriseProduct = await stripe.products.create({
      name: 'TaxBridge Enterprise',
      description: 'All Pro features plus API access, client management, white-label reports, and dedicated support',
      metadata: {
        tier: 'enterprise',
        features: JSON.stringify([
          'All Pro features',
          'API access',
          'Client management dashboard',
          'White-label reports',
          'Custom integrations',
          'Dedicated account manager',
          '24/7 priority support',
        ]),
      },
    });
    console.log(`✓ Enterprise product created: ${enterpriseProduct.id}`);

    // Create Enterprise Annual Price
    const enterprisePrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 200000, // $2,000.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        tier: 'enterprise',
        billing_cycle: 'annual',
      },
    });
    console.log(`✓ Enterprise annual price created: ${enterprisePrice.id}\n`);

    // Print environment variables to add
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS! Add these to your .env.local file:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('# Stripe Product Price IDs (Production)');
    console.log(`STRIPE_PRO_PRICE_ID=${proPrice.id}`);
    console.log(`STRIPE_ENTERPRISE_PRICE_ID=${enterprisePrice.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=${proPrice.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=${enterprisePrice.id}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Next Steps:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('1. Copy the environment variables above to .env.local');
    console.log('2. Set up webhook endpoint in Stripe Dashboard:');
    console.log('   URL: https://your-domain.vercel.app/api/stripe/webhook');
    console.log('   Events: checkout.session.completed, customer.subscription.updated,');
    console.log('           customer.subscription.deleted, invoice.payment_failed');
    console.log('3. Add webhook secret to .env.local: STRIPE_WEBHOOK_SECRET=whsec_...');
    console.log('4. Test checkout flow on your live site');
    console.log('5. View products in dashboard: https://dashboard.stripe.com/products\n');

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Product Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Pro Annual:        $299/year  (${proPrice.id})`);
    console.log(`Enterprise Annual: $2,000/year (${enterprisePrice.id})`);
    console.log('');
  } catch (error: any) {
    console.error('❌ Error setting up Stripe products:');
    console.error(error.message);

    if (error.code === 'invalid_request_error') {
      console.error('\nTroubleshooting:');
      console.error('- Verify your Stripe API key is correct');
      console.error('- Check if you have permission to create products');
      console.error('- Make sure you\'re using the right mode (test vs live)');
    }

    process.exit(1);
  }
}

// Run setup
setupStripeProducts();
