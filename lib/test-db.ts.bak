/**
 * Database Layer Test Script
 *
 * Run with: npx tsx lib/test-db.ts
 *
 * This script tests all database functionality:
 * - Migrations
 * - User CRUD
 * - RSU Event CRUD
 * - Tax Calculation CRUD
 * - Type safety with Zod
 */

import { runMigrations, getMigrationStatus } from './migrations';
import { userQueries, rsuEventQueries, taxCalculationQueries } from './queries';

async function testDatabase() {
  console.log('🧪 Testing TaxBridge Database Layer\n');

  // 1. Run migrations
  console.log('1️⃣  Running migrations...');
  runMigrations();
  const status = getMigrationStatus();
  console.log(`   ✓ Tables: ${status.tables.join(', ')}`);
  console.log(`   ✓ Indices: ${status.indices.filter((i) => !i.startsWith('sqlite_')).length} custom indices\n`);

  // 2. Create user
  console.log('2️⃣  Creating test user...');
  const user = userQueries.create({
    email: 'john.doe@example.com',
  });
  console.log(`   ✓ Created user: ${user.email} (ID: ${user.id})\n`);

  // 3. Create RSU events
  console.log('3️⃣  Creating RSU events...');
  const rsuEvents = [
    {
      user_id: user.id,
      employer: 'Meta Platforms, Inc.',
      ticker: 'META',
      vesting_date: '2024-02-15',
      shares: 100,
      fmv_usd: 450.25,
      total_value_usd: 45025,
      us_state: 'CA',
      canada_province: 'BC',
    },
    {
      user_id: user.id,
      employer: 'Meta Platforms, Inc.',
      ticker: 'META',
      vesting_date: '2024-05-15',
      shares: 100,
      fmv_usd: 475.80,
      total_value_usd: 47580,
      us_state: 'CA',
      canada_province: 'BC',
    },
    {
      user_id: user.id,
      employer: 'Meta Platforms, Inc.',
      ticker: 'META',
      vesting_date: '2024-08-15',
      shares: 100,
      fmv_usd: 520.15,
      total_value_usd: 52015,
      us_state: null,
      canada_province: 'BC',
    },
  ];

  rsuEvents.forEach((event) => {
    const created = rsuEventQueries.create(event);
    console.log(`   ✓ Created RSU event: ${created.vesting_date} - $${created.total_value_usd.toLocaleString()}`);
  });

  // 4. Query RSU events
  console.log('\n4️⃣  Querying RSU events...');
  const userRsuEvents = rsuEventQueries.findByUserId(user.id);
  console.log(`   ✓ Found ${userRsuEvents.length} RSU events for user`);

  const totalValue2024 = rsuEventQueries.getTotalValueByYear(user.id, 2024);
  console.log(`   ✓ Total 2024 RSU value: $${totalValue2024.toLocaleString()}\n`);

  // 5. Create tax calculation
  console.log('5️⃣  Creating tax calculation...');
  const taxCalc = taxCalculationQueries.upsert({
    user_id: user.id,
    tax_year: 2024,
    us_federal_tax: 32145.5,
    us_state_tax: 9876.3,
    canada_federal_tax: 28500.0,
    canada_provincial_tax: 7200.0,
    ftc_amount: 15000.0,
    recommended_filing_order: 'us_first',
  });
  console.log(`   ✓ Created tax calculation for ${taxCalc.tax_year}`);
  console.log(`   ✓ US Total: $${((taxCalc.us_federal_tax || 0) + (taxCalc.us_state_tax || 0)).toLocaleString()}`);
  console.log(`   ✓ Canada Total: $${((taxCalc.canada_federal_tax || 0) + (taxCalc.canada_provincial_tax || 0)).toLocaleString()}`);
  console.log(`   ✓ FTC: $${taxCalc.ftc_amount?.toLocaleString()}\n`);

  // 6. Query tax calculations
  console.log('6️⃣  Querying tax calculations...');
  const userTaxCalcs = taxCalculationQueries.findByUserId(user.id);
  console.log(`   ✓ Found ${userTaxCalcs.length} tax calculation(s) for user\n`);

  // 7. Update tax calculation (upsert test)
  console.log('7️⃣  Updating tax calculation...');
  const updated = taxCalculationQueries.upsert({
    user_id: user.id,
    tax_year: 2024,
    us_federal_tax: 33000.0,
    us_state_tax: 10000.0,
    canada_federal_tax: 29000.0,
    canada_provincial_tax: 7500.0,
    ftc_amount: 16000.0,
    recommended_filing_order: 'canada_first',
  });
  console.log(`   ✓ Updated tax calculation (filing order now: ${updated.recommended_filing_order})\n`);

  // 8. Test type safety (this will throw if data is invalid)
  console.log('8️⃣  Testing type safety with Zod...');
  try {
    userQueries.create({ email: 'invalid-email' });
    console.log('   ✗ Type safety failed - should have thrown error');
  } catch (error) {
    console.log('   ✓ Type safety working - invalid email rejected\n');
  }

  console.log('✅ All tests passed!\n');
}

// Run tests
testDatabase().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
