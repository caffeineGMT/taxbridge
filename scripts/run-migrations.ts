#!/usr/bin/env tsx

import { getDatabase } from '../lib/db/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '../lib/db/migrations');

interface Migration {
  version: number;
  filename: string;
  sql: string;
}

/**
 * Get all migration files sorted by version
 */
function getMigrationFiles(): Migration[] {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log('ℹ️  No migrations directory found');
    return [];
  }

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  return files.map(filename => {
    const match = filename.match(/^(\d+)_/);
    const version = match ? parseInt(match[1]) : 0;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf-8');

    return { version, filename, sql };
  });
}

/**
 * Get applied migrations from database
 */
function getAppliedMigrations(db: any): number[] {
  // Check if migrations table exists and get its schema
  const tableInfo = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'
  `).get();

  if (!tableInfo) {
    // Create new table with filename column
    db.exec(`
      CREATE TABLE schema_migrations (
        version INTEGER PRIMARY KEY,
        filename TEXT NOT NULL,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } else {
    // Check if filename column exists
    const columns = db.prepare('PRAGMA table_info(schema_migrations)').all();
    const hasFilename = columns.some((col: any) => col.name === 'filename');

    if (!hasFilename) {
      // Migrate old schema to new schema
      db.exec(`
        ALTER TABLE schema_migrations ADD COLUMN filename TEXT DEFAULT 'legacy';
      `);
    }
  }

  const rows = db.prepare('SELECT version FROM schema_migrations ORDER BY version').all();
  return rows.map((r: any) => r.version);
}

/**
 * Apply a migration
 */
function applyMigration(db: any, migration: Migration): void {
  console.log(`\n📝 Applying migration ${migration.version}: ${migration.filename}`);

  try {
    // Execute migration SQL
    db.exec(migration.sql);

    // Record migration
    db.prepare(`
      INSERT INTO schema_migrations (version, filename)
      VALUES (?, ?)
    `).run(migration.version, migration.filename);

    console.log(`✅ Migration ${migration.version} applied successfully`);
  } catch (error) {
    console.error(`❌ Failed to apply migration ${migration.version}:`, error);
    throw error;
  }
}

/**
 * Main migration runner
 */
function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  const db = getDatabase();
  const migrations = getMigrationFiles();
  const appliedVersions = getAppliedMigrations(db);

  console.log(`📊 Found ${migrations.length} migration file(s)`);
  console.log(`📊 Applied ${appliedVersions.length} migration(s) previously\n`);

  const pendingMigrations = migrations.filter(m => !appliedVersions.includes(m.version));

  if (pendingMigrations.length === 0) {
    console.log('✨ No pending migrations. Database is up to date!');
    return;
  }

  console.log(`📦 ${pendingMigrations.length} pending migration(s):\n`);
  pendingMigrations.forEach(m => {
    console.log(`   - ${m.filename}`);
  });

  // Apply migrations in a transaction
  const applyAll = db.transaction(() => {
    for (const migration of pendingMigrations) {
      applyMigration(db, migration);
    }
  });

  try {
    applyAll();
    console.log('\n✨ All migrations applied successfully!\n');
  } catch (error) {
    console.error('\n❌ Migration failed. Changes have been rolled back.\n');
    throw error;
  }
}

// Run migrations
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    runMigrations();
  } catch (error) {
    console.error('Migration runner error:', error);
    process.exit(1);
  }
}
