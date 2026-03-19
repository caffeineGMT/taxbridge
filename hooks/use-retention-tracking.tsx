/**
 * useRetentionTracking Hook
 * React hook for automatic retention and feature tracking
 */

import { useEffect, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  TRACKABLE_FEATURES,
  type TrackableFeature,
} from '@/lib/analytics/retention-tracking';

interface UseRetentionTrackingOptions {
  /**
   * Automatically track page view on mount
   */
  trackPageView?: boolean;

  /**
   * Feature name to automatically track on mount
   */
  feature?: TrackableFeature;

  /**
   * Track time spent on page (sends on unmount)
   */
  trackTimeSpent?: boolean;
}

/**
 * Hook for tracking user retention and feature usage
 *
 * @example
 * // Basic usage - track page view
 * useRetentionTracking({ trackPageView: true });
 *
 * @example
 * // Track feature usage
 * const { trackFeature } = useRetentionTracking();
 * trackFeature('tax_calculator');
 *
 * @example
 * // Track time spent on calculator
 * useRetentionTracking({
 *   feature: 'tax_calculator',
 *   trackTimeSpent: true
 * });
 */
export function useRetentionTracking(options: UseRetentionTrackingOptions = {}) {
  const { user } = useUser();
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedRef = useRef<boolean>(false);

  const userId = user?.publicMetadata?.databaseId as number | undefined;

  /**
   * Track activity (login, page view, etc.)
   */
  const trackActivity = useCallback(
    async (activityType: string, metadata?: Record<string, any>) => {
      if (!userId) return;

      try {
        await fetch('/api/analytics/retention/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            activityType,
            metadata,
          }),
        });
      } catch (error) {
        console.error('[Retention] Failed to track activity:', error);
      }
    },
    [userId]
  );

  /**
   * Track feature usage
   */
  const trackFeature = useCallback(
    async (feature: TrackableFeature, timeSeconds: number = 0) => {
      if (!userId) return;

      try {
        await fetch('/api/analytics/retention/feature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            feature,
            timeSeconds,
          }),
        });
      } catch (error) {
        console.error('[Retention] Failed to track feature:', error);
      }
    },
    [userId]
  );

  /**
   * Track calculator usage with time
   */
  const trackCalculator = useCallback(
    async (calculationType: 'basic' | 'ftc' | 'multi_year', timeSeconds: number = 0) => {
      if (!userId) return;

      try {
        await fetch('/api/analytics/retention/calculator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            calculationType,
            timeSeconds,
          }),
        });
      } catch (error) {
        console.error('[Retention] Failed to track calculator:', error);
      }
    },
    [userId]
  );

  // Auto-track page view on mount
  useEffect(() => {
    if (options.trackPageView && userId && !hasTrackedRef.current) {
      trackActivity('page_view', {
        page: window.location.pathname,
        referrer: document.referrer,
      });
      hasTrackedRef.current = true;
    }
  }, [options.trackPageView, userId, trackActivity]);

  // Auto-track feature on mount
  useEffect(() => {
    if (options.feature && userId && !hasTrackedRef.current) {
      trackFeature(options.feature);
      hasTrackedRef.current = true;
    }
  }, [options.feature, userId, trackFeature]);

  // Track time spent on unmount
  useEffect(() => {
    if (!options.trackTimeSpent || !options.feature || !userId) return;

    return () => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 0) {
        trackFeature(options.feature!, timeSpent);
      }
    };
  }, [options.trackTimeSpent, options.feature, userId, trackFeature]);

  return {
    trackActivity,
    trackFeature,
    trackCalculator,
    FEATURES: TRACKABLE_FEATURES,
  };
}

/**
 * Higher-order component to automatically track retention
 *
 * @example
 * export default withRetentionTracking(MyComponent, {
 *   feature: 'tax_calculator',
 *   trackTimeSpent: true
 * });
 */
export function withRetentionTracking<P extends object>(
  Component: React.ComponentType<P>,
  options: UseRetentionTrackingOptions = {}
) {
  return function WrappedComponent(props: P) {
    useRetentionTracking(options);
    return <Component {...props} />;
  };
}
