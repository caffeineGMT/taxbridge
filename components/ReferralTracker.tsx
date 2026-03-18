/**
 * Referral Tracker Component
 * Captures referral codes from URL and stores them in localStorage
 */

'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      try {
        localStorage.setItem('referral_code', ref);
        console.log('[Referral] Captured referral code:', ref);
      } catch (error) {
        console.warn('[Referral] Failed to save referral code:', error);
      }
    }
  }, [searchParams]);

  return null; // This component doesn't render anything
}
