'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { trackEvent, type PostHogEvent } from '@/lib/analytics/posthog';

/**
 * Hook to track PostHog events with automatic user context
 */
export function usePostHogEvent(
  eventName: PostHogEvent,
  properties?: Record<string, any>,
  dependencies: any[] = []
) {
  const { user } = useUser();

  useEffect(() => {
    const rawTier = user?.publicMetadata?.subscriptionTier as string;
    const userTier: 'free' | 'pro' | 'enterprise' =
      rawTier === 'pro' || rawTier === 'enterprise' ? rawTier : 'free';

    const rawStatus = user?.publicMetadata?.subscriptionStatus as string;
    const subscriptionStatus: 'none' | 'trialing' | 'active' | 'past_due' | 'cancelled' =
      rawStatus === 'trialing' || rawStatus === 'active' || rawStatus === 'past_due' || rawStatus === 'cancelled'
        ? rawStatus
        : 'none';

    trackEvent(eventName, {
      ...properties,
      userId: user?.id,
      userTier,
      subscriptionStatus,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

/**
 * Hook to track page views (use in page components)
 */
export function usePageView(pageName: string, properties?: Record<string, any>) {
  const { user } = useUser();

  useEffect(() => {
    const rawTier = user?.publicMetadata?.subscriptionTier as string;
    const userTier: 'free' | 'pro' | 'enterprise' =
      rawTier === 'pro' || rawTier === 'enterprise' ? rawTier : 'free';

    trackEvent('page_viewed', {
      page: pageName,
      ...properties,
      userId: user?.id,
      userTier,
    });
  }, [pageName, user, properties]);
}
