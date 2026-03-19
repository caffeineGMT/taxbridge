/**
 * Referral Tracker Component
 * Captures referral codes from URL, stores them in localStorage, and tracks clicks
 */

'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { logger } from '@/lib/logger';

export default function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      try {
        // Store in both keys for compatibility
        // Backend will determine if it's affiliate or user referral
        localStorage.setItem('referral_code', ref); // For affiliate partners
        localStorage.setItem('user_referral_code', ref); // For user referrals
        logger.info('[Referral] Captured referral code:', ref);

        // Track the click
        trackReferralClick(ref);
      } catch (error) {
        console.warn('[Referral] Failed to save referral code:', error);
      }
    }
  }, [searchParams]);

  const trackReferralClick = async (referralCode: string) => {
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

      if (response.ok) {
        logger.info('[Referral] Click tracked successfully', { referralCode });

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
      } else {
        logger.warn('[Referral] Failed to track click', {
          status: response.status,
          referralCode,
        });
      }
    } catch (error) {
      logger.warn('[Referral] Failed to track click', { error });
    }
  };

  return null; // This component doesn't render anything
}
