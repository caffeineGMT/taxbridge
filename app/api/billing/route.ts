/**
 * Billing Information API
 * Fetches comprehensive billing details including subscription, payment method, usage, and invoices
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { getDatabase } from '@/lib/db';
import { startOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDatabase();

    // Get user profile with subscription info
    const userProfile = db.prepare(`
      SELECT
        id,
        subscription_tier,
        subscription_status,
        subscription_current_period_end,
        stripe_customer_id,
        stripe_subscription_id
      FROM user_profiles
      WHERE clerk_user_id = ?
    `).get(userId) as {
      id: number;
      subscription_tier: string;
      subscription_status: string | null;
      subscription_current_period_end: string | null;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
    } | undefined;

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize response object
    const billingInfo: any = {
      subscription_tier: userProfile.subscription_tier,
      subscription_status: userProfile.subscription_status,
      subscription_current_period_end: userProfile.subscription_current_period_end,
      stripe_customer_id: userProfile.stripe_customer_id,
      payment_method_last4: null,
      payment_method_brand: null,
      usage: {
        rsu_entries: 0,
        pdf_exports: 0,
        ai_queries: 0,
      },
      invoices: [],
    };

    // Fetch payment method from Stripe if customer exists
    if (userProfile.stripe_customer_id) {
      try {
        const customer = await stripe.customers.retrieve(userProfile.stripe_customer_id, {
          expand: ['invoice_settings.default_payment_method'],
        }) as any;

        if (customer.invoice_settings?.default_payment_method) {
          const paymentMethod = customer.invoice_settings.default_payment_method;
          if (paymentMethod.card) {
            billingInfo.payment_method_last4 = paymentMethod.card.last4;
            billingInfo.payment_method_brand = paymentMethod.card.brand;
          }
        }

        // Fetch invoices
        const invoices = await stripe.invoices.list({
          customer: userProfile.stripe_customer_id,
          limit: 12,
        });

        billingInfo.invoices = invoices.data.map((invoice) => ({
          id: invoice.id,
          date: new Date(invoice.created * 1000).toISOString(),
          amount: invoice.amount_paid,
          status: invoice.status,
          invoice_pdf: invoice.invoice_pdf || '',
        }));
      } catch (error) {
        console.error('Error fetching Stripe data:', error);
        // Continue without Stripe data
      }
    }

    // Calculate usage metrics for current month
    const monthStart = startOfMonth(new Date()).toISOString();

    // RSU entries this month
    const rsuCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM analytics_events
      WHERE user_id = ?
        AND event_name = 'rsu_entry_created'
        AND created_at >= unixepoch(?)
    `).get(userProfile.id, monthStart) as { count: number };

    billingInfo.usage.rsu_entries = rsuCount.count;

    // PDF exports this month
    const pdfCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM analytics_events
      WHERE user_id = ?
        AND event_name = 'pdf_exported'
        AND created_at >= unixepoch(?)
    `).get(userProfile.id, monthStart) as { count: number };

    billingInfo.usage.pdf_exports = pdfCount.count;

    // AI advisor queries this month
    const aiCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM analytics_events
      WHERE user_id = ?
        AND event_name = 'ai_query'
        AND created_at >= unixepoch(?)
    `).get(userProfile.id, monthStart) as { count: number };

    billingInfo.usage.ai_queries = aiCount.count;

    return NextResponse.json(billingInfo);
  } catch (error) {
    console.error('Error fetching billing info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing information' },
      { status: 500 }
    );
  }
}
