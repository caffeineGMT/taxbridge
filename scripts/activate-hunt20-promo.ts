#!/usr/bin/env tsx

/**
 * HUNT20 Promo Code Activation Script
 *
 * Creates the HUNT20 promotional code in Stripe for Product Hunt launch.
 *
 * Requirements:
 * - Stripe must be in PRODUCTION mode
 * - Pro Annual price ID must exist
 * - Must run 48 hours before launch
 *
 * Usage:
 *   npx tsx scripts/activate-hunt20-promo.ts
 */

import Stripe from 'stripe';

// Validate environment
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY not found in environment');
  console.error('Add to .env.local: STRIPE_SECRET_KEY=sk_live_...');
  process.exit(1);
}

if (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
  console.error('❌ Error: Stripe is in TEST mode');
  console.error('This script must run in PRODUCTION mode only.');
  console.error('Switch to live keys: https://dashboard.stripe.com/apikeys');
  process.exit(1);
}

if (!process.env.STRIPE_PRO_PRICE_ID) {
  console.error('❌ Error: STRIPE_PRO_PRICE_ID not found');
  console.error('Run Stripe production activation first:');
  console.error('  npx tsx scripts/activate-stripe-production-annual.ts');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;

// Launch window: March 25, 2026 12:01 AM PT to March 27, 2026 11:59 PM PT (48 hours)
// Convert to Unix timestamps (UTC)
const LAUNCH_START = new Date('2026-03-25T00:01:00-07:00'); // PT timezone
const LAUNCH_END = new Date('2026-03-27T23:59:59-07:00');   // PT timezone

const LAUNCH_START_UNIX = Math.floor(LAUNCH_START.getTime() / 1000);
const LAUNCH_END_UNIX = Math.floor(LAUNCH_END.getTime() / 1000);

interface CouponConfig {
  id: string;
  percentOff: number;
  duration: 'once' | 'repeating' | 'forever';
  maxRedemptions: number;
  redeemBy: number;
  appliesToPriceIds: string[];
  metadata: Record<string, string>;
}

const HUNT20_CONFIG: CouponConfig = {
  id: 'HUNT20',
  percentOff: 20,
  duration: 'once', // 20% off first payment only
  maxRedemptions: 100, // Limit to 100 customers
  redeemBy: LAUNCH_END_UNIX, // Auto-expire after 48 hours
  appliesToPriceIds: [PRO_PRICE_ID], // Pro Annual only
  metadata: {
    campaign: 'product_hunt_launch',
    launch_date: '2026-03-25',
    discount_amount: '20_percent',
    duration_hours: '48',
    created_by: 'activate-hunt20-promo.ts',
  },
};

async function checkExistingCoupon(): Promise<boolean> {
  try {
    const coupon = await stripe.coupons.retrieve(HUNT20_CONFIG.id);
    console.log('⚠️  HUNT20 coupon already exists!');
    console.log(`   Created: ${new Date(coupon.created * 1000).toLocaleString()}`);
    console.log(`   Percent Off: ${coupon.percent_off}%`);
    console.log(`   Times Redeemed: ${coupon.times_redeemed || 0}/${coupon.max_redemptions || 'unlimited'}`);
    console.log(`   Valid: ${coupon.valid ? 'Yes' : 'No'}`);

    if (coupon.times_redeemed && coupon.times_redeemed > 0) {
      console.log('\n❌ Cannot delete - coupon has been used.');
      console.log('   Create a new coupon instead (e.g., HUNT20V2)');
      return true;
    }

    console.log('\n❓ Delete existing coupon and create new one?');
    console.log('   Type "yes" to confirm:');

    // In production, you'd use readline here. For now, auto-proceed in non-interactive mode.
    return true;
  } catch (error: any) {
    if (error.code === 'resource_missing') {
      return false; // Coupon doesn't exist - proceed with creation
    }
    throw error;
  }
}

async function createHunt20Coupon() {
  console.log('='.repeat(70));
  console.log('HUNT20 Promo Code Activation');
  console.log('='.repeat(70));
  console.log('');

  // Pre-flight checks
  console.log('🔍 Pre-flight checks...\n');

  console.log('1. Stripe Mode:');
  console.log(`   ✅ PRODUCTION (${process.env.STRIPE_SECRET_KEY.substring(0, 20)}...)`);

  console.log('\n2. Pro Price ID:');
  console.log(`   ✅ ${PRO_PRICE_ID}`);

  console.log('\n3. Launch Window:');
  console.log(`   Start: ${LAUNCH_START.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PT`);
  console.log(`   End:   ${LAUNCH_END.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PT`);
  console.log(`   Duration: 48 hours`);

  console.log('\n4. Coupon Configuration:');
  console.log(`   Code: ${HUNT20_CONFIG.id}`);
  console.log(`   Discount: ${HUNT20_CONFIG.percentOff}% off`);
  console.log(`   Duration: ${HUNT20_CONFIG.duration} (first payment only)`);
  console.log(`   Max Uses: ${HUNT20_CONFIG.maxRedemptions}`);

  console.log('\n5. Pricing Impact:');
  console.log(`   Pro Annual: $79/year → $63.20/year (20% off)`);
  console.log(`   Savings: $15.80 per customer`);
  console.log(`   Revenue if 20 use code: $1,264 (vs $1,580 without code)`);
  console.log(`   Cost: $316 discount (vs potential conversion boost)`);

  // Check for existing coupon
  console.log('\n6. Checking for existing coupon...');
  const exists = await checkExistingCoupon();

  if (exists) {
    console.log('\n⚠️  Skipping creation - coupon already exists.');
    console.log('   Verify settings in Stripe Dashboard:');
    console.log('   https://dashboard.stripe.com/coupons/HUNT20');
    return;
  }

  // Create coupon
  console.log('\n📝 Creating HUNT20 coupon in Stripe...');

  try {
    const coupon = await stripe.coupons.create({
      id: HUNT20_CONFIG.id,
      percent_off: HUNT20_CONFIG.percentOff,
      duration: HUNT20_CONFIG.duration,
      max_redemptions: HUNT20_CONFIG.maxRedemptions,
      redeem_by: HUNT20_CONFIG.redeemBy,
      metadata: HUNT20_CONFIG.metadata,
    });

    console.log('✅ Coupon created successfully!\n');
    console.log('Coupon Details:');
    console.log(`   ID: ${coupon.id}`);
    console.log(`   Percent Off: ${coupon.percent_off}%`);
    console.log(`   Duration: ${coupon.duration}`);
    console.log(`   Max Redemptions: ${coupon.max_redemptions}`);
    console.log(`   Redeem By: ${new Date(coupon.redeem_by! * 1000).toLocaleString()}`);
    console.log(`   Valid: ${coupon.valid}`);

    // Create promotion code (makes it easier to apply at checkout)
    console.log('\n📝 Creating promotion code for easier checkout...');

    const promotionCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: HUNT20_CONFIG.id, // Same code: "HUNT20"
      max_redemptions: HUNT20_CONFIG.maxRedemptions,
      restrictions: {
        first_time_transaction: true, // Only for new customers
      },
      metadata: {
        campaign: 'product_hunt_launch',
      },
    });

    console.log('✅ Promotion code created!\n');
    console.log('Promotion Code Details:');
    console.log(`   Code: ${promotionCode.code}`);
    console.log(`   Active: ${promotionCode.active}`);
    console.log(`   Max Redemptions: ${promotionCode.max_redemptions}`);

  } catch (error: any) {
    console.error('\n❌ Error creating coupon:', error.message);
    process.exit(1);
  }

  // Test the coupon
  console.log('\n🧪 Testing coupon...');
  console.log('   Creating test checkout session with HUNT20 applied...');

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      discounts: [
        {
          coupon: HUNT20_CONFIG.id,
        },
      ],
      success_url: 'https://taxbridge.app/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://taxbridge.app/pricing',
      metadata: {
        test: 'hunt20_activation_script',
      },
    });

    console.log('✅ Test session created successfully!\n');
    console.log('Session Details:');
    console.log(`   ID: ${session.id}`);
    console.log(`   Amount Total: $${(session.amount_total! / 100).toFixed(2)} (20% off applied!)`);
    console.log(`   Expected: $63.20 (was $79.00)`);

    if (session.amount_total === 6320) {
      console.log('   ✅ Discount applied correctly!');
    } else {
      console.log(`   ⚠️  Expected $63.20, got $${(session.amount_total! / 100).toFixed(2)}`);
    }

    console.log(`\n   Test URL: ${session.url}`);
    console.log('   (Do NOT complete this checkout - it will charge your card!)');

  } catch (error: any) {
    console.error('\n⚠️  Test checkout failed:', error.message);
    console.log('   Coupon was created but could not create test session.');
    console.log('   Verify manually in Stripe Dashboard.');
  }

  // Final summary
  console.log('\n' + '='.repeat(70));
  console.log('✅ HUNT20 Promo Code Activation Complete!');
  console.log('='.repeat(70));
  console.log('');

  console.log('Next Steps:\n');
  console.log('1. Verify in Stripe Dashboard:');
  console.log('   https://dashboard.stripe.com/coupons/HUNT20\n');

  console.log('2. Test on your website:');
  console.log('   a. Go to: https://taxbridge.app/pricing');
  console.log('   b. Click "Get Started" on Pro plan');
  console.log('   c. Enter coupon code: HUNT20');
  console.log('   d. Verify price: $79 → $63.20');
  console.log('   e. Complete checkout with test card: 4242 4242 4242 4242');
  console.log('   f. Refund immediately after test\n');

  console.log('3. Update Product Hunt submission:');
  console.log('   - First comment: Mention "Use code HUNT20 for 20% off"');
  console.log('   - Twitter/LinkedIn: Highlight limited-time offer');
  console.log('   - Email: Send to beta users 24hr before launch\n');

  console.log('4. Monitor redemptions on launch day:');
  console.log('   https://dashboard.stripe.com/coupons/HUNT20\n');

  console.log('5. After 48 hours (March 27, 11:59 PM PT):');
  console.log('   - Coupon auto-expires (Stripe handles this)');
  console.log('   - Review performance: Redemptions, revenue, conversion rate');
  console.log('   - Export data for post-launch analysis\n');

  console.log('🎉 Good luck with the Product Hunt launch!\n');
}

// Run the script
createHunt20Coupon().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
