/**
 * Newsletter Subscription API
 * Handles email capture from blog popup
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendgrid';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'data', 'taxbridge.db'));

// Initialize newsletter subscribers table
db.exec(`
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    source TEXT NOT NULL,
    lead_magnet TEXT,
    subscribed_at TEXT NOT NULL,
    confirmed BOOLEAN DEFAULT 0,
    unsubscribed BOOLEAN DEFAULT 0
  )
`);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source, leadMagnet } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = db
      .prepare('SELECT * FROM newsletter_subscribers WHERE email = ?')
      .get(email);

    if (existing) {
      return NextResponse.json(
        { message: 'Already subscribed' },
        { status: 200 }
      );
    }

    // Insert subscriber
    db.prepare(
      `INSERT INTO newsletter_subscribers (email, source, lead_magnet, subscribed_at)
       VALUES (?, ?, ?, ?)`
    ).run(email, source, leadMagnet, new Date().toISOString());

    // Send welcome email with lead magnet
    await sendWelcomeEmail(email, leadMagnet);

    return NextResponse.json(
      { message: 'Subscribed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendWelcomeEmail(email: string, leadMagnet?: string) {
  const subject =
    leadMagnet === 'h1b-tax-checklist'
      ? 'Your Free H-1B Tax Checklist is Here!'
      : 'Welcome to TaxBridge!';

  const html =
    leadMagnet === 'h1b-tax-checklist'
      ? getH1BChecklistEmail()
      : getWelcomeEmail();

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

function getH1BChecklistEmail(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px; }
    .content { background: white; padding: 30px; border-radius: 10px; }
    .checklist { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .checklist-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .checklist-item:last-child { border-bottom: none; }
    .cta { background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Your Free H-1B Tax Checklist</h1>
    <p>Everything you need for stress-free tax filing</p>
  </div>

  <div class="content">
    <h2>Hi there! 👋</h2>
    <p>Thanks for subscribing! Here's your complete H-1B tax filing checklist to save you thousands in CPA fees and tax mistakes.</p>

    <div class="checklist">
      <h3>Essential Documents to Gather:</h3>
      <div class="checklist-item">✓ W-2 from your employer (RSU vesting included)</div>
      <div class="checklist-item">✓ 1099-B for stock sales (if you sold RSUs)</div>
      <div class="checklist-item">✓ 1042-S if you had treaty-exempt income</div>
      <div class="checklist-item">✓ Foreign bank account statements (FBAR/8938)</div>
      <div class="checklist-item">✓ Canadian RRSP contribution receipts</div>
      <div class="checklist-item">✓ Rental income records (if applicable)</div>
    </div>

    <div class="checklist">
      <h3>Forms You'll Need to File:</h3>
      <div class="checklist-item">✓ Form 1040 (main tax return)</div>
      <div class="checklist-item">✓ Schedule 1 (additional income)</div>
      <div class="checklist-item">✓ Form 8938 (foreign assets >$50K)</div>
      <div class="checklist-item">✓ FinCEN Form 114 (FBAR, >$10K in foreign accounts)</div>
      <div class="checklist-item">✓ Form 1116 (foreign tax credit)</div>
      <div class="checklist-item">✓ State tax return (if applicable)</div>
    </div>

    <div class="checklist">
      <h3>Common Mistakes to Avoid:</h3>
      <div class="checklist-item">❌ Forgetting to report RSU vesting as income</div>
      <div class="checklist-item">❌ Missing FBAR deadline (separate from tax return!)</div>
      <div class="checklist-item">❌ Not claiming foreign tax credits</div>
      <div class="checklist-item">❌ Incorrect cost basis on stock sales</div>
      <div class="checklist-item">❌ Ignoring state tax obligations</div>
    </div>

    <h3>Ready to Calculate Your Taxes?</h3>
    <p>Stop manually juggling spreadsheets. Our free calculator handles dual-country RSU taxation in under 10 minutes.</p>

    <a href="https://taxbridge.app/us-canada-tax-calculator" class="cta">
      Try Free Calculator →
    </a>

    <p><strong>What you'll get:</strong></p>
    <ul>
      <li>Exact US federal tax calculation</li>
      <li>Canada tax on worldwide income</li>
      <li>Foreign tax credit optimization</li>
      <li>RSU vesting and withholding breakdown</li>
      <li>State tax estimates</li>
      <li>PDF report you can share with your CPA</li>
    </ul>

    <p>💰 <strong>Average savings:</strong> $3,000 in CPA fees + $12,000 in optimized tax planning</p>

    <p>Questions? Just reply to this email. I read every response.</p>

    <p>Best,<br>
    <strong>TaxBridge Team</strong></p>
  </div>

  <div class="footer">
    <p>TaxBridge | Cross-Border Tax Calculator for H-1B & TN Workers</p>
    <p><a href="https://taxbridge.app/unsubscribe?email={EMAIL}">Unsubscribe</a> | <a href="https://taxbridge.app/blog">Blog</a></p>
  </div>
</body>
</html>
  `.replace('{EMAIL}', email);
}

function getWelcomeEmail(): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>Welcome to TaxBridge! 🎉</h1>
  <p>Thanks for subscribing. We'll send you:</p>
  <ul>
    <li>Weekly tax planning tips</li>
    <li>New blog articles on cross-border taxation</li>
    <li>Calculator updates and features</li>
  </ul>
  <p>Start with our <a href="https://taxbridge.app/us-canada-tax-calculator">free calculator</a>.</p>
</body>
</html>
  `;
}
