/**
 * A/B Test #2: Signup Flow Simplification
 *
 * PROBLEM: 27% drop-off from Calculator Completed → Signup Started
 * HYPOTHESIS: Users hesitate to sign up because they're unsure of the value or friction is too high
 *
 * Variants:
 * - Control: Standard Clerk signup modal
 * - Inline: Embed signup directly on results page with social proof
 * - Lite: Email-only signup (passwordless magic link)
 */

'use client';

import { useABTest } from './use-ab-test';

export type SignupVariant = 'control' | 'inline' | 'lite';

export interface SignupTestConfig {
  variant: SignupVariant;
  isLoading: boolean;
  trackSignupButtonClicked: (location: string) => void;
  trackSignupStarted: () => void;
  trackSignupCompleted: () => void;
  trackSignupAbandoned: (reason?: string) => void;
}

/**
 * Hook for signup flow A/B test
 */
export function useSignupFlowTest(): SignupTestConfig {
  const { variant, isLoading, trackConversion, trackEvent } = useABTest<SignupVariant>({
    experimentName: 'signup-flow-test',
    variants: {
      control: { id: 'control', weight: 33 },
      inline: { id: 'inline', weight: 33 },
      lite: { id: 'lite', weight: 34 },
    },
    defaultVariant: 'control',
  });

  return {
    variant,
    isLoading,
    trackSignupButtonClicked: (location: string) => {
      trackEvent('signup_button_clicked', {
        funnelStep: 'Signup Button Clicked',
        funnelStepNumber: 2,
        location,
      });
    },
    trackSignupStarted: () => {
      trackEvent('signup_started', {
        funnelStep: 'Signup Started',
        funnelStepNumber: 3,
      });
    },
    trackSignupCompleted: () => {
      trackConversion({
        funnelStep: 'Signup Completed',
        funnelStepNumber: 4,
        conversionEvent: 'signup_completed',
      });
    },
    trackSignupAbandoned: (reason?: string) => {
      trackEvent('page_viewed', {
        funnelStep: 'Signup Abandoned',
        dropOff: true,
        dropOffReason: reason,
      });
    },
  };
}

/**
 * Configuration for each variant
 */
export const SIGNUP_VARIANTS = {
  control: {
    type: 'modal',
    heading: 'Create your account',
    subheading: 'Start your 14-day free trial',
    showSocialProof: false,
    showBenefits: false,
    provider: 'clerk-standard',
  },
  inline: {
    type: 'inline',
    heading: 'Save your calculation',
    subheading: 'Join 1,247 H-1B workers optimizing their tax savings',
    showSocialProof: true,
    showBenefits: true,
    provider: 'clerk-standard',
    benefits: [
      '✓ Save and track multiple RSU calculations',
      '✓ Multi-year tax planning dashboard',
      '✓ PDF export for tax filing',
      '✓ Email reminders for tax deadlines',
    ],
    socialProof: {
      avatars: ['user1', 'user2', 'user3'],
      text: '1,247 H-1B workers trust TaxBridge',
      rating: '4.8/5.0 from 126 reviews',
    },
  },
  lite: {
    type: 'inline',
    heading: 'Get instant access',
    subheading: 'No password needed • Just your email',
    showSocialProof: true,
    showBenefits: false,
    provider: 'magic-link',
    benefits: [],
    socialProof: {
      text: 'We\'ll email you a secure login link',
    },
  },
} as const;
