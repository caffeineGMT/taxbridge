'use client';

import { useState } from 'react';
import { TrendingUp, Clock, DollarSign, Users } from 'lucide-react';

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
  const [inputs, setInputs] = useState<ROIInputs>({
    firmName: '',
    attorneyCount: 50,
    clientsPerYear: 200,
    hoursPerWeek: 5,
    billableRate: 250,
  });

  const [showResults, setShowResults] = useState(false);

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

  const handleCalculate = () => {
    setShowResults(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-surface border border-border rounded-xl p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">ROI Calculator</h2>
          <p className="text-textMuted">
            Calculate how much your firm could save with TaxBridge Enterprise
          </p>
        </div>

        {/* Input Form */}
        <div className="space-y-6 mb-8">
          {/* Firm Name */}
          <div>
            <label htmlFor="firmName" className="block text-sm font-semibold text-text mb-2">
              Firm Name
            </label>
            <input
              id="firmName"
              type="text"
              placeholder="e.g., Berry Appleman & Leiden LLP"
              value={inputs.firmName}
              onChange={(e) => setInputs({ ...inputs, firmName: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Number of Attorneys */}
          <div>
            <label htmlFor="attorneyCount" className="block text-sm font-semibold text-text mb-2">
              Number of Attorneys
            </label>
            <input
              id="attorneyCount"
              type="number"
              min="1"
              value={inputs.attorneyCount}
              onChange={(e) => setInputs({ ...inputs, attorneyCount: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* H-1B/TN Clients per Year */}
          <div>
            <label htmlFor="clientsPerYear" className="block text-sm font-semibold text-text mb-2">
              H-1B/TN Clients per Year
            </label>
            <input
              id="clientsPerYear"
              type="number"
              min="1"
              value={inputs.clientsPerYear}
              onChange={(e) => setInputs({ ...inputs, clientsPerYear: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Hours Spent on Tax Questions per Week */}
          <div>
            <label htmlFor="hoursPerWeek" className="block text-sm font-semibold text-text mb-2">
              Hours Spent on Tax Questions per Week
            </label>
            <input
              id="hoursPerWeek"
              type="number"
              min="0"
              step="0.5"
              value={inputs.hoursPerWeek}
              onChange={(e) => setInputs({ ...inputs, hoursPerWeek: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            <p className="text-sm text-textMuted mt-1">
              Include paralegal + attorney time answering client questions about cross-border tax
            </p>
          </div>

          {/* Average Billable Rate */}
          <div>
            <label htmlFor="billableRate" className="block text-sm font-semibold text-text mb-2">
              Average Billable Rate ($/hour)
            </label>
            <input
              id="billableRate"
              type="number"
              min="1"
              step="10"
              value={inputs.billableRate}
              onChange={(e) => setInputs({ ...inputs, billableRate: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          className="w-full px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          Calculate Your ROI
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
                    <div className="text-3xl font-bold text-text">{Math.round(results.hoursSaved)}</div>
                    <div className="text-sm text-textMuted">hours saved per year</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-text">
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
                className="inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Start 30-Day Free Trial
              </a>
              <p className="text-sm text-textMuted mt-3">
                No credit card required • Full access • Personal onboarding call included
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
