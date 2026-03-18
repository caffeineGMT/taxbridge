'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, FileText, AlertCircle } from 'lucide-react';

interface FilingStrategyCardProps {
  usTax: number;
  canadaTax: number;
  ftcAmount: number;
}

export function FilingStrategyCard({ usTax, canadaTax, ftcAmount }: FilingStrategyCardProps) {
  // Determine optimal strategy
  const strategy = usTax > 0 && ftcAmount > 0
    ? 'File US first, then claim Canadian Foreign Tax Credit'
    : 'Standard filing procedure';

  const steps = [
    {
      order: 1,
      title: 'File US Tax Return (1040 or 1040-NR)',
      description: 'Report RSU income on your US federal tax return. The vesting value is taxable as ordinary income.',
      icon: '🇺🇸',
      forms: ['Form 1040/1040-NR', 'Form W-2', 'State return (if applicable)'],
    },
    {
      order: 2,
      title: 'File Canada Tax Return (T1)',
      description: 'Report the same RSU income on your Canadian return. Canada taxes worldwide income for residents.',
      icon: '🇨🇦',
      forms: ['T1 General', 'T4 slip', 'Provincial return'],
    },
    {
      order: 3,
      title: 'Claim Foreign Tax Credit (T2209)',
      description: `Use Form T2209 to claim credit for US taxes paid. This prevents double taxation under Treaty Article XV.`,
      icon: '✅',
      forms: ['Form T2209 (Federal Foreign Tax Credit)', 'Provincial FTC form'],
      highlight: true,
    },
  ];

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          Recommended Filing Strategy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Strategy Summary */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-900 mb-1">Optimal Strategy</p>
              <p className="text-sm text-blue-700">{strategy}</p>
            </div>
          </div>
        </div>

        {/* Filing Steps */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Filing Steps</h3>
          {steps.map((step) => (
            <div
              key={step.order}
              className={`rounded-lg border p-4 ${
                step.highlight
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                    {step.order}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{step.icon}</span>
                    <h4 className="font-semibold">{step.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {step.forms.map((form) => (
                      <span
                        key={form}
                        className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                      >
                        {form}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Treaty Reference */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 mb-1">Tax Treaty Protection</p>
              <p className="text-sm text-amber-800">
                Your Foreign Tax Credit is protected under the <strong>US-Canada Tax Treaty Article XV</strong> (Dependent Personal Services).
                This prevents double taxation by allowing you to credit US taxes paid against your Canadian tax liability on the same income.
              </p>
            </div>
          </div>
        </div>

        {/* Key Amounts */}
        <div className="grid gap-3 md:grid-cols-3 pt-4 border-t">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">US Tax Paid</p>
            <p className="text-lg font-bold text-blue-600">
              ${usTax.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Canadian FTC</p>
            <p className="text-lg font-bold text-green-600">
              ${ftcAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Net Canada Tax</p>
            <p className="text-lg font-bold text-red-600">
              ${canadaTax.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
