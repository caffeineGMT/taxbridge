/**
 * Stripe Payment Intent Creation API
 * Creates a new payment intent for embedded checkout (Variant B)
 * Unlike checkout sessions, payment intents allow for on-site payment collection
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getDatabase } from '@/lib/db';
import { getUserByReferralCode } from '@/lib/db/queries/referrals';
import { handleApiError, validationError, stripeError } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { priceId, tier, userId, referralCode, userReferralCode } = body;

    if (!priceId || !tier || !userId) {
      throw validationError('Missing required fields: priceId, tier, userId');
    }

    // Validate tier
    if (!['pro', 'enterprise'].includes(tier)) {
      throw validationError('Invalid tier. Must be "pro" or "enterprise"');
    }

    // Get user profile
    const db = getDatabase();
    const userProfile = db.prepare('SELECT * FROM user_profiles WHERE id = ?').get(userId) as {
      id: number;
      email?: string;
      stripe_customer_id?: string;
    } | undefined;

    if (!userProfile) {
      throw validationError('User not found');
    }

    // Get or create Stripe customer
    let customerId = userProfile.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userProfile.email,
        metadata: {
          user_id: userId.toString(),
        },
      });
      customerId = customer.id;

      // Update user profile with customer ID
      db.prepare('UPDATE user_profiles SET stripe_customer_id = ? WHERE id = ?').run(customerId, userId);
    }

    // Get price details to determine amount
    const price = await stripe.prices.retrieve(priceId);
    const amount = price.unit_amount || 0;

    // Calculate discount if referral code is present
    let discountAmount = 0;
    if (userReferralCode) {
      const referrer = getUserByReferralCode(userReferralCode);
      if (referrer && referrer.id !== userId) {
        // Apply 20% discount
        discountAmount = Math.round(amount * 0.2);
      }
    }

    const finalAmount = amount - discountAmount;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: 'usd',
      customer: customerId,
      metadata: {
        user_id: userId.toString(),
        tier,
        price_id: priceId,
        ...(referralCode && { referred_by: referralCode }),
        ...(userReferralCode && { user_referral_code: userReferralCode }),
        ...(discountAmount > 0 && { discount_amount: discountAmount.toString() }),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create subscription in 'incomplete' status (will be confirmed on payment success via webhook)
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: userId.toString(),
        tier,
        ...(referralCode && { referred_by: referralCode }),
        ...(userReferralCode && { user_referral_code: userReferralCode }),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    // Handle Stripe-specific errors
    if (error instanceof Error && error.message.includes('Stripe')) {
      throw stripeError('Failed to create payment intent', { originalError: error.message });
    }
    return handleApiError(error, { route: '/api/stripe/create-payment-intent', method: 'POST' });
  }
}
