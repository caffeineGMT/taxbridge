-- User Referral Program Migration
-- Creates tables and fields for viral user-to-user referrals

-- Add referral_code column to user_profiles if it doesn't exist
-- Each user gets their own unique referral code to share
-- Note: We can't add UNIQUE constraint with ALTER TABLE in SQLite
ALTER TABLE user_profiles ADD COLUMN referral_code TEXT;

-- Create referrals table for tracking user-to-user referrals
CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_user_id INTEGER NOT NULL,
  referred_user_id INTEGER NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'completed', 'rewarded')) DEFAULT 'pending',
  reward_granted BOOLEAN DEFAULT 0,
  reward_type TEXT CHECK(reward_type IN ('free_month', 'discount', 'credit')),
  reward_value REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  rewarded_at TEXT,
  FOREIGN KEY (referrer_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  UNIQUE(referrer_user_id, referred_user_id)
);

-- Create monthly leaderboard table
CREATE TABLE IF NOT EXISTS referral_leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  month TEXT NOT NULL, -- Format: YYYY-MM
  referral_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  total_reward_value REAL DEFAULT 0,
  rank INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  UNIQUE(user_id, month)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_leaderboard_month ON referral_leaderboard(month);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON referral_leaderboard(month, rank);

-- Create unique index for referral codes (can't use UNIQUE in ALTER TABLE)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_referral_code_unique ON user_profiles(referral_code) WHERE referral_code IS NOT NULL;
