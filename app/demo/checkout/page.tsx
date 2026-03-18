/**
 * Checkout Flow Demo Page
 * Demonstrates all payment UI states for testing
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckoutFlowInline } from '@/components/checkout/CheckoutFlow';
import { ManageSubscriptionButton, QuickManageButton } from '@/components/billing/ManageSubscriptionButton';
import Header from '@/components/Header';

type CheckoutState = 'idle' | 'loading' | 'success' | 'error';

export default function CheckoutDemoPage() {
  const router = useRouter();
  const [state, setState] = useState<CheckoutState>('idle');
  const [errorMessage, setErrorMessage] = useState('Your payment could not be processed. Please try again.');

  const simulateCheckout = (targetState: CheckoutState, customError?: string) => {
    setState('loading');
    if (customError) {
      setErrorMessage(customError);
    }

    setTimeout(() => {
      setState(targetState);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Payment UI Demo</h1>
          <p className="text-slate-400">
            Test all payment flow states: loading, success, and error
          </p>
        </div>

        {/* Demo Controls */}
        <Card className="bg-slate-900 border-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-slate-100">State Controls</CardTitle>
            <CardDescription className="text-slate-400">
              Click a button to simulate different checkout states
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              onClick={() => setState('idle')}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Reset to Idle
            </Button>
            <Button
              onClick={() => simulateCheckout('loading')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Show Loading
            </Button>
            <Button
              onClick={() => simulateCheckout('success')}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Show Success
            </Button>
            <Button
              onClick={() => simulateCheckout('error')}
              className="bg-red-500 hover:bg-red-600"
            >
              Show Error
            </Button>
            <Button
              onClick={() => simulateCheckout('error', 'Your card was declined. Please use a different payment method.')}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Show Custom Error
            </Button>
          </CardContent>
        </Card>

        {/* Inline Checkout Flow Demo */}
        <Card className="bg-slate-900 border-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-slate-100">CheckoutFlowInline Component</CardTitle>
            <CardDescription className="text-slate-400">
              Inline version for embedding in existing pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CheckoutFlowInline
              state={state}
              errorMessage={errorMessage}
              onRetry={() => {
                setState('idle');
                setErrorMessage('');
              }}
            />
            {state === 'idle' && (
              <div className="text-slate-400 text-sm">
                No checkout state. Click a button above to test.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manage Subscription Button Demo */}
        <Card className="bg-slate-900 border-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-slate-100">ManageSubscriptionButton Component</CardTitle>
            <CardDescription className="text-slate-400">
              Opens Stripe billing portal for subscription management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Default Style</h4>
              <ManageSubscriptionButton />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Outline Variant</h4>
              <ManageSubscriptionButton
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Small Size</h4>
              <ManageSubscriptionButton size="sm" />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Without Icon</h4>
              <ManageSubscriptionButton showIcon={false} />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Quick Manage Link</h4>
              <div className="text-slate-300">
                Your current plan: <strong className="text-emerald-400">Pro</strong> •{' '}
                <QuickManageButton />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Examples */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Integration Examples</CardTitle>
            <CardDescription className="text-slate-400">
              Real-world usage patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Billing Page</h4>
              <p className="text-sm text-slate-400 mb-3">
                Full checkout flow with success/error handling
              </p>
              <Button
                onClick={() => router.push('/settings/billing')}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                View Billing Page
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Dashboard</h4>
              <p className="text-sm text-slate-400 mb-3">
                Post-checkout success modal
              </p>
              <Button
                onClick={() => router.push('/dashboard?upgrade=success')}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                View Dashboard Success
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Pricing Page</h4>
              <p className="text-sm text-slate-400 mb-3">
                Complete subscription upgrade flow
              </p>
              <Button
                onClick={() => router.push('/pricing')}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                View Pricing Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
