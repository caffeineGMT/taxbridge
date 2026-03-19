'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { TooltipProvider, InfoTooltip } from '@/components/ui/tooltip';
import { CheckCircle2, Sparkles, Database, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

const provinces = [
  { value: 'BC', label: 'British Columbia' },
  { value: 'ON', label: 'Ontario' },
  { value: 'QC', label: 'Quebec' },
  { value: 'AB', label: 'Alberta' },
];

const states = [
  { value: 'CA', label: 'California' },
  { value: 'WA', label: 'Washington' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
];

const filingStatuses = [
  { value: 'single', label: 'Single' },
  { value: 'married_joint', label: 'Married Filing Jointly' },
  { value: 'married_separate', label: 'Married Filing Separately' },
  { value: 'head_of_household', label: 'Head of Household' },
];

const STEPS = [
  { id: 1, title: 'Welcome', description: 'Get started with TaxBridge' },
  { id: 2, title: 'Tax Profile', description: 'Set up your tax information' },
  { id: 3, title: 'Sample Data', description: 'Explore with sample RSU entries' },
];

interface FieldErrors {
  province?: string;
  state?: string;
  filingStatus?: string;
}

interface OnboardingWizardProps {
  userName?: string;
}

export function OnboardingWizard({ userName }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [province, setProvince] = useState('');
  const [state, setState] = useState('');
  const [filingStatus, setFilingStatus] = useState('');
  const [useSampleData, setUseSampleData] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: keyof FieldErrors, value: string): string | undefined => {
    if (!value) {
      switch (field) {
        case 'province':
          return 'Please select your Canadian province of residence';
        case 'state':
          return 'Please select the US state where your RSUs vested';
        case 'filingStatus':
          return 'Please select your US tax filing status';
      }
    }
    return undefined;
  };

  const handleFieldChange = (field: keyof FieldErrors, value: string, setter: (v: string) => void) => {
    setter(value);
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
    if (error) setError('');
  };

  const handleFieldBlur = (field: keyof FieldErrors, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleNext = () => {
    if (currentStep === 2) {
      const errors: FieldErrors = {
        province: validateField('province', province),
        state: validateField('state', state),
        filingStatus: validateField('filingStatus', filingStatus),
      };
      setFieldErrors(errors);
      setTouched({ province: true, state: true, filingStatus: true });

      const hasErrors = Object.values(errors).some(Boolean);
      if (hasErrors) {
        setError('Please complete all required fields before continuing');
        return;
      }
    }
    setError('');
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const profileResponse = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          state,
          filing_status: filingStatus,
        }),
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to save tax profile');
      }

      if (useSampleData) {
        const sampleDataResponse = await fetch('/api/onboarding/sample-data', {
          method: 'POST',
        });

        if (!sampleDataResponse.ok) {
          console.error('Failed to create sample data');
        }
      }

      const params = new URLSearchParams();
      params.set('onboarding', 'completed');
      if (useSampleData) {
        params.set('tour', 'start');
      }

      router.push(`/dashboard?${params.toString()}`);
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Failed to complete onboarding. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full max-w-3xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      currentStep > step.id
                        ? 'bg-emerald-500 border-emerald-500'
                        : currentStep === step.id
                          ? 'bg-slate-900 border-emerald-500'
                          : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          currentStep === step.id ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {step.id}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-slate-200' : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-600 hidden md:block">{step.description}</p>
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-4 transition-all ${
                      currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-slate-900 border-slate-800">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-slate-100">
                  Welcome to TaxBridge{userName ? `, ${userName}` : ''}!
                </CardTitle>
                <CardDescription className="text-slate-400 text-base mt-2">
                  Let's get you set up in just a few steps. We'll help you navigate cross-border tax
                  filing for your US RSUs while living in Canada.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                  <h3 className="text-slate-200 font-semibold flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mr-2" />
                    What you'll get:
                  </h3>
                  <ul className="space-y-2 ml-7 text-slate-400 text-sm">
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">•</span>
                      <span>Dual-country tax calculator with FTC optimization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">•</span>
                      <span>Automatic RSU vesting tracking with real-time FMV data</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">•</span>
                      <span>Required forms checklist (W-2, 1040, T1, FBAR, 8938, 8833)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">•</span>
                      <span>USD/CAD conversion at Bank of Canada rates</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  size="lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </>
          )}

          {/* Step 2: Tax Profile */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle className="text-slate-100">Set Up Your Tax Profile</CardTitle>
                <CardDescription className="text-slate-400">
                  Tell us about your tax residency to get accurate calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNext();
                  }}
                  className="space-y-6"
                >
                  {/* Canadian Province */}
                  <div className="space-y-2">
                    <Label htmlFor="province" className="text-slate-300 inline-flex items-center">
                      Canadian Province
                      <InfoTooltip content="Your current province of residence in Canada. Provincial tax rates vary — for example, BC has lower rates than Ontario or Quebec." />
                    </Label>
                    <Select
                      id="province"
                      value={province}
                      onChange={(e) => handleFieldChange('province', e.target.value, setProvince)}
                      onBlur={() => handleFieldBlur('province', province)}
                      className={`bg-slate-800 border-slate-700 text-slate-100 ${
                        touched.province && fieldErrors.province ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                    >
                      <option value="">Select your province</option>
                      {provinces.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </Select>
                    {touched.province && fieldErrors.province ? (
                      <p className="text-sm text-red-400" role="alert">{fieldErrors.province}</p>
                    ) : (
                      <p className="text-sm text-slate-500">Your current province of residence in Canada</p>
                    )}
                  </div>

                  {/* US State */}
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-slate-300 inline-flex items-center">
                      US State (for RSU income)
                      <InfoTooltip content="The US state where you were physically working when your RSUs vested. This determines which state taxes apply to your RSU income." />
                    </Label>
                    <Select
                      id="state"
                      value={state}
                      onChange={(e) => handleFieldChange('state', e.target.value, setState)}
                      onBlur={() => handleFieldBlur('state', state)}
                      className={`bg-slate-800 border-slate-700 text-slate-100 ${
                        touched.state && fieldErrors.state ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                    >
                      <option value="">Select your US state</option>
                      {states.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                    {touched.state && fieldErrors.state ? (
                      <p className="text-sm text-red-400" role="alert">{fieldErrors.state}</p>
                    ) : (
                      <p className="text-sm text-slate-500">The state where you worked when RSUs vested</p>
                    )}
                  </div>

                  {/* Filing Status */}
                  <div className="space-y-2">
                    <Label htmlFor="filing-status" className="text-slate-300 inline-flex items-center">
                      Filing Status
                      <InfoTooltip content="Your US federal tax filing status. 'Married Filing Jointly' typically gives the lowest tax rate for couples. If you're a non-resident alien, you may be limited to 'Single' or 'Married Filing Separately'." />
                    </Label>
                    <Select
                      id="filing-status"
                      value={filingStatus}
                      onChange={(e) => handleFieldChange('filingStatus', e.target.value, setFilingStatus)}
                      onBlur={() => handleFieldBlur('filingStatus', filingStatus)}
                      className={`bg-slate-800 border-slate-700 text-slate-100 ${
                        touched.filingStatus && fieldErrors.filingStatus ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                    >
                      <option value="">Select your filing status</option>
                      {filingStatuses.map((fs) => (
                        <option key={fs.value} value={fs.value}>
                          {fs.label}
                        </option>
                      ))}
                    </Select>
                    {touched.filingStatus && fieldErrors.filingStatus ? (
                      <p className="text-sm text-red-400" role="alert">{fieldErrors.filingStatus}</p>
                    ) : (
                      <p className="text-sm text-slate-500">Your US tax filing status</p>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 border-slate-700 hover:bg-slate-800 text-slate-300"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </>
          )}

          {/* Step 3: Sample Data */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle className="text-slate-100">Try TaxBridge with Sample Data</CardTitle>
                <CardDescription className="text-slate-400">
                  Explore the platform with pre-populated RSU entries, or start with a clean slate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Option 1: Use Sample Data */}
                <button
                  onClick={() => setUseSampleData(true)}
                  className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                    useSampleData === true
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 mt-0.5 flex items-center justify-center ${
                        useSampleData === true
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-slate-600'
                      }`}
                    >
                      {useSampleData === true && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Database className="h-5 w-5 text-emerald-400 mr-2" />
                        <h3 className="text-lg font-semibold text-slate-100">
                          Explore with Sample Data
                        </h3>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">
                        We'll create 5 sample RSU vesting events with tax calculations so you can see
                        how TaxBridge works immediately.
                      </p>
                      <div className="bg-slate-900/80 rounded p-3 text-xs text-slate-400 space-y-1">
                        <p>• 4 quarterly Meta RSU vests in 2024</p>
                        <p>• 1 Amazon RSU vest in 2025</p>
                        <p>• Complete tax calculations with FTC</p>
                        <p className="text-emerald-400 pt-1">Guided tour included</p>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Option 2: Start Fresh */}
                <button
                  onClick={() => setUseSampleData(false)}
                  className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                    useSampleData === false
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 mt-0.5 flex items-center justify-center ${
                        useSampleData === false
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-slate-600'
                      }`}
                    >
                      {useSampleData === false && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Sparkles className="h-5 w-5 text-blue-400 mr-2" />
                        <h3 className="text-lg font-semibold text-slate-100">Start Fresh</h3>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">
                        Start with a clean dashboard and add your actual RSU vesting events manually.
                      </p>
                      <div className="bg-slate-900/80 rounded p-3 text-xs text-slate-400 space-y-1">
                        <p>• Empty dashboard ready for your data</p>
                        <p>• Add RSU entries at your own pace</p>
                        <p>• Import from W-2 or CSV files</p>
                      </div>
                    </div>
                  </div>
                </button>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm" role="alert">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 border-slate-700 hover:bg-slate-800 text-slate-300"
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                    disabled={useSampleData === null || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
}
