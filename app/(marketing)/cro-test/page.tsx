/**
 * CRO Test Landing Page - March 2026
 *
 * FOCUSED TEST VERSION
 * Clean landing page running ONLY the CRO test (no other experiments)
 * Use this for maximum statistical power and faster results
 *
 * Test: 2 Headlines × 2 CTAs = 4 variants
 * Duration: 2 weeks (March 19 - April 2, 2026)
 * Target: 1000+ visitors per variant
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Calculator, TrendingUp, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import { useCROTest } from '@/hooks/use-cro-test-march-2026';
import { presetSchemas } from '@/lib/seo/structured-data';

export default function CROTestLandingPage() {
  const {
    variant,
    isLoading,
    headline,
    subheadline,
    primaryCTA,
    primaryColor,
    trackPageView,
    trackCTAClick,
  } = useCROTest();

  // Track page view when test loads
  useEffect(() => {
    if (!isLoading) {
      trackPageView();
    }
  }, [isLoading, trackPageView]);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TaxBridge',
    url: 'https://taxbridge.app',
    logo: 'https://taxbridge.app/logo.png',
    description:
      'US-Canada cross-border tax calculator for H-1B and TN visa tech workers with RSU income.',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@taxbridge.app',
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(presetSchemas.calculator) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px),
              repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px)
            `,
          }}
        />

        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center space-x-2">
              <div className="text-xl sm:text-2xl font-bold text-emerald-500">TaxBridge</div>
            </div>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link href="#features" className="text-slate-300 hover:text-emerald-400 transition-colors">
                Features
              </Link>
              <Link href="/dashboard" className="text-slate-300 hover:text-emerald-400 transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>
        </header>

        <main className="relative">
          {/* Hero Section - CRO Test */}
          <section className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16 md:pt-32 md:pb-24">
            <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
              {/* A/B Test: Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-slate-100 leading-tight px-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                  {headline}
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto px-4">
                {subheadline}
              </p>

              {/* A/B Test: CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center pt-4 px-4">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    onClick={() => trackCTAClick('/dashboard')}
                    className={`w-full sm:w-auto group touch-manipulation ${primaryColor} text-white font-semibold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 transition-all hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20`}
                  >
                    {primaryCTA}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#features" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto touch-manipulation border-slate-700 hover:border-emerald-500 hover:bg-slate-800 text-slate-100 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 transition-all"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Trust Signals */}
              <p className="text-sm text-slate-400">
                ✓ Free calculator • ✓ No credit card required • ✓ CPA-verified
              </p>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 text-center mb-8 sm:mb-12">
                Everything You Need
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Feature 1 */}
                <Card className="group border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
                  <CardHeader className="px-4 sm:px-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Calculator className="h-6 w-6 text-slate-950" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-slate-100">RSU Calculator</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-slate-400 leading-relaxed">
                      Track vesting events with automatic FMV calculation. Enter date, shares, and employer
                      for instant valuation.
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Feature 2 */}
                <Card className="group border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                  <CardHeader className="px-4 sm:px-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <TrendingUp className="h-6 w-6 text-slate-950" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-slate-100">Tax Optimizer</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-slate-400 leading-relaxed">
                      Calculate US and Canada tax on RSU income. Foreign Tax Credit optimizer eliminates
                      double taxation.
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Feature 3 */}
                <Card className="group border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10">
                  <CardHeader className="px-4 sm:px-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileText className="h-6 w-6 text-slate-950" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-slate-100">Forms Checklist</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-slate-400 leading-relaxed">
                      Complete checklist for required forms: W-2, 1040, T1, FBAR, Form 8938, and Treaty
                      Article XV.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-4">
                  Trusted by Tech Workers
                </h2>
                <p className="text-base sm:text-lg text-slate-400">
                  Real results from users who saved thousands
                </p>
              </div>

              <TestimonialCarousel variant="default" limit={3} autoRotate={false} />
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
            <div className="max-w-4xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 p-8 sm:p-12 text-center">
                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                    Ready to Optimize Your Taxes?
                  </h2>
                  <p className="text-base sm:text-lg text-emerald-50 mb-6 sm:mb-8 max-w-2xl mx-auto">
                    Join tech workers who trust TaxBridge for accurate cross-border tax calculations.
                  </p>
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      onClick={() => trackCTAClick('/dashboard')}
                      className="w-full sm:w-auto bg-white hover:bg-slate-100 text-emerald-600 font-semibold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 transition-all hover:scale-105"
                    >
                      {primaryCTA}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-950/50">
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
              <div className="col-span-2 md:col-span-1">
                <div className="text-xl sm:text-2xl font-bold text-emerald-500 mb-4">TaxBridge</div>
                <p className="text-sm text-slate-400">
                  Cross-border tax calculations for tech workers.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-100 mb-4">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#features" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                      Dashboard
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-100 mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/privacy" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 sm:pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
              <p>&copy; {new Date().getFullYear()} TaxBridge. Built for tech workers.</p>
              {process.env.NODE_ENV === 'development' && (
                <p className="mt-2 text-xs text-slate-600">
                  CRO Test Active: Variant {variant}
                </p>
              )}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
