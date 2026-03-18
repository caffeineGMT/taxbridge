/**
 * Enterprise Invite Token Validation API
 * Handles invite token validation and user association
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import {
  getInviteToken,
  markInviteUsed,
  addOrganizationMember,
  getOrganization,
} from '@/lib/db/queries/enterprise';
import { getUserProfileByClerkId } from '@/lib/db';

interface RouteParams {
  params: Promise<{
    token: string;
  }>;
}

/**
 * GET /api/enterprise/invite/[token]
 * Validate an invite token and return organization details
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { token } = await params;

    const invite = getInviteToken(token);

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    const org = getOrganization(invite.org_id);

    return NextResponse.json({
      valid: true,
      organization: org,
      role: invite.role,
      email: invite.email,
    });
  } catch (error) {
    console.error('Error validating invite:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/enterprise/invite/[token]
 * Accept an invitation and join the organization
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { token } = await params;

    const invite = getInviteToken(token);

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Get user profile
    const userProfile = getUserProfileByClerkId(clerkUserId);

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if email matches (optional validation)
    if (userProfile.email && userProfile.email !== invite.email) {
      return NextResponse.json(
        { error: 'Email mismatch. This invitation is for a different email address.' },
        { status: 403 }
      );
    }

    // Add user to organization
    addOrganizationMember(invite.org_id, userProfile.id, invite.role);

    // Mark invite as used
    markInviteUsed(token);

    const org = getOrganization(invite.org_id);

    return NextResponse.json({
      success: true,
      organization: org,
      message: 'Successfully joined organization',
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
