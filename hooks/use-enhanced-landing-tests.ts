/**
 * Enhanced Landing Page A/B Testing Suite - 3 New Priority Tests
 *
 * NEW TESTS (March 2026):
 * 1. Headline ROI emphasis - Test $ saved messaging strength
 * 2. Video demo vs static hero - Test video engagement vs static
 * 3. Pricing visibility - Test upfront pricing vs hidden pricing
 *
 * GOAL: Increase conversion rate by 15%+ within 1 week
 * TRAFFIC: 1000+ visitors per variant minimum
 */

'use client';

import { useABTest } from './use-ab-test';

// ==================== TEST 1: HEADLINE ROI EMPHASIS ====================

export type HeadlineROIVariant = 'control' | 'moderate-savings' | 'aggressive-savings' | 'urgency-savings';

export interface HeadlineROITestConfig {
  variant: HeadlineROIVariant;
  isLoading: boolean;
  headline: string;
  subheadline: string;
  showSavingsAmount: boolean;
  savingsAmount: string;
  trackHeadlineViewed: () => void;
}

/**
 * A/B Test #1: Headline emphasizing $ saved
 *
 * HYPOTHESIS: Specific dollar amounts create stronger conversion intent
 * than generic "save money" messaging
 */
export function useHeadlineROITest(): HeadlineROITestConfig {
  const { variant, isLoading, trackEvent } = useABTest<HeadlineROIVariant>({
    experimentName: 'landing-headline-roi-test',
    variants: {
      control: { id: 'control', weight: 25 },
      'moderate-savings': { id: 'moderate-savings', weight: 25 },
      'aggressive-savings': { id: 'aggressive-savings', weight: 25 },
      'urgency-savings': { id: 'urgency-savings', weight: 25 },
    },
    defaultVariant: 'control',
  });

  const VARIANTS = {
    control: {
      headline: 'Simplify Your Cross-Border Tax Filing',
      subheadline: 'Built for H-1B and TN visa tech workers with US RSUs now living in Canada.',
      showSavingsAmount: false,
      savingsAmount: '',
    },
    'moderate-savings': {
      headline: 'Save $2,500+ on Your Cross-Border Taxes',
      subheadline: 'H-1B/TN workers lose thousands to incorrect Foreign Tax Credits. Free calculator built by CPAs eliminates double taxation.',
      showSavingsAmount: true,
      savingsAmount: '$2,500',
    },
    'aggressive-savings': {
      headline: 'Tech Workers Save $5,000-$15,000 Annually',
      subheadline: 'Stop overpaying on cross-border taxes. Our CPA-verified calculator optimizes Foreign Tax Credits for H-1B/TN visa holders with RSUs.',
      showSavingsAmount: true,
      savingsAmount: '$5,000-$15,000',
    },
    'urgency-savings': {
      headline: 'Your RSUs Cost You $8,000 Last Year',
      subheadline: 'Most H-1B/TN workers overpay on taxes. Calculate your exact savings in 5 minutes with our free CPA-verified tool.',
      showSavingsAmount: true,
      savingsAmount: '$8,000',
    },
  };

  return {
    variant,
    isLoading,
    headline: VARIANTS[variant].headline,
    subheadline: VARIANTS[variant].subheadline,
    showSavingsAmount: VARIANTS[variant].showSavingsAmount,
    savingsAmount: VARIANTS[variant].savingsAmount,
    trackHeadlineViewed: () => {
      trackEvent('landing_page_viewed', {
        funnelStep: 'Landing',
        funnelStepNumber: 1,
        headlineROIVariant: variant,
        showsSavingsAmount: VARIANTS[variant].showSavingsAmount,
        savingsAmount: VARIANTS[variant].savingsAmount,
      });
    },
  };
}

// ==================== TEST 2: VIDEO DEMO VS STATIC HERO ====================

export type HeroMediaVariant = 'static' | 'video-autoplay' | 'video-click' | 'animated-stats';

export interface HeroMediaTestConfig {
  variant: HeroMediaVariant;
  isLoading: boolean;
  mediaType: 'static' | 'video' | 'animated';
  videoAutoplay: boolean;
  videoClickToPlay: boolean;
  showAnimatedStats: boolean;
  trackMediaViewed: () => void;
  trackVideoPlayed: () => void;
  trackVideoCompleted: () => void;
}

/**
 * A/B Test #2: Video demo vs static hero
 *
 * HYPOTHESIS: Video demonstration increases engagement and trust,
 * leading to higher conversion rates despite potential loading impact
 */
export function useHeroMediaTest(): HeroMediaTestConfig {
  const { variant, isLoading, trackEvent } = useABTest<HeroMediaVariant>({
    experimentName: 'landing-hero-media-test',
    variants: {
      static: { id: 'static', weight: 25 },
      'video-autoplay': { id: 'video-autoplay', weight: 25 },
      'video-click': { id: 'video-click', weight: 25 },
      'animated-stats': { id: 'animated-stats', weight: 25 },
    },
    defaultVariant: 'static',
  });

  const VARIANTS = {
    static: {
      mediaType: 'static' as const,
      videoAutoplay: false,
      videoClickToPlay: false,
      showAnimatedStats: false,
    },
    'video-autoplay': {
      mediaType: 'video' as const,
      videoAutoplay: true,
      videoClickToPlay: false,
      showAnimatedStats: false,
    },
    'video-click': {
      mediaType: 'video' as const,
      videoAutoplay: false,
      videoClickToPlay: true,
      showAnimatedStats: false,
    },
    'animated-stats': {
      mediaType: 'animated' as const,
      videoAutoplay: false,
      videoClickToPlay: false,
      showAnimatedStats: true,
    },
  };

  return {
    variant,
    isLoading,
    mediaType: VARIANTS[variant].mediaType,
    videoAutoplay: VARIANTS[variant].videoAutoplay,
    videoClickToPlay: VARIANTS[variant].videoClickToPlay,
    showAnimatedStats: VARIANTS[variant].showAnimatedStats,
    trackMediaViewed: () => {
      trackEvent('landing_page_viewed', {
        heroMediaVariant: variant,
        mediaType: VARIANTS[variant].mediaType,
      });
    },
    trackVideoPlayed: () => {
      trackEvent('page_viewed', {
        heroMediaVariant: variant,
        mediaType: 'video',
        videoAction: 'played',
      });
    },
    trackVideoCompleted: () => {
      trackEvent('page_viewed', {
        heroMediaVariant: variant,
        mediaType: 'video',
        videoAction: 'completed',
        videoEngagement: 'high',
      });
    },
  };
}

// ==================== TEST 3: PRICING VISIBILITY ====================

export type PricingVisibilityVariant = 'hidden' | 'price-only' | 'full-pricing' | 'value-comparison';

export interface PricingVisibilityTestConfig {
  variant: PricingVisibilityVariant;
  isLoading: boolean;
  showPricing: boolean;
  pricingDisplay: 'none' | 'price-only' | 'full-card' | 'value-prop';
  pricingPlacement: 'none' | 'hero-below' | 'before-features' | 'after-testimonials';
  trackPricingViewed: () => void;
  trackPricingClicked: () => void;
}

/**
 * A/B Test #3: Pricing displayed upfront vs hidden
 *
 * HYPOTHESIS: Upfront pricing reduces friction and pre-qualifies users,
 * leading to higher quality conversions even if volume is lower
 */
export function usePricingVisibilityTest(): PricingVisibilityTestConfig {
  const { variant, isLoading, trackEvent } = useABTest<PricingVisibilityVariant>({
    experimentName: 'landing-pricing-visibility-test',
    variants: {
      hidden: { id: 'hidden', weight: 25 },
      'price-only': { id: 'price-only', weight: 25 },
      'full-pricing': { id: 'full-pricing', weight: 25 },
      'value-comparison': { id: 'value-comparison', weight: 25 },
    },
    defaultVariant: 'hidden',
  });

  const VARIANTS = {
    hidden: {
      showPricing: false,
      pricingDisplay: 'none' as const,
      pricingPlacement: 'none' as const,
    },
    'price-only': {
      showPricing: true,
      pricingDisplay: 'price-only' as const,
      pricingPlacement: 'hero-below' as const,
    },
    'full-pricing': {
      showPricing: true,
      pricingDisplay: 'full-card' as const,
      pricingPlacement: 'before-features' as const,
    },
    'value-comparison': {
      showPricing: true,
      pricingDisplay: 'value-prop' as const,
      pricingPlacement: 'after-testimonials' as const,
    },
  };

  return {
    variant,
    isLoading,
    showPricing: VARIANTS[variant].showPricing,
    pricingDisplay: VARIANTS[variant].pricingDisplay,
    pricingPlacement: VARIANTS[variant].pricingPlacement,
    trackPricingViewed: () => {
      trackEvent('pricing_page_viewed', {
        pricingVisibilityVariant: variant,
        pricingDisplay: VARIANTS[variant].pricingDisplay,
        pricingPlacement: VARIANTS[variant].pricingPlacement,
      });
    },
    trackPricingClicked: () => {
      trackEvent('upgrade_button_clicked', {
        pricingVisibilityVariant: variant,
        pricingDisplay: VARIANTS[variant].pricingDisplay,
        source: 'landing-page-inline',
      });
    },
  };
}

// ==================== COMBINED ENHANCED TESTS ====================

export interface EnhancedLandingPageTestConfig {
  headlineROI: HeadlineROITestConfig;
  heroMedia: HeroMediaTestConfig;
  pricingVisibility: PricingVisibilityTestConfig;
  isLoading: boolean;
  trackLandingPageViewed: () => void;
}

/**
 * Combined hook for all enhanced landing page A/B tests
 * Run 3 simultaneous experiments to maximize conversion learning
 */
export function useEnhancedLandingPageTests(): EnhancedLandingPageTestConfig {
  const headlineROI = useHeadlineROITest();
  const heroMedia = useHeroMediaTest();
  const pricingVisibility = usePricingVisibilityTest();

  const isLoading = headlineROI.isLoading || heroMedia.isLoading || pricingVisibility.isLoading;

  const trackLandingPageViewed = () => {
    headlineROI.trackHeadlineViewed();
    heroMedia.trackMediaViewed();
    pricingVisibility.trackPricingViewed();
  };

  return {
    headlineROI,
    heroMedia,
    pricingVisibility,
    isLoading,
    trackLandingPageViewed,
  };
}
