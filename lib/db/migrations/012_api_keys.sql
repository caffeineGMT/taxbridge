-- Migration 012: Add API Keys for Enterprise Organizations
-- Enable programmatic access to TaxBridge calculation API

-- Add api_key column to organizations table (SQLite doesn't support UNIQUE in ALTER TABLE)
ALTER TABLE organizations ADD COLUMN api_key TEXT;

-- Add API usage tracking table
CREATE TABLE IF NOT EXISTS api_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  last_used_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create index for API key lookups (enforces uniqueness)
CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_api_key ON organizations(api_key);
CREATE INDEX IF NOT EXISTS idx_api_usage_org_endpoint ON api_usage(org_id, endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_last_used ON api_usage(last_used_at);
