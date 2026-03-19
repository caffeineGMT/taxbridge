/**
 * Referral Click Tracker Component
 * Client-side component that tracks referral link clicks
 * Automatically detects ?ref= parameter and tracks the click
 */

'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { saveUserReferralCodeToStorage } from '@/lib/stripe/referral-tracking';
import { logger } from '@/lib/logger';

export function ReferralClickTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const referralCode = searchParams.get('ref');

    if (!referralCode) {
      return;
    }

    // Save to localStorage for checkout
    saveUserReferralCodeToStorage(referralCode);

    // Track the click
    trackClick(referralCode);
  }, [searchParams]);

  const trackClick = async (referralCode: string) => {
    try {
      // Get URL params for UTM tracking
      const searchParams = new URLSearchParams(window.location.search);
      const utm_source = searchParams.get('utm_source') || undefined;
      const utm_medium = searchParams.get('utm_medium') || undefined;
      const utm_campaign = searchParams.get('utm_campaign') || undefined;
      const landing_page = window.location.pathname;

      const response = await fetch('/api/referrals/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralCode,
          utm_source,
          utm_medium,
          utm_campaign,
          landing_page,
        }),
      });

      if (!response.ok) {
        logger.warn('Failed to track referral click', {
          status: response.status,
          referralCode,
        });
      } else {
        logger.info('Referral click tracked', { referralCode });

        // Track in PostHog
        if (typeof window !== 'undefined' && (window as any).posthog) {
          (window as any).posthog.capture('referral_click', {
            referral_code: referralCode,
            utm_source,
            utm_medium,
            utm_campaign,
            landing_page,
          });
        }
      }
    } catch (error) {
      logger.warn('Failed to track referral click', { error });
    }
  };

  return null; // This component renders nothing
}
