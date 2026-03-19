/**
 * UTM Parameter Generator for Marketing Campaigns
 * Generates trackable URLs with UTM parameters for attribution tracking
 */

export interface UTMParams {
  source: string; // Traffic source (e.g., 'reddit', 'twitter', 'email')
  medium: string; // Marketing medium (e.g., 'organic', 'cpc', 'social')
  campaign: string; // Campaign name (e.g., 'reddit-growth-q1-2026')
  term?: string; // Paid search keywords (optional)
  content?: string; // A/B test variant or content identifier (optional)
}

export interface RedditUTMParams {
  subreddit: string; // e.g., 'personalfinance', 'h1b', 'ImmigrationCanada'
  postType: 'case-study' | 'comment' | 'post' | 'profile'; // Type of Reddit engagement
  variant?: string; // Optional A/B test variant (e.g., 'short-cta', 'long-form')
}

/**
 * Generate UTM parameters for Reddit campaigns
 */
export function generateRedditUTM(params: RedditUTMParams): UTMParams {
  const { subreddit, postType, variant } = params;

  return {
    source: 'reddit',
    medium: 'organic', // Organic Reddit engagement (not paid)
    campaign: 'reddit-growth-q1-2026',
    term: subreddit.toLowerCase(),
    content: variant ? `${postType}-${variant}` : postType,
  };
}

/**
 * Build full URL with UTM parameters
 */
export function buildUTMUrl(baseUrl: string, utmParams: UTMParams): string {
  const url = new URL(baseUrl);

  // Add UTM parameters to query string
  url.searchParams.set('utm_source', utmParams.source);
  url.searchParams.set('utm_medium', utmParams.medium);
  url.searchParams.set('utm_campaign', utmParams.campaign);

  if (utmParams.term) {
    url.searchParams.set('utm_term', utmParams.term);
  }

  if (utmParams.content) {
    url.searchParams.set('utm_content', utmParams.content);
  }

  return url.toString();
}

/**
 * Quick helper: Generate Reddit tracking link
 */
export function getRedditTrackingLink(
  baseUrl: string,
  subreddit: string,
  postType: RedditUTMParams['postType'],
  variant?: string
): string {
  const utmParams = generateRedditUTM({ subreddit, postType, variant });
  return buildUTMUrl(baseUrl, utmParams);
}

/**
 * Common tracking links for Reddit campaign
 */
export const RedditLinks = {
  // r/personalfinance case study post
  personalFinanceCaseStudy: getRedditTrackingLink(
    'https://taxbridge.app',
    'personalfinance',
    'case-study',
    'long-form'
  ),

  // r/h1b engagement
  h1bComment: getRedditTrackingLink(
    'https://taxbridge.app',
    'h1b',
    'comment',
    'helpful-reply'
  ),

  h1bPost: getRedditTrackingLink(
    'https://taxbridge.app',
    'h1b',
    'post'
  ),

  // r/ImmigrationCanada engagement
  immigrationCanadaComment: getRedditTrackingLink(
    'https://taxbridge.app',
    'ImmigrationCanada',
    'comment',
    'helpful-reply'
  ),

  immigrationCanadaPost: getRedditTrackingLink(
    'https://taxbridge.app',
    'ImmigrationCanada',
    'post'
  ),

  // Calculator direct links
  calculatorPersonalFinance: getRedditTrackingLink(
    'https://taxbridge.app/#calculator',
    'personalfinance',
    'case-study',
    'calculator-cta'
  ),

  calculatorH1B: getRedditTrackingLink(
    'https://taxbridge.app/#calculator',
    'h1b',
    'comment',
    'calculator-cta'
  ),

  calculatorImmigrationCanada: getRedditTrackingLink(
    'https://taxbridge.app/#calculator',
    'ImmigrationCanada',
    'comment',
    'calculator-cta'
  ),
};

/**
 * Extract UTM parameters from request URL (for server-side tracking)
 */
export function extractUTMParams(url: string): UTMParams | null {
  try {
    const urlObj = new URL(url);
    const source = urlObj.searchParams.get('utm_source');
    const medium = urlObj.searchParams.get('utm_medium');
    const campaign = urlObj.searchParams.get('utm_campaign');

    if (!source || !medium || !campaign) {
      return null;
    }

    return {
      source,
      medium,
      campaign,
      term: urlObj.searchParams.get('utm_term') || undefined,
      content: urlObj.searchParams.get('utm_content') || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Track UTM parameters in PostHog
 * Call this on page load to attribute traffic sources
 */
export function trackUTMInPostHog(url: string, posthog: any): void {
  const utmParams = extractUTMParams(url);

  if (utmParams && posthog) {
    posthog.capture('utm_source_tracked', {
      utm_source: utmParams.source,
      utm_medium: utmParams.medium,
      utm_campaign: utmParams.campaign,
      utm_term: utmParams.term,
      utm_content: utmParams.content,
      full_url: url,
    });

    // Set user properties for attribution
    posthog.people.set({
      initial_utm_source: utmParams.source,
      initial_utm_medium: utmParams.medium,
      initial_utm_campaign: utmParams.campaign,
      initial_utm_term: utmParams.term,
      initial_utm_content: utmParams.content,
    });
  }
}
