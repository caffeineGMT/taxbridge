'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateUSFederalTax, calculateUSStateTax } from '@/lib/tax/us-calculator';
import { calculateCanadaFederalTax, calculateCanadaProvincialTax } from '@/lib/tax/canada-calculator';
import { calculateFTC } from '@/lib/tax/ftc-calculator';

interface TaxCalculatorWidgetProps {
  defaultState: 'WA' | 'CA' | 'NY' | 'TX' | 'MA';
  defaultProvince: 'BC' | 'ON' | 'AB' | 'QC' | 'MB';
}

export default function TaxCalculatorWidget({ defaultState, defaultProvince }: TaxCalculatorWidgetProps) {
  // Form state
  const [rsuIncome, setRsuIncome] = useState('100000');
  const [usState, setUsState] = useState<'WA' | 'CA' | 'NY' | 'TX' | 'MA'>(defaultState);
  const [province, setProvince] = useState<'BC' | 'ON' | 'AB' | 'QC' | 'MB'>(defaultProvince);
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
        body: JSON.stringify({
          email,
          sourcePage: `calculator-${usState}-${province}`,
          metadata: {
            rsuIncome,
            usState,
            province,
            estimatedTax: ftcResult?.totalTaxWithFTC,
          }
        }),
      });
      setEmailSubmitted(true);
    } catch (error) {
      console.error('Failed to submit email:', error);
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="text-2xl text-slate-100">Calculate Your Exact Tax</CardTitle>
        <CardDescription>Instant estimate with Foreign Tax Credit optimization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Column */}
          <div className="space-y-6">
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
                <option value="CA">California (up to 13.3%)</option>
                <option value="NY">New York (up to 10.9%)</option>
                <option value="TX">Texas (0% state tax)</option>
                <option value="MA">Massachusetts (5% flat)</option>
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
                <option value="QC">Quebec</option>
                <option value="MB">Manitoba</option>
              </select>
            </div>
          </div>

          {/* Results Column */}
          <div className="space-y-4">
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
          </div>
        </div>

        {/* Email Capture */}
        <div className="mt-8 pt-8 border-t border-slate-700">
          {!emailSubmitted ? (
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to save this calculation"
                required
                className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Button
                type="submit"
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold whitespace-nowrap"
              >
                Save & Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 text-emerald-400 py-3">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Saved! Check your email to create your free account.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
