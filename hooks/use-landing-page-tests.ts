/**
 * Landing Page A/B Testing Suite
 *
 * Multiple simultaneous experiments to optimize landing page conversion:
 * 1. Headline variations (3 variants)
 * 2. CTA button copy/color (4 variants)
 * 3. Trust signals placement (3 layouts)
 *
 * Target: 5%+ lift in calculator → signup conversion
 */

'use client';

import { useABTest } from './use-ab-test';

// ==================== HEADLINE VARIATIONS ====================

export type HeadlineVariant = 'control' | 'pain-focused' | 'outcome-focused';

export interface HeadlineTestConfig {
  variant: HeadlineVariant;
  isLoading: boolean;
  headline: string;
  subheadline: string;
  trackHeadlineViewed: () => void;
}

/**
 * A/B Test #1: Headline Variations
 *
 * HYPOTHESIS: More specific, benefit-driven headlines will convert better
 * than generic "simplify" messaging
 */
export function useHeadlineTest(): HeadlineTestConfig {
  const { variant, isLoading, trackEvent } = useABTest<HeadlineVariant>({
    experimentName: 'landing-headline-test',
    variants: {
      control: { id: 'control', weight: 33 },
      'pain-focused': { id: 'pain-focused', weight: 33 },
      'outcome-focused': { id: 'outcome-focused', weight: 34 },
    },
    defaultVariant: 'control',
  });

  const VARIANTS = {
    control: {
      headline: 'Simplify Your Cross-Border Tax Filing',
      subheadline: 'Built for H-1B and TN visa tech workers with US RSUs now living in Canada. Navigate dual-country taxation with confidence.',
    },
    'pain-focused': {
      headline: 'Paying Double Tax on Your RSUs?',
      subheadline: 'H-1B/TN visa holders lose $2,500+ annually to incorrect Foreign Tax Credits. Get it right the first time with TaxBridge.',
    },
    'outcome-focused': {
      headline: 'Save $2,500+ on Cross-Border Taxes',
      subheadline: 'Free calculator built for H-1B/TN tech workers with RSUs. Optimize Foreign Tax Credits, eliminate double taxation, file with confidence.',
    },
  };

  return {
    variant,
    isLoading,
    headline: VARIANTS[variant].headline,
    subheadline: VARIANTS[variant].subheadline,
    trackHeadlineViewed: () => {
      trackEvent('landing_page_viewed', {
        funnelStep: 'Landing',
        funnelStepNumber: 1,
        headlineVariant: variant,
      });
    },
  };
}

// ==================== CTA BUTTON VARIATIONS ====================

export type CTAVariant = 'control' | 'urgency' | 'value-prop' | 'social-proof';

export interface CTATestConfig {
  variant: CTAVariant;
  isLoading: boolean;
  primaryText: string;
  primaryColor: string;
  primaryHoverColor: string;
  subtext?: string;
  trackCTAClick: (destination: string) => void;
}

/**
 * A/B Test #2: CTA Button Copy & Color
 *
 * HYPOTHESIS: Value-oriented CTAs with contrasting colors will outperform
 * generic "Get Started" buttons
 */
export function useCTATest(): CTATestConfig {
  const { variant, isLoading, trackConversion, trackEvent } = useABTest<CTAVariant>({
    experimentName: 'landing-cta-test',
    variants: {
      control: { id: 'control', weight: 25 },
      urgency: { id: 'urgency', weight: 25 },
      'value-prop': { id: 'value-prop', weight: 25 },
      'social-proof': { id: 'social-proof', weight: 25 },
    },
    defaultVariant: 'control',
  });

  const VARIANTS = {
    control: {
      primaryText: 'Get Started',
      primaryColor: 'bg-emerald-500 hover:bg-emerald-600',
      primaryHoverColor: 'hover:bg-emerald-600',
      subtext: undefined,
    },
    urgency: {
      primaryText: 'Calculate Your Savings Now',
      primaryColor: 'bg-orange-500 hover:bg-orange-600',
      primaryHoverColor: 'hover:bg-orange-600',
      subtext: '⏱️ Free for limited time',
    },
    'value-prop': {
      primaryText: 'Save $2,500+ on Taxes →',
      primaryColor: 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600',
      primaryHoverColor: 'hover:from-emerald-600 hover:to-blue-600',
      subtext: 'Free calculator • No credit card required',
    },
    'social-proof': {
      primaryText: 'Join 1,247 Users',
      primaryColor: 'bg-blue-600 hover:bg-blue-700',
      primaryHoverColor: 'hover:bg-blue-700',
      subtext: '⭐ 4.8/5 from H-1B workers at FAANG',
    },
  };

  return {
    variant,
    isLoading,
    primaryText: VARIANTS[variant].primaryText,
    primaryColor: VARIANTS[variant].primaryColor,
    primaryHoverColor: VARIANTS[variant].primaryHoverColor,
    subtext: VARIANTS[variant].subtext,
    trackCTAClick: (destination: string) => {
      trackConversion({
        destination,
        ctaVariant: variant,
        ctaText: VARIANTS[variant].primaryText,
        funnelStep: 'CTA Click',
        funnelStepNumber: 2,
        conversionEvent: 'signup_button_clicked',
      });
    },
  };
}

// ==================== TRUST SIGNALS VARIATIONS ====================

export type TrustSignalsVariant = 'control' | 'social-proof-top' | 'badges-inline';

export interface TrustSignalsTestConfig {
  variant: TrustSignalsVariant;
  isLoading: boolean;
  layout: 'below-cta' | 'above-hero' | 'inline-features';
  showUserCount: boolean;
  showCompanyLogos: boolean;
  showSecurityBadges: boolean;
  trackTrustSignalViewed: () => void;
}

/**
 * A/B Test #3: Trust Signals Placement
 *
 * HYPOTHESIS: Displaying social proof early (above hero) will reduce bounce
 * rate and increase engagement
 */
export function useTrustSignalsTest(): TrustSignalsTestConfig {
  const { variant, isLoading, trackEvent } = useABTest<TrustSignalsVariant>({
    experimentName: 'landing-trust-signals-test',
    variants: {
      control: { id: 'control', weight: 33 },
      'social-proof-top': { id: 'social-proof-top', weight: 33 },
      'badges-inline': { id: 'badges-inline', weight: 34 },
    },
    defaultVariant: 'control',
  });

  const VARIANTS = {
    control: {
      layout: 'below-cta' as const,
      showUserCount: true,
      showCompanyLogos: false,
      showSecurityBadges: true,
    },
    'social-proof-top': {
      layout: 'above-hero' as const,
      showUserCount: true,
      showCompanyLogos: true,
      showSecurityBadges: true,
    },
    'badges-inline': {
      layout: 'inline-features' as const,
      showUserCount: true,
      showCompanyLogos: true,
      showSecurityBadges: true,
    },
  };

  return {
    variant,
    isLoading,
    layout: VARIANTS[variant].layout,
    showUserCount: VARIANTS[variant].showUserCount,
    showCompanyLogos: VARIANTS[variant].showCompanyLogos,
    showSecurityBadges: VARIANTS[variant].showSecurityBadges,
    trackTrustSignalViewed: () => {
      trackEvent('page_viewed', {
        trustSignalsVariant: variant,
        trustSignalsLayout: VARIANTS[variant].layout,
      });
    },
  };
}

// ==================== COMBINED LANDING PAGE TEST ====================

export interface LandingPageTestConfig {
  headline: HeadlineTestConfig;
  cta: CTATestConfig;
  trustSignals: TrustSignalsTestConfig;
  isLoading: boolean;
  trackLandingPageViewed: () => void;
  trackCTAClick: (destination: string) => void;
}

/**
 * Combined hook for all landing page A/B tests
 * Use this to run multiple experiments simultaneously
 */
export function useLandingPageTests(): LandingPageTestConfig {
  const headline = useHeadlineTest();
  const cta = useCTATest();
  const trustSignals = useTrustSignalsTest();

  const isLoading = headline.isLoading || cta.isLoading || trustSignals.isLoading;

  const trackLandingPageViewed = () => {
    headline.trackHeadlineViewed();
    trustSignals.trackTrustSignalViewed();
  };

  const trackCTAClick = (destination: string) => {
    cta.trackCTAClick(destination);
  };

  return {
    headline,
    cta,
    trustSignals,
    isLoading,
    trackLandingPageViewed,
    trackCTAClick,
  };
}
