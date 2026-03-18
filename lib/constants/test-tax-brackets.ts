/**
 * Test file to verify 2025 tax bracket calculations
 * Run this to validate the tax bracket constants are correct
 */

import { US_FEDERAL_2025, CA_FEDERAL_2025, calculateTax, STANDARD_DEDUCTION_2025 } from './tax-brackets';
import { FilingStatus } from '../types';

console.log('Testing 2025 Tax Brackets...\n');

// Test US Federal Single $100k income
// According to IRS 2025 brackets for Single:
// 10% on $11,925 = $1,192.50
// 12% on ($48,475 - $11,925) = $36,550 * 0.12 = $4,386
// 22% on ($100,000 - $48,475) = $51,525 * 0.22 = $11,335.50
// Total: $16,914
const income100k = 100000;
const tax100kSingle = calculateTax(income100k, US_FEDERAL_2025[FilingStatus.Single]);
console.log(`US Federal Single $100k income:`);
console.log(`  Calculated tax: $${tax100kSingle.toFixed(2)}`);
console.log(`  Expected: ~$16,914`);
console.log(`  Match: ${Math.abs(tax100kSingle - 16914) < 1 ? '✓' : '✗'}\n`);

// Test US Federal Single $110k income
// 10% on $11,925 = $1,192.50
// 12% on ($48,475 - $11,925) = $36,550 * 0.12 = $4,386
// 22% on ($103,350 - $48,475) = $54,875 * 0.22 = $12,072.50
// 24% on ($110,000 - $103,350) = $6,650 * 0.24 = $1,596
// Total: $19,247
const income110k = 110000;
const tax110kSingle = calculateTax(income110k, US_FEDERAL_2025[FilingStatus.Single]);
console.log(`US Federal Single $110k income:`);
console.log(`  Calculated tax: $${tax110kSingle.toFixed(2)}`);
console.log(`  Expected: ~$19,247`);
console.log(`  Match: ${Math.abs(tax110kSingle - 19247) < 1 ? '✓' : '✗'}\n`);

// Test Canada Federal $100k income
// 15% on $55,867 = $8,380.05
// 20.5% on ($100,000 - $55,867) = $44,133 * 0.205 = $9,047.27
// Total: $17,427.32
const tax100kCA = calculateTax(income100k, CA_FEDERAL_2025);
console.log(`Canada Federal $100k income:`);
console.log(`  Calculated tax: $${tax100kCA.toFixed(2)}`);
console.log(`  Expected: ~$17,427`);
console.log(`  Match: ${Math.abs(tax100kCA - 17427) < 1 ? '✓' : '✗'}\n`);

// Test standard deduction
console.log(`Standard Deductions 2025:`);
console.log(`  Single: $${STANDARD_DEDUCTION_2025[FilingStatus.Single]}`);
console.log(`  Married Filing Jointly: $${STANDARD_DEDUCTION_2025[FilingStatus.MarriedFilingJointly]}`);
console.log(`  Head of Household: $${STANDARD_DEDUCTION_2025[FilingStatus.HeadOfHousehold]}`);

console.log('\nAll tax bracket tests completed!');
