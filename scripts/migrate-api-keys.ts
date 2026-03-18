/**
 * Run API Keys Migration (009_api_keys.sql)
 * Add API key support to organizations table
 */

import { db } from '@/lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🚀 Running API Keys migration...\n');

try {
  const migrationPath = join(process.cwd(), 'lib', 'db', 'migrations', '009_api_keys.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  // Split by semicolons and execute each statement
  const statements = migrationSQL
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      db.exec(statement);
      console.log('✅ Executed:', statement.substring(0, 80) + '...');
    } catch (error: any) {
      // Ignore "already exists" errors
      if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
        console.log('⚠️  Skipped (already exists):', statement.substring(0, 80) + '...');
      } else {
        throw error;
      }
    }
  }

  console.log('\n✅ API Keys migration completed successfully!');
  console.log('\nDatabase changes:');
  console.log('  - Added api_key column to organizations table');
  console.log('  - Created api_usage tracking table');
  console.log('  - Added indexes for API key lookups\n');
} catch (error: any) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
