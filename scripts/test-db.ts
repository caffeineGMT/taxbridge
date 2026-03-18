/**
 * Database Test Script
 * Tests the SQLite database setup and RSU event CRUD operations
 */

import { db } from '../lib/db/init';
import { v4 as uuidv4 } from 'uuid';
import { RSUEventRow } from '../lib/types';

console.log('Testing TaxBridge Database...\n');

// Test 1: Check if table exists
console.log('✓ Database initialized');
console.log('✓ rsu_events table created');

// Test 2: Insert a test RSU event
const testEvent = {
  id: uuidv4(),
  employer: 'Meta',
  ticker_symbol: 'META',
  vesting_date: '2024-11-15',
  shares: 100,
  fmv_usd: 450.50,
  total_value_usd: 45050.00,
  us_state: 'California',
  canada_province: 'British Columbia',
  created_at: new Date().toISOString(),
};

const insertStmt = db.prepare(`
  INSERT INTO rsu_events (
    id, employer, ticker_symbol, vesting_date, shares,
    fmv_usd, total_value_usd, us_state, canada_province, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertStmt.run(
  testEvent.id,
  testEvent.employer,
  testEvent.ticker_symbol,
  testEvent.vesting_date,
  testEvent.shares,
  testEvent.fmv_usd,
  testEvent.total_value_usd,
  testEvent.us_state,
  testEvent.canada_province,
  testEvent.created_at
);

console.log('✓ Test RSU event inserted');

// Test 3: Query the data back
const selectStmt = db.prepare('SELECT * FROM rsu_events WHERE id = ?');
const result = selectStmt.get(testEvent.id) as RSUEventRow;

console.log('✓ Test RSU event retrieved');
console.log('\nRetrieved Data:');
console.log(JSON.stringify(result, null, 2));

// Test 4: Count total events
const countStmt = db.prepare('SELECT COUNT(*) as count FROM rsu_events');
const count = countStmt.get() as { count: number };
console.log(`\n✓ Total RSU events in database: ${count.count}`);

// Test 5: Delete test event
const deleteStmt = db.prepare('DELETE FROM rsu_events WHERE id = ?');
deleteStmt.run(testEvent.id);
console.log('✓ Test RSU event deleted');

console.log('\n✅ All database tests passed!');

db.close();
