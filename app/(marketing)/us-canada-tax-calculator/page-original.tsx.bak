'use client';

import { useState, useEffect } from 'react';
import { Calculator, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateUSFederalTax, calculateUSStateTax } from '@/lib/tax/us-calculator';
import { calculateCanadaFederalTax, calculateCanadaProvincialTax } from '@/lib/tax/canada-calculator';
import { calculateFTC } from '@/lib/tax/ftc-calculator';
import { presetSchemas } from '@/lib/seo/structured-data';

export default function TaxCalculatorPage() {
  // Form state
  const [rsuIncome, setRsuIncome] = useState('100000');
  const [usState, setUsState] = useState<'WA' | 'CA' | 'NY' | 'TX'>('WA');
  const [province, setProvince] = useState<'BC' | 'ON' | 'AB'>('BC');
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  // Calculation results
  const [usTax, setUsTax] = useState(0);
  const [canadaTax, setCanadaTax] = useState(0);
  const [ftcResult, setFtcResult] = useState<any>(null);

  // Calculate taxes whenever inputs change
  useEffect(() => {
    const income = parseFloat(rsuIncome) || 0;
    if (income <= 0) return;

    // US tax calculation (in USD)
    const usFederal = calculateUSFederalTax(income, 'single');
    const usStateResult = calculateUSStateTax(income, usState);
    const totalUSTax = usFederal.tax + usStateResult.tax;

    // Canada tax calculation (assume 1.35 USD to CAD conversion)
    const incomeCAD = income * 1.35;
    const canadaFederal = calculateCanadaFederalTax(incomeCAD);
    const canadaProvincial = calculateCanadaProvincialTax(incomeCAD, province);
    const totalCanadaTax = canadaFederal.tax + canadaProvincial.tax;

    // FTC calculation
    const ftc = calculateFTC(totalUSTax, totalCanadaTax, income, usState, province);

    setUsTax(totalUSTax);
    setCanadaTax(totalCanadaTax);
    setFtcResult(ftc);
  }, [rsuIncome, usState, province]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await fetch('/api/marketing/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sourcePage: 'calculator' }),
      });
      setEmailSubmitted(true);
    } catch (error) {
      console.error('Failed to submit email:', error);
    }
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(presetSchemas.calculator) }}
      />

      <div className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 mb-6">
            <Calculator className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Free Tax Calculator</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
            US-Canada Cross-Border Tax Calculator
          </h1>
          <p className="text-lg text-slate-400">
            Instant tax estimates for H-1B/TN visa tech workers with US RSU income living in Canada.
            See your US federal+state and Canada federal+provincial tax with Foreign Tax Credit savings.
          </p>
        </div>

        {/* Calculator Section */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
          {/* Input Card */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-100">Your RSU Income</CardTitle>
              <CardDescription>Enter your details for an instant tax estimate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* RSU Income */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  RSU Income (USD)
                </label>
                <input
                  type="number"
                  value={rsuIncome}
                  onChange={(e) => setRsuIncome(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="100000"
                />
              </div>

              {/* US State */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  US State (where RSUs vested)
                </label>
                <select
                  value={usState}
                  onChange={(e) => setUsState(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="WA">Washington (0% state tax)</option>
                  <option value="CA">California (up to 12.3%)</option>
                  <option value="NY">New York (up to 10.9%)</option>
                  <option value="TX">Texas (0% state tax)</option>
                </select>
              </div>

              {/* Canadian Province */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Canadian Province (where you live)
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="BC">British Columbia</option>
                  <option value="ON">Ontario</option>
                  <option value="AB">Alberta</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-900/50">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-100">Your Tax Estimate</CardTitle>
              <CardDescription>Based on 2025 tax rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* US Tax */}
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">US Federal + State Tax</div>
                <div className="text-3xl font-bold text-slate-100">
                  ${usTax.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>

              {/* Canada Tax (before FTC) */}
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Canada Tax (before FTC)</div>
                <div className="text-3xl font-bold text-slate-100">
                  ${ftcResult?.usFirstScenario?.canadaTaxBeforeFTC.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
                </div>
              </div>

              {/* FTC Savings */}
              <div className="p-4 rounded-lg bg-emerald-500/10 border-2 border-emerald-500/30">
                <div className="text-sm text-emerald-400 mb-1">Foreign Tax Credit Saves You</div>
                <div className="text-3xl font-bold text-emerald-400">
                  ${ftcResult?.savings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
                </div>
              </div>

              {/* Total Tax After FTC */}
              <div className="p-4 rounded-lg bg-slate-800 border-2 border-emerald-500">
                <div className="text-sm text-slate-400 mb-1">Total Tax (after FTC)</div>
                <div className="text-3xl font-bold text-emerald-400">
                  ${ftcResult?.totalTaxWithFTC.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Effective rate: {ftcResult ? ((ftcResult.totalTaxWithFTC / parseFloat(rsuIncome)) * 100).toFixed(1) : '0'}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Explanation Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-xl text-slate-100">How Foreign Tax Credit Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <p>
                As a Canadian resident with US RSU income, you must file taxes in both countries. However,
                the <strong>US-Canada Tax Treaty Article XV</strong> prevents double taxation through the
                Foreign Tax Credit (FTC).
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <h3 className="font-semibold text-emerald-400 mb-2">Without FTC</h3>
                  <p className="text-sm">
                    You'd pay ${ftcResult?.totalTaxWithoutFTC.toLocaleString() || '0'} total (both countries taxing fully)
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <h3 className="font-semibold text-emerald-400 mb-2">With FTC</h3>
                  <p className="text-sm">
                    You pay ${ftcResult?.totalTaxWithFTC.toLocaleString() || '0'} total (credit for taxes paid to {ftcResult?.optimalStrategy === 'file-us-first' ? 'US' : 'Canada'})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Capture CTA */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-slate-900/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-slate-100">Get Your Full Tax Report</CardTitle>
              <CardDescription>
                Sign up for TaxBridge to save your calculations, track multiple RSU vestings, and get detailed filing instructions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!emailSubmitted ? (
                <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 text-emerald-400 py-3">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Thank you! Check your email to continue.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Related Links */}
        <div className="max-w-4xl mx-auto mt-12 text-center space-y-4">
          <p className="text-slate-400">Want to learn more about cross-border taxation?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/h1b-rsu-tax-guide"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Read the Complete H1B RSU Tax Guide
            </a>
            <span className="text-slate-600">•</span>
            <a
              href="/canada-tax-filing-checklist"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Get the Filing Checklist
            </a>
            <span className="text-slate-600">•</span>
            <a
              href="/dashboard"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Try the Full Dashboard
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
