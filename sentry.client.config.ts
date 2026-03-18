import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // Sentry DSN from environment
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development',

  // Set release version from Vercel git commit SHA
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Tracing sample rate - 10% of transactions in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay sampling
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Mask all text and input content for privacy
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration({
      // Track navigation performance
      enableLongTask: true,
      enableInp: true,
    }),
  ],

  // Filter out noise
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Random plugins/extensions
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    // Ignore network errors
    'NetworkError',
    'Failed to fetch',
    // Ignore aborted requests
    'AbortError',
  ],

  // Before sending, add additional context
  beforeSend(event, hint) {
    // Filter out non-error exceptions
    if (event.exception) {
      const error = hint.originalException;

      // Ignore errors from browser extensions
      if (error && typeof error === 'object' && 'stack' in error) {
        const stack = (error as Error).stack || '';
        if (stack.includes('chrome-extension://') || stack.includes('moz-extension://')) {
          return null;
        }
      }
    }

    return event;
  },

  // Configure allowed URLs
  allowUrls: [
    /https?:\/\/(www\.)?taxbridge\.com/,
    /https?:\/\/.*\.vercel\.app/,
  ],
});
