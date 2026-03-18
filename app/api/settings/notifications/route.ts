import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase, getUserProfileByClerkId } from '@/lib/db';

/**
 * GET /api/settings/notifications
 * Get notification preferences for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = getUserProfileByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT
        email_notifications_enabled,
        in_app_notifications_enabled,
        sms_notifications_enabled
      FROM user_profiles
      WHERE id = ?
    `);

    const settings = stmt.get(user.id) as {
      email_notifications_enabled: number;
      in_app_notifications_enabled: number;
      sms_notifications_enabled: number;
    } | undefined;

    return NextResponse.json({
      settings: {
        email_notifications_enabled: settings?.email_notifications_enabled !== 0,
        in_app_notifications_enabled: settings?.in_app_notifications_enabled !== 0,
        sms_notifications_enabled: settings?.sms_notifications_enabled !== 0,
      },
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/notifications
 * Update notification preferences for the current user
 */
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = getUserProfileByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      email_notifications_enabled,
      in_app_notifications_enabled,
      sms_notifications_enabled,
    } = body;

    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE user_profiles
      SET
        email_notifications_enabled = ?,
        in_app_notifications_enabled = ?,
        sms_notifications_enabled = ?,
        updated_at = unixepoch()
      WHERE id = ?
    `);

    stmt.run(
      email_notifications_enabled ? 1 : 0,
      in_app_notifications_enabled ? 1 : 0,
      sms_notifications_enabled ? 1 : 0,
      user.id
    );

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated',
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}
