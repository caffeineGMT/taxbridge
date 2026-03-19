'use client';

import React from 'react';
import { trackError } from '@/lib/analytics/tracking-utils';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary
 * Catches React errors and tracks them in PostHog
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track error in PostHog
    trackError(error, {
      context: 'react_error_boundary',
      component_stack: errorInfo.componentStack,
    });

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-2xl font-bold text-slate-100 mb-4">
              Something went wrong
            </h1>
            <p className="text-slate-400 mb-6">
              We've been notified and are looking into it. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-emerald-500 text-slate-950 font-semibold rounded-lg hover:bg-emerald-600 transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
