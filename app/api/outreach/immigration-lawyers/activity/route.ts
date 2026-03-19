import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { handleApiError } from '@/lib/api-error-handler';

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
    return handleApiError(error, { route: '/api/outreach/immigration-lawyers/activity', method: request.method });
  }
}
