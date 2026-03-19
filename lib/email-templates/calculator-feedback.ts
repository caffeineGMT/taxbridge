/**
 * Calculator Non-Converting User Feedback Email Templates
 *
 * Email templates for collecting feedback from users who completed the calculator
 * but didn't convert to paid customers. Offers 20% discount for feedback.
 */

export interface CalculatorFeedbackEmailData {
  firstName: string;
  email: string;
  calculatorCompletedAt: string;
  totalCalculations: number;
  responseTrackingLink: string;
  discountCode: string; // 20% off code
}

/**
 * Initial outreach email asking "What stopped you from purchasing?"
 * Offers 20% discount code for response.
 */
export function getCalculatorFeedbackEmail(data: CalculatorFeedbackEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Quick question: What stopped you? (20% discount inside)`;

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
    .discount-box { background: #fef3c7; border: 3px solid #f59e0b; border-radius: 8px; padding: 25px; margin: 20px 0; text-align: center; }
    .discount-code { font-size: 36px; font-weight: bold; color: #d97706; font-family: monospace; letter-spacing: 3px; padding: 15px; background: white; border-radius: 6px; margin: 15px 0; border: 2px dashed #f59e0b; }
    .discount-details { font-size: 18px; color: #92400e; font-weight: 600; margin-top: 10px; }
    .question { font-size: 18px; font-weight: 600; color: #1f2937; margin: 20px 0; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 16px 36px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; font-size: 16px; }
    .cta-button:hover { background: #5568d3; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .callout { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Hi ${data.firstName} 👋</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.95;">I noticed you used our tax calculator but didn't purchase.</p>
    </div>

    <div class="content">
      <p>You used our calculator ${data.totalCalculations > 1 ? `${data.totalCalculations} times` : 'recently'} on ${data.calculatorCompletedAt}. That tells me you're genuinely interested in solving your cross-border tax problem.</p>

      <p><strong>But you didn't buy.</strong></p>

      <p>I want to understand why. Not to change your mind, but to make TaxBridge better for the next person.</p>

      <div class="question">
        🎯 One question I'm obsessed with:
      </div>

      <p style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; font-size: 16px;">
        <strong>What stopped you from purchasing TaxBridge?</strong>
      </p>

      <p>Was it:</p>
      <ul>
        <li><strong>Price?</strong> Too expensive for what it offered?</li>
        <li><strong>Trust?</strong> Not sure if the calculations were accurate?</li>
        <li><strong>Features?</strong> Missing something you desperately needed?</li>
        <li><strong>Timing?</strong> Just not ready to commit?</li>
        <li><strong>Better alternative?</strong> Found a CPA or another tool?</li>
        <li><strong>Complexity?</strong> Too confusing to use?</li>
      </ul>

      <p><strong>Be brutally honest.</strong> I read every response personally.</p>

      <div class="discount-box">
        <div style="font-size: 24px; margin-bottom: 10px;">🎁 Thank You Gift</div>
        <div class="discount-code">${data.discountCode}</div>
        <div class="discount-details">20% OFF Your First Year</div>
        <p style="margin-top: 15px; color: #92400e; font-size: 14px;">Share your feedback and use this code anytime. Valid for 30 days.</p>
      </div>

      <p style="text-align: center;">
        <a href="${data.responseTrackingLink}" class="cta-button">Share My Feedback (2 minutes)</a>
      </p>

      <div class="callout">
        <strong>Why should you respond?</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Your feedback genuinely helps me fix real problems</li>
          <li>You get 20% off if you decide to try TaxBridge later</li>
          <li>It takes 2 minutes (seriously, just one question)</li>
        </ul>
      </div>

      <p>Thanks for considering it. Even if you never use TaxBridge, your answer helps me build a better product.</p>

      <p style="margin-top: 30px;">
        <strong>Michael Guo</strong><br>
        Founder, TaxBridge<br>
        <a href="mailto:michael@taxbridge.app" style="color: #667eea;">michael@taxbridge.app</a>
      </p>

      <div class="footer">
        <p>TaxBridge · US-Canada Cross-Border Tax Calculator for H-1B/TN Workers</p>
        <p style="font-size: 12px; margin-top: 10px;">
          You're receiving this because you recently used our calculator.<br>
          <a href="mailto:support@taxbridge.app" style="color: #6b7280;">Contact support</a> |
          <a href="{{unsubscribe_url}}" style="color: #6b7280;">Unsubscribe</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Hi ${data.firstName},

I noticed you used our tax calculator but didn't purchase.

You used our calculator ${data.totalCalculations > 1 ? `${data.totalCalculations} times` : 'recently'} on ${data.calculatorCompletedAt}. That tells me you're genuinely interested in solving your cross-border tax problem.

But you didn't buy.

I want to understand why. Not to change your mind, but to make TaxBridge better for the next person.

ONE QUESTION I'M OBSESSED WITH:
What stopped you from purchasing TaxBridge?

Was it:
- Price? Too expensive for what it offered?
- Trust? Not sure if the calculations were accurate?
- Features? Missing something you desperately needed?
- Timing? Just not ready to commit?
- Better alternative? Found a CPA or another tool?
- Complexity? Too confusing to use?

Be brutally honest. I read every response personally.

THANK YOU GIFT:
${data.discountCode}
20% OFF Your First Year

Share your feedback and use this code anytime. Valid for 30 days.

SHARE MY FEEDBACK: ${data.responseTrackingLink}

Why should you respond?
- Your feedback genuinely helps me fix real problems
- You get 20% off if you decide to try TaxBridge later
- It takes 2 minutes (seriously, just one question)

Thanks for considering it. Even if you never use TaxBridge, your answer helps me build a better product.

Michael Guo
Founder, TaxBridge
michael@taxbridge.app

---
TaxBridge · US-Canada Cross-Border Tax Calculator for H-1B/TN Workers
You're receiving this because you recently used our calculator.
Contact support: support@taxbridge.app
Unsubscribe: {{unsubscribe_url}}
  `.trim();

  return { subject, html, text };
}

/**
 * Reminder email for non-responders after 5 days
 */
export function getCalculatorFeedbackReminderEmail(data: CalculatorFeedbackEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `[Reminder] 20% off + your feedback = better product`;

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
    .discount-code { font-size: 24px; font-weight: bold; color: #d97706; font-family: monospace; letter-spacing: 2px; padding: 10px; background: white; border-radius: 6px; margin: 10px 0; text-align: center; border: 2px dashed #f59e0b; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Hi ${data.firstName},</p>

      <p>I sent you an email a few days ago asking for feedback on why you didn't purchase TaxBridge.</p>

      <div class="highlight">
        <strong>TL;DR:</strong> Answer one question, get 20% off for 30 days.<br>
        <strong>Question:</strong> What stopped you from buying TaxBridge?
      </div>

      <p>Your 20% discount code is still valid:</p>
      <div class="discount-code">${data.discountCode}</div>

      <p>I genuinely want to know what held you back. Your answer helps me fix things for the next person.</p>

      <p style="text-align: center;">
        <a href="${data.responseTrackingLink}" class="cta-button">Share My Feedback (1-2 min)</a>
      </p>

      <p>Thanks for considering it.</p>

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

I sent you an email a few days ago asking for feedback on why you didn't purchase TaxBridge.

TL;DR: Answer one question, get 20% off for 30 days.
Question: What stopped you from buying TaxBridge?

Your 20% discount code is still valid:
${data.discountCode}

I genuinely want to know what held you back. Your answer helps me fix things for the next person.

Share my feedback: ${data.responseTrackingLink}

Thanks for considering it.

Michael Guo
Founder, TaxBridge
  `.trim();

  return { subject, html, text };
}

/**
 * Thank you email after feedback submission
 */
export function getCalculatorFeedbackThankYouEmail(data: {
  firstName: string;
  email: string;
  discountCode: string;
}): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Thank you for your feedback! 🙏`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; }
    .discount-reminder { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .code { font-size: 24px; font-weight: bold; color: #d97706; font-family: monospace; letter-spacing: 2px; padding: 10px; background: white; border-radius: 6px; margin-top: 10px; border: 2px dashed #f59e0b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h2>Thank you, ${data.firstName}! 🙏</h2>

      <p>Your feedback was incredibly valuable. I'm reading every response personally and using them to make TaxBridge better.</p>

      <p>Your insights about what held you back will help me fix real problems for the next person.</p>

      <div class="discount-reminder">
        <h3 style="margin: 0 0 10px 0; color: #92400e;">Your 20% Discount Code</h3>
        <div class="code">${data.discountCode}</div>
        <p style="margin-top: 15px; color: #92400e; font-size: 14px;">Valid for 30 days. Use it anytime at <a href="https://taxbridge.app/pricing" style="color: #d97706;">taxbridge.app/pricing</a></p>
      </div>

      <p>If you ever have more feedback or questions, my inbox is always open: <a href="mailto:michael@taxbridge.app">michael@taxbridge.app</a></p>

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

Your insights about what held you back will help me fix real problems for the next person.

YOUR 20% DISCOUNT CODE:
${data.discountCode}

Valid for 30 days. Use it anytime at taxbridge.app/pricing

If you ever have more feedback or questions, my inbox is always open: michael@taxbridge.app

Michael Guo
Founder, TaxBridge
  `.trim();

  return { subject, html, text };
}
