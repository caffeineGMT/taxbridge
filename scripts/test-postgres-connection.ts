#!/usr/bin/env tsx

/**
 * PostgreSQL Connection Test Script
 *
 * Tests the DATABASE_URL connection and verifies PostgreSQL is accessible.
 *
 * Usage:
 *   export $(cat .env.production | xargs)
 *   tsx scripts/test-postgres-connection.ts
 */

import { Pool } from 'pg';

async function testConnection(): Promise<void> {
  console.log('🔍 Testing PostgreSQL Connection...\n');

  // Check if DATABASE_URL is set
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    console.error('\n📝 Fix:');
    console.error('   1. Create .env.production with DATABASE_URL');
    console.error('   2. Run: export $(cat .env.production | xargs)');
    console.error('   3. Run this script again\n');
    process.exit(1);
  }

  // Mask password in URL for logging
  const maskedUrl = databaseUrl.replace(/:([^@]+)@/, ':****@');
  console.log(`📡 Connection string: ${maskedUrl}\n`);

  let pool: Pool | null = null;

  try {
    // Create connection pool
    pool = new Pool({
      connectionString: databaseUrl,
      max: 1, // Only need one connection for testing
      connectionTimeoutMillis: 5000, // 5 second timeout
      ssl: {
        rejectUnauthorized: false // Required for Supabase and most hosted PostgreSQL
      }
    });

    console.log('⏳ Attempting to connect...');

    // Test connection with a simple query
    const result = await pool.query('SELECT version()');
    const version = result.rows[0].version;

    console.log('✅ Connection successful!\n');
    console.log('📊 Database Information:');
    console.log(`   Version: ${version.split(',')[0]}`);

    // Test schema_migrations table existence
    console.log('\n🔍 Checking database schema...');
    try {
      const tableCheck = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);

      const tables = tableCheck.rows.map(row => row.table_name);

      if (tables.length === 0) {
        console.log('⚠️  No tables found - database needs initialization');
        console.log('\n📝 Next step:');
        console.log('   Run: tsx scripts/init-postgres-db.ts\n');
      } else {
        console.log(`✅ Found ${tables.length} tables:`);
        tables.forEach(table => {
          console.log(`   - ${table}`);
        });

        // Check for required tables
        const requiredTables = [
          'user_profiles',
          'rsu_entries',
          'tax_calculations',
          'filing_requirements',
          'exchange_rates'
        ];

        const missingTables = requiredTables.filter(t => !tables.includes(t));

        if (missingTables.length > 0) {
          console.log(`\n⚠️  Missing required tables: ${missingTables.join(', ')}`);
          console.log('   Run: tsx scripts/init-postgres-db.ts\n');
        } else {
          console.log('\n✅ All required tables present!');
        }
      }
    } catch (error: any) {
      console.log('⚠️  Could not check schema:', error.message);
    }

    // Test write capability
    console.log('\n🔍 Testing write permissions...');
    try {
      await pool.query('CREATE TEMP TABLE test_write (id SERIAL, data TEXT)');
      await pool.query('INSERT INTO test_write (data) VALUES ($1)', ['test']);
      await pool.query('DROP TABLE test_write');
      console.log('✅ Write permissions verified');
    } catch (error: any) {
      console.error('❌ Write test failed:', error.message);
      console.log('   Your database connection may be read-only');
    }

    // Connection pool stats
    console.log('\n📊 Connection Pool Stats:');
    console.log(`   Total connections: ${pool.totalCount}`);
    console.log(`   Idle connections: ${pool.idleCount}`);
    console.log(`   Waiting requests: ${pool.waitingCount}`);

    console.log('\n✅ All connection tests passed!');
    console.log('\n🎉 Your PostgreSQL database is ready to use.\n');

  } catch (error: any) {
    console.error('❌ Connection failed!\n');
    console.error('Error details:', error.message);

    // Provide helpful troubleshooting
    console.error('\n🔧 Troubleshooting:');

    if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.error('   • Check your internet connection');
      console.error('   • Verify the database host is correct');
      console.error('   • Check if firewall is blocking port 5432');
    } else if (error.message.includes('password authentication failed')) {
      console.error('   • Verify your database password is correct');
      console.error('   • Check for special characters that need escaping');
      console.error('   • Ensure password in DATABASE_URL matches Supabase project');
    } else if (error.message.includes('SSL')) {
      console.error('   • Try adding ?sslmode=require to your DATABASE_URL');
      console.error('   • Check if your PostgreSQL provider requires SSL');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('   • Verify the database name in your connection string');
      console.error('   • Most Supabase connections use "postgres" as database name');
    } else {
      console.error('   • Double-check your DATABASE_URL format');
      console.error('   • Expected: postgresql://user:password@host:port/database');
    }

    console.error('\n📖 See docs/POSTGRES_MIGRATION_CHECKLIST.md for detailed setup guide\n');
    process.exit(1);

  } finally {
    // Clean up connection
    if (pool) {
      await pool.end();
      console.log('🔌 Connection closed');
    }
  }
}

// Run the test
testConnection().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
