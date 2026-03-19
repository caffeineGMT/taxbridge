/**
 * Instantly.ai Webhook Endpoint
 * POST /api/outreach/webhook
 *
 * Receives real-time events from Instantly.ai:
 * - email_sent, email_opened, link_clicked, reply_received, email_bounced
 *
 * Updates prospect status in our database automatically
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getProspectByEmail,
  updateProspect,
  updateProspectStatus,
  recordEmailEvent,
} from '@/lib/db/queries/enterprise-prospects';
import {
  type InstantlyWebhookEvent,
  mapWebhookEventToProspectStatus,
} from '@/lib/outreach/instantly-integration';
import { handleApiError } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.INSTANTLY_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      const signature = req.headers.get('x-instantly-signature') || '';
      const body = await req.text();

      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(body);
      const expectedSignature = hmac.digest('hex');

      if (signature !== expectedSignature) {
        // console.error('[Webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }

      // Parse the verified body
      const event: InstantlyWebhookEvent = JSON.parse(body);
      return await processEvent(event);
    }

    // If no secret configured, parse directly
    const event: InstantlyWebhookEvent = await req.json();
    return await processEvent(event);
  } catch (error) {
    return handleApiError(error, { route: '/api/outreach/webhook', method: req.method });
  }
}

async function processEvent(event: InstantlyWebhookEvent) {
  const { event_type, lead, email, reply, timestamp } = event;

  logger.info(`[Webhook] ${event_type} for ${lead.email}`);

  // Find prospect in database
  const prospect = getProspectByEmail(lead.email);

  if (!prospect) {
    logger.info(`[Webhook] Prospect not found: ${lead.email}`);
    return NextResponse.json({
      received: true,
      matched: false,
      message: 'Lead not found in database',
    });
  }

  // Record the email event
  recordEmailEvent({
    prospect_id: prospect.id,
    event_type: event_type === 'reply_received' ? 'replied' :
                event_type === 'email_sent' ? 'sent' :
                event_type === 'email_opened' ? 'opened' :
                event_type === 'link_clicked' ? 'clicked' :
                event_type === 'email_bounced' ? 'bounced' : 'sent',
    email_subject: email?.subject,
    email_template: email ? `step_${email.step}` : undefined,
    metadata: { event_type, timestamp, campaign_id: event.campaign_id },
  });

  // Map event to prospect status
  const newStatus = mapWebhookEventToProspectStatus(event_type);

  if (newStatus) {
    const updateData: Record<string, any> = {
      last_contact_date: timestamp || new Date().toISOString(),
      last_contact_type: event_type,
    };

    // Handle specific event types
    switch (event_type) {
      case 'email_sent':
        updateData.email_sequence_position = email?.step || 1;
        break;

      case 'email_opened':
        updateData.email_opened = true;
        break;

      case 'link_clicked':
        updateData.email_clicked = true;
        break;

      case 'reply_received':
        updateData.reply_date = timestamp || new Date().toISOString();
        updateData.reply_content = reply?.body?.substring(0, 500);
        break;

      case 'email_bounced':
        updateData.closed_lost_date = timestamp || new Date().toISOString();
        updateData.closed_lost_reason = 'email_bounced';
        break;
    }

    // Only advance status forward (don't go backwards)
    const statusOrder = ['target', 'contacted', 'opened', 'clicked', 'replied', 'demo_scheduled', 'trial_started', 'closed_won'];
    const currentIdx = statusOrder.indexOf(prospect.status);
    const newIdx = statusOrder.indexOf(newStatus);

    if (newIdx > currentIdx || event_type === 'email_bounced') {
      updateProspectStatus(prospect.id, newStatus as any, updateData);
    } else {
      // Still update the tracking fields even if status doesn't advance
      updateProspect(prospect.id, updateData);
    }
  }

  return NextResponse.json({
    received: true,
    matched: true,
    prospect_id: prospect.id,
    event_type,
    status_updated: !!newStatus,
  });
}

// Health check for webhook URL verification
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'instantly-webhook',
    timestamp: new Date().toISOString(),
  });
}
