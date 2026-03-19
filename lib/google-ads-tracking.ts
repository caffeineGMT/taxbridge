/**
 * Google Ads Conversion Tracking with PostHog
 * Tracks conversions and sends data to both PostHog and Google Ads
 */

'use client';

import { useEffect } from 'react';
import { posthog } from 'posthog-js';
import { logger } from '@/lib/logger';
import {
  extractUTMParams,
  getStoredUTMParams,
  getStoredGCLID,
  isFromGoogleAds,
  getCampaignName,
  getDaysSinceFirstTouch,
  storeUTMParams,
  trackGCLID,
} from './utm-tracking';

export enum ConversionEvent {
  PAGE_VIEW = 'google_ads_page_view',
  AD_CLICK = 'google_ads_click',
  LANDING_PAGE_VIEW = 'landing_page_viewed',
  CALCULATOR_STARTED = 'calculator_form_started',
  CALCULATOR_COMPLETED = 'calculator_completed',
  EMAIL_CAPTURED = 'email_captured',
  SIGNUP_CLICKED = 'signup_clicked',
  SIGNUP_COMPLETED = 'signup_completed',
  TRIAL_STARTED = 'trial_started',
  PAYMENT_INITIATED = 'payment_initiated',
  SUBSCRIPTION_CREATED = 'subscription_created',
}

export const CONVERSION_VALUES: Record<ConversionEvent, number> = {
  [ConversionEvent.PAGE_VIEW]: 0,
  [ConversionEvent.AD_CLICK]: 0,
  [ConversionEvent.LANDING_PAGE_VIEW]: 1,
  [ConversionEvent.CALCULATOR_STARTED]: 2,
  [ConversionEvent.CALCULATOR_COMPLETED]: 5,
  [ConversionEvent.EMAIL_CAPTURED]: 10,
  [ConversionEvent.SIGNUP_CLICKED]: 15,
  [ConversionEvent.SIGNUP_COMPLETED]: 25,
  [ConversionEvent.TRIAL_STARTED]: 49,
  [ConversionEvent.PAYMENT_INITIATED]: 100,
  [ConversionEvent.SUBSCRIPTION_CREATED]: 299,
};

interface ConversionEventData {
  event: ConversionEvent;
  value?: number;
  metadata?: Record<string, any>;
}

/**
 * Track Google Ads conversion event with PostHog
 */
export function trackGoogleAdsConversion({
  event,
  value,
  metadata = {},
}: ConversionEventData): void {
  if (typeof window === 'undefined') return;

  const utmParams = getStoredUTMParams();
  const gclid = getStoredGCLID();
  const conversionValue = value ?? CONVERSION_VALUES[event];
  const campaignName = getCampaignName();
  const daysSinceFirstTouch = getDaysSinceFirstTouch();

  // Base event properties
  const eventProperties = {
    conversion_event: event,
    conversion_value: conversionValue,
    utm_source: utmParams?.utm_source,
    utm_medium: utmParams?.utm_medium,
    utm_campaign: utmParams?.utm_campaign,
    utm_content: utmParams?.utm_content,
    utm_term: utmParams?.utm_term,
    gclid: gclid,
    is_from_google_ads: isFromGoogleAds(),
    campaign_name: campaignName,
    days_since_first_touch: daysSinceFirstTouch,
    page_url: window.location.href,
    page_path: window.location.pathname,
    referrer: document.referrer,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  // Track in PostHog
  if (typeof posthog !== 'undefined') {
    posthog.capture(event, eventProperties);

    // Set user properties for attribution
    if (utmParams) {
      posthog.people.set({
        initial_utm_source: utmParams.utm_source,
        initial_utm_campaign: utmParams.utm_campaign,
        initial_gclid: gclid,
        days_since_first_touch: daysSinceFirstTouch,
      });
    }
  }

  // Send to Google Ads conversion tracking (if gtag is available)
  if (typeof window.gtag !== 'undefined' && gclid) {
    window.gtag('event', 'conversion', {
      send_to: `AW-CONVERSION_ID/${event}`, // Replace with actual conversion ID
      value: conversionValue,
      currency: 'USD',
      transaction_id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    });
  }

  // Console log for debugging (remove in production)
  logger.info('[Google Ads Conversion]', {
    event,
    value: conversionValue,
    gclid,
    campaign: campaignName,
  });
}

/**
 * Track landing page view (first interaction)
 */
export function trackLandingPageView(landingPageUrl: string): void {
  trackGoogleAdsConversion({
    event: ConversionEvent.LANDING_PAGE_VIEW,
    metadata: {
      landing_page: landingPageUrl,
    },
  });
}

/**
 * Track calculator started (user begins filling form)
 */
export function trackCalculatorStarted(
  calculatorType: 'h1b' | 'tn' | 'cross-border'
): void {
  trackGoogleAdsConversion({
    event: ConversionEvent.CALCULATOR_STARTED,
    metadata: {
      calculator_type: calculatorType,
    },
  });
}

/**
 * Track calculator completed (user sees results)
 */
export function trackCalculatorCompleted(calculatorData: {
  income: number;
  rsuValue: number;
  estimatedTax: number;
  calculatorType: string;
}): void {
  trackGoogleAdsConversion({
    event: ConversionEvent.CALCULATOR_COMPLETED,
    metadata: {
      ...calculatorData,
      high_value_user: calculatorData.rsuValue > 100000,
    },
  });
}

/**
 * Track email capture
 */
export function trackEmailCaptured(email: string): void {
  trackGoogleAdsConversion({
    event: ConversionEvent.EMAIL_CAPTURED,
    metadata: {
      email_domain: email.split('@')[1],
    },
  });

  // Identify user in PostHog
  if (typeof posthog !== 'undefined') {
    posthog.identify(email, {
      email,
      captured_via: 'google_ads',
    });
  }
}

/**
 * Track signup completed
 */
export function trackSignupCompleted(userId: string, email: string): void {
  trackGoogleAdsConversion({
    event: ConversionEvent.SIGNUP_COMPLETED,
    metadata: {
      user_id: userId,
      email_domain: email.split('@')[1],
    },
  });

  // Identify user in PostHog
  if (typeof posthog !== 'undefined') {
    posthog.identify(userId, {
      email,
      signup_source: 'google_ads',
      signup_campaign: getCampaignName(),
    });
  }
}

/**
 * Track trial started
 */
export function trackTrialStarted(userId: string, planName: string): void {
  trackGoogleAdsConversion({
    event: ConversionEvent.TRIAL_STARTED,
    metadata: {
      user_id: userId,
      plan_name: planName,
    },
  });
}

/**
 * Track subscription created (HIGHEST VALUE CONVERSION)
 */
export function trackSubscriptionCreated(subscriptionData: {
  userId: string;
  planName: string;
  amount: number;
  currency: string;
}): void {
  trackGoogleAdsConversion({
    event: ConversionEvent.SUBSCRIPTION_CREATED,
    value: subscriptionData.amount,
    metadata: {
      ...subscriptionData,
      ltv_estimate: subscriptionData.amount * 12, // Assume annual retention
    },
  });

  // Update user properties in PostHog
  if (typeof posthog !== 'undefined') {
    posthog.people.set({
      plan_name: subscriptionData.planName,
      mrr: subscriptionData.amount,
      converted_from_google_ads: isFromGoogleAds(),
      conversion_campaign: getCampaignName(),
      days_to_convert: getDaysSinceFirstTouch(),
    });
  }
}

/**
 * Calculate CAC (Customer Acquisition Cost) for reporting
 */
export function calculateCAC(totalAdSpend: number, totalConversions: number): number {
  if (totalConversions === 0) return 0;
  return totalAdSpend / totalConversions;
}

/**
 * Calculate ROAS (Return on Ad Spend)
 */
export function calculateROAS(totalRevenue: number, totalAdSpend: number): number {
  if (totalAdSpend === 0) return 0;
  return (totalRevenue / totalAdSpend) * 100;
}

/**
 * Get conversion funnel metrics
 */
export interface FunnelMetrics {
  landing_page_views: number;
  calculator_started: number;
  calculator_completed: number;
  email_captured: number;
  signups: number;
  trials: number;
  subscriptions: number;
  conversion_rates: {
    landing_to_calculator: number;
    calculator_to_completion: number;
    completion_to_email: number;
    email_to_signup: number;
    signup_to_trial: number;
    trial_to_subscription: number;
    overall: number;
  };
}

/**
 * Hook for client components to auto-track page views
 */
export function useGoogleAdsTracking() {
  if (typeof window === 'undefined') return;

  // Auto-track page view on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const utmParams = extractUTMParams(searchParams);

    if (utmParams) {
      storeUTMParams(utmParams);

      // Track GCLID if present
      if (utmParams.gclid) {
        trackGCLID(utmParams.gclid);
      }

      // Track landing page view
      trackLandingPageView(window.location.href);
    }
  }, []);
}

// Type declarations for gtag
declare global {
  interface Window {
    gtag?: {
      (command: 'js', date: Date): void;
      (command: 'config', targetId: string, params?: Record<string, any>): void;
      (command: 'event', eventName: string, params?: Record<string, any>): void;
      (command: string, action: string | Date, params?: Record<string, any>): void;
    };
    dataLayer?: any[];
  }
}
