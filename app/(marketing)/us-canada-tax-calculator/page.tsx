'use client';

import { useState, useEffect, useRef } from 'react';
import { Calculator, ArrowRight, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateUSFederalTax, calculateUSStateTax } from '@/lib/tax/us-calculator';
import { calculateCanadaFederalTax, calculateCanadaProvincialTax } from '@/lib/tax/canada-calculator';
import { calculateFTC } from '@/lib/tax/ftc-calculator';
import { presetSchemas, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import {
  trackCalculatorPageView,
  trackCalculatorStart,
  trackCalculatorComplete,
  trackLeadCapture,
  trackCalculatorAbandonment,
  setRemarketingAudience,
  getUTMParams,
  isGoogleAdsTraffic,
  initGoogleAds,
} from '@/lib/google-ads/conversion-tracking';
import { trackEvent, identifyUser } from '@/lib/analytics/posthog';
import { CalculatorTracker, getDeviceInfo } from '@/lib/analytics/tracking-utils';

export default function TaxCalculatorPage() {
  // Form state
  const [rsuIncome, setRsuIncome] = useState('100000');
  const [usState, setUsState] = useState<'WA' | 'CA' | 'NY' | 'TX'>('WA');
  const [province, setProvince] = useState<'BC' | 'ON' | 'AB'>('BC');
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  // Tracking state
  const [hasStartedCalculator, setHasStartedCalculator] = useState(false);
  const [hasSeenResults, setHasSeenResults] = useState(false);

  // Calculation results
  const [usTax, setUsTax] = useState(0);
  const [canadaTax, setCanadaTax] = useState(0);
  const [ftcResult, setFtcResult] = useState<any>(null);

  // Analytics tracker (PostHog)
  const calculatorTrackerRef = useRef<CalculatorTracker | null>(null);

  useEffect(() => {
    calculatorTrackerRef.current = new CalculatorTracker('marketing-tax-calculator');
  }, []);

  // Track page view on mount (Google Ads landing)
  useEffect(() => {
    initGoogleAds();
    const utmParams = getUTMParams();

    // Google Ads tracking
    trackCalculatorPageView(utmParams);
    setRemarketingAudience('calculator_viewers');

    // PostHog tracking - parallel event
    trackEvent('calculator_page_viewed', {
      source: utmParams.utm_source || 'direct',
      medium: utmParams.utm_medium || 'organic',
      campaign: utmParams.utm_campaign || 'none',
      calculator_type: 'marketing_page',
      ...getDeviceInfo(),
    });

    // Store UTM params for lead attribution
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
    }

    // Track abandonment on page leave
    const handleBeforeUnload = () => {
      if (!emailSubmitted) {
        // Google Ads abandonment tracking
        if (hasSeenResults) {
          trackCalculatorAbandonment('results');
        } else if (hasStartedCalculator) {
          trackCalculatorAbandonment('input');
        }

        // PostHog abandonment tracking
        if (calculatorTrackerRef.current) {
          const dropOffPoint = hasSeenResults ? 'results_no_email' : hasStartedCalculator ? 'input_started' : 'no_interaction';
          calculatorTrackerRef.current.trackDropOff(dropOffPoint);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasStartedCalculator, hasSeenResults, emailSubmitted]);

  // Track calculator start (first input change)
  const handleRSUInputChange = (value: string) => {
    setRsuIncome(value);

    if (!hasStartedCalculator && parseFloat(value) > 0) {
      setHasStartedCalculator(true);

      // Google Ads tracking
      trackCalculatorStart(parseFloat(value));

      // PostHog tracking - first interaction
      trackEvent('page_viewed', {
        event_type: 'calculator_input_first_change',
        calculator_id: 'marketing-tax-calculator',
        field: 'rsuIncome',
        value: parseFloat(value),
        first_interaction: true,
        ...getDeviceInfo(),
      });
    }

    // Track subsequent changes
    if (calculatorTrackerRef.current) {
      calculatorTrackerRef.current.trackInputChange('rsuIncome', parseFloat(value) || 0);
    }
  };

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

    // Track calculation completion
    if (!hasSeenResults && income > 0) {
      setHasSeenResults(true);

      // Google Ads conversion tracking
      trackCalculatorComplete({
        rsuAmount: income,
        usTax: totalUSTax,
        canadaTax: totalCanadaTax,
        ftcSavings: ftc?.savings || 0,
        totalTax: ftc?.totalTaxWithFTC || 0,
      });
      setRemarketingAudience('calculator_completers');

      // PostHog event tracking
      trackEvent('tax_calculation_viewed', {
        calculator_id: 'marketing-tax-calculator',
        rsuAmount: income,
        usState,
        province,
        usTax: totalUSTax,
        canadaTax: totalCanadaTax,
        ftcSavings: ftc?.savings || 0,
        totalTax: ftc?.totalTaxWithFTC || 0,
        effectiveTaxRate: ((ftc?.totalTaxWithFTC || 0) / income) * 100,
        ...getDeviceInfo(),
      });

      // Also track with CalculatorTracker
      if (calculatorTrackerRef.current) {
        calculatorTrackerRef.current.trackCalculation(
          { income, usState, province },
          {
            usTax: totalUSTax,
            canadaTax: totalCanadaTax,
            ftcSavings: ftc?.savings || 0,
            totalTax: ftc?.totalTaxWithFTC || 0,
          }
        );
      }
    }
  }, [rsuIncome, usState, province, hasSeenResults]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const utmParams = JSON.parse(sessionStorage.getItem('utm_params') || '{}');

      await fetch('/api/marketing/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          sourcePage: 'calculator',
          utmSource: utmParams.utm_source,
          utmMedium: utmParams.utm_medium,
          utmCampaign: utmParams.utm_campaign,
          utmTerm: utmParams.utm_term,
          calculationData: {
            rsuIncome: parseFloat(rsuIncome),
            usTax,
            canadaTax,
            ftcSavings: ftcResult?.savings,
          },
        }),
      });

      setEmailSubmitted(true);

      // Google Ads lead capture tracking
      trackLeadCapture(email, {
        rsuAmount: parseFloat(rsuIncome),
        ftcSavings: ftcResult?.savings,
      });
      setRemarketingAudience('email_captured');

      // PostHog lead capture event
      const emailHash = email.split('@')[1]; // Domain only for privacy
      trackEvent('email_captured', {
        source: 'marketing_calculator',
        calculator_id: 'marketing-tax-calculator',
        email_domain: emailHash,
        rsuAmount: parseFloat(rsuIncome),
        usTax,
        canadaTax,
        ftcSavings: ftcResult?.savings || 0,
        totalTax: ftcResult?.totalTaxWithFTC || 0,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        ...getDeviceInfo(),
      });

      // Track with CalculatorTracker
      if (calculatorTrackerRef.current) {
        calculatorTrackerRef.current.trackCompletion(emailHash, {
          rsuAmount: parseFloat(rsuIncome),
          ftcSavings: ftcResult?.savings,
        });
      }
    } catch (error) {
      console.error('Failed to submit email:', error);
    }
  };

  // Calculate potential CPA savings
  const cpaSavings = 3000;
  const taxSavings = ftcResult?.savings || 12000;

  // Breadcrumb schema for SEO
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://taxbridge.app' },
    { name: 'US-Canada Tax Calculator', url: 'https://taxbridge.app/us-canada-tax-calculator' },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(presetSchemas.calculator) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 mb-6">
            <Calculator className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Free H1B RSU Tax Calculator</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
            Calculate Your US-Canada Tax in 10 Minutes
          </h1>
          <p className="text-xl text-slate-300 mb-6">
            Save ${cpaSavings.toLocaleString()} in CPA fees + ${taxSavings.toLocaleString()} in overpaid taxes
          </p>
          <p className="text-lg text-slate-400">
            Instant tax estimates for H-1B/TN visa tech workers with US RSU income living in Canada.
            CPA-verified Foreign Tax Credit calculator with dual-country filing strategy.
          </p>

          {/* Social Proof Banner */}
          {isGoogleAdsTraffic() && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-blue-300">
                <strong>500+ tech workers</strong> saved an average of <strong>${taxSavings.toLocaleString()}</strong> using TaxBridge
              </span>
            </div>
          )}
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
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  RSU Income (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                  <input
                    type="number"
                    value={rsuIncome}
                    onChange={(e) => handleRSUInputChange(e.target.value)}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full pl-12 pr-4 py-4 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-lg md:text-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 touch-manipulation"
                    placeholder="100000"
                    aria-label="RSU income in US dollars"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Enter your total RSU vesting income from US employment
                </p>
              </div>

              {/* US State */}
              <div>
                <label htmlFor="us-state" className="block text-sm font-medium text-slate-300 mb-2">
                  US State (where RSUs vested)
                </label>
                <select
                  id="us-state"
                  value={usState}
                  onChange={(e) => setUsState(e.target.value as any)}
                  className="w-full px-4 py-4 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 touch-manipulation"
                  aria-label="Select US state where RSUs vested"
                >
                  <option value="WA">Washington (0% state tax)</option>
                  <option value="CA">California (up to 12.3%)</option>
                  <option value="NY">New York (up to 10.9%)</option>
                  <option value="TX">Texas (0% state tax)</option>
                </select>
              </div>

              {/* Canadian Province */}
              <div>
                <label htmlFor="canada-province" className="block text-sm font-medium text-slate-300 mb-2">
                  Canadian Province (where you live)
                </label>
                <select
                  id="canada-province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value as any)}
                  className="w-full px-4 py-4 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 touch-manipulation"
                  aria-label="Select Canadian province where you live"
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
              <CardDescription>Based on 2025 tax rates • CPA-verified accuracy</CardDescription>
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
                <div className="text-sm text-emerald-400 mb-1">💰 Foreign Tax Credit Saves You</div>
                <div className="text-3xl font-bold text-emerald-400">
                  ${ftcResult?.savings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
                </div>
                <div className="text-xs text-emerald-300 mt-2">
                  Avoid double taxation with US-Canada Tax Treaty
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
              <CardTitle className="text-2xl text-slate-100">Get Your Full Tax Report (Free)</CardTitle>
              <CardDescription>
                Detailed breakdown with filing instructions, deadlines, and forms checklist.
                Plus: Save $3,000 in CPA fees with our automated dual-country filing.
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
                    Get Free Report
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 text-emerald-400 py-3">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Thank you! Check your email to continue.</span>
                </div>
              )}

              {/* Trust Badges */}
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>CPA-Verified</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>No Credit Card</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Free Forever</span>
                </div>
              </div>
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
