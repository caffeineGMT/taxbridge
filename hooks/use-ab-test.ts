/**
 * Enhanced A/B Testing Hook
 *
 * Provides a unified interface for running A/B tests with PostHog feature flags
 * Automatically tracks variant exposure and conversions
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import posthog from 'posthog-js';
import { trackEvent } from '@/lib/analytics/posthog';

export interface ABTestConfig<T extends string> {
  experimentName: string;
  variants: {
    [key in T]: {
      id: T;
      weight?: number; // For client-side fallback (0-100)
    };
  };
  defaultVariant: T;
}

export interface ABTestResult<T extends string> {
  variant: T;
  isLoading: boolean;
  trackConversion: (metadata?: Record<string, any>) => void;
  trackEvent: (eventName: string, metadata?: Record<string, any>) => void;
}

/**
 * Hook to run an A/B test with PostHog feature flags
 * Falls back to client-side randomization if PostHog is unavailable
 */
export function useABTest<T extends string>(
  config: ABTestConfig<T>
): ABTestResult<T> {
  const [variant, setVariant] = useState<T>(config.defaultVariant);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const determineVariant = () => {
      // Check if PostHog is loaded
      if (posthog.__loaded) {
        // Get feature flag from PostHog
        const flagValue = posthog.getFeatureFlag(config.experimentName);

        // Validate flag value is a valid variant
        const validVariants = Object.keys(config.variants) as T[];
        const selectedVariant = validVariants.includes(flagValue as T)
          ? (flagValue as T)
          : config.defaultVariant;

        setVariant(selectedVariant);

        // Track variant exposure
        trackEvent('page_viewed', {
          experiment: config.experimentName,
          variant: selectedVariant,
          exposureTracked: true,
        });
      } else {
        // Fallback to client-side weighted randomization
        const variants = Object.entries(config.variants) as [T, { id: T; weight?: number }][];
        const totalWeight = variants.reduce((sum, [_, v]) => sum + (v.weight || 100 / variants.length), 0);
        const random = Math.random() * totalWeight;

        let cumulativeWeight = 0;
        let selectedVariant = config.defaultVariant;

        for (const [key, value] of variants) {
          cumulativeWeight += value.weight || 100 / variants.length;
          if (random <= cumulativeWeight) {
            selectedVariant = key;
            break;
          }
        }

        setVariant(selectedVariant);
      }

      setIsLoading(false);
    };

    // Wait for PostHog to load, then determine variant
    const timer = setTimeout(determineVariant, 100);
    return () => clearTimeout(timer);
  }, [config]);

  // Track conversion event
  const trackConversion = useCallback(
    (metadata?: Record<string, any>) => {
      trackEvent('upgrade_button_clicked', {
        experiment: config.experimentName,
        variant,
        conversionTracked: true,
        ...metadata,
      });
    },
    [config.experimentName, variant]
  );

  // Track custom event with experiment context
  const trackCustomEvent = useCallback(
    (eventName: string, metadata?: Record<string, any>) => {
      trackEvent(eventName as any, {
        experiment: config.experimentName,
        variant,
        ...metadata,
      });
    },
    [config.experimentName, variant]
  );

  return {
    variant,
    isLoading,
    trackConversion,
    trackEvent: trackCustomEvent,
  };
}
