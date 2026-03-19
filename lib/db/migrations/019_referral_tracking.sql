-- Referral Click and Share Tracking Migration
-- Adds tables for tracking link clicks and shares for viral growth metrics

-- Track referral link clicks
CREATE TABLE IF NOT EXISTS referral_clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referral_code TEXT NOT NULL,
  referrer_user_id INTEGER,
  visitor_ip TEXT,
  visitor_country TEXT,
  visitor_user_agent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  landing_page TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (referrer_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Track share events (when users share their referral link)
CREATE TABLE IF NOT EXISTS referral_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_user_id INTEGER NOT NULL,
  referral_code TEXT NOT NULL,
  share_platform TEXT CHECK(share_platform IN ('twitter', 'linkedin', 'email', 'copy_link', 'direct_email')) NOT NULL,
  share_metadata TEXT, -- JSON with platform-specific data
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (referrer_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_clicks_code ON referral_clicks(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_referrer ON referral_clicks(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_created ON referral_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_referral_shares_referrer ON referral_shares(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_shares_platform ON referral_shares(share_platform);
CREATE INDEX IF NOT EXISTS idx_referral_shares_created ON referral_shares(created_at);

-- Add daily/weekly aggregations for analytics
CREATE TABLE IF NOT EXISTS referral_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_user_id INTEGER NOT NULL,
  period_type TEXT CHECK(period_type IN ('daily', 'weekly', 'monthly')) NOT NULL,
  period_start TEXT NOT NULL, -- ISO date string (YYYY-MM-DD)
  total_shares INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  conversion_rate REAL DEFAULT 0,
  most_effective_platform TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (referrer_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  UNIQUE(referrer_user_id, period_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_referral_analytics_user_period ON referral_analytics(referrer_user_id, period_type, period_start);
