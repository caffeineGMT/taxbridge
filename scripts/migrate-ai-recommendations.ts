#!/usr/bin/env tsx

/**
 * Migration: Add AI Tax Recommendations Table
 *
 * Adds tax_recommendations table for storing AI-generated tax optimization
 * recommendations with user feedback tracking.
 */

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'taxbridge.db');

function migrate() {
  console.log('🔄 Running AI recommendations table migration...');

  const db = new Database(DB_PATH);

  try {
    // Create tax_recommendations table
    db.exec(`
      CREATE TABLE IF NOT EXISTS tax_recommendations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_context_hash TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        feedback INTEGER CHECK(feedback IN (-1, 0, 1)) DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for feedback queries
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_recommendations_feedback
      ON tax_recommendations(feedback);
    `);

    // Create index for hash lookups
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_recommendations_hash
      ON tax_recommendations(user_context_hash);
    `);

    console.log('✅ AI recommendations table created successfully');

    // Verify table was created
    const result = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='tax_recommendations'
    `).get();

    if (result) {
      console.log('✅ Verified: tax_recommendations table exists');
    } else {
      throw new Error('Table verification failed');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }

  console.log('🎉 Migration completed successfully');
}

// Run migration
migrate();
