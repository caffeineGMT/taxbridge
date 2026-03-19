/**
 * Canada Federal and Provincial Tax Calculator
 * 2025 CRA Tax Brackets with Treaty Article XV logic
 */

// 2025 Federal Tax Brackets (Canada)
const FEDERAL_BRACKETS = [
  { min: 0, max: 55867, rate: 0.15 },
  { min: 55867, max: 111733, rate: 0.205 },
  { min: 111733, max: 173205, rate: 0.26 },
  { min: 173205, max: 246752, rate: 0.29 },
  { min: 246752, max: Infinity, rate: 0.33 },
];

const FEDERAL_BASIC_PERSONAL_AMOUNT = 15705;

// 2025 British Columbia Provincial Tax Brackets
const BC_BRACKETS = [
  { min: 0, max: 47937, rate: 0.0506 },
  { min: 47937, max: 95875, rate: 0.077 },
  { min: 95875, max: 110076, rate: 0.105 },
  { min: 110076, max: 133664, rate: 0.1229 },
  { min: 133664, max: 181232, rate: 0.147 },
  { min: 181232, max: 252752, rate: 0.168 },
  { min: 252752, max: Infinity, rate: 0.205 },
];

const BC_BASIC_PERSONAL_AMOUNT = 12580;

// 2025 Ontario Provincial Tax Brackets
const ON_BRACKETS = [
  { min: 0, max: 51446, rate: 0.0505 },
  { min: 51446, max: 102894, rate: 0.0915 },
  { min: 102894, max: 150000, rate: 0.1116 },
  { min: 150000, max: 220000, rate: 0.1216 },
  { min: 220000, max: Infinity, rate: 0.1316 },
];

const ON_BASIC_PERSONAL_AMOUNT = 11865;

// 2025 Alberta Provincial Tax Brackets (Progressive)
// Source: CRA provincial tax rates
const AB_BRACKETS = [
  { min: 0, max: 148269, rate: 0.10 },
  { min: 148269, max: 177922, rate: 0.12 },
  { min: 177922, max: 237230, rate: 0.13 },
  { min: 237230, max: 355845, rate: 0.14 },
  { min: 355845, max: Infinity, rate: 0.15 },
];
const AB_BASIC_PERSONAL_AMOUNT = 21885;

// 2025 Quebec Provincial Tax Brackets
// Source: Revenu Québec
const QC_BRACKETS = [
  { min: 0, max: 51780, rate: 0.14 },
  { min: 51780, max: 103545, rate: 0.19 },
  { min: 103545, max: 126000, rate: 0.24 },
  { min: 126000, max: Infinity, rate: 0.2575 },
];
const QC_BASIC_PERSONAL_AMOUNT = 17183;

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

interface ProvincialTaxResult {
  tax: number;
  effectiveRate: number;
  breakdown: string;
}

interface ForeignTaxCreditResult {
  ftcAmount: number;
  remainingCanadaTax: number;
  explanation: string;
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
 * Calculate Canada Federal Tax
 * @param income Gross income in CAD
 * @returns Federal tax calculation with breakdown
 *
 * Note: For MVP simplicity, BPA is applied as a deduction from income.
 * (In reality, Canada uses BPA as a non-refundable tax credit)
 */
export function calculateCanadaFederalTax(income: number): FederalTaxResult {
  // Guard against negative or non-finite income
  if (!Number.isFinite(income) || income <= 0) {
    return { tax: 0, effectiveRate: 0, marginalRate: 0, breakdown: [] };
  }

  const taxableIncome = Math.max(0, income - FEDERAL_BASIC_PERSONAL_AMOUNT);
  const { tax, breakdown, marginalRate } = calculateProgressiveTax(
    taxableIncome,
    FEDERAL_BRACKETS
  );
  const effectiveRate = income > 0 ? tax / income : 0;

  return {
    tax: Math.round(tax * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 10000) / 10000,
    marginalRate,
    breakdown,
  };
}

/**
 * Calculate Canada Provincial Tax
 * @param income Gross income in CAD
 * @param province Province code ('BC' | 'ON' | 'AB')
 * @returns Provincial tax calculation
 *
 * Note: For MVP simplicity, provincial BPA is applied as a deduction from income.
 * (In reality, Canada uses BPA as a non-refundable tax credit)
 */
export function calculateCanadaProvincialTax(
  income: number,
  province: 'BC' | 'ON' | 'AB' | 'QC'
): ProvincialTaxResult {
  // Guard against negative or non-finite income
  if (!Number.isFinite(income) || income <= 0) {
    return { tax: 0, effectiveRate: 0, breakdown: 'No taxable income' };
  }

  let tax = 0;
  let basicAmount = 0;
  let breakdown = '';

  if (province === 'BC') {
    basicAmount = BC_BASIC_PERSONAL_AMOUNT;
    const taxableIncome = Math.max(0, income - basicAmount);
    const result = calculateProgressiveTax(taxableIncome, BC_BRACKETS);
    tax = result.tax;
    breakdown = `BC tax on $${income.toLocaleString()} (taxable: $${taxableIncome.toLocaleString()})`;
  } else if (province === 'ON') {
    basicAmount = ON_BASIC_PERSONAL_AMOUNT;
    const taxableIncome = Math.max(0, income - basicAmount);
    const result = calculateProgressiveTax(taxableIncome, ON_BRACKETS);
    tax = result.tax;
    breakdown = `ON tax on $${income.toLocaleString()} (taxable: $${taxableIncome.toLocaleString()})`;
  } else if (province === 'AB') {
    basicAmount = AB_BASIC_PERSONAL_AMOUNT;
    const taxableIncome = Math.max(0, income - basicAmount);
    const result = calculateProgressiveTax(taxableIncome, AB_BRACKETS);
    tax = result.tax;
    breakdown = `AB tax on $${income.toLocaleString()} (taxable: $${taxableIncome.toLocaleString()})`;
  } else if (province === 'QC') {
    basicAmount = QC_BASIC_PERSONAL_AMOUNT;
    const taxableIncome = Math.max(0, income - basicAmount);
    const result = calculateProgressiveTax(taxableIncome, QC_BRACKETS);
    tax = result.tax;
    breakdown = `QC tax on $${income.toLocaleString()} (taxable: $${taxableIncome.toLocaleString()})`;
  }

  const effectiveRate = income > 0 ? tax / income : 0;

  return {
    tax: Math.round(tax * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 10000) / 10000,
    breakdown,
  };
}

/**
 * Calculate Foreign Tax Credit (FTC) under Treaty Article XV
 *
 * Canada taxes worldwide income for residents, but allows Foreign Tax Credit (FTC)
 * for US taxes paid on US-sourced income.
 *
 * FTC = min(US tax paid, Canada tax rate × US-sourced income)
 * If US tax > Canada tax on US portion, excess is lost (no carryforward in MVP)
 *
 * @param usTaxPaid Total US federal + state tax paid on US-sourced income
 * @param usSourcedIncome Amount of income sourced from the US
 * @param totalIncome Total worldwide income
 * @param canadaTaxOnTotal Total Canada federal + provincial tax on worldwide income
 * @returns FTC amount and remaining Canada tax after credit
 */
export function calculateForeignTaxCredit(
  usTaxPaid: number,
  usSourcedIncome: number,
  totalIncome: number,
  canadaTaxOnTotal: number
): ForeignTaxCreditResult {
  if (totalIncome === 0) {
    return {
      ftcAmount: 0,
      remainingCanadaTax: canadaTaxOnTotal,
      explanation: 'No income reported',
    };
  }

  if (usSourcedIncome === 0) {
    return {
      ftcAmount: 0,
      remainingCanadaTax: canadaTaxOnTotal,
      explanation: 'No US-sourced income',
    };
  }

  // Calculate Canada's tax rate on the US-sourced portion
  const canadaTaxRate = totalIncome > 0 ? canadaTaxOnTotal / totalIncome : 0;
  const canadaTaxOnUSPortion = canadaTaxRate * usSourcedIncome;

  // FTC is the lesser of:
  // 1. US tax actually paid
  // 2. Canada's tax on the US-sourced portion
  const ftcAmount = Math.min(usTaxPaid, canadaTaxOnUSPortion);
  const remainingCanadaTax = Math.max(0, canadaTaxOnTotal - ftcAmount);

  let explanation = '';
  if (usTaxPaid <= canadaTaxOnUSPortion) {
    explanation = `Full US tax of $${usTaxPaid.toLocaleString()} claimed as FTC. Canada tax reduced from $${canadaTaxOnTotal.toLocaleString()} to $${remainingCanadaTax.toLocaleString()}.`;
  } else {
    const excessUSTax = usTaxPaid - canadaTaxOnUSPortion;
    explanation = `FTC capped at $${ftcAmount.toLocaleString()} (Canada's share). Excess US tax of $${excessUSTax.toLocaleString()} cannot be recovered. Canada tax reduced from $${canadaTaxOnTotal.toLocaleString()} to $${remainingCanadaTax.toLocaleString()}.`;
  }

  return {
    ftcAmount: Math.round(ftcAmount * 100) / 100,
    remainingCanadaTax: Math.round(remainingCanadaTax * 100) / 100,
    explanation,
  };
}
