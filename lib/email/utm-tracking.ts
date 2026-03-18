/**
 * UTM Tracking for Email Campaign Links
 *
 * Generates UTM-tagged URLs for PostHog analytics tracking
 */

import type { EmailEventType, ABVariant } from './ab-testing';

export interface UTMParams {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
}

/**
 * Build a URL with UTM parameters for tracking
 */
export function buildUTMUrl(baseUrl: string, params: UTMParams): string {
  try {
    const url = new URL(baseUrl);

    // Add UTM parameters
    url.searchParams.set('utm_source', params.source);
    url.searchParams.set('utm_medium', params.medium);
    url.searchParams.set('utm_campaign', params.campaign);

    if (params.content) {
      url.searchParams.set('utm_content', params.content);
    }

    if (params.term) {
      url.searchParams.set('utm_term', params.term);
    }

    return url.toString();
  } catch (error) {
    console.error('Error building UTM URL:', error);
    return baseUrl;
  }
}

/**
 * Generate UTM parameters for email drip campaign
 */
export function getEmailUTMParams(
  eventType: EmailEventType,
  variant: ABVariant,
  linkType: string
): UTMParams {
  // Campaign mapping
  const campaignMap: Record<EmailEventType, string> = {
    drip_welcome: 'welcome-email',
    drip_day3: 'education-email',
    drip_day7: 'features-email',
    drip_day14: 'conversion-email',
  };

  return {
    source: 'email',
    medium: 'drip-campaign',
    campaign: campaignMap[eventType],
    content: `variant-${variant.toLowerCase()}`,
    term: linkType, // e.g., 'cta-button', 'header-link', 'footer-link'
  };
}

/**
 * Generate all UTM-tracked URLs for an email template
 */
export function generateEmailUrls(
  eventType: EmailEventType,
  variant: ABVariant,
  userEmail: string
) {
  const baseUrls = {
    dashboard: 'https://taxbridge.app/dashboard',
    calculator: 'https://taxbridge.app/calculator',
    ftcCalculator: 'https://taxbridge.app/ftc-calculator',
    rsuEntry: 'https://taxbridge.app/rsu-entry',
    upgrade: 'https://taxbridge.app/upgrade',
    pricing: 'https://taxbridge.app/pricing',
    forms: 'https://taxbridge.app/forms',
    exchangeRates: 'https://taxbridge.app/exchange-rates',
    demo: 'https://taxbridge.app/demo',
    knowledgeBase: 'https://taxbridge.app/knowledge-base',
    unsubscribe: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(userEmail)}`,
  };

  // Build UTM-tracked URLs
  return {
    dashboard_url: buildUTMUrl(
      baseUrls.dashboard,
      getEmailUTMParams(eventType, variant, 'dashboard-link')
    ),
    calculator_url: buildUTMUrl(
      baseUrls.calculator,
      getEmailUTMParams(eventType, variant, 'calculator-link')
    ),
    ftc_calculator_url: buildUTMUrl(
      baseUrls.ftcCalculator,
      getEmailUTMParams(eventType, variant, 'ftc-calculator-link')
    ),
    rsu_entry_url: buildUTMUrl(
      baseUrls.rsuEntry,
      getEmailUTMParams(eventType, variant, 'rsu-entry-link')
    ),
    upgrade_url: buildUTMUrl(
      baseUrls.upgrade,
      getEmailUTMParams(eventType, variant, 'cta-button')
    ),
    pricing_url: buildUTMUrl(
      baseUrls.pricing,
      getEmailUTMParams(eventType, variant, 'pricing-link')
    ),
    forms_url: buildUTMUrl(
      baseUrls.forms,
      getEmailUTMParams(eventType, variant, 'forms-link')
    ),
    exchange_rates_url: buildUTMUrl(
      baseUrls.exchangeRates,
      getEmailUTMParams(eventType, variant, 'exchange-rates-link')
    ),
    demo_url: buildUTMUrl(
      baseUrls.demo,
      getEmailUTMParams(eventType, variant, 'demo-link')
    ),
    knowledge_base_url: buildUTMUrl(
      baseUrls.knowledgeBase,
      getEmailUTMParams(eventType, variant, 'knowledge-link')
    ),
    unsubscribe_url: baseUrls.unsubscribe, // Don't track unsubscribe links
  };
}

/**
 * Track email click event in PostHog
 * This should be called from the client-side when a user clicks an email link
 */
export function getPostHogEventProperties(
  eventType: EmailEventType,
  variant: ABVariant,
  linkType: string
) {
  return {
    email_type: eventType,
    ab_variant: variant,
    link_type: linkType,
    source: 'email_drip_campaign',
  };
}
