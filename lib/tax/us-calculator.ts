/**
 * US Federal and State Tax Calculator
 * 2025 IRS Tax Brackets with Treaty Article XV logic
 */

// 2025 Federal Tax Brackets
const FEDERAL_BRACKETS_SINGLE = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

const FEDERAL_BRACKETS_MARRIED = [
  { min: 0, max: 23200, rate: 0.10 },
  { min: 23200, max: 94300, rate: 0.12 },
  { min: 94300, max: 201050, rate: 0.22 },
  { min: 201050, max: 383900, rate: 0.24 },
  { min: 383900, max: 487450, rate: 0.32 },
  { min: 487450, max: 731200, rate: 0.35 },
  { min: 731200, max: Infinity, rate: 0.37 },
];

const FEDERAL_STANDARD_DEDUCTION = {
  single: 14600,
  married: 29200,
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

// 2025 New York State Tax Brackets (Single)
const NY_BRACKETS_SINGLE = [
  { min: 0, max: 8500, rate: 0.04 },
  { min: 8500, max: 11700, rate: 0.045 },
  { min: 11700, max: 13900, rate: 0.0525 },
  { min: 13900, max: 80650, rate: 0.0585 },
  { min: 80650, max: 215400, rate: 0.0625 },
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
  state: 'WA' | 'CA' | 'NY' | 'TX'
): StateTaxResult {
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
