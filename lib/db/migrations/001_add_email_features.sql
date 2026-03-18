-- Migration 001: Add Email Drip Campaign Features
-- Adds email_preferences to user_profiles and email_events table

-- Add email_preferences column to user_profiles
ALTER TABLE user_profiles ADD COLUMN email_preferences TEXT DEFAULT '{"marketing_emails": true}';

-- Create email_events table for tracking drip campaign emails
CREATE TABLE IF NOT EXISTS email_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('drip_welcome', 'drip_day3', 'drip_day7', 'drip_day14')),
  sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  opened_at TEXT,
  clicked_at TEXT,
  metadata TEXT,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Create unique index to prevent duplicate email sends
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_events_user_type ON email_events(user_id, event_type);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_events_user_id ON email_events(user_id);
CREATE INDEX IF NOT EXISTS idx_email_events_sent_at ON email_events(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);
