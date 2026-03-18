import { NextRequest, NextResponse } from 'next/server';
import { getLeadById, updateLeadQualification, updateLeadStatus, markFollowupSent, updateLeadRevenue } from '@/lib/conferences/leads';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lead = getLeadById(parseInt(id));

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);
    const body = await request.json();

    const lead = getLeadById(leadId);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (body.qualification) {
      if (!['hot', 'warm', 'cold'].includes(body.qualification)) {
        return NextResponse.json({ error: 'Invalid qualification. Must be hot, warm, or cold' }, { status: 400 });
      }
      updateLeadQualification(leadId, body.qualification);
    }

    if (body.status) {
      const validStatuses = ['new', 'contacted', 'demo_scheduled', 'demo_completed', 'negotiating', 'converted', 'lost'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
      }
      updateLeadStatus(leadId, body.status);
    }

    if (body.followup_sent) {
      markFollowupSent(leadId);
    }

    if (body.revenue !== undefined) {
      updateLeadRevenue(leadId, body.revenue);
    }

    const updated = getLeadById(leadId);
    return NextResponse.json({ lead: updated });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
