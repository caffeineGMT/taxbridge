-- Add affiliate partner tables for immigration lawyers and CPAs
-- Migration: add-affiliate-tables.sql
-- Created: 2026-03-19

-- Affiliate Partners table (Immigration Lawyers & CPAs)
CREATE TABLE IF NOT EXISTS affiliate_partners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_name TEXT NOT NULL,
  firm_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  website TEXT,
  partner_type TEXT NOT NULL CHECK(partner_type IN ('immigration_lawyer', 'cpa', 'other')),
  referral_code TEXT UNIQUE NOT NULL,
  commission_rate REAL NOT NULL DEFAULT 0.30 CHECK(commission_rate >= 0 AND commission_rate <= 1),

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  approved_at INTEGER,
  rejected_at INTEGER,
  rejection_reason TEXT,

  -- Stats
  total_referrals INTEGER NOT NULL DEFAULT 0,
  total_revenue REAL NOT NULL DEFAULT 0,

  -- Payment info
  stripe_connect_id TEXT,
  payment_method TEXT CHECK(payment_method IN ('stripe_connect', 'paypal', 'wire_transfer', NULL)),
  payment_details TEXT,

  -- Marketing customization
  co_branded_slug TEXT UNIQUE, -- e.g., 'immigrationlawyer-john-smith'
  custom_logo_url TEXT,
  custom_message TEXT,

  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Affiliate Referrals table
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  affiliate_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  subscription_id TEXT NOT NULL,

  -- Commission tracking
  commission_amount REAL NOT NULL,
  commission_status TEXT NOT NULL DEFAULT 'pending' CHECK(commission_status IN ('pending', 'paid', 'void')),
  paid_at INTEGER,
  payment_reference TEXT,

  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (affiliate_id) REFERENCES affiliate_partners(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- NOTE: user_profiles.referred_by column should be added manually via:
-- ALTER TABLE user_profiles ADD COLUMN referred_by TEXT;
-- (Skipped in migration to avoid errors if table doesn't exist yet)

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_email ON affiliate_partners(email);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_referral_code ON affiliate_partners(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_status ON affiliate_partners(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_slug ON affiliate_partners(co_branded_slug);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_user_id ON affiliate_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(commission_status);
-- NOTE: Index for user_profiles.referred_by requires the column to exist first
-- CREATE INDEX IF NOT EXISTS idx_user_profiles_referred_by ON user_profiles(referred_by);
