-- Migration 007: Update Email Drip Campaign to 7-Day Sequence
-- Changes the drip campaign from 14-day to 7-day nurture sequence
-- New sequence: Day 1 (welcome + tips), Day 3 (case study), Day 5 (limited offer), Day 7 (last chance)

-- Drop existing unique constraint
DROP INDEX IF EXISTS idx_email_events_user_type;

-- Update event_type CHECK constraint to support new 7-day sequence
-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table
CREATE TABLE email_events_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN (
    'drip_day1',
    'drip_day3',
    'drip_day5',
    'drip_day7',
    -- Legacy support (will be migrated)
    'drip_welcome',
    'drip_day14'
  )),
  sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  opened_at TEXT,
  clicked_at TEXT,
  metadata TEXT,
  ab_variant TEXT DEFAULT 'A' CHECK(ab_variant IN ('A', 'B')),
  utm_source TEXT DEFAULT 'email',
  utm_medium TEXT DEFAULT 'drip-campaign',
  utm_campaign TEXT,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Copy existing data, migrating old event types to new ones
INSERT INTO email_events_new (
  id, user_id, event_type, sent_at, opened_at, clicked_at, metadata,
  ab_variant, utm_source, utm_medium, utm_campaign
)
SELECT
  id,
  user_id,
  CASE event_type
    WHEN 'drip_welcome' THEN 'drip_day1'
    WHEN 'drip_day3' THEN 'drip_day3'
    WHEN 'drip_day7' THEN 'drip_day5'  -- Shift Day 7 to Day 5
    WHEN 'drip_day14' THEN 'drip_day7' -- Shift Day 14 to Day 7
    ELSE event_type
  END as event_type,
  sent_at,
  opened_at,
  clicked_at,
  metadata,
  COALESCE(ab_variant, 'A'),
  COALESCE(utm_source, 'email'),
  COALESCE(utm_medium, 'drip-campaign'),
  utm_campaign
FROM email_events;

-- Drop old table and rename new one
DROP TABLE email_events;
ALTER TABLE email_events_new RENAME TO email_events;

-- Recreate indexes
CREATE UNIQUE INDEX idx_email_events_user_type ON email_events(user_id, event_type);
CREATE INDEX idx_email_events_user_id ON email_events(user_id);
CREATE INDEX idx_email_events_sent_at ON email_events(sent_at);
CREATE INDEX idx_email_events_event_type ON email_events(event_type);
CREATE INDEX idx_email_events_ab_variant ON email_events(ab_variant);

-- Add comment to migration log
INSERT INTO schema_migrations (version, description)
VALUES (7, 'Update drip campaign to 7-day sequence with new event types');
