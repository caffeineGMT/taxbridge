/**
 * UTM Parameter Builder and Tracker
 * For Google Ads campaign tracking with PostHog integration
 */

export interface UTMParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
}

export interface CampaignConfig {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
}

export const GOOGLE_ADS_CAMPAIGNS: Record<string, CampaignConfig> = {
  h1b_rsu: {
    source: 'google',
    medium: 'cpc',
    campaign: 'h1b-rsu-tax',
    content: 'h1b-rsu-ad-group',
  },
  tn_visa_stock: {
    source: 'google',
    medium: 'cpc',
    campaign: 'tn-visa-stock-tax',
    content: 'tn-stock-ad-group',
  },
  cross_border: {
    source: 'google',
    medium: 'cpc',
    campaign: 'cross-border-tax-tool',
    content: 'cross-border-ad-group',
  },
};

/**
 * Build UTM-tagged URL for Google Ads campaigns
 */
export function buildCampaignURL(
  baseUrl: string,
  campaignKey: keyof typeof GOOGLE_ADS_CAMPAIGNS,
  additionalParams?: Partial<UTMParams>
): string {
  const campaign = GOOGLE_ADS_CAMPAIGNS[campaignKey];
  if (!campaign) {
    throw new Error(`Unknown campaign key: ${campaignKey}`);
  }

  const params = new URLSearchParams({
    utm_source: campaign.source,
    utm_medium: campaign.medium,
    utm_campaign: campaign.campaign,
    ...(campaign.content && { utm_content: campaign.content }),
    ...(campaign.term && { utm_term: campaign.term }),
    ...additionalParams,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Extract UTM parameters from URL or search params
 */
export function extractUTMParams(
  searchParams: URLSearchParams | string
): UTMParams | null {
  const params =
    typeof searchParams === 'string'
      ? new URLSearchParams(searchParams)
      : searchParams;

  const utm_source = params.get('utm_source');
  const utm_medium = params.get('utm_medium');
  const utm_campaign = params.get('utm_campaign');
  const utm_content = params.get('utm_content');
  const utm_term = params.get('utm_term');
  const gclid = params.get('gclid');

  if (!utm_source || !utm_medium || !utm_campaign) {
    return null;
  }

  return {
    utm_source,
    utm_medium,
    utm_campaign,
    ...(utm_content && { utm_content }),
    ...(utm_term && { utm_term }),
    ...(gclid && { gclid }),
  };
}

/**
 * Store UTM parameters in session storage for attribution tracking
 */
export function storeUTMParams(params: UTMParams): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem('utm_params', JSON.stringify(params));
    sessionStorage.setItem('utm_timestamp', new Date().toISOString());

    // Also store in localStorage for longer attribution window (30 days)
    const attribution = {
      params,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    localStorage.setItem('first_touch_attribution', JSON.stringify(attribution));
  } catch (error) {
    console.error('Failed to store UTM params:', error);
  }
}

/**
 * Retrieve stored UTM parameters
 */
export function getStoredUTMParams(): UTMParams | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem('utm_params');
    if (!stored) return null;

    return JSON.parse(stored) as UTMParams;
  } catch (error) {
    console.error('Failed to retrieve UTM params:', error);
    return null;
  }
}

/**
 * Get first-touch attribution (for multi-session tracking)
 */
export function getFirstTouchAttribution(): {
  params: UTMParams;
  timestamp: string;
} | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('first_touch_attribution');
    if (!stored) return null;

    const attribution = JSON.parse(stored);

    // Check if expired
    if (new Date(attribution.expiresAt) < new Date()) {
      localStorage.removeItem('first_touch_attribution');
      return null;
    }

    return {
      params: attribution.params,
      timestamp: attribution.timestamp,
    };
  } catch (error) {
    console.error('Failed to retrieve first-touch attribution:', error);
    return null;
  }
}

/**
 * Calculate days since first touch
 */
export function getDaysSinceFirstTouch(): number | null {
  const firstTouch = getFirstTouchAttribution();
  if (!firstTouch) return null;

  const firstTouchDate = new Date(firstTouch.timestamp);
  const now = new Date();
  const diffMs = now.getTime() - firstTouchDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if current user came from Google Ads
 */
export function isFromGoogleAds(): boolean {
  const params = getStoredUTMParams();
  return (
    params?.utm_source === 'google' && params?.utm_medium === 'cpc' && !!params?.gclid
  );
}

/**
 * Get campaign name for analytics
 */
export function getCampaignName(): string | null {
  const params = getStoredUTMParams();
  return params?.utm_campaign || null;
}

/**
 * Build final Google Ads destination URLs
 */
export const GOOGLE_ADS_URLS = {
  h1b_rsu: buildCampaignURL(
    'https://taxbridge.pro/lp/h1b-rsu-calculator',
    'h1b_rsu'
  ),
  tn_visa_stock: buildCampaignURL(
    'https://taxbridge.pro/lp/tn-visa-stock-tax',
    'tn_visa_stock'
  ),
  cross_border: buildCampaignURL(
    'https://taxbridge.pro/lp/cross-border-tax',
    'cross_border'
  ),
} as const;

/**
 * Track Google Ads GCLID for conversion tracking
 */
export function trackGCLID(gclid: string): void {
  if (typeof window === 'undefined') return;

  try {
    // Store GCLID in cookie for 90 days (Google's attribution window)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 90);

    document.cookie = `gclid=${gclid}; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=strict`;

    // Also store in localStorage as backup
    localStorage.setItem('gclid', gclid);
    localStorage.setItem('gclid_timestamp', new Date().toISOString());
  } catch (error) {
    console.error('Failed to track GCLID:', error);
  }
}

/**
 * Retrieve stored GCLID
 */
export function getStoredGCLID(): string | null {
  if (typeof window === 'undefined') return null;

  // Try cookie first
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'gclid') {
      return value;
    }
  }

  // Fallback to localStorage
  return localStorage.getItem('gclid');
}
