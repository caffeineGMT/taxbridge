'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/tooltip';

interface BracketBreakdown {
  bracket: string;
  rate: number;
  tax: number;
}

interface FederalTax {
  tax: number;
  effectiveRate: number;
  marginalRate: number;
  breakdown: BracketBreakdown[];
}

interface StateTax {
  tax: number;
  effectiveRate: number;
  breakdown: string;
}

interface ProvincialTax {
  tax: number;
  effectiveRate: number;
  breakdown: string;
}

interface USTax {
  federal: FederalTax;
  state: StateTax;
  total: number;
}

interface CanadaTax {
  federal: FederalTax;
  provincial: ProvincialTax;
  ftc: {
    amount: number;
    explanation: string;
  };
  totalBeforeFTC: number;
  netTotal: number;
}

interface TaxComparisonProps {
  usTax: USTax;
  canadaTax: CanadaTax;
  rsuValueUsd: number;
  rsuValueCad: number;
  exchangeRate: number;
}

const getRateColor = (rate: number) => {
  if (rate > 0.3) return { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' };
  if (rate > 0.15) return { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' };
  return { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' };
};

const getProgressColor = (rate: number) => {
  if (rate > 0.3) return 'bg-red-500';
  if (rate > 0.15) return 'bg-yellow-500';
  return 'bg-green-500';
};

export function TaxComparison({
  usTax,
  canadaTax,
  rsuValueUsd,
  rsuValueCad,
  exchangeRate,
}: TaxComparisonProps) {
  const usEffectiveRate = rsuValueUsd > 0 ? usTax.total / rsuValueUsd : 0;
  const canadaEffectiveRate = rsuValueCad > 0 ? canadaTax.netTotal / rsuValueCad : 0;

  const usColors = getRateColor(usEffectiveRate);
  const canadaColors = getRateColor(canadaEffectiveRate);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* US Tax Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">🇺🇸 US Tax</CardTitle>
          <CardDescription>Federal + State Tax Calculation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Taxable Income */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Taxable Income (USD)</p>
            <p className="text-2xl font-bold">
              ${rsuValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Federal Tax */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold inline-flex items-center">
                Federal Tax
              </h3>
              <div className="flex gap-2 items-center">
                <span className={`rounded-md px-2 py-1 text-xs font-medium ${usColors.bg} ${usColors.text}`}>
                  Marginal: {(usTax.federal.marginalRate * 100).toFixed(1)}%
                </span>
                <span className={`rounded-md px-2 py-1 text-xs font-medium ${usColors.bg} ${usColors.text}`}>
                  Effective: {(usTax.federal.effectiveRate * 100).toFixed(1)}%
                </span>
                <InfoTooltip content="Marginal rate is the tax rate on your next dollar of income. Effective rate is your total tax divided by total income — your actual average tax burden." />
              </div>
            </div>

            {/* Bracket Breakdown */}
            <div className="space-y-2">
              {usTax.federal.breakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.bracket}</span>
                    <span className="font-medium">
                      ${item.tax.toLocaleString()} @ {(item.rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={(item.rate * 100)}
                    className="h-1.5"
                    style={{ '--progress-bg': getProgressColor(item.rate) } as any}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Federal Tax:</span>
              <span className="font-bold">
                ${usTax.federal.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* State Tax */}
          <div className="space-y-2">
            <h3 className="font-semibold">State Tax</h3>
            <p className="text-sm text-muted-foreground">{usTax.state.breakdown}</p>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">State Tax:</span>
              <span className="font-bold">
                ${usTax.state.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Total US Tax */}
          <div className={`rounded-lg border-2 ${usColors.border} ${usColors.bg} p-4`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Total US Tax</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Effective Rate: {(usEffectiveRate * 100).toFixed(2)}%
                </p>
              </div>
              <p className={`text-3xl font-bold ${usColors.text}`}>
                ${usTax.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canada Tax Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">🇨🇦 Canada Tax</CardTitle>
          <CardDescription>Federal + Provincial Tax with Foreign Tax Credit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Taxable Income */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Taxable Income (CAD)</p>
            <p className="text-2xl font-bold">
              C${rsuValueCad.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              USD/CAD Rate: {exchangeRate.toFixed(4)}
            </p>
          </div>

          {/* Federal Tax */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Federal Tax</h3>
              <div className="flex gap-2 items-center">
                <span className={`rounded-md px-2 py-1 text-xs font-medium ${canadaColors.bg} ${canadaColors.text}`}>
                  Marginal: {(canadaTax.federal.marginalRate * 100).toFixed(1)}%
                </span>
                <span className={`rounded-md px-2 py-1 text-xs font-medium ${canadaColors.bg} ${canadaColors.text}`}>
                  Effective: {(canadaTax.federal.effectiveRate * 100).toFixed(1)}%
                </span>
                <InfoTooltip content="Marginal rate is the tax rate on your next dollar of income. Effective rate is your total tax divided by total income — your actual average tax burden." />
              </div>
            </div>

            {/* Bracket Breakdown */}
            <div className="space-y-2">
              {canadaTax.federal.breakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.bracket}</span>
                    <span className="font-medium">
                      C${item.tax.toLocaleString()} @ {(item.rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={(item.rate * 100)}
                    className="h-1.5"
                    style={{ '--progress-bg': getProgressColor(item.rate) } as any}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Federal Tax:</span>
              <span className="font-bold">
                C${canadaTax.federal.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Provincial Tax */}
          <div className="space-y-2">
            <h3 className="font-semibold">Provincial Tax</h3>
            <p className="text-sm text-muted-foreground">{canadaTax.provincial.breakdown}</p>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Provincial Tax:</span>
              <span className="font-bold">
                C${canadaTax.provincial.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Foreign Tax Credit */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <h3 className="font-semibold text-blue-900 mb-2 inline-flex items-center">
              Foreign Tax Credit (FTC)
              <InfoTooltip content="The Foreign Tax Credit lets you claim US taxes paid against your Canadian tax bill, preventing double taxation. Under the US-Canada tax treaty, you can credit most US taxes paid." />
            </h3>
            <p className="text-xs text-blue-700 mb-2">{canadaTax.ftc.explanation}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">FTC Amount:</span>
              <span className="text-lg font-bold text-blue-900">
                -C${canadaTax.ftc.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Net Canada Tax */}
          <div className={`rounded-lg border-2 ${canadaColors.border} ${canadaColors.bg} p-4`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Net Canada Tax After FTC</p>
                <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                  Effective Rate: {(canadaEffectiveRate * 100).toFixed(2)}%
                  <InfoTooltip content="Your effective Canadian tax rate after the Foreign Tax Credit is applied. This represents the additional tax you owe to Canada beyond what you've already paid to the US." />
                </p>
              </div>
              <p className={`text-3xl font-bold ${canadaColors.text}`}>
                C${canadaTax.netTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
