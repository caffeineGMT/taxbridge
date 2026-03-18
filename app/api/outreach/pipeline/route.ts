/**
 * Outreach Pipeline API
 * GET /api/outreach/pipeline - Get pipeline with filters
 * POST /api/outreach/pipeline - Update prospect status/notes
 * PUT /api/outreach/pipeline - Bulk update prospects
 *
 * Manages immigration law firm outreach pipeline:
 * target -> contacted -> opened -> clicked -> replied -> demo_scheduled -> trial_started -> closed_won
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getProspects,
  getProspectById,
  updateProspect,
  updateProspectStatus,
  getDashboardSummary,
  type EnterpriseProspect,
} from '@/lib/db/queries/enterprise-prospects';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const city = searchParams.get('city') || undefined;
    const state = searchParams.get('state') || undefined;
    const source = searchParams.get('source') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const prospects = getProspects({
      status,
      city,
      state,
      source,
      limit,
      offset,
    });

    const summary = getDashboardSummary();

    return NextResponse.json({
      prospects,
      summary,
      pagination: {
        limit,
        offset,
        total: summary.total_prospects,
      },
    });
  } catch (error) {
    console.error('[Pipeline] Error fetching prospects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prospect_id, action, data } = body;

    if (!prospect_id || !action) {
      return NextResponse.json(
        { error: 'Missing prospect_id or action' },
        { status: 400 }
      );
    }

    const prospect = getProspectById(prospect_id);
    if (!prospect) {
      return NextResponse.json(
        { error: 'Prospect not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'update_status': {
        const validStatuses: EnterpriseProspect['status'][] = [
          'target', 'contacted', 'opened', 'clicked', 'replied',
          'demo_scheduled', 'trial_started', 'closed_won', 'closed_lost',
        ];

        if (!data?.status || !validStatuses.includes(data.status)) {
          return NextResponse.json(
            { error: 'Invalid status' },
            { status: 400 }
          );
        }

        const additionalData: Partial<EnterpriseProspect> = {};

        // Set timestamp fields based on new status
        switch (data.status) {
          case 'contacted':
            additionalData.last_contact_date = new Date().toISOString();
            break;
          case 'replied':
            additionalData.reply_date = new Date().toISOString();
            break;
          case 'demo_scheduled':
            additionalData.demo_scheduled_date = data.demo_date || new Date().toISOString();
            break;
          case 'trial_started':
            additionalData.trial_start_date = new Date().toISOString();
            additionalData.trial_end_date = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case 'closed_won':
            additionalData.closed_won_date = new Date().toISOString();
            additionalData.annual_contract_value = data.acv || 0;
            additionalData.seats_count = data.seats || 0;
            break;
          case 'closed_lost':
            additionalData.closed_lost_date = new Date().toISOString();
            additionalData.closed_lost_reason = data.reason || '';
            break;
        }

        updateProspectStatus(prospect_id, data.status, additionalData);

        return NextResponse.json({
          success: true,
          prospect_id,
          new_status: data.status,
        });
      }

      case 'add_notes': {
        if (!data?.notes) {
          return NextResponse.json(
            { error: 'Missing notes' },
            { status: 400 }
          );
        }

        const existingNotes = prospect.notes || '';
        const timestamp = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const updatedNotes = existingNotes
          ? `${existingNotes}\n[${timestamp}] ${data.notes}`
          : `[${timestamp}] ${data.notes}`;

        updateProspect(prospect_id, { notes: updatedNotes });

        return NextResponse.json({
          success: true,
          prospect_id,
          notes: updatedNotes,
        });
      }

      case 'schedule_demo': {
        if (!data?.demo_date) {
          return NextResponse.json(
            { error: 'Missing demo_date' },
            { status: 400 }
          );
        }

        updateProspectStatus(prospect_id, 'demo_scheduled', {
          demo_scheduled_date: data.demo_date,
          notes: prospect.notes
            ? `${prospect.notes}\n[${new Date().toLocaleDateString()}] Demo scheduled for ${data.demo_date}`
            : `[${new Date().toLocaleDateString()}] Demo scheduled for ${data.demo_date}`,
        });

        return NextResponse.json({
          success: true,
          prospect_id,
          demo_date: data.demo_date,
        });
      }

      case 'start_trial': {
        const trialStart = new Date().toISOString();
        const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

        updateProspectStatus(prospect_id, 'trial_started', {
          trial_start_date: trialStart,
          trial_end_date: trialEnd,
          demo_completed_date: new Date().toISOString(),
        });

        return NextResponse.json({
          success: true,
          prospect_id,
          trial_start: trialStart,
          trial_end: trialEnd,
        });
      }

      case 'convert_to_partner': {
        // Close as won and create affiliate partner
        updateProspectStatus(prospect_id, 'closed_won', {
          closed_won_date: new Date().toISOString(),
          annual_contract_value: data?.acv || 0,
          seats_count: data?.seats || 0,
        });

        return NextResponse.json({
          success: true,
          prospect_id,
          converted: true,
          message: 'Prospect converted. Create affiliate partner via /api/partners/signup.',
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Pipeline] Error updating prospect:', error);
    return NextResponse.json(
      { error: 'Failed to update prospect' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { prospect_ids, action, data } = body;

    if (!prospect_ids || !Array.isArray(prospect_ids) || prospect_ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty prospect_ids array' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action' },
        { status: 400 }
      );
    }

    let updated = 0;

    for (const id of prospect_ids) {
      try {
        if (action === 'bulk_status_update' && data?.status) {
          updateProspectStatus(id, data.status);
          updated++;
        } else if (action === 'bulk_add_notes' && data?.notes) {
          const prospect = getProspectById(id);
          if (prospect) {
            const timestamp = new Date().toLocaleDateString();
            const notes = prospect.notes
              ? `${prospect.notes}\n[${timestamp}] ${data.notes}`
              : `[${timestamp}] ${data.notes}`;
            updateProspect(id, { notes });
            updated++;
          }
        }
      } catch {
        // Skip individual failures in bulk operations
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      total: prospect_ids.length,
    });
  } catch (error) {
    console.error('[Pipeline] Bulk update error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk update' },
      { status: 500 }
    );
  }
}
