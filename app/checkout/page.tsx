/**
 * Unified Checkout Page with A/B/C Testing
 *
 * This page automatically routes users to one of three checkout variants:
 * - Variant A: Stripe-native checkout (redirects to Stripe)
 * - Variant B: Embedded Stripe Elements form (on-site)
 * - Variant C: Amazon Pay one-click checkout
 *
 * The variant is determined by the checkout experiment hook (33/33/34 split).
 * All variants are tracked via PostHog for conversion analysis.
 */

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useCheckoutExperiment } from '@/hooks/use-checkout-experiment';
import { StripeNativeCheckout } from '@/components/checkout/StripeNativeCheckout';
import { EmbeddedCheckout } from '@/components/checkout/EmbeddedCheckout';
import { AmazonPayCheckout } from '@/components/checkout/AmazonPayCheckout';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutExperiment = useCheckoutExperiment();

  // Get checkout parameters from URL
  const tier = searchParams.get('tier') || 'pro';
  const priceId = searchParams.get('priceId') || '';
  const price = parseFloat(searchParams.get('price') || '49');
  const interval = (searchParams.get('interval') || 'annual') as 'monthly' | 'annual';
  const forceVariant = searchParams.get('force'); // Allow forcing a specific variant for testing/fallback

  const [variant, setVariant] = useState<string>(checkoutExperiment.variant);

  useEffect(() => {
    // Track page view
    checkoutExperiment.trackVariantExposure();

    // Use forced variant if specified, otherwise use experiment assignment
    if (forceVariant && ['stripe_native', 'embedded_form', 'amazon_pay'].includes(forceVariant)) {
      const forcedVariantMap: Record<string, string> = {
        stripe_native: 'checkout_stripe_native',
        embedded_form: 'checkout_embedded_form',
        amazon_pay: 'checkout_amazon_pay',
      };
      setVariant(forcedVariantMap[forceVariant]);
    } else {
      setVariant(checkoutExperiment.variant);
    }
  }, [checkoutExperiment, forceVariant]);

  if (checkoutExperiment.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!tier || !priceId || !price) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 border-2 border-slate-700 max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Invalid Checkout</h2>
          <p className="text-slate-400 mb-6">
            Missing required checkout information. Please return to the pricing page and select a plan.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-lg font-bold transition-all"
          >
            Return to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
              T
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-500 text-transparent bg-clip-text">
              TaxBridge
            </span>
          </div>
          <button
            onClick={() => router.push('/pricing')}
            className="text-sm text-slate-300 hover:text-white font-medium transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Pricing</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Complete Your Purchase</h1>
            <p className="text-slate-400">
              You're upgrading to {tier === 'pro' ? 'Pro' : 'Enterprise'} • Billed {interval}
            </p>
          </div>

          {/* Variant-specific Checkout Component */}
          {variant === 'checkout_stripe_native' && (
            <StripeNativeCheckout
              tier={tier}
              priceId={priceId}
              price={price}
              interval={interval}
            />
          )}

          {variant === 'checkout_embedded_form' && (
            <EmbeddedCheckout
              tier={tier}
              priceId={priceId}
              price={price}
              interval={interval}
            />
          )}

          {variant === 'checkout_amazon_pay' && (
            <AmazonPayCheckout
              tier={tier}
              priceId={priceId}
              price={price}
              interval={interval}
            />
          )}

          {/* Experiment Badge (only visible in dev mode) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 bg-slate-900 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-2">A/B Test Info (dev only):</p>
              <p className="text-xs text-slate-400">
                Variant: <span className="font-mono text-emerald-500">{variant}</span>
              </p>
              <p className="text-xs text-slate-400">
                Name: <span className="font-mono text-emerald-500">{checkoutExperiment.getVariantName()}</span>
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Force variants by adding <code className="text-orange-400">?force=stripe_native</code>,{' '}
                <code className="text-orange-400">?force=embedded_form</code>, or{' '}
                <code className="text-orange-400">?force=amazon_pay</code> to the URL
              </p>
            </div>
          )}

          {/* Security & Trust Section */}
          <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 text-center">
              Secure & Trusted
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-500">256-bit SSL</p>
                <p className="text-sm text-emerald-500 font-bold mt-1">Encrypted</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">PCI DSS</p>
                <p className="text-sm text-emerald-500 font-bold mt-1">Compliant</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">30-Day</p>
                <p className="text-sm text-emerald-500 font-bold mt-1">Guarantee</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Cancel</p>
                <p className="text-sm text-emerald-500 font-bold mt-1">Anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
