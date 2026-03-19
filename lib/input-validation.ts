/**
 * Input validation and sanitization utilities for numeric and currency inputs
 * Handles edge cases: empty inputs, non-numeric values, copy-paste with special chars,
 * negative numbers, and extreme values
 */

export interface SanitizeOptions {
  /** Allow negative numbers (default: false) */
  allowNegative?: boolean;
  /** Maximum allowed value (default: 10000000 for $10M) */
  maxValue?: number;
  /** Minimum allowed value (default: 0 unless allowNegative is true) */
  minValue?: number;
  /** Maximum decimal places (default: 2 for currency) */
  decimalPlaces?: number;
  /** Allow zero values (default: true) */
  allowZero?: boolean;
}

/**
 * Sanitizes numeric input by removing common formatting characters and validating
 *
 * Examples:
 * - "$1,234.56" -> 1234.56
 * - "1e6" -> "" (blocked)
 * - "-100" -> "" (if allowNegative=false)
 * - "abc123" -> 123
 * - "  $5,000  " -> 5000
 *
 * @param value - Raw input string from user
 * @param options - Sanitization options
 * @returns Sanitized numeric string (empty if invalid)
 */
export function sanitizeCurrencyInput(
  value: string,
  options: SanitizeOptions = {}
): string {
  const {
    allowNegative = false,
    maxValue = 10_000_000, // $10M default max
    minValue = allowNegative ? -10_000_000 : 0,
    decimalPlaces = 2,
    allowZero = true,
  } = options;

  if (!value || typeof value !== 'string') {
    return '';
  }

  // Step 1: Remove all whitespace
  let cleaned = value.trim().replace(/\s+/g, '');

  // Step 2: Remove currency symbols ($, C$, USD, CAD, etc.)
  cleaned = cleaned
    .replace(/^\$/, '') // Leading dollar sign
    .replace(/^C\$/, '') // Canadian dollar
    .replace(/USD|CAD|usd|cad/gi, '') // Currency codes
    .replace(/,/g, ''); // Thousands separators

  // Step 3: Block scientific notation - check BEFORE removing letters
  // Match valid scientific notation: number followed by e/E followed by optional sign and number
  if (/^-?\d*\.?\d+[eE][+-]?\d+$/.test(cleaned)) {
    return '';
  }

  // Step 4: Block plus sign (can lead to confusing behavior)
  if (/\+/.test(cleaned)) {
    return '';
  }

  // Step 5: Handle negative sign
  const isNegative = cleaned.startsWith('-');
  if (isNegative && !allowNegative) {
    return '';
  }

  // Step 6: Remove all non-numeric characters except decimal point and minus
  cleaned = cleaned.replace(/[^0-9.-]/g, '');

  // Step 7: Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    // Multiple decimal points - keep first decimal point and only first decimal part
    cleaned = parts[0] + '.' + parts[1];
  }

  // Step 8: Ensure only one minus sign at the start
  if (isNegative) {
    cleaned = '-' + cleaned.replace(/-/g, '');
  }

  // Step 9: Reject trailing decimal point without digits
  if (cleaned.endsWith('.')) {
    return '';
  }

  // Step 10: Validate it's a valid number
  if (cleaned === '' || cleaned === '-' || cleaned === '.') {
    return '';
  }

  const numValue = parseFloat(cleaned);
  if (isNaN(numValue)) {
    return '';
  }

  // Step 11: Check zero allowance
  if (!allowZero && numValue === 0) {
    return '';
  }

  // Step 12: Enforce min/max bounds
  if (numValue < minValue || numValue > maxValue) {
    return '';
  }

  // Step 13: Enforce decimal precision (only if decimal point exists)
  if (parts.length === 2) {
    if (decimalPlaces === 0) {
      // Strip decimal point entirely when precision is 0
      cleaned = parts[0];
    } else if (parts[1].length > decimalPlaces) {
      const integerPart = parts[0];
      const decimalPart = parts[1].slice(0, decimalPlaces);
      cleaned = integerPart + '.' + decimalPart;
    }
  }

  return cleaned;
}

/**
 * Parse sanitized currency input to a number
 *
 * @param value - Sanitized input string
 * @param fallback - Fallback value if parsing fails (default: 0)
 * @returns Parsed number or fallback
 */
export function parseCurrencyInput(
  value: string,
  fallback: number = 0
): number {
  if (!value || value === '' || value === '-') {
    return fallback;
  }

  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Sanitizes integer input (for shares, counts, etc.)
 *
 * @param value - Raw input string
 * @param options - Sanitization options
 * @returns Sanitized integer string (empty if invalid)
 */
export function sanitizeIntegerInput(
  value: string,
  options: Omit<SanitizeOptions, 'decimalPlaces'> = {}
): string {
  const {
    allowNegative = false,
    maxValue = 1_000_000, // 1M default max for shares
    minValue = allowNegative ? -1_000_000 : 0,
    allowZero = true,
  } = options;

  const sanitized = sanitizeCurrencyInput(value, {
    allowNegative,
    maxValue,
    minValue,
    decimalPlaces: 0,
    allowZero,
  });

  // Remove any decimal point and trailing digits
  return sanitized.split('.')[0];
}

/**
 * Parse sanitized integer input to a number
 *
 * @param value - Sanitized input string
 * @param fallback - Fallback value if parsing fails (default: 0)
 * @returns Parsed integer or fallback
 */
export function parseIntegerInput(
  value: string,
  fallback: number = 0
): number {
  if (!value || value === '' || value === '-') {
    return fallback;
  }

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Format a number as currency with proper thousands separators
 *
 * @param value - Number to format
 * @param currency - Currency type (USD or CAD)
 * @param showSymbol - Whether to show currency symbol (default: true)
 * @returns Formatted currency string
 */
export function formatCurrencyDisplay(
  value: number,
  currency: 'USD' | 'CAD' = 'USD',
  showSymbol: boolean = true
): string {
  const symbol = currency === 'USD' ? '$' : 'C$';
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return showSymbol ? `${symbol}${formatted}` : formatted;
}

/**
 * Validate if a value is within acceptable bounds
 *
 * @param value - Number to validate
 * @param options - Validation options
 * @returns Object with isValid flag and error message
 */
export function validateNumericValue(
  value: number,
  options: SanitizeOptions = {}
): { isValid: boolean; error?: string } {
  const {
    allowNegative = false,
    maxValue = 10_000_000,
    minValue = allowNegative ? -10_000_000 : 0,
    allowZero = true,
  } = options;

  if (isNaN(value)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }

  if (!allowZero && value === 0) {
    return { isValid: false, error: 'Value must be greater than zero' };
  }

  if (!allowNegative && value < 0) {
    return { isValid: false, error: 'Negative values are not allowed' };
  }

  if (value < minValue) {
    return {
      isValid: false,
      error: `Value must be at least ${formatCurrencyDisplay(minValue)}`,
    };
  }

  if (value > maxValue) {
    return {
      isValid: false,
      error: `Value cannot exceed ${formatCurrencyDisplay(maxValue)}`,
    };
  }

  return { isValid: true };
}
