'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { initPostHog, trackPageView, identifyUser } from '@/lib/analytics/posthog';

/**
 * PostHog Provider - Initializes analytics and tracks page views
 *
 * Place in root layout to enable tracking across the app
 */
export default function PostHogProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Identify user when they sign in
  useEffect(() => {
    if (isLoaded && user) {
      identifyUser(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || undefined,
        createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
        tier: (user.publicMetadata?.subscriptionTier as string) || 'free',
      });
    }
  }, [isLoaded, user]);

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

      // Extract UTM parameters for attribution
      const source = searchParams?.get('utm_source') || undefined;
      const medium = searchParams?.get('utm_medium') || undefined;
      const campaign = searchParams?.get('utm_campaign') || undefined;
      const referrer = document.referrer || undefined;

      // Type-safe subscription tier extraction
      const rawTier = user?.publicMetadata?.subscriptionTier as string;
      const userTier: 'free' | 'pro' | 'enterprise' | undefined =
        rawTier === 'pro' || rawTier === 'enterprise' ? rawTier : 'free';

      trackPageView(pathname, {
        page: url,
        source,
        medium,
        campaign,
        referrer,
        userId: user?.id,
        userTier,
      });
    }
  }, [pathname, searchParams, user]);

  return null;
}
