import { getPendingFollowups, markFollowupSent, updateLeadStatus } from '../lib/conferences/leads';
import { getConferenceById, CONFERENCES } from '../lib/conferences/config';
import { generateFollowupEmail } from '../lib/conferences/followup-emails';

const DRY_RUN = process.argv.includes('--dry-run');

async function sendFollowupEmail(emailData: { to: string; subject: string; html: string; text: string }): Promise<boolean> {
  const sgApiKey = process.env.SENDGRID_API_KEY;

  if (!sgApiKey || DRY_RUN) {
    console.log(`  [${DRY_RUN ? 'DRY RUN' : 'NO API KEY'}] Would send to: ${emailData.to}`);
    console.log(`  Subject: ${emailData.subject}`);
    return true;
  }

  try {
    const sgMail = await import('@sendgrid/mail');
    sgMail.default.setApiKey(sgApiKey);
    await sgMail.default.send({
      to: emailData.to,
      from: { email: process.env.SENDGRID_FROM_EMAIL || 'hello@taxbridge.app', name: 'TaxBridge' },
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });
    return true;
  } catch (err) {
    console.error(`  Failed to send to ${emailData.to}:`, err);
    return false;
  }
}

async function main() {
  console.log(`\nConference Follow-up Email Processor`);
  console.log(`${DRY_RUN ? '[DRY RUN MODE]' : '[LIVE MODE]'}`);
  console.log(`${'='.repeat(50)}\n`);

  // Check which conferences have ended (48+ hours ago)
  const now = new Date();
  const eligibleConferences = CONFERENCES.filter(c => {
    const confEnd = new Date(c.date);
    confEnd.setDate(confEnd.getDate() + 3); // Conference lasts ~3 days
    confEnd.setHours(confEnd.getHours() + 48); // 48 hour buffer
    return now >= confEnd;
  });

  if (eligibleConferences.length === 0) {
    console.log('No conferences have reached the 48-hour post-conference window yet.');
    console.log('\nUpcoming conferences:');
    CONFERENCES.forEach(c => {
      console.log(`  - ${c.shortName}: ${c.dateRange} (${c.location})`);
    });
    return;
  }

  const pendingLeads = getPendingFollowups();
  console.log(`Total pending follow-ups: ${pendingLeads.length}\n`);

  let sent = 0;
  let failed = 0;

  for (const conference of eligibleConferences) {
    const confLeads = pendingLeads.filter(l => l.conference_id === conference.id);
    console.log(`\n${conference.shortName} (${conference.location}):`);
    console.log(`  ${confLeads.length} leads pending follow-up\n`);

    for (const lead of confLeads) {
      const email = generateFollowupEmail(lead, conference);
      console.log(`  Sending to ${lead.first_name} ${lead.last_name} <${lead.email}> [${lead.qualification}]`);

      const success = await sendFollowupEmail(email);

      if (success) {
        if (!DRY_RUN) {
          markFollowupSent(lead.id);
          updateLeadStatus(lead.id, 'contacted');
        }
        sent++;
      } else {
        failed++;
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${sent} sent, ${failed} failed`);
  if (DRY_RUN) {
    console.log(`\nRun without --dry-run to actually send emails.`);
  }
}

main().catch(console.error);
