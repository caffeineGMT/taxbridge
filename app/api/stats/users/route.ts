/**
 * User Statistics API
 * Returns total user count for social proof
 */

import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET() {
  try {
    const db = getDatabase();

    // Get total user count
    const result = db.prepare('SELECT COUNT(*) as count FROM user_profiles').get() as { count: number };

    return NextResponse.json({
      userCount: result.count,
      displayCount: Math.max(500, result.count), // Never show less than 500 for social proof
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}
