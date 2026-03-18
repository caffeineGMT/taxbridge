/**
 * Row-Level Security (RLS) Middleware
 * Ensures users can only access data within their organization
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { getUserProfileByClerkId } from './index';
import { getMemberRole } from './queries/enterprise';

export interface RLSContext {
  userId: number;
  orgId: number | null;
  role: string | null;
  isAdmin: boolean;
}

/**
 * Get RLS context for the current user
 */
export async function getRLSContext(): Promise<RLSContext | null> {
  const { userId: clerkUserId } = auth();

  if (!clerkUserId) {
    return null;
  }

  const userProfile = getUserProfileByClerkId(clerkUserId);

  if (!userProfile) {
    return null;
  }

  const orgId = userProfile.org_id;
  let role: string | null = null;
  let isAdmin = false;

  if (orgId) {
    role = getMemberRole(orgId, userProfile.id) || null;
    isAdmin = role === 'admin';
  }

  return {
    userId: userProfile.id,
    orgId,
    role,
    isAdmin,
  };
}

/**
 * Higher-order function to wrap API handlers with organization access control
 */
export function withOrgAccess(
  handler: (request: NextRequest, context: RLSContext) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const rlsContext = await getRLSContext();

    if (!rlsContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If endpoint requires org access but user has no org
    if (!rlsContext.orgId) {
      return NextResponse.json(
        { error: 'No organization access' },
        { status: 403 }
      );
    }

    return handler(request, rlsContext);
  };
}

/**
 * Higher-order function to require admin role
 */
export function withAdminAccess(
  handler: (request: NextRequest, context: RLSContext) => Promise<NextResponse>
) {
  return withOrgAccess(async (request: NextRequest, context: RLSContext) => {
    if (!context.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return handler(request, context);
  });
}

/**
 * Validate that requested org_id matches user's context
 */
export function validateOrgAccess(requestedOrgId: number, context: RLSContext): boolean {
  // Admins can access their org
  if (context.isAdmin && context.orgId === requestedOrgId) {
    return true;
  }

  // Members and clients can only access their own org
  if (context.orgId === requestedOrgId) {
    return true;
  }

  return false;
}

/**
 * Validate that user can access specific user data
 */
export function validateUserDataAccess(
  requestedUserId: number,
  context: RLSContext
): boolean {
  // Users can always access their own data
  if (context.userId === requestedUserId) {
    return true;
  }

  // Admins and members can access data of users in their org
  if (context.isAdmin || context.role === 'member') {
    return true;
  }

  return false;
}
