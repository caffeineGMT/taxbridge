import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';
import { handleApiError } from '@/lib/api-error-handler';

const db = new Database(path.join(process.cwd(), 'data', 'taxbridge.db'));

/**
 * Calendly Webhook Handler for Partnership Demos
 *
 * Automatically updates prospect status when:
 * - Demo is scheduled (invitee.created)
 * - Demo is cancelled (invitee.canceled)
 * - Demo is completed (past event time)
 *
 * Setup instructions:
 * 1. Go to https://calendly.com/integrations/webhooks
 * 2. Create webhook: POST https://taxbridgecpa.com/api/webhooks/calendly
 * 3. Subscribe to events: invitee.created, invitee.canceled
 * 4. Copy signing key to .env.local: CALENDLY_WEBHOOK_SECRET
 */

interface CalendlyWebhookPayload {
  event: string;
  payload: {
    event_type: {
      name: string;
    };
    invitee: {
      email: string;
      name: string;
      created_at: string;
      canceled: boolean;
      cancellation: {
        canceled_at: string;
        reason: string;
      } | null;
    };
    scheduled_event: {
      start_time: string;
      end_time: string;
      name: string;
    };
  };
}

function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!process.env.CALENDLY_WEBHOOK_SECRET) {
    console.warn('⚠️  CALENDLY_WEBHOOK_SECRET not set, skipping signature verification');
    return true; // Allow in development
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.CALENDLY_WEBHOOK_SECRET)
    .update(payload)
    .digest('base64');

  return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('calendly-webhook-signature') || '';
    const rawBody = await request.text();

    // Verify webhook authenticity
    if (!verifyWebhookSignature(rawBody, signature)) {
      // console.error('❌ Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const webhookData: CalendlyWebhookPayload = JSON.parse(rawBody);
    const { event, payload } = webhookData;

    console.log(`📅 Calendly webhook received: ${event}`);
    console.log(`   Invitee: ${payload.invitee.email}`);
    console.log(`   Event: ${payload.scheduled_event.name}`);
    console.log(`   Scheduled: ${payload.scheduled_event.start_time}`);

    // Find prospect by email
    const prospect = db
      .prepare(
        `
      SELECT id, firm_name, contact_email, status
      FROM enterprise_prospects
      WHERE contact_email = ?
    `
      )
      .get(payload.invitee.email) as any;

    if (!prospect) {
      console.log(`ℹ️  No prospect found for ${payload.invitee.email} (might be a different campaign)`);
      return NextResponse.json({ message: 'Prospect not found, skipping' });
    }

    // Handle different webhook events
    switch (event) {
      case 'invitee.created':
        // Demo scheduled
        db.prepare(
          `
          UPDATE enterprise_prospects
          SET status = 'demo_scheduled',
              demo_scheduled_date = ?,
              last_contact_type = 'demo_booked',
              updated_at = datetime('now')
          WHERE id = ?
        `
        ).run(payload.scheduled_event.start_time, prospect.id);

        // Track event
        db.prepare(
          `
          INSERT INTO email_events (prospect_id, event_type, email_subject, metadata)
          VALUES (?, 'demo_booked', ?, ?)
        `
        ).run(
          prospect.id,
          `Demo: ${payload.scheduled_event.name}`,
          JSON.stringify({
            demo_time: payload.scheduled_event.start_time,
            invitee_name: payload.invitee.name
          })
        );

        console.log(`✅ Updated ${prospect.firm_name} → demo_scheduled`);
        break;

      case 'invitee.canceled':
        // Demo cancelled
        if (payload.invitee.cancellation) {
          db.prepare(
            `
            UPDATE enterprise_prospects
            SET status = 'contacted',
                demo_scheduled_date = NULL,
                notes = notes || '\n' || 'Demo cancelled: ' || ?,
                updated_at = datetime('now')
            WHERE id = ?
          `
          ).run(payload.invitee.cancellation.reason || 'No reason provided', prospect.id);

          db.prepare(
            `
            INSERT INTO email_events (prospect_id, event_type, email_subject, metadata)
            VALUES (?, 'demo_cancelled', ?, ?)
          `
          ).run(
            prospect.id,
            'Demo cancelled',
            JSON.stringify({
              cancelled_at: payload.invitee.cancellation.canceled_at,
              reason: payload.invitee.cancellation.reason
            })
          );

          console.log(`⚠️  ${prospect.firm_name} cancelled demo: ${payload.invitee.cancellation.reason}`);
        }
        break;

      default:
        console.log(`ℹ️  Unhandled event type: ${event}`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error: any) {
    return handleApiError(error, { route: '/api/webhooks/calendly', method: request.method });
  }
}

// Health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'active',
    webhook: 'calendly-partnership-demos',
    events: ['invitee.created', 'invitee.canceled']
  });
}
