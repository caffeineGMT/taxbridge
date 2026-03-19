import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserProfileByClerkId } from '@/lib/db';
import { getUserNotifications, getUnreadCount } from '@/lib/db/notifications';
import { handleApiError } from '@/lib/api-error-handler';

/**
 * GET /api/notifications
 * Get notifications for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserProfileByClerkId(clerkUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const notifications = getUserNotifications(user.id, 10);
    const unreadCount = getUnreadCount(user.id);

    return NextResponse.json({
      notifications,
      unreadCount,
      userId: user.id,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/notifications', method: req.method });
  }
}
