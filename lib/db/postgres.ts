/**
 * PostgreSQL Database Layer
 * Production-ready database abstraction using pg Pool
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// PostgreSQL connection pool
let pool: Pool | null = null;

/**
 * Get or create the PostgreSQL pool instance
 */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL environment variable is required for PostgreSQL. ' +
        'Format: postgresql://user:password@host:port/database'
      );
    }

    pool = new Pool({
      connectionString,
      max: 20, // maximum pool size
      idleTimeoutMillis: 30000, // close idle clients after 30s
      connectionTimeoutMillis: 2000, // return error after 2s if cannot connect
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected pool error:', err);
    });

    // Graceful shutdown handlers
    const cleanup = async () => {
      if (pool) {
        await pool.end();
        pool = null;
      }
    };

    process.on('exit', () => {
      cleanup().catch(console.error);
    });
    process.on('SIGINT', async () => {
      await cleanup();
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      await cleanup();
      process.exit(0);
    });
  }

  return pool;
}

/**
 * Execute a query with parameters
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  return pool.query<T>(text, params);
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return pool.connect();
}

/**
 * Initialize database schema from schema.sql file
 */
export async function initializeDatabase(): Promise<void> {
  const schemaPath = path.join(__dirname, 'postgres-schema.sql');

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }

  const schema = fs.readFileSync(schemaPath, 'utf-8');
  await query(schema);

  console.log('✓ Database schema initialized successfully');
}

/**
 * Run database migrations
 */
export async function runMigrations(): Promise<void> {
  // Create migrations table if it doesn't exist
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get applied migrations
  const result = await query<{ version: number }>(
    'SELECT version FROM schema_migrations ORDER BY version'
  );
  const appliedVersions = new Set(result.rows.map(r => r.version));

  // Read migration files
  const migrationsDir = path.join(__dirname, 'postgres-migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.log('✓ No migrations to run');
    return;
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.endsWith('.skip'))
    .sort();

  for (const file of files) {
    // Extract version from filename (e.g., "001_migration_name.sql" -> 1)
    const versionMatch = file.match(/^(\d+)_/);
    if (!versionMatch) {
      console.warn(`Skipping invalid migration file: ${file}`);
      continue;
    }

    const version = parseInt(versionMatch[1], 10);

    if (appliedVersions.has(version)) {
      continue; // Already applied
    }

    console.log(`Running migration ${version}: ${file}`);

    const migrationPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    // Execute migration in a transaction
    const client = await getClient();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
      await client.query('COMMIT');
      console.log(`✓ Migration ${version} completed`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Migration ${version} failed: ${error}`);
    } finally {
      client.release();
    }
  }

  console.log('✓ All migrations completed');
}

/**
 * Close the database pool
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Export alias for compatibility
export const getDb = getPool;
export default getPool;
