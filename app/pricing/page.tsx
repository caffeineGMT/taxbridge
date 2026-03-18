/**
 * Enhanced Pricing Page
 * Production-quality pricing page with feature comparison table and Stripe checkout
 * Optimized for conversion with clear value props and trust signals
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, X, Loader2, Shield, Zap, Users, ArrowRight, Lock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Pricing tiers
const TIERS = [
  {
    name: 'Free',
    price: 0,
    priceId: null,
    tier: 'free',
    tagline: 'Get started with basic cross-border tax tools',
    features: {
      rsuEntries: '1 RSU entry',
      taxCalculation: true,
      ftcOptimizer: false,
      pdfExport: false,
      multiYear: false,
      bulkImport: false,
      prioritySupport: false,
      apiAccess: false,
      clientManagement: false,
      whiteLabel: false,
    },
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 299,
    annual: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_1ProAnnual',
    tier: 'pro',
    tagline: 'Perfect for individuals managing RSU income',
    badge: 'Most Popular',
    features: {
      rsuEntries: 'Unlimited RSU entries',
      taxCalculation: true,
      ftcOptimizer: true,
      pdfExport: true,
      multiYear: true,
      bulkImport: true,
      prioritySupport: true,
      apiAccess: false,
      clientManagement: false,
      whiteLabel: false,
    },
    cta: 'Start Pro Trial',
    highlighted: true,
    savings: 'Save $100 vs monthly',
  },
  {
    name: 'Enterprise',
    price: 2000,
    annual: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_1EntAnnual',
    tier: 'enterprise',
    tagline: 'For accounting firms and tax professionals',
    features: {
      rsuEntries: 'Unlimited RSU entries',
      taxCalculation: true,
      ftcOptimizer: true,
      pdfExport: true,
      multiYear: true,
      bulkImport: true,
      prioritySupport: true,
      apiAccess: true,
      clientManagement: true,
      whiteLabel: true,
    },
    cta: 'Contact Sales',
    highlighted: false,
    customFeatures: ['Dedicated account manager', 'SLA guarantee', 'Custom integrations'],
  },
];

// Feature comparison data
const FEATURE_COMPARISON = [
  {
    category: 'Core Features',
    features: [
      { name: 'RSU Income Entries', free: '1 entry', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Dual Tax Calculation', free: true, pro: true, enterprise: true },
      { name: 'USD/CAD Conversion', free: true, pro: true, enterprise: true },
      { name: 'Forms Checklist', free: true, pro: true, enterprise: true },
    ],
  },
  {
    category: 'Advanced Features',
    features: [
      { name: 'Foreign Tax Credit Optimizer', free: false, pro: true, enterprise: true },
      { name: 'Multi-Year Tax Dashboard', free: false, pro: true, enterprise: true },
      { name: 'FTC Carryforward Tracking', free: false, pro: true, enterprise: true },
      { name: 'PDF Export & Reports', free: false, pro: true, enterprise: true },
      { name: 'CSV Bulk Import', free: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'Enterprise Features',
    features: [
      { name: 'API Access', free: false, pro: false, enterprise: true },
      { name: 'Client Management Dashboard', free: false, pro: false, enterprise: true },
      { name: 'White-label Reports', free: false, pro: false, enterprise: true },
      { name: 'Custom Integrations', free: false, pro: false, enterprise: true },
      { name: 'Dedicated Account Manager', free: false, pro: false, enterprise: true },
    ],
  },
  {
    category: 'Support',
    features: [
      { name: 'Email Support', free: 'Standard', pro: 'Priority', enterprise: '24/7 Priority' },
      { name: 'Response Time', free: '48 hours', pro: '12 hours', enterprise: '2 hours' },
      { name: 'Phone Support', free: false, pro: false, enterprise: true },
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingTier, setLoadingTier] = useState&lt;string | null&gt;(null);
  const [billingCycle, setBillingCycle] = useState&lt;'monthly' | 'annual'&gt;('annual');

  // Handle upgrade success/cancel from URL params
  useEffect(() => {
    const upgrade = searchParams.get('upgrade');

    if (upgrade === 'success') {
      toast({
        title: 'Subscription activated!',
        description: 'Welcome to TaxBridge Pro! Your account has been upgraded.',
        duration: 5000,
      });
      // Clean up URL
      router.replace('/pricing');
    } else if (upgrade === 'cancelled') {
      toast({
        title: 'Upgrade cancelled',
        description: 'No charges were made. You can upgrade anytime.',
        variant: 'destructive',
        duration: 5000,
      });
      // Clean up URL
      router.replace('/pricing');
    }
  }, [searchParams, router]);

  const handleUpgrade = async (tier: string, priceId: string | null) => {
    if (!priceId) {
      // For free tier or contact sales
      if (tier === 'free') {
        router.push('/sign-up');
      } else if (tier === 'enterprise') {
        // Open contact form or email
        window.location.href = 'mailto:sales@taxbridge.com?subject=Enterprise Plan Inquiry';
      }
      return;
    }

    setLoadingTier(tier);

    try {
      // Get default user (MVP uses single user)
      const userResponse = await fetch('/api/user');
      if (!userResponse.ok) {
        // User not logged in, redirect to sign up
        toast({
          title: 'Sign in required',
          description: 'Please sign in to upgrade your account.',
          variant: 'destructive',
        });
        setTimeout(() => router.push('/sign-up'), 1500);
        return;
      }

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        // Show loading toast
        toast({
          title: 'Redirecting to checkout...',
          description: 'Please wait while we prepare your secure payment page.',
        });

        setTimeout(() => {
          window.location.href = url;
        }, 500);
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Checkout failed',
        description: error instanceof Error ? error.message : 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
              T
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 text-transparent bg-clip-text">
              TaxBridge
            </span>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-blue-900 to-emerald-900 text-transparent bg-clip-text">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your cross-border tax needs. All plans include our core tax calculation engine,
            USD/CAD conversion, and Treaty Article XV compliance.
          </p>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <span>30-Day Money Back</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                tier.highlighted
                  ? 'bg-gradient-to-br from-blue-600 to-emerald-600 text-white shadow-2xl scale-105 border-2 border-blue-400'
                  : 'bg-white border-2 border-slate-200 hover:border-blue-300 hover:shadow-xl'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg uppercase tracking-wide">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${tier.highlighted ? 'text-white' : 'text-slate-900'}`}>
                  {tier.name}
                </h3>
                <p className={`text-sm mb-6 ${tier.highlighted ? 'text-blue-100' : 'text-slate-600'}`}>
                  {tier.tagline}
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-5xl font-bold ${tier.highlighted ? 'text-white' : 'text-slate-900'}`}>
                    ${tier.price.toLocaleString()}
                  </span>
                  {tier.annual && (
                    <span className={tier.highlighted ? 'text-blue-100' : 'text-slate-500'}>/year</span>
                  )}
                </div>
                {tier.savings && (
                  <p className={`text-sm ${tier.highlighted ? 'text-emerald-200' : 'text-emerald-600'} font-medium`}>
                    {tier.savings}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleUpgrade(tier.tier, tier.priceId)}
                disabled={loadingTier === tier.tier}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 mb-8 flex items-center justify-center gap-2 ${
                  tier.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl disabled:opacity-50'
                    : 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:from-blue-700 hover:to-emerald-700 shadow-md hover:shadow-lg disabled:opacity-50'
                }`}
              >
                {loadingTier === tier.tier ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {tier.cta}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="space-y-4">
                <p className={`text-xs font-bold uppercase tracking-wide ${tier.highlighted ? 'text-blue-200' : 'text-slate-500'}`}>
                  What's Included:
                </p>
                <ul className="space-y-3">
                  <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-700'}`}>
                    <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-600'}`} />
                    <span>{tier.features.rsuEntries}</span>
                  </li>
                  {tier.features.taxCalculation && (
                    <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-700'}`}>
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-600'}`} />
                      <span>Dual US/Canada tax calculation</span>
                    </li>
                  )}
                  {tier.features.ftcOptimizer && (
                    <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-700'}`}>
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-600'}`} />
                      <span>Foreign Tax Credit optimizer</span>
                    </li>
                  )}
                  {tier.features.pdfExport && (
                    <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-700'}`}>
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-600'}`} />
                      <span>PDF export & professional reports</span>
                    </li>
                  )}
                  {tier.features.multiYear && (
                    <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-700'}`}>
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-600'}`} />
                      <span>Multi-year tax dashboard</span>
                    </li>
                  )}
                  {tier.features.bulkImport && (
                    <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-700'}`}>
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-600'}`} />
                      <span>CSV bulk import</span>
                    </li>
                  )}
                  {tier.features.prioritySupport && (
                    <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-700'}`}>
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-600'}`} />
                      <span>Priority support (12hr response)</span>
                    </li>
                  )}
                  {tier.features.apiAccess && (
                    <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-700'}`}>
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-600'}`} />
                      <span>API access</span>
                    </li>
                  )}
                  {tier.features.clientManagement && (
                    <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-700'}`}>
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-600'}`} />
                      <span>Client management dashboard</span>
                    </li>
                  )}
                  {tier.features.whiteLabel && (
                    <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-700'}`}>
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-600'}`} />
                      <span>White-label reports</span>
                    </li>
                  )}
                  {tier.customFeatures?.map((feature, idx) => (
                    <li
                      key={idx}
                      className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-700'}`}
                    >
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-600'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-24 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">
              Compare All Features
            </h2>
            <p className="text-slate-600">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-blue-50">
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Free</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-blue-600 bg-blue-50">Pro</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_COMPARISON.map((category, categoryIdx) => (
                    <React.Fragment key={categoryIdx}>
                      <tr className="bg-slate-50">
                        <td colSpan={4} className="px-6 py-3 text-sm font-bold text-slate-700 uppercase tracking-wide">
                          {category.category}
                        </td>
                      </tr>
                      {category.features.map((feature, featureIdx) => (
                        <tr key={featureIdx} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-700">{feature.name}</td>
                          <td className="px-6 py-4 text-center">
                            {typeof feature.free === 'boolean' ? (
                              feature.free ? (
                                <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-slate-300 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm text-slate-600">{feature.free}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center bg-blue-50/50">
                            {typeof feature.pro === 'boolean' ? (
                              feature.pro ? (
                                <Check className="w-5 h-5 text-blue-600 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-slate-300 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm font-medium text-blue-600">{feature.pro}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {typeof feature.enterprise === 'boolean' ? (
                              feature.enterprise ? (
                                <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-slate-300 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm text-slate-600">{feature.enterprise}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition-colors">
              <h3 className="font-bold mb-3 text-slate-900">Can I switch plans later?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Absolutely! Upgrade or downgrade anytime. Upgrades are immediate, downgrades take effect at the end of
                your billing cycle. No penalties, no hassle.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition-colors">
              <h3 className="font-bold mb-3 text-slate-900">What happens to my data?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Your data is always yours. If you downgrade, all your entries are preserved. You just won't be able to
                add more until you're within the new plan's limits.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition-colors">
              <h3 className="font-bold mb-3 text-slate-900">Do you offer refunds?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Yes! We offer a 30-day money-back guarantee, no questions asked. If TaxBridge isn't right for you,
                contact us within 30 days for a full refund.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition-colors">
              <h3 className="font-bold mb-3 text-slate-900">Is my data secure?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Bank-level security with AES-256 encryption. All data is encrypted in transit and at rest. We're SOC 2
                compliant and never sell your data.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition-colors">
              <h3 className="font-bold mb-3 text-slate-900">What payment methods do you accept?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                We accept all major credit cards (Visa, Mastercard, Amex) and debit cards through Stripe. Enterprise
                customers can also pay via ACH or wire transfer.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition-colors">
              <h3 className="font-bold mb-3 text-slate-900">Need help choosing?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Start with Free to try it out. Most individuals upgrade to Pro. If you're a CPA or accounting firm
                managing multiple clients, Enterprise is the best fit.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">
            Ready to simplify your cross-border taxes?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of H-1B and TN visa holders who trust TaxBridge for accurate tax calculations and
            Foreign Tax Credit optimization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/sign-up')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Start Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleUpgrade('pro', TIERS[1].priceId)}
              className="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-all border-2 border-blue-400 flex items-center justify-center gap-2"
            >
              Try Pro Free
              <Zap className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-blue-200 mt-6">
            No credit card required • 30-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
