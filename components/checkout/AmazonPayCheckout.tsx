/**
 * Amazon Pay Checkout Variant (Variant C)
 *
 * One-click checkout using Amazon Pay.
 * Best for users with Amazon accounts who want frictionless checkout.
 *
 * Pros:
 * - One-click checkout (if user signed into Amazon)
 * - No card entry required
 * - Trusted Amazon branding
 * - Higher conversion for Amazon users
 *
 * Cons:
 * - Requires Amazon Pay merchant account
 * - Limited to Amazon customers
 * - Additional merchant fees
 * - Less flexibility than Stripe
 *
 * Note: This implementation provides the UI/UX.
 * Amazon Pay credentials and webhook setup required separately.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, Lock, Shield, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCheckoutExperiment } from '@/hooks/use-checkout-experiment';

interface AmazonPayCheckoutProps {
  tier: string;
  priceId: string;
  price: number;
  interval: 'monthly' | 'annual';
  userId?: number;
  referralCode?: string;
}

export function AmazonPayCheckout({
  tier,
  priceId,
  price,
  interval,
  userId,
  referralCode,
}: AmazonPayCheckoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAmazonPayReady, setIsAmazonPayReady] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(userId || null);
  const checkoutExperiment = useCheckoutExperiment();

  useEffect(() => {
    const initAmazonPay = async () => {
      try {
        // Get user if not provided
        let userIdToUse = currentUserId;
        if (!userIdToUse) {
          const userResponse = await fetch('/api/user');
          if (!userResponse.ok) {
            toast({
              title: 'Sign in required',
              description: 'Please sign in to upgrade your account.',
              variant: 'destructive',
            });
            setTimeout(() => router.push('/sign-up'), 1500);
            return;
          }
          const userData = await userResponse.json();
          userIdToUse = userData.user.id;
          setCurrentUserId(userIdToUse);
        }

        // Check if Amazon Pay is configured
        const isConfigured = Boolean(process.env.NEXT_PUBLIC_AMAZON_PAY_MERCHANT_ID);

        if (!isConfigured) {
          // Amazon Pay not configured - show fallback message
          setIsAmazonPayReady(false);
        } else {
          // Initialize Amazon Pay button
          // NOTE: Actual Amazon Pay SDK integration would go here
          // This is a placeholder for the real implementation
          setIsAmazonPayReady(true);
        }
      } catch (error) {
        console.error('Failed to initialize Amazon Pay:', error);
        setIsAmazonPayReady(false);
      }
    };

    initAmazonPay();
  }, [currentUserId, router]);

  const handleAmazonPayClick = async () => {
    if (!currentUserId) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to upgrade your account.',
        variant: 'destructive',
      });
      setTimeout(() => router.push('/sign-up'), 1500);
      return;
    }

    // Track checkout initiated
    checkoutExperiment.trackCheckoutInitiated(tier, priceId, price);

    setIsLoading(true);

    try {
      const referralCodeToUse = referralCode || localStorage.getItem('referral_code') || undefined;

      // Create Amazon Pay checkout session
      const response = await fetch('/api/amazon-pay/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          tier,
          userId: currentUserId,
          ...(referralCodeToUse && { referralCode: referralCodeToUse }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create Amazon Pay session');
      }

      const { checkoutSessionId, webCheckoutDetails } = await response.json();

      if (webCheckoutDetails?.amazonPayRedirectUrl) {
        toast({
          title: 'Redirecting to Amazon Pay...',
          description: 'You will be taken to Amazon to complete your payment.',
        });

        // Redirect to Amazon Pay
        setTimeout(() => {
          window.location.href = webCheckoutDetails.amazonPayRedirectUrl;
        }, 500);
      } else {
        throw new Error('No Amazon Pay URL returned');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start Amazon Pay checkout';
      checkoutExperiment.trackCheckoutError(tier, priceId, errorMessage);

      toast({
        title: 'Checkout failed',
        description: errorMessage,
        variant: 'destructive',
      });

      setIsLoading(false);
    }
  };

  const handleFallbackToStripe = () => {
    // If Amazon Pay is not available, track abandonment and suggest Stripe
    checkoutExperiment.trackCheckoutAbandoned(tier, priceId, price, 'amazon_pay_unavailable', 'fallback_to_stripe');

    toast({
      title: 'Switching to card payment',
      description: 'Amazon Pay is not available. You can pay with credit card instead.',
    });

    // Redirect to regular checkout (could be a page reload with different variant forced)
    router.push(`/checkout?tier=${tier}&priceId=${priceId}&price=${price}&interval=${interval}&force=stripe_native`);
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-8 border-2 border-slate-700 shadow-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 mb-4">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726-1.53.406-3.045.608-4.546.608-2.357 0-4.63-.428-6.82-1.282-2.188-.854-4.12-2.084-5.794-3.69-.106-.1-.164-.18-.164-.24 0-.08.046-.15.135-.21zm23.91.876c-.165.22-.42.232-.764.035-.54-.3-.885-.5-1.03-.618-.87-.654-1.82-1.06-2.85-1.21-.18-.03-.27-.106-.27-.226 0-.15.09-.234.27-.255 1.164-.12 2.24.045 3.226.48.99.436 1.74 1.05 2.25 1.846.09.15.12.27.09.36-.03.09-.12.165-.27.225z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Amazon Pay</h2>
        <p className="text-slate-400">Fast, secure checkout with your Amazon account</p>
      </div>

      {/* Order Summary */}
      <div className="bg-slate-900 rounded-lg p-6 mb-6 border border-slate-700">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">Order Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Plan</span>
            <span className="text-white font-bold">{tier === 'pro' ? 'Pro' : 'Enterprise'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Billing</span>
            <span className="text-white font-bold capitalize">{interval}</span>
          </div>
          <div className="border-t border-slate-700 pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold">Total</span>
              <span className="text-2xl font-bold text-emerald-400">${price}</span>
            </div>
            {interval === 'annual' && (
              <p className="text-xs text-slate-400 text-right mt-1">
                ${(price / 12).toFixed(2)}/month billed annually
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="flex flex-col items-center p-3 bg-slate-900 rounded-lg border border-slate-700">
          <Lock className="w-5 h-5 text-orange-500 mb-1" />
          <span className="text-xs text-slate-400 text-center">Secure</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-slate-900 rounded-lg border border-slate-700">
          <Shield className="w-5 h-5 text-orange-500 mb-1" />
          <span className="text-xs text-slate-400 text-center">Protected</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-slate-900 rounded-lg border border-slate-700">
          <Check className="w-5 h-5 text-orange-500 mb-1" />
          <span className="text-xs text-slate-400 text-center">One-Click</span>
        </div>
      </div>

      {/* Amazon Pay Benefits */}
      <div className="bg-slate-900 rounded-lg p-4 mb-6 border border-slate-700">
        <p className="text-sm font-bold text-white mb-2">Why use Amazon Pay?</p>
        <ul className="space-y-2 text-xs text-slate-400">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>No need to enter payment details</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Use your existing Amazon account</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Protected by Amazon's A-to-z Guarantee</span>
          </li>
        </ul>
      </div>

      {/* Amazon Pay Button or Fallback */}
      {isAmazonPayReady ? (
        <>
          <button
            onClick={handleAmazonPayClick}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-500 hover:from-orange-500 hover:via-orange-600 hover:to-yellow-600 disabled:from-slate-600 disabled:to-slate-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726-1.53.406-3.045.608-4.546.608-2.357 0-4.63-.428-6.82-1.282-2.188-.854-4.12-2.084-5.794-3.69-.106-.1-.164-.18-.164-.24 0-.08.046-.15.135-.21z" />
                </svg>
                <span>Continue with Amazon Pay</span>
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 text-center mt-4">
            You'll be redirected to Amazon to complete your payment securely.
          </p>
        </>
      ) : (
        <>
          {/* Amazon Pay not configured - show fallback */}
          <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4 mb-4">
            <p className="text-sm text-amber-300 mb-2 font-bold">Amazon Pay Temporarily Unavailable</p>
            <p className="text-xs text-amber-200">
              Amazon Pay checkout is currently being configured. Please use card payment instead.
            </p>
          </div>

          <button
            onClick={handleFallbackToStripe}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <span>Pay with Credit Card</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Guarantee */}
      <div className="mt-6 pt-6 border-t border-slate-700 text-center">
        <p className="text-sm text-slate-400">
          <span className="text-emerald-500 font-bold">✓</span> 30-day money-back guarantee
        </p>
        <p className="text-sm text-slate-400 mt-1">
          <span className="text-emerald-500 font-bold">✓</span> Cancel anytime, no questions asked
        </p>
      </div>
    </div>
  );
}
