-- TaxBridge Database Schema
-- SQLite database for cross-border tax calculations

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
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
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- RSU entries table
CREATE TABLE IF NOT EXISTS rsu_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  vest_date TEXT NOT NULL,
  fmv_usd REAL NOT NULL CHECK(fmv_usd > 0),
  shares INTEGER NOT NULL CHECK(shares > 0),
  employer TEXT NOT NULL CHECK(employer IN ('Meta', 'Amazon', 'Google', 'Microsoft')),
  ticker_symbol TEXT,
  total_value_usd REAL GENERATED ALWAYS AS (fmv_usd * shares) VIRTUAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Tax calculations table
CREATE TABLE IF NOT EXISTS tax_calculations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rsu_entry_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,

  -- Income amounts
  rsu_income_usd REAL NOT NULL,
  rsu_income_cad REAL NOT NULL,
  exchange_rate REAL NOT NULL,

  -- US taxes
  us_federal_tax REAL NOT NULL DEFAULT 0,
  us_state_tax REAL NOT NULL DEFAULT 0,
  us_total_tax REAL NOT NULL DEFAULT 0,

  -- Canada taxes
  canada_federal_tax REAL NOT NULL DEFAULT 0,
  canada_provincial_tax REAL NOT NULL DEFAULT 0,
  canada_total_tax REAL NOT NULL DEFAULT 0,

  -- Foreign Tax Credit
  ftc_eligible_usd REAL NOT NULL DEFAULT 0,
  ftc_claimed_cad REAL NOT NULL DEFAULT 0,

  -- Net amounts
  net_tax_payable REAL NOT NULL DEFAULT 0,
  effective_tax_rate REAL NOT NULL DEFAULT 0,

  -- Metadata
  calculation_date TEXT DEFAULT CURRENT_TIMESTAMP,
  tax_year INTEGER NOT NULL,
  notes TEXT,

  FOREIGN KEY (rsu_entry_id) REFERENCES rsu_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Filing requirements tracking
CREATE TABLE IF NOT EXISTS filing_requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  tax_year INTEGER NOT NULL,

  -- Required forms
  requires_w2 BOOLEAN DEFAULT 1,
  requires_1040 BOOLEAN DEFAULT 1,
  requires_1040nr BOOLEAN DEFAULT 0,
  requires_t1 BOOLEAN DEFAULT 1,
  requires_t4 BOOLEAN DEFAULT 0,
  requires_fbar BOOLEAN DEFAULT 0,
  requires_8938 BOOLEAN DEFAULT 0,
  requires_8833 BOOLEAN DEFAULT 1,

  -- Filing status
  us_filed BOOLEAN DEFAULT 0,
  canada_filed BOOLEAN DEFAULT 0,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  UNIQUE(user_id, tax_year)
);

-- Exchange rates cache
CREATE TABLE IF NOT EXISTS exchange_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rate_date TEXT NOT NULL,
  usd_to_cad REAL NOT NULL CHECK(usd_to_cad > 0),
  source TEXT DEFAULT 'Bank of Canada',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(rate_date)
);

-- Form completion tracking
CREATE TABLE IF NOT EXISTS form_completion (
  user_id INTEGER NOT NULL,
  form_code TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT 0,
  completed_at INTEGER,
  PRIMARY KEY (user_id, form_code),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Analytics events tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_name TEXT NOT NULL,
  metadata TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Customer testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK(rating >= 1 AND rating <= 5),
  savings_amount TEXT,
  avatar_url TEXT,
  video_url TEXT,
  verified BOOLEAN DEFAULT 0,
  featured BOOLEAN DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'hidden', 'pending')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Beta user outreach tracking
CREATE TABLE IF NOT EXISTS testimonial_outreach (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  user_name TEXT,
  outreach_date TEXT DEFAULT CURRENT_TIMESTAMP,
  incentive_offered TEXT DEFAULT '$20 Amazon gift card',
  status TEXT DEFAULT 'sent' CHECK(status IN ('sent', 'responded', 'completed', 'declined')),
  response_date TEXT,
  testimonial_id INTEGER,
  notes TEXT,
  FOREIGN KEY (testimonial_id) REFERENCES testimonials(id) ON DELETE SET NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_rsu_entries_user_id ON rsu_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_rsu_entries_vest_date ON rsu_entries(vest_date);
CREATE INDEX IF NOT EXISTS idx_rsu_entries_employer ON rsu_entries(employer);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_rsu_entry_id ON tax_calculations(rsu_entry_id);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_user_id ON tax_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_tax_year ON tax_calculations(tax_year);
CREATE INDEX IF NOT EXISTS idx_filing_requirements_user_id ON filing_requirements(user_id);
CREATE INDEX IF NOT EXISTS idx_filing_requirements_tax_year ON filing_requirements(tax_year);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(rate_date);
CREATE INDEX IF NOT EXISTS idx_form_completion_user_id ON form_completion(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_created ON analytics_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_name_created ON analytics_events(event_name, created_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status, featured, display_order);
CREATE INDEX IF NOT EXISTS idx_outreach_status ON testimonial_outreach(status, outreach_date);

-- Invoices table for tracking Stripe invoices
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  subscription_id TEXT,
  amount_due INTEGER NOT NULL,
  amount_paid INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  hosted_url TEXT,
  invoice_pdf TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created ON invoices(created_at);

-- Refunds table for tracking Stripe refunds
CREATE TABLE IF NOT EXISTS refunds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stripe_refund_id TEXT UNIQUE NOT NULL,
  stripe_charge_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT,
  status TEXT CHECK(status IN ('pending', 'succeeded', 'failed', 'canceled')),
  metadata TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_charge_id ON refunds(stripe_charge_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_created ON refunds(created_at);

-- Cancellation feedback table for tracking why users cancel
CREATE TABLE IF NOT EXISTS cancellation_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  subscription_id TEXT NOT NULL,
  reason TEXT,
  comments TEXT,
  satisfaction_score INTEGER CHECK(satisfaction_score BETWEEN 1 AND 5),
  would_recommend BOOLEAN,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_user_id ON cancellation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_reason ON cancellation_feedback(reason);
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_created ON cancellation_feedback(created_at);



