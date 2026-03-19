/**
 * User Interview Campaign Database Schema
 *
 * Tables for tracking user interview campaign:
 * - user_interview_invitations: Track who was invited and when
 * - user_interview_bookings: Track scheduled interviews
 * - user_interview_completed: Track completed interviews and gift cards
 */

import { db } from './init';

// Create user_interview_invitations table
db.exec(`
  CREATE TABLE IF NOT EXISTS user_interview_invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,

    -- Calculator usage stats
    first_calculation_at INTEGER NOT NULL,
    last_calculation_at INTEGER NOT NULL,
    total_calculations INTEGER NOT NULL DEFAULT 1,

    -- Invitation tracking
    invitation_sent_at INTEGER NOT NULL,
    reminder_sent_at INTEGER,
    reminder_count INTEGER NOT NULL DEFAULT 0,

    -- Calendly integration
    calendly_link TEXT,
    tracking_token TEXT UNIQUE,

    -- Campaign metadata
    campaign_id TEXT DEFAULT 'q1_2026_user_interviews',
    utm_source TEXT DEFAULT 'email',
    utm_campaign TEXT DEFAULT 'user-interview-campaign',

    -- Status tracking
    status TEXT CHECK(status IN ('invited', 'reminded', 'booked', 'completed', 'declined', 'expired')) DEFAULT 'invited',

    -- Timestamps
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),

    FOREIGN KEY (user_id) REFERENCES user_profiles(id)
  );

  CREATE INDEX IF NOT EXISTS idx_user_interview_invitations_user_id ON user_interview_invitations(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_interview_invitations_email ON user_interview_invitations(email);
  CREATE INDEX IF NOT EXISTS idx_user_interview_invitations_status ON user_interview_invitations(status);
  CREATE INDEX IF NOT EXISTS idx_user_interview_invitations_tracking_token ON user_interview_invitations(tracking_token);
`);

// Create user_interview_bookings table
db.exec(`
  CREATE TABLE IF NOT EXISTS user_interview_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invitation_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,

    -- Interview details
    scheduled_date TEXT NOT NULL, -- ISO 8601 date
    scheduled_time TEXT NOT NULL, -- e.g., "2:00 PM PT"
    scheduled_timestamp INTEGER NOT NULL, -- Unix timestamp
    timezone TEXT DEFAULT 'America/Los_Angeles',

    -- Calendly integration
    calendly_event_id TEXT UNIQUE,
    calendly_invitee_id TEXT,
    zoom_link TEXT,
    reschedule_link TEXT,
    cancel_link TEXT,

    -- Confirmation
    confirmation_sent_at INTEGER,

    -- Reminder (24 hours before)
    reminder_24h_sent_at INTEGER,

    -- Status
    status TEXT CHECK(status IN ('scheduled', 'rescheduled', 'canceled', 'no_show', 'completed')) DEFAULT 'scheduled',

    -- Timestamps
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),

    FOREIGN KEY (invitation_id) REFERENCES user_interview_invitations(id),
    FOREIGN KEY (user_id) REFERENCES user_profiles(id)
  );

  CREATE INDEX IF NOT EXISTS idx_user_interview_bookings_invitation_id ON user_interview_bookings(invitation_id);
  CREATE INDEX IF NOT EXISTS idx_user_interview_bookings_user_id ON user_interview_bookings(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_interview_bookings_scheduled_timestamp ON user_interview_bookings(scheduled_timestamp);
  CREATE INDEX IF NOT EXISTS idx_user_interview_bookings_status ON user_interview_bookings(status);
`);

// Create user_interview_completed table
db.exec(`
  CREATE TABLE IF NOT EXISTS user_interview_completed (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    invitation_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,

    -- Interview details
    interview_date TEXT NOT NULL, -- Actual date conducted
    interview_duration_minutes INTEGER, -- Actual duration

    -- Interview answers (stored as JSON)
    question_1_answer TEXT, -- What problem were you solving?
    question_2_answer TEXT, -- What almost stopped you?
    question_3_answer TEXT, -- What would make you pay?

    -- Notes and insights
    interviewer_notes TEXT,
    key_insights TEXT, -- JSON array of key insights
    user_segment TEXT, -- e.g., "h1b_tech_worker", "tn_visa_cross_border"
    pain_point_category TEXT, -- e.g., "pricing", "trust", "complexity", "features"

    -- Gift card tracking
    gift_card_code TEXT UNIQUE,
    gift_card_amount INTEGER DEFAULT 20,
    gift_card_sent_at INTEGER,
    gift_card_claimed BOOLEAN DEFAULT 0,
    gift_card_claimed_at INTEGER,

    -- Thank you email
    thank_you_sent_at INTEGER,

    -- Follow-up
    follow_up_needed BOOLEAN DEFAULT 0,
    follow_up_notes TEXT,

    -- Timestamps
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),

    FOREIGN KEY (booking_id) REFERENCES user_interview_bookings(id),
    FOREIGN KEY (invitation_id) REFERENCES user_interview_invitations(id),
    FOREIGN KEY (user_id) REFERENCES user_profiles(id)
  );

  CREATE INDEX IF NOT EXISTS idx_user_interview_completed_booking_id ON user_interview_completed(booking_id);
  CREATE INDEX IF NOT EXISTS idx_user_interview_completed_user_id ON user_interview_completed(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_interview_completed_interview_date ON user_interview_completed(interview_date);
  CREATE INDEX IF NOT EXISTS idx_user_interview_completed_user_segment ON user_interview_completed(user_segment);
  CREATE INDEX IF NOT EXISTS idx_user_interview_completed_pain_point_category ON user_interview_completed(pain_point_category);
`);

// Create user_interview_insights table (for aggregated insights)
db.exec(`
  CREATE TABLE IF NOT EXISTS user_interview_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Insight details
    insight_text TEXT NOT NULL,
    insight_category TEXT, -- e.g., "pricing", "features", "trust", "ux", "competition"
    insight_severity TEXT CHECK(insight_severity IN ('critical', 'high', 'medium', 'low')),

    -- Source
    source_interview_id INTEGER,
    mentioned_count INTEGER DEFAULT 1,

    -- Actionability
    is_actionable BOOLEAN DEFAULT 1,
    action_needed TEXT,
    action_priority TEXT CHECK(action_priority IN ('p0', 'p1', 'p2', 'p3')),
    action_status TEXT CHECK(action_status IN ('identified', 'planned', 'in_progress', 'completed', 'wont_fix')) DEFAULT 'identified',

    -- Product impact
    affects_conversion BOOLEAN DEFAULT 0,
    estimated_conversion_impact_percent REAL, -- e.g., 5.0 for 5% lift

    -- Timestamps
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),

    FOREIGN KEY (source_interview_id) REFERENCES user_interview_completed(id)
  );

  CREATE INDEX IF NOT EXISTS idx_user_interview_insights_category ON user_interview_insights(insight_category);
  CREATE INDEX IF NOT EXISTS idx_user_interview_insights_severity ON user_interview_insights(insight_severity);
  CREATE INDEX IF NOT EXISTS idx_user_interview_insights_actionable ON user_interview_insights(is_actionable);
  CREATE INDEX IF NOT EXISTS idx_user_interview_insights_action_status ON user_interview_insights(action_status);
`);

console.log('✅ User interview campaign database schema created successfully');

export { db };
