/**
 * Create HUNT20 Promotion Code for Product Hunt Launch
 *
 * Creates a 20% discount code valid for 48 hours with max 200 redemptions
 *
 * Prerequisites:
 * 1. Stripe production API key configured in .env.local
 * 2. Pro plan price ID created (run setup:stripe first)
 * 3. Production mode active in Stripe Dashboard
 *
 * Usage: npm run create:hunt20
 */

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  console.error('Please add your Stripe secret key to .env.local');
  process.exit(1);
}

if (stripeSecretKey.startsWith('sk_test_')) {
  console.warn('⚠️  WARNING: Using test mode. For production launch, use sk_live_ key');
  console.warn('Get production keys from: https://dashboard.stripe.com/apikeys\n');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

async function createHunt20Promo() {
  console.log('🚀 Creating HUNT20 promotion code for Product Hunt launch...\n');

  try {
    // Step 1: Create the coupon (20% off)
    console.log('Step 1/2: Creating 20% discount coupon...');
    const coupon = await stripe.coupons.create({
      percent_off: 20,
      duration: 'once', // One-time discount (applied to first payment)
      name: 'Product Hunt Launch - 20% Off',
      metadata: {
        campaign: 'product_hunt_launch',
        launch_date: new Date().toISOString().split('T')[0],
      },
    });
    console.log(`✓ Coupon created: ${coupon.id}\n`);

    // Step 2: Create the promotion code HUNT20
    // Valid for 48 hours from now
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + (48 * 60 * 60); // 48 hours from now

    console.log('Step 2/2: Creating HUNT20 promotion code...');
    const promoCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: 'HUNT20',
      max_redemptions: 200,
      expires_at: expiresAt,
      metadata: {
        source: 'product_hunt',
        campaign: 'launch_week',
      },
    });
    console.log(`✓ Promotion code created: ${promoCode.code}\n`);

    // Print success summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS! HUNT20 Promotion Code Created');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 Promotion Details:');
    console.log(`   Code:           ${promoCode.code}`);
    console.log(`   Discount:       20% off first payment`);
    console.log(`   Max Uses:       ${promoCode.max_redemptions} redemptions`);
    console.log(`   Expires:        ${new Date(expiresAt * 1000).toLocaleString()}`);
    console.log(`   Time Remaining: 48 hours from now`);
    console.log(`   Coupon ID:      ${coupon.id}`);
    console.log(`   Promo Code ID:  ${promoCode.id}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 Pricing Breakdown:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('   Pro Plan Original:    $299/year');
    console.log('   With HUNT20 (20% off): $239/year');
    console.log('   Savings per customer:  $60\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Revenue Projections:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('   Conservative (20 subs):  $4,780');
    console.log('   Target (50 subs):        $11,950');
    console.log('   Optimistic (100 subs):   $23,900');
    console.log('   Max (200 redemptions):   $47,800\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 Next Steps:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('1. Test the discount code:');
    console.log('   npm run test:hunt20\n');
    console.log('2. View in Stripe Dashboard:');
    console.log('   https://dashboard.stripe.com/coupons/' + coupon.id);
    console.log('   https://dashboard.stripe.com/promotion_codes/' + promoCode.id + '\n');
    console.log('3. Add to Product Hunt first comment:');
    console.log('   "Use code HUNT20 for 20% off Pro plan (next 48 hours only!)"\n');
    console.log('4. Monitor redemptions during launch:');
    console.log('   https://dashboard.stripe.com/promotion_codes/' + promoCode.id + '\n');
    console.log('5. Schedule Product Hunt submission:');
    console.log('   Next Tuesday 12:01 AM PST\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Important Reminders:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('- Code expires in 48 hours - time it with launch day');
    console.log('- Maximum 200 redemptions - code auto-expires at limit');
    console.log('- Discount applies to first payment only (annual billing)');
    console.log('- Monitor Stripe dashboard during launch for real-time stats');
    console.log('- Promote heavily in Product Hunt first comment\n');

    console.log('🎉 Ready for Product Hunt launch!');
    console.log('');

  } catch (error: any) {
    console.error('❌ Error creating HUNT20 promotion code:');
    console.error(error.message);

    if (error.type === 'StripeInvalidRequestError') {
      console.error('\n💡 Troubleshooting:');

      if (error.message.includes('already exists')) {
        console.error('- A promotion code with this name already exists');
        console.error('- View existing codes: https://dashboard.stripe.com/promotion_codes');
        console.error('- Delete old HUNT20 code or use different name');
      } else if (error.message.includes('price')) {
        console.error('- Verify Pro plan price ID exists in Stripe');
        console.error('- Run: npm run setup:stripe to create products first');
      } else {
        console.error('- Verify your Stripe API key is correct');
        console.error('- Check if you have permission to create coupons');
        console.error('- Make sure you\'re using the right mode (test vs live)');
      }
    }

    process.exit(1);
  }
}

// Run the script
createHunt20Promo();
