/**
 * Stripe Subscription Pause API
 * Pauses subscription for 3 months using Stripe Subscription Schedule API
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { getDatabase } from '@/lib/db';
import { addMonths } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDatabase();

    // Get user profile with subscription
    const userProfile = db.prepare(`
      SELECT id, stripe_subscription_id, email
      FROM user_profiles
      WHERE clerk_user_id = ?
    `).get(userId) as {
      id: number;
      stripe_subscription_id?: string;
      email?: string;
    } | undefined;

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!userProfile.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(
      userProfile.stripe_subscription_id
    );

    // Calculate pause end date (3 months from now)
    const pauseEndDate = addMonths(new Date(), 3);
    const pauseEndTimestamp = Math.floor(pauseEndDate.getTime() / 1000);

    // Create a subscription schedule to pause the subscription
    const schedule = await stripe.subscriptionSchedules.create({
      from_subscription: userProfile.stripe_subscription_id,
    });

    // Update the schedule to add a pause phase
    await stripe.subscriptionSchedules.update(schedule.id, {
      phases: [
        {
          items: subscription.items.data.map((item) => ({
            price: item.price.id,
            quantity: item.quantity,
          })),
          start_date: Math.floor(Date.now() / 1000),
          end_date: Math.floor(Date.now() / 1000) + 1, // End immediately to start pause
        },
        {
          items: subscription.items.data.map((item) => ({
            price: item.price.id,
            quantity: item.quantity,
          })),
          start_date: pauseEndTimestamp,
          // No end_date means it continues indefinitely after resume
        },
      ],
      end_behavior: 'release',
    });

    // Update subscription status in database
    db.prepare(`
      UPDATE user_profiles
      SET subscription_status = 'paused',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(userProfile.id);

    return NextResponse.json({
      success: true,
      message: 'Subscription paused for 3 months',
      resume_date: pauseEndDate.toISOString(),
    });
  } catch (error) {
    console.error('Error pausing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to pause subscription' },
      { status: 500 }
    );
  }
}
