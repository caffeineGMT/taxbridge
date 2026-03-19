/**
 * Re-engagement Email API
 * POST /api/analytics/send-reengagement - Send re-engagement emails to inactive users
 */

import { NextRequest, NextResponse } from 'next/server';
import { getInactiveUsers, markUserContacted, wasRecentlyContacted } from '@/lib/analytics/retention';
import { sendReengagementEmail } from '@/lib/email/reengagement-templates';
import { handleApiError } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysInactive = parseInt(searchParams.get('days') || '7', 10);
    const dryRun = searchParams.get('dryRun') === 'true';
    const maxEmails = parseInt(searchParams.get('maxEmails') || '50', 10);

    // Get inactive users
    const inactiveUsers = getInactiveUsers(daysInactive);

    logger.info(`Found ${inactiveUsers.length} inactive users (${daysInactive}+ days)`);

    // Filter out users who were recently contacted
    const usersToContact = inactiveUsers.filter(user => !wasRecentlyContacted(user.userId, 7));

    logger.info(`${usersToContact.length} users eligible for re-engagement (not contacted in last 7 days)`);

    // Limit to maxEmails to prevent email spam
    const limitedUsers = usersToContact.slice(0, maxEmails);

    const results = {
      totalInactive: inactiveUsers.length,
      eligible: usersToContact.length,
      sent: 0,
      failed: 0,
      skipped: inactiveUsers.length - usersToContact.length,
      dryRun,
      emails: [] as Array<{
        email: string;
        firstName: string;
        status: 'sent' | 'failed' | 'dry-run';
      }>,
    };

    if (dryRun) {
      // Dry run mode - just return what would be sent
      results.emails = limitedUsers.map(user => ({
        email: user.email,
        firstName: user.firstName,
        status: 'dry-run' as const,
      }));

      return NextResponse.json({
        message: 'Dry run completed - no emails sent',
        results,
      });
    }

    // Send re-engagement emails
    for (const user of limitedUsers) {
      try {
        const sent = await sendReengagementEmail({
          email: user.email,
          firstName: user.firstName,
          daysSinceLastActive: user.daysSinceLastActive,
          totalCalculations: user.totalCalculations,
          hasCompletedProfile: user.hasCompletedProfile,
        });

        if (sent) {
          markUserContacted(user.userId, 'inactive_user_nudge');
          results.sent++;
          results.emails.push({
            email: user.email,
            firstName: user.firstName,
            status: 'sent',
          });
        } else {
          results.failed++;
          results.emails.push({
            email: user.email,
            firstName: user.firstName,
            status: 'failed',
          });
        }
      } catch (error) {
        // console.error(`Error sending re-engagement email to ${user.email}:`, error);
        results.failed++;
        results.emails.push({
          email: user.email,
          firstName: user.firstName,
          status: 'failed',
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      message: `Re-engagement campaign completed: ${results.sent} sent, ${results.failed} failed`,
      results,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/analytics/send-reengagement', method: request.method });
  }
}
