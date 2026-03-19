'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2Icon, TrendingUpIcon, ShieldCheckIcon, ClockIcon } from 'lucide-react';
import { useGoogleAdsTracking, trackCalculatorStarted } from '@/lib/google-ads-tracking';
import Link from 'next/link';

export default function H1BRSUCalculatorLandingPage() {
  // Auto-track landing page view with UTM params
  useGoogleAdsTracking();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            H1B RSU Tax Calculator
            <span className="block text-blue-600 mt-2">Calculate Your Exact Tax in 2 Minutes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Avoid double taxation on your Meta, Amazon, or Google RSUs. Get accurate US & Canada tax
            estimates with automatic foreign tax credit calculation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => {
                trackCalculatorStarted('h1b');
                window.location.href = '/calculator';
              }}
            >
              Calculate My Tax Now →
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="#how-it-works">How It Works</Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5 text-green-500" />
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5 text-green-500" />
              <span>No Signup Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5 text-green-500" />
              <span>2026 Tax Year Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">2,000+</div>
              <div className="text-blue-100">H1B Workers Helped</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$1M+</div>
              <div className="text-blue-100">Tax Savings Identified</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9★</div>
              <div className="text-blue-100">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">
            H1B Workers Face Double Taxation on RSUs
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            If you're a Canadian resident working in the US on an H1B visa with RSUs, you're taxed by
            <strong> both countries</strong> when your stock vests. Without proper planning, you could pay:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card className="p-6 border-red-200 bg-red-50">
              <h3 className="font-semibold mb-2 text-red-900">🇺🇸 US Federal Tax</h3>
              <p className="text-sm text-red-700">22-37% on your RSU vesting value</p>
            </Card>
            <Card className="p-6 border-red-200 bg-red-50">
              <h3 className="font-semibold mb-2 text-red-900">🇨🇦 Canada Federal + Provincial</h3>
              <p className="text-sm text-red-700">26-54% on the same income</p>
            </Card>
          </div>
          <p className="text-lg font-semibold text-center text-blue-600">
            💡 Good news: The Foreign Tax Credit (FTC) prevents double taxation. Our calculator shows
            exactly how much you'll save.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Enter Your Info</h3>
              <p className="text-sm text-gray-600">
                Income, RSU vesting value, and residency status. Takes 30 seconds.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Get Instant Results</h3>
              <p className="text-sm text-gray-600">
                See US tax, Canada tax, and foreign tax credit calculated automatically.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Plan Your Taxes</h3>
              <p className="text-sm text-gray-600">
                Know exactly what you'll owe before your RSUs vest. No surprises.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Why 2,000+ H1B Workers Trust TaxBridge</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="flex gap-4">
            <TrendingUpIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Accurate FTC Calculation</h3>
              <p className="text-sm text-gray-600">
                Automatically calculates your foreign tax credit based on 2026 tax treaty rules.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <ClockIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">2-Minute Estimates</h3>
              <p className="text-sm text-gray-600">
                No complex forms. Just your income, RSU value, and state/province.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <ShieldCheckIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Big Tech Optimized</h3>
              <p className="text-sm text-gray-600">
                Works for Meta, Amazon, Google, Microsoft, Apple, Netflix, and all publicly traded RSUs.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <CheckCircle2Icon className="h-8 w-8 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">100% Free Forever</h3>
              <p className="text-sm text-gray-600">
                No credit card. No signup. Just instant, accurate tax estimates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">What H1B Workers Are Saying</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-sm mb-4">
                "Saved me $1,200 in unexpected Canadian tax. Wish I'd found this before my first vesting!"
              </p>
              <p className="text-xs font-semibold">— SWE at Meta, Vancouver</p>
            </Card>
            <Card className="p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-sm mb-4">
                "Finally understand how FTC works. Way better than paying an accountant $300 for estimates."
              </p>
              <p className="text-xs font-semibold">— PM at Amazon, Toronto</p>
            </Card>
            <Card className="p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-sm mb-4">
                "Super fast and accurate. Helped me plan for 4 vesting events in 2026."
              </p>
              <p className="text-xs font-semibold">— MLE at Google, Waterloo</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Calculate Your H1B RSU Tax?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join 2,000+ H1B workers who've saved $1M+ in double taxation. 100% free, no signup required.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-12 py-6"
            onClick={() => {
              trackCalculatorStarted('h1b');
              window.location.href = '/calculator';
            }}
          >
            Start Calculating Now →
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Do I really get taxed twice on RSUs?</h3>
            <p className="text-sm text-gray-600">
              Yes, but the Foreign Tax Credit (FTC) prevents most double taxation. You'll pay the higher of
              US or Canada tax, not both in full.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Is this calculator accurate?</h3>
            <p className="text-sm text-gray-600">
              Yes. We use official 2026 IRS and CRA tax brackets, plus the US-Canada tax treaty FTC rules.
              However, this is an estimate—consult a CPA for filing.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">What if my RSUs are from a private company?</h3>
            <p className="text-sm text-gray-600">
              This calculator works for publicly traded companies (Meta, Amazon, Google, etc.). Private RSUs
              have different valuation rules.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Do I need to sign up?</h3>
            <p className="text-sm text-gray-600">
              Nope! The calculator is 100% free with no signup. For advanced features like multi-year
              tracking, we offer a $49/year Pro plan.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
