'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    console.error('Dashboard error:', error);

    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      {/* Background Grid Pattern */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px),
            repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px)
          `,
        }}
      />

      <Card className="max-w-2xl w-full border-red-500/30 bg-slate-900/90 relative">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-red-500/10 border border-red-500/30">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-100">Dashboard Error</CardTitle>
              <CardDescription>
                We couldn't load your dashboard. Please try again.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-sm font-mono text-red-400 mb-2">
                {error.message}
              </div>
              {error.digest && (
                <div className="text-xs text-slate-500 mt-2">
                  Error ID: {error.digest}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={reset}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex-1 border-slate-700 hover:bg-slate-800"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
            <Button
              onClick={() => (window.location.href = '/')}
              variant="outline"
              className="flex-1 border-slate-700 hover:bg-slate-800"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          {/* Support Info */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-300">
              <strong>Need help?</strong> Contact support at{' '}
              <a href="mailto:support@taxbridge.app" className="underline hover:text-blue-200">
                support@taxbridge.app
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
