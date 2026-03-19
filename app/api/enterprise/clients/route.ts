/**
 * Enterprise Clients API
 * Handles client management for organizations
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAccess, type RLSContext } from '@/lib/db/middleware';
import {
  getOrgClients,
  createInviteToken,
  type OrgClientFilters,
} from '@/lib/db/queries/enterprise';
import { handleApiError } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

/**
 * GET /api/enterprise/clients
 * Fetch all clients for the admin's organization with optional filters
 */
async function getHandler(
  request: NextRequest,
  context: RLSContext
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    const filters: OrgClientFilters = {
      province: searchParams.get('province') || undefined,
      state: searchParams.get('state') || undefined,
      employer: searchParams.get('employer') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const clients = getOrgClients(context.orgId!, filters);

    return NextResponse.json({ clients });
  } catch (error) {
    return handleApiError(error, { route: '/api/enterprise/clients', method: req.method });
  }
}

/**
 * POST /api/enterprise/clients
 * Invite a new client to the organization
 */
async function postHandler(
  request: NextRequest,
  context: RLSContext
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email, role = 'client' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'member', 'client'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Create invite token
    const invite = createInviteToken(context.orgId!, email, role);

    // In production, send email here via SendGrid/Resend
    // For now, return the invite link
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/enterprise/invite/${invite.token}`;

    // TODO: Send email with invite link
    logger.info(`Invite created for ${email}: ${inviteUrl}`);

    return NextResponse.json({
      success: true,
      inviteUrl,
      message: 'Invitation created successfully',
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/enterprise/clients', method: req.method });
  }
}

export const GET = withAdminAccess(getHandler);
export const POST = withAdminAccess(postHandler);
