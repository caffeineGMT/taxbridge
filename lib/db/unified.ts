/**
 * Unified Database Layer
 * Supports both SQLite (development) and PostgreSQL (production)
 * Database selection based on DATABASE_URL environment variable
 */

import { query as pgQuery, getPool, getClient } from './postgres';
import type { Pool, PoolClient, QueryResult } from 'pg';
import Database from 'better-sqlite3';
import type { Database as SQLiteDatabase } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database type detection
const IS_POSTGRES = !!process.env.DATABASE_URL;
const IS_SQLITE = !IS_POSTGRES;

console.log(`[DB] Using ${IS_POSTGRES ? 'PostgreSQL' : 'SQLite'} database`);

// SQLite singleton (for development)
let sqliteDb: SQLiteDatabase | null = null;

/**
 * Get SQLite database instance
 */
function getSQLiteDatabase(): SQLiteDatabase {
  if (!sqliteDb) {
    const DB_DIR = path.join(process.cwd(), 'data');
    const DB_PATH = path.join(DB_DIR, 'taxbridge.db');

    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    sqliteDb = new Database(DB_PATH);
    sqliteDb.pragma('foreign_keys = ON');
    sqliteDb.pragma('journal_mode = WAL');

    const cleanup = () => {
      if (sqliteDb) {
        sqliteDb.close();
        sqliteDb = null;
      }
    };

    process.on('exit', cleanup);
    process.on('SIGINT', () => {
      cleanup();
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      cleanup();
      process.exit(0);
    });
  }

  return sqliteDb;
}

/**
 * Unified query interface
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  if (IS_POSTGRES) {
    const result: QueryResult<T> = await pgQuery<T>(text, params);
    return result.rows;
  } else {
    const db = getSQLiteDatabase();

    // Convert PostgreSQL $1, $2 syntax to SQLite ? syntax
    let sqliteQuery = text;
    if (params && params.length > 0) {
      for (let i = params.length; i >= 1; i--) {
        sqliteQuery = sqliteQuery.replace(new RegExp(`\\$${i}\\b`, 'g'), '?');
      }
    }

    try {
      const stmt = db.prepare(sqliteQuery);

      // Determine if this is a SELECT/read query or a write query
      const trimmed = sqliteQuery.trim().toUpperCase();
      if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
        return stmt.all(params || []) as T[];
      } else {
        stmt.run(params || []);
        return [] as T[];
      }
    } catch (error) {
      console.error('[DB] Query error:', error);
      console.error('[DB] Query:', sqliteQuery);
      console.error('[DB] Params:', params);
      throw error;
    }
  }
}

/**
 * Execute a single row query
 */
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute an INSERT and return the last inserted ID
 */
export async function insert(
  text: string,
  params?: any[]
): Promise<number> {
  if (IS_POSTGRES) {
    // PostgreSQL requires RETURNING id
    const returningQuery = text.trim().endsWith(';')
      ? text.slice(0, -1) + ' RETURNING id;'
      : text + ' RETURNING id';

    const result = await query<{ id: number }>(returningQuery, params);
    return result[0].id;
  } else {
    const db = getSQLiteDatabase();

    // Convert PostgreSQL $1, $2 syntax to SQLite ? syntax
    let sqliteQuery = text;
    if (params && params.length > 0) {
      for (let i = params.length; i >= 1; i--) {
        sqliteQuery = sqliteQuery.replace(new RegExp(`\\$${i}\\b`, 'g'), '?');
      }
    }

    const stmt = db.prepare(sqliteQuery);
    const result = stmt.run(params || []);
    return result.lastInsertRowid as number;
  }
}

/**
 * Get database instance (for compatibility)
 * Returns SQLite Database in development, Pool in production
 *
 * WARNING: Direct database access is deprecated. Use query() functions instead.
 * This method exists for backward compatibility but will be removed in the future.
 */
export function getDatabase(): any {
  if (IS_POSTGRES) {
    // Return a Proxy that throws helpful errors for SQLite-specific methods
    const pool = getPool();
    return new Proxy(pool, {
      get(target: any, prop: string) {
        if (prop === 'prepare') {
          throw new Error(
            'SQLite .prepare() is not supported with PostgreSQL. ' +
            'Use query() or queryOne() from lib/db/unified.ts instead. ' +
            'Example: await query("SELECT * FROM users WHERE id = $1", [userId])'
          );
        }
        return target[prop];
      }
    });
  } else {
    return getSQLiteDatabase();
  }
}

/**
 * Initialize database schema
 */
export async function initializeDatabase(): Promise<void> {
  if (IS_POSTGRES) {
    const { initializeDatabase: initPG } = await import('./postgres');
    await initPG();
  } else {
    const db = getSQLiteDatabase();
    const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
    console.log('✓ SQLite database schema initialized successfully');
  }
}

/**
 * Run database migrations
 */
export async function runMigrations(): Promise<void> {
  if (IS_POSTGRES) {
    const { runMigrations: runPGMigrations } = await import('./postgres');
    await runPGMigrations();
  } else {
    const db = getSQLiteDatabase();

    // Create migrations table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✓ SQLite migrations completed');
  }
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (IS_POSTGRES) {
    const { closeDatabase: closePG } = await import('./postgres');
    await closePG();
  } else {
    if (sqliteDb) {
      sqliteDb.close();
      sqliteDb = null;
    }
  }
}

// Export database type check
export const isPostgres = IS_POSTGRES;
export const isSQLite = IS_SQLITE;

// Export alias for compatibility
export const getDb = getDatabase;
export default getDatabase;
