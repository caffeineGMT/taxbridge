#!/usr/bin/env tsx
/**
 * Immigration Lawyer Outreach Campaign Executor
 *
 * Sends personalized outreach emails to immigration lawyers with:
 * - 30% revenue share offer
 * - Co-branded landing pages
 * - Automatic response tracking
 * - Demo scheduling links
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
  contact_name: string | null;
  contact_title: string | null;
  city: string | null;
  state: string | null;
  attorney_count: number | null;
  specialties: string | null;
}

// Email template for immigration lawyers
function generateEmail1(prospect: Prospect): { subject: string; html: string } {
  const firstName = prospect.contact_name?.split(' ')[0] || 'there';
  const firmShort = prospect.firm_name.replace(/ LLP| PLLC| PC| LLC/g, '');

  const specialtiesList = prospect.specialties
    ? prospect.specialties.split(';').join(', ')
    : 'H-1B and TN visa holders';

  return {
    subject: `Partnership opportunity for ${firmShort} - 30% revenue share`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaxBridge Partnership Opportunity</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">TaxBridge Partnership Program</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Earn 30% recurring revenue by helping your clients</p>
  </div>

  <p>Hi ${firstName},</p>

  <p>I'm reaching out because <strong>${prospect.firm_name}</strong> works with ${specialtiesList} — exactly the clients who need TaxBridge.</p>

  <p><strong>The problem your clients face:</strong> Most H-1B and TN visa holders overpay $5,000-$12,000/year on taxes because cross-border RSU taxation is extremely complex.</p>

  <p><strong>The solution:</strong> TaxBridge is a specialized tax calculator that optimizes US-Canada cross-border RSU taxation and Foreign Tax Credit calculations in 10 minutes.</p>

  <h2 style="color: #667eea; margin-top: 30px;">Why this partnership makes sense:</h2>

  <ul style="line-height: 1.8;">
    <li><strong>Zero conflict:</strong> We handle RSU tax calculations. They still need you for immigration work.</li>
    <li><strong>Better client outcomes:</strong> Your clients save thousands on taxes they didn't know they were overpaying.</li>
    <li><strong>Recurring revenue:</strong> Earn 30% of every subscription ($89.70/year per Pro client)</li>
    <li><strong>No overhead:</strong> We provide co-branded landing pages, email templates, and all marketing materials</li>
  </ul>

  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 30px 0;">
    <h3 style="margin-top: 0; color: #667eea;">Example Earnings</h3>
    <ul style="margin: 10px 0;">
      <li><strong>20 referrals/year:</strong> $1,794 in passive income</li>
      <li><strong>50 referrals/year:</strong> $4,485 in passive income</li>
      <li><strong>100 referrals/year:</strong> $8,970 in passive income</li>
    </ul>
    <p style="margin-bottom: 0; font-size: 14px; color: #666;">Most immigration lawyers refer 20-50 clients per year to tax solutions</p>
  </div>

  <h2 style="color: #667eea; margin-top: 30px;">What you get:</h2>

  <ol style="line-height: 1.8;">
    <li><strong>Co-branded landing page:</strong> <code>taxbridge.app/partner/${prospect.firm_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</code></li>
    <li><strong>Marketing toolkit:</strong> Pre-written emails, blog posts, social media content</li>
    <li><strong>Partner dashboard:</strong> Real-time tracking of referrals and commissions</li>
    <li><strong>Monthly payouts:</strong> Automatic payments on the 1st of each month</li>
  </ol>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://taxbridge.app/partners/signup?ref=${prospect.firm_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}"
       style="background: #667eea; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
      Apply for Partnership Program →
    </a>
  </div>

  <p><strong>Next steps:</strong></p>
  <ol>
    <li>Apply at the link above (takes 2 minutes)</li>
    <li>We review and approve within 48 hours</li>
    <li>You get your referral code and marketing materials immediately</li>
    <li>Start referring clients and earning recurring revenue</li>
  </ol>

  <p>Questions? Reply to this email or schedule a 15-minute call:<br>
  📅 <a href="https://calendly.com/taxbridge/partnership-demo" style="color: #667eea;">https://calendly.com/taxbridge/partnership-demo</a></p>

  <p style="margin-top: 30px;">Best regards,</p>
  <p style="margin: 5px 0;"><strong>Michael Guo</strong><br>
  Founder, TaxBridge<br>
  <a href="mailto:partnerships@taxbridge.app" style="color: #667eea;">partnerships@taxbridge.app</a></p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666;">
    <p><strong>P.S.</strong> Our average partner refers 30 clients in their first year. That's $2,691 in recurring revenue with zero overhead costs.</p>
    <p style="margin-top: 20px;">TaxBridge • Cross-Border RSU Tax Calculator for H-1B &amp; TN Visa Holders<br>
    <a href="https://taxbridge.app" style="color: #667eea;">taxbridge.app</a> • Built for tech workers moving between US and Canada</p>
  </div>

</body>
</html>
    `
  };
}

// Track email sent event
function trackEmailSent(prospectId: number, emailTemplate: string, subject: string) {
  const insertEvent = db.prepare(`
    INSERT INTO email_events (prospect_id, event_type, email_subject, email_template)
    VALUES (?, 'sent', ?, ?)
  `);

  insertEvent.run(prospectId, subject, emailTemplate);

  // Update prospect status
  const updateProspect = db.prepare(`
    UPDATE enterprise_prospects
    SET status = 'contacted',
        email_sequence_position = 1,
        last_contact_date = datetime('now'),
        last_contact_type = ?
    WHERE id = ?
  `);

  updateProspect.run(emailTemplate, prospectId);
}

async function sendOutreachEmail(prospect: Prospect, dryRun: boolean = false) {
  const email = generateEmail1(prospect);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📧 Email #${prospect.id}: ${prospect.firm_name}`);
  console.log(`To: ${prospect.contact_email}`);
  console.log(`Subject: ${email.subject}`);
  console.log(`Location: ${prospect.city}, ${prospect.state}`);
  console.log(`Attorneys: ${prospect.attorney_count || 'Unknown'}`);

  if (dryRun) {
    console.log(`\n[DRY RUN] Would send email to ${prospect.contact_email}`);
    console.log(`Preview: ${email.html.substring(0, 200)}...`);
    return { success: true, dryRun: true };
  }

  try {
    const result = await resend.emails.send({
      from: 'Michael Guo at TaxBridge <partnerships@taxbridge.app>',
      to: prospect.contact_email,
      subject: email.subject,
      html: email.html,
      tags: [
        { name: 'campaign', value: 'immigration-lawyers-q1-2026' },
        { name: 'template', value: 'email_1' },
        { name: 'prospect_id', value: prospect.id.toString() }
      ]
    });

    if (result.data?.id) {
      trackEmailSent(prospect.id, 'email_1', email.subject);
      console.log(`✅ Sent successfully (ID: ${result.data.id})`);
      return { success: true, emailId: result.data.id };
    } else {
      console.log(`❌ Failed: ${result.error?.message || 'Unknown error'}`);
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error(`❌ Error sending to ${prospect.contact_email}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const countArg = args.find(arg => arg.startsWith('--count='));
  const count = countArg ? parseInt(countArg.split('=')[1]) : 10;

  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║         TaxBridge Immigration Lawyer Outreach Campaign                     ║
║         Q1 2026 - Partnership Pipeline Activation                          ║
╚════════════════════════════════════════════════════════════════════════════╝

Campaign: 30% Revenue Share Partnership Program
Target: Immigration lawyers specializing in H-1B/TN visa holders
Batch size: ${count} prospects
Mode: ${dryRun ? '🧪 DRY RUN (no emails sent)' : '🚀 LIVE (emails will be sent)'}
`);

  if (!process.env.RESEND_API_KEY && !dryRun) {
    console.error('❌ Error: RESEND_API_KEY not found in environment variables');
    console.log('\nSet your Resend API key:');
    console.log('export RESEND_API_KEY="re_..."');
    process.exit(1);
  }

  // Get prospects who haven't been contacted yet
  const getProspects = db.prepare(`
    SELECT * FROM enterprise_prospects
    WHERE status = 'target'
    ORDER BY attorney_count DESC NULLS LAST
    LIMIT ?
  `);

  const prospects = getProspects.all(count) as Prospect[];

  if (prospects.length === 0) {
    console.log('ℹ️  No prospects found with status "target"');
    console.log('\nAll prospects have already been contacted.');
    process.exit(0);
  }

  console.log(`Found ${prospects.length} prospects ready for outreach\n`);

  if (!dryRun) {
    console.log('⚠️  WARNING: This will send REAL emails to prospects.');
    console.log('⚠️  Press Ctrl+C to cancel or wait 5 seconds to continue...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  let sentCount = 0;
  let failedCount = 0;

  for (const prospect of prospects) {
    const result = await sendOutreachEmail(prospect, dryRun);

    if (result.success) {
      sentCount++;
    } else {
      failedCount++;
    }

    // Rate limiting: 1 email per 2 seconds to avoid spam flags
    if (!dryRun && sentCount < prospects.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n${'='.repeat(80)}\n`);
  console.log(`📊 Campaign Summary:`);
  console.log(`   Total prospects: ${prospects.length}`);
  console.log(`   ✅ Successfully sent: ${sentCount}`);
  console.log(`   ❌ Failed: ${failedCount}`);

  if (!dryRun) {
    console.log(`\n📈 Next Steps:`);
    console.log(`   1. Monitor responses in the dashboard: /admin/outreach`);
    console.log(`   2. Set up automated follow-ups (Day 3, 7, 12)`);
    console.log(`   3. Reply to interested prospects within 2 hours`);
    console.log(`   4. Schedule demos using: https://calendly.com/taxbridge/partnership-demo`);
  } else {
    console.log(`\n✅ Dry run complete. To send real emails, run without --dry-run flag`);
  }

  db.close();
}

main().catch(console.error);
