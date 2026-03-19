/**
 * Stripe Subscription Cancellation API
 * Handles immediate and end-of-period cancellations with proper error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { getDatabase } from '@/lib/db';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';
import { trackEvent } from '@/lib/analytics';
import { handleStripeError } from '@/lib/stripe/error-handler';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { userId } = await auth();

    if (!userId) {
      logger.warn('Unauthorized cancellation attempt', {
        endpoint: '/api/stripe/cancel-subscription',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { immediate = false, feedback } = body;

    const db = getDatabase();

    // Get user profile with subscription
    const userProfile = db.prepare(`
      SELECT id, stripe_subscription_id, email, first_name, subscription_tier
      FROM user_profiles
      WHERE clerk_user_id = ?
    `).get(userId) as {
      id: number;
      stripe_subscription_id?: string;
      email?: string;
      first_name?: string;
      subscription_tier: string;
    } | undefined;

    if (!userProfile) {
      logger.error('User not found for cancellation', {
        clerkUserId: userId,
      });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!userProfile.stripe_subscription_id) {
      logger.warn('No active subscription to cancel', {
        userId: String(userProfile.id),
        tier: userProfile.subscription_tier,
      });
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Get the subscription details
    const subscription = await stripe.subscriptions.retrieve(
      userProfile.stripe_subscription_id
    );

    // Verify subscription can be canceled
    if (subscription.status === 'canceled') {
      return NextResponse.json(
        { error: 'Subscription is already canceled' },
        { status: 400 }
      );
    }

    // Cancel the subscription
    const canceledSubscription = await stripe.subscriptions.update(
      userProfile.stripe_subscription_id,
      {
        cancel_at_period_end: !immediate,
        ...(immediate && { status: 'canceled' }),
        metadata: {
          canceled_by_user: 'true',
          cancellation_reason: feedback?.reason || 'user_requested',
          cancellation_feedback: feedback?.comments || '',
        },
      }
    );

    const cancelDate = immediate
      ? new Date()
      : new Date(((canceledSubscription as any).current_period_end || 0) * 1000);

    // Update database
    if (immediate) {
      db.prepare(`
        UPDATE user_profiles
        SET subscription_tier = 'free',
            subscription_status = 'canceled',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(userProfile.id);
    } else {
      db.prepare(`
        UPDATE user_profiles
        SET subscription_status = 'canceling',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(userProfile.id);
    }

    // Store cancellation feedback
    if (feedback) {
      db.prepare(`
        INSERT INTO cancellation_feedback (
          user_id,
          subscription_id,
          reason,
          comments,
          satisfaction_score,
          would_recommend,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(
        userProfile.id,
        userProfile.stripe_subscription_id,
        feedback.reason || null,
        feedback.comments || null,
        feedback.satisfaction || null,
        feedback.wouldRecommend || null
      );
    }

    const duration = Date.now() - startTime;

    logger.info('Subscription canceled', {
      userId: String(userProfile.id),
      subscriptionId: userProfile.stripe_subscription_id,
      immediate,
      cancelDate: cancelDate.toISOString(),
      reason: feedback?.reason || 'not_provided',
      duration,
    });

    // Track analytics
    trackEvent(userProfile.id, 'subscription_canceled', {
      subscription_id: userProfile.stripe_subscription_id,
      cancellation_type: immediate ? 'immediate' : 'end_of_period',
      cancel_date: cancelDate.toISOString(),
      reason: feedback?.reason || 'not_provided',
      had_feedback: !!feedback,
    });

    // Send cancellation confirmation email
    if (userProfile.email) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/cancellation-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userProfile.email,
            firstName: userProfile.first_name || 'there',
            userId: userProfile.id,
            immediate,
            cancelDate: cancelDate.toISOString(),
            feedbackProvided: !!feedback,
          }),
        });

        logger.info('Cancellation confirmation email sent', {
          userId: String(userProfile.id),
          email: userProfile.email,
        });
      } catch (emailError) {
        logger.error('Failed to send cancellation confirmation email', {
          error: emailError instanceof Error ? emailError : new Error(String(emailError)),
          userId: String(userProfile.id),
        });
        // Don't fail the cancellation if email fails
      }
    }

    Sentry.addBreadcrumb({
      message: `Subscription canceled for user ${userProfile.id}`,
      level: 'info',
      data: {
        subscriptionId: userProfile.stripe_subscription_id,
        immediate,
        cancelDate: cancelDate.toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: immediate
        ? 'Subscription canceled immediately'
        : 'Subscription will be canceled at the end of the current billing period',
      cancel_at: cancelDate.toISOString(),
      access_until: cancelDate.toISOString(),
      subscription_id: canceledSubscription.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Failed to cancel subscription', {
      endpoint: '/api/stripe/cancel-subscription',
      duration,
      error: error instanceof Error ? error : new Error(String(error)),
    });

    Sentry.captureException(error, {
      level: 'error',
      tags: {
        route: '/api/stripe/cancel-subscription',
        error_type: 'subscription_cancel_failed',
      },
      contexts: {
        performance: { duration },
      },
    });

    // Handle Stripe-specific errors
    const paymentError = handleStripeError(error);

    return NextResponse.json(
      {
        error: 'Failed to cancel subscription',
        message: paymentError.userMessage,
        code: paymentError.code,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve cancellation options and pricing info
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDatabase();

    const userProfile = db.prepare(`
      SELECT id, stripe_subscription_id, subscription_tier, subscription_status
      FROM user_profiles
      WHERE clerk_user_id = ?
    `).get(userId) as {
      id: number;
      stripe_subscription_id?: string;
      subscription_tier: string;
      subscription_status?: string;
    } | undefined;

    if (!userProfile?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(
      userProfile.stripe_subscription_id
    );

    const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
    const daysRemaining = Math.ceil(
      (currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_end: currentPeriodEnd.toISOString(),
        days_remaining: daysRemaining,
        cancel_at_period_end: subscription.cancel_at_period_end,
      },
      options: {
        immediate: {
          label: 'Cancel Immediately',
          description: 'End your subscription right now and switch to the Free plan',
          impact: 'You will lose Pro features immediately',
        },
        end_of_period: {
          label: 'Cancel at Period End',
          description: `Keep Pro features until ${currentPeriodEnd.toLocaleDateString()}`,
          impact: `You have ${daysRemaining} days of Pro access remaining`,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to retrieve cancellation options', {
      error: error instanceof Error ? error : new Error(String(error)),
    });

    return NextResponse.json(
      { error: 'Failed to retrieve cancellation options' },
      { status: 500 }
    );
  }
}
