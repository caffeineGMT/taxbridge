/**
 * Stripe Subscription Pause API
 * Pauses subscription for 3 months using Stripe Subscription Schedule API
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { getDatabase } from '@/lib/db';
import { addMonths } from 'date-fns';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';
import { trackEvent } from '@/lib/analytics';
import { handleStripeError } from '@/lib/stripe/error-handler';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { userId } = await auth();

    if (!userId) {
      logger.warn('Unauthorized pause subscription attempt', {
        endpoint: '/api/stripe/pause-subscription',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDatabase();

    // Get user profile with subscription
    const userProfile = db.prepare(`
      SELECT id, stripe_subscription_id, email, subscription_tier
      FROM user_profiles
      WHERE clerk_user_id = ?
    `).get(userId) as {
      id: number;
      stripe_subscription_id?: string;
      email?: string;
      subscription_tier: string;
    } | undefined;

    if (!userProfile) {
      logger.error('User not found for pause request', {
        clerkUserId: userId,
      });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!userProfile.stripe_subscription_id) {
      logger.warn('No active subscription to pause', {
        userId: String(userProfile.id),
        tier: userProfile.subscription_tier,
      });
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(
      userProfile.stripe_subscription_id
    );

    // Verify subscription is in pausable state
    if (subscription.status === 'canceled') {
      return NextResponse.json(
        { error: 'Cannot pause a canceled subscription' },
        { status: 400 }
      );
    }

    if (subscription.status === 'paused') {
      return NextResponse.json(
        { error: 'Subscription is already paused' },
        { status: 400 }
      );
    }

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

    const duration = Date.now() - startTime;

    logger.info('Subscription paused successfully', {
      userId: String(userProfile.id),
      subscriptionId: userProfile.stripe_subscription_id,
      pauseEndDate: pauseEndDate.toISOString(),
      duration,
    });

    // Track analytics
    trackEvent(userProfile.id, 'subscription_paused', {
      subscription_id: userProfile.stripe_subscription_id,
      pause_duration_months: 3,
      resume_date: pauseEndDate.toISOString(),
    });

    Sentry.addBreadcrumb({
      message: `Subscription paused for user ${userProfile.id}`,
      level: 'info',
      data: {
        subscriptionId: userProfile.stripe_subscription_id,
        resumeDate: pauseEndDate.toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription paused for 3 months',
      resume_date: pauseEndDate.toISOString(),
      schedule_id: schedule.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Failed to pause subscription', {
      endpoint: '/api/stripe/pause-subscription',
      duration,
      error: error instanceof Error ? error : new Error(String(error)),
    });

    Sentry.captureException(error, {
      level: 'error',
      tags: {
        route: '/api/stripe/pause-subscription',
        error_type: 'subscription_pause_failed',
      },
      contexts: {
        performance: { duration },
      },
    });

    // Handle Stripe-specific errors with user-friendly messages
    const paymentError = handleStripeError(error);

    return NextResponse.json(
      {
        error: 'Failed to pause subscription',
        message: paymentError.userMessage,
        code: paymentError.code,
      },
      { status: 500 }
    );
  }
}
