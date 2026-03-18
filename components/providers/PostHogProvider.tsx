/**
 * PostHog Analytics Provider
 * Initializes PostHog for A/B testing and analytics tracking
 * Note: PostHog is initialized in-component for client-side only
 */

'use client';

import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // PostHog is initialized on-demand in components that use it
    // This is the simplest approach for Next.js App Router
  }, []);

  return <>{children}</>;
}
