/**
 * Stripe Refunds API
 * Handles full and partial refunds for charges and subscriptions
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { getDatabase } from '@/lib/db';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';
import { trackEvent } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you'll need to implement admin role check)
    // For now, this is a protected endpoint that requires authentication
    const db = getDatabase();
    const userProfile = db.prepare(`
      SELECT id, email, subscription_tier
      FROM user_profiles
      WHERE clerk_user_id = ?
    `).get(userId) as { id: number; email?: string; subscription_tier: string } | undefined;

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only allow enterprise tier or admin users to issue refunds
    // TODO: Add proper admin role check
    if (userProfile.subscription_tier !== 'enterprise') {
      logger.warn('Unauthorized refund attempt', {
        userId: String(userProfile.id),
        tier: userProfile.subscription_tier,
      });

      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { chargeId, amount, reason, metadata } = body;

    if (!chargeId) {
      return NextResponse.json(
        { error: 'Missing required field: chargeId' },
        { status: 400 }
      );
    }

    // Validate amount if provided (for partial refunds)
    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number.' },
        { status: 400 }
      );
    }

    // Retrieve the charge to validate it exists
    const charge = await stripe.charges.retrieve(chargeId);

    if (!charge) {
      return NextResponse.json(
        { error: 'Charge not found' },
        { status: 404 }
      );
    }

    // Check if charge is already fully refunded
    if (charge.refunded) {
      return NextResponse.json(
        { error: 'Charge has already been fully refunded' },
        { status: 400 }
      );
    }

    // Calculate refundable amount
    const refundableAmount = charge.amount - charge.amount_refunded;

    if (amount && amount > refundableAmount) {
      return NextResponse.json(
        {
          error: 'Refund amount exceeds refundable balance',
          refundableAmount: refundableAmount / 100,
          requestedAmount: amount / 100,
        },
        { status: 400 }
      );
    }

    // Create the refund
    const refund = await stripe.refunds.create({
      charge: chargeId,
      ...(amount && { amount: Math.round(amount * 100) }), // Convert to cents
      reason: reason || 'requested_by_customer',
      metadata: {
        refunded_by: String(userProfile.id),
        refunded_by_email: userProfile.email || '',
        refund_type: amount ? 'partial' : 'full',
        ...metadata,
      },
    });

    logger.info('Refund created', {
      refundId: refund.id,
      chargeId,
      amount: refund.amount,
      isPartial: !!amount,
      reason: refund.reason,
      refundedBy: String(userProfile.id),
    });

    // Track refund in analytics
    trackEvent(userProfile.id, 'refund_issued', {
      refund_id: refund.id,
      charge_id: chargeId,
      amount: refund.amount,
      refund_type: amount ? 'partial' : 'full',
      reason: refund.reason,
    });

    // Store refund in database for tracking
    db.prepare(`
      INSERT INTO refunds (
        stripe_refund_id,
        stripe_charge_id,
        user_id,
        amount,
        reason,
        status,
        metadata,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      refund.id,
      chargeId,
      userProfile.id,
      refund.amount,
      refund.reason || 'requested_by_customer',
      refund.status,
      metadata ? JSON.stringify(metadata) : null
    );

    Sentry.addBreadcrumb({
      message: `Refund issued: ${refund.id}`,
      level: 'info',
      data: {
        refundId: refund.id,
        chargeId,
        amount: refund.amount,
      },
    });

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100, // Convert to dollars
        status: refund.status,
        reason: refund.reason,
        created: refund.created,
      },
      message: amount
        ? `Partial refund of $${(refund.amount / 100).toFixed(2)} processed successfully`
        : 'Full refund processed successfully',
    });
  } catch (error) {
    logger.error('Error processing refund', {
      error: error instanceof Error ? error : new Error(String(error)),
    });

    Sentry.captureException(error, {
      level: 'error',
      tags: { route: '/api/stripe/refund' },
    });

    // Handle Stripe-specific errors
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as any;
      return NextResponse.json(
        {
          error: 'Refund failed',
          message: stripeError.message || 'Unknown error',
          code: stripeError.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve refund information
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const refundId = searchParams.get('refundId');
    const chargeId = searchParams.get('chargeId');

    if (!refundId && !chargeId) {
      return NextResponse.json(
        { error: 'Missing refundId or chargeId parameter' },
        { status: 400 }
      );
    }

    if (refundId) {
      // Retrieve specific refund
      const refund = await stripe.refunds.retrieve(refundId);

      return NextResponse.json({
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          reason: refund.reason,
          charge: refund.charge,
          created: refund.created,
          metadata: refund.metadata,
        },
      });
    } else if (chargeId) {
      // List all refunds for a charge
      const refunds = await stripe.refunds.list({
        charge: chargeId,
        limit: 100,
      });

      return NextResponse.json({
        refunds: refunds.data.map(refund => ({
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          reason: refund.reason,
          created: refund.created,
        })),
        totalRefunded: refunds.data.reduce((sum, r) => sum + r.amount, 0) / 100,
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    logger.error('Error retrieving refund', {
      error: error instanceof Error ? error : new Error(String(error)),
    });

    return NextResponse.json(
      { error: 'Failed to retrieve refund information' },
      { status: 500 }
    );
  }
}
