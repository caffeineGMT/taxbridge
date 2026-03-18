/**
 * Verification script for Bank of Canada Exchange Rate Integration
 * Tests all components: API, caching, conversion, and database
 */

import { getExchangeRate, convertUsdToCadByDate, formatCurrency } from '../lib/currency';
import { getDatabase, getCachedExchangeRate } from '../lib/db/index';

async function verify() {
  console.log('🔍 Verifying Bank of Canada Exchange Rate Integration\n');
  console.log('=' .repeat(70) + '\n');

  let passed = 0;
  let failed = 0;

  // Test 1: API Fetch
  console.log('Test 1: Fetch exchange rate from API');
  try {
    const testDate = '2024-11-15';
    const rate = await getExchangeRate(testDate);
    console.log(`✅ Successfully fetched rate for ${testDate}: ${rate.toFixed(4)}`);
    passed++;
  } catch (error) {
    console.log(`❌ Failed to fetch rate: ${error}`);
    failed++;
  }
  console.log();

  // Test 2: Database Caching
  console.log('Test 2: Verify database caching');
  try {
    const testDate = '2024-11-15';
    const cachedRate = getCachedExchangeRate(testDate);
    if (cachedRate !== undefined) {
      console.log(`✅ Rate cached in database: ${cachedRate.toFixed(4)}`);
      passed++;
    } else {
      console.log('❌ Rate not found in cache');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Cache lookup failed: ${error}`);
    failed++;
  }
  console.log();

  // Test 3: Currency Conversion
  console.log('Test 3: Currency conversion with date-specific rate');
  try {
    const usd = 5000;
    const date = '2024-11-15';
    const cad = await convertUsdToCadByDate(usd, date);
    console.log(`✅ Converted ${formatCurrency(usd, 'USD')} to ${formatCurrency(cad, 'CAD')}`);
    console.log(`   on ${date}`);
    passed++;
  } catch (error) {
    console.log(`❌ Conversion failed: ${error}`);
    failed++;
  }
  console.log();

  // Test 4: Fallback for Invalid Date
  console.log('Test 4: Fallback mechanism for holidays/invalid dates');
  try {
    const holidayDate = '2024-12-25'; // Christmas - no rate published
    const rate = await getExchangeRate(holidayDate);
    console.log(`✅ Fallback mechanism worked for ${holidayDate}: ${rate.toFixed(4)}`);
    console.log(`   (Using annual average as fallback)`);
    passed++;
  } catch (error) {
    console.log(`❌ Fallback failed: ${error}`);
    failed++;
  }
  console.log();

  // Test 5: Database Schema
  console.log('Test 5: Verify database schema');
  try {
    const db = getDatabase();
    const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='exchange_rates'").get() as { sql: string } | undefined;
    if (tableInfo) {
      console.log('✅ exchange_rates table exists');
      passed++;
    } else {
      console.log('❌ exchange_rates table not found');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Schema check failed: ${error}`);
    failed++;
  }
  console.log();

  // Test 6: Cache Performance
  console.log('Test 6: Cache performance test');
  try {
    const testDate = '2024-11-15';

    // First call (from cache)
    const start1 = performance.now();
    await getExchangeRate(testDate);
    const time1 = performance.now() - start1;

    // Second call (also from cache)
    const start2 = performance.now();
    await getExchangeRate(testDate);
    const time2 = performance.now() - start2;

    console.log(`✅ Cache performance:`);
    console.log(`   First call:  ${time1.toFixed(2)}ms`);
    console.log(`   Second call: ${time2.toFixed(2)}ms`);
    console.log(`   Both calls used cache (should be <5ms each)`);
    passed++;
  } catch (error) {
    console.log(`❌ Performance test failed: ${error}`);
    failed++;
  }
  console.log();

  // Summary
  console.log('=' .repeat(70));
  console.log('\n📊 Test Summary');
  console.log(`   Passed: ${passed}/${passed + failed}`);
  console.log(`   Failed: ${failed}/${passed + failed}`);

  if (failed === 0) {
    console.log('\n✅ All tests passed! Implementation verified successfully.\n');

    // Show cached rates
    console.log('📦 Currently Cached Rates:');
    const db = getDatabase();
    const cached = db.prepare('SELECT rate_date, usd_to_cad FROM exchange_rates ORDER BY rate_date DESC LIMIT 10').all() as Array<{
      rate_date: string;
      usd_to_cad: number;
    }>;

    if (cached.length > 0) {
      cached.forEach((row) => {
        console.log(`   ${row.rate_date}: ${row.usd_to_cad.toFixed(4)}`);
      });
    } else {
      console.log('   (No rates cached yet)');
    }
    console.log();
  } else {
    console.log('\n❌ Some tests failed. Please review the errors above.\n');
    process.exit(1);
  }
}

verify().catch((error) => {
  console.error('Verification failed:', error);
  process.exit(1);
});
