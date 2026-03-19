import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with cross-browser consistent output.
 * Uses Intl.NumberFormat with explicit locale to avoid browser-specific differences.
 */
export function formatCurrency(
  value: number,
  currency: 'USD' | 'CAD' = 'USD',
  options?: { showSymbol?: boolean; minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const {
    showSymbol = true,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options || {};

  try {
    if (showSymbol) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(value);
    }

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value);
  } catch {
    // Fallback for any edge cases
    return `$${value.toFixed(minimumFractionDigits)}`;
  }
}
