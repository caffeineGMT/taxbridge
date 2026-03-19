import { NextRequest, NextResponse } from 'next/server';
import { formCompletionQueries } from '@/lib/queries';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formCode } = body;

    if (!formCode || typeof formCode !== 'string') {
      return NextResponse.json(
        { error: 'Form code is required' },
        { status: 400 }
      );
    }

    // For MVP, we'll use user_id = 1 as default user
    const userId = 1;

    const result = formCompletionQueries.toggle(userId, formCode);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/forms/toggle', method: request.method });
  }
}
