// instrumentation.ts - Next.js 15+ instrumentation for Sentry
// This file is automatically loaded by Next.js when the server starts

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
