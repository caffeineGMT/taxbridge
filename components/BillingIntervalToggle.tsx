/**
 * Billing Interval Toggle Component
 *
 * Allows users to switch between monthly and annual billing
 * Shows savings percentage for annual billing
 */

'use client';

import React from 'react';
import { BillingInterval } from '@/hooks/use-pricing-experiment';

interface BillingIntervalToggleProps {
  selected: BillingInterval;
  onSelect: (interval: BillingInterval) => void;
  annualPrice: number;
  monthlyPrice: number;
  className?: string;
}

export function BillingIntervalToggle({
  selected,
  onSelect,
  annualPrice,
  monthlyPrice,
  className = '',
}: BillingIntervalToggleProps) {
  // Calculate savings
  const monthlyTotal = monthlyPrice * 12;
  const savingsAmount = monthlyTotal - annualPrice;
  const savingsPercent = Math.round((savingsAmount / monthlyTotal) * 100);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="inline-flex items-center rounded-full bg-slate-800 p-1 border border-slate-700">
        <button
          onClick={() => onSelect('monthly')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selected === 'monthly'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => onSelect('annual')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
            selected === 'annual'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Annual
          {savingsPercent > 0 && (
            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
              Save {savingsPercent}%
            </span>
          )}
        </button>
      </div>

      {selected === 'annual' && savingsAmount > 0 && (
        <p className="text-sm text-emerald-400 font-medium animate-fadeIn">
          💰 Save ${savingsAmount}/year vs monthly billing
        </p>
      )}
    </div>
  );
}
