import { calculateUSFederalTax, calculateUSStateTax } from './lib/tax/us-calculator';
import { calculateCanadaFederalTax, calculateCanadaProvincialTax } from './lib/tax/canada-calculator';
import { calculateFTC } from './lib/tax/ftc-calculator';

// Test Case 1: Low income ($50k RSU, WA + BC)
const income = 50000;
const usFederal = calculateUSFederalTax(income, 'single');
const usState = calculateUSStateTax(income, 'WA');
const totalUSTax = usFederal.tax + usState.tax;

const canadaFederal = calculateCanadaFederalTax(income);
const canadaProvincial = calculateCanadaProvincialTax(income, 'BC');
const totalCanadaTax = canadaFederal.tax + canadaProvincial.tax;

console.log('Income:', income);
console.log('US Tax:', totalUSTax);
console.log('Canada Tax:', totalCanadaTax);

const result = calculateFTC(totalUSTax, totalCanadaTax, income, 'WA', 'BC');
console.log('\nFTC Result:');
console.log('Optimal Strategy:', result.optimalStrategy);
console.log('Total Tax With FTC:', result.totalTaxWithFTC);
console.log('Total Tax Without FTC:', result.totalTaxWithoutFTC);
console.log('Savings:', result.savings);
console.log('\nUS First Scenario:', result.usFirstScenario);
console.log('\nCanada First Scenario:', result.canadaFirstScenario);
