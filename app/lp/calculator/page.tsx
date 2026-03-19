'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Calculator, TrendingUp, FileText, ArrowRight, CheckCircle2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trackMetaViewContent, trackMetaLead } from '@/lib/analytics/meta-pixel';
import { trackCustomEvent } from '@/lib/analytics/google-ads';

export default function CalculatorLandingPage() {
  const searchParams = useSearchParams();
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const [showCalculator, setShowCalculator] = useState(false);
  const [email, setEmail] = useState('');
  const [rsuData, setRsuData] = useState({
    shares: '',
    fmv: '',
    employer: 'Meta',
  });

  // A/B Testing: Variant A shows calculator immediately, Variant B requires email first
  useEffect(() => {
    const variantParam = searchParams.get('variant');
    if (variantParam === 'B') {
      setVariant('B');
    } else {
      setVariant('A');
      setShowCalculator(true); // Variant A shows calculator immediately
    }

    // Track landing page view
    trackMetaViewContent('Calculator Landing Page');
    trackCustomEvent('view_landing_page', { type: 'calculator', variant });
  }, [searchParams, variant]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Track lead capture
      trackMetaLead('Calculator Email Gate');
      trackCustomEvent('lead_capture', { source: 'calculator_page' });
      setShowCalculator(true);
    }
  };

  const calculateTax = () => {
    const shares = parseFloat(rsuData.shares);
    const fmv = parseFloat(rsuData.fmv);
    if (!shares || !fmv) return null;

    const totalValue = shares * fmv;
    const usFederalTax = totalValue * 0.24; // 24% federal
    const canadaFederalTax = totalValue * 0.26; // 26% federal
    const ftcreditEstimate = Math.min(usFederalTax, canadaFederalTax);

    return {
      totalValue,
      usFederalTax,
      canadaFederalTax,
      ftcreditEstimate,
      netTax: usFederalTax + canadaFederalTax - ftcreditEstimate,
    };
  };

  const taxResult = calculateTax();

  return (
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
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-emerald-500">TaxBridge</div>
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" className="border-slate-700 hover:border-emerald-500">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            Free H-1B RSU Tax Calculator
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-100 leading-tight px-4">
            Calculate Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
              Cross-Border RSU Tax in Seconds
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto px-4">
            Instant dual-country tax calculation with Foreign Tax Credit optimization.
            Built for H-1B/TN visa holders with US RSUs now living in Canada.
          </p>
        </div>

        {/* Calculator Section */}
        <div className="max-w-5xl mx-auto px-2 sm:px-0">
          {variant === 'B' && !showCalculator ? (
            // Variant B: Email gate before calculator
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="text-center px-4 sm:px-6">
                <CardTitle className="text-xl sm:text-2xl text-slate-100">
                  Get Instant Access to Your Tax Estimate
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-slate-400">
                  Enter your email to unlock the free calculator
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-slate-300 text-base">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                  >
                    Unlock Free Calculator
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    No credit card required. Instant access.
                  </p>
                </form>
              </CardContent>
            </Card>
          ) : (
            // Calculator Interface
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Input Card */}
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Calculator className="h-5 w-5 text-slate-950" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-slate-100">RSU Details</CardTitle>
                  </div>
                  <CardDescription className="text-sm sm:text-base text-slate-400">
                    Enter your vesting information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
                  <div>
                    <Label htmlFor="employer" className="text-slate-300 text-base">Employer</Label>
                    <select
                      id="employer"
                      value={rsuData.employer}
                      onChange={(e) => setRsuData({ ...rsuData, employer: e.target.value })}
                      className="w-full h-11 min-h-[44px] px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="Meta">Meta</option>
                      <option value="Amazon">Amazon</option>
                      <option value="Google">Google</option>
                      <option value="Microsoft">Microsoft</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="shares" className="text-slate-300 text-base">Number of Shares</Label>
                    <Input
                      id="shares"
                      type="number"
                      inputMode="numeric"
                      placeholder="100"
                      value={rsuData.shares}
                      onChange={(e) => setRsuData({ ...rsuData, shares: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fmv" className="text-slate-300 text-base">Fair Market Value (USD)</Label>
                    <Input
                      id="fmv"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      placeholder="450.00"
                      value={rsuData.fmv}
                      onChange={(e) => setRsuData({ ...rsuData, fmv: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Results Card */}
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-5 w-5 text-slate-950" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-slate-100">Tax Estimate</CardTitle>
                  </div>
                  <CardDescription className="text-sm sm:text-base text-slate-400">
                    Your cross-border tax breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {taxResult ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-800 gap-4">
                        <span className="text-slate-400 text-sm sm:text-base">Total RSU Value</span>
                        <span className="text-base sm:text-lg font-semibold text-slate-100 whitespace-nowrap">
                          ${taxResult.totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 gap-4">
                        <span className="text-slate-400 text-sm sm:text-base">US Federal Tax (24%)</span>
                        <span className="text-slate-100 text-sm sm:text-base whitespace-nowrap">
                          ${taxResult.usFederalTax.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 gap-4">
                        <span className="text-slate-400 text-sm sm:text-base">Canada Federal Tax (26%)</span>
                        <span className="text-slate-100 text-sm sm:text-base whitespace-nowrap">
                          ${taxResult.canadaFederalTax.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t border-slate-800 gap-4">
                        <span className="text-emerald-400 font-medium text-sm sm:text-base">Foreign Tax Credit</span>
                        <span className="text-emerald-400 font-medium text-sm sm:text-base whitespace-nowrap">
                          -${taxResult.ftcreditEstimate.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-emerald-500/10 rounded-lg px-3 sm:px-4 border border-emerald-500/20 gap-4">
                        <span className="text-emerald-400 font-semibold text-sm sm:text-base">Net Tax Owed</span>
                        <span className="text-xl sm:text-2xl font-bold text-emerald-400 whitespace-nowrap">
                          ${taxResult.netTax.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-4">
                        *Simplified estimate. Actual tax may vary based on province, state, and personal situation.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-sm sm:text-base">
                      Enter RSU details to see your tax estimate
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-12 sm:mt-16 px-2 sm:px-0">
          <Card className="border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8 text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100 mb-4">
                Ready for Complete Tax Management?
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mb-6 max-w-2xl mx-auto">
                Track all your RSU vestings, generate tax reports, and get CPA-reviewed filing checklists.
              </p>
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-xs text-slate-500 mt-4">
                No credit card required • Upgrade to Pro for $299/year
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-12 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 text-center mb-6 sm:mb-8 px-4">
            Everything You Need for Cross-Border Tax Filing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="px-4 sm:px-6">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                <CardTitle className="text-base sm:text-lg text-slate-100">Multi-Year Tracking</CardTitle>
                <CardDescription className="text-sm text-slate-400">
                  Track unlimited RSU vestings across multiple years
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="px-4 sm:px-6">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                <CardTitle className="text-base sm:text-lg text-slate-100">Treaty Article XV</CardTitle>
                <CardDescription className="text-sm text-slate-400">
                  Automatic FTC calculation using US-Canada tax treaty
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="px-4 sm:px-6">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                <CardTitle className="text-base sm:text-lg text-slate-100">Forms Checklist</CardTitle>
                <CardDescription className="text-sm text-slate-400">
                  Complete list: W-2, 1040, T1, T4, FBAR, 8938, 8833
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-slate-500">
            <p>&copy; 2026 TaxBridge. Built for tech workers navigating cross-border taxation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
