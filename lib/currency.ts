/**
 * Currency Conversion Utilities
 * Uses Bank of Canada annual average exchange rates for USD/CAD
 */

// Bank of Canada annual average USD/CAD exchange rates
// Source: https://www.bankofcanada.ca/rates/exchange/annual-average-exchange-rates/
const USD_CAD_RATES: Record<number, number> = {
  2020: 1.3415,
  2021: 1.2535,
  2022: 1.3013,
  2023: 1.3497,
  2024: 1.3563,
  2025: 1.3800, // Placeholder - update with actual rate when available
  2026: 1.3800, // Placeholder - update with actual rate when available
};

// Default rate to use if year is not found
const DEFAULT_RATE = 1.38;

/**
 * Convert USD amount to CAD using a specific exchange rate
 * @param amount - Amount in USD
 * @param rate - USD/CAD exchange rate
 * @returns Amount in CAD
 */
export const convertUsdToCad = (amount: number, rate: number): number => {
  return amount * rate;
};

/**
 * Convert USD amount to CAD using the annual average exchange rate
 * @param amountUsd - Amount in USD
 * @param year - Calendar year for the exchange rate
 * @returns Amount in CAD
 */
export const convertUsdToCadByYear = (amountUsd: number, year: number): number => {
  const rate = USD_CAD_RATES[year] || DEFAULT_RATE;
  return amountUsd * rate;
};

/**
 * Convert CAD amount to USD using the annual average exchange rate
 * @param amountCad - Amount in CAD
 * @param year - Calendar year for the exchange rate
 * @returns Amount in USD
 */
export const convertCadToUsd = (amountCad: number, year: number): number => {
  const rate = USD_CAD_RATES[year] || DEFAULT_RATE;
  return amountCad / rate;
};

/**
 * Get the average USD/CAD exchange rate for a given year
 * @param year - Calendar year
 * @returns USD/CAD exchange rate
 */
export const getAverageRate = (year: number): number => {
  return USD_CAD_RATES[year] || DEFAULT_RATE;
};

/**
 * Get the year from a date string
 * @param dateString - Date string in ISO format (YYYY-MM-DD)
 * @returns Calendar year
 */
export const getYearFromDate = (dateString: string): number => {
  const date = new Date(dateString);
  return date.getFullYear();
};

/**
 * Format currency amount with proper symbol and decimals
 * @param amount - Amount to format
 * @param currency - Currency code ('USD' or 'CAD')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: 'USD' | 'CAD'): string => {
  const symbol = currency === 'USD' ? '$' : 'C$';
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Get all available exchange rates
 * @returns Object with year-rate pairs
 */
export const getAllRates = (): Record<number, number> => {
  return { ...USD_CAD_RATES };
};
