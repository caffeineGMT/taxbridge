/**
 * Optimized Pricing Page with Conversion Features
 * - Social proof with dynamic user count
 * - Testimonials with placeholder images
 * - Trust badges (SSL, SOC2, CPA-reviewed)
 * - Countdown timer with urgency
 * - FAQ accordion (10 questions)
 * - Sticky CTA bar on scroll
 * - Price anchoring (monthly equivalent + strikethrough)
 * - Dynamic CAD pricing for Canadian IPs
 * - PostHog A/B testing integration
 * - Exit-intent popup with discount
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Check, X, Loader2, Shield, Zap, Users, ArrowRight, Lock, CheckCircle,
  Award, TrendingUp, Clock, XCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics/posthog';
import { useCTAVariant, useTrackCTAClick } from '@/hooks/use-ab-testing';
import { UrgencyMessage, StickyUrgencyBanner } from '@/components/UrgencyMessage';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import { usePricingExperiment, isInProductHuntCohort } from '@/hooks/use-pricing-experiment';
import { BillingIntervalToggle } from '@/components/BillingIntervalToggle';
import { useConversionExperiments } from '@/hooks/use-conversion-experiments';
import { SocialProofSection } from '@/components/SocialProofSection';

// Generate tiers dynamically based on pricing experiment and conversion experiments
const getTiers = (
  pricingExperiment: ReturnType<typeof usePricingExperiment>,
  freeTierConfig: {
    maxRSUEntries: number | 'unlimited';
    label: string;
    urgencyMessage?: string;
    gatedFeatures?: {
      pdfExport: boolean;
      aiAdvisor: boolean;
      csvImport: boolean;
      multiYear: boolean;
      prioritySupport: boolean;
    };
  }
) => {
    const isAnnual = pricingExperiment.selectedInterval === 'annual';
    const proPrice = isAnnual ? pricingExperiment.annualPrice : pricingExperiment.monthlyPrice;
    const proPriceId = pricingExperiment.getCurrentPriceId();
    const monthlyEquivalent = isAnnual ? proPrice / 12 : null;

    return [
      {
        name: 'Free',
        price: 0,
        priceId: null,
        tier: 'free',
        tagline: freeTierConfig.urgencyMessage || 'Perfect for getting started',
        features: {
          rsuEntries: freeTierConfig.label,
          taxCalculation: true,
          formsChecklist: true,
          usdCadConversion: true,
          ftcOptimizer: false,
          pdfExport: false,
          aiAdvisor: false,
          prioritySupport: false,
          csvImport: false,
          apiAccess: false,
          clientDashboard: false,
          whiteLabel: false,
        },
        cta: 'Get Started Free',
        highlighted: false,
      },
      {
        name: 'Pro',
        price: proPrice,
        regularPrice: isAnnual && pricingExperiment.variant === 'annual_29' ? 79 :
                      isAnnual && pricingExperiment.variant === 'annual_49' ? 99 : undefined,
        monthlyEquivalent,
        annual: isAnnual,
        priceId: proPriceId,
        tier: 'pro',
        tagline: isAnnual && pricingExperiment.variant === 'annual_29'
          ? '🔥 COMPETITOR MATCH: SimpleTax/Sprintax pricing - Limited time!'
          : isAnnual && pricingExperiment.variant === 'annual_49'
          ? '⚡ SMART CHOICE: Best value for cross-border tax compliance'
          : isAnnual && pricingExperiment.variant === 'annual_79'
          ? '💎 PREMIUM: Professional-grade tax optimization & support'
          : 'Flexible month-to-month billing',
        badge: '⭐ Recommended',
        features: {
          rsuEntries: 'Unlimited RSU entries',
          taxCalculation: true,
          formsChecklist: true,
          usdCadConversion: true,
          ftcOptimizer: true,
          pdfExport: true,
          aiAdvisor: true,
          prioritySupport: true,
          csvImport: true,
          apiAccess: false,
          clientDashboard: false,
          whiteLabel: false,
        },
        cta: 'Start 14-Day Free Trial',
        highlighted: true,
        savings: isAnnual && pricingExperiment.variant === 'annual_29'
          ? 'Save $50 vs competitors — Market-leading pricing expires April 15'
          : isAnnual && pricingExperiment.variant === 'annual_49'
          ? 'Save vs monthly — Smart tax planning under $4/month'
          : isAnnual && pricingExperiment.variant === 'annual_79'
          ? `Premium value — Includes priority CPA support worth $200`
          : null,
      },
      {
        name: 'Enterprise',
        price: 2000,
        monthlyEquivalent: 166.67,
        annual: true,
        priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_1EntAnnual',
        tier: 'enterprise',
        tagline: 'For CPAs and accounting firms',
        urgencyBadge: 'Only 3 spots left at this price',
        features: {
          rsuEntries: 'Unlimited RSU entries',
          taxCalculation: true,
          formsChecklist: true,
          usdCadConversion: true,
          ftcOptimizer: true,
          pdfExport: true,
          aiAdvisor: true,
          prioritySupport: true,
          csvImport: true,
          apiAccess: true,
          clientDashboard: true,
          whiteLabel: true,
        },
        cta: 'Contact Sales',
        highlighted: false,
        customFeatures: ['Dedicated account manager', 'White-label reports', 'API access'],
      },
    ];
  };

// FAQ data
const FAQ_ITEMS = [
  {
    question: 'Can I switch between plans?',
    answer: 'Absolutely! Upgrade or downgrade anytime. Upgrades are immediate, downgrades take effect at the end of your billing cycle. No penalties, no hassle.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes! We offer a 30-day money-back guarantee, no questions asked. If TaxBridge isn\'t right for you, contact us within 30 days for a full refund.',
  },
  {
    question: 'Is my financial data secure?',
    answer: 'Bank-level security with AES-256 encryption. All data is encrypted in transit and at rest. We\'re SOC 2 Type II compliant and never sell your data.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover) and debit cards through Stripe. Enterprise customers can also pay via ACH or wire transfer.',
  },
  {
    question: 'What happens to my data if I downgrade?',
    answer: 'Your data is always yours. If you downgrade, all your entries are preserved. You just won\'t be able to add more until you\'re within the new plan\'s limits.',
  },
  {
    question: 'How does the 7-day free trial work?',
    answer: 'Start your Pro trial with no credit card required. After 7 days, choose to subscribe or continue with the Free plan. No automatic charges.',
  },
  {
    question: 'Can I use TaxBridge for multiple tax years?',
    answer: 'Yes! Pro and Enterprise plans include multi-year tracking and FTC carryforward calculations. Perfect for managing historical RSU income.',
  },
  {
    question: 'Do you support other visa types?',
    answer: 'Currently optimized for H-1B and TN visa holders. We\'re adding support for L-1, O-1, and other visa categories. Contact us for custom requirements.',
  },
  {
    question: 'What makes TaxBridge different from TurboTax?',
    answer: 'TaxBridge specializes in US-Canada cross-border RSU taxation with Treaty Article XV compliance, FTC optimization, and dual-country calculations—something general tax software doesn\'t handle well.',
  },
  {
    question: 'Can my CPA use TaxBridge?',
    answer: 'Absolutely! Many CPAs use TaxBridge Enterprise for client management. Export professional PDF reports to share with your accountant.',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [userCount, setUserCount] = useState(500);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 48, minutes: 0, seconds: 0 });
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isCanadian, setIsCanadian] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(1.35);

  // A/B Testing: Get CTA variant
  const ctaVariant = useCTAVariant();
  const trackCTAClick = useTrackCTAClick(ctaVariant);

  // Pricing Experiment: Get pricing variant and billing interval
  const pricingExperiment = usePricingExperiment();
  const isProductHunt = isInProductHuntCohort();

  // Conversion Experiments: Get headline, free tier, and social proof variants
  const conversionExperiments = useConversionExperiments();

  // Track pricing page view with PostHog and experiment exposure
  useEffect(() => {
    trackEvent('pricing_page_viewed', {
      page: '/pricing',
      funnelStep: 'Pricing',
      funnelStepNumber: 2,
      pricingVariant: pricingExperiment.variant,
      annualPrice: pricingExperiment.annualPrice,
      isProductHunt,
      // Conversion experiments
      headline_variant: conversionExperiments.headline.variant,
      free_tier_variant: conversionExperiments.freeTier.variant,
      social_proof_variant: conversionExperiments.socialProof.variant,
    });

    // Track experiment exposure
    pricingExperiment.trackVariantExposure();
    conversionExperiments.trackExperimentExposure();
  }, [pricingExperiment, isProductHunt, conversionExperiments]);

  // Fetch user count for social proof
  useEffect(() => {
    fetch('/api/stats/users')
      .then((res) => res.json())
      .then((data) => setUserCount(data.displayCount))
      .catch(() => setUserCount(500));
  }, []);

  // Detect location and set pricing currency
  useEffect(() => {
    // In production, use Vercel's geolocation headers
    // For now, we'll use a simple heuristic
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const canadian = data.country_code === 'CA';
        setIsCanadian(canadian);

        if (canadian) {
          // Fetch current exchange rate
          const rateResponse = await fetch('/api/exchange-rate?date=' + new Date().toISOString().split('T')[0]);
          const rateData = await rateResponse.json();
          setExchangeRate(rateData.rate || 1.35);
        }
      } catch (error) {
        console.error('Error detecting location:', error);
      }
    };

    detectLocation();
  }, []);

  // Countdown timer for urgency
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + 48);
    const targetTime = targetDate.getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeRemaining({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Sticky CTA bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCta(window.scrollY > 800);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Exit-intent popup (fixed to prevent repeated firing)
  useEffect(() => {
    // Check if user has already seen the exit popup in the last 24 hours
    const exitPopupShown = localStorage.getItem('exitPopupShown');
    const lastShown = exitPopupShown ? parseInt(exitPopupShown, 10) : 0;
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (now - lastShown < twentyFourHours) {
      return; // Don't show popup if already shown in last 24 hours
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10 && !showExitPopup) {
        setShowExitPopup(true);
        localStorage.setItem('exitPopupShown', now.toString());
        trackEvent('page_viewed', {
          page: '/pricing',
          dropOff: true,
          dropOffReason: 'exit_intent_triggered',
          funnelStep: 'Pricing',
        });
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [showExitPopup]);

  // Handle upgrade success/cancel from URL params
  useEffect(() => {
    const upgrade = searchParams.get('upgrade');

    if (upgrade === 'success') {
      toast({
        title: 'Subscription activated!',
        description: 'Welcome to TaxBridge Pro! Your account has been upgraded.',
        duration: 5000,
      });
      router.replace('/pricing');
    } else if (upgrade === 'cancelled') {
      toast({
        title: 'Upgrade cancelled',
        description: 'No charges were made. You can upgrade anytime.',
        variant: 'destructive',
        duration: 5000,
      });
      router.replace('/pricing');
    }
  }, [searchParams, router]);

  const handleUpgrade = async (tier: string, priceId: string | null) => {
    // Track tier selection with A/B test variant and pricing experiment
    trackCTAClick(tier);

    const trackingData = {
      plan: tier,
      funnelStep: 'Tier Selection',
      funnelStepNumber: 3,
      ctaVariant: ctaVariant.variant,
      ctaText: ctaVariant.text,
      pricingVariant: pricingExperiment.variant,
      billingInterval: pricingExperiment.selectedInterval,
      price: tier === 'pro' ? pricingExperiment.getCurrentPrice() : undefined,
      isProductHunt,
      // Conversion experiments
      headline_variant: conversionExperiments.headline.variant,
      free_tier_variant: conversionExperiments.freeTier.variant,
      social_proof_variant: conversionExperiments.socialProof.variant,
    };

    trackEvent('pricing_tier_selected', trackingData);

    // Track price selection for experiment
    if (tier === 'pro') {
      pricingExperiment.trackPriceSelected(
        pricingExperiment.selectedInterval,
        pricingExperiment.getCurrentPrice()
      );
    }

    if (!priceId) {
      if (tier === 'free') {
        // Track signup conversion for experiments
        conversionExperiments.trackConversion('signup');
        router.push('/sign-up');
      } else if (tier === 'enterprise') {
        window.location.href = 'mailto:sales@taxbridge.com?subject=Enterprise Plan Inquiry';
      }
      return;
    }

    setLoadingTier(tier);

    // Track checkout started
    trackEvent('checkout_started', {
      plan: tier,
      funnelStep: 'Checkout',
      funnelStepNumber: 6,
    });

    // Track checkout conversion for experiments
    conversionExperiments.trackConversion('checkout');

    // Get current price for the tier
    const currentPrice = tier === 'pro' ? pricingExperiment.getCurrentPrice() : 2000;

    // Route to unified checkout page with A/B test variants
    const checkoutUrl = new URL('/checkout', window.location.origin);
    checkoutUrl.searchParams.set('tier', tier);
    checkoutUrl.searchParams.set('priceId', priceId);
    checkoutUrl.searchParams.set('price', currentPrice.toString());
    checkoutUrl.searchParams.set('interval', pricingExperiment.selectedInterval);

    router.push(checkoutUrl.pathname + checkoutUrl.search);
    setLoadingTier(null);
  };

  const formatPrice = (usdPrice: number) => {
    if (isCanadian) {
      const cadPrice = Math.round(usdPrice * exchangeRate);
      return { amount: cadPrice, currency: 'CAD', symbol: 'C$' };
    }
    return { amount: usdPrice, currency: 'USD', symbol: '$' };
  };

  // Compute tiers based on experiment variants
  const TIERS = getTiers(pricingExperiment, conversionExperiments.freeTier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50">
      {/* Sticky Urgency Banner */}
      <StickyUrgencyBanner />

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
            onClick={() => router.push('/dashboard')}
            className="text-sm text-slate-300 hover:text-white font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Sticky CTA Bar */}
      {showStickyCta && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 px-6 shadow-2xl z-50 transform transition-transform duration-300">
          <div className="container mx-auto flex items-center justify-between">
            <span className="font-bold text-lg">Start your 7-day free trial →</span>
            <button
              onClick={() => handleUpgrade('pro', TIERS[1].priceId)}
              className="bg-white text-emerald-600 px-6 py-2 rounded-lg font-bold hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Exit-Intent Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md shadow-2xl border border-slate-700 relative">
            <button
              onClick={() => setShowExitPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold mb-4 text-white">Wait! Don't miss out</h3>
            <p className="text-slate-300 mb-6">
              Use code <span className="font-mono bg-emerald-600 px-2 py-1 rounded text-white font-bold">LAUNCH2026</span> for 20% off your first year
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText('LAUNCH2026');
                  toast({ title: 'Discount code copied!' });
                  setShowExitPopup(false);
                }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-lg font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all"
              >
                Copy Code
              </button>
              <button
                onClick={() => setShowExitPopup(false)}
                className="flex-1 bg-slate-700 text-slate-300 px-6 py-3 rounded-lg font-medium hover:bg-slate-600 transition-colors"
              >
                No Thanks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 px-6 rounded-lg mb-8 flex items-center justify-center gap-3 shadow-lg max-w-2xl mx-auto">
          <Clock className="w-5 h-5" />
          <span className="font-bold">Limited time: Save 20% with code LAUNCH2026</span>
          <span className="bg-white/20 px-3 py-1 rounded font-mono">
            {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
          </span>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-transparent bg-clip-text">
            {conversionExperiments.headline.title}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            {conversionExperiments.headline.subtitle}
          </p>

          {/* Billing Interval Toggle */}
          {!pricingExperiment.isLoading && (
            <BillingIntervalToggle
              selected={pricingExperiment.selectedInterval}
              onSelect={pricingExperiment.setSelectedInterval}
              annualPrice={pricingExperiment.annualPrice}
              monthlyPrice={pricingExperiment.monthlyPrice}
              className="mb-8"
            />
          )}

          {/* Product Hunt Badge */}
          {isProductHunt && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg mb-4">
              🚀 Product Hunt Special: 20% OFF with code HUNT20
            </div>
          )}
        </div>

        {/* Social Proof: Above Fold (A/B Test Variant) */}
        {conversionExperiments.socialProof.layout === 'above_fold' && (
          <SocialProofSection
            variant="above_fold"
            showTestimonials={conversionExperiments.socialProof.showTestimonials}
            showTrustBadges={conversionExperiments.socialProof.showTrustBadges}
            showUserCount={conversionExperiments.socialProof.showUserCount}
          />
        )}

        {/* Pricing Cards */}
        <div className={`grid ${conversionExperiments.socialProof.layout === 'sidebar' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-8 max-w-7xl mx-auto mb-20`}>
          {TIERS.map((tier) => {
            const pricing = formatPrice(tier.price);
            const regularPricing = tier.regularPrice ? formatPrice(tier.regularPrice) : null;
            const monthlyPricing = tier.monthlyEquivalent ? formatPrice(tier.monthlyEquivalent) : null;

            return (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 transition-all duration-300 ${
                  tier.highlighted
                    ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-2xl scale-105 border-2 border-emerald-400'
                    : 'bg-slate-800 border-2 border-slate-700 hover:border-emerald-500 hover:shadow-xl'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg uppercase tracking-wide">
                      {tier.badge}
                    </span>
                  </div>
                )}

                {tier.urgencyBadge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                      {tier.urgencyBadge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${tier.highlighted ? 'text-white' : 'text-slate-100'}`}>
                    {tier.name}
                  </h3>
                  <p className={`text-sm mb-6 ${tier.highlighted ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {tier.tagline}
                  </p>
                  <div className="flex items-baseline gap-2 mb-2">
                    {regularPricing && (
                      <span className="text-2xl line-through text-slate-400">
                        {pricing.symbol}{regularPricing.amount}
                      </span>
                    )}
                    <span className={`text-5xl font-bold ${tier.highlighted ? 'text-white' : 'text-emerald-400'}`}>
                      {pricing.symbol}{pricing.amount.toLocaleString()}
                    </span>
                    {tier.annual && (
                      <span className={tier.highlighted ? 'text-emerald-100' : 'text-slate-400'}>/year</span>
                    )}
                  </div>
                  {monthlyPricing && (
                    <p className={`text-sm ${tier.highlighted ? 'text-emerald-200' : 'text-slate-400'}`}>
                      {pricing.symbol}{monthlyPricing.amount.toFixed(2)}/month billed annually
                    </p>
                  )}
                  {tier.savings && (
                    <p className={`text-sm mt-2 ${tier.highlighted ? 'text-amber-300' : 'text-amber-400'} font-bold`}>
                      {tier.savings}
                    </p>
                  )}
                </div>

                {/* Urgency Messages */}
                <div className="mb-6 space-y-3">
                  {tier.tier === 'pro' && (
                    <>
                      <UrgencyMessage type="time-limited" tier="pro" />
                      <UrgencyMessage type="social-proof" tier="pro" />
                      <UrgencyMessage type="fomo" tier="pro" />
                    </>
                  )}
                  {tier.tier === 'enterprise' && (
                    <>
                      <UrgencyMessage type="stock-scarcity" tier="enterprise" />
                      <UrgencyMessage type="fomo" tier="enterprise" />
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleUpgrade(tier.tier, tier.priceId)}
                  disabled={loadingTier === tier.tier}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 mb-8 flex items-center justify-center gap-2 ${
                    tier.highlighted
                      ? 'bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg hover:shadow-xl disabled:opacity-50'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-md hover:shadow-lg disabled:opacity-50'
                  }`}
                >
                  {loadingTier === tier.tier ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {tier.tier === 'pro' ? ctaVariant.text : tier.cta}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {tier.tier === 'pro' && ctaVariant.subtext && (
                  <p className="text-xs text-center text-emerald-200 mb-4 -mt-4">
                    {ctaVariant.subtext}
                  </p>
                )}

                <div className="space-y-4">
                  <p className={`text-xs font-bold uppercase tracking-wide ${tier.highlighted ? 'text-emerald-200' : 'text-slate-500'}`}>
                    What's Included:
                  </p>
                  <ul className="space-y-3">
                    <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-300'}`}>
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-500'}`} />
                      <span>{tier.features.rsuEntries}</span>
                    </li>
                    {tier.features.taxCalculation && (
                      <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-300'}`}>
                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-500'}`} />
                        <span>Dual US/Canada tax calculation</span>
                      </li>
                    )}
                    {tier.features.formsChecklist && (
                      <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-300'}`}>
                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-500'}`} />
                        <span>Required forms checklist</span>
                      </li>
                    )}
                    {tier.features.ftcOptimizer && (
                      <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-300'}`}>
                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-500'}`} />
                        <span>Foreign Tax Credit optimizer</span>
                      </li>
                    )}
                    {tier.features.pdfExport && (
                      <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-300'}`}>
                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-500'}`} />
                        <span>PDF export & professional reports</span>
                      </li>
                    )}
                    {tier.features.aiAdvisor && (
                      <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-300'}`}>
                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-500'}`} />
                        <span>AI tax advisor</span>
                      </li>
                    )}
                    {tier.features.prioritySupport && (
                      <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-300'}`}>
                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-500'}`} />
                        <span>Priority support (12hr response)</span>
                      </li>
                    )}
                    {tier.features.csvImport && (
                      <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-300'}`}>
                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-500'}`} />
                        <span>CSV bulk import</span>
                      </li>
                    )}
                    {tier.features.apiAccess && (
                      <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-300'}`}>
                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-500'}`} />
                        <span>API access</span>
                      </li>
                    )}
                    {tier.features.clientDashboard && (
                      <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-300'}`}>
                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-500'}`} />
                        <span>Multi-client dashboard</span>
                      </li>
                    )}
                    {tier.features.whiteLabel && (
                      <li className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-300'}`}>
                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-500'}`} />
                        <span>White-label reports</span>
                      </li>
                    )}
                    {tier.customFeatures?.map((feature, idx) => (
                      <li
                        key={idx}
                        className={`flex items-start gap-3 text-sm ${tier.highlighted ? 'text-white' : 'text-slate-300'}`}
                      >
                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-300' : 'text-emerald-500'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}

          {/* Social Proof: Sidebar (A/B Test Variant) */}
          {conversionExperiments.socialProof.layout === 'sidebar' && (
            <div className="lg:row-span-3">
              <SocialProofSection
                variant="sidebar"
                showTestimonials={conversionExperiments.socialProof.showTestimonials}
                showTrustBadges={conversionExperiments.socialProof.showTrustBadges}
                showUserCount={conversionExperiments.socialProof.showUserCount}
              />
            </div>
          )}
        </div>

        {/* Social Proof: Below Pricing (A/B Test Variant) */}
        {conversionExperiments.socialProof.layout === 'below_pricing' && (
          <SocialProofSection
            variant="below_pricing"
            showTestimonials={conversionExperiments.socialProof.showTestimonials}
            showTrustBadges={conversionExperiments.socialProof.showTrustBadges}
            showUserCount={conversionExperiments.socialProof.showUserCount}
          />
        )}

        {/* Testimonials (shown for all non-sidebar variants) */}
        {conversionExperiments.socialProof.layout !== 'sidebar' && conversionExperiments.socialProof.layout !== 'below_pricing' && (
          <div className="max-w-6xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              Real Results from Beta Users
            </h2>
            <TestimonialCarousel variant="default" limit={5} autoRotate={false} />
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-emerald-500 transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-bold text-white">{faq.question}</span>
                  {openFaqIndex === idx ? (
                    <ChevronUp className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                {openFaqIndex === idx && (
                  <div className="px-6 pb-4">
                    <p className="text-slate-300 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-24 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">
            Ready to simplify your cross-border taxes?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join {userCount.toLocaleString()}+ H-1B and TN visa holders who trust TaxBridge for accurate tax calculations and
            Foreign Tax Credit optimization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/sign-up')}
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Start Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleUpgrade('pro', TIERS[1].priceId)}
              className="bg-emerald-800 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-900 transition-all border-2 border-emerald-400 flex items-center justify-center gap-2"
            >
              Try Pro Free (7 Days)
              <Zap className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-emerald-200 mt-6">
            No credit card required • 30-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
