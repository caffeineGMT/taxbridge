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
  | 'referral_share_clicked'
  | 'referral_page_link_clicked'
  | 'referral_signup_completed'
  | 'referral_reward_earned'

  // Retention & Engagement
  | 'notification_clicked'
  | 'email_link_clicked'
  | 'deadline_reminder_viewed'
  | 'dashboard_viewed'
  | 'feature_discovered'

  // Experiments
  | 'pricing_experiment_exposed'
  | 'pricing_interval_toggled'

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

/**
 * Extract UTM parameters from URL
 */
export function extractUTMParams(url?: string): Record<string, string> | null {
  try {
    const urlObj = new URL(url || window.location.href);
    const utmSource = urlObj.searchParams.get('utm_source');
    const utmMedium = urlObj.searchParams.get('utm_medium');
    const utmCampaign = urlObj.searchParams.get('utm_campaign');

    if (!utmSource || !utmMedium || !utmCampaign) {
      return null;
    }

    return {
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_term: urlObj.searchParams.get('utm_term') || '',
      utm_content: urlObj.searchParams.get('utm_content') || '',
    };
  } catch {
    return null;
  }
}

/**
 * Track UTM parameters and set user properties for attribution
 * Call this on app initialization to capture marketing source
 */
export function trackUTMAttribution(url?: string) {
  const utmParams = extractUTMParams(url);

  if (utmParams && typeof window !== 'undefined' && posthog.__loaded) {
    // Track the UTM landing event
    posthog.capture('utm_source_tracked', {
      ...utmParams,
      landing_page: url || window.location.href,
      timestamp: new Date().toISOString(),
    });

    // Set user properties for first-touch attribution (only if not already set)
    const existingAttribution = posthog.get_property('initial_utm_source');
    if (!existingAttribution) {
      posthog.people.set({
        initial_utm_source: utmParams.utm_source,
        initial_utm_medium: utmParams.utm_medium,
        initial_utm_campaign: utmParams.utm_campaign,
        initial_utm_term: utmParams.utm_term,
        initial_utm_content: utmParams.utm_content,
        initial_landing_page: url || window.location.href,
        first_seen: new Date().toISOString(),
      });
    }

    // Always set last-touch attribution
    posthog.people.set({
      last_utm_source: utmParams.utm_source,
      last_utm_medium: utmParams.utm_medium,
      last_utm_campaign: utmParams.utm_campaign,
      last_utm_term: utmParams.utm_term,
      last_utm_content: utmParams.utm_content,
      last_landing_page: url || window.location.href,
      last_seen: new Date().toISOString(),
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog] UTM Attribution tracked:', utmParams);
    }
  }
}

/**
 * Track Reddit-specific events with automatic UTM enrichment
 * Use this for Reddit campaign conversion tracking
 */
export function trackRedditConversion(
  eventType: 'calculator_viewed' | 'calculator_completed' | 'signup_started' | 'subscription_activated',
  metadata?: Record<string, any>
) {
  const utmParams = extractUTMParams();

  // Only track if coming from Reddit
  if (utmParams?.utm_source === 'reddit') {
    trackEvent(eventType as PostHogEvent, {
      ...metadata,
      conversion_source: 'reddit',
      subreddit: utmParams.utm_term, // utm_term contains subreddit name
      content_type: utmParams.utm_content, // utm_content contains post/comment type
      campaign: utmParams.utm_campaign,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog] Reddit conversion tracked:', eventType, {
        subreddit: utmParams.utm_term,
        content_type: utmParams.utm_content,
      });
    }
  }
}
