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
  CREATE TABLE IF NOT EXISTS rsu_events (
    id TEXT PRIMARY KEY,
    employer TEXT NOT NULL,
    ticker_symbol TEXT NOT NULL,
    vesting_date TEXT NOT NULL,
    shares REAL NOT NULL,
    fmv_usd REAL NOT NULL,
    total_value_usd REAL NOT NULL,
    us_state TEXT NOT NULL,
    canada_province TEXT NOT NULL,
    created_at TEXT NOT NULL
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
