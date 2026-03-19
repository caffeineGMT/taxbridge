import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'data', 'taxbridge.db'));

export async function GET(request: NextRequest) {
  try {
    const activity = db
      .prepare(
        `
      SELECT
        e.id,
        p.firm_name,
        e.event_type,
        e.event_timestamp,
        e.email_template
      FROM email_events e
      JOIN enterprise_prospects p ON p.id = e.prospect_id
      ORDER BY e.event_timestamp DESC
      LIMIT 50
    `
      )
      .all();

    return NextResponse.json(activity);
  } catch (error: any) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
