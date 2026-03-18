-- Migration 010: A/B Testing and Conversion Tracking for Email Drip Campaign
-- Description: Add variant tracking and conversion metrics to optimize email performance

-- Add A/B test variant tracking to email_events
ALTER TABLE email_events
ADD COLUMN ab_variant TEXT CHECK(ab_variant IN ('A', 'B')) DEFAULT 'A';

ALTER TABLE email_events
ADD COLUMN utm_source TEXT DEFAULT 'email';

ALTER TABLE email_events
ADD COLUMN utm_medium TEXT DEFAULT 'drip-campaign';

ALTER TABLE email_events
ADD COLUMN utm_campaign TEXT;

ALTER TABLE email_events
ADD COLUMN converted_to_paid INTEGER DEFAULT 0;

ALTER TABLE email_events
ADD COLUMN converted_at TEXT;

-- Create conversions table for detailed tracking
CREATE TABLE IF NOT EXISTS email_conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email_event_id INTEGER,
  conversion_type TEXT NOT NULL CHECK(conversion_type IN (
    'free_to_pro',
    'trial_to_pro',
    'referral_signup'
  )),
  revenue_amount REAL,
  discount_code TEXT,
  converted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  attribution_window_hours INTEGER DEFAULT 168, -- 7 days
  metadata TEXT,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (email_event_id) REFERENCES email_events(id) ON DELETE SET NULL
);

CREATE INDEX idx_email_conversions_user ON email_conversions(user_id);
CREATE INDEX idx_email_conversions_event ON email_conversions(email_event_id);
CREATE INDEX idx_email_conversions_date ON email_conversions(converted_at);

-- Create A/B test variants table
CREATE TABLE IF NOT EXISTS email_ab_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL CHECK(event_type IN (
    'drip_welcome', 'drip_day3', 'drip_day7', 'drip_day14'
  )),
  variant TEXT NOT NULL CHECK(variant IN ('A', 'B')),
  subject_line TEXT NOT NULL,
  cta_text TEXT NOT NULL,
  weight REAL DEFAULT 0.5, -- 50/50 split by default
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT,
  UNIQUE(event_type, variant)
);

-- Seed initial A/B test variants
INSERT INTO email_ab_variants (event_type, variant, subject_line, cta_text, weight) VALUES
-- Day 1 Welcome Email
('drip_welcome', 'A', 'Welcome to TaxBridge - Your Cross-Border Tax Solution', 'Get Started →', 0.5),
('drip_welcome', 'B', 'Save $12K in Taxes: Your First Steps with TaxBridge', 'Calculate My Savings →', 0.5),

-- Day 3 Education Email
('drip_day3', 'A', 'Understanding Foreign Tax Credits (FTC) - Avoid Double Taxation', 'Calculate Your FTC →', 0.5),
('drip_day3', 'B', 'Did you know? Foreign Tax Credit can save $5K-15K', 'See My Tax Savings →', 0.5),

-- Day 7 Feature Email
('drip_day7', 'A', 'TaxBridge Features You Might Have Missed', 'Explore Features →', 0.5),
('drip_day7', 'B', '5 Tools to Maximize Your RSU Tax Savings', 'Try These Tools →', 0.5),

-- Day 14 Conversion Email
('drip_day14', 'A', 'Special Offer: Save 20% on TaxBridge Premium', 'Upgrade Now →', 0.5),
('drip_day14', 'B', 'Upgrade to Pro: Unlimited RSU entries + PDF export - Use code SAVE20', 'Claim My Discount →', 0.5);

-- Create view for conversion analytics
CREATE VIEW IF NOT EXISTS v_email_conversion_analytics AS
SELECT
  ee.event_type,
  ee.ab_variant,
  COUNT(DISTINCT ee.id) as total_sent,
  COUNT(DISTINCT CASE WHEN ee.opened_at IS NOT NULL THEN ee.id END) as total_opened,
  COUNT(DISTINCT CASE WHEN ee.clicked_at IS NOT NULL THEN ee.id END) as total_clicked,
  COUNT(DISTINCT CASE WHEN ee.converted_to_paid = 1 THEN ee.id END) as total_converted,
  ROUND(CAST(COUNT(DISTINCT CASE WHEN ee.opened_at IS NOT NULL THEN ee.id END) AS FLOAT) / COUNT(DISTINCT ee.id) * 100, 2) as open_rate,
  ROUND(CAST(COUNT(DISTINCT CASE WHEN ee.clicked_at IS NOT NULL THEN ee.id END) AS FLOAT) / COUNT(DISTINCT ee.id) * 100, 2) as click_rate,
  ROUND(CAST(COUNT(DISTINCT CASE WHEN ee.converted_to_paid = 1 THEN ee.id END) AS FLOAT) / COUNT(DISTINCT ee.id) * 100, 2) as conversion_rate,
  SUM(CASE WHEN ec.revenue_amount IS NOT NULL THEN ec.revenue_amount ELSE 0 END) as total_revenue
FROM email_events ee
LEFT JOIN email_conversions ec ON ee.id = ec.email_event_id
GROUP BY ee.event_type, ee.ab_variant;
