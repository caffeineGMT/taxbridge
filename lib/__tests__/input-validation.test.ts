/**
 * Comprehensive test suite for input validation edge cases
 * Tests: zero income, $10M RSUs, negative numbers, non-numeric input
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeCurrencyInput,
  parseCurrencyInput,
  sanitizeIntegerInput,
  parseIntegerInput,
  validateNumericValue,
} from '../input-validation';

describe('Currency Input Validation - Edge Cases', () => {
  describe('Zero values', () => {
    it('should allow zero when allowZero is true', () => {
      const result = sanitizeCurrencyInput('0', { allowZero: true });
      expect(result).toBe('0');
      expect(parseCurrencyInput(result)).toBe(0);
    });

    it('should reject zero when allowZero is false', () => {
      const result = sanitizeCurrencyInput('0', { allowZero: false });
      expect(result).toBe('');
    });

    it('should handle $0.00 input', () => {
      const result = sanitizeCurrencyInput('$0.00', { allowZero: true });
      expect(result).toBe('0.00');
    });
  });

  describe('Extreme high values - $10M+ RSUs', () => {
    it('should handle $10M RSU value', () => {
      const result = sanitizeCurrencyInput('10000000', { maxValue: 100_000_000 });
      expect(result).toBe('10000000');
      expect(parseCurrencyInput(result)).toBe(10_000_000);
    });

    it('should handle $50M with commas and dollar sign', () => {
      const result = sanitizeCurrencyInput('$50,000,000', { maxValue: 100_000_000 });
      expect(result).toBe('50000000');
      expect(parseCurrencyInput(result)).toBe(50_000_000);
    });

    it('should reject values above maxValue', () => {
      const result = sanitizeCurrencyInput('150000000', { maxValue: 100_000_000 });
      expect(result).toBe('');
    });

    it('should handle billion-dollar inputs within max', () => {
      const result = sanitizeCurrencyInput('1000000000', { maxValue: 2_000_000_000 });
      expect(result).toBe('1000000000');
    });
  });

  describe('Negative numbers', () => {
    it('should reject negative values by default', () => {
      const result = sanitizeCurrencyInput('-1000');
      expect(result).toBe('');
    });

    it('should allow negative values when allowNegative is true', () => {
      const result = sanitizeCurrencyInput('-1000', { allowNegative: true });
      expect(result).toBe('-1000');
      expect(parseCurrencyInput(result)).toBe(-1000);
    });

    it('should handle negative currency with symbols', () => {
      const result = sanitizeCurrencyInput('-$5,000.00', { allowNegative: true });
      expect(result).toBe('-5000.00');
    });

    it('should reject negative values below minValue', () => {
      const result = sanitizeCurrencyInput('-5000', {
        allowNegative: true,
        minValue: -1000,
      });
      expect(result).toBe('');
    });
  });

  describe('Non-numeric input', () => {
    it('should strip letters from input', () => {
      const result = sanitizeCurrencyInput('abc123def');
      expect(result).toBe('123');
    });

    it('should handle completely non-numeric input', () => {
      const result = sanitizeCurrencyInput('hello world');
      expect(result).toBe('');
    });

    it('should reject scientific notation', () => {
      const result = sanitizeCurrencyInput('1e6');
      expect(result).toBe('');
    });

    it('should reject inputs with E notation', () => {
      const result = sanitizeCurrencyInput('1.5E10');
      expect(result).toBe('');
    });

    it('should handle mixed alphanumeric with currency symbols', () => {
      const result = sanitizeCurrencyInput('$1,abc,000.50def');
      expect(result).toBe('1000.50');
    });

    it('should reject plus sign inputs', () => {
      const result = sanitizeCurrencyInput('+100');
      expect(result).toBe('');
    });

    it('should handle empty string', () => {
      const result = sanitizeCurrencyInput('');
      expect(result).toBe('');
    });

    it('should handle whitespace-only input', () => {
      const result = sanitizeCurrencyInput('   ');
      expect(result).toBe('');
    });

    it('should handle special characters', () => {
      const result = sanitizeCurrencyInput('!@#$%^&*()1000');
      expect(result).toBe('1000');
    });
  });

  describe('Currency symbols and formatting', () => {
    it('should strip USD currency code', () => {
      const result = sanitizeCurrencyInput('USD 1,000.00');
      expect(result).toBe('1000.00');
    });

    it('should strip CAD currency code', () => {
      const result = sanitizeCurrencyInput('CAD 5,000.50');
      expect(result).toBe('5000.50');
    });

    it('should handle C$ prefix', () => {
      const result = sanitizeCurrencyInput('C$2,500.75');
      expect(result).toBe('2500.75');
    });

    it('should handle multiple commas', () => {
      const result = sanitizeCurrencyInput('1,000,000,000', { maxValue: 2_000_000_000 });
      expect(result).toBe('1000000000');
    });
  });

  describe('Decimal precision', () => {
    it('should enforce 2 decimal places by default', () => {
      const result = sanitizeCurrencyInput('100.12345', { decimalPlaces: 2 });
      expect(result).toBe('100.12');
    });

    it('should enforce 0 decimal places for integers', () => {
      const result = sanitizeCurrencyInput('100.99', { decimalPlaces: 0 });
      expect(result).toBe('100');
    });

    it('should handle multiple decimal points', () => {
      const result = sanitizeCurrencyInput('100.50.75');
      expect(result).toBe('100.50');
    });

    it('should handle single decimal point with no trailing digits', () => {
      const result = sanitizeCurrencyInput('100.');
      expect(result).toBe('');
    });
  });

  describe('Boundary values', () => {
    it('should accept value exactly at maxValue', () => {
      const result = sanitizeCurrencyInput('10000000', { maxValue: 10_000_000 });
      expect(result).toBe('10000000');
    });

    it('should accept value exactly at minValue', () => {
      const result = sanitizeCurrencyInput('1', { minValue: 1 });
      expect(result).toBe('1');
    });

    it('should reject value just above maxValue', () => {
      const result = sanitizeCurrencyInput('10000001', { maxValue: 10_000_000 });
      expect(result).toBe('');
    });

    it('should reject value just below minValue', () => {
      const result = sanitizeCurrencyInput('0', { minValue: 1 });
      expect(result).toBe('');
    });
  });
});

describe('Integer Input Validation - Edge Cases', () => {
  describe('Zero shares', () => {
    it('should allow zero shares when allowZero is true', () => {
      const result = sanitizeIntegerInput('0', { allowZero: true });
      expect(result).toBe('0');
    });

    it('should reject zero shares when allowZero is false', () => {
      const result = sanitizeIntegerInput('0', { allowZero: false });
      expect(result).toBe('');
    });
  });

  describe('Large share counts - 1M+ shares', () => {
    it('should handle 1 million shares', () => {
      const result = sanitizeIntegerInput('1000000', { maxValue: 10_000_000 });
      expect(result).toBe('1000000');
      expect(parseIntegerInput(result)).toBe(1_000_000);
    });

    it('should handle shares with commas', () => {
      const result = sanitizeIntegerInput('5,000,000', { maxValue: 10_000_000 });
      expect(result).toBe('5000000');
    });

    it('should reject fractional shares', () => {
      const result = sanitizeIntegerInput('100.5');
      expect(result).toBe('100');
    });

    it('should strip decimals completely', () => {
      const result = sanitizeIntegerInput('999.999');
      expect(result).toBe('999');
    });
  });

  describe('Negative share counts', () => {
    it('should reject negative shares by default', () => {
      const result = sanitizeIntegerInput('-100');
      expect(result).toBe('');
    });

    it('should allow negative when allowNegative is true', () => {
      const result = sanitizeIntegerInput('-100', { allowNegative: true });
      expect(result).toBe('-100');
    });
  });

  describe('Non-numeric integer input', () => {
    it('should strip letters from integer input', () => {
      const result = sanitizeIntegerInput('abc500xyz');
      expect(result).toBe('500');
    });

    it('should handle empty string', () => {
      const result = sanitizeIntegerInput('');
      expect(result).toBe('');
    });
  });
});

describe('validateNumericValue - Error Messages', () => {
  it('should return error for NaN', () => {
    const result = validateNumericValue(NaN);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a valid number');
  });

  it('should return error for zero when not allowed', () => {
    const result = validateNumericValue(0, { allowZero: false });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Value must be greater than zero');
  });

  it('should return error for negative when not allowed', () => {
    const result = validateNumericValue(-100, { allowNegative: false });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Negative values are not allowed');
  });

  it('should return error for value below minimum', () => {
    const result = validateNumericValue(50, { minValue: 100 });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('must be at least');
  });

  it('should return error for value above maximum', () => {
    const result = validateNumericValue(15_000_000, { maxValue: 10_000_000 });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('cannot exceed');
  });

  it('should return valid for acceptable value', () => {
    const result = validateNumericValue(5000, { minValue: 0, maxValue: 10_000_000 });
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should handle extreme values - $10M', () => {
    const result = validateNumericValue(10_000_000, {
      minValue: 0,
      maxValue: 100_000_000,
    });
    expect(result.isValid).toBe(true);
  });

  it('should handle edge case - exactly at max', () => {
    const result = validateNumericValue(10_000_000, { maxValue: 10_000_000 });
    expect(result.isValid).toBe(true);
  });
});

describe('Real-world RSU scenarios', () => {
  describe('High-value RSU grants', () => {
    it('should handle Meta senior engineer RSU grant ($500k)', () => {
      const fmv = sanitizeCurrencyInput('$450.25', { maxValue: 1000 });
      const shares = sanitizeIntegerInput('1111', { maxValue: 10_000_000 });

      expect(parseCurrencyInput(fmv)).toBe(450.25);
      expect(parseIntegerInput(shares)).toBe(1111);

      const totalValue = parseCurrencyInput(fmv) * parseIntegerInput(shares);
      expect(totalValue).toBeCloseTo(500227.75, 2);
    });

    it('should handle executive-level grant ($2M+)', () => {
      const fmv = sanitizeCurrencyInput('$525.00', { maxValue: 10_000 });
      const shares = sanitizeIntegerInput('4,000', { maxValue: 10_000_000 });

      const totalValue = parseCurrencyInput(fmv) * parseIntegerInput(shares);
      expect(totalValue).toBe(2_100_000);
    });
  });

  describe('Copy-paste from brokerage statements', () => {
    it('should handle Schwab format: "$1,234.56 USD"', () => {
      const result = sanitizeCurrencyInput('$1,234.56 USD');
      expect(result).toBe('1234.56');
    });

    it('should handle E*TRADE format with spaces', () => {
      const result = sanitizeCurrencyInput('  $ 2,500.00  ');
      expect(result).toBe('2500.00');
    });
  });

  describe('User typos and mistakes', () => {
    it('should handle accidental letter after number', () => {
      const result = sanitizeCurrencyInput('1000a');
      expect(result).toBe('1000');
    });

    it('should handle double negatives', () => {
      const result = sanitizeCurrencyInput('--100', { allowNegative: true });
      expect(result).toBe('-100');
    });

    it('should handle leading zeros', () => {
      const result = sanitizeCurrencyInput('000100.50');
      expect(result).toBe('000100.50');
      expect(parseCurrencyInput(result)).toBe(100.50);
    });
  });
});
