/**
 * Stripe Billing Portal API
 * Creates a billing portal session for subscription management
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getDatabase } from '@/lib/db';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, returnUrl } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Get user profile
    const db = getDatabase();
    const userProfile = db.prepare('SELECT * FROM user_profiles WHERE id = ?').get(userId) as {
      id: number;
      stripe_customer_id?: string;
    } | undefined;

    if (!userProfile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Use provided returnUrl or default to subscription page
    const defaultReturnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`;
    const portalReturnUrl = returnUrl || defaultReturnUrl;

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: userProfile.stripe_customer_id,
      return_url: portalReturnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return handleApiError(error, { route: '/api/stripe/billing-portal', method: req.method });
  }
}
