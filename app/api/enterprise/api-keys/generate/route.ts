/**
 * POST /api/enterprise/api-keys/generate
 * Generate a new API key for an organization
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserProfileByClerkId } from '@/lib/db';
import { getMemberRole } from '@/lib/db/queries/enterprise';
import { generateApiKey } from '@/lib/api/auth/api-keys';
import { handleApiError } from '@/lib/api-error-handler';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userProfile = await getUserProfileByClerkId(clerkUserId);

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { orgId } = body;

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId is required' },
        { status: 400 }
      );
    }

    // Check if user has admin role
    const role = await getMemberRole(orgId, userProfile.id);

    if (role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Generate new API key
    const apiKey = generateApiKey(orgId);

    return NextResponse.json(
      { api_key: apiKey },
      { status: 200 }
    );
  } catch (error: any) {
    return handleApiError(error, { route: '/api/enterprise/api-keys/generate', method: request.method });
  }
}
