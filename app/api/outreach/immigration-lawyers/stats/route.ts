import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { handleApiError } from '@/lib/api-error-handler';

const db = new Database(path.join(process.cwd(), 'data', 'taxbridge.db'));

export async function GET(request: NextRequest) {
  try {
    const stats = db
      .prepare(
        `
      SELECT
        COUNT(*) as total_prospects,
        SUM(CASE WHEN status != 'target' THEN 1 ELSE 0 END) as contacted,
        SUM(CASE WHEN email_opened = 1 THEN 1 ELSE 0 END) as opened,
        SUM(CASE WHEN email_clicked = 1 THEN 1 ELSE 0 END) as clicked,
        SUM(CASE WHEN reply_date IS NOT NULL THEN 1 ELSE 0 END) as replied,
        SUM(CASE WHEN status = 'demo_scheduled' THEN 1 ELSE 0 END) as demo_scheduled,
        SUM(CASE WHEN status = 'trial_started' THEN 1 ELSE 0 END) as trial_started,
        SUM(CASE WHEN status = 'closed_won' THEN 1 ELSE 0 END) as closed_won
      FROM enterprise_prospects
    `
      )
      .get() as any;

    const contacted = stats.contacted || 0;

    const calculatedStats = {
      ...stats,
      open_rate: contacted > 0 ? (stats.opened / contacted) * 100 : 0,
      click_rate: contacted > 0 ? (stats.clicked / contacted) * 100 : 0,
      reply_rate: contacted > 0 ? (stats.replied / contacted) * 100 : 0,
      demo_conversion: stats.replied > 0 ? (stats.demo_scheduled / stats.replied) * 100 : 0
    };

    return NextResponse.json(calculatedStats);
  } catch (error: any) {
    return handleApiError(error, { route: '/api/outreach/immigration-lawyers/stats', method: request.method });
  }
}
