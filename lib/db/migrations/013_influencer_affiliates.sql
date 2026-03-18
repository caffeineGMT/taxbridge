-- Migration 013: Extend affiliate system for influencer program
-- Adds influencer-specific fields, leaderboard, payout tracking, and outreach management

-- Add influencer columns to affiliate_partners
ALTER TABLE affiliate_partners ADD COLUMN partner_type TEXT NOT NULL DEFAULT 'cpa' CHECK(partner_type IN ('cpa', 'influencer', 'blogger', 'youtuber', 'forum_moderator'));
ALTER TABLE affiliate_partners ADD COLUMN custom_referral_slug TEXT UNIQUE;
ALTER TABLE affiliate_partners ADD COLUMN platform TEXT CHECK(platform IN ('youtube', 'blog', 'instagram', 'tiktok', 'twitter', 'forum', 'linkedin', 'podcast', 'other'));
ALTER TABLE affiliate_partners ADD COLUMN platform_url TEXT;
ALTER TABLE affiliate_partners ADD COLUMN audience_size INTEGER DEFAULT 0;
ALTER TABLE affiliate_partners ADD COLUMN content_niche TEXT;
ALTER TABLE affiliate_partners ADD COLUMN tier TEXT NOT NULL DEFAULT 'standard' CHECK(tier IN ('standard', 'premium', 'elite'));
ALTER TABLE affiliate_partners ADD COLUMN paypal_email TEXT;
ALTER TABLE affiliate_partners ADD COLUMN payout_method TEXT DEFAULT 'stripe' CHECK(payout_method IN ('stripe', 'paypal'));
ALTER TABLE affiliate_partners ADD COLUMN notes TEXT;
ALTER TABLE affiliate_partners ADD COLUMN last_active_at TEXT;

-- Affiliate payouts table
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  affiliate_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  payout_method TEXT NOT NULL CHECK(payout_method IN ('stripe', 'paypal')),
  payout_reference TEXT,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TEXT,
  FOREIGN KEY (affiliate_id) REFERENCES affiliate_partners(id) ON DELETE CASCADE
);

-- Affiliate leaderboard (monthly snapshots)
CREATE TABLE IF NOT EXISTS affiliate_leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  affiliate_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  referral_count INTEGER NOT NULL DEFAULT 0,
  conversion_count INTEGER NOT NULL DEFAULT 0,
  revenue_generated REAL NOT NULL DEFAULT 0.0,
  commission_earned REAL NOT NULL DEFAULT 0.0,
  rank INTEGER,
  bonus_earned REAL DEFAULT 0.0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(affiliate_id, month),
  FOREIGN KEY (affiliate_id) REFERENCES affiliate_partners(id) ON DELETE CASCADE
);

-- Influencer outreach tracking
CREATE TABLE IF NOT EXISTS influencer_outreach (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  influencer_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  platform_url TEXT NOT NULL,
  audience_size INTEGER DEFAULT 0,
  content_niche TEXT,
  email TEXT,
  contact_method TEXT,
  outreach_status TEXT NOT NULL DEFAULT 'identified' CHECK(outreach_status IN ('identified', 'contacted', 'negotiating', 'signed', 'active', 'declined', 'churned')),
  outreach_date TEXT,
  response_date TEXT,
  affiliate_id INTEGER,
  notes TEXT,
  priority INTEGER DEFAULT 5 CHECK(priority BETWEEN 1 AND 10),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (affiliate_id) REFERENCES affiliate_partners(id) ON DELETE SET NULL
);

-- Affiliate click tracking
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  affiliate_id INTEGER NOT NULL,
  referral_code TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  landing_page TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (affiliate_id) REFERENCES affiliate_partners(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_type ON affiliate_partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_tier ON affiliate_partners(tier);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_slug ON affiliate_partners(custom_referral_slug);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate ON affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status ON affiliate_payouts(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_leaderboard_month ON affiliate_leaderboard(month);
CREATE INDEX IF NOT EXISTS idx_affiliate_leaderboard_rank ON affiliate_leaderboard(rank);
CREATE INDEX IF NOT EXISTS idx_influencer_outreach_status ON influencer_outreach(outreach_status);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created ON affiliate_clicks(created_at);
