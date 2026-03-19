/**
 * Pricing Experiment Hook
 *
 * A/B/C Test: $49/year vs $79/year vs $99/year for Pro plan
 * + Monthly $19 option available to all variants
 *
 * Tracks:
 * - Which variant users see (33/33/33 split)
 * - Which billing interval they choose (annual vs monthly)
 * - Which price point converts best
 * - Product Hunt cohort behavior
 */

'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics/posthog';
import posthog from 'posthog-js';

export type PricingVariant = 'annual_49' | 'annual_79' | 'annual_99';
export type BillingInterval = 'monthly' | 'annual';

export interface PricingExperimentConfig {
  // A/B/C test variant
  variant: PricingVariant;
  isLoading: boolean;

  // Pricing details for selected variant
  annualPrice: number;
  annualPriceId: string;
  monthlyPrice: number;
  monthlyPriceId: string;

  // Currently selected interval
  selectedInterval: BillingInterval;
  setSelectedInterval: (interval: BillingInterval) => void;

  // Get price ID based on current selection
  getCurrentPriceId: () => string;
  getCurrentPrice: () => number;

  // Tracking functions
  trackVariantExposure: () => void;
  trackIntervalToggle: (newInterval: BillingInterval) => void;
  trackPriceSelected: (interval: BillingInterval, price: number) => void;
}

/**
 * Check if user came from Product Hunt
 */
function isProductHuntUser(): boolean {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  const utmCampaign = params.get('utm_campaign');
  const ref = params.get('ref');

  return (
    utmSource === 'producthunt' ||
    utmCampaign?.includes('producthunt') ||
    ref === 'producthunt' ||
    ref === 'ph'
  );
}

/**
 * Get or set variant assignment (persisted in localStorage)
 */
function getVariantAssignment(): PricingVariant {
  if (typeof window === 'undefined') return 'annual_49';

  // Check if user has existing assignment
  const stored = localStorage.getItem('pricing_experiment_variant');
  if (stored === 'annual_49' || stored === 'annual_79' || stored === 'annual_99') {
    return stored;
  }

  // New assignment: 33/33/33 split for 3-way test
  const random = Math.random();
  let variant: PricingVariant;

  if (random < 0.33) {
    variant = 'annual_49';
  } else if (random < 0.66) {
    variant = 'annual_79';
  } else {
    variant = 'annual_99';
  }

  // Persist assignment
  localStorage.setItem('pricing_experiment_variant', variant);
  localStorage.setItem('pricing_experiment_assigned_at', new Date().toISOString());

  // Tag Product Hunt users
  if (isProductHuntUser()) {
    localStorage.setItem('user_cohort', 'product_hunt');
    localStorage.setItem('user_cohort_date', new Date().toISOString());
  }

  return variant;
}

/**
 * Hook for pricing experiment
 */
export function usePricingExperiment(): PricingExperimentConfig {
  const [variant, setVariant] = useState<PricingVariant>('annual_49');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>('annual');

  // Initialize variant on mount
  useEffect(() => {
    const assigned = getVariantAssignment();
    setVariant(assigned);
    setIsLoading(false);

    // Track exposure to PostHog
    trackEvent('pricing_experiment_exposed', {
      variant: assigned,
      experiment_name: 'annual_pricing_test_2026_q1',
      is_product_hunt_user: isProductHuntUser(),
      user_cohort: localStorage.getItem('user_cohort') || 'organic',
    });

    // Set PostHog feature flag
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('$feature_flag_called', {
        $feature_flag: 'pricing_experiment_variant',
        $feature_flag_response: assigned,
      });
    }
  }, []);

  // Price configuration by variant
  const priceConfig = {
    annual_49: {
      annualPrice: 49,
      annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_1ProAnnual49',
      monthlyPrice: 19,
      monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY || 'price_1ProMonthly19',
    },
    annual_79: {
      annualPrice: 79,
      annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_79 || 'price_1ProAnnual79',
      monthlyPrice: 19,
      monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY || 'price_1ProMonthly19',
    },
    annual_99: {
      annualPrice: 99,
      annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_99 || 'price_1ProAnnual99',
      monthlyPrice: 19,
      monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_MONTHLY || 'price_1ProMonthly19',
    },
  };

  const config = priceConfig[variant];

  const getCurrentPriceId = () => {
    return selectedInterval === 'annual' ? config.annualPriceId : config.monthlyPriceId;
  };

  const getCurrentPrice = () => {
    return selectedInterval === 'annual' ? config.annualPrice : config.monthlyPrice;
  };

  const trackVariantExposure = () => {
    trackEvent('pricing_page_viewed', {
      variant,
      annualPrice: config.annualPrice,
      monthlyPrice: config.monthlyPrice,
      defaultInterval: selectedInterval,
      experiment: 'annual_pricing_test_2026_q1',
      is_product_hunt_user: isProductHuntUser(),
      user_cohort: localStorage.getItem('user_cohort') || 'organic',
    });
  };

  const trackIntervalToggle = (newInterval: BillingInterval) => {
    trackEvent('pricing_interval_toggled', {
      variant,
      from: selectedInterval,
      to: newInterval,
      annualPrice: config.annualPrice,
      monthlyPrice: config.monthlyPrice,
      experiment: 'annual_pricing_test_2026_q1',
    });
    setSelectedInterval(newInterval);
  };

  const trackPriceSelected = (interval: BillingInterval, price: number) => {
    trackEvent('pricing_tier_selected', {
      variant,
      interval,
      price,
      priceId: interval === 'annual' ? config.annualPriceId : config.monthlyPriceId,
      experiment: 'annual_pricing_test_2026_q1',
      is_product_hunt_user: isProductHuntUser(),
      user_cohort: localStorage.getItem('user_cohort') || 'organic',
    });
  };

  return {
    variant,
    isLoading,
    annualPrice: config.annualPrice,
    annualPriceId: config.annualPriceId,
    monthlyPrice: config.monthlyPrice,
    monthlyPriceId: config.monthlyPriceId,
    selectedInterval,
    setSelectedInterval: trackIntervalToggle,
    getCurrentPriceId,
    getCurrentPrice,
    trackVariantExposure,
    trackIntervalToggle,
    trackPriceSelected,
  };
}

/**
 * Get user cohort (Product Hunt, organic, etc.)
 */
export function getUserCohort(): string {
  if (typeof window === 'undefined') return 'unknown';
  return localStorage.getItem('user_cohort') || 'organic';
}

/**
 * Check if current user is in Product Hunt cohort
 */
export function isInProductHuntCohort(): boolean {
  return getUserCohort() === 'product_hunt';
}
