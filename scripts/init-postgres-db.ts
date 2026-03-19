#!/usr/bin/env tsx

/**
 * PostgreSQL Database Initialization Script
 *
 * Initializes the PostgreSQL database schema and runs migrations.
 *
 * Prerequisites:
 *   - DATABASE_URL environment variable must be set
 *   - PostgreSQL instance must be accessible
 *
 * Usage:
 *   export $(cat .env.production | xargs)
 *   tsx scripts/init-postgres-db.ts
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

async function initializePostgresDB(): Promise<void> {
  console.log('🚀 Initializing PostgreSQL Database...\n');

  // Check environment
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable is required');
    console.error('\n📝 Setup steps:');
    console.error('   1. Get connection string from Supabase/Railway/Neon');
    console.error('   2. Add to .env.production:');
    console.error('      DATABASE_URL=postgresql://user:password@host:port/database');
    console.error('   3. Load environment: export $(cat .env.production | xargs)');
    console.error('   4. Run this script again\n');
    process.exit(1);
  }

  const maskedUrl = databaseUrl.replace(/:([^@]+)@/, ':****@');
  console.log(`📡 Connecting to: ${maskedUrl}\n`);

  let pool: Pool | null = null;

  try {
    // Create connection pool
    pool = new Pool({
      connectionString: databaseUrl,
      max: 5,
      connectionTimeoutMillis: 10000,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Test connection
    console.log('⏳ Testing connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully\n');

    // Read schema file
    const schemaPath = path.join(process.cwd(), 'lib/db/postgres-schema.sql');

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    console.log('📄 Reading schema file...');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    console.log(`   Loaded ${schema.split('\n').length} lines from postgres-schema.sql\n`);

    // Execute schema
    console.log('⏳ Creating database schema...');
    await pool.query(schema);
    console.log('✅ Schema created successfully\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`✅ Created ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   ✓ ${table}`);
    });

    // Create schema_migrations table for tracking
    console.log('\n📝 Setting up migration tracking...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Migration tracking initialized\n');

    // Check for and run any pending migrations
    const migrationsDir = path.join(process.cwd(), 'lib/db/postgres-migrations');

    if (fs.existsSync(migrationsDir)) {
      console.log('🔍 Checking for migrations...');

      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      if (migrationFiles.length > 0) {
        console.log(`   Found ${migrationFiles.length} migration file(s)\n`);

        // Get applied migrations
        const appliedResult = await pool.query<{ version: number }>(
          'SELECT version FROM schema_migrations ORDER BY version'
        );
        const appliedVersions = new Set(appliedResult.rows.map(r => r.version));

        // Run pending migrations
        for (const file of migrationFiles) {
          const versionMatch = file.match(/^(\d+)_/);
          if (!versionMatch) {
            console.log(`⚠️  Skipping invalid migration file: ${file}`);
            continue;
          }

          const version = parseInt(versionMatch[1], 10);

          if (appliedVersions.has(version)) {
            console.log(`⏭️  Migration ${version} already applied: ${file}`);
            continue;
          }

          console.log(`⏳ Running migration ${version}: ${file}...`);

          const migrationPath = path.join(migrationsDir, file);
          const sql = fs.readFileSync(migrationPath, 'utf-8');

          const client = await pool.connect();
          try {
            await client.query('BEGIN');
            await client.query(sql);
            await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
            await client.query('COMMIT');
            console.log(`✅ Migration ${version} completed successfully`);
          } catch (error: any) {
            await client.query('ROLLBACK');
            throw new Error(`Migration ${version} failed: ${error.message}`);
          } finally {
            client.release();
          }
        }

        console.log('\n✅ All migrations completed\n');
      } else {
        console.log('   No migration files found\n');
      }
    }

    // Run a test query
    console.log('🧪 Running test query...');
    const testResult = await pool.query('SELECT COUNT(*) as count FROM user_profiles');
    console.log(`✅ Test query successful: ${testResult.rows[0].count} users in database\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PostgreSQL Database Initialization Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📊 Database Statistics:');
    console.log(`   Tables created: ${tables.length}`);
    console.log(`   Migrations applied: ${migrationFiles?.length || 0}`);
    console.log(`   Database ready: ✅`);

    console.log('\n🎯 Next Steps:');
    console.log('   1. Set DATABASE_URL in Vercel environment variables');
    console.log('   2. Test locally: npm run dev');
    console.log('   3. Build application: npm run build');
    console.log('   4. Deploy to production: git push origin main');

    console.log('\n📖 See docs/POSTGRES_MIGRATION_CHECKLIST.md for deployment guide\n');

  } catch (error: any) {
    console.error('\n❌ Initialization failed!\n');
    console.error('Error:', error.message);

    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }

    console.error('\n🔧 Troubleshooting:');
    console.error('   • Verify DATABASE_URL is correct');
    console.error('   • Check database permissions (CREATE TABLE required)');
    console.error('   • Ensure PostgreSQL version is 12 or higher');
    console.error('   • Review schema file for syntax errors');
    console.error('\n📖 See docs/POSTGRES_MIGRATION_CHECKLIST.md for help\n');

    process.exit(1);

  } finally {
    if (pool) {
      await pool.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run initialization
initializePostgresDB().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
