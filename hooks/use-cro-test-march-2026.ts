/**
 * Landing Page CRO Test - March 2026
 *
 * FOCUSED 2x2 FACTORIAL TEST:
 * - 2 Headline Variants
 * - 2 CTA Variants
 * - 4 Total Combinations
 *
 * GOAL: Identify winning headline + CTA combination
 * DURATION: 2 weeks (March 19 - April 2, 2026)
 * TARGET: 1000+ visitors per variant (4000 total)
 *
 * TEST VARIANTS:
 * Headline A: "Save $5K+ on RSU Taxes"
 * Headline B: "H1B Workers: Stop Overpaying Taxes"
 * CTA A: "Calculate Now"
 * CTA B: "See My Savings"
 *
 * COMBINATIONS:
 * 1. Control: Headline A + CTA A
 * 2. Variant 1: Headline A + CTA B
 * 3. Variant 2: Headline B + CTA A
 * 4. Variant 3: Headline B + CTA B
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import posthog from 'posthog-js';
import { trackEvent } from '@/lib/analytics/posthog';

// Test variant IDs
export type CROVariant = 'control' | 'variant-1' | 'variant-2' | 'variant-3';

export interface CROTestConfig {
  variant: CROVariant;
  isLoading: boolean;

  // Headline config
  headline: string;
  headlineType: 'savings-amount' | 'problem-focused';
  subheadline: string;

  // CTA config
  primaryCTA: string;
  ctaType: 'action-oriented' | 'benefit-oriented';
  primaryColor: string;

  // Tracking
  trackPageView: () => void;
  trackCTAClick: (destination: string) => void;
  trackConversion: (metadata?: Record<string, any>) => void;
}

/**
 * CRO Test Hook - March 2026
 *
 * 2x2 factorial design testing:
 * - Headline impact on engagement
 * - CTA impact on click-through
 * - Combined interaction effects
 */
export function useCROTest(): CROTestConfig {
  const [variant, setVariant] = useState<CROVariant>('control');
  const [isLoading, setIsLoading] = useState(true);

  // Determine variant on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const determineVariant = () => {
      // Check if PostHog is loaded
      if (posthog.__loaded) {
        // Get feature flag from PostHog
        const flagValue = posthog.getFeatureFlag('landing-cro-march-2026');

        // Validate flag value
        const validVariants: CROVariant[] = ['control', 'variant-1', 'variant-2', 'variant-3'];
        const selectedVariant = validVariants.includes(flagValue as CROVariant)
          ? (flagValue as CROVariant)
          : 'control';

        setVariant(selectedVariant);
      } else {
        // Fallback to client-side 25/25/25/25 split
        const random = Math.random() * 100;
        let selectedVariant: CROVariant = 'control';

        if (random < 25) {
          selectedVariant = 'control';
        } else if (random < 50) {
          selectedVariant = 'variant-1';
        } else if (random < 75) {
          selectedVariant = 'variant-2';
        } else {
          selectedVariant = 'variant-3';
        }

        setVariant(selectedVariant);
      }

      setIsLoading(false);
    };

    // Wait for PostHog to load
    const timer = setTimeout(determineVariant, 100);
    return () => clearTimeout(timer);
  }, []);

  // Variant configurations
  const VARIANTS = {
    // Control: Headline A + CTA A
    control: {
      headline: 'Save $5K+ on RSU Taxes',
      headlineType: 'savings-amount' as const,
      subheadline: 'H-1B and TN visa tech workers: Optimize your Foreign Tax Credits and eliminate double taxation on US stock compensation.',
      primaryCTA: 'Calculate Now',
      ctaType: 'action-oriented' as const,
      primaryColor: 'bg-emerald-500 hover:bg-emerald-600',
    },
    // Variant 1: Headline A + CTA B
    'variant-1': {
      headline: 'Save $5K+ on RSU Taxes',
      headlineType: 'savings-amount' as const,
      subheadline: 'H-1B and TN visa tech workers: Optimize your Foreign Tax Credits and eliminate double taxation on US stock compensation.',
      primaryCTA: 'See My Savings',
      ctaType: 'benefit-oriented' as const,
      primaryColor: 'bg-emerald-500 hover:bg-emerald-600',
    },
    // Variant 2: Headline B + CTA A
    'variant-2': {
      headline: 'H1B Workers: Stop Overpaying Taxes',
      headlineType: 'problem-focused' as const,
      subheadline: 'Cross-border taxation is complex. Most H-1B/TN workers lose thousands annually to incorrect Foreign Tax Credit calculations. Get it right.',
      primaryCTA: 'Calculate Now',
      ctaType: 'action-oriented' as const,
      primaryColor: 'bg-orange-500 hover:bg-orange-600',
    },
    // Variant 3: Headline B + CTA B
    'variant-3': {
      headline: 'H1B Workers: Stop Overpaying Taxes',
      headlineType: 'problem-focused' as const,
      subheadline: 'Cross-border taxation is complex. Most H-1B/TN workers lose thousands annually to incorrect Foreign Tax Credit calculations. Get it right.',
      primaryCTA: 'See My Savings',
      ctaType: 'benefit-oriented' as const,
      primaryColor: 'bg-orange-500 hover:bg-orange-600',
    },
  };

  const currentVariant = VARIANTS[variant];

  // Track page view with variant exposure
  const trackPageView = useCallback(() => {
    trackEvent('landing_page_viewed', {
      experiment: 'cro-test-march-2026',
      variant,
      headlineType: currentVariant.headlineType,
      ctaType: currentVariant.ctaType,
      headline: currentVariant.headline,
      primaryCTA: currentVariant.primaryCTA,
      funnelStep: 'Landing',
      funnelStepNumber: 1,
      testStartDate: '2026-03-19',
      testEndDate: '2026-04-02',
    });
  }, [variant, currentVariant]);

  // Track CTA click
  const trackCTAClick = useCallback(
    (destination: string) => {
      trackEvent('upgrade_button_clicked', {
        experiment: 'cro-test-march-2026',
        variant,
        headlineType: currentVariant.headlineType,
        ctaType: currentVariant.ctaType,
        ctaText: currentVariant.primaryCTA,
        destination,
        funnelStep: 'CTA Click',
        funnelStepNumber: 2,
        conversionEvent: 'cta_clicked',
      });
    },
    [variant, currentVariant]
  );

  // Track conversion (signup, payment, etc.)
  const trackConversion = useCallback(
    (metadata?: Record<string, any>) => {
      trackEvent('signup_completed', {
        experiment: 'cro-test-march-2026',
        variant,
        headlineType: currentVariant.headlineType,
        ctaType: currentVariant.ctaType,
        conversionTracked: true,
        ...metadata,
      });
    },
    [variant, currentVariant]
  );

  return {
    variant,
    isLoading,
    headline: currentVariant.headline,
    headlineType: currentVariant.headlineType,
    subheadline: currentVariant.subheadline,
    primaryCTA: currentVariant.primaryCTA,
    ctaType: currentVariant.ctaType,
    primaryColor: currentVariant.primaryColor,
    trackPageView,
    trackCTAClick,
    trackConversion,
  };
}

/**
 * Get test configuration for display/debugging
 */
export function getCROTestConfig() {
  return {
    experimentName: 'landing-cro-march-2026',
    startDate: '2026-03-19',
    endDate: '2026-04-02',
    targetVisitorsPerVariant: 1000,
    totalVariants: 4,
    targetTotalVisitors: 4000,
    variants: {
      control: {
        headline: 'Save $5K+ on RSU Taxes',
        cta: 'Calculate Now',
        description: 'Control - Savings amount + Action-oriented CTA',
      },
      'variant-1': {
        headline: 'Save $5K+ on RSU Taxes',
        cta: 'See My Savings',
        description: 'Variant 1 - Savings amount + Benefit-oriented CTA',
      },
      'variant-2': {
        headline: 'H1B Workers: Stop Overpaying Taxes',
        cta: 'Calculate Now',
        description: 'Variant 2 - Problem-focused + Action-oriented CTA',
      },
      'variant-3': {
        headline: 'H1B Workers: Stop Overpaying Taxes',
        cta: 'See My Savings',
        description: 'Variant 3 - Problem-focused + Benefit-oriented CTA',
      },
    },
    hypothesis: {
      headline: 'Problem-focused headline ("Stop Overpaying") will outperform savings amount headline',
      cta: 'Benefit-oriented CTA ("See My Savings") will outperform action-oriented CTA',
      interaction: 'Problem headline + Benefit CTA combination will be the winning variant',
    },
    metrics: {
      primary: 'CTA click-through rate (CTR)',
      secondary: ['Time on page', 'Scroll depth', 'Calculator completion rate'],
      successCriteria: '15%+ lift in CTR over control',
    },
  };
}
