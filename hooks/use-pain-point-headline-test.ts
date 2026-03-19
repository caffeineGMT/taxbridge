/**
 * Pain-Point Focused Headline A/B Test - CRO Experiment
 *
 * OBJECTIVE: Test 3 pain-point focused headlines to increase landing page conversion
 * TARGET: 15%+ conversion lift
 * TIMELINE: 1-week test, 1000+ visitors per variant minimum
 *
 * VARIANTS:
 * 1. Save $5K+ on RSU Taxes (direct savings emphasis)
 * 2. Cross-Border Tax Made Simple (simplicity/ease emphasis)
 * 3. H1B/TN Workers: Calculate Your Tax Savings (audience + action emphasis)
 *
 * HYPOTHESIS: Pain-point focused headlines that directly address:
 * - Specific dollar savings ($5K+)
 * - Target audience identity (H1B/TN workers)
 * - Simplification of complex process
 * will convert better than generic "cross-border tax" messaging
 */

'use client';

import { useABTest } from './use-ab-test';

export type PainPointHeadlineVariant = 'variant-a-savings' | 'variant-b-simplicity' | 'variant-c-audience';

export interface PainPointHeadlineTestConfig {
  variant: PainPointHeadlineVariant;
  isLoading: boolean;
  headline: string;
  subheadline: string;
  showSavingsBadge: boolean;
  savingsAmount: string;
  ctaEmphasis: 'savings' | 'simplicity' | 'action';
  trackHeadlineViewed: () => void;
  trackHeadlineCTAClicked: () => void;
}

/**
 * Pain-Point Headline A/B Test
 *
 * Tests 3 different pain-point messaging approaches:
 * A. Direct savings ($5K+ saved)
 * B. Simplicity (complexity reduction)
 * C. Audience targeting (H1B/TN specific)
 */
export function usePainPointHeadlineTest(): PainPointHeadlineTestConfig {
  const { variant, isLoading, trackEvent } = useABTest<PainPointHeadlineVariant>({
    experimentName: 'landing-pain-point-headline-cro-2026-03',
    variants: {
      'variant-a-savings': { id: 'variant-a-savings', weight: 33 },
      'variant-b-simplicity': { id: 'variant-b-simplicity', weight: 33 },
      'variant-c-audience': { id: 'variant-c-audience', weight: 34 },
    },
    defaultVariant: 'variant-a-savings',
  });

  const VARIANTS = {
    'variant-a-savings': {
      headline: 'Save $5K+ on RSU Taxes',
      subheadline: 'H-1B and TN visa tech workers lose thousands to double taxation. Our CPA-verified calculator optimizes Foreign Tax Credits to eliminate overpayment.',
      showSavingsBadge: true,
      savingsAmount: '$5,000+',
      ctaEmphasis: 'savings' as const,
    },
    'variant-b-simplicity': {
      headline: 'Cross-Border Tax Made Simple',
      subheadline: 'Stop struggling with US-Canada tax filing. Built specifically for H-1B/TN visa workers with RSUs who need accurate Foreign Tax Credit calculations.',
      showSavingsBadge: false,
      savingsAmount: '',
      ctaEmphasis: 'simplicity' as const,
    },
    'variant-c-audience': {
      headline: 'H1B/TN Workers: Calculate Your Tax Savings',
      subheadline: 'Working in the US with RSUs but living in Canada? Get your exact Foreign Tax Credit optimization in 5 minutes with our free CPA-verified tool.',
      showSavingsBadge: true,
      savingsAmount: 'Calculate Now',
      ctaEmphasis: 'action' as const,
    },
  };

  return {
    variant,
    isLoading,
    headline: VARIANTS[variant].headline,
    subheadline: VARIANTS[variant].subheadline,
    showSavingsBadge: VARIANTS[variant].showSavingsBadge,
    savingsAmount: VARIANTS[variant].savingsAmount,
    ctaEmphasis: VARIANTS[variant].ctaEmphasis,
    trackHeadlineViewed: () => {
      trackEvent('landing_page_viewed', {
        funnelStep: 'Landing',
        funnelStepNumber: 1,
        experimentName: 'pain-point-headline-cro',
        headlineVariant: variant,
        headlineText: VARIANTS[variant].headline,
        ctaEmphasis: VARIANTS[variant].ctaEmphasis,
        showsSavingsBadge: VARIANTS[variant].showSavingsBadge,
      });
    },
    trackHeadlineCTAClicked: () => {
      trackEvent('cta_button_clicked', {
        funnelStep: 'Landing',
        funnelStepNumber: 1,
        experimentName: 'pain-point-headline-cro',
        headlineVariant: variant,
        headlineText: VARIANTS[variant].headline,
        ctaEmphasis: VARIANTS[variant].ctaEmphasis,
        destination: '/dashboard',
      });
    },
  };
}
