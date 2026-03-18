'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/currency';

interface CurrencyDisplayProps {
  amountUsd: number;
  date: string;
  className?: string;
}

/**
 * Client component that displays an amount in both USD and CAD
 * Fetches the exchange rate from the API for the given date
 */
export function CurrencyDisplay({ amountUsd, date, className = '' }: CurrencyDisplayProps) {
  const [amountCad, setAmountCad] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch exchange rate from API endpoint
        const response = await fetch(`/api/exchange-rate?date=${date}`);

        if (!response.ok) {
          throw new Error('Failed to fetch exchange rate');
        }

        const data = await response.json();
        const cadAmount = amountUsd * data.rate;
        setAmountCad(cadAmount);
      } catch (err) {
        console.error('Error fetching exchange rate:', err);
        setError('Unable to convert to CAD');
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();
  }, [amountUsd, date]);

  return (
    <div className={className}>
      <div className="font-semibold">{formatCurrency(amountUsd, 'USD')}</div>
      {loading ? (
        <div className="text-sm text-gray-600">Converting to CAD...</div>
      ) : error ? (
        <div className="text-sm text-gray-500">{error}</div>
      ) : amountCad !== null ? (
        <div className="text-sm text-gray-600">{formatCurrency(amountCad, 'CAD')}</div>
      ) : null}
    </div>
  );
}
