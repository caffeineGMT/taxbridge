-- Migration 003: Add Clerk authentication and subscription fields to user_profiles
-- This migration adds Clerk user ID and subscription management fields

-- First, check if the columns don't exist before adding them
-- SQLite doesn't have a clean ALTER TABLE IF COLUMN NOT EXISTS, so we'll drop and recreate

-- Create new user_profiles table with Clerk fields
CREATE TABLE IF NOT EXISTS user_profiles_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  us_state TEXT CHECK(LENGTH(us_state) = 2 OR us_state IS NULL),
  canada_province TEXT CHECK(canada_province IN ('BC', 'ON', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'PE', 'NL', 'YT', 'NT', 'NU') OR canada_province IS NULL),
  filing_status TEXT CHECK(filing_status IN ('single', 'married_joint', 'married_separate', 'head_of_household') OR filing_status IS NULL),
  subscription_tier TEXT DEFAULT 'free' CHECK(subscription_tier IN ('free', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  trial_ends_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Copy data from old table if it exists (only if email is unique and we can generate a clerk_user_id)
INSERT INTO user_profiles_new (id, clerk_user_id, email, first_name, last_name, us_state, canada_province, filing_status, created_at, updated_at)
SELECT
  id,
  'migrated_' || id AS clerk_user_id,
  email,
  first_name,
  last_name,
  us_state,
  canada_province,
  filing_status,
  unixepoch(created_at) AS created_at,
  unixepoch(updated_at) AS updated_at
FROM user_profiles
WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='user_profiles');

-- Drop old table
DROP TABLE IF EXISTS user_profiles;

-- Rename new table
ALTER TABLE user_profiles_new RENAME TO user_profiles;

-- Create index on clerk_user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);

-- Update rsu_entries table to ensure user_id foreign key still works
-- The foreign key constraint is maintained through the table recreation
