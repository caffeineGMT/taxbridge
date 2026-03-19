/**
 * CheckoutFlow Component
 * Handles the complete checkout flow with loading, error, and success states
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { NPSSurvey } from '@/components/feedback/NPSSurvey';

type CheckoutState = 'idle' | 'loading' | 'success' | 'error';

interface CheckoutFlowProps {
  onRetry?: () => void;
  onSuccess?: () => void;
  autoRedirectDelay?: number; // milliseconds
}

export function CheckoutFlow({
  onRetry,
  onSuccess,
  autoRedirectDelay = 3000,
}: CheckoutFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<CheckoutState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Check URL params for checkout status
    const upgrade = searchParams.get('upgrade');
    const error = searchParams.get('error');

    if (upgrade === 'success') {
      setState('success');
      if (onSuccess) {
        onSuccess();
      }
    } else if (error) {
      setState('error');
      setErrorMessage(decodeURIComponent(error));
    }
  }, [searchParams, onSuccess]);

  useEffect(() => {
    // Auto-redirect after success with countdown
    if (state === 'success') {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            router.push('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state, router]);

  const handleRetry = () => {
    setState('idle');
    setErrorMessage('');
    if (onRetry) {
      onRetry();
    }
  };

  // Loading State
  if (state === 'loading') {
    return (
      <Card className="bg-slate-900 border-slate-800 max-w-md mx-auto">
        <CardContent className="pt-12 pb-12">
          <div className="flex flex-col items-center justify-center space-y-6">
            <Spinner size="lg" className="text-emerald-500" />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-100 mb-2">
                Processing payment...
              </h3>
              <p className="text-slate-400 text-sm">
                Please wait while we set up your subscription
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success State
  if (state === 'success') {
    return (
      <>
        <Card className="bg-slate-900 border-slate-800 max-w-md mx-auto">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="rounded-full bg-emerald-500/20 p-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-100 mb-2">
                  Subscription activated!
                </h3>
                <p className="text-slate-400 mb-4">
                  Your account has been successfully upgraded
                </p>
                <p className="text-sm text-slate-500">
                  Redirecting to dashboard in {countdown}s...
                </p>
              </div>
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* NPS Survey - appears after successful checkout */}
        <NPSSurvey
          trigger="checkout"
          autoShow={true}
          delayMs={3000}
        />
      </>
    );
  }

  // Error State
  if (state === 'error') {
    return (
      <Card className="bg-slate-900 border-slate-800 max-w-md mx-auto">
        <CardContent className="pt-12 pb-12">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="rounded-full bg-red-500/20 p-4">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <div className="text-center w-full">
              <h3 className="text-2xl font-bold text-slate-100 mb-2">
                Payment failed
              </h3>
              <Alert variant="error" className="mt-4 mb-4 text-left">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error processing payment</AlertTitle>
                <AlertDescription>
                  {errorMessage || 'There was an error processing your payment. Please try again.'}
                </AlertDescription>
              </Alert>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRetry}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Try Again
              </Button>
              <Button
                onClick={() => router.push('/pricing')}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Back to Pricing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Idle state - no UI shown
  return null;
}

/**
 * CheckoutFlowInline - Inline version for use within existing pages
 */
interface CheckoutFlowInlineProps {
  state: CheckoutState;
  errorMessage?: string;
  onRetry?: () => void;
}

export function CheckoutFlowInline({
  state,
  errorMessage,
  onRetry,
}: CheckoutFlowInlineProps) {
  if (state === 'loading') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
        <Spinner size="md" className="text-emerald-500" />
        <span className="text-slate-300">Processing payment...</span>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <Alert variant="success">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Success!</AlertTitle>
        <AlertDescription>
          Your subscription has been activated successfully.
        </AlertDescription>
      </Alert>
    );
  }

  if (state === 'error') {
    return (
      <Alert variant="error">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Payment Failed</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{errorMessage || 'An error occurred during payment.'}</span>
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              className="ml-4 bg-red-500 hover:bg-red-600"
            >
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
