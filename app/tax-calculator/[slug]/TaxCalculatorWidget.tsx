'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle, Calculator, Sparkles, RotateCcw, Save } from 'lucide-react';
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
import { EnhancedCalculatorResults } from '@/components/tax/enhanced-calculator-results';
import { CalculatorProgress } from '@/components/ui/calculator-progress';
import { useCalculatorState } from '@/hooks/use-calculator-state';
import { TAX_CALCULATOR_DEMO } from '@/lib/calculator-demo-values';
import { useAutoScrollOnFocus } from '@/hooks/use-mobile-keyboard';

interface TaxCalculatorWidgetProps {
  defaultState: 'WA' | 'CA' | 'NY' | 'TX' | 'MA';
  defaultProvince: 'BC' | 'ON' | 'AB' | 'QC';
}

export default function TaxCalculatorWidget({ defaultState, defaultProvince }: TaxCalculatorWidgetProps) {
  // Mobile keyboard handling - auto-scroll to focused inputs
  useAutoScrollOnFocus();

  // Analytics tracker
  const trackerRef = useRef<CalculatorTracker | null>(null);

  // Save/Resume state with localStorage
  const { state: savedInputs, setState: setSavedInputs, isLoaded, clearSavedState, hasSavedState } = useCalculatorState(
    `tax-calculator-${defaultState}-${defaultProvince}`,
    {
      rsuIncome: '100000',
      usState: defaultState,
      province: defaultProvince,
    }
  );

  // Form state (use saved state when loaded)
  const [rsuIncome, setRsuIncome] = useState(savedInputs.rsuIncome);
  const [usState, setUsState] = useState<'WA' | 'CA' | 'NY' | 'TX' | 'MA'>(savedInputs.usState || defaultState);
  const [province, setProvince] = useState<'BC' | 'ON' | 'AB' | 'QC'>(savedInputs.province || defaultProvince);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsuError, setRsuError] = useState<string>('');
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // Progress tracking (1: Input, 2: Results, 3: Email/Completion)
  const [currentStep, setCurrentStep] = useState(1);

  // Calculation results - store full structured data (moved before useEffect that uses it)
  const [calculationResults, setCalculationResults] = useState<{
    usTax: {
      federal: any;
      state: any;
      total: number;
    };
    canadaTax: {
      federal: any;
      provincial: any;
      ftc: {
        amount: number;
        explanation: string;
      };
      totalBeforeFTC: number;
      netTotal: number;
    };
    rsuValueCad: number;
    exchangeRate: number;
  } | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Sync state changes to saved state
  useEffect(() => {
    if (isLoaded) {
      setSavedInputs({
        rsuIncome,
        usState,
        province,
      });

      // Show save notification briefly
      setShowSaveNotification(true);
      const timer = setTimeout(() => setShowSaveNotification(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [rsuIncome, usState, province, isLoaded]);

  // Load saved state when component mounts
  useEffect(() => {
    if (isLoaded && hasSavedState) {
      setRsuIncome(savedInputs.rsuIncome);
      setUsState(savedInputs.usState || defaultState);
      setProvince(savedInputs.province || defaultProvince);
    }
  }, [isLoaded]);

  // Update progress step based on state
  useEffect(() => {
    if (emailSubmitted) {
      setCurrentStep(3);
    } else if (showResults) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [showResults, emailSubmitted]);

  // Demo values functionality
  const loadDemoValues = () => {
    setRsuIncome(TAX_CALCULATOR_DEMO.rsuIncome);
    setUsState(TAX_CALCULATOR_DEMO.usState);
    setProvince(TAX_CALCULATOR_DEMO.province);
    trackerRef.current?.trackInputChange('demo_values_loaded', 'true');
  };

  // Clear saved data
  const handleClearSaved = () => {
    clearSavedState();
    setRsuIncome('100000');
    setUsState(defaultState);
    setProvince(defaultProvince);
    setShowResults(false);
    setCalculationResults(null);
    setCurrentStep(1);
  };

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
      setCalculationResults(null);
      setShowResults(false);
      return;
    }

    try {
      // US tax calculation (in USD)
      const usFederal = calculateUSFederalTax(income, 'single');
      const usStateResult = calculateUSStateTax(income, usState);
      const totalUSTax = usFederal.tax + usStateResult.tax;

      // Canada tax calculation (assume 1.35 USD to CAD conversion)
      const exchangeRate = 1.35;
      const incomeCAD = income * exchangeRate;
      const canadaFederal = calculateCanadaFederalTax(incomeCAD);
      const canadaProvincial = calculateCanadaProvincialTax(incomeCAD, province);
      const totalCanadaTaxBeforeFTC = canadaFederal.tax + canadaProvincial.tax;

      // FTC calculation
      const ftc = calculateFTC(totalUSTax, totalCanadaTaxBeforeFTC, income, usState, province);

      // Store full structured results
      const results = {
        usTax: {
          federal: usFederal,
          state: usStateResult,
          total: totalUSTax,
        },
        canadaTax: {
          federal: canadaFederal,
          provincial: canadaProvincial,
          ftc: {
            amount: ftc.savings,
            explanation: `You paid $${totalUSTax.toLocaleString()} in US taxes. Canada allows you to claim up to $${Math.min(totalUSTax * exchangeRate, totalCanadaTaxBeforeFTC).toLocaleString()} CAD as a Foreign Tax Credit, preventing double taxation.`,
          },
          totalBeforeFTC: totalCanadaTaxBeforeFTC,
          netTotal: Math.max(0, totalCanadaTaxBeforeFTC - (ftc.savings * exchangeRate)),
        },
        rsuValueCad: incomeCAD,
        exchangeRate,
      };

      setCalculationResults(results);
      setShowResults(true);

      // Track calculation
      trackerRef.current?.trackCalculation(
        {
          rsu_income: income,
          us_state: usState,
          canada_province: province,
        },
        {
          us_tax: totalUSTax,
          canada_tax_before_ftc: totalCanadaTaxBeforeFTC,
          ftc_savings: ftc.savings,
          total_tax_with_ftc: results.canadaTax.netTotal + totalUSTax,
          effective_rate: ((results.canadaTax.netTotal + totalUSTax) / income) * 100,
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
            estimatedTax: calculationResults ? (calculationResults.usTax.total + calculationResults.canadaTax.netTotal) : 0,
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
        estimated_tax: calculationResults ? (calculationResults.usTax.total + calculationResults.canadaTax.netTotal) : 0,
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
      <div className="space-y-8">
      {/* Progress Indicator */}
      <CalculatorProgress
        steps={[
          { label: 'Enter Details', description: 'RSU income & location' },
          { label: 'View Results', description: 'Tax calculation' },
          { label: 'Get Report', description: 'Email confirmation' },
        ]}
        currentStep={currentStep}
        className="mb-8"
      />

      {/* Save Notification - mobile-optimized positioning */}
      {showSaveNotification && isLoaded && (
        <div className="mobile-notification bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Save className="w-4 h-4" />
          <span className="text-sm font-medium">Progress saved</span>
        </div>
      )}

      <Card className="border-slate-800 bg-slate-900/50 mobile-card keyboard-aware-form">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
            <CardTitle className="text-xl sm:text-2xl text-slate-100 mobile-heading-2">Calculate Your Exact Tax</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {/* Demo Values Button */}
            <button
              onClick={loadDemoValues}
              className="mobile-button flex items-center gap-1.5 px-3 py-2 text-sm bg-purple-500/20 hover:bg-purple-500/30 active:bg-purple-500/40 text-purple-300 rounded-md transition-all touch-manipulation"
              title="Load example values"
              aria-label="Load demo values"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Try Demo</span>
            </button>
            {/* Clear Button */}
            {hasSavedState && (
              <button
                onClick={handleClearSaved}
                className="mobile-button flex items-center gap-1.5 px-3 py-2 text-sm bg-slate-700/50 hover:bg-slate-700 active:bg-slate-700/80 text-slate-300 rounded-md transition-all touch-manipulation"
                title="Clear saved data"
                aria-label="Clear saved data"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
        <CardDescription className="mobile-body">Instant estimate with Foreign Tax Credit optimization</CardDescription>
      </CardHeader>
      <CardContent>
        <TaxDisclaimer variant="compact" />
        <div className="space-y-5 sm:space-y-6">
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
                className={`w-full px-4 py-3 rounded-lg bg-slate-800 border ${rsuError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-emerald-500'} text-slate-100 text-base sm:text-lg focus:outline-none focus:ring-2 transition-all mobile-input touch-manipulation`}
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
      </CardContent>
    </Card>

    {/* Enhanced Results - Shows after calculation */}
    {showResults && calculationResults && (
      <EnhancedCalculatorResults
        rsuIncome={parseFloat(rsuIncome)}
        usState={usState}
        province={province}
        usTax={calculationResults.usTax}
        canadaTax={calculationResults.canadaTax}
        rsuValueCad={calculationResults.rsuValueCad}
        exchangeRate={calculationResults.exchangeRate}
        email={email}
        setEmail={setEmail}
        onEmailSubmit={handleEmailSubmit}
        isSubmitting={isSubmitting}
        emailSubmitted={emailSubmitted}
      />
    )}
    </div>
    </TooltipProvider>
  );
}
