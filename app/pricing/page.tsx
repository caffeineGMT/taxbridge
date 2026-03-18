/**
 * Pricing Page
 * Displays subscription tiers with features and pricing
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';

const TIERS = [
  {
    name: 'Free',
    price: 0,
    priceId: null,
    tier: 'free',
    description: 'Perfect for trying out TaxBridge',
    features: [
      '1 RSU entry',
      'View tax calculation',
      'Forms checklist',
      'USD/CAD conversion',
      'Basic support',
    ],
    limitations: [
      'Limited to 1 RSU entry',
      'No PDF export',
      'Email support only',
    ],
    cta: 'Current Plan',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 299,
    annual: true,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_1ProAnnual',
    tier: 'pro',
    description: 'For professionals managing multiple RSU vestings',
    features: [
      'Unlimited RSU entries',
      'Foreign Tax Credit optimizer',
      'PDF export & reports',
      'Priority email support',
      'Multi-year tracking',
      'Advanced tax scenarios',
      'Detailed filing guidance',
    ],
    limitations: [],
    cta: 'Upgrade to Pro',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 2000,
    annual: true,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_1EntAnnual',
    tier: 'enterprise',
    description: 'For accounting firms and multiple clients',
    features: [
      'Everything in Pro',
      'API access',
      'Bulk CSV upload',
      'CPA dashboard',
      'White-label reports',
      'Client management',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    limitations: [],
    cta: 'Upgrade to Enterprise',
    highlighted: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleUpgrade = async (tier: string, priceId: string | null) => {
    if (!priceId) return;

    setLoadingTier(tier);

    try {
      // Get default user (MVP uses single user)
      const userResponse = await fetch('/api/user');
      if (!userResponse.ok) throw new Error('Failed to get user');

      const userData = await userResponse.json();
      const userId = userData.user.id;

      // Get referral code from localStorage (if any)
      const referralCode = localStorage.getItem('referral_code');

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          tier,
          userId,
          ...(referralCode && { referralCode }),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 text-transparent bg-clip-text">
              TaxBridge
            </span>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Pricing Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the plan that best fits your cross-border tax needs.
            All plans include our core tax calculation engine and USD/CAD conversion.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border-2 p-8 bg-white ${
                tier.highlighted
                  ? 'border-blue-600 shadow-xl scale-105'
                  : 'border-gray-200'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    ${tier.price.toLocaleString()}
                  </span>
                  {tier.annual && <span className="text-gray-500">/year</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => tier.priceId && handleUpgrade(tier.tier, tier.priceId)}
                disabled={!tier.priceId || loadingTier === tier.tier}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  tier.highlighted
                    ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:shadow-lg disabled:opacity-50'
                    : 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 disabled:opacity-50'
                }`}
              >
                {loadingTier === tier.tier ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  tier.cta
                )}
              </button>

              {tier.limitations.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 font-semibold mb-2">Limitations:</p>
                  <ul className="space-y-1">
                    {tier.limitations.map((limitation, idx) => (
                      <li key={idx} className="text-xs text-gray-500">
                        • {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="font-semibold mb-2">Can I switch plans later?</h3>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately,
                and downgrades will take effect at the end of your current billing period.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="font-semibold mb-2">What happens when I downgrade?</h3>
              <p className="text-gray-600 text-sm">
                Your existing data remains intact, but you'll lose access to premium features.
                For example, if you downgrade from Pro to Free, you'll keep all your RSU entries
                but can only add 1 new entry.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600 text-sm">
                We offer a 30-day money-back guarantee. If you're not satisfied with TaxBridge,
                contact us within 30 days of purchase for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
