'use client';

import { useState, useRef, useEffect } from 'react';
import { TrendingUp, Clock, DollarSign, Users, Sparkles, RotateCcw, Save } from 'lucide-react';
import { sanitizeIntegerInput, parseIntegerInput, sanitizeCurrencyInput, parseCurrencyInput } from '@/lib/input-validation';
import { InfoTooltip, TooltipProvider } from '@/components/ui/tooltip';
import { Spinner } from '@/components/ui/spinner';
import { CalculatorTracker } from '@/lib/analytics/tracking-utils';
import { trackEvent } from '@/lib/analytics/posthog';
import { CalculatorProgress } from '@/components/ui/calculator-progress';
import { useCalculatorState } from '@/hooks/use-calculator-state';
import { ROI_CALCULATOR_DEMO } from '@/lib/calculator-demo-values';
import { ReferralShareButtons } from '@/components/ReferralShareButtons';
import { useAutoScrollOnFocus } from '@/hooks/use-mobile-keyboard';

interface ROIInputs {
  firmName: string;
  attorneyCount: number;
  clientsPerYear: number;
  hoursPerWeek: number;
  billableRate: number;
}

interface ROIResults {
  hoursSaved: number;
  valueSaved: number;
  clientQuestionReduction: number;
  complianceImprovement: number;
  roi: number;
}

export function ROICalculator() {
  // Mobile keyboard handling - auto-scroll to focused inputs
  useAutoScrollOnFocus();

  // Save/Resume state with localStorage
  const { state: savedInputs, setState: setSavedInputs, isLoaded, clearSavedState, hasSavedState } = useCalculatorState(
    'roi-calculator-enterprise',
    {
      firmName: '',
      attorneyCount: 50,
      clientsPerYear: 200,
      hoursPerWeek: 5,
      billableRate: 250,
    }
  );

  const [inputs, setInputs] = useState<ROIInputs>(savedInputs);
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ROIInputs, string>>>({});
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // Progress tracking (1: Input, 2: Results/CTA)
  const [currentStep, setCurrentStep] = useState(1);

  // Analytics tracker
  const calculatorTrackerRef = useRef<CalculatorTracker | null>(null);

  // Load saved state when component mounts
  useEffect(() => {
    if (isLoaded && hasSavedState) {
      setInputs(savedInputs);
    }
  }, [isLoaded]);

  // Sync state changes to saved state
  useEffect(() => {
    if (isLoaded) {
      setSavedInputs(inputs);

      // Show save notification briefly
      setShowSaveNotification(true);
      const timer = setTimeout(() => setShowSaveNotification(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [inputs, isLoaded]);

  // Update progress step
  useEffect(() => {
    setCurrentStep(showResults ? 2 : 1);
  }, [showResults]);

  // Demo values functionality
  const loadDemoValues = () => {
    setInputs(ROI_CALCULATOR_DEMO);
    calculatorTrackerRef.current?.trackInputChange('demo_values_loaded', 'true');
  };

  // Clear saved data
  const handleClearSaved = () => {
    clearSavedState();
    setInputs({
      firmName: '',
      attorneyCount: 50,
      clientsPerYear: 200,
      hoursPerWeek: 5,
      billableRate: 250,
    });
    setShowResults(false);
    setCurrentStep(1);
  };

  // Initialize tracker on mount
  useEffect(() => {
    calculatorTrackerRef.current = new CalculatorTracker('roi-calculator-enterprise');

    // Track drop-off on unmount if calculation not performed
    return () => {
      if (!showResults && calculatorTrackerRef.current) {
        calculatorTrackerRef.current.trackDropOff('abandoned_before_calculation');
      }
    };
  }, [showResults]);

  const calculateROI = (): ROIResults => {
    // Time saved: assume 95% reduction in tax questions
    const weeksPerYear = 50; // excluding 2 weeks holiday
    const hoursSaved = inputs.hoursPerWeek * weeksPerYear * 0.95; // 95% reduction

    // Value saved
    const valueSaved = hoursSaved * inputs.billableRate;

    // Enterprise cost
    const enterpriseCost = 2000 * 50; // $2K per seat × 50 seats minimum

    // ROI calculation
    const roi = ((valueSaved - enterpriseCost) / enterpriseCost) * 100;

    return {
      hoursSaved,
      valueSaved,
      clientQuestionReduction: 95,
      complianceImprovement: 100,
      roi,
    };
  };

  const results = calculateROI();

  // Inline validation
  const validateInputs = (): boolean => {
    const newErrors: Partial<Record<keyof ROIInputs, string>> = {};

    if (inputs.attorneyCount < 1) {
      newErrors.attorneyCount = 'Must have at least 1 attorney';
    } else if (inputs.attorneyCount > 100000) {
      newErrors.attorneyCount = 'Maximum 100,000 attorneys';
    }

    if (inputs.clientsPerYear < 1) {
      newErrors.clientsPerYear = 'Must have at least 1 client per year';
    } else if (inputs.clientsPerYear > 100000) {
      newErrors.clientsPerYear = 'Maximum 100,000 clients/year';
    }

    if (inputs.hoursPerWeek < 0) {
      newErrors.hoursPerWeek = 'Hours cannot be negative';
    } else if (inputs.hoursPerWeek > 168) {
      newErrors.hoursPerWeek = 'Maximum 168 hours per week';
    }

    if (inputs.billableRate < 1) {
      newErrors.billableRate = 'Billable rate must be at least $1';
    } else if (inputs.billableRate > 10000) {
      newErrors.billableRate = 'Maximum $10,000/hour';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsCalculating(true);
    // Simulate async calculation for UX polish (real calculation is instant)
    await new Promise(resolve => setTimeout(resolve, 600));

    const calculationResults = calculateROI();

    // Track calculation completion with inputs and results
    calculatorTrackerRef.current?.trackCalculation(
      {
        firmName: inputs.firmName || 'unnamed_firm',
        attorneyCount: inputs.attorneyCount,
        clientsPerYear: inputs.clientsPerYear,
        hoursPerWeek: inputs.hoursPerWeek,
        billableRate: inputs.billableRate,
      },
      {
        hoursSaved: calculationResults.hoursSaved,
        valueSaved: calculationResults.valueSaved,
        roi: calculationResults.roi,
        netSavings: calculationResults.valueSaved - 100000,
        isPositiveROI: calculationResults.roi > 0,
      }
    );

    setShowResults(true);
    setIsCalculating(false);
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-3xl mx-auto">
      {/* Progress Indicator */}
      <CalculatorProgress
        steps={[
          { label: 'Firm Details', description: 'Enter your information' },
          { label: 'ROI Results', description: 'View savings & benefits' },
        ]}
        currentStep={currentStep}
        className="mb-8"
      />

      {/* Save Notification - mobile-optimized positioning */}
      {showSaveNotification && isLoaded && (
        <div className="mobile-notification bg-primary text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Save className="w-4 h-4" />
          <span className="text-sm font-medium">Progress saved</span>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl mobile-card shadow-lg keyboard-aware-form">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" /> {/* Spacer */}
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div className="flex-1 flex justify-end gap-2">
              {/* Demo Values Button */}
              <button
                onClick={loadDemoValues}
                className="mobile-button flex items-center gap-1.5 px-3 py-2 text-sm bg-purple-500/20 hover:bg-purple-500/30 active:bg-purple-500/40 text-purple-600 dark:text-purple-300 rounded-md transition-all touch-manipulation"
                title="Load example values"
                aria-label="Load demo values"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Demo</span>
              </button>
              {/* Clear Button */}
              {hasSavedState && (
                <button
                  onClick={handleClearSaved}
                  className="mobile-button flex items-center gap-1.5 px-3 py-2 text-sm bg-border hover:bg-border/80 active:bg-border/70 text-textMuted rounded-md transition-all touch-manipulation"
                  title="Clear saved data"
                  aria-label="Clear saved data"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-text mb-2 mobile-heading-2">ROI Calculator</h2>
          <p className="text-sm sm:text-base text-textMuted mobile-body">
            Calculate how much your firm could save with TaxBridge Enterprise
          </p>
        </div>

        {/* Input Form */}
        <div className="space-y-5 sm:space-y-6 mb-8">
          {/* Firm Name */}
          <div>
            <label htmlFor="firmName" className="block text-sm font-semibold text-text mb-2">
              Firm Name
            </label>
            <input
              id="firmName"
              type="text"
              placeholder="e.g., Your Law Firm"
              value={inputs.firmName}
              onChange={(e) => {
                setInputs({ ...inputs, firmName: e.target.value });
                calculatorTrackerRef.current?.trackInputChange('firmName', e.target.value);
              }}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary transition-all mobile-input touch-manipulation"
            />
          </div>

          {/* Number of Attorneys */}
          <div>
            <label htmlFor="attorneyCount" className="block text-sm font-semibold text-text mb-2">
              Number of Attorneys
              <InfoTooltip content="Total number of immigration attorneys at your firm who handle H-1B and TN visa cases." />
            </label>
            <input
              id="attorneyCount"
              type="text"
              inputMode="numeric"
              value={inputs.attorneyCount}
              onChange={(e) => {
                const sanitized = sanitizeIntegerInput(e.target.value, {
                  allowNegative: false,
                  minValue: 1,
                  maxValue: 100000,
                });
                const numValue = parseIntegerInput(sanitized, 0);
                setInputs({ ...inputs, attorneyCount: numValue });
                calculatorTrackerRef.current?.trackInputChange('attorneyCount', numValue);
                // Clear error on change
                if (errors.attorneyCount) {
                  setErrors({ ...errors, attorneyCount: undefined });
                }
              }}
              className={`w-full px-4 py-3 bg-background border ${errors.attorneyCount ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'} rounded-lg text-text focus:outline-none focus:ring-2 transition-all mobile-input touch-manipulation`}
            />
            {errors.attorneyCount && (
              <p className="mt-1.5 text-sm text-error" role="alert">{errors.attorneyCount}</p>
            )}
          </div>

          {/* H-1B/TN Clients per Year */}
          <div>
            <label htmlFor="clientsPerYear" className="block text-sm font-semibold text-text mb-2">
              H-1B/TN Clients per Year
              <InfoTooltip content="H-1B and TN visa holders working in the US while residing in Canada. These are your cross-border tax clients." />
            </label>
            <input
              id="clientsPerYear"
              type="text"
              inputMode="numeric"
              value={inputs.clientsPerYear}
              onChange={(e) => {
                const sanitized = sanitizeIntegerInput(e.target.value, {
                  allowNegative: false,
                  minValue: 1,
                  maxValue: 100000,
                });
                const numValue = parseIntegerInput(sanitized, 0);
                setInputs({ ...inputs, clientsPerYear: numValue });
                calculatorTrackerRef.current?.trackInputChange('clientsPerYear', numValue);
                // Clear error on change
                if (errors.clientsPerYear) {
                  setErrors({ ...errors, clientsPerYear: undefined });
                }
              }}
              className={`w-full px-4 py-3 bg-background border ${errors.clientsPerYear ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'} rounded-lg text-text focus:outline-none focus:ring-2 transition-all mobile-input touch-manipulation`}
            />
            {errors.clientsPerYear && (
              <p className="mt-1.5 text-sm text-error" role="alert">{errors.clientsPerYear}</p>
            )}
          </div>

          {/* Hours Spent on Tax Questions per Week */}
          <div>
            <label htmlFor="hoursPerWeek" className="block text-sm font-semibold text-text mb-2">
              Hours Spent on Tax Questions per Week
              <InfoTooltip content="Combined time your attorneys and paralegals spend answering client questions about cross-border tax filing, deadlines, and obligations." />
            </label>
            <input
              id="hoursPerWeek"
              type="text"
              inputMode="decimal"
              value={inputs.hoursPerWeek}
              onChange={(e) => {
                const sanitized = sanitizeCurrencyInput(e.target.value, {
                  allowNegative: false,
                  minValue: 0,
                  maxValue: 168, // Max hours in a week
                  decimalPlaces: 1,
                });
                const numValue = parseCurrencyInput(sanitized, 0);
                setInputs({ ...inputs, hoursPerWeek: numValue });
                calculatorTrackerRef.current?.trackInputChange('hoursPerWeek', numValue);
                // Clear error on change
                if (errors.hoursPerWeek) {
                  setErrors({ ...errors, hoursPerWeek: undefined });
                }
              }}
              className={`w-full px-4 py-3 bg-background border ${errors.hoursPerWeek ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'} rounded-lg text-text focus:outline-none focus:ring-2 transition-all mobile-input touch-manipulation`}
            />
            {errors.hoursPerWeek && (
              <p className="mt-1.5 text-sm text-error" role="alert">{errors.hoursPerWeek}</p>
            )}
            <p className="text-sm text-textMuted mt-1">
              Include paralegal + attorney time answering client questions about cross-border tax
            </p>
          </div>

          {/* Average Billable Rate */}
          <div>
            <label htmlFor="billableRate" className="block text-sm font-semibold text-text mb-2">
              Average Billable Rate ($/hour)
              <InfoTooltip content="Your blended hourly rate for attorney and paralegal time. Used to calculate the value of time saved when clients self-serve." />
            </label>
            <input
              id="billableRate"
              type="text"
              inputMode="decimal"
              value={inputs.billableRate}
              onChange={(e) => {
                const sanitized = sanitizeCurrencyInput(e.target.value, {
                  allowNegative: false,
                  minValue: 1,
                  maxValue: 10000, // $10k/hour max
                  decimalPlaces: 2,
                });
                const numValue = parseCurrencyInput(sanitized, 0);
                setInputs({ ...inputs, billableRate: numValue });
                calculatorTrackerRef.current?.trackInputChange('billableRate', numValue);
                // Clear error on change
                if (errors.billableRate) {
                  setErrors({ ...errors, billableRate: undefined });
                }
              }}
              className={`w-full px-4 py-3 bg-background border ${errors.billableRate ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'} rounded-lg text-text focus:outline-none focus:ring-2 transition-all mobile-input touch-manipulation`}
            />
            {errors.billableRate && (
              <p className="mt-1.5 text-sm text-error" role="alert">{errors.billableRate}</p>
            )}
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="w-full px-8 py-4 bg-primary hover:bg-primary/90 active:bg-primary/80 disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mobile-button touch-target-lg"
          aria-label="Calculate your ROI"
        >
          {isCalculating ? (
            <>
              <Spinner size="sm" className="text-white" />
              Calculating...
            </>
          ) : (
            'Calculate Your ROI'
          )}
        </button>

        {/* Results */}
        {showResults && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-500">
            {/* Main Results Card */}
            <div className="p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-xl">
              <div className="text-lg font-bold text-primary mb-4">
                {inputs.firmName || 'Your Firm'} — Estimated Annual Savings
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-text">{Math.round(results.hoursSaved)}</div>
                    <div className="text-sm text-textMuted">hours saved per year</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-text">
                      ${Math.round(results.valueSaved).toLocaleString()}
                    </div>
                    <div className="text-sm text-textMuted">value recovered annually</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-textMuted">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>{results.clientQuestionReduction}% reduction in client tax questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-textMuted">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>{results.complianceImprovement}% compliance tracking coverage</span>
                  </div>
                  <div className="flex items-center gap-2 text-textMuted">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>Zero training required for clients</span>
                  </div>
                  <div className="flex items-center gap-2 text-textMuted">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>White-label branding included</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROI Breakdown */}
            <div className="p-6 bg-surface/50 border border-border rounded-xl">
              <div className="font-semibold text-text mb-4">ROI Breakdown</div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-textMuted">Annual value saved:</span>
                  <span className="font-semibold text-text">
                    ${Math.round(results.valueSaved).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textMuted">TaxBridge Enterprise cost:</span>
                  <span className="font-semibold text-text">-$100,000</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between">
                  <span className="text-textMuted font-semibold">Net savings:</span>
                  <span className={`font-bold ${results.valueSaved - 100000 > 0 ? 'text-success' : 'text-error'}`}>
                    ${Math.round(results.valueSaved - 100000).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-textMuted font-semibold">ROI:</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${results.roi > 0 ? 'text-success' : 'text-error'}`}>
                      {results.roi > 0 ? '+' : ''}{Math.round(results.roi)}%
                    </span>
                    {results.roi > 0 && (
                      <TrendingUp className="w-5 h-5 text-success" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Benefits */}
            <div className="p-6 bg-surface/50 border border-border rounded-xl">
              <div className="font-semibold text-text mb-4">Additional Benefits (Not Included in ROI)</div>

              <div className="space-y-2 text-sm text-textMuted">
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Improved client satisfaction (clients appreciate self-service vs. "ask your CPA")</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Reduced firm liability (compliance dashboard shows who's filed vs. at-risk)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Competitive differentiation (value-add for client onboarding)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Reduced CPA referral costs (clients can self-calculate before consulting CPA)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>White-label branding improves firm's tech-forward image</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <a
                href="mailto:enterprise@taxbridge.app?subject=30-Day Free Trial Request&body=Firm Name: {inputs.firmName}%0D%0AAttorneys: {inputs.attorneyCount}%0D%0AClients/year: {inputs.clientsPerYear}%0D%0A%0D%0AEstimated savings: ${Math.round(results.valueSaved).toLocaleString()}/year%0D%0A%0D%0AI'd like to start a 30-day free trial."
                className="inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] text-lg"
                onClick={() => {
                  trackEvent('demo_request_submitted', {
                    source: 'roi_calculator',
                    firmName: inputs.firmName || 'unnamed',
                    attorneyCount: inputs.attorneyCount,
                    estimatedSavings: Math.round(results.valueSaved),
                    roi: Math.round(results.roi),
                  });
                }}
              >
                Start 30-Day Free Trial
              </a>
              <p className="text-sm text-textMuted mt-3">
                No credit card required • Full access • Personal onboarding call included
              </p>
            </div>

            {/* Referral Share Buttons */}
            <div className="mt-6">
              <ReferralShareButtons
                context="calculator"
                title="Share with colleagues"
                description="Know other immigration attorneys who could benefit? Earn $10 credit for each referral!"
              />
            </div>
          </div>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
}
