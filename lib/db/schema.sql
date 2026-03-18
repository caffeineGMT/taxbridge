-- TaxBridge Database Schema
-- SQLite database for cross-border tax calculations

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  us_state TEXT CHECK(LENGTH(us_state) = 2),
  canada_province TEXT CHECK(canada_province IN ('BC', 'ON', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'PE', 'NL', 'YT', 'NT', 'NU')),
  filing_status TEXT CHECK(filing_status IN ('single', 'married_joint', 'married_separate', 'head_of_household')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rsu_entries_user_id ON rsu_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_rsu_entries_vest_date ON rsu_entries(vest_date);
CREATE INDEX IF NOT EXISTS idx_rsu_entries_employer ON rsu_entries(employer);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_rsu_entry_id ON tax_calculations(rsu_entry_id);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_user_id ON tax_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_tax_year ON tax_calculations(tax_year);
CREATE INDEX IF NOT EXISTS idx_filing_requirements_user_id ON filing_requirements(user_id);
CREATE INDEX IF NOT EXISTS idx_filing_requirements_tax_year ON filing_requirements(tax_year);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(rate_date);
