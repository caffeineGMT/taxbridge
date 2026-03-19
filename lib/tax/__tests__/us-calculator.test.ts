import { describe, it, expect } from 'vitest';
import {
  calculateUSFederalTax,
  calculateUSStateTax,
  prorateIncome,
} from '../us-calculator';

describe('US Federal Tax Calculator', () => {
  describe('Single filer tests', () => {
    it('calculates federal tax for $100k income correctly', () => {
      const result = calculateUSFederalTax(100000, 'single');

      // Expected calculation for 2025 (IRS Rev. Proc. 2024-40):
      // Gross: $100,000
      // Standard deduction: $15,000
      // Taxable income: $85,000
      // 10% on $11,925 = $1,192.50
      // 12% on ($48,475 - $11,925) = $4,386
      // 22% on ($85,000 - $48,475) = $8,035.50
      // Total: $13,614

      expect(result.tax).toBeGreaterThanOrEqual(13564); // $13,614 - $50
      expect(result.tax).toBeLessThanOrEqual(13664); // $13,614 + $50
      expect(result.effectiveRate).toBeCloseTo(0.1361, 2);
      expect(result.marginalRate).toBe(0.22);
      expect(result.breakdown).toHaveLength(3);
    });

    it('calculates federal tax for $200k income correctly', () => {
      const result = calculateUSFederalTax(200000, 'single');

      // Taxable: $185,000
      // Should use brackets up to 24% rate

      expect(result.tax).toBeGreaterThan(30000);
      expect(result.tax).toBeLessThan(50000);
      expect(result.marginalRate).toBe(0.24);
    });

    it('handles low income with standard deduction', () => {
      const result = calculateUSFederalTax(10000, 'single');

      // Income below standard deduction ($15,000) = $0 tax
      expect(result.tax).toBe(0);
      expect(result.effectiveRate).toBe(0);
      expect(result.breakdown).toHaveLength(0);
    });
  });

  describe('Married filer tests', () => {
    it('calculates federal tax for $200k married income correctly', () => {
      const result = calculateUSFederalTax(200000, 'married');

      // Married standard deduction: $30,000
      // Taxable income: $170,000
      // Lower effective rate than single filer due to wider brackets

      expect(result.tax).toBeGreaterThan(20000);
      expect(result.tax).toBeLessThan(30000);
      expect(result.effectiveRate).toBeLessThan(0.15);
      expect(result.marginalRate).toBe(0.22);
    });

    it('married filers have lower effective rate than single', () => {
      const singleResult = calculateUSFederalTax(200000, 'single');
      const marriedResult = calculateUSFederalTax(200000, 'married');

      expect(marriedResult.effectiveRate).toBeLessThan(singleResult.effectiveRate);
    });
  });

  describe('High income edge cases', () => {
    it('handles very high income in top bracket', () => {
      const result = calculateUSFederalTax(1000000, 'single');

      expect(result.marginalRate).toBe(0.37);
      expect(result.effectiveRate).toBeGreaterThan(0.30);
      expect(result.tax).toBeGreaterThan(300000);
    });
  });
});

describe('US State Tax Calculator', () => {
  describe('Washington State (no income tax)', () => {
    it('returns $0 tax for WA', () => {
      const result = calculateUSStateTax(100000, 'WA');

      expect(result.tax).toBe(0);
      expect(result.effectiveRate).toBe(0);
      expect(result.breakdown).toContain('no state income tax');
    });
  });

  describe('Texas (no income tax)', () => {
    it('returns $0 tax for TX', () => {
      const result = calculateUSStateTax(100000, 'TX');

      expect(result.tax).toBe(0);
      expect(result.effectiveRate).toBe(0);
      expect(result.breakdown).toContain('no state income tax');
    });
  });

  describe('California', () => {
    it('calculates CA state tax for $100k income correctly', () => {
      const result = calculateUSStateTax(100000, 'CA');

      // Expected calculation for 2025:
      // Gross: $100,000
      // Standard deduction: $5,363
      // Taxable income: $94,637
      // 1% on $10,412 = $104.12
      // 2% on ($24,684 - $10,412) = $285.44
      // 4% on ($38,959 - $24,684) = $571
      // 6% on ($54,081 - $38,959) = $907.32
      // 8% on ($68,350 - $54,081) = $1,141.52
      // 9.3% on ($94,637 - $68,350) = $2,444.69
      // Total: ~$5,454

      expect(result.tax).toBeGreaterThanOrEqual(5404); // $5,454 - $50
      expect(result.tax).toBeLessThanOrEqual(5504); // $5,454 + $50
      expect(result.effectiveRate).toBeCloseTo(0.0545, 2);
      expect(result.breakdown).toContain('CA tax');
    });

    it('calculates CA state tax for $50k income', () => {
      const result = calculateUSStateTax(50000, 'CA');

      expect(result.tax).toBeGreaterThan(1000);
      expect(result.tax).toBeLessThan(2000);
      expect(result.effectiveRate).toBeGreaterThan(0.02);
    });

    it('handles very high CA income', () => {
      const result = calculateUSStateTax(500000, 'CA');

      expect(result.tax).toBeGreaterThan(40000);
      expect(result.effectiveRate).toBeGreaterThan(0.089);
    });
  });

  describe('New York', () => {
    it('calculates NY state tax for $100k income correctly', () => {
      const result = calculateUSStateTax(100000, 'NY');

      // Expected calculation for 2025:
      // Gross: $100,000
      // Standard deduction: $8,000
      // Taxable income: $92,000
      // 4% on $8,500 = $340
      // 4.5% on $3,200 = $144
      // 5.25% on $2,200 = $115.50
      // 5.5% on ($80,650 - $13,900) = $3,671.25
      // 6.0% on ($92,000 - $80,650) = $681.00
      // Total: $4,951.75

      expect(result.tax).toBeGreaterThanOrEqual(4902); // $4,951.75 - $50
      expect(result.tax).toBeLessThanOrEqual(5002); // $4,951.75 + $50
      expect(result.effectiveRate).toBeCloseTo(0.0495, 2);
      expect(result.breakdown).toContain('NY tax');
    });

    it('calculates NY state tax for $50k income', () => {
      const result = calculateUSStateTax(50000, 'NY');

      expect(result.tax).toBeGreaterThan(1500);
      expect(result.tax).toBeLessThan(3000);
      expect(result.effectiveRate).toBeGreaterThan(0.03);
    });
  });

  describe('Massachusetts', () => {
    it('calculates MA flat 5% state tax for $100k income', () => {
      const result = calculateUSStateTax(100000, 'MA');

      // MA flat 5%: $100,000 * 0.05 = $5,000
      expect(result.tax).toBe(5000);
      expect(result.effectiveRate).toBe(0.05);
      expect(result.breakdown).toContain('MA flat 5%');
    });

    it('applies 4% millionaire surtax for income over $1M', () => {
      const result = calculateUSStateTax(1500000, 'MA');

      // $1,500,000 * 5% = $75,000
      // ($1,500,000 - $1,000,000) * 4% = $20,000
      // Total = $95,000
      expect(result.tax).toBe(95000);
      expect(result.effectiveRate).toBeCloseTo(0.0633, 3);
      expect(result.breakdown).toContain('millionaire surtax');
    });
  });
});

describe('Combined federal + state tax', () => {
  it('single filer in WA pays only federal tax', () => {
    const federal = calculateUSFederalTax(100000, 'single');
    const state = calculateUSStateTax(100000, 'WA');
    const total = federal.tax + state.tax;

    expect(total).toBeGreaterThanOrEqual(13564); // Federal only
    expect(total).toBeLessThanOrEqual(13664);
    expect(state.tax).toBe(0);
  });

  it('single filer in CA pays federal + state', () => {
    const federal = calculateUSFederalTax(100000, 'single');
    const state = calculateUSStateTax(100000, 'CA');
    const total = federal.tax + state.tax;

    // Expected total: ~$13,614 + ~$5,454 = ~$19,068
    expect(total).toBeGreaterThanOrEqual(18968); // Combined - $100
    expect(total).toBeLessThanOrEqual(19168); // Combined + $100
  });

  it('single filer in NY pays federal + state', () => {
    const federal = calculateUSFederalTax(100000, 'single');
    const state = calculateUSStateTax(100000, 'NY');
    const total = federal.tax + state.tax;

    // Expected total: ~$13,614 + ~$4,952 = ~$18,566
    expect(total).toBeGreaterThanOrEqual(18466);
    expect(total).toBeLessThanOrEqual(18666);
  });
});

describe('Income Proration (Treaty Article XV)', () => {
  it('prorates $100k RSU with 180 US days / 365 total days', () => {
    const usSourced = prorateIncome(100000, 180, 365);

    // Expected: (180/365) * $100,000 = $49,315.07
    expect(usSourced).toBeGreaterThanOrEqual(49265);
    expect(usSourced).toBeLessThanOrEqual(49365);
  });

  it('returns 100% for worker still in US (365/365 days)', () => {
    const usSourced = prorateIncome(100000, 365, 365);

    expect(usSourced).toBe(100000);
  });

  it('returns 0% for worker with no US presence', () => {
    const usSourced = prorateIncome(100000, 0, 365);

    expect(usSourced).toBe(0);
  });

  it('handles partial year in US (6 months)', () => {
    const usSourced = prorateIncome(100000, 182, 365);

    // Expected: (182/365) * $100,000 = $49,863.01
    expect(usSourced).toBeCloseTo(49863, 0);
  });

  it('handles edge case of 0 total days', () => {
    const usSourced = prorateIncome(100000, 0, 0);

    expect(usSourced).toBe(0);
  });

  it('calculates tax on prorated income correctly', () => {
    // Scenario: $100k RSU, moved mid-year (180/365 days in US)
    const totalIncome = 100000;
    const usSourcedIncome = prorateIncome(totalIncome, 180, 365);

    const federal = calculateUSFederalTax(usSourcedIncome, 'single');
    const state = calculateUSStateTax(usSourcedIncome, 'CA');

    // Tax should be on ~$49,315, not full $100k
    expect(federal.tax).toBeLessThan(7000);
    expect(state.tax).toBeLessThan(3000);
  });
});

describe('Edge Cases - Input Validation', () => {
  it('handles negative income gracefully', () => {
    const result = calculateUSFederalTax(-50000, 'single');
    expect(result.tax).toBe(0);
    expect(result.effectiveRate).toBe(0);
    expect(result.breakdown).toHaveLength(0);
  });

  it('handles NaN income gracefully', () => {
    const result = calculateUSFederalTax(NaN, 'single');
    expect(result.tax).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it('handles Infinity income gracefully', () => {
    const result = calculateUSFederalTax(Infinity, 'single');
    expect(result.tax).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it('handles negative income for state tax', () => {
    const result = calculateUSStateTax(-100000, 'CA');
    expect(result.tax).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it('handles zero income for state tax', () => {
    const result = calculateUSStateTax(0, 'NY');
    expect(result.tax).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it('handles extremely large income ($10M)', () => {
    const result = calculateUSFederalTax(10000000, 'single');

    // Should handle without overflow
    expect(result.tax).toBeGreaterThan(3000000);
    expect(result.marginalRate).toBe(0.37);
    expect(Number.isFinite(result.tax)).toBe(true);
    expect(Number.isFinite(result.effectiveRate)).toBe(true);
  });

  it('handles $1 income', () => {
    const result = calculateUSFederalTax(1, 'single');
    expect(result.tax).toBe(0); // Below standard deduction
  });

  it('handles income exactly at standard deduction', () => {
    const result = calculateUSFederalTax(15000, 'single');
    expect(result.tax).toBe(0); // Taxable income = $0
  });

  it('handles income $1 above standard deduction', () => {
    const result = calculateUSFederalTax(15001, 'single');
    // Taxable income = $1, 10% rate = $0.10
    expect(result.tax).toBeCloseTo(0.10, 2);
  });

  it('handles negative income proration gracefully', () => {
    const result = prorateIncome(-100000, 180, 365);
    // Should still compute (negative * positive fraction = negative)
    expect(result).toBeLessThan(0);
  });
});

describe('Acceptance Criteria Validation', () => {
  it('ACCEPTANCE: Federal tax for $100k single filer is ~$13,614', () => {
    const result = calculateUSFederalTax(100000, 'single');

    // 2025 IRS Rev. Proc. 2024-40 brackets
    expect(result.tax).toBeGreaterThanOrEqual(13564);
    expect(result.tax).toBeLessThanOrEqual(13664);
  });

  it('ACCEPTANCE: CA state tax for $100k is ~$5,454', () => {
    const result = calculateUSStateTax(100000, 'CA');

    expect(result.tax).toBeGreaterThanOrEqual(5404);
    expect(result.tax).toBeLessThanOrEqual(5504);
  });

  it('ACCEPTANCE: WA/TX state tax is $0', () => {
    const waResult = calculateUSStateTax(100000, 'WA');
    const txResult = calculateUSStateTax(100000, 'TX');

    expect(waResult.tax).toBe(0);
    expect(txResult.tax).toBe(0);
  });

  it('ACCEPTANCE: Proration for 180 US days / 365 total returns $49,315', () => {
    const usSourced = prorateIncome(100000, 180, 365);

    expect(usSourced).toBeGreaterThanOrEqual(49265);
    expect(usSourced).toBeLessThanOrEqual(49365);
  });
});
