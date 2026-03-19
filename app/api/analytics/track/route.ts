/**
 * Analytics Tracking API
 * Accepts tracking events from client components
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackEvent, AnalyticsEvent } from '@/lib/analytics';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, metadata } = body;

    // For MVP, hardcode user_id = 1
    const userId = 1;

    // Validate event name
    const validEvents: AnalyticsEvent[] = [
      'user_signed_up',
      'profile_completed',
      'rsu_entry_created',
      'tax_calculation_viewed',
      'ftc_optimizer_used',
      'pdf_exported',
      'forms_checklist_opened',
      'upgraded_to_pro',
      'upgraded_to_enterprise',
      'downgraded_to_free',
    ];

    if (!validEvents.includes(event)) {
      return NextResponse.json(
        { error: 'Invalid event name' },
        { status: 400 }
      );
    }

    // Track the event
    trackEvent(userId, event, metadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/analytics/track', method: request.method });
  }
}
