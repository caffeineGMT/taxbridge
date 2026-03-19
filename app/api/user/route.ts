/**
 * User Profile API
 * Gets or creates the default user profile (MVP single-user mode)
 */

import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET() {
  try {
    const db = getDatabase();

    // Get or create default user
    let user = db.prepare('SELECT * FROM user_profiles LIMIT 1').get() as any;

    if (!user) {
      // Create default user
      const result = db.prepare(`
        INSERT INTO user_profiles (
          clerk_user_id, email, first_name, last_name, us_state, canada_province,
          filing_status, subscription_tier
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'demo_user',
        'user@example.com',
        'Demo',
        'User',
        'WA',
        'BC',
        'single',
        'free'
      );

      user = db.prepare('SELECT * FROM user_profiles WHERE id = ?').get(result.lastInsertRowid);

      // Track user signup event
      if (user) {
        trackEvent(user.id, 'user_signed_up', {
          email: user.email,
        });
      }
    }

    // Ensure subscription_tier has a default value
    if (!user.subscription_tier) {
      db.prepare('UPDATE user_profiles SET subscription_tier = ? WHERE id = ?').run('free', user.id);
      user.subscription_tier = 'free';
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        usState: user.us_state,
        canadaProvince: user.canada_province,
        filingStatus: user.filing_status,
        subscriptionTier: user.subscription_tier,
        stripeCustomerId: user.stripe_customer_id,
        subscriptionStatus: user.subscription_status,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/user', method: request.method });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    const db = getDatabase();

    // Build update query dynamically
    const allowedFields = [
      'email',
      'first_name',
      'last_name',
      'us_state',
      'canada_province',
      'filing_status',
    ];

    const updatePairs: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updatePairs.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updatePairs.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    values.push(userId);

    db.prepare(`
      UPDATE user_profiles
      SET ${updatePairs.join(', ')}, updated_at = unixepoch()
      WHERE id = ?
    `).run(...values);

    // Check if this is a profile completion (has state and province)
    const user = db.prepare('SELECT * FROM user_profiles WHERE id = ?').get(userId) as any;

    if (user && user.us_state && user.canada_province && updates.us_state && updates.canada_province) {
      // Track profile completion event
      trackEvent(userId, 'profile_completed', {
        province: user.canada_province,
        state: user.us_state,
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error, { route: '/api/user', method: request.method });
  }
}
