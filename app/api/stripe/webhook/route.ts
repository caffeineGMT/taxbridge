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
import { trackPaidUpgrade } from '@/lib/analytics/attribution-middleware';
import Stripe from 'stripe';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import {
  isEventProcessed,
  markEventProcessed,
  incrementRetryCount,
  initWebhookEventsTable,
} from '@/lib/stripe/webhook-deduplication';

export async function POST(req: NextRequest) {
  // Rate limiting: generous for webhooks (signature-verified), but still protect against abuse
  const rateLimitResult = await rateLimit(req, RateLimitPresets.GENEROUS);
  if (rateLimitResult) return rateLimitResult;

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

  // Initialize webhook events table if needed
  try {
    initWebhookEventsTable();
  } catch (error) {
    logger.warn('Webhook events table already exists', {
      error: error instanceof Error ? error : new Error(String(error)),
    });
  }

  // Check for duplicate event (idempotency)
  if (isEventProcessed(event.id)) {
    const retryCount = incrementRetryCount(event.id);

    logger.info('Duplicate webhook event received (already processed)', {
      endpoint: '/api/stripe/webhook',
      eventType: event.type,
      eventId: event.id,
      retryCount,
    });

    // Return success to prevent Stripe from retrying
    return NextResponse.json({
      received: true,
      duplicate: true,
      message: 'Event already processed',
    });
  }

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

        // Track standard PostHog checkout events
        if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
          try {
            const revenueAmount = session.amount_total ? session.amount_total / 100 : (tier === 'pro' ? 20 : 100);

            // Track checkout_completed event
            const checkoutCompletedEvent = {
              api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
              event: 'checkout_completed',
              properties: {
                distinct_id: userId,
                plan: tier,
                revenue: revenueAmount,
                currency: 'USD',
                funnelStep: 'Payment Success',
                funnelStepNumber: 7,
                stripe_customer_id: session.customer,
                stripe_session_id: session.id,
              },
              timestamp: new Date().toISOString(),
            };

            await fetch('https://app.posthog.com/capture/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(checkoutCompletedEvent),
            });

            // Track subscription_activated event
            const subscriptionActivatedEvent = {
              api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
              event: 'subscription_activated',
              properties: {
                distinct_id: userId,
                plan: tier,
                revenue: revenueAmount,
                currency: 'USD',
                billingInterval: 'annual',
                stripe_customer_id: session.customer,
                stripe_subscription_id: session.subscription,
                $set: {
                  subscription_tier: tier,
                  subscription_status: 'active',
                },
              },
              timestamp: new Date().toISOString(),
            };

            await fetch('https://app.posthog.com/capture/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(subscriptionActivatedEvent),
            });

            logger.info('PostHog events tracked', {
              userId,
              events: ['checkout_completed', 'subscription_activated'],
            });
          } catch (analyticsError) {
            // Don't fail webhook if analytics fails
            logger.warn('PostHog tracking failed', {
              error: analyticsError instanceof Error ? analyticsError : new Error(String(analyticsError)),
            });
          }
        }

        // Track affiliate referral if present
        await trackAffiliateReferral(session, parseInt(userId));

        // Track user-to-user referral if present
        await trackUserReferral(session, parseInt(userId));

        // Track email drip campaign conversion
        const coupon = session.discounts?.[0]?.coupon;
        const discountCode = session.metadata?.discount_code || (typeof coupon === 'string' ? coupon : coupon?.id);
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

        // Track paid upgrade for channel attribution
        await trackPaidUpgrade(
          parseInt(userId),
          tier as 'pro' | 'enterprise',
          revenueAmount
        );

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

        logger.info(`✓ Subscription ${subscription.id} updated to status: ${subscription.status}`);
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

        logger.info(`✓ Subscription ${subscription.id} canceled, user downgraded to free`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        // Mark subscription as past due
        if ((invoice as any).subscription) {
          db.prepare(`
            UPDATE user_profiles
            SET subscription_status = 'past_due',
                updated_at = CURRENT_TIMESTAMP
            WHERE stripe_subscription_id = ?
          `).run((invoice as any).subscription);

          logger.warn('Payment failed for subscription', {
            subscriptionId: (invoice as any).subscription,
            invoiceId: invoice.id,
            amountDue: invoice.amount_due,
            attemptCount: invoice.attempt_count,
          });

          // Get user info for notification
          const user = db.prepare(`
            SELECT id, email, first_name FROM user_profiles WHERE stripe_subscription_id = ?
          `).get((invoice as any).subscription) as { id: number; email?: string; first_name?: string } | undefined;

          if (user?.email) {
            try {
              // Send payment failure notification email
              await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/payment-failed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: user.email,
                  firstName: user.first_name || 'there',
                  userId: user.id,
                  invoiceUrl: invoice.hosted_invoice_url,
                  amountDue: (invoice.amount_due / 100).toFixed(2),
                  attemptCount: invoice.attempt_count,
                }),
              });

              logger.info('Payment failure email sent', {
                userId: String(user.id),
                email: user.email,
              });
            } catch (emailError) {
              logger.error('Failed to send payment failure email', {
                error: emailError instanceof Error ? emailError : new Error(String(emailError)),
                userId: String(user.id),
              });
              // Don't fail the webhook if email fails
            }
          }

          // Track analytics
          if (user) {
            trackEvent(user.id, 'payment_failed', {
              stripe_subscription_id: (invoice as any).subscription,
              amount_due: invoice.amount_due,
              attempt_count: invoice.attempt_count,
            });
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        logger.info('Invoice payment succeeded', {
          invoiceId: invoice.id,
          subscriptionId: (invoice as any).subscription,
          amountPaid: invoice.amount_paid,
        });

        // Track successful payment
        if ((invoice as any).subscription) {
          const user = db.prepare(`
            SELECT id FROM user_profiles WHERE stripe_subscription_id = ?
          `).get((invoice as any).subscription) as { id: number } | undefined;

          if (user) {
            trackEvent(user.id, 'payment_succeeded', {
              stripe_subscription_id: (invoice as any).subscription,
              amount_paid: invoice.amount_paid,
              invoice_id: invoice.id,
            });
          }
        }
        break;
      }

      case 'invoice.finalized': {
        const invoice = event.data.object as Stripe.Invoice;

        logger.info('Invoice finalized', {
          invoiceId: invoice.id,
          subscriptionId: (invoice as any).subscription,
          hostedInvoiceUrl: invoice.hosted_invoice_url,
        });

        // Track invoice creation/finalization
        if ((invoice as any).subscription) {
          const user = db.prepare(`
            SELECT id, email FROM user_profiles WHERE stripe_subscription_id = ?
          `).get((invoice as any).subscription) as { id: number; email?: string } | undefined;

          if (user) {
            // Store invoice details for tracking
            db.prepare(`
              INSERT OR REPLACE INTO invoices (
                stripe_invoice_id,
                user_id,
                subscription_id,
                amount_due,
                status,
                hosted_url,
                created_at
              ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).run(
              invoice.id,
              user.id,
              (invoice as any).subscription,
              invoice.amount_due,
              invoice.status,
              invoice.hosted_invoice_url
            );

            trackEvent(user.id, 'invoice_created', {
              stripe_subscription_id: (invoice as any).subscription,
              invoice_id: invoice.id,
              amount_due: invoice.amount_due,
            });
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;

        logger.info('Charge refunded', {
          chargeId: charge.id,
          amountRefunded: charge.amount_refunded,
          refunded: charge.refunded,
        });

        // Track refund
        const paymentIntent = charge.payment_intent;
        if (paymentIntent) {
          // Find user by payment intent (stored in checkout session)
          const user = db.prepare(`
            SELECT id FROM user_profiles WHERE stripe_customer_id = ?
          `).get(charge.customer) as { id: number } | undefined;

          if (user) {
            trackEvent(user.id, 'charge_refunded', {
              charge_id: charge.id,
              amount_refunded: charge.amount_refunded,
              refund_reason: charge.refunds?.data[0]?.reason || 'unknown',
            });
          }
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

    // Mark event as processed for deduplication
    markEventProcessed(event.id, event.type, {
      processed_at: new Date().toISOString(),
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
