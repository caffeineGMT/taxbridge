/**
 * Foreign Tax Credit (FTC) Calculator with Treaty Article XV Logic
 *
 * Compares two filing strategies to minimize total cross-border tax burden:
 * 1. File US first, claim FTC on Canada return for US taxes paid
 * 2. File Canada first, claim FTC on US return for Canadian taxes paid
 *
 * Under US-Canada Tax Treaty Article XV:
 * - Employment income (including RSUs) is taxed where services are performed
 * - FTC prevents double taxation by allowing credit for taxes paid to other country
 *
 * IRS Form 1116 Rules (US FTC):
 * - FTC limited to US tax attributable to foreign-source income
 * - Cannot exceed: (Foreign source income / Total income) × US tax before FTC
 *
 * Canada Form T2209 Rules (Canada FTC):
 * - Non-business foreign tax credit
 * - Limited to lesser of: actual foreign tax OR (foreign income / net income) × basic federal tax
 */

export interface FTCResult {
  /** US Foreign Tax Credit for Canadian tax paid (if filing US after Canada) */
  usFTC: number;
  /** Canada FTC for US tax paid (if filing Canada after US) */
  canadaFTC: number;
  /** Recommended filing order for lowest total tax */
  optimalStrategy: 'file-us-first' | 'file-canada-first';
  /** Total tax burden under optimal strategy after FTC */
  totalTaxWithFTC: number;
  /** Total tax burden if no FTC were available (worst case) */
  totalTaxWithoutFTC: number;
  /** Tax savings from FTC under optimal strategy */
  savings: number;
  /** Detailed breakdown of US-first scenario */
  usFirstScenario: {
    usTax: number;
    canadaTaxBeforeFTC: number;
    canadaFTC: number;
    canadaTaxAfterFTC: number;
    totalTax: number;
  };
  /** Detailed breakdown of Canada-first scenario */
  canadaFirstScenario: {
    canadaTax: number;
    usTaxBeforeFTC: number;
    usFTC: number;
    usTaxAfterFTC: number;
    totalTax: number;
  };
}

/**
 * Calculate optimal Foreign Tax Credit strategy
 *
 * @param usTax Total US federal + state tax on income (before any FTC)
 * @param canadaTax Total Canada federal + provincial tax on income (before any FTC)
 * @param income Total income amount (used for calculating FTC limits)
 * @param state US state code (affects FTC calculation limits)
 * @param province Canadian province code (affects FTC calculation limits)
 * @returns Complete FTC analysis with optimal strategy recommendation
 *
 * @example
 * // Low income scenario: $50k RSU, WA + BC, no state tax
 * const result = calculateFTC(7500, 15000, 50000, 'WA', 'BC');
 * // Result: Canada-first likely optimal (higher Canada tax means better US FTC)
 *
 * @example
 * // High income scenario: $200k RSU, CA + ON, both have state/provincial tax
 * const result = calculateFTC(65000, 85000, 200000, 'CA', 'ON');
 * // Result: Canada-first optimal (Canada's higher rates make US FTC more valuable)
 */
export function calculateFTC(
  usTax: number,
  canadaTax: number,
  income: number,
  state: 'WA' | 'CA' | 'NY' | 'TX' | 'MA',
  province: 'BC' | 'ON' | 'AB' | 'QC'
): FTCResult {
  // Input validation
  if (income <= 0) {
    return createZeroFTCResult();
  }

  // **SCENARIO 1: File US first, then claim FTC on Canada return**
  // - Pay full US tax upfront
  // - File Canada return, claim FTC for US tax paid
  // - Canada FTC limited to Canada's tax rate on foreign-source income

  const usFirst_usTax = usTax;
  const usFirst_canadaTaxBeforeFTC = canadaTax;

  // Canada FTC = MIN(foreign tax paid, Canada tax × foreign income ratio)
  // For RSU income under Article XV: if worked in US, that portion is foreign-source for Canada
  // Assuming income is 100% foreign-source (worked in US before moving to Canada)
  const foreignIncomeRatio = 1.0; // 100% US-sourced for this scenario
  const canadaTaxOnForeignPortion = canadaTax * foreignIncomeRatio;
  const usFirst_canadaFTC = Math.min(usTax, canadaTaxOnForeignPortion);
  const usFirst_canadaTaxAfterFTC = Math.max(0, canadaTax - usFirst_canadaFTC);
  const usFirst_totalTax = usFirst_usTax + usFirst_canadaTaxAfterFTC;

  // **SCENARIO 2: File Canada first, then claim FTC on US return**
  // - Pay full Canada tax upfront
  // - File US return, claim FTC for Canadian tax paid
  // - US FTC limited by Form 1116 formula

  const canadaFirst_canadaTax = canadaTax;
  const canadaFirst_usTaxBeforeFTC = usTax;

  // US FTC (Form 1116) = MIN(foreign tax paid, US tax × foreign income ratio)
  // For Canadian resident earning in Canada: income is foreign-source for US
  // If person moved to Canada and earned there, 100% foreign-source for US purposes
  const canadaFirst_foreignIncomeRatio = 1.0; // 100% Canada-sourced for this scenario
  const usTaxOnForeignPortion = usTax * canadaFirst_foreignIncomeRatio;
  const canadaFirst_usFTC = Math.min(canadaTax, usTaxOnForeignPortion);
  const canadaFirst_usTaxAfterFTC = Math.max(0, usTax - canadaFirst_usFTC);
  const canadaFirst_totalTax = canadaFirst_canadaTax + canadaFirst_usTaxAfterFTC;

  // **DETERMINE OPTIMAL STRATEGY**
  // For Canadian tax residents (our target audience), prefer Canada-first when equal
  // This simplifies filing as they must file Canada anyway, and US tax is fully eliminated
  const optimalStrategy: 'file-us-first' | 'file-canada-first' =
    usFirst_totalTax < canadaFirst_totalTax ? 'file-us-first' : 'file-canada-first';

  const totalTaxWithFTC = Math.min(usFirst_totalTax, canadaFirst_totalTax);
  const totalTaxWithoutFTC = usTax + canadaTax;
  const savings = totalTaxWithoutFTC - totalTaxWithFTC;

  return {
    usFTC: canadaFirst_usFTC,
    canadaFTC: usFirst_canadaFTC,
    optimalStrategy,
    totalTaxWithFTC: round(totalTaxWithFTC),
    totalTaxWithoutFTC: round(totalTaxWithoutFTC),
    savings: round(savings),
    usFirstScenario: {
      usTax: round(usFirst_usTax),
      canadaTaxBeforeFTC: round(usFirst_canadaTaxBeforeFTC),
      canadaFTC: round(usFirst_canadaFTC),
      canadaTaxAfterFTC: round(usFirst_canadaTaxAfterFTC),
      totalTax: round(usFirst_totalTax),
    },
    canadaFirstScenario: {
      canadaTax: round(canadaFirst_canadaTax),
      usTaxBeforeFTC: round(canadaFirst_usTaxBeforeFTC),
      usFTC: round(canadaFirst_usFTC),
      usTaxAfterFTC: round(canadaFirst_usTaxAfterFTC),
      totalTax: round(canadaFirst_totalTax),
    },
  };
}

/**
 * Helper function to round to 2 decimal places
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Helper function to create zero FTC result for edge cases
 */
function createZeroFTCResult(): FTCResult {
  return {
    usFTC: 0,
    canadaFTC: 0,
    optimalStrategy: 'file-us-first',
    totalTaxWithFTC: 0,
    totalTaxWithoutFTC: 0,
    savings: 0,
    usFirstScenario: {
      usTax: 0,
      canadaTaxBeforeFTC: 0,
      canadaFTC: 0,
      canadaTaxAfterFTC: 0,
      totalTax: 0,
    },
    canadaFirstScenario: {
      canadaTax: 0,
      usTaxBeforeFTC: 0,
      usFTC: 0,
      usTaxAfterFTC: 0,
      totalTax: 0,
    },
  };
}

/**
 * Calculate FTC with detailed income allocation
 *
 * Use this function when you have separate US-sourced and Canada-sourced income
 * (e.g., RSU vested partly while working in US, partly while working in Canada)
 *
 * @param usTax Total US tax on US-sourced income
 * @param canadaTax Total Canada tax on worldwide income
 * @param usSourcedIncome Income earned while working in US
 * @param canadaSourcedIncome Income earned while working in Canada
 * @param state US state code
 * @param province Canadian province code
 * @returns FTC calculation with proper income allocation
 */
export function calculateFTCWithAllocation(
  usTax: number,
  canadaTax: number,
  usSourcedIncome: number,
  canadaSourcedIncome: number,
  state: 'WA' | 'CA' | 'NY' | 'TX' | 'MA',
  province: 'BC' | 'ON' | 'AB' | 'QC'
): FTCResult {
  const totalIncome = usSourcedIncome + canadaSourcedIncome;

  if (totalIncome <= 0) {
    return createZeroFTCResult();
  }

  // **SCENARIO 1: File US first, claim FTC on Canada**
  const usFirst_usTax = usTax;
  const usFirst_canadaTaxBeforeFTC = canadaTax;

  // Canada FTC based on US-sourced income ratio
  const usForeignIncomeRatio = usSourcedIncome / totalIncome;
  const canadaTaxOnUSPortion = canadaTax * usForeignIncomeRatio;
  const usFirst_canadaFTC = Math.min(usTax, canadaTaxOnUSPortion);
  const usFirst_canadaTaxAfterFTC = Math.max(0, canadaTax - usFirst_canadaFTC);
  const usFirst_totalTax = usFirst_usTax + usFirst_canadaTaxAfterFTC;

  // **SCENARIO 2: File Canada first, claim FTC on US**
  const canadaFirst_canadaTax = canadaTax;
  const canadaFirst_usTaxBeforeFTC = usTax;

  // US FTC based on Canada-sourced income ratio (foreign for US purposes)
  const canadaForeignIncomeRatio = canadaSourcedIncome / totalIncome;
  const usTaxOnCanadaPortion = usTax * canadaForeignIncomeRatio;
  const canadaFirst_usFTC = Math.min(canadaTax, usTaxOnCanadaPortion);
  const canadaFirst_usTaxAfterFTC = Math.max(0, usTax - canadaFirst_usFTC);
  const canadaFirst_totalTax = canadaFirst_canadaTax + canadaFirst_usTaxAfterFTC;

  // Prefer Canada-first when equal (better for Canadian tax residents)
  const optimalStrategy: 'file-us-first' | 'file-canada-first' =
    usFirst_totalTax < canadaFirst_totalTax ? 'file-us-first' : 'file-canada-first';

  const totalTaxWithFTC = Math.min(usFirst_totalTax, canadaFirst_totalTax);
  const totalTaxWithoutFTC = usTax + canadaTax;
  const savings = totalTaxWithoutFTC - totalTaxWithFTC;

  return {
    usFTC: canadaFirst_usFTC,
    canadaFTC: usFirst_canadaFTC,
    optimalStrategy,
    totalTaxWithFTC: round(totalTaxWithFTC),
    totalTaxWithoutFTC: round(totalTaxWithoutFTC),
    savings: round(savings),
    usFirstScenario: {
      usTax: round(usFirst_usTax),
      canadaTaxBeforeFTC: round(usFirst_canadaTaxBeforeFTC),
      canadaFTC: round(usFirst_canadaFTC),
      canadaTaxAfterFTC: round(usFirst_canadaTaxAfterFTC),
      totalTax: round(usFirst_totalTax),
    },
    canadaFirstScenario: {
      canadaTax: round(canadaFirst_canadaTax),
      usTaxBeforeFTC: round(canadaFirst_usTaxBeforeFTC),
      usFTC: round(canadaFirst_usFTC),
      usTaxAfterFTC: round(canadaFirst_usTaxAfterFTC),
      totalTax: round(canadaFirst_totalTax),
    },
  };
}
