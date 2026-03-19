-- Referral Credits System Migration
-- Changes from 2 free months ($50) to $10 credit per referral

-- Add credits column to user_profiles
ALTER TABLE user_profiles ADD COLUMN credit_balance REAL DEFAULT 0 CHECK(credit_balance >= 0);

-- Create credit transactions table for tracking credit history
CREATE TABLE IF NOT EXISTS credit_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  type TEXT CHECK(type IN ('referral_reward', 'referral_bonus', 'payment_applied', 'adjustment', 'expiration')) NOT NULL,
  description TEXT NOT NULL,
  referral_id INTEGER,
  balance_after REAL NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (referral_id) REFERENCES referrals(id) ON DELETE SET NULL
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);

-- Create viral coefficient tracking table
CREATE TABLE IF NOT EXISTS viral_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  total_users INTEGER NOT NULL DEFAULT 0,
  new_signups INTEGER NOT NULL DEFAULT 0,
  referred_signups INTEGER NOT NULL DEFAULT 0,
  viral_coefficient REAL NOT NULL DEFAULT 0,
  calculated_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(date)
);

CREATE INDEX IF NOT EXISTS idx_viral_metrics_date ON viral_metrics(date);
