/**
 * 2025 Tax Brackets for US and Canada
 *
 * Sources:
 * - US Federal: IRS Rev. Proc. 2024-40
 *   https://www.irs.gov/pub/irs-drop/rp-24-40.pdf
 * - Canada Federal: Canada Revenue Agency 2025 tax rates
 *   https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html
 * - Canada Provincial: Provincial tax rates for 2025
 *   https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/provincial-territorial-tax-rates-tax-year.html
 * - US State: State tax agencies (CA FTB, NY DTF)
 */

import { FilingStatus, State, Province } from '../types';

/**
 * Tax bracket definition
 */
export interface TaxBracket {
  min: number; // Income threshold (inclusive)
  max: number; // Income ceiling (exclusive) - use Infinity for top bracket
  rate: number; // Tax rate as decimal (e.g., 0.10 for 10%)
}

/**
 * Tax bracket structure by filing status
 */
export interface FilingStatusBrackets {
  [FilingStatus.Single]: TaxBracket[];
  [FilingStatus.MarriedFilingJointly]: TaxBracket[];
  [FilingStatus.MarriedFilingSeparately]: TaxBracket[];
  [FilingStatus.HeadOfHousehold]: TaxBracket[];
}

/**
 * US Federal Income Tax Brackets for 2025
 * Source: IRS Rev. Proc. 2024-40
 * https://www.irs.gov/pub/irs-drop/rp-24-40.pdf
 */
export const US_FEDERAL_2025: FilingStatusBrackets = {
  [FilingStatus.Single]: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 }
  ],
  [FilingStatus.MarriedFilingJointly]: [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 }
  ],
  [FilingStatus.MarriedFilingSeparately]: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 375800, rate: 0.35 },
    { min: 375800, max: Infinity, rate: 0.37 }
  ],
  [FilingStatus.HeadOfHousehold]: [
    { min: 0, max: 17000, rate: 0.10 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 }
  ]
};

/**
 * US State Income Tax Brackets for 2025
 *
 * Sources:
 * - WA: No state income tax
 * - TX: No state income tax
 * - CA: California Franchise Tax Board
 *   https://www.ftb.ca.gov/forms/2024/2024-540-tax-rate-schedules.html
 * - NY: New York Department of Taxation and Finance
 *   https://www.tax.ny.gov/pit/file/tax_rates.htm
 */
export const US_STATE_2025: Record<State, { rate?: number; brackets: TaxBracket[] }> = {
  [State.WA]: {
    rate: 0,
    brackets: []
  },
  [State.TX]: {
    rate: 0,
    brackets: []
  },
  [State.CA]: {
    brackets: [
      { min: 0, max: 10412, rate: 0.01 },
      { min: 10412, max: 24684, rate: 0.02 },
      { min: 24684, max: 38959, rate: 0.04 },
      { min: 38959, max: 54081, rate: 0.06 },
      { min: 54081, max: 68350, rate: 0.08 },
      { min: 68350, max: 349137, rate: 0.093 },
      { min: 349137, max: 418961, rate: 0.103 },
      { min: 418961, max: 698271, rate: 0.113 },
      { min: 698271, max: Infinity, rate: 0.123 }
    ]
  },
  [State.NY]: {
    brackets: [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8500, max: 11700, rate: 0.045 },
      { min: 11700, max: 13900, rate: 0.0525 },
      { min: 13900, max: 80650, rate: 0.055 },
      { min: 80650, max: 215400, rate: 0.06 },
      { min: 215400, max: 1077550, rate: 0.0685 },
      { min: 1077550, max: 5000000, rate: 0.0965 },
      { min: 5000000, max: 25000000, rate: 0.103 },
      { min: 25000000, max: Infinity, rate: 0.109 }
    ]
  },
  [State.NONE]: {
    rate: 0,
    brackets: []
  }
};

/**
 * Canada Federal Income Tax Brackets for 2025
 * Source: Canada Revenue Agency
 * https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html
 */
export const CA_FEDERAL_2025: TaxBracket[] = [
  { min: 0, max: 55867, rate: 0.15 },
  { min: 55867, max: 111733, rate: 0.205 },
  { min: 111733, max: 173205, rate: 0.26 },
  { min: 173205, max: 246752, rate: 0.29 },
  { min: 246752, max: Infinity, rate: 0.33 }
];

/**
 * Canada Provincial Income Tax Brackets for 2025
 * Source: Canada Revenue Agency provincial tax rates
 * https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/provincial-territorial-tax-rates-tax-year.html
 */
export const CA_PROVINCIAL_2025: Record<Province, TaxBracket[]> = {
  [Province.BC]: [
    { min: 0, max: 47937, rate: 0.0506 },
    { min: 47937, max: 95875, rate: 0.077 },
    { min: 95875, max: 110076, rate: 0.105 },
    { min: 110076, max: 133664, rate: 0.1229 },
    { min: 133664, max: 181232, rate: 0.147 },
    { min: 181232, max: 252752, rate: 0.168 },
    { min: 252752, max: Infinity, rate: 0.205 }
  ],
  [Province.ON]: [
    { min: 0, max: 51446, rate: 0.0505 },
    { min: 51446, max: 102894, rate: 0.0915 },
    { min: 102894, max: 150000, rate: 0.1116 },
    { min: 150000, max: 220000, rate: 0.1216 },
    { min: 220000, max: Infinity, rate: 0.1316 }
  ],
  [Province.AB]: [
    { min: 0, max: 148269, rate: 0.10 },
    { min: 148269, max: 177922, rate: 0.12 },
    { min: 177922, max: 237230, rate: 0.13 },
    { min: 237230, max: 355845, rate: 0.14 },
    { min: 355845, max: Infinity, rate: 0.15 }
  ],
  [Province.QC]: [
    { min: 0, max: 51780, rate: 0.14 },
    { min: 51780, max: 103545, rate: 0.19 },
    { min: 103545, max: 126000, rate: 0.24 },
    { min: 126000, max: Infinity, rate: 0.2575 }
  ]
};

/**
 * US Standard Deduction for 2025
 * Source: IRS Rev. Proc. 2024-40
 * https://www.irs.gov/pub/irs-drop/rp-24-40.pdf
 */
export const STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  [FilingStatus.Single]: 15000,
  [FilingStatus.MarriedFilingJointly]: 30000,
  [FilingStatus.MarriedFilingSeparately]: 15000,
  [FilingStatus.HeadOfHousehold]: 22500
};

/**
 * Canada Basic Personal Amount for 2025
 * Source: Canada Revenue Agency
 * https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html
 */
export const BASIC_PERSONAL_AMOUNT_2025 = 15705;

/**
 * Calculate tax owed given income and tax brackets
 * @param income - Taxable income amount
 * @param brackets - Array of tax brackets
 * @returns Total tax owed
 */
export const calculateTax = (income: number, brackets: TaxBracket[]): number => {
  let tax = 0;

  for (const bracket of brackets) {
    if (income <= bracket.min) {
      break;
    }

    const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }

  return tax;
};
