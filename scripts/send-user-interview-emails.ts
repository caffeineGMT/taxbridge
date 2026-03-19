#!/usr/bin/env tsx
/**
 * Send User Interview Emails
 *
 * Sends personalized user interview emails to all paid customers
 * with $25 Amazon gift card incentive.
 *
 * Usage:
 *   npx tsx scripts/send-user-interview-emails.ts
 *
 * Prerequisites:
 *   1. Run scripts/check-paid-customers.ts first to generate customer list
 *   2. Set SENDGRID_API_KEY in environment
 *   3. Ensure NEXT_PUBLIC_APP_URL is set correctly
 *
 * Flow:
 *   1. Load paid customer list from data/user-interviews/
 *   2. Generate unique tracking link for each customer
 *   3. Send personalized email using SendGrid
 *   4. Track email sent status
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';

interface PaidCustomer {
  customerId: string;
  email: string;
  name: string;
  subscriptionId: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface EmailSentRecord {
  customerId: string;
  email: string;
  sentAt: string;
  trackingLink: string;
  emailType: 'initial' | 'reminder';
}

async function sendUserInterviewEmails() {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.vercel.app';

  if (!sendgridApiKey) {
    console.error('❌ SENDGRID_API_KEY not found in environment');
    console.error('Set it with: export SENDGRID_API_KEY=SG.your_key_here');
    process.exit(1);
  }

  if (sendgridApiKey.includes('placeholder') || sendgridApiKey.includes('YOUR_')) {
    console.error('❌ SENDGRID_API_KEY is a placeholder value');
    console.error('Replace it with a real SendGrid API key from https://app.sendgrid.com/settings/api_keys');
    process.exit(1);
  }

  sgMail.setApiKey(sendgridApiKey);

  // Load customer list
  const customerListDir = path.join(process.cwd(), 'data', 'user-interviews');
  if (!fs.existsSync(customerListDir)) {
    console.error('❌ No customer list found');
    console.error('Run: npx tsx scripts/check-paid-customers.ts first');
    process.exit(1);
  }

  const customerFiles = fs.readdirSync(customerListDir)
    .filter(f => f.startsWith('paid-customers-') && f.endsWith('.json'))
    .sort()
    .reverse(); // Most recent first

  if (customerFiles.length === 0) {
    console.error('❌ No customer list files found');
    console.error('Run: npx tsx scripts/check-paid-customers.ts first');
    process.exit(1);
  }

  const latestFile = path.join(customerListDir, customerFiles[0]);
  console.log(`📂 Loading customers from: ${customerFiles[0]}\n`);

  const customers: PaidCustomer[] = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));

  if (customers.length === 0) {
    console.log('✅ No paid customers found — campaign cannot be executed yet');
    console.log('Wait for first paid customer before running this script');
    return;
  }

  console.log(`👥 Found ${customers.length} paid customer(s)\n`);

  // Load or create sent tracking
  const sentDir = path.join(customerListDir, 'sent');
  if (!fs.existsSync(sentDir)) {
    fs.mkdirSync(sentDir, { recursive: true });
  }

  const sentFile = path.join(sentDir, 'emails-sent.json');
  let sentRecords: EmailSentRecord[] = [];
  if (fs.existsSync(sentFile)) {
    sentRecords = JSON.parse(fs.readFileSync(sentFile, 'utf-8'));
  }

  const sentEmails = new Set(sentRecords.map(r => r.email));

  // Send emails
  let sentCount = 0;
  let skippedCount = 0;

  for (const customer of customers) {
    if (sentEmails.has(customer.email)) {
      console.log(`⏭️  Skipping ${customer.email} (already sent)`);
      skippedCount++;
      continue;
    }

    try {
      // Generate tracking token
      const token = crypto
        .createHash('sha256')
        .update(`${customer.customerId}-user-interview-2026`)
        .digest('hex')
        .slice(0, 16);

      // Build tracking link
      const trackingLink = `${appUrl}/user-interview?` +
        `id=${encodeURIComponent(customer.customerId)}&` +
        `token=${token}&` +
        `email=${encodeURIComponent(customer.email)}&` +
        `name=${encodeURIComponent(customer.name)}&` +
        `plan=${encodeURIComponent(customer.plan)}`;

      // Get first name
      const firstName = customer.name.split(' ')[0] || customer.name;

      // Prepare email
      const subject = `Quick question: What almost stopped you? ($25 gift card inside)`;

      const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .gift-card-box { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .gift-card-amount { font-size: 32px; font-weight: bold; color: #16a34a; }
    .question { font-size: 18px; font-weight: 600; color: #1f2937; margin: 20px 0; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Hi ${firstName} 👋</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.95;">Quick favor? I'll make it worth your time.</p>
    </div>

    <div class="content">
      <div class="gift-card-box">
        <div class="gift-card-amount">$25 Amazon Gift Card</div>
        <p style="margin: 10px 0 0 0; color: #16a34a; font-weight: 500;">For 5 minutes of your honest feedback</p>
      </div>

      <p>You signed up for TaxBridge <strong>${customer.plan}</strong> on ${new Date(customer.createdAt).toLocaleDateString()}.</p>

      <p>I'm trying to make TaxBridge better, and the most valuable insights come from people who actually paid for it (like you).</p>

      <div class="question">
        🎯 One question I'm obsessed with:
      </div>

      <p style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; font-size: 16px;">
        <strong>What almost stopped you from buying TaxBridge?</strong>
      </p>

      <p>I mean the REAL stuff:</p>
      <ul>
        <li>Was the price too high? (be honest)</li>
        <li>Was something confusing or broken?</li>
        <li>Did you almost leave for a competitor?</li>
        <li>Was there a feature you desperately needed that was missing?</li>
        <li>Did the calculator not give you the answer you wanted?</li>
      </ul>

      <p>Whatever your answer is, I want to hear it. The more brutally honest, the better.</p>

      <p style="text-align: center;">
        <a href="${trackingLink}" class="cta-button">Share My Feedback (2-3 min)</a>
      </p>

      <p style="font-size: 14px; color: #6b7280;">
        <strong>The $25 Amazon gift card gets sent to you within 24 hours</strong> of submitting your response. No catches, no strings attached.
      </p>

      <p>Thanks for helping me build a better product,</p>

      <p style="margin-top: 30px;">
        <strong>Michael Guo</strong><br>
        Founder, TaxBridge<br>
        <a href="mailto:michael@taxbridge.app" style="color: #667eea;">michael@taxbridge.app</a>
      </p>

      <div class="footer">
        <p>TaxBridge · US-Canada Cross-Border Tax Calculator for H-1B/TN Workers</p>
        <p style="font-size: 12px; margin-top: 10px;">
          You're receiving this because you're a paid TaxBridge customer.<br>
          <a href="mailto:support@taxbridge.app" style="color: #6b7280;">Contact support</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
      `.trim();

      // Send email
      const msg = {
        to: customer.email,
        from: {
          email: 'michael@taxbridge.app',
          name: 'Michael Guo (TaxBridge Founder)',
        },
        replyTo: 'michael@taxbridge.app',
        subject,
        html: htmlBody,
      };

      await sgMail.send(msg);

      console.log(`✅ Sent to ${customer.email} (${firstName})`);

      // Record sent
      sentRecords.push({
        customerId: customer.customerId,
        email: customer.email,
        sentAt: new Date().toISOString(),
        trackingLink,
        emailType: 'initial',
      });

      sentCount++;

      // Rate limit: wait 1 second between sends
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`❌ Failed to send to ${customer.email}:`, error);
    }
  }

  // Save sent records
  fs.writeFileSync(sentFile, JSON.stringify(sentRecords, null, 2));

  console.log('\n📊 SUMMARY:');
  console.log(`✅ Sent: ${sentCount}`);
  console.log(`⏭️  Skipped (already sent): ${skippedCount}`);
  console.log(`📧 Total emails sent: ${sentRecords.length}`);
  console.log('');
  console.log('NEXT STEPS:');
  console.log('1. Monitor responses in data/user-interviews/responses/');
  console.log('2. Send follow-up reminder in 3 days to non-responders');
  console.log('3. Fulfill gift cards within 24 hours of each response');
  console.log('4. Analyze feedback and create tasks to fix blockers');
}

// Run
sendUserInterviewEmails().catch(console.error);
