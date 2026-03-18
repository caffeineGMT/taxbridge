import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // Sentry DSN from environment
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set environment
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',

  // Set release version
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Lower sample rate for edge functions (they run more frequently)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',

  // Edge runtime has limited integrations
  integrations: [],

  // Filter noise
  ignoreErrors: [
    'NetworkError',
    'Failed to fetch',
  ],
});
