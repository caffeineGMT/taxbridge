import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // Sentry DSN from environment
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set environment
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',

  // Set release version from Vercel git commit SHA
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Tracing sample rate - 10% of transactions in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',

  // Integrations for server-side
  integrations: [
    // Add profiling (optional, requires additional setup in Sentry)
    // Sentry.profilingIntegration(),
  ],

  // Filter out noise
  ignoreErrors: [
    // Database connection errors that are retried
    'SQLITE_BUSY',
    // Clerk webhook validation (handled gracefully)
    'Webhook signature verification failed',
  ],

  // Before sending, add server context
  beforeSend(event, hint) {
    // Add server-side specific context
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }

      // Remove query parameters that might contain sensitive data
      if (event.request.query_string) {
        const url = new URL(event.request.url || '');
        url.searchParams.delete('token');
        url.searchParams.delete('api_key');
        event.request.url = url.toString();
      }
    }

    return event;
  },

  // Track slow database queries
  beforeSendTransaction(event) {
    // Filter out fast transactions in production
    if (process.env.NODE_ENV === 'production') {
      const duration = event.timestamp && event.start_timestamp
        ? (event.timestamp - event.start_timestamp) * 1000
        : 0;

      // Only send transactions slower than 1s
      if (duration < 1000) {
        return null;
      }
    }

    return event;
  },
});
