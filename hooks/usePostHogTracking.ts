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
    trackEvent(eventName, {
      ...properties,
      userId: user?.id,
      userTier: (user?.publicMetadata?.subscriptionTier as string) || 'free',
      subscriptionStatus: (user?.publicMetadata?.subscriptionStatus as string) || 'none',
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
    trackEvent('page_viewed', {
      page: pageName,
      ...properties,
      userId: user?.id,
      userTier: (user?.publicMetadata?.subscriptionTier as string) || 'free',
    });
  }, [pageName, user, properties]);
}
