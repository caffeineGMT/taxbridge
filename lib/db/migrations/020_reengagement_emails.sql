-- Migration 020: Re-engagement Email Campaign
-- Adds event types for calculator users who didn't convert

-- Extend email_events table to support re-engagement campaign
-- Event types: reengagement_day3, reengagement_day7, reengagement_day14

-- Note: SQLite doesn't support ALTER TABLE ... MODIFY COLUMN with CHECK constraints
-- We need to recreate the table with updated constraints

-- 1. Create new table with updated event types
CREATE TABLE IF NOT EXISTS email_events_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN (
    'drip_welcome',
    'drip_day3',
    'drip_day7',
    'drip_day14',
    'drip_day1',
    'drip_day5',
    'reengagement_day3',
    'reengagement_day7',
    'reengagement_day14'
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

-- 2. Copy existing data
INSERT INTO email_events_new (
  id, user_id, event_type, sent_at, opened_at, clicked_at, metadata, ab_variant, utm_source, utm_medium, utm_campaign
)
SELECT
  id,
  user_id,
  event_type,
  sent_at,
  opened_at,
  clicked_at,
  metadata,
  COALESCE(ab_variant, 'A'),
  COALESCE(utm_source, 'email'),
  COALESCE(utm_medium, 'drip-campaign'),
  utm_campaign
FROM email_events;

-- 3. Drop old table
DROP TABLE email_events;

-- 4. Rename new table
ALTER TABLE email_events_new RENAME TO email_events;

-- 5. Recreate indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_events_user_type ON email_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_user_id ON email_events(user_id);
CREATE INDEX IF NOT EXISTS idx_email_events_sent_at ON email_events(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_opened_at ON email_events(opened_at);
CREATE INDEX IF NOT EXISTS idx_email_events_clicked_at ON email_events(clicked_at);

-- 6. Create calculator_sessions table to track calculator usage
CREATE TABLE IF NOT EXISTS calculator_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  first_calculation_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_calculation_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_calculations INTEGER DEFAULT 1,
  converted_to_paid BOOLEAN DEFAULT 0,
  converted_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_calculator_sessions_user_id ON calculator_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_calculator_sessions_converted ON calculator_sessions(converted_to_paid);
CREATE INDEX IF NOT EXISTS idx_calculator_sessions_first_calc ON calculator_sessions(first_calculation_at);

-- 7. Create email conversion tracking table
CREATE TABLE IF NOT EXISTS email_conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email_event_id INTEGER,
  conversion_type TEXT NOT NULL CHECK(conversion_type IN (
    'calculator_to_signup',
    'free_to_pro',
    'trial_to_paid',
    'reactivation'
  )),
  revenue_amount REAL DEFAULT 0,
  discount_code TEXT,
  attribution_window_hours INTEGER DEFAULT 168, -- 7 days default
  metadata TEXT, -- JSON metadata
  converted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (email_event_id) REFERENCES email_events(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_email_conversions_user_id ON email_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_email_conversions_email_event ON email_conversions(email_event_id);
CREATE INDEX IF NOT EXISTS idx_email_conversions_type ON email_conversions(conversion_type);
CREATE INDEX IF NOT EXISTS idx_email_conversions_converted_at ON email_conversions(converted_at);

-- 8. Create analytics view for re-engagement performance
CREATE VIEW IF NOT EXISTS reengagement_performance AS
SELECT
  ee.event_type,
  COUNT(*) as total_sent,
  COUNT(ee.opened_at) as total_opened,
  COUNT(ee.clicked_at) as total_clicked,
  COUNT(ec.id) as total_conversions,
  ROUND(CAST(COUNT(ee.opened_at) AS FLOAT) / COUNT(*) * 100, 2) as open_rate,
  ROUND(CAST(COUNT(ee.clicked_at) AS FLOAT) / COUNT(*) * 100, 2) as click_rate,
  ROUND(CAST(COUNT(ec.id) AS FLOAT) / COUNT(*) * 100, 2) as conversion_rate,
  COALESCE(SUM(ec.revenue_amount), 0) as total_revenue,
  ROUND(COALESCE(SUM(ec.revenue_amount), 0) / COUNT(*), 2) as revenue_per_email
FROM email_events ee
LEFT JOIN email_conversions ec ON ee.id = ec.email_event_id
WHERE ee.event_type IN ('reengagement_day3', 'reengagement_day7', 'reengagement_day14')
GROUP BY ee.event_type
ORDER BY ee.event_type;
