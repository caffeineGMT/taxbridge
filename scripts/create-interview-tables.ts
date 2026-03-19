#!/usr/bin/env ts-node

/**
 * Create Interview Campaign Tables
 * Creates only the customer_interviews and related tables needed for the campaign
 */

import { getDatabase } from '../lib/db/unified';
import Database from 'better-sqlite3';

async function createInterviewTables() {
  console.log('📦 Creating interview campaign tables...\n');

  const db = getDatabase() as Database.Database;

  // Customer interviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customer_interviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      interview_type TEXT CHECK(interview_type IN ('video_call', 'survey', 'async')) DEFAULT 'video_call',
      status TEXT CHECK(status IN ('invited', 'scheduled', 'completed', 'declined', 'no_response')) DEFAULT 'invited',
      video_call_url TEXT,
      survey_url TEXT,
      incentive_offered TEXT DEFAULT '$20 Amazon gift card',
      subscription_tier TEXT,
      days_since_subscription INTEGER,
      calculations_completed INTEGER,
      invited_at INTEGER DEFAULT (unixepoch()),
      scheduled_at INTEGER,
      completed_at INTEGER,
      gift_card_sent_at INTEGER,
      gift_card_code TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
    );
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_customer_interviews_user_id ON customer_interviews(user_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_customer_interviews_status ON customer_interviews(status);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_customer_interviews_invited_at ON customer_interviews(invited_at);`);

  // Interview insights table
  db.exec(`
    CREATE TABLE IF NOT EXISTS interview_insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      interview_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      email TEXT NOT NULL,

      -- Problem/Solution insights
      problem_solved TEXT,
      previous_solution TEXT,
      pain_points TEXT,
      time_saved_hours INTEGER,
      money_saved_usd INTEGER,
      emotional_benefit TEXT,
      problem_quote TEXT,

      -- Barrier/Hesitation insights
      hesitation_reason TEXT,
      objection_type TEXT,
      objection_details TEXT,
      what_convinced_them TEXT,
      compared_alternatives TEXT,
      barrier_quote TEXT,

      -- Referral insights
      would_refer_if TEXT,
      referral_motivation TEXT,
      target_audience TEXT,
      already_referred BOOLEAN DEFAULT FALSE,
      referral_count INTEGER DEFAULT 0,
      why_not_referred TEXT,
      referral_quote TEXT,

      -- Feature requests
      magic_wand_feature TEXT,
      most_valuable_feature TEXT,
      missing_features TEXT,
      feature_requests TEXT,

      -- Testimonial
      testimonial_text TEXT,
      testimonial_permission TEXT CHECK(testimonial_permission IN ('yes', 'no', 'anonymous')) DEFAULT 'no',
      testimonial_attribution TEXT,

      -- Metrics
      net_promoter_score INTEGER CHECK(net_promoter_score BETWEEN 0 AND 10),
      subscription_tier TEXT,
      days_since_subscription INTEGER,
      calculations_completed INTEGER,
      interview_duration_minutes INTEGER,
      interview_notes TEXT,

      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (interview_id) REFERENCES customer_interviews(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
    );
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_interview_insights_interview_id ON interview_insights(interview_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_interview_insights_user_id ON interview_insights(user_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_interview_insights_nps ON interview_insights(net_promoter_score);`);

  // Referral messaging table
  db.exec(`
    CREATE TABLE IF NOT EXISTS referral_messaging (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_type TEXT CHECK(message_type IN ('headline', 'social_post', 'email_subject', 'objection_handler')) NOT NULL,
      message_text TEXT NOT NULL,
      source_insight_ids TEXT,
      customer_language BOOLEAN DEFAULT TRUE,
      problem_theme TEXT,
      status TEXT CHECK(status IN ('draft', 'approved', 'published', 'archived')) DEFAULT 'draft',
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_referral_messaging_type ON referral_messaging(message_type);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_referral_messaging_status ON referral_messaging(status);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_referral_messaging_theme ON referral_messaging(problem_theme);`);

  console.log('✅ Tables created successfully!\n');

  // Verify tables exist
  const tables = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name IN ('customer_interviews', 'interview_insights', 'referral_messaging')
    ORDER BY name
  `).all();

  console.log('Verified tables:');
  tables.forEach((table: any) => {
    console.log(`  ✓ ${table.name}`);
  });
  console.log('');
}

createInterviewTables().catch(console.error);
