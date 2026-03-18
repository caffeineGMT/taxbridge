-- Migration 007: Add Enterprise Organization Management with RBAC
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
-- Check if column already exists
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we need to check
ALTER TABLE user_profiles ADD COLUMN org_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_org ON user_profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_email ON invite_tokens(email);
