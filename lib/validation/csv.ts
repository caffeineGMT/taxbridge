import { z } from 'zod';

/**
 * US States supported for RSU entry
 */
export const US_STATES = ['WA', 'CA', 'NY', 'TX'] as const;

/**
 * Canadian Provinces supported for RSU entry
 */
export const CA_PROVINCES = ['BC', 'ON', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'PE', 'NL', 'YT', 'NT', 'NU'] as const;

/**
 * Employers supported for RSU entry
 */
export const EMPLOYERS = ['Meta', 'Amazon', 'Google', 'Microsoft', 'Apple'] as const;

/**
 * Validation schema for a single CSV row
 */
export const CSVRowSchema = z.object({
  vesting_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) && parsed <= new Date();
    }, 'Date must be valid and not in the future'),
  employer: z.enum(EMPLOYERS, {
    errorMap: () => ({ message: `Employer must be one of: ${EMPLOYERS.join(', ')}` })
  }),
  shares: z.number()
    .positive('Shares must be positive')
    .int('Shares must be a whole number')
    .max(10_000_000, 'Shares cannot exceed 10,000,000 (if you have more, please split into multiple rows)'),
  fmv_usd: z.number()
    .positive('FMV must be positive')
    .max(10_000, 'FMV cannot exceed $10,000 per share (if higher, please verify the value)'),
  us_state: z.enum(US_STATES, {
    errorMap: () => ({ message: `US State must be one of: ${US_STATES.join(', ')}` })
  }),
  canada_province: z.enum(CA_PROVINCES, {
    errorMap: () => ({ message: `Province must be one of: ${CA_PROVINCES.join(', ')}` })
  }),
});

export type CSVRow = z.infer<typeof CSVRowSchema>;

/**
 * Validation result for a CSV row
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  row?: CSVRow;
}

/**
 * Validate a single CSV row
 * @param row Raw CSV row data
 * @returns Validation result with errors if invalid
 */
export function validateCSVRow(row: any): ValidationResult {
  try {
    // Convert string values to numbers where needed
    const normalized = {
      vesting_date: row.vesting_date?.trim(),
      employer: row.employer?.trim(),
      shares: row.shares ? Number(row.shares) : undefined,
      fmv_usd: row.fmv_usd ? Number(row.fmv_usd) : undefined,
      us_state: row.us_state?.trim(),
      canada_province: row.canada_province?.trim(),
    };

    const validated = CSVRowSchema.parse(normalized);
    return {
      valid: true,
      errors: [],
      row: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => {
        const field = err.path.join('.');
        return `${field}: ${err.message}`;
      });
      return {
        valid: false,
        errors,
      };
    }
    return {
      valid: false,
      errors: ['Unknown validation error'],
    };
  }
}

/**
 * Parse and validate an entire CSV dataset
 * @param rows Array of raw CSV rows
 * @returns Validated rows and errors
 */
export function validateCSVData(rows: any[]): {
  validRows: CSVRow[];
  invalidRows: Array<{ index: number; row: any; errors: string[] }>;
} {
  const validRows: CSVRow[] = [];
  const invalidRows: Array<{ index: number; row: any; errors: string[] }> = [];

  rows.forEach((row, index) => {
    const result = validateCSVRow(row);
    if (result.valid && result.row) {
      validRows.push(result.row);
    } else {
      invalidRows.push({
        index: index + 1, // 1-indexed for user display
        row,
        errors: result.errors,
      });
    }
  });

  return { validRows, invalidRows };
}
