/**
 * Bulk CSV Import API (v1)
 * Process CSV files with 100+ employee RSU vest records
 */

import Papa from 'papaparse';
import { calculateTax, CalculationRequest, CalculationResponse } from './calculate';

export interface BulkImportRow {
  employee_email: string;
  vest_date: string;
  shares_vested: number;
  fmv_per_share_usd: number;
  us_state: 'WA' | 'CA' | 'NY' | 'TX';
  canada_province: 'BC' | 'ON' | 'AB';
  filing_status: 'single' | 'married';
  employer?: 'Meta' | 'Amazon' | 'Google' | 'Microsoft';
}

export interface BulkImportError {
  row: number;
  employee_email: string;
  errors: string[];
}

export interface BulkImportResult {
  employee_email: string;
  calculation: CalculationResponse;
}

export interface BulkImportResponse {
  total_rows: number;
  successful: number;
  failed: number;
  results: BulkImportResult[];
  errors: BulkImportError[];
  processing_time_ms: number;
}

const MAX_ROWS = 1000; // Rate limit
const REQUIRED_COLUMNS = [
  'employee_email',
  'vest_date',
  'shares_vested',
  'fmv_per_share_usd',
  'us_state',
  'canada_province',
  'filing_status',
];

/**
 * Process bulk CSV import
 * @param csvContent CSV file content as string
 * @param defaultEmployer Default employer if not specified in CSV
 * @returns Bulk processing results with success/error breakdown
 */
export async function processBulkImport(
  csvContent: string,
  defaultEmployer: 'Meta' | 'Amazon' | 'Google' | 'Microsoft' = 'Meta'
): Promise<BulkImportResponse> {
  const startTime = Date.now();

  // Parse CSV
  const parseResult = Papa.parse<BulkImportRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase().replace(/ /g, '_'),
  });

  if (parseResult.errors.length > 0) {
    throw new Error(`CSV parsing failed: ${parseResult.errors[0].message}`);
  }

  const rows = parseResult.data;

  // Rate limit check
  if (rows.length > MAX_ROWS) {
    throw new Error(`Too many rows. Maximum ${MAX_ROWS} rows allowed per request.`);
  }

  // Validate CSV headers
  const headers = parseResult.meta.fields || [];
  const missingColumns = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));

  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  const results: BulkImportResult[] = [];
  const errors: BulkImportError[] = [];

  // Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // Account for header row and 1-based indexing

    try {
      // Validate row
      const validation = validateBulkImportRow(row, defaultEmployer);

      if (!validation.valid) {
        errors.push({
          row: rowNumber,
          employee_email: row.employee_email || 'unknown',
          errors: validation.errors || ['Invalid row data'],
        });
        continue;
      }

      // Calculate taxes
      const calculationRequest: CalculationRequest = {
        employer: validation.data!.employer,
        vest_date: validation.data!.vest_date,
        shares_vested: validation.data!.shares_vested,
        fmv_per_share_usd: validation.data!.fmv_per_share_usd,
        us_state: validation.data!.us_state,
        canada_province: validation.data!.canada_province,
        filing_status: validation.data!.filing_status,
      };

      const calculation = calculateTax(calculationRequest);

      results.push({
        employee_email: row.employee_email,
        calculation,
      });
    } catch (error: any) {
      errors.push({
        row: rowNumber,
        employee_email: row.employee_email || 'unknown',
        errors: [error.message || 'Calculation failed'],
      });
    }
  }

  const processingTime = Date.now() - startTime;

  return {
    total_rows: rows.length,
    successful: results.length,
    failed: errors.length,
    results,
    errors,
    processing_time_ms: processingTime,
  };
}

/**
 * Validate a single bulk import row
 */
function validateBulkImportRow(
  row: BulkImportRow,
  defaultEmployer: 'Meta' | 'Amazon' | 'Google' | 'Microsoft'
): {
  valid: boolean;
  errors?: string[];
  data?: CalculationRequest;
} {
  const errors: string[] = [];

  // Validate email
  if (!row.employee_email || !row.employee_email.includes('@')) {
    errors.push('Invalid employee_email');
  }

  // Validate vest_date
  if (!row.vest_date || isNaN(Date.parse(row.vest_date))) {
    errors.push('Invalid vest_date (must be YYYY-MM-DD format)');
  }

  // Validate numeric fields
  const sharesVested = Number(row.shares_vested);
  if (isNaN(sharesVested) || sharesVested <= 0) {
    errors.push('shares_vested must be a positive number');
  }

  const fmvPerShare = Number(row.fmv_per_share_usd);
  if (isNaN(fmvPerShare) || fmvPerShare <= 0) {
    errors.push('fmv_per_share_usd must be a positive number');
  }

  // Validate enums
  const validStates = ['WA', 'CA', 'NY', 'TX'];
  if (!row.us_state || !validStates.includes(row.us_state.toUpperCase())) {
    errors.push(`us_state must be one of: ${validStates.join(', ')}`);
  }

  const validProvinces = ['BC', 'ON', 'AB'];
  if (!row.canada_province || !validProvinces.includes(row.canada_province.toUpperCase())) {
    errors.push(`canada_province must be one of: ${validProvinces.join(', ')}`);
  }

  const validFilingStatus = ['single', 'married'];
  if (!row.filing_status || !validFilingStatus.includes(row.filing_status.toLowerCase())) {
    errors.push(`filing_status must be one of: ${validFilingStatus.join(', ')}`);
  }

  const validEmployers = ['Meta', 'Amazon', 'Google', 'Microsoft'];
  const employer = row.employer || defaultEmployer;
  if (!validEmployers.includes(employer)) {
    errors.push(`employer must be one of: ${validEmployers.join(', ')}`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      employer: employer as 'Meta' | 'Amazon' | 'Google' | 'Microsoft',
      vest_date: row.vest_date,
      shares_vested: sharesVested,
      fmv_per_share_usd: fmvPerShare,
      us_state: row.us_state.toUpperCase() as 'WA' | 'CA' | 'NY' | 'TX',
      canada_province: row.canada_province.toUpperCase() as 'BC' | 'ON' | 'AB',
      filing_status: row.filing_status.toLowerCase() as 'single' | 'married',
    },
  };
}

/**
 * Generate sample CSV template
 */
export function generateSampleCSV(): string {
  const headers = [
    'employee_email',
    'vest_date',
    'shares_vested',
    'fmv_per_share_usd',
    'us_state',
    'canada_province',
    'filing_status',
    'employer',
  ];

  const sampleRows = [
    [
      'john.doe@company.com',
      '2025-03-15',
      '100',
      '580.50',
      'CA',
      'BC',
      'single',
      'Meta',
    ],
    [
      'jane.smith@company.com',
      '2025-06-15',
      '150',
      '595.25',
      'WA',
      'ON',
      'married',
      'Amazon',
    ],
    [
      'bob.jones@company.com',
      '2025-09-15',
      '200',
      '610.75',
      'NY',
      'AB',
      'single',
      'Google',
    ],
  ];

  return [headers.join(','), ...sampleRows.map((row) => row.join(','))].join('\n');
}
