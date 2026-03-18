'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Calculator, TrendingUp, FileText, ArrowRight, CheckCircle2, Users, Shield, Zap, BarChart3, Clock, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { trackMetaViewContent } from '@/lib/analytics/meta-pixel';
import { trackCustomEvent } from '@/lib/analytics/google-ads';

export default function SoftwareLandingPage() {
  useEffect(() => {
    trackMetaViewContent('Software Landing Page');
    trackCustomEvent('view_landing_page', { type: 'software' });
  }, []);

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
          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="ghost" className="text-slate-300 hover:text-emerald-400">
                Pricing
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" className="border-slate-700 hover:border-emerald-500">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-16 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                  Cross-Border Tax Software
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-100 leading-tight">
                  The Complete
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                    US-Canada Tax Platform
                  </span>
                  for Tech Workers
                </h1>
                <p className="text-lg text-slate-400">
                  Automated RSU tracking, dual-country tax calculations, Foreign Tax Credit optimization,
                  and CPA-reviewed filing checklists. Built specifically for H-1B/TN visa holders.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-lg px-8"
                    >
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/lp/calculator">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-slate-700 hover:border-emerald-500 text-slate-100 text-lg px-8"
                    >
                      Try Free Calculator
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-6 pt-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>No credit card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>500+ users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>CPA-reviewed</span>
                  </div>
                </div>
              </div>

              {/* Feature Preview Card */}
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="aspect-video bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-emerald-400 mx-auto mb-2" />
                      <p className="text-slate-300 text-sm">Dashboard Preview</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Total RSU Value (2025)</span>
                      <span className="font-semibold text-slate-100">$287,450</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Estimated Tax Savings</span>
                      <span className="font-semibold text-emerald-400">$34,120</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Pending Vestings</span>
                      <span className="font-semibold text-blue-400">3 upcoming</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="container mx-auto px-6 py-16 bg-slate-900/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-100 text-center mb-12">
              Why Choose TaxBridge?
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-4 px-4 text-slate-300 font-medium">Feature</th>
                    <th className="text-center py-4 px-4">
                      <div className="text-emerald-400 font-bold">TaxBridge</div>
                    </th>
                    <th className="text-center py-4 px-4 text-slate-400">Excel Spreadsheet</th>
                    <th className="text-center py-4 px-4 text-slate-400">Generic Tax Software</th>
                    <th className="text-center py-4 px-4 text-slate-400">CPA (per year)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800">
                    <td className="py-4 px-4 text-slate-300">RSU Tracking</td>
                    <td className="text-center py-4 px-4">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4 text-slate-500">Manual</td>
                    <td className="text-center py-4 px-4 text-slate-500">—</td>
                    <td className="text-center py-4 px-4 text-slate-500">Manual</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-4 px-4 text-slate-300">Article XV FTC Calculation</td>
                    <td className="text-center py-4 px-4">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4 text-slate-500">Error-prone</td>
                    <td className="text-center py-4 px-4 text-slate-500">—</td>
                    <td className="text-center py-4 px-4">
                      <CheckCircle2 className="h-5 w-5 text-amber-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-4 px-4 text-slate-300">Multi-Year Tracking</td>
                    <td className="text-center py-4 px-4">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4 text-slate-500">Complex</td>
                    <td className="text-center py-4 px-4 text-slate-500">—</td>
                    <td className="text-center py-4 px-4 text-slate-500">Per session</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-4 px-4 text-slate-300">Forms Checklist</td>
                    <td className="text-center py-4 px-4">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4 text-slate-500">—</td>
                    <td className="text-center py-4 px-4 text-slate-500">Generic</td>
                    <td className="text-center py-4 px-4">
                      <CheckCircle2 className="h-5 w-5 text-amber-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-4 px-4 text-slate-300">Annual Cost</td>
                    <td className="text-center py-4 px-4 text-emerald-400 font-bold">$299</td>
                    <td className="text-center py-4 px-4 text-slate-300">Free</td>
                    <td className="text-center py-4 px-4 text-slate-300">$150-300</td>
                    <td className="text-center py-4 px-4 text-slate-300">$800-1,500</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-100 text-center mb-12">
              Complete Cross-Border Tax Management
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-3">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-slate-100">Automated RSU Tracking</CardTitle>
                  <CardDescription className="text-slate-400">
                    Track unlimited vestings from Meta, Amazon, Google, Microsoft. Automatic FMV lookup and valuation.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-slate-100">Dual-Country Tax Engine</CardTitle>
                  <CardDescription className="text-slate-400">
                    Calculate US federal + state and Canada federal + provincial taxes with one click.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-3">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-slate-100">FTC Optimizer</CardTitle>
                  <CardDescription className="text-slate-400">
                    Article XV treaty-based Foreign Tax Credit calculation. Eliminate double taxation automatically.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-slate-100">Forms Checklist</CardTitle>
                  <CardDescription className="text-slate-400">
                    Complete list of required forms: W-2, 1040, T1, T4, FBAR, 8938, 8833. CPA-reviewed.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-3">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-slate-100">Multi-Year Reports</CardTitle>
                  <CardDescription className="text-slate-400">
                    Generate year-over-year tax reports. Track historical vestings and tax payments.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-3">
                    <FileCheck className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-slate-100">PDF Export</CardTitle>
                  <CardDescription className="text-slate-400">
                    Export tax summaries and schedules as PDF. Share with your CPA or keep for records.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="container mx-auto px-6 py-16 bg-slate-900/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-100 text-center mb-12">
              Trusted by Tech Workers at Top Companies
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-slate-800 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-amber-400">★</span>
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4">
                    "Finally, a tool built specifically for our situation. Saved me hours of spreadsheet work and avoided a $12K tax mistake."
                  </p>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-100">Sarah Chen</p>
                    <p className="text-slate-500">SWE at Meta • Vancouver</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-amber-400">★</span>
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4">
                    "Used to pay my CPA $1,200/year. TaxBridge gives me the same FTC calculations for $299. ROI is insane."
                  </p>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-100">Raj Patel</p>
                    <p className="text-slate-500">PM at Amazon • Toronto</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-amber-400">★</span>
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4">
                    "The Article XV guide alone is worth the subscription. Clear explanations, real examples, no confusing jargon."
                  </p>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-100">Emily Wong</p>
                    <p className="text-slate-500">Designer at Google • Montreal</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <Card className="border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
                  Ready to Simplify Your Cross-Border Taxes?
                </h2>
                <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                  Join 500+ tech workers who automate their US-Canada tax calculations with TaxBridge.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-lg px-12 py-6"
                    >
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-slate-700 hover:border-emerald-500 text-slate-100 text-lg px-12 py-6"
                    >
                      View Pricing
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Free: 3 RSU entries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Pro: $299/year (unlimited)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Enterprise: Custom pricing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-slate-500">
            <p>&copy; 2026 TaxBridge. Built for tech workers navigating cross-border taxation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
