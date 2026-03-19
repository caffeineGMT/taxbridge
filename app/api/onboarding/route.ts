import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { updateUserProfile } from '@/lib/db';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { province, state, filing_status } = await req.json();

    // Validate inputs
    if (!province || !state || !filing_status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update user profile
    updateUserProfile(userId, {
      canada_province: province,
      us_state: state,
      filing_status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/onboarding', method: req.method });
  }
}
