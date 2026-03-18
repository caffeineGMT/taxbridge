'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Download, CheckCircle2, ArrowRight, FileText, AlertCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trackMetaViewContent, trackMetaLead } from '@/lib/analytics/meta-pixel';
import { trackCustomEvent } from '@/lib/analytics/google-ads';

export default function GuideLandingPage() {
  const [email, setEmail] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    trackMetaViewContent('Guide Landing Page');
    trackCustomEvent('view_landing_page', { type: 'guide' });
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      trackMetaLead('Tax Treaty Guide Download');
      trackCustomEvent('lead_capture', { source: 'guide_page' });
      setShowGuide(true);
    }
  };

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

      <main className="relative container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
            Free Guide • Canada-US Tax Treaty Article XV
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 leading-tight">
            Complete Guide to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-500">
              US-Canada Tax Treaty for H-1B RSUs
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Learn how Article XV prevents double taxation on your US stock compensation.
            Step-by-step guide with real examples from Meta, Google, Amazon tech workers.
          </p>
        </div>

        {!showGuide ? (
          // Email Gate
          <div className="max-w-2xl mx-auto">
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-slate-100">
                  Download the Free Guide
                </CardTitle>
                <CardDescription className="text-base text-slate-400">
                  Enter your email to get instant access to the complete tax treaty guide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
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
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Get Free Guide
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>No credit card required. Instant access. Used by 500+ cross-border tech workers.</span>
                  </div>
                </form>

                {/* Preview Benefits */}
                <div className="mt-8 pt-8 border-t border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">What's Inside:</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-400">Article XV explained: How to claim Foreign Tax Credit on RSU income</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-400">Required forms: W-2, 1040/1040-NR, T1, T4, FBAR, 8938, 8833</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-400">Real examples: $100K RSU vesting from Meta/Google/Amazon</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-400">Provincial vs Federal tax optimization strategies</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-400">Filing deadlines and penalty avoidance tips</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Guide Content
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-400 mb-2">Guide Sent to Your Email!</h3>
                    <p className="text-slate-300">
                      Check your inbox for the complete US-Canada Tax Treaty guide. Read the key highlights below:
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guide Sections */}
            <div className="space-y-6">
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl text-slate-100">Understanding Article XV</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-slate-400 space-y-3">
                  <p>
                    Article XV of the US-Canada Tax Treaty prevents double taxation on employment income, including RSUs.
                    When you vest RSUs from a US employer while living in Canada, BOTH countries want to tax that income.
                  </p>
                  <p className="font-medium text-slate-300">
                    The solution: Foreign Tax Credit (FTC) allows you to offset US taxes paid against your Canadian tax obligation.
                  </p>
                  <div className="bg-slate-800/50 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-emerald-400 mb-2">Key Rule:</h4>
                    <p className="text-sm">
                      Canada has primary taxing rights on income earned while you're a Canadian resident.
                      You file both US and Canadian returns, but claim FTC on your Canadian return to avoid double tax.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl text-slate-100">Required Forms Checklist</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-emerald-400 text-sm font-bold">US</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-300 mb-2">United States Forms</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Form W-2 (from employer)
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Form 1040 or 1040-NR (tax return)
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            FinCEN Form 114 (FBAR) if foreign accounts &gt; $10K
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Form 8938 if foreign assets &gt; $50K
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-4 border-t border-slate-800">
                      <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-red-400 text-sm font-bold">CA</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-300 mb-2">Canadian Forms</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            T1 General (tax return)
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            T4 or T4A (if applicable)
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Form 8833 (Treaty-Based Return Position)
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Schedule A (Foreign Tax Credit claim)
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl text-slate-100">Real Example: $100K RSU Vesting</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-800/50 rounded-lg p-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">RSU Income (200 shares @ $500)</span>
                      <span className="font-semibold text-slate-100">$100,000</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                      <span className="text-slate-400">US Federal Tax (24%)</span>
                      <span className="text-slate-100">$24,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Canada Federal + Provincial (38%)</span>
                      <span className="text-slate-100">$38,000</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                      <span className="text-emerald-400 font-medium">Foreign Tax Credit (FTC)</span>
                      <span className="text-emerald-400 font-medium">-$24,000</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                      <span className="text-slate-100 font-bold">Net Tax Owed (to Canada)</span>
                      <span className="text-xl font-bold text-slate-100">$14,000</span>
                    </div>
                    <div className="mt-4 p-3 bg-emerald-500/10 rounded border border-emerald-500/20">
                      <p className="text-sm text-emerald-400">
                        <strong>Without FTC:</strong> You'd pay $62,000 total (double taxation).
                        <strong className="block mt-1">With FTC:</strong> You pay $38,000 total (14% effective rate). <strong>Savings: $24,000!</strong>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-amber-400 mb-2">Important Deadlines</h3>
                      <ul className="space-y-2 text-sm text-slate-400">
                        <li><strong className="text-slate-300">US:</strong> April 15 (Form 1040), June 30 (FBAR)</li>
                        <li><strong className="text-slate-300">Canada:</strong> April 30 (T1 General)</li>
                        <li><strong className="text-slate-300">Late Filing Penalty:</strong> 5% per month (US), 5% + 1% interest (Canada)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <Card className="border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-blue-500/10">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-slate-100 mb-4">
                  Automate Your Cross-Border Tax Calculations
                </h2>
                <p className="text-slate-400 mb-6">
                  TaxBridge handles all the complex FTC math, tracks multi-year vestings, and generates CPA-ready reports.
                </p>
                <Link href="/sign-up">
                  <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950">
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-xs text-slate-500 mt-4">
                  Free forever • Upgrade to Pro for $299/year
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

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
