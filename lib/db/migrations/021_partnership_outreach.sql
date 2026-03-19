-- Migration 021: Partnership Outreach Tracking
-- Tracks immigration lawyer and CPA partnerships with revenue share model

-- Partners table (immigration lawyers and CPAs)
CREATE TABLE IF NOT EXISTS partners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_type TEXT NOT NULL CHECK(partner_type IN ('immigration_lawyer', 'cpa', 'other')),

  -- Contact information
  name TEXT NOT NULL,
  firm_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  website TEXT,

  -- Business details
  specialization TEXT, -- e.g., "H-1B and TN visa holders", "cross-border tax"
  estimated_client_count INTEGER, -- Number of clients they have
  location_city TEXT,
  location_state TEXT,
  location_country TEXT DEFAULT 'USA',

  -- Partnership details
  revenue_share_percentage REAL DEFAULT 30.0 CHECK(revenue_share_percentage >= 0 AND revenue_share_percentage <= 100),
  referral_code TEXT UNIQUE NOT NULL, -- Unique referral code for tracking
  status TEXT DEFAULT 'prospect' CHECK(status IN ('prospect', 'contacted', 'interested', 'active', 'inactive', 'rejected')),

  -- Outreach tracking
  first_contacted_at TEXT,
  last_contacted_at TEXT,
  intro_call_scheduled_at TEXT,
  intro_call_completed_at TEXT,
  partnership_activated_at TEXT,

  -- Performance metrics
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0, -- Paid conversions
  total_revenue_generated REAL DEFAULT 0.0, -- Total revenue from referrals
  total_commission_earned REAL DEFAULT 0.0, -- Total commission paid to partner

  -- Notes and metadata
  notes TEXT, -- Internal notes about the partner
  metadata TEXT, -- JSON metadata for custom fields

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Outreach emails tracking
CREATE TABLE IF NOT EXISTS partner_outreach (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id INTEGER NOT NULL,

  -- Email details
  email_subject TEXT NOT NULL,
  email_body TEXT NOT NULL,
  sent_at TEXT DEFAULT CURRENT_TIMESTAMP,

  -- Response tracking
  opened BOOLEAN DEFAULT 0,
  opened_at TEXT,
  clicked BOOLEAN DEFAULT 0,
  clicked_at TEXT,
  responded BOOLEAN DEFAULT 0,
  responded_at TEXT,
  response_text TEXT,

  -- Status
  status TEXT DEFAULT 'sent' CHECK(status IN ('sent', 'opened', 'clicked', 'responded', 'bounced', 'no_response')),

  -- Notes
  notes TEXT,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

-- Partner referrals tracking
CREATE TABLE IF NOT EXISTS partner_referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id INTEGER NOT NULL,
  user_id INTEGER, -- User who signed up through referral (NULL if not signed up yet)

  -- Referral details
  referral_code TEXT NOT NULL,
  referred_at TEXT DEFAULT CURRENT_TIMESTAMP,

  -- Conversion tracking
  converted BOOLEAN DEFAULT 0, -- Did they become a paid user?
  converted_at TEXT,
  subscription_tier TEXT CHECK(subscription_tier IN ('free', 'pro', 'enterprise', NULL)),

  -- Revenue tracking
  first_payment_amount REAL DEFAULT 0.0,
  lifetime_value REAL DEFAULT 0.0, -- Total revenue from this referral
  commission_paid REAL DEFAULT 0.0, -- Commission paid to partner for this referral

  -- Attribution
  utm_source TEXT DEFAULT 'partner_referral',
  utm_medium TEXT,
  utm_campaign TEXT,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Partner commission payments tracking
CREATE TABLE IF NOT EXISTS partner_commissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id INTEGER NOT NULL,

  -- Payment period
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,

  -- Financial details
  total_revenue REAL NOT NULL DEFAULT 0.0, -- Total revenue from partner's referrals this period
  commission_rate REAL NOT NULL DEFAULT 30.0, -- Percentage commission
  commission_amount REAL NOT NULL DEFAULT 0.0, -- Calculated commission

  -- Payment status
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'paid', 'failed')),
  paid_at TEXT,
  payment_method TEXT, -- e.g., 'PayPal', 'Bank Transfer', 'Check'
  payment_reference TEXT, -- Transaction ID or check number

  -- Notes
  notes TEXT,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_referral_code ON partners(referral_code);
CREATE INDEX IF NOT EXISTS idx_partner_outreach_partner_id ON partner_outreach(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_outreach_status ON partner_outreach(status);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_partner_id ON partner_referrals(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_user_id ON partner_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_code ON partner_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_converted ON partner_referrals(converted);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_partner_id ON partner_commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_status ON partner_commissions(status);
