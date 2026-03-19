'use client';

import { useEffect } from 'react';
import { trackUTMAttribution, trackRedditConversion } from '@/lib/analytics/posthog';

/**
 * UTM Attribution Tracker
 *
 * Automatically captures UTM parameters on page load and sets user attribution properties.
 * Integrates with PostHog for first-touch and last-touch attribution tracking.
 *
 * Usage: Add to app/layout.tsx as a client component
 * <UTMTracker />
 */
export function UTMTracker() {
  useEffect(() => {
    // Track UTM parameters on initial page load
    const url = window.location.href;
    trackUTMAttribution(url);

    // If coming from Reddit, track calculator view
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('utm_source') === 'reddit') {
      // Check if user is on calculator page or landing page
      const isCalculatorPage = window.location.pathname.includes('calculator') ||
                               window.location.hash.includes('calculator');

      if (isCalculatorPage) {
        trackRedditConversion('calculator_viewed');
      }
    }
  }, []);

  // This component renders nothing, it only tracks analytics
  return null;
}

/**
 * Calculator Completion Tracker for Reddit Attribution
 *
 * Call this when user completes the calculator to track Reddit conversions
 *
 * Usage in calculator component:
 * import { trackCalculatorCompletion } from '@/components/UTMTracker';
 *
 * const handleSubmit = () => {
 *   // ... calculator logic
 *   trackCalculatorCompletion({ userId, totalTax, ftcSavings });
 * };
 */
export function trackCalculatorCompletion(metadata?: {
  userId?: string;
  totalTax?: number;
  ftcSavings?: number;
  [key: string]: any;
}) {
  trackRedditConversion('calculator_completed', metadata);
}

/**
 * Signup Started Tracker for Reddit Attribution
 *
 * Call this when user starts signup flow from Reddit traffic
 */
export function trackRedditSignup(metadata?: {
  email?: string;
  signupMethod?: string;
  [key: string]: any;
}) {
  trackRedditConversion('signup_started', metadata);
}

/**
 * Subscription Activation Tracker for Reddit Attribution
 *
 * Call this when Reddit-attributed user converts to paid
 */
export function trackRedditSubscription(metadata?: {
  userId?: string;
  plan?: string;
  revenue?: number;
  [key: string]: any;
}) {
  trackRedditConversion('subscription_activated', metadata);
}
