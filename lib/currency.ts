/**
 * Currency Conversion Utilities
 * Uses Bank of Canada daily and annual average exchange rates for USD/CAD
 */

import { cacheExchangeRate, getCachedExchangeRate } from './db/index';

// Bank of Canada annual average USD/CAD exchange rates (fallback)
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

/**
 * Get USD/CAD exchange rate for a specific date from cache or Bank of Canada API
 * @param date - Date string in ISO format (YYYY-MM-DD)
 * @returns Promise resolving to USD/CAD exchange rate
 */
export const getExchangeRate = async (date: string): Promise<number> => {
  try {
    // Check cache first
    const cachedRate = await getCachedExchangeRate(date);
    if (typeof cachedRate === 'number') {
      return cachedRate;
    }

    // Fetch from Bank of Canada Valet API
    const url = `https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?start_date=${date}&end_date=${date}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Bank of Canada API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Parse the rate from the response
    if (!data.observations || data.observations.length === 0) {
      throw new Error('No exchange rate data available for this date');
    }

    const rateValue = data.observations[0].FXUSDCAD?.v;
    if (!rateValue) {
      throw new Error('Invalid exchange rate data format');
    }

    const rate = parseFloat(rateValue);

    // Cache the rate in database
    cacheExchangeRate(date, rate);

    return rate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);

    // Fallback: Use annual average for the year
    const year = getYearFromDate(date);
    const yearRate = USD_CAD_RATES[year] || DEFAULT_RATE;
    console.warn(`Using annual average rate for ${year} as fallback: ${yearRate}`);
    return yearRate;
  }
};

/**
 * Convert USD amount to CAD using exchange rate for a specific date
 * @param amount - Amount in USD
 * @param date - Date string in ISO format (YYYY-MM-DD)
 * @returns Promise resolving to amount in CAD
 */
export const convertUsdToCadByDate = async (amount: number, date: string): Promise<number> => {
  const rate = await getExchangeRate(date);
  return amount * rate;
};
