/**
 * A/B Test #1: Calculator Completion Optimization
 *
 * PROBLEM: 28% drop-off from Calculator View → Calculator Completed
 * HYPOTHESIS: Users are overwhelmed by too many inputs or unclear value proposition
 *
 * Variants:
 * - Control: Standard calculator form (all inputs visible)
 * - Progressive: Show inputs progressively with step indicator
 * - Simplified: Start with 3 core inputs, "Show Advanced" for rest
 */

'use client';

import { useABTest } from './use-ab-test';

export type CalculatorVariant = 'control' | 'progressive' | 'simplified';

export interface CalculatorTestConfig {
  variant: CalculatorVariant;
  isLoading: boolean;
  trackCalculatorStarted: () => void;
  trackCalculatorCompleted: () => void;
  trackInputFocused: (fieldName: string) => void;
  trackAdvancedToggled: () => void;
}

/**
 * Hook for calculator completion A/B test
 */
export function useCalculatorCompletionTest(): CalculatorTestConfig {
  const { variant, isLoading, trackConversion, trackEvent } = useABTest<CalculatorVariant>({
    experimentName: 'calculator-completion-test',
    variants: {
      control: { id: 'control', weight: 33 },
      progressive: { id: 'progressive', weight: 33 },
      simplified: { id: 'simplified', weight: 34 },
    },
    defaultVariant: 'control',
  });

  return {
    variant,
    isLoading,
    trackCalculatorStarted: () => {
      trackEvent('calculator_page_viewed', {
        funnelStep: 'Calculator Started',
        funnelStepNumber: 1,
      });
    },
    trackCalculatorCompleted: () => {
      trackConversion({
        funnelStep: 'Calculator Completed',
        funnelStepNumber: 2,
        conversionEvent: 'roi_calculation_viewed',
      });
    },
    trackInputFocused: (fieldName: string) => {
      trackEvent('page_viewed', {
        interactionType: 'input_focused',
        fieldName,
      });
    },
    trackAdvancedToggled: () => {
      trackEvent('page_viewed', {
        interactionType: 'advanced_options_toggled',
      });
    },
  };
}

/**
 * Configuration for each variant
 */
export const CALCULATOR_VARIANTS = {
  control: {
    title: 'Free Tax Savings Calculator',
    subtitle: 'See how much you could save on US-Canada cross-border taxes',
    showAllInputs: true,
    showStepIndicator: false,
    showAdvancedToggle: false,
  },
  progressive: {
    title: 'Free Tax Savings Calculator',
    subtitle: '3 simple steps to calculate your savings',
    showAllInputs: false,
    showStepIndicator: true,
    showAdvancedToggle: false,
    steps: [
      {
        title: 'Step 1: Your Income',
        fields: ['employer', 'annualSalary'],
      },
      {
        title: 'Step 2: Your RSUs',
        fields: ['rsuValue', 'vestingDate'],
      },
      {
        title: 'Step 3: Your Location',
        fields: ['canadianProvince', 'usState'],
      },
    ],
  },
  simplified: {
    title: 'Quick Tax Estimate',
    subtitle: 'Start with 3 core inputs • Full calculator available below',
    showAllInputs: false,
    showStepIndicator: false,
    showAdvancedToggle: true,
    coreFields: ['annualSalary', 'rsuValue', 'canadianProvince'],
    advancedFields: ['employer', 'vestingDate', 'usState', 'filingStatus'],
  },
} as const;
