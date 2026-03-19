/**
 * Google Ads Conversion Tracking
 *
 * Usage:
 * - Call trackSignup() when user completes signup
 * - Call trackProSubscription() when user subscribes to Pro plan
 * - Call trackEnterpriseDemoRequest() when enterprise demo is requested
 */

// Note: Window.gtag type is declared in lib/google-ads/conversion-tracking.ts

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-XXXXXXXXXX';

// Conversion labels - Replace with actual labels from Google Ads after campaign setup
const CONVERSION_LABELS = {
  SIGNUP: process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL || 'SIGNUP_CONVERSION_LABEL',
  PRO_SUBSCRIPTION: process.env.NEXT_PUBLIC_GOOGLE_ADS_PRO_LABEL || 'PRO_SUBSCRIPTION_LABEL',
  ENTERPRISE_DEMO: process.env.NEXT_PUBLIC_GOOGLE_ADS_ENTERPRISE_LABEL || 'ENTERPRISE_DEMO_LABEL',
  CALCULATOR_USE: process.env.NEXT_PUBLIC_GOOGLE_ADS_CALCULATOR_LABEL || 'CALCULATOR_USE_LABEL',
};

/**
 * Track user signup conversion
 * Target CPA: $50
 */
export function trackSignup() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABELS.SIGNUP}`,
      value: 0,
      currency: 'USD',
      event_category: 'signup',
      event_label: 'Free Signup',
    });
    console.log('[Google Ads] Tracked signup conversion');
  }
}

/**
 * Track Pro subscription conversion
 * Value: $299/year
 */
export function trackProSubscription(value = 299) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABELS.PRO_SUBSCRIPTION}`,
      value,
      currency: 'USD',
      event_category: 'purchase',
      event_label: 'Pro Subscription',
      transaction_id: `pro_${Date.now()}`,
    });
    console.log('[Google Ads] Tracked Pro subscription conversion:', value);
  }
}

/**
 * Track Enterprise demo request
 * High-intent lead
 */
export function trackEnterpriseDemoRequest() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABELS.ENTERPRISE_DEMO}`,
      value: 0,
      currency: 'USD',
      event_category: 'lead',
      event_label: 'Enterprise Demo Request',
    });
    console.log('[Google Ads] Tracked enterprise demo request');
  }
}

/**
 * Track calculator usage (micro-conversion)
 * Indicates engagement with core product
 */
export function trackCalculatorUse() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABELS.CALCULATOR_USE}`,
      value: 0,
      currency: 'USD',
      event_category: 'engagement',
      event_label: 'Calculator Use',
    });
    console.log('[Google Ads] Tracked calculator use');
  }
}

/**
 * Track custom event for remarketing lists
 */
export function trackCustomEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...params,
      send_to: GOOGLE_ADS_ID,
    });
    console.log('[Google Ads] Tracked custom event:', eventName, params);
  }
}
