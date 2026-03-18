'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpDown, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { RSUEntryRow } from '@/lib/db';
import { format } from 'date-fns';
import { ExportButton } from '@/components/export-button';
import { Button } from '@/components/ui/button';

interface RSUListProps {
  events: RSUEntryRow[];
}

type SortColumn = 'vest_date' | 'employer' | 'total_value_usd';
type SortDirection = 'asc' | 'desc';

export function RSUList({ events }: RSUListProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('vest_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedEvents = [...events].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    if (sortColumn === 'vest_date') {
      return multiplier * (new Date(a.vest_date).getTime() - new Date(b.vest_date).getTime());
    } else if (sortColumn === 'employer') {
      return multiplier * a.employer.localeCompare(b.employer);
    } else {
      return multiplier * (a.total_value_usd - b.total_value_usd);
    }
  });

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-slate-500" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4 text-emerald-500" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 text-emerald-500" />
    );
  };

  if (events.length === 0) {
    return (
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-slate-100">RSU Vesting History</CardTitle>
          <CardDescription className="text-slate-400">
            Track all your RSU vesting events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-slate-500 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No RSU entries yet</h3>
            <p className="text-slate-500 mb-4">Get started by adding your first RSU vesting event</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm" data-tour="rsu-list">
      <CardHeader>
        <CardTitle className="text-xl text-slate-100">RSU Vesting History</CardTitle>
        <CardDescription className="text-slate-400">
          {events.length} vesting event{events.length !== 1 ? 's' : ''} recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th
                  className="text-left py-3 px-4 text-sm font-semibold text-slate-300 cursor-pointer hover:text-emerald-500 transition-colors"
                  onClick={() => handleSort('vest_date')}
                >
                  <div className="flex items-center">
                    Vesting Date
                    <SortIcon column="vest_date" />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-semibold text-slate-300 cursor-pointer hover:text-emerald-500 transition-colors"
                  onClick={() => handleSort('employer')}
                >
                  <div className="flex items-center">
                    Employer
                    <SortIcon column="employer" />
                  </div>
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                  Shares
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                  FMV
                </th>
                <th
                  className="text-right py-3 px-4 text-sm font-semibold text-slate-300 cursor-pointer hover:text-emerald-500 transition-colors"
                  onClick={() => handleSort('total_value_usd')}
                >
                  <div className="flex items-center justify-end">
                    Total Value
                    <SortIcon column="total_value_usd" />
                  </div>
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-slate-400">
                    {format(new Date(event.vest_date), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-slate-200">
                        {event.employer}
                      </span>
                      {event.ticker_symbol && (
                        <span className="ml-2 text-xs text-slate-500">
                          ({event.ticker_symbol})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300 text-right">
                    {event.shares.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300 text-right">
                    ${event.fmv_usd.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-emerald-400 text-right">
                    ${event.total_value_usd.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/rsu/${event.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-slate-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <ExportButton
                        rsuId={event.id}
                        variant="ghost"
                        size="sm"
                        showText={false}
                        className="h-8 w-8 p-0 hover:bg-slate-700"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
