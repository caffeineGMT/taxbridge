/**
 * Partnership Analytics Tracking
 *
 * Helper functions for tracking partnership-specific events to PostHog and database
 */

import { trackEvent as trackAnalyticsEvent } from './analytics';

// ============================================================================
// PARTNERSHIP EVENT TRACKING
// ============================================================================

/**
 * Track when a partner outreach email is sent
 */
export async function trackPartnerOutreachSent(
  partnerId: number,
  metadata: {
    partner_type: 'immigration_lawyer' | 'cpa' | 'other';
    firm_name: string;
    email_subject: string;
  }
): Promise<void> {
  // Track to database (user_id = 1 for system events)
  await trackAnalyticsEvent(1, 'partner_outreach_sent', {
    partner_id: partnerId,
    ...metadata,
  });

  // Track to PostHog (client-side)
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('partner_outreach_sent', {
      partner_id: partnerId,
      ...metadata,
    });
  }
}

/**
 * Track when a partner responds to outreach
 */
export async function trackPartnerResponded(
  partnerId: number,
  metadata: {
    response_time_hours: number;
    interested: boolean;
  }
): Promise<void> {
  await trackAnalyticsEvent(1, 'partner_responded', {
    partner_id: partnerId,
    ...metadata,
  });

  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('partner_responded', {
      partner_id: partnerId,
      ...metadata,
    });
  }
}

/**
 * Track when an intro call is scheduled with a partner
 */
export async function trackIntroCallScheduled(
  partnerId: number,
  metadata: {
    scheduled_date: string;
    days_from_outreach: number;
  }
): Promise<void> {
  await trackAnalyticsEvent(1, 'partner_intro_call_scheduled', {
    partner_id: partnerId,
    ...metadata,
  });

  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('partner_intro_call_scheduled', {
      partner_id: partnerId,
      ...metadata,
    });
  }
}

/**
 * Track when an intro call is completed
 */
export async function trackIntroCallCompleted(
  partnerId: number,
  metadata: {
    outcome: 'activated' | 'follow_up' | 'rejected';
    call_duration_minutes?: number;
  }
): Promise<void> {
  await trackAnalyticsEvent(1, 'partner_intro_call_completed', {
    partner_id: partnerId,
    ...metadata,
  });

  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('partner_intro_call_completed', {
      partner_id: partnerId,
      ...metadata,
    });
  }
}

/**
 * Track when a partnership is activated
 */
export async function trackPartnershipActivated(
  partnerId: number,
  metadata: {
    referral_code: string;
    partner_type: 'immigration_lawyer' | 'cpa' | 'other';
    firm_name: string;
    estimated_client_count?: number;
  }
): Promise<void> {
  await trackAnalyticsEvent(1, 'partnership_activated', {
    partner_id: partnerId,
    ...metadata,
  });

  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('partnership_activated', {
      partner_id: partnerId,
      ...metadata,
    });
  }
}

/**
 * Track when a user clicks a partner referral link
 */
export async function trackPartnerReferralClick(metadata: {
  referral_code: string;
  partner_id?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}): Promise<void> {
  // Track to database (user_id = 0 for anonymous events)
  await trackAnalyticsEvent(0, 'partner_referral_click', metadata);

  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('partner_referral_click', metadata);
  }
}

/**
 * Track when a referred user signs up
 */
export async function trackPartnerReferralSignup(
  userId: number,
  metadata: {
    referral_code: string;
    partner_id: number;
  }
): Promise<void> {
  await trackAnalyticsEvent(userId, 'partner_referral_signup', metadata);

  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('partner_referral_signup', {
      user_id: userId,
      ...metadata,
    });
  }
}

/**
 * Track when a referred user converts to paid
 */
export async function trackPartnerReferralConverted(
  userId: number,
  metadata: {
    referral_code: string;
    partner_id: number;
    subscription_tier: 'pro' | 'enterprise';
    first_payment_amount: number;
    commission_amount: number;
  }
): Promise<void> {
  await trackAnalyticsEvent(userId, 'partner_referral_converted', metadata);

  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('partner_referral_converted', {
      user_id: userId,
      ...metadata,
    });
  }
}

/**
 * Track when commission is calculated for a partner
 */
export async function trackCommissionCalculated(
  partnerId: number,
  metadata: {
    period_start: string;
    period_end: string;
    total_revenue: number;
    commission_rate: number;
    commission_amount: number;
  }
): Promise<void> {
  await trackAnalyticsEvent(1, 'partner_commission_calculated', {
    partner_id: partnerId,
    ...metadata,
  });

  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('partner_commission_calculated', {
      partner_id: partnerId,
      ...metadata,
    });
  }
}

/**
 * Track when commission is paid to a partner
 */
export async function trackCommissionPaid(
  partnerId: number,
  metadata: {
    commission_id: number;
    commission_amount: number;
    payment_method: string;
    payment_reference?: string;
  }
): Promise<void> {
  await trackAnalyticsEvent(1, 'partner_commission_paid', {
    partner_id: partnerId,
    ...metadata,
  });

  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('partner_commission_paid', {
      partner_id: partnerId,
      ...metadata,
    });
  }
}

// ============================================================================
// FUNNEL METRICS
// ============================================================================

/**
 * Calculate partnership funnel conversion rates
 */
export interface PartnershipFunnelMetrics {
  total_outreach: number;
  total_responses: number;
  total_calls_scheduled: number;
  total_calls_completed: number;
  total_activated: number;
  response_rate: number; // responses / outreach
  call_schedule_rate: number; // calls scheduled / responses
  call_completion_rate: number; // calls completed / calls scheduled
  activation_rate: number; // activated / calls completed
  overall_conversion_rate: number; // activated / outreach
}

/**
 * Get partnership funnel metrics from database
 */
export async function getPartnershipFunnelMetrics(): Promise<PartnershipFunnelMetrics> {
  const { query } = await import('./db/unified');

  const metrics = await query<{
    total_outreach: number;
    total_responses: number;
    total_calls_scheduled: number;
    total_calls_completed: number;
    total_activated: number;
  }>(
    `SELECT
      COUNT(*) FILTER (WHERE first_contacted_at IS NOT NULL) as total_outreach,
      (SELECT COUNT(*) FROM partner_outreach WHERE responded = 1) as total_responses,
      COUNT(*) FILTER (WHERE intro_call_scheduled_at IS NOT NULL) as total_calls_scheduled,
      COUNT(*) FILTER (WHERE intro_call_completed_at IS NOT NULL) as total_calls_completed,
      COUNT(*) FILTER (WHERE status = 'active') as total_activated
    FROM partners`,
    []
  );

  const data = metrics[0];

  return {
    total_outreach: data.total_outreach || 0,
    total_responses: data.total_responses || 0,
    total_calls_scheduled: data.total_calls_scheduled || 0,
    total_calls_completed: data.total_calls_completed || 0,
    total_activated: data.total_activated || 0,
    response_rate:
      data.total_outreach > 0 ? (data.total_responses / data.total_outreach) * 100 : 0,
    call_schedule_rate:
      data.total_responses > 0
        ? (data.total_calls_scheduled / data.total_responses) * 100
        : 0,
    call_completion_rate:
      data.total_calls_scheduled > 0
        ? (data.total_calls_completed / data.total_calls_scheduled) * 100
        : 0,
    activation_rate:
      data.total_calls_completed > 0
        ? (data.total_activated / data.total_calls_completed) * 100
        : 0,
    overall_conversion_rate:
      data.total_outreach > 0 ? (data.total_activated / data.total_outreach) * 100 : 0,
  };
}
