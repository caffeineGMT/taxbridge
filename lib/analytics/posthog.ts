/**
 * PostHog Analytics - Conversion Funnel Tracking
 *
 * Tracks the complete user journey:
 * 1. Landing → 2. Signup → 3. Onboarding → 4. First RSU → 5. Calculator Use → 6. Pricing View → 7. Checkout → 8. Paid
 *
 * Key metrics tracked:
 * - Conversion rates at each step
 * - Drop-off points and percentages
 * - Time to conversion
 * - Feature usage patterns
 * - Revenue attribution
 */

import posthog from 'posthog-js';

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

// Initialize PostHog client
export function initPostHog() {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[PostHog] Initialized');
        }
      },
      capture_pageview: false, // We'll manually track pageviews for better control
      capture_pageleave: true,
      autocapture: false, // Manual tracking for better control and privacy
    });
  }
}

// Type-safe event tracking
export type PostHogEvent =
  // Landing & Awareness
  | 'page_viewed'
  | 'landing_page_viewed'
  | 'pricing_page_viewed'
  | 'calculator_page_viewed'
  | 'guide_viewed'

  // Signup Funnel
  | 'signup_button_clicked'
  | 'signup_started'
  | 'signup_completed'
  | 'email_verified'

  // Onboarding Funnel
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'profile_completed'

  // Core Product Usage
  | 'first_rsu_entry_started'
  | 'first_rsu_entry_completed'
  | 'rsu_entry_created'
  | 'tax_calculation_viewed'
  | 'ftc_optimizer_used'
  | 'multi_year_analysis_viewed'
  | 'pdf_exported'
  | 'forms_checklist_opened'
  | 'csv_import_started'
  | 'csv_import_completed'

  // Lead Generation & Conversion
  | 'email_captured'
  | 'roi_calculator_viewed'
  | 'roi_calculation_viewed'
  | 'calculator_dropoff'
  | 'sticky_cta_clicked'

  // Monetization Funnel
  | 'paywall_shown'
  | 'upgrade_button_clicked'
  | 'pricing_tier_selected'
  | 'checkout_started'
  | 'checkout_completed'
  | 'trial_started'
  | 'trial_converted_to_paid'
  | 'subscription_activated'
  | 'subscription_renewed'
  | 'subscription_cancelled'
  | 'subscription_reactivated'

  // Enterprise
  | 'enterprise_page_viewed'
  | 'demo_request_submitted'
  | 'demo_scheduled'
  | 'enterprise_contract_signed'

  // Referrals & Growth
  | 'referral_link_generated'
  | 'referral_link_clicked'
  | 'referral_signup_completed'
  | 'referral_reward_earned'

  // Retention & Engagement
  | 'notification_clicked'
  | 'email_link_clicked'
  | 'deadline_reminder_viewed'
  | 'dashboard_viewed'
  | 'feature_discovered'

  // Support & Feedback
  | 'help_article_viewed'
  | 'support_ticket_created'
  | 'feedback_submitted'
  | 'nps_survey_completed';

interface EventProperties {
  // User context
  userId?: string;
  userTier?: 'free' | 'pro' | 'enterprise';
  subscriptionStatus?: 'none' | 'trialing' | 'active' | 'past_due' | 'cancelled';
  daysActive?: number;

  // Event context
  page?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;

  // Funnel-specific
  funnelStep?: string;
  funnelStepNumber?: number;
  timeToConversion?: number;

  // Product context
  rsuCount?: number;
  calculationCount?: number;
  featureUsed?: string;

  // Revenue context
  revenue?: number;
  currency?: string;
  plan?: string;
  billingInterval?: 'monthly' | 'annual';

  // Metadata
  [key: string]: any;
}

/**
 * Track an event with PostHog
 */
export function trackEvent(
  eventName: PostHogEvent,
  properties?: EventProperties
) {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog]', eventName, properties);
    }
  }
}

/**
 * Identify a user for PostHog
 */
export function identifyUser(
  userId: string,
  traits?: {
    email?: string;
    name?: string;
    createdAt?: Date;
    tier?: string;
    employer?: string;
    province?: string;
    state?: string;
    [key: string]: any;
  }
) {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.identify(userId, traits);
  }
}

/**
 * Reset PostHog on logout
 */
export function resetPostHog() {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.reset();
  }
}

/**
 * Track page view with automatic funnel step detection
 */
export function trackPageView(
  page: string,
  properties?: EventProperties
) {
  const funnelSteps: Record<string, { step: string; number: number }> = {
    '/': { step: 'Landing', number: 1 },
    '/pricing': { step: 'Pricing', number: 2 },
    '/sign-up': { step: 'Signup', number: 3 },
    '/onboarding': { step: 'Onboarding', number: 4 },
    '/dashboard': { step: 'Dashboard', number: 5 },
    '/rsu-entry': { step: 'First RSU Entry', number: 6 },
    '/dashboard/subscription': { step: 'Checkout', number: 7 },
  };

  const funnel = funnelSteps[page];

  trackEvent('page_viewed', {
    page,
    funnelStep: funnel?.step,
    funnelStepNumber: funnel?.number,
    ...properties,
  });
}

/**
 * Track conversion funnel progression
 */
export function trackFunnelStep(
  step: string,
  stepNumber: number,
  metadata?: Record<string, any>
) {
  trackEvent('onboarding_step_completed', {
    funnelStep: step,
    funnelStepNumber: stepNumber,
    ...metadata,
  });
}

/**
 * Track revenue events for conversion tracking
 */
export function trackRevenue(
  amount: number,
  plan: 'pro' | 'enterprise',
  eventType: 'trial_started' | 'subscription_activated' | 'subscription_renewed'
) {
  trackEvent(eventType, {
    revenue: amount,
    currency: 'USD',
    plan,
    billingInterval: 'annual',
  });
}

/**
 * Track drop-off events (when users abandon a flow)
 */
export function trackDropOff(
  step: string,
  reason?: string,
  metadata?: Record<string, any>
) {
  trackEvent('page_viewed', {
    funnelStep: step,
    dropOff: true,
    dropOffReason: reason,
    ...metadata,
  });
}

/**
 * Create a feature flag experiment
 */
export function getFeatureFlag(flagName: string): boolean | string {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    return posthog.getFeatureFlag(flagName) || false;
  }
  return false;
}

/**
 * Track A/B test variant exposure
 */
export function trackExperiment(
  experimentName: string,
  variant: string,
  metadata?: Record<string, any>
) {
  trackEvent('page_viewed', {
    experiment: experimentName,
    variant,
    ...metadata,
  });
}
