'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry with high priority
    Sentry.captureException(error, {
      level: 'fatal',
      tags: {
        errorBoundary: 'global',
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
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#f1f5f9',
          padding: '1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            maxWidth: '500px',
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #334155',
          }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              Critical Error
            </h1>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
              Something went seriously wrong. Our team has been notified.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                marginBottom: '2rem',
                textAlign: 'left',
              }}>
                <code style={{
                  fontSize: '0.875rem',
                  color: '#ef4444',
                  wordBreak: 'break-all',
                }}>
                  {error.message}
                </code>
                {error.digest && (
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#334155',
                  color: '#f1f5f9',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                }}
              >
                Go home
              </a>
            </div>

            {error.digest && (
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1.5rem' }}>
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
