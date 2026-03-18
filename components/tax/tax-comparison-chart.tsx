'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TaxDataPoint {
  name: string;
  usTax: number;
  canadaTax: number;
  savings?: number;
}

interface TaxComparisonChartProps {
  beforeFTC: {
    usTax: number;
    canadaTax: number;
  };
  afterFTC: {
    usTax: number;
    canadaTax: number;
  };
  ftcAmount: number;
}

const COLORS = {
  usTax: '#2563eb', // blue-600
  canadaTax: '#dc2626', // red-600
  savings: '#16a34a', // green-600
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="font-semibold mb-2">{payload[0].payload.name}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}:</span>
            </div>
            <span className="font-bold">
              ${entry.value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TaxComparisonChart({ beforeFTC, afterFTC, ftcAmount }: TaxComparisonChartProps) {
  const data: TaxDataPoint[] = [
    {
      name: 'Before FTC',
      usTax: beforeFTC.usTax,
      canadaTax: beforeFTC.canadaTax,
    },
    {
      name: 'After FTC',
      usTax: afterFTC.usTax,
      canadaTax: afterFTC.canadaTax,
      savings: ftcAmount,
    },
  ];

  const totalBefore = beforeFTC.usTax + beforeFTC.canadaTax;
  const totalAfter = afterFTC.usTax + afterFTC.canadaTax;
  const savingsPercent = totalBefore > 0 ? ((ftcAmount / totalBefore) * 100) : 0;

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <span className="text-3xl">💰</span>
          Tax Savings with FTC
        </CardTitle>
        <CardDescription>
          Visual comparison showing the impact of Foreign Tax Credit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="usTax" name="US Tax" stackId="a" fill={COLORS.usTax} />
              <Bar dataKey="canadaTax" name="Canada Tax" stackId="a" fill={COLORS.canadaTax} />
              <Bar dataKey="savings" name="FTC Savings" fill={COLORS.savings} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm font-medium text-red-900 mb-1">Total Tax Before FTC</p>
            <p className="text-2xl font-bold text-red-600">
              ${totalBefore.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-red-700 mt-1">
              Double taxation burden
            </p>
          </div>

          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm font-medium text-green-900 mb-1">FTC Savings</p>
            <p className="text-2xl font-bold text-green-600">
              ${ftcAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-green-700 mt-1">
              {savingsPercent.toFixed(1)}% reduction
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm font-medium text-blue-900 mb-1">Total Tax After FTC</p>
            <p className="text-2xl font-bold text-blue-600">
              ${totalAfter.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Actual tax burden
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
