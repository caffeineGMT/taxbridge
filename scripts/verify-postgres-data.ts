#!/usr/bin/env tsx

/**
 * PostgreSQL Data Verification Script
 *
 * Verifies that data exists and is accessible in the PostgreSQL database.
 * Use this after migration to confirm everything worked correctly.
 *
 * Usage:
 *   export $(cat .env.production | xargs)
 *   tsx scripts/verify-postgres-data.ts
 */

import { Pool } from 'pg';

interface TableStats {
  table_name: string;
  row_count: number;
  size: string;
}

async function verifyPostgresData(): Promise<void> {
  console.log('🔍 Verifying PostgreSQL Data...\n');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set');
    console.error('   Run: export $(cat .env.production | xargs)\n');
    process.exit(1);
  }

  let pool: Pool | null = null;

  try {
    pool = new Pool({
      connectionString: databaseUrl,
      max: 2,
      ssl: { rejectUnauthorized: false }
    });

    console.log('📊 Database Overview:\n');

    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(row => row.table_name);

    if (tables.length === 0) {
      console.log('⚠️  No tables found - database may not be initialized');
      console.log('   Run: tsx scripts/init-postgres-db.ts\n');
      return;
    }

    // Get row counts for each table
    console.log('Table Statistics:');
    console.log('━'.repeat(60));

    const stats: TableStats[] = [];

    for (const table of tables) {
      const countResult = await pool.query(
        `SELECT COUNT(*) as count FROM ${table}`
      );
      const count = parseInt(countResult.rows[0].count);

      const sizeResult = await pool.query(`
        SELECT pg_size_pretty(pg_total_relation_size($1)) as size
      `, [table]);
      const size = sizeResult.rows[0].size;

      stats.push({
        table_name: table,
        row_count: count,
        size: size
      });

      const emoji = count > 0 ? '✅' : '⚪';
      console.log(`${emoji} ${table.padEnd(30)} ${String(count).padStart(6)} rows  (${size})`);
    }

    console.log('━'.repeat(60));

    const totalRows = stats.reduce((sum, s) => sum + s.row_count, 0);
    console.log(`   Total: ${totalRows} rows across ${tables.length} tables\n`);

    // Check for critical data
    console.log('🔍 Critical Data Checks:\n');

    // Check user_profiles
    const usersResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT subscription_tier) as tiers,
        COUNT(CASE WHEN stripe_customer_id IS NOT NULL THEN 1 END) as stripe_customers
      FROM user_profiles
    `);
    const users = usersResult.rows[0];
    console.log(`👤 Users: ${users.total} total, ${users.stripe_customers} with Stripe`);

    // Check RSU entries
    const rsuResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT user_id) as unique_users,
        SUM(total_value_usd) as total_value
      FROM rsu_entries
    `);
    const rsu = rsuResult.rows[0];
    const totalValue = parseFloat(rsu.total_value || 0);
    console.log(`💰 RSU Entries: ${rsu.total} entries from ${rsu.unique_users} users ($${totalValue.toFixed(2)} total)`);

    // Check tax calculations
    const taxResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT tax_year) as years,
        AVG(effective_tax_rate) as avg_rate
      FROM tax_calculations
    `);
    const tax = taxResult.rows[0];
    const avgRate = parseFloat(tax.avg_rate || 0) * 100;
    console.log(`📊 Tax Calculations: ${tax.total} calculations across ${tax.years} tax years (${avgRate.toFixed(2)}% avg rate)`);

    // Check exchange rates
    const ratesResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        MIN(rate_date) as earliest,
        MAX(rate_date) as latest
      FROM exchange_rates
    `);
    const rates = ratesResult.rows[0];
    console.log(`💱 Exchange Rates: ${rates.total} cached rates (${rates.earliest || 'N/A'} to ${rates.latest || 'N/A'})`);

    console.log('\n🔍 Index Health:\n');

    // Check indexes
    const indexResult = await pool.query(`
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);

    const indexesByTable: Record<string, number> = {};
    indexResult.rows.forEach(row => {
      indexesByTable[row.tablename] = (indexesByTable[row.tablename] || 0) + 1;
    });

    Object.entries(indexesByTable).forEach(([table, count]) => {
      console.log(`   ${table.padEnd(30)} ${count} index(es)`);
    });

    console.log(`\n   Total: ${indexResult.rows.length} indexes\n`);

    // Database size
    const dbSizeResult = await pool.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `);
    const dbSize = dbSizeResult.rows[0].size;

    console.log('📦 Database Size:', dbSize);

    // Active connections
    const connResult = await pool.query(`
      SELECT COUNT(*) as active_connections
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);
    const activeConns = connResult.rows[0].active_connections;
    console.log('🔌 Active Connections:', activeConns);

    // Check for recent activity
    console.log('\n🕐 Recent Activity:\n');

    if (stats.find(s => s.table_name === 'user_profiles' && s.row_count > 0)) {
      const recentUsers = await pool.query(`
        SELECT
          first_name,
          last_name,
          email,
          subscription_tier,
          TO_CHAR(TO_TIMESTAMP(created_at), 'YYYY-MM-DD HH24:MI:SS') as created
        FROM user_profiles
        ORDER BY created_at DESC
        LIMIT 5
      `);

      if (recentUsers.rows.length > 0) {
        console.log('Recent Users:');
        recentUsers.rows.forEach((user, i) => {
          const name = user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.email || 'Unknown';
          console.log(`   ${i + 1}. ${name} (${user.subscription_tier}) - ${user.created}`);
        });
      }
    }

    if (stats.find(s => s.table_name === 'rsu_entries' && s.row_count > 0)) {
      const recentRSU = await pool.query(`
        SELECT
          employer,
          shares,
          fmv_usd,
          vest_date,
          created_at
        FROM rsu_entries
        ORDER BY created_at DESC
        LIMIT 5
      `);

      if (recentRSU.rows.length > 0) {
        console.log('\nRecent RSU Entries:');
        recentRSU.rows.forEach((rsu, i) => {
          console.log(`   ${i + 1}. ${rsu.employer}: ${rsu.shares} shares @ $${rsu.fmv_usd} (${rsu.vest_date})`);
        });
      }
    }

    console.log('\n━'.repeat(60));
    console.log('✅ Data Verification Complete!');
    console.log('━'.repeat(60));

    // Warnings
    if (totalRows === 0) {
      console.log('\n⚠️  WARNING: No data found in any tables');
      console.log('   This is expected for a new database');
      console.log('   Data will appear as users interact with the application\n');
    } else {
      console.log('\n✅ Database contains data and appears healthy\n');
    }

    // Data persistence test
    console.log('💡 To test data persistence:');
    console.log('   1. Create a test entry in the app');
    console.log('   2. Redeploy the application');
    console.log('   3. Run this script again to verify data still exists\n');

  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

verifyPostgresData().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
