import { NextRequest, NextResponse } from 'next/server';
import { getPendingFollowups, getLeadsByConference, markFollowupSent, updateLeadStatus } from '@/lib/conferences/leads';
import { getConferenceById } from '@/lib/conferences/config';
import { generateFollowupEmail, generateBatchFollowupEmails } from '@/lib/conferences/followup-emails';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conference_id, lead_ids, dry_run = true } = body;

    if (!conference_id) {
      return NextResponse.json({ error: 'conference_id is required' }, { status: 400 });
    }

    const conference = getConferenceById(conference_id);
    if (!conference) {
      return NextResponse.json({ error: 'Invalid conference_id' }, { status: 400 });
    }

    let leads;
    if (lead_ids && Array.isArray(lead_ids)) {
      const allLeads = getLeadsByConference(conference_id);
      leads = allLeads.filter(l => lead_ids.includes(l.id) && !l.followup_sent);
    } else {
      leads = getPendingFollowups().filter(l => l.conference_id === conference_id);
    }

    if (leads.length === 0) {
      return NextResponse.json({ message: 'No pending followups for this conference', sent: 0 });
    }

    const emails = generateBatchFollowupEmails(leads, conference);

    if (dry_run) {
      return NextResponse.json({
        dry_run: true,
        pending_count: emails.length,
        preview: emails.slice(0, 3).map(e => ({
          to: e.to,
          subject: e.subject,
        })),
        message: 'Set dry_run=false to actually send emails',
      });
    }

    // Send emails via SendGrid
    const sgApiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'hello@taxbridge.app';
    let sentCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const lead = leads[i];

      try {
        if (sgApiKey) {
          const sgMail = await import('@sendgrid/mail');
          sgMail.default.setApiKey(sgApiKey);
          await sgMail.default.send({
            to: email.to,
            from: { email: fromEmail, name: 'TaxBridge' },
            subject: email.subject,
            html: email.html,
            text: email.text,
            trackingSettings: {
              clickTracking: { enable: true },
              openTracking: { enable: true },
            },
          });
        } else {
          console.log(`[DRY RUN - No SendGrid key] Would send to: ${email.to}`);
        }

        markFollowupSent(lead.id);
        updateLeadStatus(lead.id, 'contacted');
        sentCount++;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Failed to send to ${email.to}: ${errMsg}`);
        console.error(`Failed to send followup to ${email.to}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error sending followup emails:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conferenceId = searchParams.get('conference_id');

    const pending = getPendingFollowups();
    const filtered = conferenceId
      ? pending.filter(l => l.conference_id === conferenceId)
      : pending;

    return NextResponse.json({
      pending_count: filtered.length,
      leads: filtered.map(l => ({
        id: l.id,
        name: `${l.first_name} ${l.last_name}`,
        email: l.email,
        company: l.company,
        qualification: l.qualification,
        conference_id: l.conference_id,
        created_at: l.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching pending followups:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
