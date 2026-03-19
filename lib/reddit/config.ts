/**
 * Reddit API Configuration
 *
 * NOTE: Reddit automation is temporarily disabled due to security vulnerabilities
 * in the snoowrap package (CVE-2023-28155: request package SSRF, CVE-2023-43646: form-data unsafe boundary).
 *
 * To re-enable Reddit features:
 * 1. Replace snoowrap with direct Reddit API calls using axios
 * 2. Implement OAuth2 flow using Reddit API v1
 * 3. Update all Reddit automation scripts to use the new implementation
 *
 * @see https://www.reddit.com/dev/api/
 */

export interface RedditConfig {
  userAgent: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}

export function getRedditClient(): never {
  throw new Error(
    'Reddit automation is temporarily disabled due to security vulnerabilities in snoowrap. ' +
    'Please refactor to use direct Reddit API calls with axios. See lib/reddit/config.ts for details.'
  );
}

export const TARGET_SUBREDDITS = [
  'h1b',
  'ImmigrationCanada',
  'PersonalFinanceCanada',
  'cscareerquestions',
] as const;

export const PRODUCT_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app';

export function buildUTMLink(baseUrl: string, source: string, medium: string, campaign: string, content?: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', medium);
  url.searchParams.set('utm_campaign', campaign);
  if (content) {
    url.searchParams.set('utm_content', content);
  }
  return url.toString();
}
