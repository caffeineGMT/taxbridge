/**
 * Co-Branded Partner Landing Page
 * Dynamic page for each partner with their firm branding
 * URL: /partner/[slug]
 */

import { notFound } from 'next/navigation';
import { getAffiliatePartnerByReferralCode } from '@/lib/db/queries/affiliates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, TrendingUp, DollarSign, FileCheck, Calculator } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Props {
  params: {
    slug: string;
  };
  searchParams: {
    ref?: string;
  };
}

export async function generateMetadata({ params }: Props) {
  // TODO: Get partner info from slug
  return {
    title: 'TaxBridge - Cross-Border RSU Tax Calculator',
    description: 'Save $5,000-$12,000/year on your cross-border RSU taxes',
  };
}

export default function PartnerLandingPage({ params, searchParams }: Props) {
  // TODO: Look up partner by slug
  // For now, use a sample partner
  const partner = {
    firm_name: 'Smith Immigration Law',
    partner_name: 'John Smith',
    referral_code: params.slug,
    custom_message: 'Recommended for my H-1B and TN visa clients',
    custom_logo_url: null,
  };

  if (!partner) {
    notFound();
  }

  const referralLink = `/?ref=${partner.referral_code}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Partner Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 backdrop-blur">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {partner.custom_logo_url && (
                <img
                  src={partner.custom_logo_url}
                  alt={partner.firm_name}
                  className="h-12 w-auto"
                />
              )}
              <div>
                <p className="text-sm text-slate-400">Recommended by</p>
                <h2 className="text-lg font-semibold text-white">{partner.firm_name}</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Partner Code</p>
              <p className="text-sm font-mono text-slate-300">{partner.referral_code}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-16 space-y-12">
        {/* Hero */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            {partner.firm_name} Approved
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Stop Overpaying $12,000 on Your Cross-Border Taxes
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            TaxBridge automates US-Canada cross-border RSU tax calculations for H-1B and TN visa holders. Optimize your Foreign Tax Credit in 10 minutes.
          </p>

          {partner.custom_message && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-slate-300 italic">
                "{partner.custom_message}"
              </p>
              <p className="text-sm text-slate-400 mt-2">
                — {partner.partner_name}, {partner.firm_name}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href={`/signup${referralLink}`}>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8">
                Get Started - Save $12K/Year
              </Button>
            </Link>
            <Link href={`/#calculator${referralLink}`}>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 bg-slate-800 hover:bg-slate-700 text-white"
              >
                Try Free Calculator
              </Button>
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            💳 No credit card required • 🔒 Bank-level security • ⚡ 10-minute setup
          </p>
        </div>

        {/* Problem Statement */}
        <Card className="bg-slate-800/50 border-red-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white text-2xl">The Problem: Double Taxation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300">
            <p>
              If you're an <strong className="text-white">H-1B or TN visa holder</strong> with RSUs (Restricted Stock Units), you're facing one of the most complex tax situations in cross-border finance:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                <strong className="text-white">Both countries tax your RSU income</strong> - The IRS wants their cut, and so does the CRA
              </li>
              <li>
                <strong className="text-white">Foreign Tax Credit is incredibly complex</strong> - IRC Section 901 + CRA rules + US-Canada Tax Treaty
              </li>
              <li>
                <strong className="text-white">Most CPAs get it wrong</strong> - Even experienced accountants miss $5K-$12K in optimizations
              </li>
              <li>
                <strong className="text-white">Manual calculations take 3+ hours</strong> - And still have errors
              </li>
            </ul>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-4">
              <p className="text-red-300 font-semibold">
                Result: The average H-1B tech worker with $200K in RSU vests overpays $5,000-$12,000 per year.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Solution */}
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold text-white">TaxBridge Fixes This in 10 Minutes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                  <Calculator className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Dual-Country Tax Calculation</h3>
                <p className="text-sm text-slate-400">
                  Calculates US federal + state AND Canadian federal + provincial taxes in one go
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">FTC Optimization</h3>
                <p className="text-sm text-slate-400">
                  Automatically optimizes your Foreign Tax Credit to eliminate double taxation
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto">
                  <FileCheck className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Filing-Ready Reports</h3>
                <p className="text-sm text-slate-400">
                  Generate reports for both Form 1040 (US) and T1 (Canada) instantly
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Social Proof */}
        <Card className="bg-gradient-to-br from-emerald-900/30 to-blue-900/30 border-emerald-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">Real Results from H-1B/TN Workers</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-emerald-400">$12,000</div>
              <p className="text-sm text-slate-300">Average tax savings per year</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-emerald-400">10 min</div>
              <p className="text-sm text-slate-300">vs. 3 hours manual calculation</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-emerald-400">$3,000+</div>
              <p className="text-sm text-slate-300">CPA fees saved annually</p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-slate-800/50 border-emerald-500/30 backdrop-blur">
          <CardContent className="py-12 text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">
              Ready to Stop Overpaying on Your Cross-Border Taxes?
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Join thousands of H-1B and TN visa holders who've saved an average of $12,000/year with TaxBridge.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={`/signup${referralLink}`}>
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8">
                  Start Saving Today
                </Button>
              </Link>
              <Link href={`/#calculator${referralLink}`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-600 bg-slate-800 hover:bg-slate-700 text-white"
                >
                  Try Free Calculator First
                </Button>
              </Link>
            </div>
            <p className="text-sm text-slate-400">
              Recommended by {partner.firm_name} • 30-day money-back guarantee
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500">
          <p>
            Questions? Contact {partner.firm_name} at{' '}
            <span className="text-blue-400">[partner email]</span>
          </p>
          <p className="mt-2">
            This page is co-branded with {partner.firm_name}, a TaxBridge partner.{' '}
            <Link href="/partners/signup" className="text-blue-400 hover:underline">
              Become a partner
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
