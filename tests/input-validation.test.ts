import { describe, it, expect } from 'vitest';
import {
  sanitizeCurrencyInput,
  parseCurrencyInput,
  sanitizeIntegerInput,
  parseIntegerInput,
  validateNumericValue,
  formatCurrencyDisplay,
} from '../lib/input-validation';

describe('sanitizeCurrencyInput', () => {
  describe('Basic sanitization', () => {
    it('should handle empty inputs', () => {
      expect(sanitizeCurrencyInput('')).toBe('');
      expect(sanitizeCurrencyInput('   ')).toBe('');
    });

    it('should remove dollar signs', () => {
      expect(sanitizeCurrencyInput('$100')).toBe('100');
      expect(sanitizeCurrencyInput('C$500')).toBe('500');
      expect(sanitizeCurrencyInput('100USD')).toBe('100');
      expect(sanitizeCurrencyInput('200CAD')).toBe('200');
    });

    it('should remove commas from thousands separators', () => {
      expect(sanitizeCurrencyInput('1,234')).toBe('1234');
      expect(sanitizeCurrencyInput('1,234,567')).toBe('1234567');
      expect(sanitizeCurrencyInput('$1,234.56')).toBe('1234.56');
    });

    it('should preserve decimal values', () => {
      expect(sanitizeCurrencyInput('123.45')).toBe('123.45');
      expect(sanitizeCurrencyInput('0.99')).toBe('0.99');
      expect(sanitizeCurrencyInput('.50')).toBe('.50');
    });

    it('should handle whitespace', () => {
      expect(sanitizeCurrencyInput('  100  ')).toBe('100');
      expect(sanitizeCurrencyInput('1 2 3')).toBe('123');
      expect(sanitizeCurrencyInput(' $1,234.56 ')).toBe('1234.56');
    });
  });

  describe('Edge cases - scientific notation', () => {
    it('should block scientific notation', () => {
      expect(sanitizeCurrencyInput('1e6')).toBe('');
      expect(sanitizeCurrencyInput('1.5e3')).toBe('');
      expect(sanitizeCurrencyInput('2E10')).toBe('');
    });
  });

  describe('Edge cases - negative numbers', () => {
    it('should block negative numbers by default', () => {
      expect(sanitizeCurrencyInput('-100')).toBe('');
      expect(sanitizeCurrencyInput('$-50')).toBe('');
    });

    it('should allow negative numbers when configured', () => {
      expect(sanitizeCurrencyInput('-100', { allowNegative: true })).toBe('-100');
      expect(sanitizeCurrencyInput('-1234.56', { allowNegative: true })).toBe('-1234.56');
    });
  });

  describe('Edge cases - plus signs', () => {
    it('should block plus signs', () => {
      expect(sanitizeCurrencyInput('+100')).toBe('');
      expect(sanitizeCurrencyInput('100+')).toBe('');
    });
  });

  describe('Edge cases - multiple decimal points', () => {
    it('should handle multiple decimal points', () => {
      expect(sanitizeCurrencyInput('12.34.56')).toBe('12.34');
      expect(sanitizeCurrencyInput('1.2.3.4')).toBe('1.2');
    });
  });

  describe('Edge cases - non-numeric characters', () => {
    it('should remove non-numeric characters', () => {
      expect(sanitizeCurrencyInput('abc123')).toBe('123');
      expect(sanitizeCurrencyInput('12a34b56')).toBe('123456');
      expect(sanitizeCurrencyInput('!@#$%123')).toBe('123');
    });
  });

  describe('Edge cases - boundary values', () => {
    it('should enforce max value (default $10M)', () => {
      expect(sanitizeCurrencyInput('15000000')).toBe(''); // > $10M
      expect(sanitizeCurrencyInput('10000000')).toBe('10000000'); // = $10M
      expect(sanitizeCurrencyInput('9999999')).toBe('9999999'); // < $10M
    });

    it('should enforce custom max value', () => {
      expect(sanitizeCurrencyInput('200000', { maxValue: 100000 })).toBe('');
      expect(sanitizeCurrencyInput('50000', { maxValue: 100000 })).toBe('50000');
    });

    it('should enforce min value', () => {
      expect(sanitizeCurrencyInput('50', { minValue: 100 })).toBe('');
      expect(sanitizeCurrencyInput('150', { minValue: 100 })).toBe('150');
    });

    it('should handle zero based on allowZero option', () => {
      expect(sanitizeCurrencyInput('0', { allowZero: false })).toBe('');
      expect(sanitizeCurrencyInput('0', { allowZero: true })).toBe('0');
      expect(sanitizeCurrencyInput('0.00', { allowZero: true })).toBe('0.00');
    });
  });

  describe('Edge cases - decimal precision', () => {
    it('should enforce decimal precision (default 2 places)', () => {
      expect(sanitizeCurrencyInput('123.456')).toBe('123.45');
      expect(sanitizeCurrencyInput('99.999')).toBe('99.99');
    });

    it('should enforce custom decimal precision', () => {
      expect(sanitizeCurrencyInput('123.4567', { decimalPlaces: 4 })).toBe('123.4567');
      expect(sanitizeCurrencyInput('123.4567', { decimalPlaces: 0 })).toBe('123');
    });
  });

  describe('Edge cases - partial input', () => {
    it('should reject partial decimal input ending with decimal point', () => {
      expect(sanitizeCurrencyInput('123.')).toBe('');
      expect(sanitizeCurrencyInput('.')).toBe('');
      expect(sanitizeCurrencyInput('-')).toBe('');
    });
  });

  describe('Real-world copy-paste scenarios', () => {
    it('should handle copy-paste from spreadsheets', () => {
      expect(sanitizeCurrencyInput('$1,234.56')).toBe('1234.56');
      expect(sanitizeCurrencyInput('($500.00)')).toBe('500.00');
      expect(sanitizeCurrencyInput('  $12,345  ')).toBe('12345');
    });

    it('should handle formatted currency strings', () => {
      expect(sanitizeCurrencyInput('$100,000 USD')).toBe('100000');
      expect(sanitizeCurrencyInput('C$5,000.50 CAD')).toBe('5000.50');
    });
  });
});

describe('parseCurrencyInput', () => {
  it('should parse valid sanitized input', () => {
    expect(parseCurrencyInput('123.45')).toBe(123.45);
    expect(parseCurrencyInput('1000')).toBe(1000);
  });

  it('should return fallback for empty input', () => {
    expect(parseCurrencyInput('')).toBe(0);
    expect(parseCurrencyInput('', 100)).toBe(100);
  });

  it('should return fallback for invalid input', () => {
    expect(parseCurrencyInput('abc')).toBe(0);
    expect(parseCurrencyInput('---', 50)).toBe(50);
  });

  it('should handle partial input', () => {
    expect(parseCurrencyInput('-')).toBe(0);
    expect(parseCurrencyInput('.')).toBe(0);
  });
});

describe('sanitizeIntegerInput', () => {
  it('should remove decimal points', () => {
    expect(sanitizeIntegerInput('123.45')).toBe('123');
    expect(sanitizeIntegerInput('99.9')).toBe('99');
  });

  it('should handle comma-separated integers', () => {
    expect(sanitizeIntegerInput('1,234')).toBe('1234');
    expect(sanitizeIntegerInput('1,234,567', { maxValue: 2_000_000 })).toBe('1234567');
  });

  it('should enforce max value (default 1M)', () => {
    expect(sanitizeIntegerInput('2000000')).toBe('');
    expect(sanitizeIntegerInput('1000000')).toBe('1000000');
    expect(sanitizeIntegerInput('999999')).toBe('999999');
  });

  it('should block negative by default', () => {
    expect(sanitizeIntegerInput('-100')).toBe('');
  });

  it('should allow negative when configured', () => {
    expect(sanitizeIntegerInput('-100', { allowNegative: true })).toBe('-100');
  });
});

describe('parseIntegerInput', () => {
  it('should parse valid integers', () => {
    expect(parseIntegerInput('123')).toBe(123);
    expect(parseIntegerInput('0')).toBe(0);
  });

  it('should ignore decimals', () => {
    expect(parseIntegerInput('123.99')).toBe(123);
  });

  it('should return fallback for invalid input', () => {
    expect(parseIntegerInput('')).toBe(0);
    expect(parseIntegerInput('abc', 10)).toBe(10);
  });
});

describe('validateNumericValue', () => {
  it('should validate valid numbers', () => {
    const result = validateNumericValue(100);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject NaN', () => {
    const result = validateNumericValue(NaN);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('valid number');
  });

  it('should reject negative when not allowed', () => {
    const result = validateNumericValue(-100, { allowNegative: false });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Negative');
  });

  it('should accept negative when allowed', () => {
    const result = validateNumericValue(-100, { allowNegative: true });
    expect(result.isValid).toBe(true);
  });

  it('should reject zero when not allowed', () => {
    const result = validateNumericValue(0, { allowZero: false });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('greater than zero');
  });

  it('should reject values below minimum', () => {
    const result = validateNumericValue(50, { minValue: 100 });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at least');
  });

  it('should reject values above maximum', () => {
    const result = validateNumericValue(15000000, { maxValue: 10000000 });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('cannot exceed');
  });
});

describe('formatCurrencyDisplay', () => {
  it('should format USD with symbol', () => {
    expect(formatCurrencyDisplay(1234.56, 'USD')).toBe('$1,234.56');
    expect(formatCurrencyDisplay(1000000, 'USD')).toBe('$1,000,000.00');
  });

  it('should format CAD with symbol', () => {
    expect(formatCurrencyDisplay(1234.56, 'CAD')).toBe('C$1,234.56');
  });

  it('should format without symbol when configured', () => {
    expect(formatCurrencyDisplay(1234.56, 'USD', false)).toBe('1,234.56');
  });

  it('should always use 2 decimal places', () => {
    expect(formatCurrencyDisplay(100, 'USD')).toBe('$100.00');
    expect(formatCurrencyDisplay(99.9, 'USD')).toBe('$99.90');
  });
});

describe('Integration tests - real user scenarios', () => {
  it('Scenario: User pastes "$1,234.56" from spreadsheet', () => {
    const sanitized = sanitizeCurrencyInput('$1,234.56');
    const parsed = parseCurrencyInput(sanitized);
    expect(parsed).toBe(1234.56);
  });

  it('Scenario: User types "100000" for RSU income', () => {
    const sanitized = sanitizeCurrencyInput('100000');
    const parsed = parseCurrencyInput(sanitized);
    expect(parsed).toBe(100000);
  });

  it('Scenario: User accidentally types "1e5" (scientific notation)', () => {
    const sanitized = sanitizeCurrencyInput('1e5');
    expect(sanitized).toBe('');
    const parsed = parseCurrencyInput(sanitized);
    expect(parsed).toBe(0);
  });

  it('Scenario: User tries to enter negative RSU income', () => {
    const sanitized = sanitizeCurrencyInput('-5000');
    expect(sanitized).toBe('');
  });

  it('Scenario: User enters >$10M which exceeds limit', () => {
    const sanitized = sanitizeCurrencyInput('15000000');
    expect(sanitized).toBe('');
  });

  it('Scenario: User enters shares count with comma "1,234"', () => {
    const sanitized = sanitizeIntegerInput('1,234');
    const parsed = parseIntegerInput(sanitized);
    expect(parsed).toBe(1234);
  });

  it('Scenario: User pastes "150.75" for integer shares field', () => {
    const sanitized = sanitizeIntegerInput('150.75');
    expect(sanitized).toBe('150'); // Strips decimal
    const parsed = parseIntegerInput(sanitized);
    expect(parsed).toBe(150);
  });
});
