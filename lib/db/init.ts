import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'taxbridge.db');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
export const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    us_state TEXT,
    canada_province TEXT,
    filing_status TEXT,
    clerk_user_id TEXT UNIQUE,
    subscription_tier TEXT DEFAULT 'free' CHECK(subscription_tier IN ('free', 'pro', 'enterprise')),
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    subscription_status TEXT CHECK(subscription_status IN ('active', 'canceled', 'past_due', 'trialing', NULL)),
    subscription_current_period_end TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS rsu_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    employer TEXT NOT NULL,
    ticker TEXT NOT NULL,
    vesting_date TEXT NOT NULL,
    shares REAL NOT NULL,
    fmv_usd REAL NOT NULL,
    total_value_usd REAL NOT NULL,
    us_state TEXT,
    canada_province TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS exchange_rates (
    date TEXT PRIMARY KEY,
    rate REAL NOT NULL,
    fetched_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS form_completion (
    user_id INTEGER NOT NULL,
    form_code TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT 0,
    completed_at INTEGER,
    PRIMARY KEY (user_id, form_code)
  )
`);

// Graceful shutdown
process.on('exit', () => db.close());
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});
