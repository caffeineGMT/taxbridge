/**
 * Conversion Optimization Experiments Hook
 *
 * Runs 3 simultaneous A/B tests on the pricing page:
 * 1. Pricing headline test (value prop variations)
 * 2. Free tier limit test (5 calcs vs unlimited)
 * 3. Social proof placement test (above fold vs below pricing vs sidebar)
 *
 * Target: 20%+ lift in free→paid conversion
 */

'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics/posthog';
import posthog from 'posthog-js';

// ============================================================================
// EXPERIMENT 1: PRICING HEADLINE TEST
// ============================================================================

export type HeadlineVariant = 'control' | 'roi_focused' | 'pain_point';

interface HeadlineConfig {
  variant: HeadlineVariant;
  title: string;
  subtitle: string;
}

const HEADLINE_VARIANTS: Record<HeadlineVariant, HeadlineConfig> = {
  control: {
    variant: 'control',
    title: 'Simple, Transparent Pricing',
    subtitle: 'Choose the plan that fits your cross-border tax needs. All plans include our core tax calculation engine, USD/CAD conversion, and Treaty Article XV compliance.',
  },
  roi_focused: {
    variant: 'roi_focused',
    title: 'Pay $49 to Save $2,500+ on Taxes',
    subtitle: 'Professional RSU tax optimization pays for itself 50x over. Join 500+ H-1B workers who reduced their cross-border tax liability by an average of $2,500/year.',
  },
  pain_point: {
    variant: 'pain_point',
    title: 'Stop Overpaying Taxes on Your RSUs',
    subtitle: 'Most H-1B workers lose $2,000+ annually to missed Foreign Tax Credits. Our calculator finds every deduction you deserve—in under 5 minutes.',
  },
};

// ============================================================================
// EXPERIMENT 2: FREE TIER LIMIT TEST
// ============================================================================
// Testing 3 variants to optimize conversion rate:
// 1. limited_5: 5 RSU entries max (creates urgency)
// 2. limited_10: 10 RSU entries max (current production baseline)
// 3. unlimited_gated: Unlimited RSU entries but gates premium features (PDF, AI, CSV)
//
// Hypothesis: limited_10 will have highest conversion as it provides enough value
// to test the product thoroughly without overwhelming free tier abuse

export type FreeTierVariant = 'limited_5' | 'limited_10' | 'unlimited_gated';

interface FreeTierConfig {
  variant: FreeTierVariant;
  maxRSUEntries: number | 'unlimited';
  label: string;
  urgencyMessage?: string;
  gatedFeatures?: {
    pdfExport: boolean;
    aiAdvisor: boolean;
    csvImport: boolean;
    multiYear: boolean;
    prioritySupport: boolean;
  };
}

const FREE_TIER_VARIANTS: Record<FreeTierVariant, FreeTierConfig> = {
  limited_5: {
    variant: 'limited_5',
    maxRSUEntries: 5,
    label: '5 RSU entries',
    urgencyMessage: '⚠️ Limited to 5 RSU entries—upgrade for unlimited access',
    gatedFeatures: {
      pdfExport: false,
      aiAdvisor: false,
      csvImport: false,
      multiYear: false,
      prioritySupport: false,
    },
  },
  limited_10: {
    variant: 'limited_10',
    maxRSUEntries: 10,
    label: '10 RSU entries',
    urgencyMessage: '⏱️ 10 free entries—upgrade anytime for unlimited',
    gatedFeatures: {
      pdfExport: false,
      aiAdvisor: false,
      csvImport: false,
      multiYear: false,
      prioritySupport: false,
    },
  },
  unlimited_gated: {
    variant: 'unlimited_gated',
    maxRSUEntries: 'unlimited',
    label: 'Unlimited RSU entries',
    urgencyMessage: '💡 Try unlimited entries—upgrade for PDF export & AI advisor',
    gatedFeatures: {
      pdfExport: false,
      aiAdvisor: false,
      csvImport: false,
      multiYear: false,
      prioritySupport: false,
    },
  },
};

// ============================================================================
// EXPERIMENT 3: SOCIAL PROOF PLACEMENT TEST
// ============================================================================

export type SocialProofVariant = 'above_fold' | 'below_pricing' | 'sidebar';

interface SocialProofConfig {
  variant: SocialProofVariant;
  layout: 'above_fold' | 'below_pricing' | 'sidebar';
  showTestimonials: boolean;
  showTrustBadges: boolean;
  showUserCount: boolean;
}

const SOCIAL_PROOF_VARIANTS: Record<SocialProofVariant, SocialProofConfig> = {
  above_fold: {
    variant: 'above_fold',
    layout: 'above_fold',
    showTestimonials: true,
    showTrustBadges: true,
    showUserCount: true,
  },
  below_pricing: {
    variant: 'below_pricing',
    layout: 'below_pricing',
    showTestimonials: true,
    showTrustBadges: true,
    showUserCount: true,
  },
  sidebar: {
    variant: 'sidebar',
    layout: 'sidebar',
    showTestimonials: true,
    showTrustBadges: true,
    showUserCount: true,
  },
};

// ============================================================================
// VARIANT ASSIGNMENT & PERSISTENCE
// ============================================================================

function getVariantAssignment<T extends string>(
  experimentKey: string,
  variants: T[],
  weights?: number[]
): T {
  if (typeof window === 'undefined') return variants[0];

  // Check for existing assignment
  const stored = localStorage.getItem(experimentKey);
  if (stored && variants.includes(stored as T)) {
    return stored as T;
  }

  // New assignment with optional weighted distribution
  let variant: T;

  if (weights && weights.length === variants.length) {
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < variants.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        variant = variants[i];
        break;
      }
    }
    variant = variant! || variants[0];
  } else {
    // Equal distribution
    const randomIndex = Math.floor(Math.random() * variants.length);
    variant = variants[randomIndex];
  }

  // Persist assignment
  localStorage.setItem(experimentKey, variant);
  localStorage.setItem(`${experimentKey}_assigned_at`, new Date().toISOString());

  return variant;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export interface ConversionExperimentsConfig {
  // Experiment states
  isLoading: boolean;

  // Experiment 1: Headline
  headline: HeadlineConfig;

  // Experiment 2: Free Tier Limit
  freeTier: FreeTierConfig;

  // Experiment 3: Social Proof Placement
  socialProof: SocialProofConfig;

  // Tracking functions
  trackExperimentExposure: () => void;
  trackConversion: (eventType: 'signup' | 'checkout' | 'paid') => void;
}

export function useConversionExperiments(): ConversionExperimentsConfig {
  const [isLoading, setIsLoading] = useState(true);
  const [headlineVariant, setHeadlineVariant] = useState<HeadlineVariant>('control');
  const [freeTierVariant, setFreeTierVariant] = useState<FreeTierVariant>('limited_10'); // Fixed: was 'unlimited' (invalid), now 'limited_10' (current baseline)
  const [socialProofVariant, setSocialProofVariant] = useState<SocialProofVariant>('above_fold');

  // Initialize variants on mount
  useEffect(() => {
    // Experiment 1: Pricing headline (equal split)
    const headline = getVariantAssignment<HeadlineVariant>(
      'experiment_pricing_headline',
      ['control', 'roi_focused', 'pain_point']
    );
    setHeadlineVariant(headline);

    // Experiment 2: Free tier limit (equal 3-way split)
    const freeTier = getVariantAssignment<FreeTierVariant>(
      'experiment_free_tier_limit',
      ['limited_5', 'limited_10', 'unlimited_gated']
    );
    setFreeTierVariant(freeTier);

    // Experiment 3: Social proof placement (equal split)
    const socialProof = getVariantAssignment<SocialProofVariant>(
      'experiment_social_proof_placement',
      ['above_fold', 'below_pricing', 'sidebar']
    );
    setSocialProofVariant(socialProof);

    setIsLoading(false);

    // Track exposure to all experiments
    const experimentData = {
      headline_variant: headline,
      free_tier_variant: freeTier,
      social_proof_variant: socialProof,
      experiment_session: `${headline}_${freeTier}_${socialProof}`,
    };

    trackEvent('page_viewed', {
      page: '/pricing',
      experiment_group: 'conversion_optimization_2026_q1',
      ...experimentData,
    });

    // Set PostHog feature flags
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('$feature_flag_called', {
        $feature_flag: 'pricing_headline_experiment',
        $feature_flag_response: headline,
      });
      posthog.capture('$feature_flag_called', {
        $feature_flag: 'free_tier_limit_experiment',
        $feature_flag_response: freeTier,
      });
      posthog.capture('$feature_flag_called', {
        $feature_flag: 'social_proof_placement_experiment',
        $feature_flag_response: socialProof,
      });
    }
  }, []);

  const trackExperimentExposure = () => {
    const experimentData = {
      headline_variant: headlineVariant,
      free_tier_variant: freeTierVariant,
      social_proof_variant: socialProofVariant,
      experiment_session: `${headlineVariant}_${freeTierVariant}_${socialProofVariant}`,
    };

    trackEvent('pricing_page_viewed', {
      page: '/pricing',
      funnelStep: 'Pricing',
      funnelStepNumber: 2,
      experiment_group: 'conversion_optimization_2026_q1',
      ...experimentData,
    });

    // Track to API for experiment metrics
    fetch('/api/analytics/conversion-experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'exposure',
        ...experimentData,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  };

  const trackConversion = (eventType: 'signup' | 'checkout' | 'paid') => {
    const experimentData = {
      headline_variant: headlineVariant,
      free_tier_variant: freeTierVariant,
      social_proof_variant: socialProofVariant,
      experiment_session: `${headlineVariant}_${freeTierVariant}_${socialProofVariant}`,
    };

    const eventMap = {
      signup: 'signup_completed',
      checkout: 'checkout_started',
      paid: 'subscription_activated',
    };

    trackEvent(eventMap[eventType] as any, {
      experiment_group: 'conversion_optimization_2026_q1',
      ...experimentData,
    });

    // Track to API for experiment metrics
    fetch('/api/analytics/conversion-experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'conversion',
        conversionType: eventType,
        ...experimentData,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  };

  return {
    isLoading,
    headline: HEADLINE_VARIANTS[headlineVariant],
    freeTier: FREE_TIER_VARIANTS[freeTierVariant],
    socialProof: SOCIAL_PROOF_VARIANTS[socialProofVariant],
    trackExperimentExposure,
    trackConversion,
  };
}

/**
 * Get all active experiment variants for a user
 */
export function getUserExperimentVariants() {
  if (typeof window === 'undefined') {
    return {
      headline: 'control',
      freeTier: 'limited_10', // Default to current production baseline
      socialProof: 'above_fold',
    };
  }

  return {
    headline: localStorage.getItem('experiment_pricing_headline') || 'control',
    freeTier: localStorage.getItem('experiment_free_tier_limit') || 'limited_10',
    socialProof: localStorage.getItem('experiment_social_proof_placement') || 'above_fold',
  };
}
