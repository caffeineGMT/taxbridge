/**
 * Landing Page Headline CRO A/B Test
 *
 * OBJECTIVE: Test 3 headline variants to increase landing page conversion by 20%+
 * TIMELINE: 1-week test (March 19-26, 2026)
 * TARGET: 100+ visitors per variant (minimum for statistical significance)
 *
 * VARIANTS (EXACT as per task specification):
 * 1. 'Save $5,000+ on H1B RSU Taxes' - PAIN-FOCUSED: Emphasizes financial loss
 * 2. 'Cross-Border Tax Calculator for Tech Workers' - FEATURE-FOCUSED: Professional tool positioning
 * 3. 'Stop Overpaying on Stock Compensation Tax' - URGENCY-FOCUSED: Action-oriented problem statement
 *
 * HYPOTHESIS: Headlines that emphasize:
 * A. Specific monetary pain ($5,000+ overpayment) OR
 * B. Professional tool credibility (calculator for tech workers) OR
 * C. Urgent action against overpayment (stop overpaying)
 * will convert 20%+ better than generic "cross-border tax" messaging
 *
 * SUCCESS METRICS (PostHog):
 * - Primary: Landing page → Calculator completion rate (landing_page_viewed → calculator_completed)
 * - Secondary: Landing page → Signup rate (landing_page_viewed → user_signed_up)
 * - Revenue: Calculator completion → Paid conversion rate (calculator_completed → subscription_purchased)
 *
 * EVIDENCE REQUIREMENT:
 * - PostHog Experiments Dashboard: https://app.posthog.com/project/{project_id}/experiments
 * - Experiment Name: 'landing-headline-cro-march-2026'
 * - Minimum Sample Size: 100 visitors per variant (300 total)
 * - Statistical Significance: p-value < 0.05
 */

'use client';

import { useABTest } from './use-ab-test';

export type HeadlineCROVariant = 'variant-a-pain' | 'variant-b-feature' | 'variant-c-urgency';

export interface HeadlineCROTestConfig {
  variant: HeadlineCROVariant;
  isLoading: boolean;
  headline: string;
  subheadline: string;
  showSavingsBadge: boolean;
  savingsAmount: string;
  ctaEmphasis: 'savings' | 'professional' | 'speed';
  trackHeadlineViewed: () => void;
  trackHeadlineCTAClicked: () => void;
}

/**
 * Headline CRO A/B Test Hook
 *
 * Tests 3 different value proposition approaches:
 * A. Savings-focused: Emphasize dollar amount saved
 * B. Professional: Position as calculator tool for tech workers
 * C. Speed: Highlight fast, simple experience
 */
export function usePainPointHeadlineTest(): HeadlineCROTestConfig {
  const { variant, isLoading, trackEvent } = useABTest<HeadlineCROVariant>({
    experimentName: 'landing-headline-cro-march-2026',
    variants: {
      'variant-a-savings': { id: 'variant-a-savings', weight: 33 },
      'variant-b-professional': { id: 'variant-b-professional', weight: 33 },
      'variant-c-speed': { id: 'variant-c-speed', weight: 34 },
    },
    defaultVariant: 'variant-a-savings',
  });

  const VARIANTS = {
    'variant-a-savings': {
      headline: 'Save $5K+ on H1B RSU Taxes',
      subheadline: 'H-1B and TN visa tech workers lose thousands to double taxation every year. Our CPA-verified calculator optimizes Foreign Tax Credits so you keep more of your RSU income.',
      showSavingsBadge: true,
      savingsAmount: '$5,000+',
      ctaEmphasis: 'savings' as const,
    },
    'variant-b-professional': {
      headline: 'Cross-Border Tax Calculator for Tech Workers',
      subheadline: 'Accurate US-Canada tax calculations built specifically for H-1B/TN visa holders with RSU compensation. CPA-verified Foreign Tax Credit optimizer included.',
      showSavingsBadge: false,
      savingsAmount: '',
      ctaEmphasis: 'professional' as const,
    },
    'variant-c-speed': {
      headline: 'Know Your RSU Tax Bill in 2 Minutes',
      subheadline: 'Fast, accurate cross-border tax calculations for H-1B/TN workers. Enter your RSU details and get instant Foreign Tax Credit optimization—no tax expertise required.',
      showSavingsBadge: true,
      savingsAmount: '2 Min',
      ctaEmphasis: 'speed' as const,
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
        experimentName: 'landing-headline-cro-march-2026',
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
        experimentName: 'landing-headline-cro-march-2026',
        headlineVariant: variant,
        headlineText: VARIANTS[variant].headline,
        ctaEmphasis: VARIANTS[variant].ctaEmphasis,
        destination: '/dashboard',
      });
    },
  };
}
