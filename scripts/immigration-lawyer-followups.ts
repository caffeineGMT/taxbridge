#!/usr/bin/env tsx
/**
 * Automated Follow-Up System for Immigration Lawyer Outreach
 *
 * Sends follow-up emails to prospects based on their engagement level:
 * - Day 3: First follow-up (if no response)
 * - Day 7: Second follow-up (if still no response)
 * - Day 12: Final follow-up (last chance)
 *
 * Smart follow-ups based on engagement:
 * - If opened but didn't reply: "I saw you opened my email..."
 * - If didn't open: "Following up on partnership opportunity..."
 * - If clicked but didn't reply: "I noticed you checked out the calculator..."
 */

import Database from 'better-sqlite3';
import { Resend } from 'resend';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);
const db = new Database(path.join(process.cwd(), 'data', 'taxbridge.db'));

interface Prospect {
  id: number;
  firm_name: string;
  contact_email: string;
  contact_name: string;
  email_opened: number;
  email_clicked: number;
  last_contact_date: string;
  email_sequence_position: number;
}

// Follow-up email templates
function generateFollowUp2(prospect: Prospect): { subject: string; html: string } {
  const firstName = prospect.contact_name?.split(' ')[0] || 'there';
  const firmShort = prospect.firm_name.replace(/ LLP| PLLC| PC| LLC/g, '');

  const openingLine = prospect.email_opened
    ? `I noticed you opened my email about TaxBridge's partnership program last week.`
    : `I wanted to follow up on my email from last week about earning 30% recurring revenue by referring your H-1B/TN clients to TaxBridge.`;

  return {
    subject: `Re: Partnership opportunity for ${firmShort}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <p>Hi ${firstName},</p>

  <p>${openingLine}</p>

  <p><strong>Quick reminder of what we're offering:</strong></p>

  <ul style="line-height: 1.8;">
    <li>30% recurring revenue share ($89.70/year per client)</li>
    <li>Co-branded landing page for ${prospect.firm_name}</li>
    <li>Full marketing toolkit (emails, social posts, blog content)</li>
    <li>Zero conflict with your immigration services</li>
  </ul>

  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
    <p style="margin: 0; font-size: 15px;"><strong>New:</strong> We just onboarded a Seattle-based immigration firm last week. They referred 5 clients in their first 3 days by adding one line to their H-1B approval emails.</p>
  </div>

  <p><strong>Why immigration lawyers love this:</strong></p>
  <ul style="line-height: 1.8;">
    <li>Your clients are <em>already asking</em> about tax optimization — now you have a vetted solution to recommend</li>
    <li>Strengthens your client relationship by helping them save $5K-$12K/year</li>
    <li>Passive income stream that scales with your H-1B practice</li>
  </ul>

  <p>Would it make sense to schedule a quick 15-minute call this week? I can show you:</p>
  <ol>
    <li>The partner dashboard and referral tracking</li>
    <li>How other firms are positioning it to their clients</li>
    <li>The actual marketing materials you'd get</li>
  </ol>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://calendly.com/taxbridge/partnership-demo"
       style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      Book a 15-Minute Call →
    </a>
  </div>

  <p>Or if you prefer, you can apply directly and start referring immediately:<br>
  <a href="https://taxbridgecpa.com/partners/signup" style="color: #667eea;">https://taxbridgecpa.com/partners/signup</a></p>

  <p>Questions? Just hit reply.</p>

  <p style="margin-top: 30px;">Best,<br>
  <strong>Michael</strong><br>
  Founder, TaxBridge</p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666;">
    <p><strong>P.S.</strong> If this isn't a fit for ${firmShort}, no worries at all — just let me know and I won't follow up again.</p>
  </div>

</body>
</html>
    `
  };
}

function generateFollowUp3(prospect: Prospect): { subject: string; html: string } {
  const firstName = prospect.contact_name?.split(' ')[0] || 'there';

  return {
    subject: `Final follow-up - TaxBridge partnership`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <p>Hi ${firstName},</p>

  <p>This is my last email about TaxBridge's partnership program — I don't want to be a pest!</p>

  <p>I wanted to reach out one final time because I genuinely think this could be valuable for ${prospect.firm_name}:</p>

  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Here's what you'd get:</strong></p>
    <ul style="margin: 0; line-height: 1.8;">
      <li>$89.70/year recurring revenue per H-1B/TN client referral</li>
      <li>Co-branded page: taxbridgecpa.com/partner/${prospect.firm_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</li>
      <li>Email templates you can send to clients immediately</li>
      <li>Real-time dashboard showing referrals and earnings</li>
    </ul>
  </div>

  <p><strong>Real example:</strong> One of our partners sent their referral link to 50 H-1B clients in their CRM last month. 12 signed up. That's $1,076/year in passive revenue from a 5-minute email.</p>

  <p>If you're interested, here are two options:</p>

  <ol>
    <li><strong>Quick call:</strong> <a href="https://calendly.com/taxbridge/partnership-demo" style="color: #667eea;">Book 15 minutes</a> and I'll walk you through it</li>
    <li><strong>Self-serve:</strong> <a href="https://taxbridgecpa.com/partners/signup" style="color: #667eea;">Apply here</a> and start referring immediately</li>
  </ol>

  <p>If this isn't a fit, no problem at all — I appreciate you reading this far.</p>

  <p>Either way, best of luck with your practice!</p>

  <p style="margin-top: 30px;">Cheers,<br>
  <strong>Michael Guo</strong><br>
  Founder, TaxBridge<br>
  <a href="mailto:partnerships@taxbridgecpa.com" style="color: #667eea;">partnerships@taxbridgecpa.com</a></p>

</body>
</html>
    `
  };
}

async function sendFollowUp(
  prospect: Prospect,
  emailNumber: number,
  dryRun: boolean = false
): Promise<{ success: boolean; error?: any }> {
  const emailGenerator = emailNumber === 2 ? generateFollowUp2 : generateFollowUp3;
  const email = emailGenerator(prospect);

  console.log(`\n📧 Follow-up #${emailNumber} to: ${prospect.firm_name}`);
  console.log(`   Email: ${prospect.contact_email}`);
  console.log(`   Subject: ${email.subject}`);
  console.log(
    `   Last contact: ${new Date(prospect.last_contact_date).toLocaleDateString()}`
  );
  console.log(`   Opened: ${prospect.email_opened ? 'Yes' : 'No'}`);
  console.log(`   Clicked: ${prospect.email_clicked ? 'Yes' : 'No'}`);

  if (dryRun) {
    console.log(`   [DRY RUN] Would send follow-up email`);
    return { success: true };
  }

  try {
    const result = await resend.emails.send({
      from: 'Michael Guo at TaxBridge <partnerships@taxbridgecpa.com>',
      to: prospect.contact_email,
      subject: email.subject,
      html: email.html,
      tags: [
        { name: 'campaign', value: 'immigration-lawyers-q1-2026' },
        { name: 'template', value: `email_${emailNumber}` },
        { name: 'prospect_id', value: prospect.id.toString() }
      ]
    });

    if (result.data?.id) {
      // Track the email sent
      db.prepare(
        `
        INSERT INTO email_events (prospect_id, event_type, email_subject, email_template)
        VALUES (?, 'sent', ?, ?)
      `
      ).run(prospect.id, email.subject, `email_${emailNumber}`);

      // Update prospect
      db.prepare(
        `
        UPDATE enterprise_prospects
        SET email_sequence_position = ?,
            last_contact_date = datetime('now'),
            last_contact_type = ?
        WHERE id = ?
      `
      ).run(emailNumber, `email_${emailNumber}`, prospect.id);

      console.log(`   ✅ Sent successfully`);
      return { success: true };
    } else {
      console.log(`   ❌ Failed: ${result.error?.message}`);
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error(`   ❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const forceArg = args.find(arg => arg.startsWith('--force-day='));
  const forceDay = forceArg ? parseInt(forceArg.split('=')[1]) : null;

  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║         Automated Follow-Up System                                         ║
║         Immigration Lawyer Partnership Campaign                            ║
╚════════════════════════════════════════════════════════════════════════════╝

Mode: ${dryRun ? '🧪 DRY RUN' : '🚀 LIVE'}
${forceDay ? `Force send: Day ${forceDay} follow-ups\n` : ''}
`);

  if (!process.env.RESEND_API_KEY && !dryRun) {
    console.error('❌ RESEND_API_KEY not found');
    process.exit(1);
  }

  // Find prospects ready for follow-up emails
  const followUp2Query = db.prepare(`
    SELECT *
    FROM enterprise_prospects
    WHERE email_sequence_position = 1
      AND status = 'contacted'
      AND reply_date IS NULL
      AND demo_scheduled_date IS NULL
      AND (
        julianday('now') - julianday(last_contact_date) >= ${forceDay === 3 ? '0' : '3'}
      )
    ORDER BY attorney_count DESC NULLS LAST
    LIMIT 50
  `);

  const followUp3Query = db.prepare(`
    SELECT *
    FROM enterprise_prospects
    WHERE email_sequence_position = 2
      AND status = 'contacted'
      AND reply_date IS NULL
      AND demo_scheduled_date IS NULL
      AND (
        julianday('now') - julianday(last_contact_date) >= ${forceDay === 7 ? '0' : '4'}
      )
    ORDER BY attorney_count DESC NULLS LAST
    LIMIT 50
  `);

  const followUp2Prospects = followUp2Query.all() as Prospect[];
  const followUp3Prospects = followUp3Query.all() as Prospect[];

  console.log(`📊 Follow-up Summary:`);
  console.log(`   Day 3 follow-ups ready: ${followUp2Prospects.length}`);
  console.log(`   Day 7 follow-ups ready: ${followUp3Prospects.length}`);
  console.log();

  if (followUp2Prospects.length === 0 && followUp3Prospects.length === 0) {
    console.log('ℹ️  No prospects ready for follow-up at this time');
    console.log('\nCriteria:');
    console.log('  - Day 3: 3+ days since last contact, no reply');
    console.log('  - Day 7: 4+ days since last follow-up, no reply');
    process.exit(0);
  }

  let sentCount = 0;
  let failedCount = 0;

  // Send Day 3 follow-ups
  if (followUp2Prospects.length > 0) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Sending Day 3 Follow-Ups (${followUp2Prospects.length} prospects)`);
    console.log('='.repeat(80));

    for (const prospect of followUp2Prospects) {
      const result = await sendFollowUp(prospect, 2, dryRun);
      if (result.success) sentCount++;
      else failedCount++;

      if (!dryRun) await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Send Day 7 follow-ups
  if (followUp3Prospects.length > 0) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Sending Day 7 Follow-Ups (${followUp3Prospects.length} prospects)`);
    console.log('='.repeat(80));

    for (const prospect of followUp3Prospects) {
      const result = await sendFollowUp(prospect, 3, dryRun);
      if (result.success) sentCount++;
      else failedCount++;

      if (!dryRun) await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n${'='.repeat(80)}\n`);
  console.log(`✅ Follow-up campaign complete`);
  console.log(`   Sent: ${sentCount}`);
  console.log(`   Failed: ${failedCount}`);

  if (!dryRun) {
    console.log(`\n📊 Monitor responses: /admin/immigration-lawyer-pipeline`);
  }

  db.close();
}

main().catch(console.error);
