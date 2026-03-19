/**
 * User Interview Email Templates
 *
 * Email templates for collecting qualitative feedback from paid customers.
 * Focuses on uncovering conversion blockers and friction points.
 */

export interface UserInterviewEmailData {
  firstName: string;
  email: string;
  plan: string;
  signupDate: string;
  responseTrackingLink: string;
}

/**
 * Initial outreach email asking "What almost stopped you from buying?"
 * Offers $25 gift card incentive for response.
 */
export function getUserInterviewEmail(data: UserInterviewEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Quick question: What almost stopped you? ($25 gift card inside)`;

  const html = `
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
    .cta-button:hover { background: #5568d3; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Hi ${data.firstName} 👋</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.95;">Quick favor? I'll make it worth your time.</p>
    </div>

    <div class="content">
      <div class="gift-card-box">
        <div class="gift-card-amount">$25 Amazon Gift Card</div>
        <p style="margin: 10px 0 0 0; color: #16a34a; font-weight: 500;">For 5 minutes of your honest feedback</p>
      </div>

      <p>You signed up for TaxBridge <strong>${data.plan}</strong> on ${data.signupDate}.</p>

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
        <a href="${data.responseTrackingLink}" class="cta-button">Share My Feedback (2-3 min)</a>
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

  const text = `
Hi ${data.firstName},

Quick favor? I'll make it worth your time.

$25 AMAZON GIFT CARD
For 5 minutes of your honest feedback

You signed up for TaxBridge ${data.plan} on ${data.signupDate}.

I'm trying to make TaxBridge better, and the most valuable insights come from people who actually paid for it (like you).

ONE QUESTION I'M OBSESSED WITH:
What almost stopped you from buying TaxBridge?

I mean the REAL stuff:
- Was the price too high? (be honest)
- Was something confusing or broken?
- Did you almost leave for a competitor?
- Was there a feature you desperately needed that was missing?
- Did the calculator not give you the answer you wanted?

Whatever your answer is, I want to hear it. The more brutally honest, the better.

SHARE MY FEEDBACK: ${data.responseTrackingLink}

The $25 Amazon gift card gets sent to you within 24 hours of submitting your response. No catches, no strings attached.

Thanks for helping me build a better product,

Michael Guo
Founder, TaxBridge
michael@taxbridge.app

---
TaxBridge · US-Canada Cross-Border Tax Calculator for H-1B/TN Workers
You're receiving this because you're a paid TaxBridge customer.
Contact support: support@taxbridge.app
  `.trim();

  return { subject, html, text };
}

/**
 * Follow-up email for non-responders after 3 days
 */
export function getUserInterviewReminderEmail(data: UserInterviewEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `[Reminder] $25 for 2 minutes — What almost stopped you?`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; }
    .highlight { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Hi ${data.firstName},</p>

      <p>I sent you an email a few days ago asking about your experience with TaxBridge.</p>

      <div class="highlight">
        <strong>TL;DR:</strong> Answer one question, get $25 Amazon gift card.<br>
        <strong>Question:</strong> What almost stopped you from buying TaxBridge?
      </div>

      <p>I genuinely want to know what friction points you hit. Your answer helps me fix things for the next person.</p>

      <p style="text-align: center;">
        <a href="${data.responseTrackingLink}" class="cta-button">Share My Feedback (2 min)</a>
      </p>

      <p>Gift card sent within 24 hours. Thanks for considering it.</p>

      <p style="margin-top: 30px;">
        <strong>Michael Guo</strong><br>
        Founder, TaxBridge
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Hi ${data.firstName},

I sent you an email a few days ago asking about your experience with TaxBridge.

TL;DR: Answer one question, get $25 Amazon gift card.
Question: What almost stopped you from buying TaxBridge?

I genuinely want to know what friction points you hit. Your answer helps me fix things for the next person.

Share my feedback: ${data.responseTrackingLink}

Gift card sent within 24 hours. Thanks for considering it.

Michael Guo
Founder, TaxBridge
  `.trim();

  return { subject, html, text };
}

/**
 * Thank you email with gift card delivery
 */
export function getUserInterviewThankYouEmail(data: {
  firstName: string;
  email: string;
  giftCardCode: string;
}): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Your $25 Amazon Gift Card — Thank you! 🎁`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; }
    .gift-card { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 30px; margin: 20px 0; text-align: center; }
    .code { font-size: 24px; font-weight: bold; color: #16a34a; font-family: monospace; letter-spacing: 2px; padding: 15px; background: white; border-radius: 6px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h2>Thank you, ${data.firstName}! 🙏</h2>

      <p>Your feedback was incredibly valuable. I'm reading every response personally and using them to make TaxBridge better.</p>

      <div class="gift-card">
        <div style="font-size: 32px; margin-bottom: 10px;">🎁</div>
        <h3 style="margin: 0; color: #16a34a;">Your $25 Amazon Gift Card</h3>
        <div class="code">${data.giftCardCode}</div>
        <p style="margin-top: 15px; color: #16a34a; font-size: 14px;">Redeem at amazon.com/gc/redeem</p>
      </div>

      <p>If you ever have more feedback (good or bad), my inbox is always open: <a href="mailto:michael@taxbridge.app">michael@taxbridge.app</a></p>

      <p style="margin-top: 30px;">
        <strong>Michael Guo</strong><br>
        Founder, TaxBridge
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Thank you, ${data.firstName}!

Your feedback was incredibly valuable. I'm reading every response personally and using them to make TaxBridge better.

YOUR $25 AMAZON GIFT CARD:
${data.giftCardCode}

Redeem at: amazon.com/gc/redeem

If you ever have more feedback (good or bad), my inbox is always open: michael@taxbridge.app

Michael Guo
Founder, TaxBridge
  `.trim();

  return { subject, html, text };
}
