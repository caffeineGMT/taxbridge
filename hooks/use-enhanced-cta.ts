/**
 * Enhanced CTA Variants for Conversion Optimization
 *
 * High-converting call-to-action variants tested against control.
 * Based on conversion optimization best practices:
 * - Urgency
 * - Social proof
 * - Value proposition
 * - Risk reversal
 */

'use client';

import { useState, useEffect } from 'react';
import posthog from 'posthog-js';
import { trackEvent } from '@/lib/analytics/posthog';

export interface EnhancedCTAVariant {
  id: string;
  variant: 'control' | 'urgency' | 'value' | 'social' | 'risk-reversal' | 'fomo';
  text: string;
  subtext?: string;
  badge?: string;
  buttonColor?: 'emerald' | 'amber' | 'red' | 'blue';
  icon?: string;
}

/**
 * CTA Variants for A/B Testing
 */
export const ENHANCED_CTA_VARIANTS: EnhancedCTAVariant[] = [
  // Control
  {
    id: 'control',
    variant: 'control',
    text: 'Start 14-Day Free Trial',
    subtext: 'No credit card required',
    buttonColor: 'emerald',
  },

  // Urgency-focused
  {
    id: 'urgency-1',
    variant: 'urgency',
    text: 'Claim 50% Off (Expires Soon)',
    subtext: 'Limited time: $99 → $49/year',
    badge: '⏰ 48 HOURS LEFT',
    buttonColor: 'red',
  },

  // Value-focused
  {
    id: 'value-1',
    variant: 'value',
    text: 'Save $2,500+ on Taxes →',
    subtext: 'Invest $49, save 51x more',
    badge: '💰 AVG. SAVINGS',
    buttonColor: 'emerald',
  },

  // Social proof
  {
    id: 'social-1',
    variant: 'social',
    text: 'Join 1,247 H-1B Workers',
    subtext: '4.8/5 stars • Trusted by Google, Meta engineers',
    buttonColor: 'blue',
  },

  // Risk reversal
  {
    id: 'risk-reversal-1',
    variant: 'risk-reversal',
    text: 'Try Free for 30 Days',
    subtext: 'Full refund if not satisfied. No questions asked.',
    badge: '✓ 30-DAY GUARANTEE',
    buttonColor: 'emerald',
  },

  // FOMO (Fear of Missing Out)
  {
    id: 'fomo-1',
    variant: 'fomo',
    text: 'Only 3 Spots Left at This Price',
    subtext: 'Price increases March 31',
    badge: '🔥 ALMOST SOLD OUT',
    buttonColor: 'amber',
  },

  // Benefit-focused
  {
    id: 'benefit-1',
    variant: 'value',
    text: 'Unlock Unlimited RSU Tracking',
    subtext: 'Plus FTC optimizer, PDF reports, priority support',
    buttonColor: 'emerald',
  },

  // Objection handler
  {
    id: 'objection-1',
    variant: 'risk-reversal',
    text: 'Start Free, Upgrade Later',
    subtext: 'Cancel anytime. No credit card needed.',
    buttonColor: 'emerald',
  },

  // Direct ROI
  {
    id: 'roi-1',
    variant: 'value',
    text: '$49 → $2,543 Saved (Avg)',
    subtext: '51.9x return on investment',
    badge: '💵 PROVEN ROI',
    buttonColor: 'emerald',
  },

  // Peer comparison
  {
    id: 'peer-1',
    variant: 'social',
    text: 'Used by 89% of Our Users',
    subtext: 'Pro plan most popular among engineers',
    badge: '⭐ RECOMMENDED',
    buttonColor: 'blue',
  },
];

/**
 * Hook to get CTA variant for A/B testing
 */
export function useEnhancedCTA(): EnhancedCTAVariant {
  const [variant, setVariant] = useState<EnhancedCTAVariant>(ENHANCED_CTA_VARIANTS[0]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (posthog.__loaded) {
      // Get feature flag for CTA variant
      const flagValue = posthog.getFeatureFlag('enhanced-cta-test');

      // Map feature flag to variant
      let selectedVariant = ENHANCED_CTA_VARIANTS[0]; // default to control

      const variantMap: Record<string, number> = {
        'control': 0,
        'urgency-1': 1,
        'value-1': 2,
        'social-1': 3,
        'risk-reversal-1': 4,
        'fomo-1': 5,
        'benefit-1': 6,
        'objection-1': 7,
        'roi-1': 8,
        'peer-1': 9,
      };

      if (flagValue && typeof flagValue === 'string' && variantMap[flagValue] !== undefined) {
        selectedVariant = ENHANCED_CTA_VARIANTS[variantMap[flagValue]];
      }

      setVariant(selectedVariant);

      // Track variant exposure
      trackEvent('page_viewed', {
        experiment: 'enhanced-cta-test',
        variant: selectedVariant.variant,
        ctaId: selectedVariant.id,
        ctaText: selectedVariant.text,
      });
    } else {
      // Fallback: Random A/B test
      const randomIndex = Math.floor(Math.random() * 3); // Test top 3 variants
      setVariant(ENHANCED_CTA_VARIANTS[randomIndex]);
    }
  }, []);

  return variant;
}

/**
 * Track CTA click
 */
export function trackEnhancedCTAClick(variant: EnhancedCTAVariant, plan: string) {
  trackEvent('pricing_tier_selected', {
    plan,
    experiment: 'enhanced-cta-test',
    variant: variant.variant,
    ctaId: variant.id,
    ctaText: variant.text,
    funnelStep: 'CTA Click',
    funnelStepNumber: 4,
  });
}

/**
 * Get button color class
 */
export function getButtonColorClass(color: EnhancedCTAVariant['buttonColor']): string {
  const colorMap = {
    emerald: 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800',
    amber: 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800',
    red: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
    blue: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
  };

  return colorMap[color || 'emerald'];
}
