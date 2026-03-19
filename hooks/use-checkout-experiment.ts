/**
 * Checkout Experiment Hook
 *
 * A/B/C Test: Stripe-native checkout vs Custom embedded form vs Amazon Pay
 *
 * EXPERIMENT (March 19+, 2026):
 * Testing which checkout flow converts best after free tier increase to 10 entries
 *
 * Variants:
 * - checkout_stripe_native: Stripe Checkout Sessions (current, redirects to Stripe)
 * - checkout_embedded_form: Custom embedded Stripe Elements form (on-site)
 * - checkout_amazon_pay: Amazon Pay one-click integration
 *
 * Tracks:
 * - Which variant users see (33/33/34 split)
 * - Checkout initiation rate (% who click "Upgrade")
 * - Checkout completion rate (% who complete payment)
 * - Time to complete checkout
 * - Drop-off points in each flow
 * - Revenue per variant
 *
 * Hypothesis:
 * - Embedded form will convert better (less friction, no redirect)
 * - Amazon Pay will have highest conversion for existing Amazon customers
 * - Native checkout will be slowest but most trusted
 */

'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics/posthog';
import posthog from 'posthog-js';

export type CheckoutVariant = 'checkout_stripe_native' | 'checkout_embedded_form' | 'checkout_amazon_pay';

export interface CheckoutExperimentConfig {
  // A/B/C test variant
  variant: CheckoutVariant;
  isLoading: boolean;

  // Variant display names
  getVariantName: () => string;
  getVariantDescription: () => string;

  // Tracking functions
  trackVariantExposure: () => void;
  trackCheckoutInitiated: (tier: string, priceId: string, price: number) => void;
  trackCheckoutCompleted: (tier: string, priceId: string, price: number, timeToComplete: number) => void;
  trackCheckoutAbandoned: (tier: string, priceId: string, price: number, step: string, reason?: string) => void;
  trackCheckoutError: (tier: string, priceId: string, error: string) => void;
}

/**
 * Get or set variant assignment (persisted in localStorage)
 */
function getVariantAssignment(): CheckoutVariant {
  if (typeof window === 'undefined') return 'checkout_stripe_native';

  // Check if user has existing assignment
  const stored = localStorage.getItem('checkout_experiment_variant');
  if (
    stored === 'checkout_stripe_native' ||
    stored === 'checkout_embedded_form' ||
    stored === 'checkout_amazon_pay'
  ) {
    return stored;
  }

  // New assignment: 33/33/34 split for 3-way test
  const random = Math.random();
  let variant: CheckoutVariant;

  if (random < 0.33) {
    variant = 'checkout_stripe_native';
  } else if (random < 0.66) {
    variant = 'checkout_embedded_form';
  } else {
    variant = 'checkout_amazon_pay';
  }

  // Persist assignment
  localStorage.setItem('checkout_experiment_variant', variant);
  localStorage.setItem('checkout_experiment_assigned_at', new Date().toISOString());

  return variant;
}

/**
 * Hook for checkout experiment
 */
export function useCheckoutExperiment(): CheckoutExperimentConfig {
  const [variant, setVariant] = useState<CheckoutVariant>('checkout_stripe_native');
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutStartTime, setCheckoutStartTime] = useState<number | null>(null);

  // Initialize variant on mount
  useEffect(() => {
    const assigned = getVariantAssignment();
    setVariant(assigned);
    setIsLoading(false);

    // Track exposure to PostHog
    trackEvent('checkout_experiment_exposed', {
      variant: assigned,
      experiment_name: 'checkout_flow_optimization_march_2026',
      user_cohort: localStorage.getItem('user_cohort') || 'organic',
    });

    // Set PostHog feature flag
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('$feature_flag_called', {
        $feature_flag: 'checkout_experiment_variant',
        $feature_flag_response: assigned,
      });
    }
  }, []);

  const getVariantName = () => {
    const names = {
      checkout_stripe_native: 'Stripe Checkout',
      checkout_embedded_form: 'Embedded Payment Form',
      checkout_amazon_pay: 'Amazon Pay',
    };
    return names[variant];
  };

  const getVariantDescription = () => {
    const descriptions = {
      checkout_stripe_native: 'Secure checkout powered by Stripe',
      checkout_embedded_form: 'Fast checkout without leaving the page',
      checkout_amazon_pay: 'One-click checkout with Amazon',
    };
    return descriptions[variant];
  };

  const trackVariantExposure = () => {
    trackEvent('checkout_page_viewed', {
      variant,
      variantName: getVariantName(),
      experiment: 'checkout_flow_optimization_march_2026',
      user_cohort: localStorage.getItem('user_cohort') || 'organic',
    });
  };

  const trackCheckoutInitiated = (tier: string, priceId: string, price: number) => {
    const startTime = Date.now();
    setCheckoutStartTime(startTime);

    trackEvent('checkout_initiated', {
      variant,
      variantName: getVariantName(),
      tier,
      priceId,
      price,
      experiment: 'checkout_flow_optimization_march_2026',
      user_cohort: localStorage.getItem('user_cohort') || 'organic',
      timestamp: startTime,
    });

    // Store in localStorage for cross-page tracking
    localStorage.setItem('checkout_start_time', startTime.toString());
    localStorage.setItem('checkout_tier', tier);
    localStorage.setItem('checkout_price_id', priceId);
    localStorage.setItem('checkout_price', price.toString());
  };

  const trackCheckoutCompleted = (tier: string, priceId: string, price: number, timeToComplete: number) => {
    trackEvent('checkout_completed', {
      variant,
      variantName: getVariantName(),
      tier,
      priceId,
      price,
      timeToComplete,
      experiment: 'checkout_flow_optimization_march_2026',
      user_cohort: localStorage.getItem('user_cohort') || 'organic',
      revenue: price,
    });

    // Clear checkout tracking data
    localStorage.removeItem('checkout_start_time');
    localStorage.removeItem('checkout_tier');
    localStorage.removeItem('checkout_price_id');
    localStorage.removeItem('checkout_price');
  };

  const trackCheckoutAbandoned = (tier: string, priceId: string, price: number, step: string, reason?: string) => {
    const startTime = checkoutStartTime || parseInt(localStorage.getItem('checkout_start_time') || '0', 10);
    const timeSpent = startTime ? Date.now() - startTime : 0;

    trackEvent('checkout_abandoned', {
      variant,
      variantName: getVariantName(),
      tier,
      priceId,
      price,
      step,
      reason,
      timeSpent,
      experiment: 'checkout_flow_optimization_march_2026',
      user_cohort: localStorage.getItem('user_cohort') || 'organic',
    });
  };

  const trackCheckoutError = (tier: string, priceId: string, error: string) => {
    trackEvent('checkout_error', {
      variant,
      variantName: getVariantName(),
      tier,
      priceId,
      error,
      experiment: 'checkout_flow_optimization_march_2026',
      user_cohort: localStorage.getItem('user_cohort') || 'organic',
    });
  };

  return {
    variant,
    isLoading,
    getVariantName,
    getVariantDescription,
    trackVariantExposure,
    trackCheckoutInitiated,
    trackCheckoutCompleted,
    trackCheckoutAbandoned,
    trackCheckoutError,
  };
}

/**
 * Get the checkout variant assigned to the current user
 */
export function getCheckoutVariant(): CheckoutVariant {
  return getVariantAssignment();
}
