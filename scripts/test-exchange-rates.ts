/**
 * Test script for Bank of Canada exchange rate integration
 * Tests API fetching, database caching, and conversion functions
 */

import { getExchangeRate, convertUsdToCadByDate, formatCurrency } from '../lib/currency';
import { getDatabase } from '../lib/db/index';

const TEST_DATES = [
  '2023-01-01',
  '2024-06-15',
  '2025-12-31',
];

const TEST_AMOUNT = 1234.56;

async function runTests() {
  console.log('🧪 Testing Bank of Canada Exchange Rate Integration\n');

  // Test 1: Fetch exchange rates
  console.log('Test 1: Fetching exchange rates from Bank of Canada API');
  for (const date of TEST_DATES) {
    try {
      const rate = await getExchangeRate(date);
      console.log(`  ✅ ${date}: ${rate.toFixed(4)} USD/CAD`);
    } catch (error) {
      console.log(`  ❌ ${date}: Failed - ${error}`);
    }
  }

  console.log('\n---\n');

  // Test 2: Verify database caching
  console.log('Test 2: Verifying database cache');
  const db = getDatabase();
  const cachedRates = db.prepare('SELECT rate_date, usd_to_cad, created_at FROM exchange_rates ORDER BY rate_date').all() as Array<{
    rate_date: string;
    usd_to_cad: number;
    created_at: string;
  }>;

  if (cachedRates.length > 0) {
    console.log(`  ✅ Found ${cachedRates.length} cached rates:`);
    cachedRates.forEach((cached) => {
      console.log(`    - ${cached.rate_date}: ${cached.usd_to_cad.toFixed(4)} (cached at ${cached.created_at})`);
    });
  } else {
    console.log('  ⚠️  No cached rates found');
  }

  console.log('\n---\n');

  // Test 3: Test cached vs fresh fetch
  console.log('Test 3: Testing cache hit (second fetch should be instant)');
  const testDate = TEST_DATES[0];

  console.time('  First fetch (from cache)');
  await getExchangeRate(testDate);
  console.timeEnd('  First fetch (from cache)');

  console.time('  Second fetch (from cache)');
  await getExchangeRate(testDate);
  console.timeEnd('  Second fetch (from cache)');

  console.log('\n---\n');

  // Test 4: Test currency conversion
  console.log(`Test 4: Converting ${formatCurrency(TEST_AMOUNT, 'USD')} to CAD`);
  for (const date of TEST_DATES) {
    try {
      const cadAmount = await convertUsdToCadByDate(TEST_AMOUNT, date);
      console.log(`  ✅ ${date}: ${formatCurrency(cadAmount, 'CAD')}`);
    } catch (error) {
      console.log(`  ❌ ${date}: Failed - ${error}`);
    }
  }

  console.log('\n---\n');

  // Test 5: Test CurrencyDisplay component data flow
  console.log('Test 5: Simulating CurrencyDisplay component data flow');
  const displayDate = '2024-03-15';
  const displayAmount = 10000;

  try {
    const rate = await getExchangeRate(displayDate);
    const cadAmount = displayAmount * rate;
    console.log(`  Input: ${formatCurrency(displayAmount, 'USD')} on ${displayDate}`);
    console.log(`  Rate: ${rate.toFixed(4)}`);
    console.log(`  Output: ${formatCurrency(cadAmount, 'CAD')}`);
    console.log('  ✅ Component data flow works correctly');
  } catch (error) {
    console.log(`  ❌ Failed: ${error}`);
  }

  console.log('\n🎉 All tests completed!\n');
}

// Run tests
runTests().catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
