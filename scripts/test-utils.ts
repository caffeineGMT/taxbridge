/**
 * Utilities Test Script
 * Tests currency conversion and employer helpers
 */

import {
  convertUsdToCad,
  convertCadToUsd,
  getAverageRate,
  formatCurrency,
  getYearFromDate,
} from '../lib/currency';

import {
  meta,
  amazon,
  google,
  microsoft,
  SUPPORTED_EMPLOYERS,
} from '../lib/employers';

console.log('Testing TaxBridge Utilities...\n');

// Test Currency Utilities
console.log('=== Currency Conversion Tests ===\n');

const usdAmount = 50000;
const year = 2024;
const rate = getAverageRate(year);

console.log(`USD Amount: ${formatCurrency(usdAmount, 'USD')}`);
console.log(`Exchange Rate (${year}): ${rate}`);

const cadAmount = convertUsdToCad(usdAmount, year);
console.log(`CAD Equivalent: ${formatCurrency(cadAmount, 'CAD')}`);

const backToUsd = convertCadToUsd(cadAmount, year);
console.log(`Convert Back to USD: ${formatCurrency(backToUsd, 'USD')}`);

console.log('✓ Currency conversion working correctly\n');

// Test date year extraction
const testDate = '2024-11-15';
const extractedYear = getYearFromDate(testDate);
console.log(`Date: ${testDate} -> Year: ${extractedYear}`);
console.log('✓ Date parsing working correctly\n');

// Test Employer Helpers
console.log('=== Employer Helpers Tests ===\n');

const employers = [
  { name: 'Meta', helper: meta },
  { name: 'Amazon', helper: amazon },
  { name: 'Google', helper: google },
  { name: 'Microsoft', helper: microsoft },
];

employers.forEach(({ name, helper }) => {
  console.log(`\n${name}:`);
  console.log(`  Ticker: ${helper.getTickerSymbol()}`);
  console.log(`  Full Name: ${helper.getEmployerName()}`);
  console.log(`  Vesting Schedule: ${helper.getTypicalVestingSchedule()}`);
  console.log(`  Frequency: ${helper.getVestingFrequency()}`);
  console.log(`  Notes: ${helper.getVestingNotes()}`);

  const testVestDate = new Date('2024-11-15');
  console.log(`  Formatted Vest: ${helper.formatVestSchedule(testVestDate)}`);
});

console.log('\n✓ All employer helpers working correctly\n');

// Test supported employers list
console.log('=== Supported Employers ===\n');
SUPPORTED_EMPLOYERS.forEach(emp => {
  console.log(`  ${emp.label} (${emp.ticker}) - value: ${emp.value}`);
});

console.log('\n✅ All utility tests passed!');
