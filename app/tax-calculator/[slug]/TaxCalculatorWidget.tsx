'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateUSFederalTax, calculateUSStateTax } from '@/lib/tax/us-calculator';
import { calculateCanadaFederalTax, calculateCanadaProvincialTax } from '@/lib/tax/canada-calculator';
import { calculateFTC } from '@/lib/tax/ftc-calculator';
import { CalculatorTracker, trackError, trackApiError } from '@/lib/analytics/tracking-utils';
import { sanitizeCurrencyInput, parseCurrencyInput } from '@/lib/input-validation';
import { TaxDisclaimer } from '@/components/legal/tax-disclaimer';
import { InfoTooltip, TooltipProvider } from '@/components/ui/tooltip';
import { Spinner } from '@/components/ui/spinner';

interface TaxCalculatorWidgetProps {
  defaultState: 'WA' | 'CA' | 'NY' | 'TX' | 'MA';
  defaultProvince: 'BC' | 'ON' | 'AB' | 'QC';
}

export default function TaxCalculatorWidget({ defaultState, defaultProvince }: TaxCalculatorWidgetProps) {
  // Analytics tracker
  const trackerRef = useRef<CalculatorTracker | null>(null);

  // Form state
  const [rsuIncome, setRsuIncome] = useState('100000');
  const [usState, setUsState] = useState<'WA' | 'CA' | 'NY' | 'TX' | 'MA'>(defaultState);
  const [province, setProvince] = useState<'BC' | 'ON' | 'AB' | 'QC'>(defaultProvince);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsuError, setRsuError] = useState<string>('');

  // Calculation results
  const [usTax, setUsTax] = useState(0);
  const [canadaTax, setCanadaTax] = useState(0);
  const [ftcResult, setFtcResult] = useState<any>(null);

  // Initialize calculator tracker
  useEffect(() => {
    trackerRef.current = new CalculatorTracker(`calculator-${defaultState}-${defaultProvince}`);

    // Track drop-off when user leaves page without completing
    const handleBeforeUnload = () => {
      if (!emailSubmitted) {
        trackerRef.current?.trackDropOff('email_not_submitted');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [defaultState, defaultProvince, emailSubmitted]);

  // Calculate taxes whenever inputs change
  useEffect(() => {
    const income = parseFloat(rsuIncome) || 0;
    if (income <= 0) {
      // Clear stale results when income is zero or negative
      setUsTax(0);
      setCanadaTax(0);
      setFtcResult(null);
      return;
    }

    try {
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

      // Track calculation
      trackerRef.current?.trackCalculation(
        {
          rsu_income: income,
          us_state: usState,
          canada_province: province,
        },
        {
          us_tax: totalUSTax,
          canada_tax_before_ftc: totalCanadaTax,
          ftc_savings: ftc.savings,
          total_tax_with_ftc: ftc.totalTaxWithFTC,
          effective_rate: (ftc.totalTaxWithFTC / income) * 100,
        }
      );
    } catch (error) {
      console.error('Tax calculation error:', error);
      trackError(error as Error, {
        context: 'tax_calculator',
        rsu_income: income,
        us_state: usState,
        canada_province: province,
      });
    }
  }, [rsuIncome, usState, province]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/marketing/capture-lead', {
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

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      setEmailSubmitted(true);

      // Track successful completion
      trackerRef.current?.trackCompletion(email, {
        rsu_income: parseFloat(rsuIncome),
        us_state: usState,
        canada_province: province,
        estimated_tax: ftcResult?.totalTaxWithFTC,
      });
    } catch (error) {
      console.error('Failed to submit email:', error);

      // Track API error
      trackApiError(
        '/api/marketing/capture-lead',
        (error as any).status || 500,
        (error as Error).message,
        {
          context: 'calculator_email_submission',
          us_state: usState,
          canada_province: province,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="text-2xl text-slate-100">Calculate Your Exact Tax</CardTitle>
        <CardDescription>Instant estimate with Foreign Tax Credit optimization</CardDescription>
      </CardHeader>
      <CardContent>
        <TaxDisclaimer variant="compact" />
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Column */}
          <div className="space-y-6">
            {/* RSU Income */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                RSU Income (USD)
                <InfoTooltip content="Restricted Stock Units income from your US employer. This is the dollar value of shares that vested during the year." />
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={rsuIncome}
                onChange={(e) => {
                  const sanitized = sanitizeCurrencyInput(e.target.value, {
                    maxValue: 10_000_000, // $10M max
                    allowNegative: false,
                    decimalPlaces: 2,
                  });
                  setRsuIncome(sanitized);
                  trackerRef.current?.trackInputChange('rsu_income', sanitized);

                  // Inline validation
                  const numValue = parseFloat(sanitized);
                  if (numValue === 0 || sanitized === '') {
                    setRsuError('RSU income is required');
                  } else if (numValue < 0) {
                    setRsuError('RSU income cannot be negative');
                  } else if (numValue > 10_000_000) {
                    setRsuError('Maximum $10,000,000');
                  } else {
                    setRsuError('');
                  }
                }}
                onFocus={() => trackerRef.current?.trackInputChange('rsu_income_focus', rsuIncome)}
                className={`w-full px-4 py-3 rounded-lg bg-slate-800 border ${rsuError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-emerald-500'} text-slate-100 text-lg focus:outline-none focus:ring-2 transition-all`}
                placeholder="100000"
              />
              {rsuError && (
                <p className="mt-1.5 text-sm text-red-400" role="alert">{rsuError}</p>
              )}
            </div>

            {/* US State */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                US State (where RSUs vested)
                <InfoTooltip content="The state where you worked when your RSUs vested. State tax rates vary significantly (0% in WA/TX, up to 13.3% in CA)." />
              </label>
              <select
                value={usState}
                onChange={(e) => {
                  setUsState(e.target.value as any);
                  trackerRef.current?.trackInputChange('us_state', e.target.value);
                }}
                onFocus={() => trackerRef.current?.trackInputChange('us_state_focus', usState)}
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
                <InfoTooltip content="Your Canadian province of residence. Canada also taxes your worldwide income, but you can claim Foreign Tax Credit (FTC) for US taxes paid." />
              </label>
              <select
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value as any);
                  trackerRef.current?.trackInputChange('canada_province', e.target.value);
                }}
                onFocus={() => trackerRef.current?.trackInputChange('canada_province_focus', province)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="BC">British Columbia</option>
                <option value="ON">Ontario</option>
                <option value="AB">Alberta</option>
                <option value="QC">Quebec</option>
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
              <div className="text-sm text-slate-400 mb-1 flex items-center">
                Canada Tax (before FTC)
                <InfoTooltip content="Total Canadian federal and provincial tax on your worldwide income before claiming Foreign Tax Credit." />
              </div>
              <div className="text-3xl font-bold text-slate-100">
                ${ftcResult?.usFirstScenario?.canadaTaxBeforeFTC.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
              </div>
            </div>

            {/* FTC Savings */}
            <div className="p-4 rounded-lg bg-emerald-500/10 border-2 border-emerald-500/30">
              <div className="text-sm text-emerald-400 mb-1 flex items-center">
                Foreign Tax Credit Saves You
                <InfoTooltip content="Foreign Tax Credit (FTC) allows you to deduct US taxes paid from your Canadian tax bill, preventing double taxation on the same income." />
              </div>
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
                Effective rate: {ftcResult && parseFloat(rsuIncome) > 0 ? ((ftcResult.totalTaxWithFTC / parseFloat(rsuIncome)) * 100).toFixed(1) : '0'}%
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  trackerRef.current?.trackInputChange('email', e.target.value);
                }}
                onFocus={() => trackerRef.current?.trackInputChange('email_focus', email)}
                placeholder="Enter your email to save this calculation"
                required
                className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-slate-950 font-semibold whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="text-slate-950" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save & Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
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
    </TooltipProvider>
  );
}
