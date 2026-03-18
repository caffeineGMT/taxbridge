-- Migration 006: Multi-Year Tax Dashboard and FTC Carryforward
-- Adds year tracking to RSU entries and creates FTC carryforward table

-- Add year column to rsu_entries (defaulting to 2026 for existing entries)
ALTER TABLE rsu_entries ADD COLUMN year INTEGER NOT NULL DEFAULT 2026;

-- Create index for efficient year-based queries
CREATE INDEX IF NOT EXISTS idx_rsu_entries_year ON rsu_entries(year);

-- Create FTC carryforward tracking table
-- Tracks unused Foreign Tax Credits that can be carried forward 10 years (IRS rules)
CREATE TABLE IF NOT EXISTS ftc_carryforward (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  unused_ftc_cad REAL NOT NULL CHECK(unused_ftc_cad >= 0),
  source_year INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  applied_to_year INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Create indexes for FTC carryforward queries
CREATE INDEX IF NOT EXISTS idx_ftc_year ON ftc_carryforward(year);
CREATE INDEX IF NOT EXISTS idx_ftc_user_year ON ftc_carryforward(user_id, year);
CREATE INDEX IF NOT EXISTS idx_ftc_source_year ON ftc_carryforward(source_year);
CREATE INDEX IF NOT EXISTS idx_ftc_applied ON ftc_carryforward(applied_to_year);
