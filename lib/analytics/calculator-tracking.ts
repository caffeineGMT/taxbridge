/**
 * Enhanced Conversion Tracking for Calculator Page
 *
 * Tracks detailed user behavior to identify drop-off points:
 * - Form field interactions
 * - Time spent on calculator
 * - Incomplete submissions
 * - Drop-off reasons
 */

'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics/posthog';

export class CalculatorTracker {
  private startTime: number;
  private fieldInteractions: Record<string, number> = {};
  private calculatorId: string;

  constructor(calculatorId: string) {
    this.calculatorId = calculatorId;
    this.startTime = Date.now();

    // Track calculator view
    trackEvent('calculator_page_viewed', {
      calculatorId,
      timestamp: new Date().toISOString(),
    });
  }

  trackFieldInteraction(fieldName: string) {
    this.fieldInteractions[fieldName] = (this.fieldInteractions[fieldName] || 0) + 1;

    trackEvent('page_viewed', {
      event: 'calculator_field_interaction',
      field: fieldName,
      interactions: this.fieldInteractions[fieldName],
      calculatorId: this.calculatorId,
    });
  }

  trackCalculationComplete(results: any) {
    const timeSpent = Date.now() - this.startTime;

    trackEvent('roi_calculation_viewed', {
      calculatorId: this.calculatorId,
      timeSpent,
      results,
      funnelStep: 'Calculator Completed',
      funnelStepNumber: 1,
    });
  }

  trackDropOff(reason: string) {
    const timeSpent = Date.now() - this.startTime;

    trackEvent('calculator_dropoff', {
      calculatorId: this.calculatorId,
      reason,
      timeSpent,
      fieldInteractions: this.fieldInteractions,
      funnelStep: 'Calculator',
      dropOff: true,
    });
  }

  trackCTAClick(ctaType: string) {
    const timeSpent = Date.now() - this.startTime;

    trackEvent('signup_button_clicked', {
      calculatorId: this.calculatorId,
      ctaType,
      timeSpent,
      funnelStep: 'Calculator CTA Click',
      funnelStepNumber: 2,
    });
  }
}

/**
 * Hook to track calculator conversion funnel
 */
export function useCalculatorTracking(calculatorId: string) {
  const trackerRef = useRef<CalculatorTracker | null>(null);

  useEffect(() => {
    trackerRef.current = new CalculatorTracker(calculatorId);

    // Track drop-off on unmount if no calculation performed
    return () => {
      // This is handled in the component itself
    };
  }, [calculatorId]);

  return trackerRef.current;
}
