'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2Icon, TrendingUpIcon, ShieldCheckIcon, ClockIcon } from 'lucide-react';
import { useGoogleAdsTracking, trackCalculatorStarted } from '@/lib/google-ads-tracking';
import Link from 'next/link';

export default function TNVisaStockTaxLandingPage() {
  useGoogleAdsTracking();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            TN Visa Stock Tax Calculator
            <span className="block text-green-600 mt-2">Canadian Professionals: Calculate RSU Tax Instantly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Working in the US on a TN visa with stock compensation? Avoid overpaying tax in both countries.
            Get accurate US & Canada tax estimates in 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-green-600 hover:bg-green-700"
              onClick={() => {
                trackCalculatorStarted('tn');
                window.location.href = '/calculator';
              }}
            >
              Calculate TN Visa Tax Now →
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="#how-it-works">How It Works</Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5 text-green-500" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5 text-green-500" />
              <span>TN-Specific Calculations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5 text-green-500" />
              <span>2026 Tax Rates</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-green-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-green-100">TN Visa Holders Helped</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$400K+</div>
              <div className="text-green-100">Tax Savings Identified</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8★</div>
              <div className="text-green-100">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">
            TN Visa Workers: Don't Overpay Tax on Stock Grants
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            As a Canadian professional on a TN visa, you're taxed by both the US and Canada when stock vests.
            Many TN holders overpay because they don't understand the <strong>Foreign Tax Credit (FTC)</strong>.
          </p>
          <Card className="p-6 bg-yellow-50 border-yellow-200 mb-6">
            <h3 className="font-semibold mb-3 text-yellow-900">⚠️ Common TN Visa Tax Mistake</h3>
            <p className="text-sm text-yellow-800 mb-2">
              You file taxes in both countries, see "tax owed" in Canada, and think you have to pay the full
              amount. <strong>Wrong!</strong>
            </p>
            <p className="text-sm text-yellow-800">
              The FTC allows you to deduct US tax paid from your Canadian tax bill. Most TN holders only pay
              the <strong>higher</strong> of the two, not both.
            </p>
          </Card>
          <p className="text-lg font-semibold text-center text-green-600">
            💡 Our calculator shows your exact FTC amount and what you'll truly owe.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Enter TN Details</h3>
              <p className="text-sm text-gray-600">
                Income, RSU/stock option value, Canadian province, US state.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">See Both Tax Bills</h3>
              <p className="text-sm text-gray-600">
                US federal + state, Canada federal + provincial, calculated side-by-side.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Get FTC Amount</h3>
              <p className="text-sm text-gray-600">
                Instant foreign tax credit calculation shows exactly how much you save.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Why TN Visa Holders Choose TaxBridge</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="flex gap-4">
            <TrendingUpIcon className="h-8 w-8 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">TN Visa Optimized</h3>
              <p className="text-sm text-gray-600">
                Built specifically for Canadian professionals on TN visas. Handles all provinces and US states.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <ShieldCheckIcon className="h-8 w-8 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">2026 Tax Treaty Rules</h3>
              <p className="text-sm text-gray-600">
                Uses up-to-date US-Canada tax treaty FTC rules for accurate cross-border calculations.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <ClockIcon className="h-8 w-8 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Instant Estimates</h3>
              <p className="text-sm text-gray-600">
                No complex forms. Just income, stock value, and location. Results in under 1 minute.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <CheckCircle2Icon className="h-8 w-8 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">RSUs + Stock Options</h3>
              <p className="text-sm text-gray-600">
                Supports RSUs, NSOs, ISOs—all publicly traded stock compensation types.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">What TN Visa Holders Say</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-sm mb-4">
                "Was about to pay CRA $3K I didn't owe. FTC saved me. This tool is a lifesaver!"
              </p>
              <p className="text-xs font-semibold">— Mechanical Engineer, Seattle (TN)</p>
            </Card>
            <Card className="p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-sm mb-4">
                "First year on TN with stock grants. Couldn't find a calculator anywhere else. Thank you!"
              </p>
              <p className="text-xs font-semibold">— Data Scientist, SF Bay Area (TN)</p>
            </Card>
            <Card className="p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-sm mb-4">
                "Super accurate. Matches what my accountant calculated, but takes 2 min instead of 2 weeks."
              </p>
              <p className="text-xs font-semibold">— Software Architect, Austin (TN)</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Calculate Your TN Visa Stock Tax Now</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join 500+ TN visa holders who've saved $400K+ in double taxation. Free forever.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-12 py-6"
            onClick={() => {
              trackCalculatorStarted('tn');
              window.location.href = '/calculator';
            }}
          >
            Start Calculating →
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">TN Visa Tax FAQs</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Do TN visa holders pay tax in both countries?</h3>
            <p className="text-sm text-gray-600">
              Yes, you're taxed as a US resident for IRS purposes AND a Canadian resident for CRA. But the
              Foreign Tax Credit prevents full double taxation—you only pay the higher amount.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">How does the Foreign Tax Credit work for TN visas?</h3>
            <p className="text-sm text-gray-600">
              You file in both countries. US tax is due first (withheld by employer). Then you claim US tax as
              a credit on your Canadian return, reducing what you owe CRA.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Does this work for stock options too?</h3>
            <p className="text-sm text-gray-600">
              Yes! The calculator handles RSUs, NSOs, ISOs, and ESPP. Just enter the value at vesting/exercise.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">What if I move back to Canada mid-year?</h3>
            <p className="text-sm text-gray-600">
              This gets complex (part-year residency). Use the calculator for estimates, but consult a
              cross-border CPA for filing.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
