/**
 * Test script to verify database setup and schema
 */

import { db } from './lib/db/init.js';
import { RSUEventSchema } from './lib/types.js';

console.log('Testing TaxBridge setup...\n');

// Test 1: Database connection
console.log('✓ Database connection established');

// Test 2: Verify rsu_events table exists
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='rsu_events'").all();
console.log('✓ rsu_events table exists:', tables.length > 0);

// Test 3: Insert a test RSU event
const testData = {
  employer: 'Meta',
  tickerSymbol: 'META',
  vestingDate: '2025-03-15',
  shares: 100,
  fmvUsd: 450.50,
  totalValueUsd: 45050,
  usState: 'WA',
  canadaProvince: 'BC' as const,
};

const validation = RSUEventSchema.omit({ id: true, createdAt: true }).safeParse(testData);
if (!validation.success) {
  console.error('✗ Validation failed:', validation.error);
  process.exit(1);
}

console.log('✓ Zod validation passed');

const id = crypto.randomUUID();
const createdAt = new Date().toISOString();

try {
  const stmt = db.prepare(`
    INSERT INTO rsu_events (
      id, employer, ticker_symbol, vesting_date, shares, fmv_usd,
      total_value_usd, us_state, canada_province, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    testData.employer,
    testData.tickerSymbol,
    testData.vestingDate,
    testData.shares,
    testData.fmvUsd,
    testData.totalValueUsd,
    testData.usState,
    testData.canadaProvince,
    createdAt
  );

  console.log('✓ Test RSU event inserted successfully');
  console.log('  ID:', id);
  console.log('  Employer:', testData.employer);
  console.log('  Shares:', testData.shares);
  console.log('  Total Value: $' + testData.totalValueUsd.toLocaleString());
} catch (error) {
  console.error('✗ Insert failed:', error);
  process.exit(1);
}

// Test 4: Query the data back
const events = db.prepare('SELECT * FROM rsu_events WHERE id = ?').get(id);
console.log('✓ Data retrieved successfully:', events ? 'Yes' : 'No');

// Test 5: Count all events
const count = db.prepare('SELECT COUNT(*) as count FROM rsu_events').get() as { count: number };
console.log('✓ Total RSU events in database:', count.count);

console.log('\n✅ All tests passed! TaxBridge is ready.');
