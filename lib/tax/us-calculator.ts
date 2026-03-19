/**
 * US Federal and State Tax Calculator
 * 2025 IRS Tax Brackets with Treaty Article XV logic
 */

// 2025 Federal Tax Brackets (IRS Rev. Proc. 2024-40)
const FEDERAL_BRACKETS_SINGLE = [
  { min: 0, max: 11925, rate: 0.10 },
  { min: 11925, max: 48475, rate: 0.12 },
  { min: 48475, max: 103350, rate: 0.22 },
  { min: 103350, max: 197300, rate: 0.24 },
  { min: 197300, max: 250525, rate: 0.32 },
  { min: 250525, max: 626350, rate: 0.35 },
  { min: 626350, max: Infinity, rate: 0.37 },
];

const FEDERAL_BRACKETS_MARRIED = [
  { min: 0, max: 23850, rate: 0.10 },
  { min: 23850, max: 96950, rate: 0.12 },
  { min: 96950, max: 206700, rate: 0.22 },
  { min: 206700, max: 394600, rate: 0.24 },
  { min: 394600, max: 501050, rate: 0.32 },
  { min: 501050, max: 751600, rate: 0.35 },
  { min: 751600, max: Infinity, rate: 0.37 },
];

const FEDERAL_STANDARD_DEDUCTION = {
  single: 15000,
  married: 30000,
};

// 2025 California State Tax Brackets (Single)
const CA_BRACKETS_SINGLE = [
  { min: 0, max: 10412, rate: 0.01 },
  { min: 10412, max: 24684, rate: 0.02 },
  { min: 24684, max: 38959, rate: 0.04 },
  { min: 38959, max: 54081, rate: 0.06 },
  { min: 54081, max: 68350, rate: 0.08 },
  { min: 68350, max: 349137, rate: 0.093 },
  { min: 349137, max: 418961, rate: 0.103 },
  { min: 418961, max: 698271, rate: 0.113 },
  { min: 698271, max: Infinity, rate: 0.123 },
];

const CA_STANDARD_DEDUCTION = 5363;

// 2025 Massachusetts State Tax (Flat Rate 5% + 4% millionaire surtax)
const MA_FLAT_RATE = 0.05;
const MA_MILLIONAIRE_SURTAX_THRESHOLD = 1000000;
const MA_MILLIONAIRE_SURTAX_RATE = 0.04;

// 2025 New York State Tax Brackets (Single)
// Source: NY DTF https://www.tax.ny.gov/pit/file/tax_rates.htm
const NY_BRACKETS_SINGLE = [
  { min: 0, max: 8500, rate: 0.04 },
  { min: 8500, max: 11700, rate: 0.045 },
  { min: 11700, max: 13900, rate: 0.0525 },
  { min: 13900, max: 80650, rate: 0.055 },
  { min: 80650, max: 215400, rate: 0.06 },
  { min: 215400, max: 1077550, rate: 0.0685 },
  { min: 1077550, max: 5000000, rate: 0.0965 },
  { min: 5000000, max: 25000000, rate: 0.103 },
  { min: 25000000, max: Infinity, rate: 0.109 },
];

const NY_STANDARD_DEDUCTION = 8000;

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

interface BracketBreakdown {
  bracket: string;
  rate: number;
  tax: number;
}

interface FederalTaxResult {
  tax: number;
  effectiveRate: number;
  marginalRate: number;
  breakdown: BracketBreakdown[];
}

interface StateTaxResult {
  tax: number;
  effectiveRate: number;
  breakdown: string;
}

/**
 * Calculate tax using progressive brackets
 */
function calculateProgressiveTax(
  taxableIncome: number,
  brackets: TaxBracket[]
): { tax: number; breakdown: BracketBreakdown[]; marginalRate: number } {
  let totalTax = 0;
  const breakdown: BracketBreakdown[] = [];
  let marginalRate = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) {
      break;
    }

    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    const taxInBracket = taxableInBracket * bracket.rate;

    if (taxInBracket > 0) {
      totalTax += taxInBracket;
      marginalRate = bracket.rate;

      const bracketLabel =
        bracket.max === Infinity
          ? `$${bracket.min.toLocaleString()}+`
          : `$${bracket.min.toLocaleString()} - $${bracket.max.toLocaleString()}`;

      breakdown.push({
        bracket: bracketLabel,
        rate: bracket.rate,
        tax: taxInBracket,
      });
    }
  }

  return { tax: totalTax, breakdown, marginalRate };
}

/**
 * Calculate US Federal Tax
 * @param income Gross income in USD
 * @param filingStatus 'single' or 'married'
 * @returns Federal tax calculation with breakdown
 */
export function calculateUSFederalTax(
  income: number,
  filingStatus: 'single' | 'married'
): FederalTaxResult {
  // Guard against negative or non-finite income
  if (!Number.isFinite(income) || income <= 0) {
    return { tax: 0, effectiveRate: 0, marginalRate: 0, breakdown: [] };
  }

  const standardDeduction = FEDERAL_STANDARD_DEDUCTION[filingStatus];
  const taxableIncome = Math.max(0, income - standardDeduction);
  const brackets =
    filingStatus === 'single' ? FEDERAL_BRACKETS_SINGLE : FEDERAL_BRACKETS_MARRIED;

  const { tax, breakdown, marginalRate } = calculateProgressiveTax(taxableIncome, brackets);
  const effectiveRate = income > 0 ? tax / income : 0;

  return {
    tax: Math.round(tax * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 10000) / 10000,
    marginalRate,
    breakdown,
  };
}

/**
 * Calculate US State Tax
 * @param income Gross income in USD
 * @param state State code ('WA' | 'CA' | 'NY' | 'TX')
 * @returns State tax calculation
 */
export function calculateUSStateTax(
  income: number,
  state: 'WA' | 'CA' | 'NY' | 'TX' | 'MA'
): StateTaxResult {
  // Guard against negative or non-finite income
  if (!Number.isFinite(income) || income <= 0) {
    return { tax: 0, effectiveRate: 0, breakdown: 'No taxable income' };
  }

  // WA and TX have no state income tax
  if (state === 'WA' || state === 'TX') {
    return {
      tax: 0,
      effectiveRate: 0,
      breakdown: `${state} has no state income tax`,
    };
  }

  if (state === 'CA') {
    const taxableIncome = Math.max(0, income - CA_STANDARD_DEDUCTION);
    const { tax, breakdown } = calculateProgressiveTax(taxableIncome, CA_BRACKETS_SINGLE);
    const effectiveRate = income > 0 ? tax / income : 0;

    return {
      tax: Math.round(tax * 100) / 100,
      effectiveRate: Math.round(effectiveRate * 10000) / 10000,
      breakdown: `CA tax on $${income.toLocaleString()} (taxable: $${taxableIncome.toLocaleString()})`,
    };
  }

  if (state === 'NY') {
    const taxableIncome = Math.max(0, income - NY_STANDARD_DEDUCTION);
    const { tax, breakdown } = calculateProgressiveTax(taxableIncome, NY_BRACKETS_SINGLE);
    const effectiveRate = income > 0 ? tax / income : 0;

    return {
      tax: Math.round(tax * 100) / 100,
      effectiveRate: Math.round(effectiveRate * 10000) / 10000,
      breakdown: `NY tax on $${income.toLocaleString()} (taxable: $${taxableIncome.toLocaleString()})`,
    };
  }

  if (state === 'MA') {
    // MA flat 5% + 4% surtax on income over $1M
    let tax = income * MA_FLAT_RATE;
    if (income > MA_MILLIONAIRE_SURTAX_THRESHOLD) {
      tax += (income - MA_MILLIONAIRE_SURTAX_THRESHOLD) * MA_MILLIONAIRE_SURTAX_RATE;
    }
    const effectiveRate = income > 0 ? tax / income : 0;

    return {
      tax: Math.round(tax * 100) / 100,
      effectiveRate: Math.round(effectiveRate * 10000) / 10000,
      breakdown: `MA flat 5% tax on $${income.toLocaleString()}${income > MA_MILLIONAIRE_SURTAX_THRESHOLD ? ' + 4% millionaire surtax' : ''}`,
    };
  }

  // Fallback (should never reach here with TypeScript types)
  return {
    tax: 0,
    effectiveRate: 0,
    breakdown: 'Unknown state',
  };
}

/**
 * Prorate income based on US vs Canada days (Treaty Article XV)
 * For H-1B/TN workers who moved from US to Canada during the vesting period
 * @param totalIncome Total RSU income
 * @param usDays Number of days physically present in US during vesting period
 * @param totalDays Total days in the vesting period
 * @returns US-sourced income portion
 */
export function prorateIncome(totalIncome: number, usDays: number, totalDays: number): number {
  if (totalDays === 0) return 0;
  if (usDays >= totalDays) return totalIncome; // Still in US, 100% US-sourced
  if (usDays <= 0) return 0; // No US presence, 0% US-sourced

  const usSourcedPortion = (usDays / totalDays) * totalIncome;
  return Math.round(usSourcedPortion * 100) / 100;
}
