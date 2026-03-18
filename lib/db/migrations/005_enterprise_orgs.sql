-- Migration 005: Add Enterprise Organization Management with RBAC
-- Organizations and multi-client management for CPA firms and corporate tax departments

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create organization_members junction table with role-based access
CREATE TABLE IF NOT EXISTS organization_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('admin', 'member', 'client')),
  invited_at TEXT DEFAULT CURRENT_TIMESTAMP,
  joined_at TEXT,
  UNIQUE(org_id, user_id)
);

-- Create invite tokens table for client invitations
CREATE TABLE IF NOT EXISTS invite_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE NOT NULL,
  org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'member', 'client')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL,
  used BOOLEAN DEFAULT 0
);

-- Add org_id to user_profiles (nullable - only set for organization members)
-- Check if column exists first
CREATE TABLE IF NOT EXISTS user_profiles_temp AS SELECT * FROM user_profiles;

DROP TABLE user_profiles;

CREATE TABLE user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  us_state TEXT CHECK(LENGTH(us_state) = 2 OR us_state IS NULL),
  canada_province TEXT CHECK(canada_province IN ('BC', 'ON', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'PE', 'NL', 'YT', 'NT', 'NU') OR canada_province IS NULL),
  filing_status TEXT CHECK(filing_status IN ('single', 'married_joint', 'married_separate', 'head_of_household') OR filing_status IS NULL),
  subscription_tier TEXT DEFAULT 'free' CHECK(subscription_tier IN ('free', 'pro', 'enterprise')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status TEXT CHECK(subscription_status IN ('active', 'canceled', 'past_due', 'trialing', NULL)),
  subscription_current_period_end TEXT,
  trial_ends_at INTEGER,
  org_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Copy data from temp table
INSERT INTO user_profiles SELECT
  id, clerk_user_id, email, first_name, last_name, us_state, canada_province,
  filing_status, subscription_tier, stripe_customer_id, stripe_subscription_id,
  subscription_status, subscription_current_period_end, trial_ends_at,
  NULL as org_id, created_at, updated_at
FROM user_profiles_temp;

DROP TABLE user_profiles_temp;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_org ON user_profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_email ON invite_tokens(email);

-- Re-create clerk_user_id index
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);
