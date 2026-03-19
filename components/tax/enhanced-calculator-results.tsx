'use client';

import { useState } from 'react';
import { ArrowRight, Download, TrendingUp, Shield, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaxComparison } from '@/components/tax/tax-comparison';
import { InfoTooltip, TooltipProvider } from '@/components/ui/tooltip';
import { Spinner } from '@/components/ui/spinner';
import { trackEvent } from '@/lib/analytics/posthog';
import TestimonialCarousel from '@/components/TestimonialCarousel';

interface EnhancedCalculatorResultsProps {
  // Calculation inputs
  rsuIncome: number;
  usState: string;
  province: string;

  // Tax calculation results
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

  // Email capture state
  email: string;
  setEmail: (email: string) => void;
  onEmailSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  emailSubmitted: boolean;
}

export function EnhancedCalculatorResults({
  rsuIncome,
  usState,
  province,
  usTax,
  canadaTax,
  rsuValueCad,
  exchangeRate,
  email,
  setEmail,
  onEmailSubmit,
  isSubmitting,
  emailSubmitted,
}: EnhancedCalculatorResultsProps) {
  const [showFullBreakdown, setShowFullBreakdown] = useState(false);

  // Calculate personalized savings metrics
  const totalTaxWithoutFTC = usTax.total + canadaTax.totalBeforeFTC;
  const totalTaxWithFTC = usTax.total + canadaTax.netTotal;
  const ftcSavings = canadaTax.ftc.amount;
  const effectiveRate = (totalTaxWithFTC / rsuIncome) * 100;
  const savingsVsDoubleTax = totalTaxWithoutFTC - totalTaxWithFTC;

  // Calculate what they'd pay without treaty
  const doubleTaxAmount = usTax.total + canadaTax.totalBeforeFTC;
  const treatySavings = doubleTaxAmount - totalTaxWithFTC;

  return (
    <TooltipProvider>
      <div className="space-y-8 mt-8">
        {/* Key Savings Highlight - Above the fold */}
        <Card className="border-2 border-emerald-500 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-slate-100 mb-2">Your Personalized Tax Report</CardTitle>
                <CardDescription className="text-base">
                  Based on ${rsuIncome.toLocaleString()} RSU income • {usState} → {province}
                </CardDescription>
              </div>
              <div className="hidden md:block">
                <div className="text-right">
                  <div className="text-sm text-emerald-400 mb-1">Foreign Tax Credit Saves You</div>
                  <div className="text-4xl font-bold text-emerald-400">
                    ${ftcSavings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile savings display */}
            <div className="md:hidden mb-6 text-center p-4 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
              <div className="text-sm text-emerald-400 mb-1">Foreign Tax Credit Saves You</div>
              <div className="text-4xl font-bold text-emerald-400">
                ${ftcSavings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            </div>

            {/* Personalized Savings Breakdown */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-400" />
                  <div className="text-sm text-slate-400">Total Tax (optimized)</div>
                </div>
                <div className="text-2xl font-bold text-slate-100">
                  ${totalTaxWithFTC.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-slate-500 mt-1">Effective rate: {effectiveRate.toFixed(1)}%</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-amber-400" />
                  <div className="text-sm text-slate-400">Without FTC Treaty</div>
                </div>
                <div className="text-2xl font-bold text-slate-100">
                  ${doubleTaxAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-red-400 mt-1">Double taxation ❌</div>
              </div>

              <div className="p-4 rounded-lg bg-emerald-500/10 border-2 border-emerald-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-emerald-400" />
                  <div className="text-sm text-emerald-400">You Save</div>
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  ${treatySavings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-emerald-300 mt-1">
                  {((treatySavings / doubleTaxAmount) * 100).toFixed(1)}% savings ✓
                </div>
              </div>
            </div>

            {/* Prominent Save This Report CTA */}
            {!emailSubmitted ? (
              <div className="p-6 rounded-xl bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border-2 border-emerald-500/40">
                <div className="flex items-start gap-3 mb-4">
                  <Download className="h-6 w-6 text-emerald-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-100 mb-1">
                      Save This Report & Get Your Complete Filing Checklist
                    </h3>
                    <p className="text-sm text-slate-400">
                      Create a free account to save your calculations, track multi-year RSU income,
                      and get step-by-step filing instructions for both countries.
                      <span className="text-emerald-400 font-semibold"> No credit card required.</span>
                    </p>
                  </div>
                </div>

                <form onSubmit={onEmailSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email to get started"
                    required
                    className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-slate-950 font-bold whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl px-8"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="text-slate-950" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Save My Report
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Save unlimited calculations</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Multi-year RSU tracking</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Complete forms checklist</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span>PDF export</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/30">
                <div className="flex items-center justify-center gap-3 text-emerald-400">
                  <CheckCircle className="h-6 w-6" />
                  <div>
                    <p className="font-bold text-lg">Report Saved!</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Check your email to create your free account and access your full tax report.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Side-by-Side Tax Comparison Chart */}
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
            Detailed Tax Breakdown: US vs Canada
          </h2>
          <TaxComparison
            usTax={usTax}
            canadaTax={canadaTax}
            rsuValueUsd={rsuIncome}
            rsuValueCad={rsuValueCad}
            exchangeRate={exchangeRate}
          />
        </div>

        {/* How the Savings Work - Educational */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-xl text-slate-100">How Foreign Tax Credit Saves You Money</CardTitle>
            <CardDescription>Understanding your ${ftcSavings.toLocaleString()} in treaty benefits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <h3 className="font-semibold text-slate-100 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🇺🇸</span>
                    Without FTC Treaty
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">US Tax (Fed + State):</span>
                      <span className="font-semibold text-slate-100">
                        ${usTax.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Canada Tax (Fed + Prov):</span>
                      <span className="font-semibold text-slate-100">
                        ${canadaTax.totalBeforeFTC.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-700 pt-2">
                      <span className="text-slate-300 font-semibold">Total (Double Tax):</span>
                      <span className="font-bold text-red-400">
                        ${doubleTaxAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      ❌ You'd pay {((doubleTaxAmount / rsuIncome) * 100).toFixed(1)}% effective rate
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-emerald-500/10 border-2 border-emerald-500/30">
                  <h3 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🇨🇦</span>
                    With FTC Treaty
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">US Tax (Fed + State):</span>
                      <span className="font-semibold text-slate-100">
                        ${usTax.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Canada Tax (before FTC):</span>
                      <span className="text-slate-100">
                        ${canadaTax.totalBeforeFTC.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span className="font-medium">Foreign Tax Credit:</span>
                      <span className="font-semibold">
                        -${canadaTax.ftc.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-emerald-500/30 pt-2">
                      <span className="text-slate-100 font-semibold">Net Canada Tax:</span>
                      <span className="font-semibold text-slate-100">
                        ${canadaTax.netTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-emerald-500/30 pt-2">
                      <span className="text-emerald-400 font-bold">Total Tax (Optimized):</span>
                      <span className="font-bold text-emerald-400">
                        ${totalTaxWithFTC.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-emerald-300 mt-2">
                      ✓ You pay {effectiveRate.toFixed(1)}% effective rate
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-slate-300">
                  <strong className="text-blue-400">How it works:</strong> {canadaTax.ftc.explanation}
                  This prevents you from being taxed twice on the same income, saving you <strong className="text-emerald-400">${ftcSavings.toLocaleString()}</strong> annually.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Proof Testimonials */}
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-6 text-center">
            Trusted by Tech Workers Navigating Cross-Border Taxes
          </h2>
          <TestimonialCarousel variant="default" limit={3} autoRotate={false} />
        </div>

        {/* Bottom CTA - Sticky urgency message */}
        {!emailSubmitted && (
          <Card className="border-2 border-emerald-500 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 sticky bottom-4 shadow-2xl">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-slate-100">Don't Lose Your ${ftcSavings.toLocaleString()} Savings!</p>
                    <p className="text-sm text-slate-400">Save this report now — calculations expire in 60 minutes</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                    if (emailInput) {
                      emailInput.focus();
                      emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    trackEvent('sticky_cta_clicked', {
                      ftc_savings: ftcSavings,
                      us_state: usState,
                      province: province,
                    });
                  }}
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold whitespace-nowrap shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                >
                  Save Report Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
