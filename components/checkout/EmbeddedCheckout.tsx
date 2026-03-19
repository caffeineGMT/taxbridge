/**
 * Embedded Stripe Elements Checkout Variant (Variant B)
 *
 * Uses Stripe Elements to embed the payment form directly on our site.
 * Users never leave the page, providing a seamless checkout experience.
 *
 * Pros:
 * - No redirect - users stay on our site
 * - Faster conversion (fewer steps)
 * - Full control over UX
 * - More customization options
 *
 * Cons:
 * - More complex implementation
 * - Requires additional PCI considerations
 * - Need to handle more edge cases
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, Lock, Shield, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCheckoutExperiment } from '@/hooks/use-checkout-experiment';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface EmbeddedCheckoutFormProps {
  tier: string;
  priceId: string;
  price: number;
  interval: 'monthly' | 'annual';
  clientSecret: string;
  userId: number;
}

// Separate component for the form (must be inside Elements provider)
function CheckoutForm({
  tier,
  priceId,
  price,
  interval,
  clientSecret,
  userId,
}: EmbeddedCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const checkoutExperiment = useCheckoutExperiment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/pricing?upgrade=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        throw new Error(error.message || 'Payment failed');
      }

      // Payment succeeded without redirect
      const startTime = parseInt(localStorage.getItem('checkout_start_time') || '0', 10);
      const timeToComplete = startTime ? Date.now() - startTime : 0;

      checkoutExperiment.trackCheckoutCompleted(tier, priceId, price, timeToComplete);

      setIsComplete(true);

      toast({
        title: 'Payment successful!',
        description: 'Your subscription has been activated.',
      });

      // Redirect to success page
      setTimeout(() => {
        router.push('/pricing?upgrade=success');
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      checkoutExperiment.trackCheckoutError(tier, priceId, errorMessage);

      toast({
        title: 'Payment failed',
        description: errorMessage,
        variant: 'destructive',
      });

      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
          }}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing || isComplete}
        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-600 disabled:to-slate-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing payment...</span>
          </>
        ) : isComplete ? (
          <>
            <Check className="w-5 h-5" />
            <span>Payment complete!</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>Pay ${price}</span>
          </>
        )}
      </button>

      {/* Security Notice */}
      <p className="text-xs text-slate-500 text-center">
        Your payment is secured by Stripe. Card information is encrypted and never stored on our servers.
      </p>
    </form>
  );
}

// Main component
interface EmbeddedCheckoutProps {
  tier: string;
  priceId: string;
  price: number;
  interval: 'monthly' | 'annual';
  userId?: number;
  referralCode?: string;
}

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export function EmbeddedCheckout({
  tier,
  priceId,
  price,
  interval,
  userId,
  referralCode,
}: EmbeddedCheckoutProps) {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(userId || null);
  const checkoutExperiment = useCheckoutExperiment();

  useEffect(() => {
    const initCheckout = async () => {
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

        // Track checkout initiated
        checkoutExperiment.trackCheckoutInitiated(tier, priceId, price);

        const referralCodeToUse = referralCode || localStorage.getItem('referral_code') || undefined;

        // Create Payment Intent
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId,
            tier,
            userId: userIdToUse,
            ...(referralCodeToUse && { referralCode: referralCodeToUse }),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to initialize checkout');
        }

        const { clientSecret: secret } = await response.json();
        setClientSecret(secret);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize checkout';
        checkoutExperiment.trackCheckoutError(tier, priceId, errorMessage);

        toast({
          title: 'Checkout failed',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initCheckout();
  }, [tier, priceId, price, currentUserId, referralCode, router, checkoutExperiment]);

  if (isLoading || !clientSecret || !currentUserId) {
    return (
      <div className="bg-slate-800 rounded-2xl p-8 border-2 border-slate-700 shadow-xl">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-4" />
          <p className="text-slate-400">Loading secure checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-2xl p-8 border-2 border-slate-700 shadow-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Fast Checkout</h2>
        <p className="text-slate-400">Complete your purchase without leaving this page</p>
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
          <Check className="w-5 h-5 text-emerald-500 mb-1" />
          <span className="text-xs text-slate-400 text-center">Instant Access</span>
        </div>
      </div>

      {/* Stripe Elements Form */}
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm
          tier={tier}
          priceId={priceId}
          price={price}
          interval={interval}
          clientSecret={clientSecret}
          userId={currentUserId}
        />
      </Elements>

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
