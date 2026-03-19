-- Migration: Calculator Feedback Campaign
-- Purpose: Track feedback requests and responses from non-converting calculator users

-- Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,

  -- Discount details
  discount_percent INTEGER NOT NULL CHECK(discount_percent BETWEEN 1 AND 100),
  valid_from TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valid_until TEXT NOT NULL,

  -- Usage tracking
  used BOOLEAN DEFAULT 0,
  used_at TEXT,
  order_id TEXT,

  -- Campaign tracking
  created_for TEXT CHECK(created_for IN ('calculator_feedback', 'user_interview', 'referral', 'other')) NOT NULL,
  metadata TEXT, -- JSON metadata

  -- Timestamps
  created_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_user_id ON discount_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_email ON discount_codes(email);
CREATE INDEX IF NOT EXISTS idx_discount_codes_used ON discount_codes(used);
CREATE INDEX IF NOT EXISTS idx_discount_codes_created_for ON discount_codes(created_for);
CREATE INDEX IF NOT EXISTS idx_discount_codes_valid_until ON discount_codes(valid_until);

-- Create calculator_feedback_requests table (tracks who we sent feedback requests to)
CREATE TABLE IF NOT EXISTS calculator_feedback_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,

  -- Calculator usage data
  first_calculation_at TEXT NOT NULL,
  last_calculation_at TEXT NOT NULL,
  total_calculations INTEGER DEFAULT 1,

  -- Request tracking
  request_sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reminder_sent_at TEXT,
  reminder_count INTEGER DEFAULT 0,

  -- Response tracking
  responded BOOLEAN DEFAULT 0,
  responded_at TEXT,
  response_id INTEGER,

  -- Discount code
  discount_code TEXT NOT NULL,
  discount_used BOOLEAN DEFAULT 0,
  discount_used_at TEXT,

  -- Metadata
  utm_campaign TEXT DEFAULT 'feedback_campaign_2026_q1',
  metadata TEXT, -- JSON metadata

  -- Timestamps
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (response_id) REFERENCES calculator_feedback_responses(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_requests_user_id ON calculator_feedback_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_requests_email ON calculator_feedback_requests(email);
CREATE INDEX IF NOT EXISTS idx_feedback_requests_responded ON calculator_feedback_requests(responded);
CREATE INDEX IF NOT EXISTS idx_feedback_requests_sent_at ON calculator_feedback_requests(request_sent_at);
CREATE INDEX IF NOT EXISTS idx_feedback_requests_discount_code ON calculator_feedback_requests(discount_code);

-- Create calculator_feedback_responses table (stores feedback from non-converting users)
CREATE TABLE IF NOT EXISTS calculator_feedback_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,

  -- Primary feedback question: "What stopped you from purchasing?"
  stopped_reason TEXT NOT NULL, -- Free-form answer

  -- Categorized reasons (can be multiple, comma-separated)
  stopped_reasons_categorized TEXT, -- price,trust,features,timing,alternative,complexity

  -- Additional structured feedback
  price_perception TEXT CHECK(price_perception IN ('too_expensive', 'fair', 'cheap', 'unsure')),
  missing_features TEXT, -- Comma-separated or free-form
  competitor_considered TEXT, -- Which alternative (CPA, other tool, DIY)
  trust_concerns TEXT, -- Accuracy, privacy, legitimacy, etc.
  timing_reason TEXT, -- Not filing yet, waiting for more info, etc.

  -- Overall sentiment
  would_consider_later BOOLEAN,
  likelihood_to_purchase INTEGER CHECK(likelihood_to_purchase BETWEEN 1 AND 10), -- 1-10 scale

  -- Additional feedback
  additional_feedback TEXT,

  -- Testimonial (if they liked the calculator but didn't buy)
  calculator_rating INTEGER CHECK(calculator_rating BETWEEN 1 AND 5), -- 1-5 stars
  testimonial_text TEXT,
  testimonial_permission TEXT CHECK(testimonial_permission IN ('yes_full_name', 'yes_initials', 'yes_anonymous', 'no')) DEFAULT 'no',

  -- Metadata
  response_source TEXT CHECK(response_source IN ('email_link', 'manual', 'survey')) DEFAULT 'email_link',
  utm_campaign TEXT,
  session_data TEXT, -- JSON: browser, device, etc.

  -- Timestamps
  submitted_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_feedback_responses_user_id ON calculator_feedback_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_email ON calculator_feedback_responses(email);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_submitted_at ON calculator_feedback_responses(submitted_at);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_price_perception ON calculator_feedback_responses(price_perception);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_would_consider ON calculator_feedback_responses(would_consider_later);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_testimonial_permission ON calculator_feedback_responses(testimonial_permission);

-- Create analytics view for feedback campaign performance
CREATE VIEW IF NOT EXISTS calculator_feedback_campaign_stats AS
SELECT
  COUNT(DISTINCT cfr.id) as total_requests_sent,
  COUNT(DISTINCT CASE WHEN cfr.responded = 1 THEN cfr.id END) as total_responses,
  COUNT(DISTINCT CASE WHEN cfr.discount_used = 1 THEN cfr.id END) as total_discounts_used,
  ROUND(CAST(COUNT(DISTINCT CASE WHEN cfr.responded = 1 THEN cfr.id END) AS FLOAT) / COUNT(DISTINCT cfr.id) * 100, 2) as response_rate,
  ROUND(CAST(COUNT(DISTINCT CASE WHEN cfr.discount_used = 1 THEN cfr.id END) AS FLOAT) / COUNT(DISTINCT cfr.id) * 100, 2) as discount_usage_rate,
  ROUND(CAST(COUNT(DISTINCT CASE WHEN cfr.discount_used = 1 THEN cfr.id END) AS FLOAT) / COUNT(DISTINCT CASE WHEN cfr.responded = 1 THEN cfr.id END) * 100, 2) as response_to_conversion_rate,
  COUNT(DISTINCT CASE WHEN cfr.reminder_count > 0 THEN cfr.id END) as total_reminders_sent,
  COUNT(DISTINCT CASE WHEN cfr.responded = 1 AND cfr.reminder_count > 0 THEN cfr.id END) as responses_after_reminder
FROM calculator_feedback_requests cfr;

-- Create view for top reasons why users didn't convert
CREATE VIEW IF NOT EXISTS calculator_feedback_top_reasons AS
SELECT
  stopped_reasons_categorized as reason_category,
  COUNT(*) as response_count,
  ROUND(CAST(COUNT(*) AS FLOAT) / (SELECT COUNT(*) FROM calculator_feedback_responses) * 100, 2) as percentage,
  GROUP_CONCAT(stopped_reason, ' | ') as sample_responses
FROM calculator_feedback_responses
GROUP BY stopped_reasons_categorized
ORDER BY response_count DESC;
