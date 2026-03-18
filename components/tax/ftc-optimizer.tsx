'use client';

import { useState, useEffect } from 'react';
import { TaxComparisonChart } from './tax-comparison-chart';
import { FilingStrategyCard } from './filing-strategy-card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RSUEntry {
  id: number;
  employer: string;
  tickerSymbol: string;
  vestingDate: string;
  shares: number;
  fmvUsd: number;
  totalValueUsd: number;
  totalValueCad: number;
}

interface FTCOptimizerProps {
  rsuEntry: RSUEntry;
  usTax: number;
  canadaTax: number;
  ftcAmount: number;
  canadaTaxBeforeFTC: number;
}

export function FTCOptimizer({
  rsuEntry,
  usTax,
  canadaTax,
  ftcAmount,
  canadaTaxBeforeFTC,
}: FTCOptimizerProps) {
  const totalTaxBefore = usTax + canadaTaxBeforeFTC;
  const totalTaxAfter = usTax + canadaTax;
  const savingsAmount = ftcAmount;
  const savingsPercent = totalTaxBefore > 0 ? (savingsAmount / totalTaxBefore) * 100 : 0;

  // Track FTC optimizer usage on component mount
  useEffect(() => {
    // Call analytics tracking API
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'ftc_optimizer_used',
        metadata: {
          rsu_id: rsuEntry.id,
          savings_amount: savingsAmount,
          savings_percent: savingsPercent,
        },
      }),
    }).catch(err => console.error('Analytics tracking failed:', err));
  }, [rsuEntry.id, savingsAmount, savingsPercent]);

  return (
    <div className="space-y-6">
      {/* Header with Savings Highlight */}
      <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <span className="text-4xl">🎯</span>
            Foreign Tax Credit Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">You Save with FTC</p>
              <p className="text-4xl font-bold text-green-600">
                ${savingsAmount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 border-2 border-green-300">
                <span className="text-3xl font-bold text-green-700">
                  {savingsPercent.toFixed(1)}%
                </span>
                <span className="text-sm font-medium text-green-700">
                  tax reduction
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Without FTC, you'd pay ${totalTaxBefore.toLocaleString()} total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Comparison Chart */}
      <TaxComparisonChart
        beforeFTC={{
          usTax: usTax,
          canadaTax: canadaTaxBeforeFTC,
        }}
        afterFTC={{
          usTax: usTax,
          canadaTax: canadaTax,
        }}
        ftcAmount={ftcAmount}
      />

      {/* Filing Strategy */}
      <FilingStrategyCard
        usTax={usTax}
        canadaTax={canadaTax}
        ftcAmount={ftcAmount}
      />

      {/* Detailed Explanation (Accordion) */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-ftc-works" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <span>📚</span>
              <span>How Does Foreign Tax Credit Work?</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-4 pt-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Foreign Tax Credit (FTC)?</h4>
              <p>
                Foreign Tax Credit is a tax relief mechanism that prevents double taxation when you're taxed on the same income
                in two countries. As a Canadian resident with US-sourced RSU income, you must report this income in both countries.
                The FTC allows you to credit the US taxes you paid against your Canadian tax liability.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How is FTC Calculated?</h4>
              <p className="mb-2">The FTC amount is the <strong>lesser of</strong>:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>The US tax you actually paid (${usTax.toLocaleString()})</li>
                <li>Canada's tax rate applied to the US-sourced income</li>
              </ol>
              <p className="mt-2">
                In your case, the FTC is <strong>${ftcAmount.toLocaleString()}</strong>, which reduces your Canadian tax
                from ${canadaTaxBeforeFTC.toLocaleString()} to ${canadaTax.toLocaleString()}.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Treaty Article XV Protection</h4>
              <p>
                The <strong>US-Canada Tax Treaty Article XV</strong> covers "Dependent Personal Services" (employment income).
                It ensures that RSU income from your US employer is primarily taxable in the US, but Canada (as your country of residence)
                can also tax it while providing credit for US taxes paid. This prevents you from being taxed twice on the same dollar.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Key Forms You'll Need</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>US:</strong> Form 1040 or 1040-NR (nonresident), W-2 from employer, state return</li>
                <li><strong>Canada:</strong> T1 General, T4 slip, T2209 (Federal Foreign Tax Credit), provincial FTC form</li>
              </ul>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
              <p className="text-blue-800">
                Always file your US return first and get your final tax amount before filing your Canadian return.
                You'll need the exact US tax paid to claim the correct FTC on your T2209 form. Keep copies of both returns
                for at least 6 years in case of audit.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ftc-limits" className="border rounded-lg px-4 mt-4">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>Important Limitations & Considerations</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-4 pt-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">FTC is Capped</h4>
              <p>
                If you paid more US tax than Canada would have charged on that income, the excess is lost—you can't get a refund
                for it. This happens when US tax rates exceed Canadian rates, especially with high state taxes (CA, NY).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Timing Matters</h4>
              <p>
                You can only claim FTC for taxes actually <em>paid</em> in the year. If you filed a US extension and paid later,
                you claim the FTC in the year you paid, not the year the income was earned.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Currency Conversion</h4>
              <p>
                Convert your US taxes paid to CAD using the Bank of Canada average exchange rate for the year.
                TaxBridge handles this automatically using official BoC rates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">State vs Federal</h4>
              <p>
                Both US federal and state taxes are eligible for FTC in Canada. Make sure to include both when claiming your credit.
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <h4 className="font-semibold text-amber-900 mb-2">⚖️ Tax Professional Recommended</h4>
              <p className="text-amber-800">
                Cross-border tax situations can be complex. While TaxBridge provides accurate calculations based on standard scenarios,
                consider consulting a cross-border tax specialist (CPA or CA with US/Canada expertise) for your specific situation,
                especially if you have multiple income sources, investments, or own property in both countries.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
