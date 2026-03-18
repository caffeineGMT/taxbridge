/**
 * Stripe Webhook Handler
 * Processes Stripe events: checkout completion, subscription updates, cancellations
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getDatabase } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';
import { trackAffiliateReferral } from '@/lib/stripe/affiliate-tracking';
import { trackUserReferral } from '@/lib/stripe/referral-tracking';
import { trackEmailConversion } from '@/lib/email/conversion-tracking';
import Stripe from 'stripe';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    logger.warn('Stripe webhook: missing signature', {
      endpoint: '/api/stripe/webhook',
    });


    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    logger.error('Webhook signature verification failed', {
      endpoint: '/api/stripe/webhook',
      error: err instanceof Error ? err : new Error(String(err)),
    });

    // Don't send signature errors to Sentry (normal security events)

    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  const db = getDatabase();

  // Add event type to transaction
  // TODO: Update to new Sentry SDK API
  // Sentry.setTag('stripe_event_type', event.type);

  logger.info('Stripe webhook received', {
    endpoint: '/api/stripe/webhook',
    eventType: event.type,
    eventId: event.id,
  });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const tier = session.metadata?.tier;

        if (!userId || !tier) {
          logger.error('Missing metadata in checkout session', {
            sessionId: session.id,
            userId,
            tier,
          });

          Sentry.captureMessage('Stripe checkout session missing metadata', {
            level: 'warning',
            tags: { stripe_event: 'checkout.session.completed' },
            contexts: {
              session: {
                id: session.id,
                customer: session.customer,
              },
            },
          });
          break;
        }

        // Update user profile with subscription info
        db.prepare(`
          UPDATE user_profiles
          SET subscription_tier = ?,
              stripe_customer_id = ?,
              stripe_subscription_id = ?,
              subscription_status = 'active',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(tier, session.customer, session.subscription, parseInt(userId));

        // Track analytics event
        const eventName = tier === 'pro' ? 'upgraded_to_pro' : 'upgraded_to_enterprise';
        trackEvent(parseInt(userId), eventName, {
          tier,
          stripe_customer_id: session.customer,
        });

        // Track affiliate referral if present
        await trackAffiliateReferral(session, parseInt(userId));

        // Track user-to-user referral if present
        await trackUserReferral(session, parseInt(userId));

        // Track email drip campaign conversion
        const discountCode = session.metadata?.discount_code || session.discount?.coupon?.id;
        const revenueAmount = session.amount_total ? session.amount_total / 100 : 20; // Convert cents to dollars

        trackEmailConversion({
          userId: parseInt(userId),
          conversionType: 'free_to_pro',
          revenueAmount,
          discountCode: discountCode || undefined,
          metadata: {
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            tier,
          },
        });

        logger.info('User upgraded', {
          userId,
          tier,
          customerId: session.customer,
          subscriptionId: session.subscription,
        });

        Sentry.addBreadcrumb({
          message: `User ${userId} upgraded to ${tier}`,
          level: 'info',
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;

        // Update subscription status
        db.prepare(`
          UPDATE user_profiles
          SET subscription_status = ?,
              subscription_current_period_end = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE stripe_subscription_id = ?
        `).run(
          subscription.status,
          new Date(subscription.current_period_end * 1000).toISOString(),
          subscription.id
        );

        console.log(`✓ Subscription ${subscription.id} updated to status: ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Get user info before downgrading
        const user = db.prepare(`
          SELECT id, email, first_name FROM user_profiles WHERE stripe_subscription_id = ?
        `).get(subscription.id) as { id: number; email?: string; first_name?: string } | undefined;

        // Downgrade user to free tier
        db.prepare(`
          UPDATE user_profiles
          SET subscription_tier = 'free',
              subscription_status = 'canceled',
              updated_at = CURRENT_TIMESTAMP
          WHERE stripe_subscription_id = ?
        `).run(subscription.id);

        // Track analytics event
        if (user) {
          trackEvent(user.id, 'downgraded_to_free', {
            stripe_subscription_id: subscription.id,
          });

          // Send cancellation survey email
          if (user.email) {
            try {
              await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/cancellation-survey`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: user.email,
                  firstName: user.first_name || 'there',
                  userId: user.id,
                }),
              });

              logger.info('Cancellation survey email sent', {
                userId: String(user.id),
                email: user.email,
              });
            } catch (emailError) {
              logger.error('Failed to send cancellation survey email', {
                error: emailError instanceof Error ? emailError : new Error(String(emailError)),
                userId: String(user.id),
              });
              // Don't fail the webhook if email fails
            }
          }
        }

        logger.info('Subscription canceled', {
          subscriptionId: subscription.id,
          userId: user?.id?.toString(),
        });

        console.log(`✓ Subscription ${subscription.id} canceled, user downgraded to free`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;

        // Mark subscription as past due
        if (invoice.subscription) {
          db.prepare(`
            UPDATE user_profiles
            SET subscription_status = 'past_due',
                updated_at = CURRENT_TIMESTAMP
            WHERE stripe_subscription_id = ?
          `).run(invoice.subscription);

          console.log(`✓ Payment failed for subscription ${invoice.subscription}`);
        }
        break;
      }

      default:
        logger.debug('Unhandled Stripe event type', { eventType: event.type });
    }

    const duration = Date.now() - startTime;

    logger.info('Stripe webhook processed', {
      endpoint: '/api/stripe/webhook',
      eventType: event.type,
      duration,
    });


    return NextResponse.json({ received: true });
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Error processing webhook', {
      endpoint: '/api/stripe/webhook',
      eventType: event.type,
      duration,
      error: error instanceof Error ? error : new Error(String(error)),
    });

    Sentry.captureException(error, {
      level: 'error',
      tags: {
        route: '/api/stripe/webhook',
        stripe_event_type: event.type,
        level: 'critical',
      },
      contexts: {
        stripe: {
          event_id: event.id,
          event_type: event.type,
        },
        performance: { duration },
      },
    });


    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
