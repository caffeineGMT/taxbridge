/**
 * Test HUNT20 Promotion Code
 *
 * Verifies the HUNT20 discount code is working correctly
 * Tests checkout session creation with the promotion code
 *
 * Usage: npm run test:hunt20
 */

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  process.exit(1);
}

if (!proPriceId || proPriceId === 'price_1ProAnnual') {
  console.error('❌ STRIPE_PRO_PRICE_ID not configured or using placeholder');
  console.error('Run: npm run setup:stripe to create products first');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

async function testHunt20Code() {
  console.log('🧪 Testing HUNT20 promotion code...\n');

  try {
    // Step 1: Retrieve the promotion code
    console.log('Step 1/3: Retrieving HUNT20 promotion code...');
    const promoCodes = await stripe.promotionCodes.list({
      code: 'HUNT20',
      limit: 1,
    });

    if (promoCodes.data.length === 0) {
      console.error('❌ HUNT20 promotion code not found');
      console.error('Run: npm run create:hunt20 to create it first');
      process.exit(1);
    }

    const promoCode = promoCodes.data[0];
    console.log(`✓ Found promotion code: ${promoCode.id}\n`);

    // Step 2: Get coupon details
    console.log('Step 2/3: Verifying coupon details...');
    const coupon = await stripe.coupons.retrieve(promoCode.coupon as string);
    console.log(`✓ Coupon: ${coupon.id} (${coupon.percent_off}% off)\n`);

    // Step 3: Create a test checkout session with the promo code
    console.log('Step 3/3: Creating test checkout session...');
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: proPriceId,
          quantity: 1,
        },
      ],
      discounts: [
        {
          promotion_code: promoCode.id,
        },
      ],
      success_url: `${appUrl}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?upgrade=cancelled`,
      allow_promotion_codes: true,
      metadata: {
        test: 'hunt20_verification',
      },
    });
    console.log(`✓ Checkout session created: ${checkoutSession.id}\n`);

    // Print test results
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ HUNT20 TEST PASSED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 Promotion Code Status:');
    console.log(`   Code:           ${promoCode.code}`);
    console.log(`   Active:         ${promoCode.active ? '✓ Yes' : '✗ No'}`);
    console.log(`   Discount:       ${coupon.percent_off}% off`);
    console.log(`   Redemptions:    ${promoCode.times_redeemed}/${promoCode.max_redemptions}`);

    if (promoCode.expires_at) {
      const expiresAt = new Date(promoCode.expires_at * 1000);
      const now = new Date();
      const hoursRemaining = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));

      console.log(`   Expires:        ${expiresAt.toLocaleString()}`);
      console.log(`   Time Remaining: ${hoursRemaining} hours\n`);

      if (hoursRemaining <= 0) {
        console.warn('⚠️  WARNING: Promotion code has EXPIRED');
      } else if (hoursRemaining < 12) {
        console.warn(`⚠️  WARNING: Only ${hoursRemaining} hours remaining`);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 Test Checkout URL:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(checkoutSession.url);
    console.log('\n💡 Open this URL to test the checkout flow with HUNT20 discount applied\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Expected Pricing:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('   Original Price:     $299.00');
    console.log('   Discount (20%):     -$59.80');
    console.log('   Final Price:        $239.20\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✓ Manual Testing Steps:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('1. Open the checkout URL above in your browser');
    console.log('2. Verify discount is automatically applied');
    console.log('3. Check that total shows $239.20 (not $299.00)');
    console.log('4. Test entering/removing promo code manually');
    console.log('5. Verify pricing page shows HUNT20 discount banner\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 Monitor in Stripe Dashboard:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`   Promotion Code:  https://dashboard.stripe.com/promotion_codes/${promoCode.id}`);
    console.log(`   Checkout Session: https://dashboard.stripe.com/checkout/sessions/${checkoutSession.id}\n`);

  } catch (error: any) {
    console.error('❌ Test failed:');
    console.error(error.message);

    if (error.type === 'StripeInvalidRequestError') {
      console.error('\n💡 Troubleshooting:');

      if (error.message.includes('price')) {
        console.error('- Verify STRIPE_PRO_PRICE_ID is set correctly in .env.local');
        console.error('- Run: npm run setup:stripe to create products');
      } else if (error.message.includes('promotion_code')) {
        console.error('- HUNT20 code may not exist yet');
        console.error('- Run: npm run create:hunt20 to create it');
      } else {
        console.error('- Check your Stripe API key and configuration');
        console.error('- Verify you\'re in the correct mode (test vs live)');
      }
    }

    process.exit(1);
  }
}

// Run the test
testHunt20Code();
