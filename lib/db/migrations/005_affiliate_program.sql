-- Affiliate Program Tables
-- Migration 005: Add affiliate partner and referral tracking

-- Affiliate Partners Table
CREATE TABLE IF NOT EXISTS affiliate_partners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_name TEXT NOT NULL,
  firm_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  commission_rate REAL NOT NULL DEFAULT 0.20,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  total_referrals INTEGER DEFAULT 0,
  total_revenue REAL DEFAULT 0.0,
  stripe_connect_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TEXT,
  rejected_at TEXT,
  rejection_reason TEXT
);

-- Affiliate Referrals Table
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  affiliate_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  subscription_id TEXT NOT NULL,
  commission_amount REAL NOT NULL,
  commission_status TEXT NOT NULL DEFAULT 'pending' CHECK(commission_status IN ('pending', 'paid')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at TEXT,
  FOREIGN KEY (affiliate_id) REFERENCES affiliate_partners(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Add referred_by column to user_profiles
ALTER TABLE user_profiles ADD COLUMN referred_by TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_email ON affiliate_partners(email);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_referral_code ON affiliate_partners(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_status ON affiliate_partners(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_user_id ON affiliate_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referred_by ON user_profiles(referred_by);
