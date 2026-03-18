/**
 * Co-Branded Partner Landing Page
 * Public landing page with partner branding for referred visitors
 * Route: /p/[referral_code]
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, TrendingUp, Shield, Clock, ArrowRight, Building2 } from 'lucide-react';

interface PartnerInfo {
  firm_name: string;
  partner_name: string;
  referral_code: string;
  total_referrals: number;
  status: string;
}

export default function CobroadedPartnerLandingPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (code) {
      // Store referral code
      localStorage.setItem('referral_code', code);

      // Fetch partner info
      fetch(`/api/partners/public/${code}`)
        .then(res => res.json())
        .then(data => {
          if (data.partner) {
            setPartner(data.partner);
          } else {
            setError('Partner not found');
          }
        })
        .catch(() => setError('Failed to load partner info'))
        .finally(() => setLoading(false));
    }
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-4">Invalid Referral Link</h1>
          <p className="text-slate-400 mb-6">This referral code is not valid or has expired.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Go to TaxBridge Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Header with Partner Branding */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                T
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TaxBridge</h1>
                <p className="text-sm text-emerald-400">Trusted by {partner.firm_name}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/auth/sign-in')}
              className="text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          {/* Partner Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-6 py-2 mb-8">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">
              Recommended by {partner.firm_name}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Cross-Border Tax Made
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Simple & Accurate
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Calculate your US-Canada tax obligations instantly. Built for H-1B/TN visa workers with RSU income who now live in Canada.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/auth/sign-up')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/demo')}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
            >
              See Demo
            </button>
          </div>

          {/* Trust Badge */}
          <p className="text-sm text-slate-400 mt-6">
            Join {partner.total_referrals > 0 ? `${partner.total_referrals}+ clients` : 'clients'} from {partner.firm_name} already using TaxBridge
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Accurate Calculations</h3>
            <p className="text-slate-400 text-sm">
              Treaty Article XV compliant tax calculations for dual-country RSU income
            </p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Foreign Tax Credit</h3>
            <p className="text-slate-400 text-sm">
              Optimize FTC to eliminate double taxation on your RSU income
            </p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Save Hours of Work</h3>
            <p className="text-slate-400 text-sm">
              What takes days manually happens in minutes with our calculator
            </p>
          </div>
        </div>

        {/* Social Proof from Partner */}
        <div className="max-w-3xl mx-auto bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-slate-300 mb-4 italic">
                "We recommend TaxBridge to all our cross-border clients. It simplifies complex tax scenarios and ensures accurate reporting for both US and Canadian obligations."
              </p>
              <div>
                <p className="text-slate-100 font-semibold">{partner.partner_name}</p>
                <p className="text-slate-400 text-sm">{partner.firm_name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Everything You Need</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'RSU vesting tracking with FMV calculations',
              'US federal + state tax calculations',
              'Canada federal + provincial tax calculations',
              'Foreign Tax Credit optimization',
              'Form recommendations (1040, T1, FBAR, 8938)',
              'USD/CAD conversion at Bank of Canada rates',
              'Multi-year dashboard and reports',
              'PDF export for accountants'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto mt-16 text-center bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Start Your Free Trial Today
          </h2>
          <p className="text-slate-300 mb-6">
            No credit card required. Full access to all features for 14 days.
          </p>
          <button
            onClick={() => router.push('/auth/sign-up')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-400 text-sm">
            <p>© 2024 TaxBridge. All rights reserved.</p>
            <p className="mt-2">This page is brought to you in partnership with {partner.firm_name}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
