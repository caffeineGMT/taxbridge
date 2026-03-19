/**
 * Stripe Customer Portal Session Creation API
 * Creates a billing portal session for subscription management
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { getDatabase } from '@/lib/db';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDatabase();

    // Get user profile
    const userProfile = db.prepare(`
      SELECT id, stripe_customer_id
      FROM user_profiles
      WHERE clerk_user_id = ?
    `).get(userId) as {
      id: number;
      stripe_customer_id?: string;
    } | undefined;

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!userProfile.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: userProfile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return handleApiError(error, { route: '/api/stripe/create-portal-session', method: req.method });
  }
}
