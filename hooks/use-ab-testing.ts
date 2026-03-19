/**
 * A/B Testing Hook for Pricing Page CTAs
 *
 * Uses PostHog feature flags to serve different CTA variants
 * Tracks click-through and conversion rates for each variant
 */

'use client';

import { useState, useEffect } from 'react';
import posthog from 'posthog-js';
import { trackEvent } from '@/lib/analytics/posthog';

export interface CTAVariant {
  id: string;
  text: string;
  subtext?: string;
  icon?: string;
  variant: 'control' | 'variant-a' | 'variant-b' | 'variant-c';
}

const CTA_VARIANTS: CTAVariant[] = [
  {
    id: 'control',
    text: 'Start 14-Day Free Trial',
    subtext: 'No credit card required',
    variant: 'control',
  },
  {
    id: 'variant-a',
    text: 'Try Pro Free for 7 Days',
    subtext: 'Cancel anytime, full access',
    variant: 'variant-a',
  },
  {
    id: 'variant-b',
    text: 'Get Started Now →',
    subtext: '$49/year • 30-day guarantee',
    variant: 'variant-b',
  },
  {
    id: 'variant-c',
    text: 'Claim Your 50% Discount',
    subtext: 'Limited time: $99 → $49/year',
    variant: 'variant-c',
  },
];

/**
 * Hook to get the active CTA variant for A/B testing
 */
export function useCTAVariant(): CTAVariant {
  const [variant, setVariant] = useState<CTAVariant>(CTA_VARIANTS[0]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if PostHog is loaded
    if (posthog.__loaded) {
      // Get feature flag for CTA variant
      const flagValue = posthog.getFeatureFlag('pricing-cta-variant');

      // Map feature flag to variant
      let selectedVariant = CTA_VARIANTS[0]; // default to control

      if (flagValue === 'variant-a') {
        selectedVariant = CTA_VARIANTS[1];
      } else if (flagValue === 'variant-b') {
        selectedVariant = CTA_VARIANTS[2];
      } else if (flagValue === 'variant-c') {
        selectedVariant = CTA_VARIANTS[3];
      }

      setVariant(selectedVariant);

      // Track variant exposure
      trackEvent('page_viewed', {
        experiment: 'pricing-cta-test',
        variant: selectedVariant.variant,
        ctaText: selectedVariant.text,
      });
    } else {
      // Fallback to simple A/B test without PostHog
      const randomVariant = CTA_VARIANTS[Math.floor(Math.random() * CTA_VARIANTS.length)];
      setVariant(randomVariant);
    }
  }, []);

  return variant;
}

/**
 * Hook to track CTA clicks for A/B testing
 */
export function useTrackCTAClick(variant: CTAVariant) {
  return (plan: string) => {
    trackEvent('pricing_tier_selected', {
      plan,
      experiment: 'pricing-cta-test',
      variant: variant.variant,
      ctaText: variant.text,
      funnelStep: 'CTA Click',
      funnelStepNumber: 3,
    });
  };
}
