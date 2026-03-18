'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'app-level',
      },
      contexts: {
        errorInfo: {
          digest: error.digest,
          message: error.message,
          name: error.name,
        },
      },
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-error/10 p-6">
            <AlertCircle className="h-12 w-12 text-error" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-text">
            Something went wrong
          </h1>
          <p className="text-textMuted text-lg">
            We've been notified and are looking into it. Please try again.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-surface rounded-lg text-left">
              <p className="text-sm font-mono text-error break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-textMuted mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-surface text-text rounded-lg font-medium hover:bg-surfaceLight transition-colors"
          >
            Go home
          </a>
        </div>

        {error.digest && (
          <p className="text-xs text-textMuted">
            Reference this error ID when contacting support: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
