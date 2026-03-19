/**
 * Reddit Campaign Analytics - PostHog Integration
 * Track Reddit traffic, conversions, and ROI
 *
 * Usage:
 * - Called automatically on page load if utm_source=reddit
 * - Tracks full funnel: landing → calculator → signup → payment
 * - 30-day attribution window
 */

import posthog from 'posthog-js';
import { extractUTMParams } from '@/lib/utm-generator';

export interface RedditAttribution {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term?: string; // Subreddit name
  utm_content?: string; // Content type (comment, post, case-study)
  landing_url: string;
  timestamp: string;
}

export interface RedditConversionEvent {
  event_name: 'reddit_landing' | 'calculator_completed' | 'signup' | 'payment';
  subreddit?: string;
  content_type?: string;
  calculator_result?: any;
  revenue?: number;
}

/**
 * Initialize Reddit tracking on page load
 * Call this in app/layout.tsx or _app.tsx
 */
export function initRedditTracking(): void {
  if (typeof window === 'undefined') return;

  const url = window.location.href;
  const utmParams = extractUTMParams(url);

  // Only track if utm_source=reddit
  if (utmParams && utmParams.source === 'reddit') {
    trackRedditLanding(utmParams);
  }
}

/**
 * Track Reddit landing page visit
 */
export function trackRedditLanding(utmParams: any): void {
  if (!posthog) return;

  const attribution: RedditAttribution = {
    utm_source: utmParams.source,
    utm_medium: utmParams.medium,
    utm_campaign: utmParams.campaign,
    utm_term: utmParams.term, // Subreddit
    utm_content: utmParams.content, // Comment, post, etc.
    landing_url: window.location.href,
    timestamp: new Date().toISOString()
  };

  // Track page view event
  posthog.capture('reddit_landing', {
    ...attribution,
    page: window.location.pathname,
    referrer: document.referrer
  });

  // Set user properties for attribution (persists across session)
  posthog.people.set({
    initial_utm_source: 'reddit',
    initial_utm_medium: utmParams.medium,
    initial_utm_campaign: utmParams.campaign,
    initial_utm_term: utmParams.term, // Subreddit
    initial_utm_content: utmParams.content,
    initial_landing_url: attribution.landing_url,
    initial_landing_time: attribution.timestamp
  });

  // Store in localStorage for 30-day attribution window
  storeRedditAttribution(attribution);
}

/**
 * Track calculator completion from Reddit traffic
 */
export function trackRedditCalculatorCompletion(calculatorResult: any): void {
  const attribution = getRedditAttribution();
  if (!attribution) return;

  posthog?.capture('reddit_calculator_completed', {
    ...attribution,
    calculator_result: calculatorResult,
    time_to_completion: getTimeSinceLanding(attribution.timestamp)
  });
}

/**
 * Track signup from Reddit traffic
 */
export function trackRedditSignup(userId: string, email: string): void {
  const attribution = getRedditAttribution();
  if (!attribution) return;

  posthog?.capture('reddit_signup', {
    ...attribution,
    user_id: userId,
    email,
    time_to_signup: getTimeSinceLanding(attribution.timestamp)
  });

  // Update user properties
  posthog?.people.set({
    reddit_converted: true,
    reddit_subreddit: attribution.utm_term,
    reddit_content_type: attribution.utm_content
  });
}

/**
 * Track payment from Reddit traffic
 */
export function trackRedditPayment(amount: number, plan: string): void {
  const attribution = getRedditAttribution();
  if (!attribution) return;

  posthog?.capture('reddit_payment', {
    ...attribution,
    revenue: amount,
    plan,
    time_to_payment: getTimeSinceLanding(attribution.timestamp)
  });

  // Update user properties
  posthog?.people.set({
    reddit_revenue: amount,
    reddit_paid: true,
    reddit_plan: plan
  });
}

/**
 * Store Reddit attribution in localStorage (30-day window)
 */
function storeRedditAttribution(attribution: RedditAttribution): void {
  try {
    localStorage.setItem('reddit_attribution', JSON.stringify(attribution));
  } catch (e) {
    console.warn('Failed to store Reddit attribution:', e);
  }
}

/**
 * Retrieve Reddit attribution from localStorage
 */
function getRedditAttribution(): RedditAttribution | null {
  try {
    const stored = localStorage.getItem('reddit_attribution');
    if (!stored) return null;

    const attribution = JSON.parse(stored) as RedditAttribution;

    // Check if attribution is within 30-day window
    const landingTime = new Date(attribution.timestamp);
    const now = new Date();
    const daysSinceLanding = (now.getTime() - landingTime.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLanding > 30) {
      // Attribution expired
      localStorage.removeItem('reddit_attribution');
      return null;
    }

    return attribution;
  } catch (e) {
    console.warn('Failed to retrieve Reddit attribution:', e);
    return null;
  }
}

/**
 * Get time elapsed since landing (in minutes)
 */
function getTimeSinceLanding(landingTime: string): number {
  const landing = new Date(landingTime);
  const now = new Date();
  return Math.round((now.getTime() - landing.getTime()) / (1000 * 60));
}

/**
 * Clear Reddit attribution (for testing)
 */
export function clearRedditAttribution(): void {
  localStorage.removeItem('reddit_attribution');
}

/**
 * Get Reddit campaign analytics summary
 * Use this to display ROI in admin dashboard
 */
export async function getRedditCampaignMetrics(
  startDate: string,
  endDate: string
): Promise<{
  landings: number;
  calculatorCompletions: number;
  signups: number;
  payments: number;
  revenue: number;
  bySubreddit: Record<string, {
    landings: number;
    conversions: number;
    revenue: number;
  }>;
}> {
  // This would query PostHog API in production
  // For now, return structure

  return {
    landings: 0,
    calculatorCompletions: 0,
    signups: 0,
    payments: 0,
    revenue: 0,
    bySubreddit: {}
  };
}

/**
 * PostHog Funnel Query for Reddit Campaign
 * Run this in PostHog Insights to analyze conversion funnel
 */
export const REDDIT_FUNNEL_QUERY = `
  Funnel:
  1. reddit_landing (filter: utm_source = reddit)
  2. reddit_calculator_completed
  3. reddit_signup
  4. reddit_payment

  Group by: utm_term (subreddit)
  Time window: 30 days
  Conversion window: 30 days

  Breakdown:
  - r/personalfinance
  - r/h1b
  - r/cscareerquestions
  - r/tax
  - r/ImmigrationCanada

  Metrics:
  - Landing → Calculator completion rate
  - Calculator → Signup rate
  - Signup → Payment rate
  - Overall conversion rate
  - Average revenue per landing
`;

/**
 * PostHog Retention Query for Reddit Traffic
 */
export const REDDIT_RETENTION_QUERY = `
  Retention:
  - Initial event: reddit_landing
  - Return event: any_event
  - Period: Daily
  - Duration: 30 days

  Cohort:
  - Group by: utm_term (subreddit)
  - Date range: Last 90 days

  Metrics:
  - Day 1 retention
  - Day 7 retention
  - Day 30 retention
  - Best performing subreddit
`;
