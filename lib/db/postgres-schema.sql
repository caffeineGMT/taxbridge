-- TaxBridge Database Schema (PostgreSQL)
-- PostgreSQL database for cross-border tax calculations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
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
  subscription_status TEXT CHECK(subscription_status IN ('active', 'canceled', 'past_due', 'trialing') OR subscription_status IS NULL),
  subscription_current_period_end TEXT,
  trial_ends_at BIGINT,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

-- RSU entries table
CREATE TABLE IF NOT EXISTS rsu_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  vest_date TEXT NOT NULL,
  fmv_usd NUMERIC(12, 2) NOT NULL CHECK(fmv_usd > 0),
  shares INTEGER NOT NULL CHECK(shares > 0),
  employer TEXT NOT NULL CHECK(employer IN ('Meta', 'Amazon', 'Google', 'Microsoft')),
  ticker_symbol TEXT,
  total_value_usd NUMERIC(12, 2) GENERATED ALWAYS AS (fmv_usd * shares) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Tax calculations table
CREATE TABLE IF NOT EXISTS tax_calculations (
  id SERIAL PRIMARY KEY,
  rsu_entry_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,

  -- Income amounts
  rsu_income_usd NUMERIC(12, 2) NOT NULL,
  rsu_income_cad NUMERIC(12, 2) NOT NULL,
  exchange_rate NUMERIC(8, 6) NOT NULL,

  -- US taxes
  us_federal_tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
  us_state_tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
  us_total_tax NUMERIC(12, 2) NOT NULL DEFAULT 0,

  -- Canada taxes
  canada_federal_tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
  canada_provincial_tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
  canada_total_tax NUMERIC(12, 2) NOT NULL DEFAULT 0,

  -- Foreign Tax Credit
  ftc_eligible_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ftc_claimed_cad NUMERIC(12, 2) NOT NULL DEFAULT 0,

  -- Net amounts
  net_tax_payable NUMERIC(12, 2) NOT NULL DEFAULT 0,
  effective_tax_rate NUMERIC(5, 4) NOT NULL DEFAULT 0,

  -- Metadata
  calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tax_year INTEGER NOT NULL,
  notes TEXT,

  FOREIGN KEY (rsu_entry_id) REFERENCES rsu_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Filing requirements tracking
CREATE TABLE IF NOT EXISTS filing_requirements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  tax_year INTEGER NOT NULL,

  -- Required forms
  requires_w2 BOOLEAN DEFAULT TRUE,
  requires_1040 BOOLEAN DEFAULT TRUE,
  requires_1040nr BOOLEAN DEFAULT FALSE,
  requires_t1 BOOLEAN DEFAULT TRUE,
  requires_t4 BOOLEAN DEFAULT FALSE,
  requires_fbar BOOLEAN DEFAULT FALSE,
  requires_8938 BOOLEAN DEFAULT FALSE,
  requires_8833 BOOLEAN DEFAULT TRUE,

  -- Filing status
  us_filed BOOLEAN DEFAULT FALSE,
  canada_filed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  UNIQUE(user_id, tax_year)
);

-- Exchange rates cache
CREATE TABLE IF NOT EXISTS exchange_rates (
  id SERIAL PRIMARY KEY,
  rate_date TEXT NOT NULL,
  usd_to_cad NUMERIC(8, 6) NOT NULL CHECK(usd_to_cad > 0),
  source TEXT DEFAULT 'Bank of Canada',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(rate_date)
);

-- Form completion tracking
CREATE TABLE IF NOT EXISTS form_completion (
  user_id INTEGER NOT NULL,
  form_code TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at BIGINT,
  PRIMARY KEY (user_id, form_code),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Analytics events tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  event_name TEXT NOT NULL,
  metadata TEXT,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
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
