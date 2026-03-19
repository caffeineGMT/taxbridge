/**
 * Stripe Native Checkout Variant (Variant A)
 *
 * Uses Stripe Checkout Sessions - redirects to Stripe-hosted checkout page.
 * This is the current implementation, refactored as a component.
 *
 * Pros:
 * - Fully PCI compliant (no card data touches our servers)
 * - Built-in Apple Pay, Google Pay, Link
 * - Automatic tax calculation
 * - Trusted Stripe branding
 *
 * Cons:
 * - Requires redirect (leaves our site)
 * - Slower conversion due to context switch
 * - Less customization options
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Lock, Shield, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCheckoutExperiment } from '@/hooks/use-checkout-experiment';

interface StripeNativeCheckoutProps {
  tier: string;
  priceId: string;
  price: number;
  interval: 'monthly' | 'annual';
  userId?: number;
  referralCode?: string;
}

export function StripeNativeCheckout({
  tier,
  priceId,
  price,
  interval,
  userId,
  referralCode,
}: StripeNativeCheckoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const checkoutExperiment = useCheckoutExperiment();

  const handleCheckout = async () => {
    // Track checkout initiated
    checkoutExperiment.trackCheckoutInitiated(tier, priceId, price);

    setIsLoading(true);

    try {
      // Get user if not provided
      let currentUserId = userId;
      if (!currentUserId) {
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
        currentUserId = userData.user.id;
      }

      const referralCodeToUse = referralCode || localStorage.getItem('referral_code') || undefined;

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout', {
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
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        toast({
          title: 'Redirecting to secure checkout...',
          description: 'You will be taken to Stripe to complete your payment.',
        });

        // Small delay for UX, then redirect
        setTimeout(() => {
          window.location.href = url;
        }, 500);
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout';

      checkoutExperiment.trackCheckoutError(tier, priceId, errorMessage);

      toast({
        title: 'Checkout failed',
        description: errorMessage,
        variant: 'destructive',
      });

      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-8 border-2 border-slate-700 shadow-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Secure Checkout</h2>
        <p className="text-slate-400">Powered by Stripe</p>
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
          <Lock className="w-5 h-5 text-emerald-500 mb-1" />
          <span className="text-xs text-slate-400 text-center">SSL Encrypted</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-slate-900 rounded-lg border border-slate-700">
          <Shield className="w-5 h-5 text-emerald-500 mb-1" />
          <span className="text-xs text-slate-400 text-center">PCI Compliant</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-slate-900 rounded-lg border border-slate-700">
          <CreditCard className="w-5 h-5 text-emerald-500 mb-1" />
          <span className="text-xs text-slate-400 text-center">All Cards</span>
        </div>
      </div>

      {/* Payment Methods Info */}
      <div className="bg-slate-900 rounded-lg p-4 mb-6 border border-slate-700">
        <p className="text-sm text-slate-300 text-center mb-2">Accepted payment methods:</p>
        <p className="text-xs text-slate-400 text-center">
          Visa, Mastercard, Amex, Discover, Apple Pay, Google Pay, Link
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-600 disabled:to-slate-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>Continue to Secure Checkout</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      {/* Security Notice */}
      <p className="text-xs text-slate-500 text-center mt-4">
        You'll be redirected to Stripe's secure checkout page. Your payment information is encrypted and never stored on our servers.
      </p>

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
