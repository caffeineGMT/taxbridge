/**
 * Stripe Webhook Handler
 * Processes Stripe events: checkout completion, subscription updates, cancellations
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { getDatabase } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';
import { trackAffiliateReferral } from '@/lib/stripe/affiliate-tracking';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
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
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  const db = getDatabase();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const tier = session.metadata?.tier;

        if (!userId || !tier) {
          console.error('Missing metadata in checkout session:', session.id);
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

        console.log(`✓ User ${userId} upgraded to ${tier} tier`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

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

        // Get user ID before downgrading
        const user = db.prepare(`
          SELECT id FROM user_profiles WHERE stripe_subscription_id = ?
        `).get(subscription.id) as { id: number } | undefined;

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
        }

        console.log(`✓ Subscription ${subscription.id} canceled, user downgraded to free`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

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
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
