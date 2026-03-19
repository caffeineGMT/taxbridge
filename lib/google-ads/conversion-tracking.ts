/**
 * Google Ads Conversion Tracking
 *
 * Tracks key conversion events for Google Ads campaign optimization:
 * - Calculator page views (landing)
 * - Calculator starts (user inputs data)
 * - Calculator completions (sees results)
 * - Lead captures (email submission)
 * - Paid conversions (checkout completion)
 */

import { trackEvent } from '@/lib/analytics/posthog';

// Google Ads Conversion IDs (replace with actual values from Google Ads)
export const GOOGLE_ADS_CONFIG = {
  conversionId: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || 'AW-XXXXXXXXXX',
  conversions: {
    pageView: 'AW-XXXXXXXXXX/XXXX', // Calculator page view
    calculatorStart: 'AW-XXXXXXXXXX/XXXX', // User starts inputting data
    calculatorComplete: 'AW-XXXXXXXXXX/XXXX', // User sees full results
    leadCapture: 'AW-XXXXXXXXXX/XXXX', // Email submission
    paidConversion: 'AW-XXXXXXXXXX/XXXX', // Checkout completion ($299)
  },
  remarketingTag: process.env.NEXT_PUBLIC_GOOGLE_ADS_REMARKETING_TAG || 'AW-XXXXXXXXXX',
};

declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

/**
 * Initialize Google Ads gtag (call in _app.tsx or layout.tsx)
 */
export function initGoogleAds() {
  if (typeof window === 'undefined' || !GOOGLE_ADS_CONFIG.conversionId) return;

  // Add gtag script if not already present
  if (!window.gtag) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_CONFIG.conversionId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GOOGLE_ADS_CONFIG.conversionId);
  }
}

/**
 * Track calculator page view (landing from Google Ads)
 */
export function trackCalculatorPageView(utmParams?: {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}) {
  // PostHog event
  trackEvent('calculator_page_viewed', {
    source: 'google_ads',
    ...utmParams,
  });

  // Google Ads conversion
  if (window.gtag && GOOGLE_ADS_CONFIG.conversions.pageView) {
    window.gtag('event', 'conversion', {
      send_to: GOOGLE_ADS_CONFIG.conversions.pageView,
      value: 0,
      currency: 'USD',
    });
  }
}

/**
 * Track calculator start (user inputs RSU amount)
 */
export function trackCalculatorStart(rsuAmount: number) {
  // PostHog event
  trackEvent('first_rsu_entry_started', {
    source: 'google_ads_landing',
    rsuAmount,
  });

  // Google Ads conversion
  if (window.gtag && GOOGLE_ADS_CONFIG.conversions.calculatorStart) {
    window.gtag('event', 'conversion', {
      send_to: GOOGLE_ADS_CONFIG.conversions.calculatorStart,
      value: 0,
      currency: 'USD',
    });
  }
}

/**
 * Track calculator completion (user sees full results)
 */
export function trackCalculatorComplete(data: {
  rsuAmount: number;
  usTax: number;
  canadaTax: number;
  ftcSavings: number;
  totalTax: number;
}) {
  // PostHog event
  trackEvent('tax_calculation_viewed', {
    source: 'google_ads_landing',
    ...data,
  });

  // Google Ads conversion
  if (window.gtag && GOOGLE_ADS_CONFIG.conversions.calculatorComplete) {
    window.gtag('event', 'conversion', {
      send_to: GOOGLE_ADS_CONFIG.conversions.calculatorComplete,
      value: 0,
      currency: 'USD',
    });
  }
}

/**
 * Track lead capture (email submission)
 */
export function trackLeadCapture(email: string, calculationData?: any) {
  // PostHog event
  trackEvent('email_verified', {
    source: 'google_ads_landing',
    leadMagnet: 'free_calculation',
    ...calculationData,
  });

  // Google Ads conversion (value = $10 for lead quality scoring)
  if (window.gtag && GOOGLE_ADS_CONFIG.conversions.leadCapture) {
    window.gtag('event', 'conversion', {
      send_to: GOOGLE_ADS_CONFIG.conversions.leadCapture,
      value: 10,
      currency: 'USD',
    });
  }
}

/**
 * Track paid conversion (checkout completion)
 */
export function trackPaidConversion(amount: number, plan: string) {
  // PostHog event
  trackEvent('checkout_completed', {
    source: 'google_ads_landing',
    revenue: amount,
    plan,
  });

  // Google Ads conversion
  if (window.gtag && GOOGLE_ADS_CONFIG.conversions.paidConversion) {
    window.gtag('event', 'conversion', {
      send_to: GOOGLE_ADS_CONFIG.conversions.paidConversion,
      value: amount,
      currency: 'USD',
      transaction_id: `order_${Date.now()}`,
    });
  }
}

/**
 * Track calculator abandonment (user leaves without completing)
 */
export function trackCalculatorAbandonment(stage: 'input' | 'results' | 'email') {
  trackEvent('page_viewed', {
    source: 'google_ads_landing',
    dropOff: true,
    dropOffReason: `abandoned_at_${stage}`,
    funnelStep: 'Calculator',
  });
}

/**
 * Set remarketing audience (for retargeting ads)
 */
export function setRemarketingAudience(segment: 'calculator_viewers' | 'calculator_completers' | 'email_captured') {
  if (window.gtag && GOOGLE_ADS_CONFIG.remarketingTag) {
    window.gtag('event', 'page_view', {
      send_to: GOOGLE_ADS_CONFIG.remarketingTag,
      ecomm_pagetype: segment,
      ecomm_totalvalue: segment === 'email_captured' ? 10 : 0,
    });
  }
}

/**
 * Extract UTM parameters from URL
 */
export function getUTMParams(): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
} {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
  };
}

/**
 * Check if user came from Google Ads
 */
export function isGoogleAdsTraffic(): boolean {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source');
  const medium = params.get('utm_medium');

  return source === 'google' && (medium === 'cpc' || medium === 'ppc');
}
