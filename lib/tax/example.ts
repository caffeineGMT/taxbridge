/**
 * Example usage of the US Tax Calculator
 * Run with: npx tsx lib/tax/example.ts
 */

import { calculateUSFederalTax, calculateUSStateTax, prorateIncome } from './us-calculator';
import { logger } from '@/lib/logger';

logger.info('=== US Tax Calculator Examples ===\n');

// Example 1: H-1B worker in Washington (tech hub)
logger.info('Example 1: Single filer, $100k RSU income, Washington State');
const federal1 = calculateUSFederalTax(100000, 'single');
const state1 = calculateUSStateTax(100000, 'WA');
logger.info(`Federal Tax: $${federal1.tax.toFixed(2)} (${(federal1.effectiveRate * 100).toFixed(2)}%)`);
logger.info(`State Tax: $${state1.tax.toFixed(2)} (WA has no income tax)`);
logger.info(`Total Tax: $${(federal1.tax + state1.tax).toFixed(2)}\n`);

// Example 2: H-1B worker in California
logger.info('Example 2: Single filer, $100k RSU income, California');
const federal2 = calculateUSFederalTax(100000, 'single');
const state2 = calculateUSStateTax(100000, 'CA');
logger.info(`Federal Tax: $${federal2.tax.toFixed(2)} (${(federal2.effectiveRate * 100).toFixed(2)}%)`);
logger.info(`State Tax: $${state2.tax.toFixed(2)} (${(state2.effectiveRate * 100).toFixed(2)}%)`);
logger.info(`Total Tax: $${(federal2.tax + state2.tax).toFixed(2)}\n`);

// Example 3: Worker who moved from US to Canada mid-year (Treaty Article XV)
logger.info('Example 3: Worker moved US → Canada mid-year');
const totalRSU = 100000;
const usDays = 180; // 6 months in US
const totalDays = 365;
const usSourcedIncome = prorateIncome(totalRSU, usDays, totalDays);
logger.info(`Total RSU: $${totalRSU.toLocaleString()}`);
logger.info(`US Days: ${usDays} / ${totalDays}`);
logger.info(`US-Sourced Income (taxable in US): $${usSourcedIncome.toFixed(2)}`);
const federal3 = calculateUSFederalTax(usSourcedIncome, 'single');
const state3 = calculateUSStateTax(usSourcedIncome, 'CA');
logger.info(`US Federal Tax: $${federal3.tax.toFixed(2)}`);
logger.info(`US State Tax (CA): $${state3.tax.toFixed(2)}`);
logger.info(`Total US Tax: $${(federal3.tax + state3.tax).toFixed(2)}\n`);

// Example 4: High earner comparison (Single vs Married)
logger.info('Example 4: $200k income - Single vs Married filing status');
const singleFederal = calculateUSFederalTax(200000, 'single');
const marriedFederal = calculateUSFederalTax(200000, 'married');
logger.info(`Single filer: $${singleFederal.tax.toFixed(2)} (${(singleFederal.effectiveRate * 100).toFixed(2)}%)`);
logger.info(`Married filer: $${marriedFederal.tax.toFixed(2)} (${(marriedFederal.effectiveRate * 100).toFixed(2)}%)`);
logger.info(`Savings from married filing: $${(singleFederal.tax - marriedFederal.tax).toFixed(2)}\n`);

// Example 5: Federal tax breakdown
logger.info('Example 5: Federal tax bracket breakdown for $100k single filer');
const federal5 = calculateUSFederalTax(100000, 'single');
logger.info('Breakdown by bracket:');
federal5.breakdown.forEach((b) => {
  logger.info(`  ${b.bracket}: ${(b.rate * 100).toFixed(0)}% → $${b.tax.toFixed(2)}`);
});
logger.info(`Total: $${federal5.tax.toFixed(2)}`);
logger.info(`Marginal rate: ${(federal5.marginalRate * 100).toFixed(0)}%`);
logger.info(`Effective rate: ${(federal5.effectiveRate * 100).toFixed(2)}%`);
