import Link from 'next/link';
import { Calculator, TrendingUp, FileText, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TaxBridge - US-Canada Cross-Border Tax Calculator for H-1B/TN Workers',
  description: 'Free cross-border tax calculator built for H-1B and TN visa tech workers with US RSUs living in Canada. Calculate dual-country taxes, optimize Foreign Tax Credits, and get a complete filing checklist.',
  alternates: {
    canonical: 'https://taxbridge.app',
  },
  openGraph: {
    title: 'TaxBridge - Cross-Border Tax Calculator for H-1B/TN Workers',
    description: 'Calculate your US-Canada cross-border tax on RSU income. Built for H-1B and TN visa tech workers at Meta, Amazon, Google, Microsoft.',
    url: 'https://taxbridge.app',
    type: 'website',
  },
};

export default function Home() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TaxBridge',
    url: 'https://taxbridge.app',
    logo: 'https://taxbridge.app/logo.png',
    description: 'US-Canada cross-border tax calculator for H-1B and TN visa tech workers with RSU income.',
    sameAs: [],
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'TaxBridge',
    url: 'https://taxbridge.app',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    description: 'Free cross-border tax calculator for H-1B/TN visa tech workers with US RSUs living in Canada. Calculate US federal+state and Canada federal+provincial taxes with Foreign Tax Credit optimization.',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '299',
      priceCurrency: 'USD',
      offerCount: '3',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      ratingCount: '3',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
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
            <Link href="#about" className="text-slate-300 hover:text-emerald-400 transition-colors">
              About
            </Link>
            <Link href="/dashboard" className="text-slate-300 hover:text-emerald-400 transition-colors">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16 md:pt-32 md:pb-24">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-slate-100 leading-tight px-2">
              Simplify Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                Cross-Border Tax Filing
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto px-4">
              Built for H-1B and TN visa tech workers with US RSUs now living in Canada.
              Navigate dual-country taxation with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center pt-4 px-4">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto group bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 transition-all hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-slate-700 hover:border-emerald-500 hover:bg-slate-800 text-slate-100 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 transition-all"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 text-center mb-8 sm:mb-12">
              Everything You Need
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Feature Card 1: RSU Calculator */}
              <Card className="group border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer">
                <CardHeader className="px-4 sm:px-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Calculator className="h-6 w-6 text-slate-950" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-slate-100">RSU Calculator</CardTitle>
                  <CardDescription className="text-sm sm:text-base text-slate-400 leading-relaxed">
                    Track vesting events with automatic FMV calculation. Enter date, shares, and employer
                    (Meta, Amazon, Google, Microsoft) for instant valuation.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature Card 2: Tax Optimizer */}
              <Card className="group border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer">
                <CardHeader className="px-4 sm:px-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6 text-slate-950" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-slate-100">Tax Optimizer</CardTitle>
                  <CardDescription className="text-sm sm:text-base text-slate-400 leading-relaxed">
                    Calculate US federal & state plus Canada federal & provincial tax on RSU income.
                    Foreign Tax Credit optimizer eliminates double taxation.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature Card 3: Forms Checklist */}
              <Card className="group border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer">
                <CardHeader className="px-4 sm:px-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 text-slate-950" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-slate-100">Forms Checklist</CardTitle>
                  <CardDescription className="text-sm sm:text-base text-slate-400 leading-relaxed">
                    Complete checklist for required forms: W-2, 1040/1040-NR, T1, T4, FBAR, Form 8938,
                    and Treaty Article XV Form 8833.
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
                Trusted by Tech Workers Across North America
              </h2>
              <p className="text-base sm:text-lg text-slate-400">
                Real results from beta users who saved thousands in double taxation
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Testimonial 1 */}
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:border-emerald-500 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold text-lg flex-shrink-0">
                      P
                    </div>
                    <div>
                      <div className="font-bold text-slate-100">Priya Sharma</div>
                      <div className="text-xs text-slate-400">Senior SWE, Meta</div>
                      <div className="text-xs text-emerald-400">Vancouver, BC</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <CardDescription className="text-slate-300 text-sm leading-relaxed">
                    "Caught a $2,300 FTC error from last year. Already recommended it to my entire H-1B team."
                  </CardDescription>
                  <div className="mt-4 pt-3 border-t border-slate-700">
                    <span className="text-emerald-400 font-bold text-lg">$2,300</span>
                    <span className="text-slate-400 text-xs ml-2">tax savings</span>
                  </div>
                </CardHeader>
              </Card>

              {/* Testimonial 2 */}
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:border-emerald-500 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-lg flex-shrink-0">
                      D
                    </div>
                    <div>
                      <div className="font-bold text-slate-100">David Kim</div>
                      <div className="text-xs text-slate-400">Staff Engineer, Amazon</div>
                      <div className="text-xs text-emerald-400">Toronto, ON</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <CardDescription className="text-slate-300 text-sm leading-relaxed">
                    "The FTC optimizer saved me $4,100 on my 2025 filing. This tool pays for itself 10x over."
                  </CardDescription>
                  <div className="mt-4 pt-3 border-t border-slate-700">
                    <span className="text-emerald-400 font-bold text-lg">$4,100</span>
                    <span className="text-slate-400 text-xs ml-2">tax savings</span>
                  </div>
                </CardHeader>
              </Card>

              {/* Testimonial 3 */}
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:border-emerald-500 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-lg flex-shrink-0">
                      M
                    </div>
                    <div>
                      <div className="font-bold text-slate-100">Maria Gonzalez</div>
                      <div className="text-xs text-slate-400">TN Visa, Google</div>
                      <div className="text-xs text-emerald-400">Montreal, QC</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <CardDescription className="text-slate-300 text-sm leading-relaxed">
                    "Made dual-country tax calculations crystal clear. The PDF export went straight to my CPA. Zero questions."
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="mt-6 sm:mt-8 text-center">
              <Link href="/pricing" className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-2 transition-colors text-sm sm:text-base">
                Read more success stories
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 p-8 sm:p-12 text-center">
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Simplify Your Taxes?
                </h2>
                <p className="text-base sm:text-lg text-emerald-50 mb-6 sm:mb-8 max-w-2xl mx-auto">
                  Join tech workers across North America who trust TaxBridge for accurate
                  cross-border tax calculations.
                </p>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white hover:bg-slate-100 text-emerald-600 font-semibold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 transition-all hover:scale-105 hover:shadow-xl"
                  >
                    Start Calculating Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Decorative circles */}
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
                Cross-border tax calculations made simple for tech workers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-100 mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Features</Link></li>
                <li><Link href="/dashboard" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-100 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-100 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">About</Link></li>
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} TaxBridge. Built for tech workers navigating cross-border taxation.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
