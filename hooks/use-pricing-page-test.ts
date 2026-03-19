/**
 * A/B Test #3: Pricing Page Value Proposition
 *
 * PROBLEM: 16% drop-off from Pricing Page → Checkout Started
 * HYPOTHESIS: Value proposition is unclear or price seems high compared to perceived value
 *
 * Variants:
 * - Control: Standard "Pro Plan - $49/year" with feature list
 * - ROI-Focused: "$49 to save $2,500+ on taxes" (ROI angle)
 * - Social-Proof: Feature testimonials and "1,247 users" badge
 */

'use client';

import { useABTest } from './use-ab-test';

export type PricingVariant = 'control' | 'roi-focused' | 'social-proof';

export interface PricingTestConfig {
  variant: PricingVariant;
  isLoading: boolean;
  trackPricingPageViewed: () => void;
  trackTierSelected: (tier: string) => void;
  trackCheckoutStarted: (tier: string) => void;
  trackFeatureHighlighted: (feature: string) => void;
}

/**
 * Hook for pricing page A/B test
 */
export function usePricingPageTest(): PricingTestConfig {
  const { variant, isLoading, trackConversion, trackEvent } = useABTest<PricingVariant>({
    experimentName: 'pricing-page-test',
    variants: {
      control: { id: 'control', weight: 33 },
      'roi-focused': { id: 'roi-focused', weight: 33 },
      'social-proof': { id: 'social-proof', weight: 34 },
    },
    defaultVariant: 'control',
  });

  return {
    variant,
    isLoading,
    trackPricingPageViewed: () => {
      trackEvent('pricing_page_viewed', {
        funnelStep: 'Pricing Page Viewed',
        funnelStepNumber: 5,
      });
    },
    trackTierSelected: (tier: string) => {
      trackEvent('pricing_tier_selected', {
        plan: tier,
        funnelStep: 'Pricing Tier Selected',
        funnelStepNumber: 6,
      });
    },
    trackCheckoutStarted: (tier: string) => {
      trackConversion({
        plan: tier,
        funnelStep: 'Checkout Started',
        funnelStepNumber: 7,
        conversionEvent: 'checkout_started',
      });
    },
    trackFeatureHighlighted: (feature: string) => {
      trackEvent('page_viewed', {
        interactionType: 'feature_highlighted',
        feature,
      });
    },
  };
}

/**
 * Configuration for each variant
 */
export const PRICING_VARIANTS = {
  control: {
    headline: 'Upgrade to Pro',
    subheadline: 'Unlock advanced features for accurate cross-border tax planning',
    priceDisplay: {
      primary: '$49',
      frequency: '/year',
      savings: null,
    },
    ctaText: 'Start 14-Day Free Trial',
    ctaSubtext: 'No credit card required',
    showROI: false,
    showSocialProof: false,
    showTestimonials: false,
    features: [
      'Unlimited RSU calculations',
      'Multi-year tax planning',
      'PDF export for tax filing',
      'FTC optimization tool',
      'Email deadline reminders',
      'Priority support',
    ],
  },
  'roi-focused': {
    headline: 'Invest $49 to Save $2,500+ on Taxes',
    subheadline: 'Our average Pro user saves 51x the cost in tax optimization',
    priceDisplay: {
      primary: '$49/year',
      frequency: 'One-time payment',
      savings: '$4.08/month',
    },
    ctaText: 'Save $2,500+ on Taxes →',
    ctaSubtext: '14-day money-back guarantee',
    showROI: true,
    showSocialProof: false,
    showTestimonials: false,
    roiCalculation: {
      averageTaxSavings: '$2,543',
      roi: '51.9x',
      paybackTime: '1 hour of use',
    },
    features: [
      '💰 Save $2,500+ on cross-border taxes',
      '📊 Multi-year tax planning dashboard',
      '📄 IRS-ready PDF reports',
      '🎯 FTC optimization (max your credits)',
      '⏰ Never miss a tax deadline',
      '🚀 Priority email support',
    ],
  },
  'social-proof': {
    headline: 'Join 1,247 H-1B Workers Optimizing Their Taxes',
    subheadline: 'Trusted by engineers at Google, Meta, Amazon, and Microsoft',
    priceDisplay: {
      primary: '$49',
      frequency: '/year',
      savings: 'Limited time: 50% off ($99 → $49)',
    },
    ctaText: 'Claim 50% Discount →',
    ctaSubtext: 'Offer ends March 31, 2026',
    showROI: false,
    showSocialProof: true,
    showTestimonials: true,
    socialProof: {
      userCount: '1,247',
      companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'],
      rating: '4.8/5.0',
      reviewCount: 126,
    },
    testimonials: [
      {
        quote: 'Saved me $3,200 in FTC optimization. Worth every penny!',
        author: 'Raj P.',
        role: 'H-1B SWE at Google',
      },
      {
        quote: 'The multi-year planning alone is worth 10x the price.',
        author: 'Emily C.',
        role: 'TN Visa at Microsoft',
      },
    ],
    features: [
      'Unlimited RSU calculations',
      'Multi-year tax planning',
      'PDF export for tax filing',
      'FTC optimization tool',
      'Email deadline reminders',
      'Priority support',
    ],
  },
} as const;
