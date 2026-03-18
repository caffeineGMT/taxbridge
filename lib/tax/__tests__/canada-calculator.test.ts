import { describe, it, expect } from 'vitest';
import {
  calculateCanadaFederalTax,
  calculateCanadaProvincialTax,
  calculateForeignTaxCredit,
} from '../canada-calculator';

describe('Canada Federal Tax Calculator', () => {
  describe('Basic federal tax calculations', () => {
    it('calculates federal tax for $100k CAD income correctly', () => {
      const result = calculateCanadaFederalTax(100000);

      // Expected calculation for 2025:
      // Gross: $100,000
      // Basic personal amount: $15,705
      // Taxable income: $84,295
      // 15% on $55,867 = $8,380.05
      // 20.5% on ($84,295 - $55,867) = $5,827.74
      // Total: $14,207.79

      expect(result.tax).toBeGreaterThanOrEqual(14208 - 50); // $14,207.79 - $50
      expect(result.tax).toBeLessThanOrEqual(14208 + 50); // $14,207.79 + $50
      expect(result.effectiveRate).toBeCloseTo(0.1421, 2);
      expect(result.marginalRate).toBe(0.205);
      expect(result.breakdown).toHaveLength(2);
    });

    it('calculates federal tax for $50k income', () => {
      const result = calculateCanadaFederalTax(50000);

      // Taxable: $34,295
      // All in 15% bracket
      expect(result.tax).toBeGreaterThan(5000);
      expect(result.tax).toBeLessThan(6000);
      expect(result.marginalRate).toBe(0.15);
      expect(result.breakdown).toHaveLength(1);
    });

    it('handles low income with basic personal amount', () => {
      const result = calculateCanadaFederalTax(15000);

      // Income below basic personal amount = $0 tax
      expect(result.tax).toBe(0);
      expect(result.effectiveRate).toBe(0);
      expect(result.breakdown).toHaveLength(0);
    });

    it('handles high income in top bracket', () => {
      const result = calculateCanadaFederalTax(300000);

      // Should reach 33% marginal bracket
      expect(result.marginalRate).toBe(0.33);
      expect(result.effectiveRate).toBeGreaterThan(0.20);
      expect(result.tax).toBeGreaterThan(60000);
    });
  });

  describe('Edge cases', () => {
    it('handles exactly at bracket boundary', () => {
      const result = calculateCanadaFederalTax(55867 + 15705); // $71,572

      // Should be exactly at first bracket boundary after BPA
      expect(result.marginalRate).toBe(0.15);
    });

    it('handles zero income', () => {
      const result = calculateCanadaFederalTax(0);

      expect(result.tax).toBe(0);
      expect(result.effectiveRate).toBe(0);
      expect(result.breakdown).toHaveLength(0);
    });
  });
});

describe('Canada Provincial Tax Calculator', () => {
  describe('British Columbia (BC)', () => {
    it('calculates BC provincial tax for $100k income correctly', () => {
      const result = calculateCanadaProvincialTax(100000, 'BC');

      // Expected calculation for 2025:
      // Gross: $100,000
      // Basic amount: $12,580
      // Taxable income: $87,420
      // 5.06% on $47,937 = $2,425.61
      // 7.7% on ($87,420 - $47,937) = $3,040.19
      // Total: $5,465.80

      expect(result.tax).toBeGreaterThanOrEqual(5466 - 50); // $5,465.80 - $50
      expect(result.tax).toBeLessThanOrEqual(5466 + 50); // $5,465.80 + $50
      expect(result.effectiveRate).toBeCloseTo(0.0547, 2);
      expect(result.breakdown).toContain('BC tax');
    });

    it('calculates BC tax for $50k income', () => {
      const result = calculateCanadaProvincialTax(50000, 'BC');

      expect(result.tax).toBeGreaterThan(1800);
      expect(result.tax).toBeLessThan(2200);
      expect(result.breakdown).toContain('BC');
    });

    it('handles high income in top BC bracket', () => {
      const result = calculateCanadaProvincialTax(300000, 'BC');

      // Should reach 20.5% top bracket
      expect(result.tax).toBeGreaterThan(30000);
      expect(result.effectiveRate).toBeGreaterThan(0.12);
    });
  });

  describe('Ontario (ON)', () => {
    it('calculates ON provincial tax for $100k income correctly', () => {
      const result = calculateCanadaProvincialTax(100000, 'ON');

      // Expected calculation for 2025:
      // Gross: $100,000
      // Basic amount: $11,865
      // Taxable income: $88,135
      // 5.05% on $51,446 = $2,598.02
      // 9.15% on ($88,135 - $51,446) = $3,357.05
      // Total: $5,955.07

      expect(result.tax).toBeGreaterThanOrEqual(5955 - 50); // $5,955.07 - $50
      expect(result.tax).toBeLessThanOrEqual(5955 + 50); // $5,955.07 + $50
      expect(result.effectiveRate).toBeCloseTo(0.0596, 2);
      expect(result.breakdown).toContain('ON tax');
    });

    it('calculates ON tax for $50k income', () => {
      const result = calculateCanadaProvincialTax(50000, 'ON');

      expect(result.tax).toBeGreaterThan(1900);
      expect(result.tax).toBeLessThan(2300);
      expect(result.breakdown).toContain('ON');
    });

    it('handles high income in top ON bracket', () => {
      const result = calculateCanadaProvincialTax(300000, 'ON');

      // Should reach 13.16% top bracket
      expect(result.tax).toBeGreaterThan(25000);
      expect(result.effectiveRate).toBeGreaterThan(0.10);
    });
  });

  describe('Alberta (AB)', () => {
    it('calculates AB provincial tax for $100k income correctly', () => {
      const result = calculateCanadaProvincialTax(100000, 'AB');

      // Expected calculation for 2025:
      // Gross: $100,000
      // Basic amount: $21,885
      // Taxable income: $78,115
      // Flat 10%: $7,811.50

      expect(result.tax).toBeGreaterThanOrEqual(7762 - 50); // $7,812 - $50
      expect(result.tax).toBeLessThanOrEqual(7862 + 50); // $7,812 + $50
      expect(result.effectiveRate).toBeCloseTo(0.0781, 2);
      expect(result.breakdown).toContain('AB flat 10%');
    });

    it('calculates AB tax for $50k income', () => {
      const result = calculateCanadaProvincialTax(50000, 'AB');

      // Taxable: $28,115
      // 10% flat: $2,811.50
      expect(result.tax).toBeGreaterThan(2761);
      expect(result.tax).toBeLessThan(2861);
      expect(result.breakdown).toContain('AB');
    });

    it('handles high income with flat rate', () => {
      const result = calculateCanadaProvincialTax(300000, 'AB');

      // Taxable: $278,115
      // 10% flat: $27,811.50
      expect(result.tax).toBeGreaterThan(27000);
      expect(result.effectiveRate).toBeCloseTo(0.0927, 2);
    });
  });
});

describe('Combined Federal + Provincial Tax', () => {
  it('calculates total tax for BC resident with $100k income', () => {
    const federal = calculateCanadaFederalTax(100000);
    const provincial = calculateCanadaProvincialTax(100000, 'BC');
    const total = federal.tax + provincial.tax;

    // Expected: ~$14,207.79 + ~$5,465.80 = ~$19,673.59
    expect(total).toBeGreaterThanOrEqual(19624); // $19,673.59 - $50
    expect(total).toBeLessThanOrEqual(19724); // $19,673.59 + $50
    expect(total / 100000).toBeCloseTo(0.1967, 2); // ~19.67% effective rate
  });

  it('calculates total tax for ON resident with $100k income', () => {
    const federal = calculateCanadaFederalTax(100000);
    const provincial = calculateCanadaProvincialTax(100000, 'ON');
    const total = federal.tax + provincial.tax;

    // Expected: ~$14,207.79 + ~$5,955.07 = ~$20,162.86
    expect(total).toBeGreaterThanOrEqual(20113); // $20,162.86 - $50
    expect(total).toBeLessThanOrEqual(20213); // $20,162.86 + $50
  });

  it('calculates total tax for AB resident with $100k income', () => {
    const federal = calculateCanadaFederalTax(100000);
    const provincial = calculateCanadaProvincialTax(100000, 'AB');
    const total = federal.tax + provincial.tax;

    // Expected: ~$14,207.79 + ~$7,811.50 = ~$22,019.29
    expect(total).toBeGreaterThanOrEqual(21970); // $22,019.29 - $50
    expect(total).toBeLessThanOrEqual(22070); // $22,019.29 + $50
  });

  it('ON residents pay more provincial tax than BC residents', () => {
    const bcTax = calculateCanadaProvincialTax(100000, 'BC');
    const onTax = calculateCanadaProvincialTax(100000, 'ON');

    // ON has higher rates in middle brackets
    expect(onTax.tax).toBeGreaterThan(bcTax.tax);
  });

  it('AB residents pay highest provincial tax due to high basic amount', () => {
    const bcTax = calculateCanadaProvincialTax(100000, 'BC');
    const onTax = calculateCanadaProvincialTax(100000, 'ON');
    const abTax = calculateCanadaProvincialTax(100000, 'AB');

    // Despite flat 10% rate, AB's high basic amount makes it competitive
    // For $100k income, AB should be highest due to 10% flat rate
    expect(abTax.tax).toBeGreaterThan(bcTax.tax);
    expect(abTax.tax).toBeGreaterThan(onTax.tax);
  });
});

describe('Foreign Tax Credit (FTC) Calculation', () => {
  describe('Basic FTC scenarios', () => {
    it('calculates FTC when US tax is less than Canada tax on US portion', () => {
      // Scenario: $100k total income, $50k US-sourced, $7k US tax paid
      // Canada tax on $100k = ~$20,600 (BC resident)
      const federal = calculateCanadaFederalTax(100000);
      const provincial = calculateCanadaProvincialTax(100000, 'BC');
      const canadaTaxOnTotal = federal.tax + provincial.tax;

      const result = calculateForeignTaxCredit(7000, 50000, 100000, canadaTaxOnTotal);

      // Canada's tax rate: ~19.67%
      // Canada's tax on $50k US portion: ~$9,836.80
      // US tax paid: $7,000 < $9,836.80
      // FTC = $7,000 (full US tax claimed)
      // Remaining Canada tax: ~$19,673.59 - $7,000 = ~$12,673.59

      expect(result.ftcAmount).toBeGreaterThanOrEqual(6950);
      expect(result.ftcAmount).toBeLessThanOrEqual(7050);
      expect(result.remainingCanadaTax).toBeGreaterThanOrEqual(12624); // ~$12,673.59 - $50
      expect(result.remainingCanadaTax).toBeLessThanOrEqual(12724); // ~$12,673.59 + $50
      expect(result.explanation).toContain('Full US tax');
    });

    it('calculates FTC when US tax exceeds Canada tax on US portion', () => {
      // Scenario: $100k total, $50k US-sourced, $12k US tax paid (excess)
      const federal = calculateCanadaFederalTax(100000);
      const provincial = calculateCanadaProvincialTax(100000, 'BC');
      const canadaTaxOnTotal = federal.tax + provincial.tax;

      const result = calculateForeignTaxCredit(12000, 50000, 100000, canadaTaxOnTotal);

      // Canada's tax on $50k US portion: ~$9,836.80
      // US tax paid: $12,000 > $9,836.80
      // FTC capped at $9,836.80
      // Excess: $12,000 - $9,836.80 = $2,163.20 (lost)
      // Remaining Canada tax: ~$19,673.59 - $9,836.80 = ~$9,836.79

      expect(result.ftcAmount).toBeGreaterThanOrEqual(9787);
      expect(result.ftcAmount).toBeLessThanOrEqual(9887);
      expect(result.remainingCanadaTax).toBeGreaterThanOrEqual(9787);
      expect(result.remainingCanadaTax).toBeLessThanOrEqual(9887);
      expect(result.explanation).toContain('FTC capped');
      expect(result.explanation).toContain('Excess US tax');
    });

    it('handles case where all income is US-sourced', () => {
      // Scenario: $100k total, $100k US-sourced, $20k US tax paid
      const federal = calculateCanadaFederalTax(100000);
      const provincial = calculateCanadaProvincialTax(100000, 'BC');
      const canadaTaxOnTotal = federal.tax + provincial.tax;

      const result = calculateForeignTaxCredit(20000, 100000, 100000, canadaTaxOnTotal);

      // All income is US-sourced, so FTC = min($20k, ~$19.67k) = $19.67k
      // Remaining Canada tax: ~$19.67k - $19.67k = ~$0

      expect(result.ftcAmount).toBeGreaterThanOrEqual(19624);
      expect(result.ftcAmount).toBeLessThanOrEqual(19724);
      expect(result.remainingCanadaTax).toBeGreaterThanOrEqual(0);
      expect(result.remainingCanadaTax).toBeLessThanOrEqual(50);
    });

    it('handles case where no US-sourced income', () => {
      const federal = calculateCanadaFederalTax(100000);
      const provincial = calculateCanadaProvincialTax(100000, 'BC');
      const canadaTaxOnTotal = federal.tax + provincial.tax;

      const result = calculateForeignTaxCredit(5000, 0, 100000, canadaTaxOnTotal);

      // No US-sourced income, so FTC = $0
      expect(result.ftcAmount).toBe(0);
      expect(result.remainingCanadaTax).toBe(canadaTaxOnTotal);
      expect(result.explanation).toContain('No US-sourced income');
    });

    it('handles zero total income', () => {
      const result = calculateForeignTaxCredit(1000, 0, 0, 0);

      expect(result.ftcAmount).toBe(0);
      expect(result.remainingCanadaTax).toBe(0);
      expect(result.explanation).toContain('No income reported');
    });
  });

  describe('Province-specific FTC scenarios', () => {
    it('calculates FTC correctly for ON resident', () => {
      // ON has higher provincial tax than BC
      const federal = calculateCanadaFederalTax(100000);
      const provincial = calculateCanadaProvincialTax(100000, 'ON');
      const canadaTaxOnTotal = federal.tax + provincial.tax;

      const result = calculateForeignTaxCredit(7000, 50000, 100000, canadaTaxOnTotal);

      // Canada tax on $100k (ON): ~$20,162.86
      // FTC should still be $7,000 (full US tax)
      expect(result.ftcAmount).toBeGreaterThanOrEqual(6950);
      expect(result.ftcAmount).toBeLessThanOrEqual(7050);
      expect(result.remainingCanadaTax).toBeGreaterThanOrEqual(13113);
      expect(result.remainingCanadaTax).toBeLessThanOrEqual(13213);
    });

    it('calculates FTC correctly for AB resident', () => {
      // AB has flat 10% provincial tax
      const federal = calculateCanadaFederalTax(100000);
      const provincial = calculateCanadaProvincialTax(100000, 'AB');
      const canadaTaxOnTotal = federal.tax + provincial.tax;

      const result = calculateForeignTaxCredit(7000, 50000, 100000, canadaTaxOnTotal);

      // Canada tax on $100k (AB): ~$22,019.29
      // FTC should still be $7,000 (full US tax)
      expect(result.ftcAmount).toBeGreaterThanOrEqual(6950);
      expect(result.ftcAmount).toBeLessThanOrEqual(7050);
      expect(result.remainingCanadaTax).toBeGreaterThanOrEqual(14970);
      expect(result.remainingCanadaTax).toBeLessThanOrEqual(15070);
    });
  });

  describe('Realistic H-1B/TN worker scenarios', () => {
    it('handles mid-year move from US to Canada (50% US-sourced)', () => {
      // Worker earned $150k total, but only $75k was while in US
      // US tax on $75k: ~$12,000
      // Canada tax on $150k: ~$35,000
      const federal = calculateCanadaFederalTax(150000);
      const provincial = calculateCanadaProvincialTax(150000, 'BC');
      const canadaTaxOnTotal = federal.tax + provincial.tax;

      const result = calculateForeignTaxCredit(12000, 75000, 150000, canadaTaxOnTotal);

      // Canada's tax rate on $150k: ~24.5%
      // Canada's tax on $75k US portion: ~$18,379
      // US tax paid: $12,000 < $18,379
      // FTC = $12,000
      expect(result.ftcAmount).toBeGreaterThanOrEqual(11950);
      expect(result.ftcAmount).toBeLessThanOrEqual(12050);
      expect(result.remainingCanadaTax).toBeGreaterThanOrEqual(24708);
      expect(result.remainingCanadaTax).toBeLessThanOrEqual(24808);
    });

    it('handles RSU vesting scenario with proration', () => {
      // RSU vested: $80k total
      // US-sourced (180/365 days): ~$39,452
      // US tax paid on $39,452: ~$5,000
      // Canada tax on $80k total: ~$16,000
      const federal = calculateCanadaFederalTax(80000);
      const provincial = calculateCanadaProvincialTax(80000, 'ON');
      const canadaTaxOnTotal = federal.tax + provincial.tax;

      const usSourcedIncome = Math.round((180 / 365) * 80000);
      const result = calculateForeignTaxCredit(5000, usSourcedIncome, 80000, canadaTaxOnTotal);

      // FTC should be ~$5,000
      expect(result.ftcAmount).toBeGreaterThanOrEqual(4950);
      expect(result.ftcAmount).toBeLessThanOrEqual(5050);
      expect(result.remainingCanadaTax).toBeGreaterThanOrEqual(9183);
      expect(result.remainingCanadaTax).toBeLessThanOrEqual(9283);
    });
  });
});

describe('Acceptance Criteria Validation', () => {
  it('ACCEPTANCE: Federal tax for $100k CAD is $14,208 ± $50', () => {
    const result = calculateCanadaFederalTax(100000);

    // Actual calculation with 2025 CRA brackets: $14,207.79
    expect(result.tax).toBeGreaterThanOrEqual(14158); // $14,208 - $50
    expect(result.tax).toBeLessThanOrEqual(14258); // $14,208 + $50
  });

  it('ACCEPTANCE: BC provincial tax for $100k is $5,466 ± $50', () => {
    const result = calculateCanadaProvincialTax(100000, 'BC');

    // Actual calculation with 2025 BC brackets: $5,465.80
    expect(result.tax).toBeGreaterThanOrEqual(5416); // $5,466 - $50
    expect(result.tax).toBeLessThanOrEqual(5516); // $5,466 + $50
  });

  it('ACCEPTANCE: ON provincial tax for $100k is $5,955 ± $50', () => {
    const result = calculateCanadaProvincialTax(100000, 'ON');

    // Actual calculation with 2025 ON brackets: $5,955.07
    expect(result.tax).toBeGreaterThanOrEqual(5905); // $5,955 - $50
    expect(result.tax).toBeLessThanOrEqual(6005); // $5,955 + $50
  });

  it('ACCEPTANCE: Combined BC total for $100k is $19,674 ± $50', () => {
    const federal = calculateCanadaFederalTax(100000);
    const provincial = calculateCanadaProvincialTax(100000, 'BC');
    const total = federal.tax + provincial.tax;

    // Actual: $14,207.79 + $5,465.80 = $19,673.59
    expect(total).toBeGreaterThanOrEqual(19624); // $19,674 - $50
    expect(total).toBeLessThanOrEqual(19724); // $19,674 + $50
    expect(total / 100000).toBeCloseTo(0.1967, 2); // ~19.67% effective rate
  });

  it('ACCEPTANCE: FTC calculation reduces Canada tax correctly', () => {
    // $100k total, $50k US-sourced, $7k US tax paid
    // Canada tax $19,674 → FTC $7,000, net $12,674
    const federal = calculateCanadaFederalTax(100000);
    const provincial = calculateCanadaProvincialTax(100000, 'BC');
    const canadaTaxOnTotal = federal.tax + provincial.tax;

    const result = calculateForeignTaxCredit(7000, 50000, 100000, canadaTaxOnTotal);

    expect(result.ftcAmount).toBeGreaterThanOrEqual(6950);
    expect(result.ftcAmount).toBeLessThanOrEqual(7050);
    expect(result.remainingCanadaTax).toBeGreaterThanOrEqual(12624);
    expect(result.remainingCanadaTax).toBeLessThanOrEqual(12724);
  });

  it('ACCEPTANCE: FTC excess test - US tax exceeds Canada share', () => {
    // US tax $12k exceeds Canada's share → FTC capped at $9,837
    const federal = calculateCanadaFederalTax(100000);
    const provincial = calculateCanadaProvincialTax(100000, 'BC');
    const canadaTaxOnTotal = federal.tax + provincial.tax;

    const result = calculateForeignTaxCredit(12000, 50000, 100000, canadaTaxOnTotal);

    expect(result.ftcAmount).toBeGreaterThanOrEqual(9787);
    expect(result.ftcAmount).toBeLessThanOrEqual(9887);
    expect(result.explanation).toContain('capped');
  });
});
