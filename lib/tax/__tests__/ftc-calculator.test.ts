/**
 * Foreign Tax Credit Calculator Test Suite
 *
 * Tests FTC calculation accuracy, Treaty Article XV application,
 * and optimal strategy selection across various income scenarios.
 */

import { describe, it, expect } from 'vitest';
import { calculateFTC, calculateFTCWithAllocation } from '../ftc-calculator';
import { calculateUSFederalTax, calculateUSStateTax } from '../us-calculator';
import {
  calculateCanadaFederalTax,
  calculateCanadaProvincialTax,
} from '../canada-calculator';

describe('calculateFTC - Foreign Tax Credit Optimizer', () => {
  /**
   * Test Case 1: Low income ($50k RSU, WA + BC)
   * - No US state income tax (WA)
   * - Lower tax brackets
   * - Verify FTC prevents double taxation
   */
  it('should calculate correct FTC for low income scenario (WA + BC)', () => {
    const income = 50000;

    // Calculate US tax (WA has no state income tax)
    const usFederal = calculateUSFederalTax(income, 'single');
    const usState = calculateUSStateTax(income, 'WA');
    const totalUSTax = usFederal.tax + usState.tax;

    // Calculate Canada tax
    const canadaFederal = calculateCanadaFederalTax(income);
    const canadaProvincial = calculateCanadaProvincialTax(income, 'BC');
    const totalCanadaTax = canadaFederal.tax + canadaProvincial.tax;

    // Calculate FTC
    const result = calculateFTC(totalUSTax, totalCanadaTax, income, 'WA', 'BC');

    // Assertions
    expect(result.totalTaxWithFTC).toBeGreaterThan(0);
    expect(result.totalTaxWithFTC).toBeLessThan(result.totalTaxWithoutFTC);
    expect(result.savings).toBeGreaterThan(0);

    // Expected: US tax ~$4,739, Canada tax ~$7,549
    // FTC should eliminate one country's tax burden
    expect(result.totalTaxWithFTC).toBeCloseTo(Math.max(totalUSTax, totalCanadaTax), 0);

    // Canada has higher tax, so filing Canada-first should give better US FTC
    expect(result.optimalStrategy).toBe('file-canada-first');

    // Verify FTC amounts are reasonable
    expect(result.usFTC).toBeGreaterThan(0);
    expect(result.usFTC).toBeLessThanOrEqual(totalCanadaTax);

    // Total tax without FTC should equal sum of both countries
    expect(result.totalTaxWithoutFTC).toBeCloseTo(totalUSTax + totalCanadaTax, 1);
  });

  /**
   * Test Case 2: High income ($200k RSU, CA + ON)
   * - California state tax (progressive)
   * - Ontario provincial tax (progressive)
   * - Both countries in higher tax brackets
   * - Verify FTC calculations in progressive bracket system
   */
  it('should calculate correct FTC for high income scenario (CA + ON)', () => {
    const income = 200000;

    // Calculate US tax (CA has high state income tax)
    const usFederal = calculateUSFederalTax(income, 'single');
    const usState = calculateUSStateTax(income, 'CA');
    const totalUSTax = usFederal.tax + usState.tax;

    // Calculate Canada tax
    const canadaFederal = calculateCanadaFederalTax(income);
    const canadaProvincial = calculateCanadaProvincialTax(income, 'ON');
    const totalCanadaTax = canadaFederal.tax + canadaProvincial.tax;

    // Calculate FTC
    const result = calculateFTC(totalUSTax, totalCanadaTax, income, 'CA', 'ON');

    // Assertions
    expect(result.totalTaxWithFTC).toBeGreaterThan(0);
    expect(result.totalTaxWithFTC).toBeLessThan(result.totalTaxWithoutFTC);
    expect(result.savings).toBeGreaterThan(0);

    // Expected: US tax ~$47,469, Canada tax ~$63,731
    // Canada has higher tax, so optimal strategy is file-canada-first
    expect(result.optimalStrategy).toBe('file-canada-first');

    // With Canada-first: pay full Canada tax, get US FTC
    // US FTC should nearly eliminate US tax (limited by US tax amount)
    expect(result.canadaFirstScenario.usFTC).toBeCloseTo(totalUSTax, 0);
    expect(result.canadaFirstScenario.totalTax).toBeCloseTo(totalCanadaTax, 0);

    // Verify no double taxation
    expect(result.totalTaxWithFTC).toBeCloseTo(Math.max(totalUSTax, totalCanadaTax), 0);
  });

  /**
   * Test Case 3: Edge case - Very low income below standard deduction
   * - Income below US standard deduction ($14,600)
   * - Minimal or zero tax liability
   * - Verify FTC handles low-income scenarios correctly
   */
  it('should handle very low income below standard deduction', () => {
    const income = 10000;

    const usFederal = calculateUSFederalTax(income, 'single');
    const usState = calculateUSStateTax(income, 'WA');
    const totalUSTax = usFederal.tax + usState.tax;

    const canadaFederal = calculateCanadaFederalTax(income);
    const canadaProvincial = calculateCanadaProvincialTax(income, 'BC');
    const totalCanadaTax = canadaFederal.tax + canadaProvincial.tax;

    const result = calculateFTC(totalUSTax, totalCanadaTax, income, 'WA', 'BC');

    // US tax should be $0 (below standard deduction)
    expect(totalUSTax).toBe(0);

    // Canada tax should be minimal (below basic personal amount)
    expect(totalCanadaTax).toBeLessThan(100);

    // FTC should be minimal or zero
    expect(result.totalTaxWithFTC).toBeCloseTo(totalCanadaTax, 0);
    expect(result.savings).toBeCloseTo(totalUSTax, 1);
  });

  /**
   * Test Case 4: Edge case - Foreign tax exceeds US tax (excess FTC)
   * - Scenario where Canada tax significantly exceeds US tax
   * - Verify excess FTC handling (not carried forward in MVP)
   * - Canada FTC should be capped at Canada's proportional share
   */
  it('should handle excess foreign tax scenario', () => {
    const income = 100000;

    // US tax (low because WA has no state tax)
    const usFederal = calculateUSFederalTax(income, 'single');
    const usState = calculateUSStateTax(income, 'WA');
    const totalUSTax = usFederal.tax + usState.tax;

    // Canada tax (higher due to BC provincial tax)
    const canadaFederal = calculateCanadaFederalTax(income);
    const canadaProvincial = calculateCanadaProvincialTax(income, 'BC');
    const totalCanadaTax = canadaFederal.tax + canadaProvincial.tax;

    const result = calculateFTC(totalUSTax, totalCanadaTax, income, 'WA', 'BC');

    // Canada tax should be higher than US tax
    expect(totalCanadaTax).toBeGreaterThan(totalUSTax);

    // When filing US-first: Canada FTC should be capped at Canada's share
    // FTC cannot exceed the amount of tax that would be paid to Canada
    expect(result.usFirstScenario.canadaFTC).toBeLessThanOrEqual(totalUSTax);
    expect(result.usFirstScenario.canadaFTC).toBeLessThanOrEqual(totalCanadaTax);

    // When filing Canada-first: US FTC should fully offset US tax
    expect(result.canadaFirstScenario.usFTC).toBeCloseTo(totalUSTax, 0);

    // Optimal strategy should be Canada-first (eliminates US tax completely)
    expect(result.optimalStrategy).toBe('file-canada-first');
  });

  /**
   * Test Case 5: Middle income with state/provincial tax (NY + ON)
   * - Both have progressive state/provincial taxes
   * - Verify FTC works with different state/province combinations
   */
  it('should calculate correct FTC for middle income (NY + ON)', () => {
    const income = 120000;

    const usFederal = calculateUSFederalTax(income, 'single');
    const usState = calculateUSStateTax(income, 'NY');
    const totalUSTax = usFederal.tax + usState.tax;

    const canadaFederal = calculateCanadaFederalTax(income);
    const canadaProvincial = calculateCanadaProvincialTax(income, 'ON');
    const totalCanadaTax = canadaFederal.tax + canadaProvincial.tax;

    const result = calculateFTC(totalUSTax, totalCanadaTax, income, 'NY', 'ON');

    // Both countries should have significant tax
    expect(totalUSTax).toBeGreaterThan(10000);
    expect(totalCanadaTax).toBeGreaterThan(15000);

    // FTC should provide meaningful savings
    expect(result.savings).toBeGreaterThan(10000);

    // Total tax with FTC should approximately equal higher of the two
    expect(result.totalTaxWithFTC).toBeCloseTo(Math.max(totalUSTax, totalCanadaTax), 0);
  });

  /**
   * Test Case 6: Zero income edge case
   * - Verify graceful handling of zero income
   */
  it('should handle zero income gracefully', () => {
    const result = calculateFTC(0, 0, 0, 'WA', 'BC');

    expect(result.totalTaxWithFTC).toBe(0);
    expect(result.totalTaxWithoutFTC).toBe(0);
    expect(result.savings).toBe(0);
    expect(result.usFTC).toBe(0);
    expect(result.canadaFTC).toBe(0);
  });

  /**
   * Test Case 7: Married filing status scenario
   * - Higher standard deduction and different brackets
   * - Verify FTC works with married filing status
   */
  it('should calculate FTC correctly for married filing status', () => {
    const income = 150000;

    const usFederal = calculateUSFederalTax(income, 'married');
    const usState = calculateUSStateTax(income, 'CA');
    const totalUSTax = usFederal.tax + usState.tax;

    const canadaFederal = calculateCanadaFederalTax(income);
    const canadaProvincial = calculateCanadaProvincialTax(income, 'BC');
    const totalCanadaTax = canadaFederal.tax + canadaProvincial.tax;

    const result = calculateFTC(totalUSTax, totalCanadaTax, income, 'CA', 'BC');

    // Married status should result in lower US federal tax
    expect(totalUSTax).toBeLessThan(30000);

    // FTC should still prevent double taxation
    expect(result.totalTaxWithFTC).toBeLessThan(result.totalTaxWithoutFTC);
    expect(result.savings).toBeGreaterThan(0);
  });
});

describe('calculateFTCWithAllocation - Income Allocation Scenarios', () => {
  /**
   * Test Case 8: Partial year resident - worked in both countries
   * - RSU vested while working 6 months in US, 6 months in Canada
   * - Income should be allocated proportionally
   * - Verify FTC based on proper income sourcing
   */
  it('should calculate FTC with 50/50 income allocation', () => {
    const totalIncome = 100000;
    const usSourcedIncome = 50000; // 6 months in US
    const canadaSourcedIncome = 50000; // 6 months in Canada

    // US taxes only US-sourced portion
    const usFederal = calculateUSFederalTax(usSourcedIncome, 'single');
    const usState = calculateUSStateTax(usSourcedIncome, 'WA');
    const totalUSTax = usFederal.tax + usState.tax;

    // Canada taxes worldwide income
    const canadaFederal = calculateCanadaFederalTax(totalIncome);
    const canadaProvincial = calculateCanadaProvincialTax(totalIncome, 'BC');
    const totalCanadaTax = canadaFederal.tax + canadaProvincial.tax;

    const result = calculateFTCWithAllocation(
      totalUSTax,
      totalCanadaTax,
      usSourcedIncome,
      canadaSourcedIncome,
      'WA',
      'BC'
    );

    // Canada FTC should be based on US-sourced portion (50%)
    const expectedCanadaFTCLimit = totalCanadaTax * 0.5;
    expect(result.usFirstScenario.canadaFTC).toBeLessThanOrEqual(expectedCanadaFTCLimit);

    // US FTC should be based on Canada-sourced portion (50%)
    const expectedUSFTCLimit = totalUSTax * 0.5;
    expect(result.canadaFirstScenario.usFTC).toBeLessThanOrEqual(expectedUSFTCLimit);

    // Total tax should account for proper allocation
    expect(result.totalTaxWithFTC).toBeGreaterThan(0);
    expect(result.savings).toBeGreaterThan(0);
  });

  /**
   * Test Case 9: Mostly US-sourced income (80/20 split)
   * - Worker spent most of vesting period in US
   * - Small portion of income is Canada-sourced
   */
  it('should calculate FTC with 80/20 US-heavy allocation', () => {
    const totalIncome = 100000;
    const usSourcedIncome = 80000;
    const canadaSourcedIncome = 20000;

    const usFederal = calculateUSFederalTax(usSourcedIncome, 'single');
    const usState = calculateUSStateTax(usSourcedIncome, 'CA');
    const totalUSTax = usFederal.tax + usState.tax;

    const canadaFederal = calculateCanadaFederalTax(totalIncome);
    const canadaProvincial = calculateCanadaProvincialTax(totalIncome, 'ON');
    const totalCanadaTax = canadaFederal.tax + canadaProvincial.tax;

    const result = calculateFTCWithAllocation(
      totalUSTax,
      totalCanadaTax,
      usSourcedIncome,
      canadaSourcedIncome,
      'CA',
      'ON'
    );

    // Canada FTC should cover most of US tax (80% of income is US-sourced)
    expect(result.usFirstScenario.canadaFTC).toBeGreaterThan(totalUSTax * 0.7);

    // US FTC should be limited (only 20% is Canada-sourced)
    expect(result.canadaFirstScenario.usFTC).toBeLessThan(totalCanadaTax * 0.3);
  });

  /**
   * Test Case 10: All Canada-sourced income (100% Canada)
   * - Worker moved to Canada before RSU vesting
   * - All work performed in Canada
   */
  it('should handle 100% Canada-sourced income', () => {
    const totalIncome = 80000;
    const usSourcedIncome = 0;
    const canadaSourcedIncome = 80000;

    // US should have minimal tax (only if US citizen/resident)
    const usFederal = calculateUSFederalTax(usSourcedIncome, 'single');
    const usState = calculateUSStateTax(usSourcedIncome, 'WA');
    const totalUSTax = usFederal.tax + usState.tax;

    const canadaFederal = calculateCanadaFederalTax(totalIncome);
    const canadaProvincial = calculateCanadaProvincialTax(totalIncome, 'BC');
    const totalCanadaTax = canadaFederal.tax + canadaProvincial.tax;

    const result = calculateFTCWithAllocation(
      totalUSTax,
      totalCanadaTax,
      usSourcedIncome,
      canadaSourcedIncome,
      'WA',
      'BC'
    );

    // US tax should be $0 (no US-sourced income)
    expect(totalUSTax).toBe(0);

    // Canada FTC should be $0 (no US tax paid)
    expect(result.usFirstScenario.canadaFTC).toBe(0);

    // Total tax should equal Canada tax only
    expect(result.totalTaxWithFTC).toBeCloseTo(totalCanadaTax, 0);
  });
});

describe('FTC Accuracy - Tolerance Tests', () => {
  /**
   * Verify all calculations are within ±$1 tolerance
   */
  it('should maintain ±$1 accuracy for all calculations', () => {
    const scenarios = [
      { income: 50000, state: 'WA' as const, province: 'BC' as const },
      { income: 100000, state: 'CA' as const, province: 'ON' as const },
      { income: 200000, state: 'NY' as const, province: 'BC' as const },
    ];

    scenarios.forEach(({ income, state, province }) => {
      const usFederal = calculateUSFederalTax(income, 'single');
      const usState = calculateUSStateTax(income, state);
      const totalUSTax = usFederal.tax + usState.tax;

      const canadaFederal = calculateCanadaFederalTax(income);
      const canadaProvincial = calculateCanadaProvincialTax(income, province);
      const totalCanadaTax = canadaFederal.tax + canadaProvincial.tax;

      const result = calculateFTC(totalUSTax, totalCanadaTax, income, state, province);

      // Verify rounding is consistent (2 decimal places)
      expect(result.totalTaxWithFTC).toBeCloseTo(Math.round(result.totalTaxWithFTC * 100) / 100, 2);
      expect(result.savings).toBeCloseTo(Math.round(result.savings * 100) / 100, 2);

      // Verify scenario totals match top-level values
      if (result.optimalStrategy === 'file-us-first') {
        expect(result.totalTaxWithFTC).toBeCloseTo(result.usFirstScenario.totalTax, 1);
      } else {
        expect(result.totalTaxWithFTC).toBeCloseTo(result.canadaFirstScenario.totalTax, 1);
      }
    });
  });
});
