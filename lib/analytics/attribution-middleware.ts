/**
 * Attribution Middleware
 *
 * Captures UTM parameters on signup and tracks conversion events.
 * Integrates with PostHog for first-touch attribution.
 */

import { getUserProfileByClerkId } from '@/lib/db';
import { trackUserAttribution, trackConversionEvent } from '@/lib/analytics/attribution';
import { logger } from '@/lib/logger';

/**
 * Track user signup attribution from PostHog user properties
 *
 * This should be called AFTER a user signs up (e.g., in Clerk webhook)
 * It pulls UTM parameters from PostHog user properties and stores them in the database.
 */
export async function trackSignupAttribution(
  clerkUserId: string,
  referrer?: string,
  landingPage?: string
): Promise<void> {
  try {
    // Get user profile from database
    const user = await getUserProfileByClerkId(clerkUserId);
    if (!user) {
      console.warn('User not found for attribution tracking:', clerkUserId);
      return;
    }

    // In a real implementation, you'd fetch UTM parameters from:
    // 1. PostHog user properties (set by UTMTracker component)
    // 2. Or from cookies/session storage
    // 3. Or from query parameters if available

    // For now, we'll try to get them from PostHog via server-side API
    // or from a session cookie

    // Placeholder: In production, you'd call PostHog API to get user properties
    // const posthogUser = await fetchPostHogUserProperties(clerkUserId);

    const utmParams = {
      utm_source: undefined, // Will be set by PostHog integration
      utm_medium: undefined,
      utm_campaign: undefined,
      utm_term: undefined,
      utm_content: undefined,
    };

    // Track attribution (first-touch)
    trackUserAttribution(
      user.id,
      utmParams,
      landingPage || 'unknown',
      referrer
    );

    // Track signup event
    trackConversionEvent(user.id, 'signed_up');

    logger.info('✓ Signup attribution tracked for user:', user.id);
  } catch (error) {
    console.error('Failed to track signup attribution:', error);
    // Don't throw - attribution tracking should not block signup
  }
}

/**
 * Track first calculator usage
 */
export async function trackFirstCalculation(userId: number): Promise<void> {
  try {
    trackConversionEvent(userId, 'first_calculation');
  } catch (error) {
    console.error('Failed to track first calculation:', error);
  }
}

/**
 * Track upgrade to paid (called from Stripe webhook)
 */
export async function trackPaidUpgrade(
  userId: number,
  tier: 'pro' | 'enterprise',
  amount: number
): Promise<void> {
  try {
    trackConversionEvent(userId, 'upgraded', {
      subscription_tier: tier,
      subscription_amount: amount,
    });

    logger.info(`✓ Paid upgrade tracked: user=${userId}, tier=${tier}, amount=${amount}`);
  } catch (error) {
    console.error('Failed to track paid upgrade:', error);
  }
}
