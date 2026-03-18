/**
 * Tax Calculation API (v1)
 * Core calculation logic for REST API endpoint
 */

import { calculateUSFederalTax, calculateUSStateTax } from '@/lib/tax/us-calculator';
import { calculateCanadaFederalTax, calculateCanadaProvincialTax } from '@/lib/tax/canada-calculator';
import { calculateFTC } from '@/lib/tax/ftc-calculator';

export interface CalculationRequest {
  employer: 'Meta' | 'Amazon' | 'Google' | 'Microsoft';
  vest_date: string; // ISO date format
  shares_vested: number;
  fmv_per_share_usd: number;
  us_state: 'WA' | 'CA' | 'NY' | 'TX';
  canada_province: 'BC' | 'ON' | 'AB';
  filing_status: 'single' | 'married';
}

export interface CalculationResponse {
  total_value_usd: number;
  us_tax: {
    federal: number;
    state: number;
    total: number;
  };
  canada_tax: {
    federal: number;
    provincial: number;
    total: number;
  };
  foreign_tax_credit: number;
  net_tax_payable: number;
  effective_rate: number;
  optimal_filing_strategy: 'file-us-first' | 'file-canada-first';
  breakdown: {
    us_federal_rate: number;
    us_state_rate: number;
    canada_federal_rate: number;
    canada_provincial_rate: number;
  };
}

/**
 * Calculate cross-border RSU taxes
 * @param request Calculation parameters
 * @returns Comprehensive tax calculation results
 */
export function calculateTax(request: CalculationRequest): CalculationResponse {
  // Validate inputs
  if (request.shares_vested <= 0) {
    throw new Error('shares_vested must be greater than 0');
  }

  if (request.fmv_per_share_usd <= 0) {
    throw new Error('fmv_per_share_usd must be greater than 0');
  }

  // Calculate total value
  const totalValueUsd = request.shares_vested * request.fmv_per_share_usd;

  // Calculate US taxes
  const usFederalResult = calculateUSFederalTax(
    totalValueUsd,
    request.filing_status === 'married' ? 'married' : 'single'
  );

  const usStateResult = calculateUSStateTax(totalValueUsd, request.us_state);

  const usTotalTax = usFederalResult.tax + usStateResult.tax;

  // Calculate Canada taxes (assuming 1.35 USD/CAD exchange rate for API simplicity)
  const EXCHANGE_RATE = 1.35;
  const totalValueCad = totalValueUsd * EXCHANGE_RATE;

  const canadaFederalResult = calculateCanadaFederalTax(totalValueCad);
  const canadaProvincialResult = calculateCanadaProvincialTax(totalValueCad, request.canada_province);

  const canadaTotalTax = canadaFederalResult.tax + canadaProvincialResult.tax;

  // Calculate Foreign Tax Credit (optimal filing strategy)
  const ftcResult = calculateFTC(
    usTotalTax,
    canadaTotalTax,
    totalValueCad,
    request.us_state,
    request.canada_province
  );

  // Determine net tax and effective rate
  const netTaxPayable = ftcResult.totalTaxWithFTC;
  const effectiveRate = totalValueUsd > 0 ? netTaxPayable / totalValueUsd : 0;

  return {
    total_value_usd: Math.round(totalValueUsd * 100) / 100,
    us_tax: {
      federal: Math.round(usFederalResult.tax * 100) / 100,
      state: Math.round(usStateResult.tax * 100) / 100,
      total: Math.round(usTotalTax * 100) / 100,
    },
    canada_tax: {
      federal: Math.round(canadaFederalResult.tax * 100) / 100,
      provincial: Math.round(canadaProvincialResult.tax * 100) / 100,
      total: Math.round(canadaTotalTax * 100) / 100,
    },
    foreign_tax_credit: Math.round(ftcResult.canadaFTC * 100) / 100,
    net_tax_payable: Math.round(netTaxPayable * 100) / 100,
    effective_rate: Math.round(effectiveRate * 10000) / 10000,
    optimal_filing_strategy: ftcResult.optimalStrategy,
    breakdown: {
      us_federal_rate: usFederalResult.effectiveRate,
      us_state_rate: usStateResult.effectiveRate,
      canada_federal_rate: canadaFederalResult.effectiveRate,
      canada_provincial_rate: canadaProvincialResult.effectiveRate,
    },
  };
}

/**
 * Validate calculation request
 */
export function validateCalculationRequest(data: any): {
  valid: boolean;
  errors?: string[];
  request?: CalculationRequest;
} {
  const errors: string[] = [];

  // Required fields
  if (!data.employer) errors.push('employer is required');
  if (!data.vest_date) errors.push('vest_date is required');
  if (typeof data.shares_vested !== 'number') errors.push('shares_vested must be a number');
  if (typeof data.fmv_per_share_usd !== 'number') errors.push('fmv_per_share_usd must be a number');
  if (!data.us_state) errors.push('us_state is required');
  if (!data.canada_province) errors.push('canada_province is required');
  if (!data.filing_status) errors.push('filing_status is required');

  // Validate enum values
  const validEmployers = ['Meta', 'Amazon', 'Google', 'Microsoft'];
  if (data.employer && !validEmployers.includes(data.employer)) {
    errors.push(`employer must be one of: ${validEmployers.join(', ')}`);
  }

  const validStates = ['WA', 'CA', 'NY', 'TX'];
  if (data.us_state && !validStates.includes(data.us_state)) {
    errors.push(`us_state must be one of: ${validStates.join(', ')}`);
  }

  const validProvinces = ['BC', 'ON', 'AB'];
  if (data.canada_province && !validProvinces.includes(data.canada_province)) {
    errors.push(`canada_province must be one of: ${validProvinces.join(', ')}`);
  }

  const validFilingStatus = ['single', 'married'];
  if (data.filing_status && !validFilingStatus.includes(data.filing_status)) {
    errors.push(`filing_status must be one of: ${validFilingStatus.join(', ')}`);
  }

  // Validate date format
  if (data.vest_date && isNaN(Date.parse(data.vest_date))) {
    errors.push('vest_date must be a valid ISO date format (YYYY-MM-DD)');
  }

  // Validate numeric ranges
  if (typeof data.shares_vested === 'number' && data.shares_vested <= 0) {
    errors.push('shares_vested must be greater than 0');
  }

  if (typeof data.fmv_per_share_usd === 'number' && data.fmv_per_share_usd <= 0) {
    errors.push('fmv_per_share_usd must be greater than 0');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    request: data as CalculationRequest,
  };
}
