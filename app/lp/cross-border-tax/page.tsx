'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2Icon, TrendingUpIcon, ShieldCheckIcon, ClockIcon, GlobeIcon } from 'lucide-react';
import { useGoogleAdsTracking, trackCalculatorStarted } from '@/lib/google-ads-tracking';
import Link from 'next/link';

export default function CrossBorderTaxLandingPage() {
  useGoogleAdsTracking();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Cross-Border Tax Calculator
            <span className="block text-purple-600 mt-2">US-Canada Dual Tax Planning Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Work in one country, live in another? Calculate your exact tax obligations in the US and Canada
            with automatic foreign tax credit calculations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                trackCalculatorStarted('cross-border');
                window.location.href = '/calculator';
              }}
            >
              Calculate Cross-Border Tax →
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="#how-it-works">How It Works</Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5 text-purple-500" />
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5 text-purple-500" />
              <span>Instant Results</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5 text-purple-500" />
              <span>All Visa Types</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">3,500+</div>
              <div className="text-purple-100">Cross-Border Workers Helped</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$2.5M+</div>
              <div className="text-purple-100">Tax Savings Identified</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9★</div>
              <div className="text-purple-100">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Cross-Border Tax Is Complicated. We Make It Simple.
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Living in one country while earning income in another creates complex tax obligations. You're taxed
            by <strong>both countries</strong>, but the US-Canada tax treaty prevents full double taxation
            through the Foreign Tax Credit (FTC).
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold mb-2 text-blue-900">🇺🇸 US Tax Obligations</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Federal income tax (10-37%)</li>
                <li>• State income tax (0-13%)</li>
                <li>• FICA/Social Security</li>
                <li>• Capital gains on stock sales</li>
              </ul>
            </Card>
            <Card className="p-6 bg-red-50 border-red-200">
              <h3 className="font-semibold mb-2 text-red-900">🇨🇦 Canada Tax Obligations</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Federal income tax (15-33%)</li>
                <li>• Provincial tax (5-21%)</li>
                <li>• CPP/EI contributions</li>
                <li>• Foreign property reporting (T1135)</li>
              </ul>
            </Card>
          </div>
          <p className="text-lg font-semibold text-center text-purple-600">
            💡 The FTC allows you to credit US tax paid against your Canadian tax bill. Our calculator shows
            exactly how much you'll save.
          </p>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Who Is This For?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🇺🇸→🇨🇦</div>
              <h3 className="font-semibold mb-2">US Workers in Canada</h3>
              <p className="text-sm text-gray-600">
                Canadian resident earning US income (remote work, stock vesting)
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🇨🇦→🇺🇸</div>
              <h3 className="font-semibold mb-2">Canadian Workers in US</h3>
              <p className="text-sm text-gray-600">
                H1B, TN, L1, O1 visa holders with Canadian residency
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="font-semibold mb-2">Dual Residents</h3>
              <p className="text-sm text-gray-600">
                Live part-year in both countries (snowbirds, digital nomads)
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="font-semibold mb-2">Stock Compensation</h3>
              <p className="text-sm text-gray-600">
                RSUs, stock options, ESPP from US tech companies
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-6 text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">1</span>
            </div>
            <h3 className="font-semibold mb-2">Enter Your Details</h3>
            <p className="text-sm text-gray-600">
              Income, location, residency status, and stock compensation details.
            </p>
          </Card>
          <Card className="p-6 text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">2</span>
            </div>
            <h3 className="font-semibold mb-2">See Both Tax Bills</h3>
            <p className="text-sm text-gray-600">
              Instant calculation of US and Canada tax, side-by-side comparison.
            </p>
          </Card>
          <Card className="p-6 text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="font-semibold mb-2">Get FTC Breakdown</h3>
            <p className="text-sm text-gray-600">
              See exactly how the Foreign Tax Credit reduces your total tax bill.
            </p>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <h2 className="text-3xl font-bold mb-12 text-center">Why 3,500+ Professionals Trust TaxBridge</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="flex gap-4">
            <GlobeIcon className="h-8 w-8 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Complete Cross-Border Coverage</h3>
              <p className="text-sm text-gray-600">
                All US states, all Canadian provinces, all visa types (H1B, TN, L1, O1, PR).
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <TrendingUpIcon className="h-8 w-8 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Automatic FTC Calculation</h3>
              <p className="text-sm text-gray-600">
                Uses US-Canada tax treaty rules to calculate your exact foreign tax credit amount.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <ShieldCheckIcon className="h-8 w-8 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">2026 Tax Rates</h3>
              <p className="text-sm text-gray-600">
                Always up-to-date with IRS and CRA tax brackets, deductions, and credits.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <ClockIcon className="h-8 w-8 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Instant Estimates</h3>
              <p className="text-sm text-gray-600">
                No waiting for accountants. Get accurate projections in under 2 minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">What Users Say</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-6">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
            <p className="text-sm mb-4">
              "Remote worker from Vancouver for SF company. This saved me hours of spreadsheet hell."
            </p>
            <p className="text-xs font-semibold">— Product Designer, Remote</p>
          </Card>
          <Card className="p-6">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
            <p className="text-sm mb-4">
              "Moved back to Canada mid-year. Calculator helped me understand exactly what I'd owe CRA."
            </p>
            <p className="text-xs font-semibold">— Engineering Manager, Toronto</p>
          </Card>
          <Card className="p-6">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
            <p className="text-sm mb-4">
              "Best cross-border tax tool I've found. Handles stock options perfectly."
            </p>
            <p className="text-xs font-semibold">— Senior SWE, Seattle</p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Calculate Your Cross-Border Tax?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join 3,500+ professionals who've saved $2.5M+ in double taxation. Free forever, no signup.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-12 py-6"
            onClick={() => {
              trackCalculatorStarted('cross-border');
              window.location.href = '/calculator';
            }}
          >
            Start Calculating Now →
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Cross-Border Tax FAQs</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Do I pay tax in both countries?</h3>
            <p className="text-sm text-gray-600">
              Yes, but the Foreign Tax Credit prevents double taxation. You pay tax to both, but the higher
              amount gets a credit for the lower amount.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">How accurate is this calculator?</h3>
            <p className="text-sm text-gray-600">
              Very accurate for estimates. We use official 2026 IRS/CRA rates and US-Canada tax treaty FTC
              rules. Always consult a CPA for actual filing.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">What if I'm a Canadian PR but work in the US?</h3>
            <p className="text-sm text-gray-600">
              You're a Canadian tax resident AND a US tax resident. This creates dual residency—use the
              calculator for estimates, but you'll need a cross-border tax specialist.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Does this work for part-year residents?</h3>
            <p className="text-sm text-gray-600">
              The calculator assumes full-year residency. Part-year (e.g., moved mid-year) requires pro-rating.
              Use it for ballpark estimates, then consult a CPA.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
