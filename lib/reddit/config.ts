import Snoowrap from 'snoowrap';

export interface RedditConfig {
  userAgent: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}

export function getRedditClient(): Snoowrap {
  const config: RedditConfig = {
    userAgent: process.env.REDDIT_USER_AGENT || 'TaxBridge:v1.0.0 (by /u/TaxBridgeApp)',
    clientId: process.env.REDDIT_CLIENT_ID || '',
    clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
    username: process.env.REDDIT_USERNAME || '',
    password: process.env.REDDIT_PASSWORD || '',
  };

  if (!config.clientId || !config.clientSecret || !config.username || !config.password) {
    throw new Error('Missing Reddit API credentials. Check .env file.');
  }

  return new Snoowrap({
    userAgent: config.userAgent,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    username: config.username,
    password: config.password,
  });
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
