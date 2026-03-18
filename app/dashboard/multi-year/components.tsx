'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown, Info } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface YearlyData {
  year: number;
  totalIncome: number;
  usTax: number;
  canadaTax: number;
  ftcSavings: number;
  entryCount: number;
}

interface FTCCarryforwardRecord {
  id: number;
  user_id: number;
  year: number;
  unused_ftc_cad: number;
  source_year: number;
  expires_at: number;
  applied_to_year: number | null;
  created_at: string;
}

// ============================================================================
// Year Selector Component
// ============================================================================

interface YearSelectorProps {
  selectedYear: number;
  availableYears: number[];
}

export function YearSelector({ selectedYear, availableYears }: YearSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const handleYearChange = (year: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('year', year.toString());
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-40 flex items-center justify-between px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 hover:bg-slate-700 transition-colors"
      >
        <span className="font-medium">{selectedYear}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => handleYearChange(year)}
                className={`w-full text-left px-4 py-2 hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  year === selectedYear ? 'bg-slate-700 text-emerald-400' : 'text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{year}</span>
                  {year === selectedYear && (
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Income Line Chart Component
// ============================================================================

interface IncomeLineChartProps {
  data: YearlyData[];
}

export function IncomeLineChart({ data }: IncomeLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        No data available
      </div>
    );
  }

  const chartData = data.map((d) => ({
    year: d.year.toString(),
    income: d.totalIncome,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis dataKey="year" stroke="#94a3b8" />
        <YAxis
          stroke="#94a3b8"
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
          formatter={(value: any) => [`$${(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, 'Income']}
          labelStyle={{ color: '#94a3b8' }}
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#10b981"
          strokeWidth={3}
          dot={{ fill: '#10b981', r: 5 }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ============================================================================
// Cumulative Tax Area Chart Component
// ============================================================================

interface CumulativeTaxAreaChartProps {
  data: YearlyData[];
}

export function CumulativeTaxAreaChart({ data }: CumulativeTaxAreaChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        No data available
      </div>
    );
  }

  const chartData = data.map((d) => ({
    year: d.year.toString(),
    usTax: d.usTax,
    canadaTax: d.canadaTax,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorUS" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorCanada" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis dataKey="year" stroke="#94a3b8" />
        <YAxis
          stroke="#94a3b8"
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
          formatter={(value: any) => `$${(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          labelStyle={{ color: '#94a3b8' }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="square"
          formatter={(value) => (
            <span className="text-slate-300">{value === 'usTax' ? 'US Tax' : 'Canada Tax'}</span>
          )}
        />
        <Area
          type="monotone"
          dataKey="usTax"
          stackId="1"
          stroke="#3b82f6"
          fill="url(#colorUS)"
          name="usTax"
        />
        <Area
          type="monotone"
          dataKey="canadaTax"
          stackId="1"
          stroke="#ef4444"
          fill="url(#colorCanada)"
          name="canadaTax"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ============================================================================
// FTC Carryforward Banner Component
// ============================================================================

interface FTCCarryforwardBannerProps {
  availableCarryforward: number;
  carryforwardRecords: FTCCarryforwardRecord[];
  selectedYear: number;
}

export function FTCCarryforwardBanner({
  availableCarryforward,
  carryforwardRecords,
  selectedYear,
}: FTCCarryforwardBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (availableCarryforward <= 0) {
    return null;
  }

  // Calculate potential savings (simplified - actual savings depend on current year tax liability)
  const potentialSavings = availableCarryforward;

  return (
    <Alert variant="info" className="mb-8">
      <Info className="h-5 w-5" />
      <div className="flex-1">
        <AlertTitle className="text-blue-300">FTC Carryforward Available</AlertTitle>
        <AlertDescription className="text-blue-200 mt-2">
          <div className="flex flex-col gap-2">
            <p>
              Potential savings from prior year FTC carryforward:{' '}
              <span className="font-bold text-emerald-400">
                ${potentialSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-400 hover:text-blue-300 underline text-left"
            >
              {isExpanded ? 'Hide details' : 'Click to see details'}
            </button>
          </div>

          {isExpanded && (
            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-blue-500/20">
              <h4 className="text-sm font-semibold text-blue-300 mb-3">
                Carryforward Records
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 px-3 text-slate-400 font-medium">
                        Source Year
                      </th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">Amount</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">
                        Expires
                      </th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carryforwardRecords.map((record) => (
                      <tr key={record.id} className="border-b border-slate-800/50">
                        <td className="py-2 px-3 text-blue-200">{record.source_year}</td>
                        <td className="py-2 px-3 text-right text-emerald-400">
                          ${record.unused_ftc_cad.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          {record.expires_at}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {record.applied_to_year ? (
                            <span className="text-amber-400 text-xs">
                              Applied to {record.applied_to_year}
                            </span>
                          ) : (
                            <span className="text-emerald-400 text-xs">Available</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-slate-400 mt-3">
                FTC can be carried forward up to 10 years under IRS and CRA rules. Apply these
                credits to reduce your {selectedYear} Canada tax liability.
              </p>
            </div>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
}
