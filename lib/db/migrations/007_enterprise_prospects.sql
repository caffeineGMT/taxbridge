-- Migration 007: Enterprise Prospects Tracking
-- Created: 2024-03-18
-- Purpose: Track cold email outreach to immigration law firms

-- Create enterprise_prospects table
CREATE TABLE IF NOT EXISTS enterprise_prospects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firm_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_name TEXT,
  contact_title TEXT,
  city TEXT,
  state TEXT,
  website TEXT,
  attorney_count INTEGER,
  specialties TEXT, -- semicolon-separated: H-1B;TN;PERM
  source TEXT, -- aila_directory, apollo, linkedin, manual_research

  -- Campaign tracking
  status TEXT DEFAULT 'target', -- target, contacted, opened, clicked, replied, demo_scheduled, trial_started, closed_won, closed_lost
  email_sequence_position INTEGER DEFAULT 0, -- 0-5 (which email they're on)
  last_contact_date TEXT,
  last_contact_type TEXT, -- email_1, email_2, email_3, email_4, email_5, demo_call, trial_onboarding

  -- Engagement tracking
  email_opened INTEGER DEFAULT 0, -- boolean
  email_clicked INTEGER DEFAULT 0, -- boolean
  reply_date TEXT,
  reply_content TEXT,

  -- Pipeline stages
  demo_scheduled_date TEXT,
  demo_completed_date TEXT,
  trial_start_date TEXT,
  trial_end_date TEXT,
  closed_won_date TEXT,
  closed_lost_date TEXT,
  closed_lost_reason TEXT,

  -- Deal info
  seats_count INTEGER, -- number of seats purchased
  annual_contract_value INTEGER, -- in USD

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_enterprise_prospects_email ON enterprise_prospects(contact_email);
CREATE INDEX IF NOT EXISTS idx_enterprise_prospects_status ON enterprise_prospects(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_prospects_city_state ON enterprise_prospects(city, state);
CREATE INDEX IF NOT EXISTS idx_enterprise_prospects_last_contact ON enterprise_prospects(last_contact_date);

-- Create email_events table for detailed tracking
CREATE TABLE IF NOT EXISTS email_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prospect_id INTEGER NOT NULL,
  event_type TEXT NOT NULL, -- sent, delivered, opened, clicked, replied, bounced, spam
  email_subject TEXT,
  email_template TEXT, -- email_1, email_2, etc.
  link_clicked TEXT, -- which link they clicked (demo_video, roi_calculator, calendly)
  event_timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT, -- JSON blob for additional data

  FOREIGN KEY (prospect_id) REFERENCES enterprise_prospects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_events_prospect ON email_events(prospect_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_timestamp ON email_events(event_timestamp);

-- Create outreach_campaigns table for organizing batches
CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT DEFAULT 'cold_email', -- cold_email, warm_intro, conference_followup
  target_segment TEXT, -- bay_area, seattle, nyc, boston, austin
  start_date TEXT,
  end_date TEXT,

  -- Campaign metrics
  total_prospects INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_replied INTEGER DEFAULT 0,
  total_demos INTEGER DEFAULT 0,
  total_trials INTEGER DEFAULT 0,
  total_closed_won INTEGER DEFAULT 0,

  -- Goals
  goal_reply_rate REAL DEFAULT 10.0, -- 10%
  goal_demo_count INTEGER DEFAULT 10,
  goal_trial_count INTEGER DEFAULT 3,
  goal_closed_won_count INTEGER DEFAULT 2,
  goal_arr INTEGER DEFAULT 200000, -- $200K ARR

  -- Status
  status TEXT DEFAULT 'active', -- draft, active, paused, completed

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Link prospects to campaigns (many-to-many)
CREATE TABLE IF NOT EXISTS campaign_prospects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  prospect_id INTEGER NOT NULL,
  added_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (campaign_id) REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (prospect_id) REFERENCES enterprise_prospects(id) ON DELETE CASCADE,

  UNIQUE(campaign_id, prospect_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_prospects_campaign ON campaign_prospects(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_prospects_prospect ON campaign_prospects(prospect_id);

-- Insert initial campaign
INSERT INTO outreach_campaigns (
  campaign_name,
  campaign_type,
  target_segment,
  start_date,
  total_prospects,
  goal_reply_rate,
  goal_demo_count,
  goal_trial_count,
  goal_closed_won_count,
  goal_arr,
  status
) VALUES (
  'Immigration Firms - Q1 2024',
  'cold_email',
  'tech_hubs_nationwide',
  '2024-03-18',
  200,
  10.0,
  10,
  3,
  2,
  200000,
  'active'
);
