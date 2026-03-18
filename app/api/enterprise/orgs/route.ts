/**
 * Enterprise Organizations API
 * Handles organization switching and listing for users
 */

import { NextRequest, NextResponse } from 'next/server';
import { withOrgAccess, type RLSContext } from '@/lib/db/middleware';
import {
  getUserOrganizations,
  switchUserOrg,
  getOrganization,
} from '@/lib/db/queries/enterprise';

/**
 * GET /api/enterprise/orgs
 * Get all organizations the user belongs to
 */
async function getHandler(
  request: NextRequest,
  context: RLSContext
): Promise<NextResponse> {
  try {
    const orgs = getUserOrganizations(context.userId);

    return NextResponse.json({ organizations: orgs });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/enterprise/orgs/switch
 * Switch user's active organization
 */
async function postHandler(
  request: NextRequest,
  context: RLSContext
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { orgId } = body;

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Switch organization
    switchUserOrg(context.userId, orgId);

    // Get the new organization details
    const org = getOrganization(orgId);

    return NextResponse.json({
      success: true,
      organization: org,
    });
  } catch (error) {
    console.error('Error switching organization:', error);
    return NextResponse.json(
      { error: 'Failed to switch organization' },
      { status: 500 }
    );
  }
}

export const GET = withOrgAccess(getHandler);
export const POST = withOrgAccess(postHandler);
