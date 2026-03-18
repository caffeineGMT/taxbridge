-- Migration 008: HR Prospects Tracking (LinkedIn Outreach)
-- Created: 2024-03-18
-- Purpose: Track LinkedIn outreach to HR departments at FAANG companies

-- Create hr_prospects table
CREATE TABLE IF NOT EXISTS hr_prospects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT NOT NULL, -- Meta, Google, Amazon, Microsoft, Apple, etc.
  name TEXT NOT NULL,
  title TEXT NOT NULL, -- Benefits Manager, Compensation Lead, etc.
  linkedin_url TEXT NOT NULL UNIQUE,
  email TEXT, -- Optional, from Apollo.io or RocketReach
  city TEXT, -- Bay Area, Seattle, NYC

  -- LinkedIn outreach tracking
  outreach_status TEXT DEFAULT 'pending', -- pending, connection_sent, connected, message_sent, demo_booked, pilot_signed, declined
  connection_date TEXT, -- When connection accepted
  connection_sent_date TEXT, -- When connection request sent
  message_sent_date TEXT, -- When warm intro message sent
  demo_booked_date TEXT,
  pilot_signed_date TEXT,

  -- Engagement tracking
  calendly_url TEXT, -- Unique Calendly link for this prospect
  demo_completed INTEGER DEFAULT 0, -- boolean
  trial_start_date TEXT,
  trial_end_date TEXT,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hr_prospects_linkedin ON hr_prospects(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_hr_prospects_status ON hr_prospects(outreach_status);
CREATE INDEX IF NOT EXISTS idx_hr_prospects_company ON hr_prospects(company);
CREATE INDEX IF NOT EXISTS idx_hr_prospects_connection_date ON hr_prospects(connection_date);

-- LinkedIn automation log (track daily limits)
CREATE TABLE IF NOT EXISTS linkedin_automation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action_type TEXT NOT NULL, -- connection_request, message, profile_view
  prospect_id INTEGER,
  success INTEGER DEFAULT 1, -- boolean
  error_message TEXT,
  action_timestamp TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (prospect_id) REFERENCES hr_prospects(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_linkedin_log_timestamp ON linkedin_automation_log(action_timestamp);
CREATE INDEX IF NOT EXISTS idx_linkedin_log_action ON linkedin_automation_log(action_type);
