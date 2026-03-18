/**
 * Stripe Checkout Session Creation API
 * Creates a new checkout session for subscription upgrade
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';
import { getDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { priceId, tier, userId } = body;

    if (!priceId || !tier || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId, tier, userId' },
        { status: 400 }
      );
    }

    // Validate tier
    if (!['pro', 'enterprise'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "pro" or "enterprise"' },
        { status: 400 }
      );
    }

    // Get user profile
    const db = getDatabase();
    const userProfile = db.prepare('SELECT * FROM user_profiles WHERE id = ?').get(userId) as {
      id: number;
      email?: string;
      stripe_customer_id?: string;
    } | undefined;

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: userProfile.stripe_customer_id || undefined,
      customer_email: !userProfile.stripe_customer_id && userProfile.email ? userProfile.email : undefined,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: STRIPE_CONFIG.successUrl,
      cancel_url: STRIPE_CONFIG.cancelUrl,
      metadata: {
        user_id: userId.toString(),
        tier,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
