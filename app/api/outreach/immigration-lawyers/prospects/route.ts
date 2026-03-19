import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'data', 'taxbridge.db'));

export async function GET(request: NextRequest) {
  try {
    const prospects = db
      .prepare(
        `
      SELECT
        id,
        firm_name,
        contact_email,
        contact_name,
        city,
        state,
        attorney_count,
        status,
        email_opened,
        email_clicked,
        reply_date,
        demo_scheduled_date,
        last_contact_date,
        last_contact_type
      FROM enterprise_prospects
      ORDER BY
        CASE status
          WHEN 'closed_won' THEN 1
          WHEN 'trial_started' THEN 2
          WHEN 'demo_scheduled' THEN 3
          WHEN 'replied' THEN 4
          WHEN 'clicked' THEN 5
          WHEN 'opened' THEN 6
          WHEN 'contacted' THEN 7
          WHEN 'target' THEN 8
          ELSE 9
        END,
        attorney_count DESC NULLS LAST,
        last_contact_date DESC
    `
      )
      .all();

    return NextResponse.json(prospects);
  } catch (error: any) {
    console.error('Error fetching prospects:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
