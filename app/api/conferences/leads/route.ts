import { NextRequest, NextResponse } from 'next/server';
import { createLead, getLeadsByConference, getLeadByEmail, type CreateLeadInput } from '@/lib/conferences/leads';
import { getConferenceById } from '@/lib/conferences/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { conference_id, first_name, last_name, email, company, title, phone, qualification, notes, badge_scan_data } = body;

    if (!conference_id || !first_name || !last_name || !email) {
      return NextResponse.json({ error: 'Missing required fields: conference_id, first_name, last_name, email' }, { status: 400 });
    }

    const conference = getConferenceById(conference_id);
    if (!conference) {
      return NextResponse.json({ error: 'Invalid conference_id' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const existingLead = getLeadByEmail(email, conference_id);
    if (existingLead) {
      return NextResponse.json({ error: 'Lead already exists for this conference', lead: existingLead }, { status: 409 });
    }

    const input: CreateLeadInput = {
      conference_id,
      first_name,
      last_name,
      email,
      company: company || undefined,
      title: title || undefined,
      phone: phone || undefined,
      qualification: qualification || 'warm',
      notes: notes || undefined,
      badge_scan_data: badge_scan_data || undefined,
      discount_code: conference.discountCode,
    };

    const id = createLead(input);

    return NextResponse.json({ success: true, id, discount_code: conference.discountCode }, { status: 201 });
  } catch (error) {
    console.error('Error creating conference lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conferenceId = searchParams.get('conference_id');

    if (!conferenceId) {
      return NextResponse.json({ error: 'conference_id is required' }, { status: 400 });
    }

    const leads = getLeadsByConference(conferenceId);
    return NextResponse.json({ leads, count: leads.length });
  } catch (error) {
    console.error('Error fetching conference leads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
