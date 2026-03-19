-- Migration: Customer Interview Tracking
-- Purpose: Track customer success interviews and insights for referral program messaging

-- Create customer_interviews table (track interview invitations and completions)
CREATE TABLE IF NOT EXISTS customer_interviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,

  -- Interview details
  interview_type TEXT CHECK(interview_type IN ('video_call', 'survey', 'email')) DEFAULT 'video_call',
  status TEXT CHECK(status IN ('invited', 'scheduled', 'completed', 'declined', 'no_response')) DEFAULT 'invited',

  -- Scheduling
  invited_at INTEGER DEFAULT (unixepoch()),
  scheduled_at INTEGER,
  completed_at INTEGER,
  declined_at INTEGER,

  -- Interview format
  video_call_url TEXT,
  survey_url TEXT,
  interviewer TEXT DEFAULT 'Michael Guo', -- founder name

  -- Incentive tracking
  incentive_offered TEXT, -- '$25 Amazon gift card', '2 months free'
  incentive_delivered BOOLEAN DEFAULT 0,
  gift_card_code TEXT,
  gift_card_sent_at INTEGER,

  -- Metadata
  subscription_tier TEXT CHECK(subscription_tier IN ('pro', 'enterprise')),
  days_since_subscription INTEGER,
  calculations_completed INTEGER DEFAULT 0,

  -- Follow-up
  reminder_sent_count INTEGER DEFAULT 0,
  last_reminder_sent_at INTEGER,

  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON customer_interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON customer_interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_invited_at ON customer_interviews(invited_at DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_completed_at ON customer_interviews(completed_at DESC);

-- Create interview_insights table (structured responses from interviews)
CREATE TABLE IF NOT EXISTS interview_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  interview_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,

  -- SECTION 1: Problem We Solved
  problem_solved TEXT, -- Main pain point before TaxBridge
  previous_solution TEXT, -- What they were doing before (CPA, DIY, nothing)
  pain_points TEXT, -- Comma-separated: time, money, complexity, errors, anxiety
  time_saved_hours INTEGER, -- Estimated hours saved
  money_saved_usd INTEGER, -- Estimated $ saved
  emotional_benefit TEXT, -- peace of mind, confidence, relief, etc.
  problem_quote TEXT, -- Best quote about the problem we solved

  -- SECTION 2: Purchase Barriers
  hesitation_reason TEXT, -- What made them hesitate before buying
  objection_type TEXT CHECK(objection_type IN ('price', 'trust', 'complexity', 'value_unclear', 'comparison', 'timing', 'other')),
  objection_details TEXT, -- Details about their objection
  what_convinced_them TEXT, -- What ultimately made them subscribe
  compared_alternatives TEXT, -- Comma-separated: CPA, TurboTax, DIY, other tools
  barrier_quote TEXT, -- Best quote about their hesitation

  -- SECTION 3: Referral Triggers
  would_refer_if TEXT, -- What would make them actively refer friends
  referral_motivation TEXT CHECK(referral_motivation IN ('reward', 'altruism', 'status', 'reciprocity', 'outcome', 'other')),
  target_audience TEXT, -- Who they'd refer to: coworkers, H-1B friends, Reddit, etc.
  already_referred BOOLEAN DEFAULT 0,
  referral_count INTEGER DEFAULT 0,
  why_not_referred TEXT, -- If they haven't referred, why not?
  referral_quote TEXT, -- Best quote about referral motivation

  -- SECTION 4: Feature Requests & Value
  magic_wand_feature TEXT, -- If they could add ONE feature, what would it be?
  most_valuable_feature TEXT, -- What they use most / find most valuable
  missing_features TEXT, -- Comma-separated list
  feature_requests TEXT, -- Detailed feature requests

  -- SECTION 5: Testimonial
  testimonial_text TEXT, -- Full testimonial quote
  testimonial_permission TEXT CHECK(testimonial_permission IN ('yes_full_name', 'yes_initials', 'yes_anonymous', 'no')) DEFAULT 'no',
  testimonial_attribution TEXT, -- "Sarah L., Google (H-1B → Vancouver)"
  net_promoter_score INTEGER CHECK(net_promoter_score BETWEEN 0 AND 10), -- 0-10 NPS

  -- Metadata
  subscription_tier TEXT,
  days_since_subscription INTEGER,
  calculations_completed INTEGER,
  interview_duration_minutes INTEGER,
  interview_notes TEXT, -- Free-form notes from interviewer

  -- Timestamps
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (interview_id) REFERENCES customer_interviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_insights_interview_id ON interview_insights(interview_id);
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON interview_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON interview_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_nps ON interview_insights(net_promoter_score);
CREATE INDEX IF NOT EXISTS idx_insights_testimonial_permission ON interview_insights(testimonial_permission);

-- Create referral_messaging table (generated messaging based on interview insights)
CREATE TABLE IF NOT EXISTS referral_messaging (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Messaging type
  message_type TEXT CHECK(message_type IN (
    'headline', 'email_subject', 'social_post', 'landing_page_hero',
    'value_prop', 'objection_handler', 'testimonial'
  )),

  -- Content
  message_text TEXT NOT NULL,
  message_variant TEXT, -- A/B test variant (A, B, C)

  -- Source data
  source_insight_ids TEXT, -- Comma-separated interview_insights.id that inspired this
  customer_language BOOLEAN DEFAULT 1, -- Uses actual customer quotes/language

  -- Performance tracking
  usage_count INTEGER DEFAULT 0,
  conversion_rate REAL, -- If A/B tested

  -- Categorization
  problem_theme TEXT, -- time_savings, money_savings, complexity, peace_of_mind, cpa_replacement
  audience_segment TEXT, -- h1b_workers, tn_visa, seattle_vancouver, etc.

  -- Status
  status TEXT CHECK(status IN ('draft', 'active', 'archived')) DEFAULT 'draft',

  -- Timestamps
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_referral_messaging_type ON referral_messaging(message_type);
CREATE INDEX IF NOT EXISTS idx_referral_messaging_status ON referral_messaging(status);
CREATE INDEX IF NOT EXISTS idx_referral_messaging_theme ON referral_messaging(problem_theme);
CREATE INDEX IF NOT EXISTS idx_referral_messaging_conversion ON referral_messaging(conversion_rate DESC);
