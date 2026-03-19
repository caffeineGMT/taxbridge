import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

const DB_PATH = path.join(process.cwd(), 'data', 'taxbridge.db');

/**
 * POST /api/marketing/capture-lead
 * Captures email leads from marketing pages
 */
export async function POST(request: NextRequest) {
  // Rate limiting: public form, strict limits to prevent spam
  const rateLimitResult = await rateLimit(request, RateLimitPresets.STRICT);
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await request.json();
    const {
      email,
      sourcePage,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      calculationData
    } = body;

    // Validate input
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Initialize database
    const db = new Database(DB_PATH);

    // Create leads table with Google Ads attribution fields
    db.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        source_page TEXT,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        utm_term TEXT,
        rsu_amount REAL,
        ftc_savings REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'new'
      )
    `);

    // Insert lead with attribution data
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO leads (
        email,
        source_page,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        rsu_amount,
        ftc_savings
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      email,
      sourcePage || 'unknown',
      utmSource || null,
      utmMedium || null,
      utmCampaign || null,
      utmTerm || null,
      calculationData?.rsuIncome || null,
      calculationData?.ftcSavings || null
    );
    db.close();

    // Check if the lead was actually inserted (or was duplicate)
    if (result.changes > 0) {
      return NextResponse.json(
        { success: true, message: 'Lead captured successfully' },
        { status: 201 }
      );
    } else {
      // Email already exists
      return NextResponse.json(
        { success: true, message: 'Email already registered' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Failed to capture lead' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/marketing/capture-lead
 * Returns count of leads (for admin purposes)
 */
export async function GET() {
  try {
    const db = new Database(DB_PATH);

    // Ensure table exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        source_page TEXT,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        utm_term TEXT,
        rsu_amount REAL,
        ftc_savings REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'new'
      )
    `);

    const result = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
    db.close();

    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    console.error('Lead count error:', error);
    return NextResponse.json({ error: 'Failed to get lead count' }, { status: 500 });
  }
}
