/**
 * User Interview Campaign Email Templates
 *
 * Email templates for recruiting calculator users for 15-minute user interviews.
 * Offers $20 Amazon gift card incentive.
 *
 * PURPOSE: Talk to 10 real users to understand:
 * - What problem were you solving?
 * - What almost stopped you?
 * - What would make you pay?
 */

export interface UserInterviewEmailData {
  firstName: string;
  email: string;
  calculatorCompletedAt: string;
  totalCalculations: number;
  calendlyLink: string; // Booking link for scheduling interview
  interviewTrackingToken: string; // For tracking interview completion
}

/**
 * Initial interview invitation email
 */
export function getUserInterviewInvitationEmail(data: UserInterviewEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Can I ask you 3 questions? ($20 Amazon gift card)`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .gift-card-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 3px solid #f59e0b;
      border-radius: 12px;
      padding: 25px;
      margin: 25px 0;
      text-align: center;
    }
    .gift-amount {
      font-size: 48px;
      font-weight: bold;
      color: #d97706;
      line-height: 1;
      margin: 10px 0;
    }
    .gift-subtitle {
      font-size: 18px;
      color: #92400e;
      font-weight: 600;
      margin-top: 10px;
    }
    .questions-box {
      background: #f3f4f6;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
    }
    .question {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin: 12px 0;
    }
    .cta-button {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 18px 40px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
      margin: 25px 0;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .cta-button:hover {
      background: #059669;
    }
    .time-commitment {
      background: #eff6ff;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .callout {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin: 20px 0;
    }
    ul { margin: 10px 0; padding-left: 20px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Hi ${data.firstName} 👋</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 16px;">
        You used our calculator ${data.totalCalculations > 1 ? `${data.totalCalculations} times` : 'recently'}. Can I ask you 3 quick questions?
      </p>
    </div>

    <div class="content">
      <p>I'm <strong>Michael Guo</strong>, founder of TaxBridge.</p>

      <p>You completed a tax calculation on <strong>${data.calculatorCompletedAt}</strong>, which tells me you're dealing with the H-1B/TN cross-border tax nightmare.</p>

      <p><strong>I want to understand your problem better.</strong></p>

      <p>Not to sell you anything. Not to pitch you. Just to <strong>listen</strong> and learn what you're going through.</p>

      <div class="gift-card-box">
        <div style="font-size: 24px; margin-bottom: 5px;">🎁</div>
        <div class="gift-amount">$20</div>
        <div class="gift-subtitle">Amazon Gift Card</div>
        <p style="margin-top: 15px; color: #92400e; font-size: 14px;">
          For 15 minutes of your time<br>
          Delivered immediately after our call
        </p>
      </div>

      <h3 style="color: #1f2937; font-size: 18px; margin-top: 30px;">Here's what I want to ask:</h3>

      <div class="questions-box">
        <div class="question">1. What problem were you trying to solve when you found TaxBridge?</div>
        <div class="question">2. What almost stopped you from using the calculator?</div>
        <div class="question">3. What would make you pay for a tax tool like this?</div>
      </div>

      <p><strong>That's it. Three questions. 15 minutes.</strong></p>

      <div class="time-commitment">
        <strong>⏱️ 15-minute call</strong><br>
        <span style="font-size: 14px; color: #1e40af;">Pick any time that works for you</span>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${data.calendlyLink}" class="cta-button">
          Schedule My 15-Min Call ($20 Gift Card)
        </a>
      </p>

      <div class="callout">
        <strong>Why should you do this?</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li><strong>$20 Amazon gift card</strong> delivered within 1 hour after the call</li>
          <li><strong>Help 100,000+ H-1B/TN workers</strong> who struggle with the same tax problems you do</li>
          <li><strong>Shape the future</strong> of a tool you might actually use</li>
          <li><strong>Zero pressure</strong> - I'm not selling anything, just listening</li>
        </ul>
      </div>

      <h3 style="color: #1f2937; font-size: 16px; margin-top: 30px;">What happens after you book?</h3>
      <ol style="color: #4b5563; font-size: 14px; line-height: 1.8;">
        <li>Pick a time that works for you (I have slots throughout the week)</li>
        <li>You'll get a Zoom link via email</li>
        <li>We chat for 15 minutes (I ask 3 questions, you share your thoughts)</li>
        <li>I send you a $20 Amazon gift card code within 1 hour</li>
        <li>That's it! No follow-up, no sales pitch</li>
      </ol>

      <p style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #667eea;">
        <strong style="color: #667eea;">Why am I doing this?</strong><br>
        <span style="color: #4b5563; font-size: 14px;">
          I'm trying to understand why 97% of people who use the calculator don't convert to paid customers.
          Is it price? Features? Trust? Something else? Your honest answer helps me fix the real problem.
        </span>
      </p>

      <p style="text-align: center; margin: 35px 0 25px 0;">
        <a href="${data.calendlyLink}" class="cta-button">
          Book My Interview (Get $20 Gift Card)
        </a>
      </p>

      <p style="color: #6b7280; font-size: 14px; text-align: center;">
        No time this week? Reply to this email and let me know when works better.
      </p>

      <p style="margin-top: 40px;">
        Thanks for considering it,
      </p>

      <p style="margin-top: 15px;">
        <strong>Michael Guo</strong><br>
        Founder, TaxBridge<br>
        <a href="mailto:michael@taxbridge.app" style="color: #667eea;">michael@taxbridge.app</a>
      </p>

      <div class="footer">
        <p><strong>TaxBridge</strong> · US-Canada Cross-Border Tax Calculator for H-1B/TN Workers</p>
        <p style="font-size: 12px; margin-top: 10px;">
          You're receiving this because you recently used our tax calculator on ${data.calculatorCompletedAt}.<br>
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

I'm Michael Guo, founder of TaxBridge.

You completed a tax calculation on ${data.calculatorCompletedAt}, which tells me you're dealing with the H-1B/TN cross-border tax nightmare.

I want to understand your problem better.

Not to sell you anything. Not to pitch you. Just to listen and learn what you're going through.

🎁 $20 AMAZON GIFT CARD
For 15 minutes of your time
Delivered immediately after our call

HERE'S WHAT I WANT TO ASK:

1. What problem were you trying to solve when you found TaxBridge?
2. What almost stopped you from using the calculator?
3. What would make you pay for a tax tool like this?

That's it. Three questions. 15 minutes.

⏱️ 15-MINUTE CALL
Pick any time that works for you

SCHEDULE MY CALL: ${data.calendlyLink}

WHY SHOULD YOU DO THIS?

• $20 Amazon gift card delivered within 1 hour after the call
• Help 100,000+ H-1B/TN workers who struggle with the same tax problems you do
• Shape the future of a tool you might actually use
• Zero pressure - I'm not selling anything, just listening

WHAT HAPPENS AFTER YOU BOOK?

1. Pick a time that works for you (I have slots throughout the week)
2. You'll get a Zoom link via email
3. We chat for 15 minutes (I ask 3 questions, you share your thoughts)
4. I send you a $20 Amazon gift card code within 1 hour
5. That's it! No follow-up, no sales pitch

WHY AM I DOING THIS?

I'm trying to understand why 97% of people who use the calculator don't convert to paid customers. Is it price? Features? Trust? Something else? Your honest answer helps me fix the real problem.

BOOK MY INTERVIEW (GET $20 GIFT CARD):
${data.calendlyLink}

No time this week? Reply to this email and let me know when works better.

Thanks for considering it,

Michael Guo
Founder, TaxBridge
michael@taxbridge.app

---
TaxBridge · US-Canada Cross-Border Tax Calculator for H-1B/TN Workers
You're receiving this because you recently used our tax calculator on ${data.calculatorCompletedAt}.
Contact support: support@taxbridge.app
Unsubscribe: {{unsubscribe_url}}
  `.trim();

  return { subject, html, text };
}

/**
 * Reminder email for non-responders after 5 days
 */
export function getUserInterviewReminderEmail(data: UserInterviewEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `[Reminder] $20 for 15 minutes of your time?`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    .highlight {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .gift-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #f59e0b;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .amount {
      font-size: 36px;
      font-weight: bold;
      color: #d97706;
      margin: 10px 0;
    }
    .cta-button {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 16px 36px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
      margin: 20px 0;
      font-size: 16px;
    }
    .cta-button:hover {
      background: #059669;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Hi ${data.firstName},</p>

      <p>I sent you an email a few days ago asking if you'd chat with me for 15 minutes about your experience using our tax calculator.</p>

      <div class="highlight">
        <strong style="font-size: 18px; color: #1f2937;">Quick reminder:</strong><br>
        <p style="margin: 10px 0;">
          📞 <strong>15-minute call</strong><br>
          🎁 <strong>$20 Amazon gift card</strong> (delivered within 1 hour)<br>
          💬 <strong>3 simple questions</strong> about your tax problem
        </p>
      </div>

      <div class="gift-box">
        <div>🎁</div>
        <div class="amount">$20</div>
        <div style="font-size: 16px; color: #92400e; font-weight: 600;">Amazon Gift Card</div>
        <p style="margin-top: 10px; color: #92400e; font-size: 13px;">For 15 minutes • Delivered in 1 hour</p>
      </div>

      <p>I'm trying to understand what makes people hesitate to pay for tax tools. Your honest answer (even if it's brutal) helps me fix the real problem.</p>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${data.calendlyLink}" class="cta-button">
          Book My 15-Min Call ($20 Gift Card)
        </a>
      </p>

      <p style="color: #6b7280; font-size: 14px; text-align: center;">
        No time? Reply to this email and I'll work around your schedule.
      </p>

      <p style="margin-top: 40px;">
        Thanks,
      </p>

      <p style="margin-top: 15px;">
        <strong>Michael Guo</strong><br>
        Founder, TaxBridge<br>
        <a href="mailto:michael@taxbridge.app" style="color: #667eea;">michael@taxbridge.app</a>
      </p>

      <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <a href="{{unsubscribe_url}}" style="color: #9ca3af;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Hi ${data.firstName},

I sent you an email a few days ago asking if you'd chat with me for 15 minutes about your experience using our tax calculator.

QUICK REMINDER:

📞 15-minute call
🎁 $20 Amazon gift card (delivered within 1 hour)
💬 3 simple questions about your tax problem

🎁 $20 AMAZON GIFT CARD
For 15 minutes • Delivered in 1 hour

I'm trying to understand what makes people hesitate to pay for tax tools. Your honest answer (even if it's brutal) helps me fix the real problem.

BOOK MY 15-MIN CALL ($20 GIFT CARD):
${data.calendlyLink}

No time? Reply to this email and I'll work around your schedule.

Thanks,

Michael Guo
Founder, TaxBridge
michael@taxbridge.app

Unsubscribe: {{unsubscribe_url}}
  `.trim();

  return { subject, html, text };
}

/**
 * Interview confirmation email (sent after booking)
 */
export function getInterviewConfirmationEmail(data: {
  firstName: string;
  email: string;
  interviewDate: string;
  interviewTime: string;
  zoomLink: string;
  rescheduleLink: string;
}): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Interview confirmed: ${data.interviewDate} at ${data.interviewTime} ✓`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; }
    .confirmed-box { background: #d1fae5; border: 3px solid #10b981; border-radius: 8px; padding: 25px; margin: 20px 0; text-align: center; }
    .date-time { font-size: 24px; font-weight: bold; color: #065f46; margin: 10px 0; }
    .zoom-button { display: inline-block; background: #3b82f6; color: white; padding: 16px 36px; border-radius: 8px; text-decoration: none; font-weight: 700; margin: 20px 0; font-size: 16px; }
    .questions-preview { background: #f3f4f6; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h2 style="color: #10b981; margin-top: 0;">Interview Confirmed! ✓</h2>

      <p>Hi ${data.firstName},</p>

      <p>Thanks for booking! I'm looking forward to learning about your tax situation.</p>

      <div class="confirmed-box">
        <div style="font-size: 32px; margin-bottom: 10px;">📅</div>
        <div class="date-time">${data.interviewDate}</div>
        <div style="font-size: 18px; color: #065f46; margin-top: 5px;">${data.interviewTime}</div>
        <p style="margin-top: 15px; color: #065f46; font-size: 14px;">15-minute Zoom call</p>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${data.zoomLink}" class="zoom-button">Join Zoom Call</a>
      </p>

      <h3 style="color: #1f2937; font-size: 16px;">What to expect:</h3>

      <div class="questions-preview">
        <p style="margin: 0;"><strong>I'll ask you 3 questions:</strong></p>
        <ol style="margin: 10px 0; padding-left: 20px; color: #4b5563;">
          <li>What problem were you trying to solve when you found TaxBridge?</li>
          <li>What almost stopped you from using the calculator?</li>
          <li>What would make you pay for a tax tool like this?</li>
        </ol>
        <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
          No prep needed - just show up and share your honest thoughts!
        </p>
      </div>

      <h3 style="color: #1f2937; font-size: 16px; margin-top: 30px;">Your $20 Amazon gift card:</h3>
      <p>I'll email you the gift card code <strong>within 1 hour</strong> after our call. No waiting, no forms to fill out.</p>

      <h3 style="color: #1f2937; font-size: 16px; margin-top: 30px;">Need to reschedule?</h3>
      <p>No problem! <a href="${data.rescheduleLink}" style="color: #667eea;">Click here to pick a new time</a>.</p>

      <p style="margin-top: 40px;">See you soon!</p>

      <p style="margin-top: 15px;">
        <strong>Michael Guo</strong><br>
        Founder, TaxBridge<br>
        <a href="mailto:michael@taxbridge.app" style="color: #667eea;">michael@taxbridge.app</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
INTERVIEW CONFIRMED! ✓

Hi ${data.firstName},

Thanks for booking! I'm looking forward to learning about your tax situation.

📅 ${data.interviewDate}
⏰ ${data.interviewTime}
🎥 15-minute Zoom call

JOIN ZOOM CALL:
${data.zoomLink}

WHAT TO EXPECT:

I'll ask you 3 questions:

1. What problem were you trying to solve when you found TaxBridge?
2. What almost stopped you from using the calculator?
3. What would make you pay for a tax tool like this?

No prep needed - just show up and share your honest thoughts!

YOUR $20 AMAZON GIFT CARD:

I'll email you the gift card code within 1 hour after our call. No waiting, no forms to fill out.

NEED TO RESCHEDULE?

No problem! Click here to pick a new time:
${data.rescheduleLink}

See you soon!

Michael Guo
Founder, TaxBridge
michael@taxbridge.app
  `.trim();

  return { subject, html, text };
}

/**
 * Thank you email with gift card (sent after interview)
 */
export function getInterviewThankYouEmail(data: {
  firstName: string;
  email: string;
  giftCardCode: string;
  interviewDate: string;
  keyInsights?: string[]; // What we learned from their answers
}): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Thank you! Here's your $20 Amazon gift card 🎁`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; }
    .gift-card-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 3px solid #f59e0b; border-radius: 12px; padding: 30px; margin: 25px 0; text-align: center; }
    .gift-code { font-size: 28px; font-weight: bold; color: #d97706; font-family: monospace; letter-spacing: 3px; padding: 15px; background: white; border-radius: 6px; margin: 15px 0; border: 2px dashed #f59e0b; word-break: break-all; }
    .redeem-button { display: inline-block; background: #f59e0b; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 15px; }
    .insights-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h2 style="color: #10b981; margin-top: 0;">Thank You! 🙏</h2>

      <p>Hi ${data.firstName},</p>

      <p>Thank you so much for taking the time to chat with me today. Your insights were incredibly valuable!</p>

      <div class="gift-card-box">
        <div style="font-size: 36px; margin-bottom: 10px;">🎁</div>
        <div style="font-size: 20px; color: #92400e; font-weight: 600; margin-bottom: 15px;">Your $20 Amazon Gift Card</div>
        <div class="gift-code">${data.giftCardCode}</div>
        <p style="margin-top: 20px; color: #92400e; font-size: 14px; line-height: 1.6;">
          <strong>To redeem:</strong><br>
          1. Go to <a href="https://www.amazon.com/gc/redeem" style="color: #d97706;">amazon.com/gc/redeem</a><br>
          2. Enter the code above<br>
          3. Apply to your account or send to a friend
        </p>
        <a href="https://www.amazon.com/gc/redeem" class="redeem-button">Redeem on Amazon →</a>
      </div>

      ${data.keyInsights && data.keyInsights.length > 0 ? `
      <div class="insights-box">
        <h3 style="color: #1e40af; margin-top: 0; font-size: 16px;">What I learned from our conversation:</h3>
        <ul style="margin: 10px 0; padding-left: 20px; color: #1e3a8a; line-height: 1.8;">
          ${data.keyInsights.map(insight => `<li>${insight}</li>`).join('')}
        </ul>
        <p style="margin: 15px 0 0 0; color: #1e40af; font-size: 14px;">
          Your feedback will directly influence the next version of TaxBridge!
        </p>
      </div>
      ` : ''}

      <h3 style="color: #1f2937; font-size: 16px; margin-top: 30px;">How your feedback helps:</h3>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li>I now understand the specific pain points H-1B/TN workers face with cross-border taxes</li>
        <li>Your pricing insights help me figure out what's actually fair and valuable</li>
        <li>Your feature requests show me what to build next</li>
        <li>You're literally shaping the product for 100,000+ workers in your situation</li>
      </ul>

      <p style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #10b981;">
        <strong style="color: #059669;">My promise:</strong><br>
        <span style="color: #4b5563; font-size: 14px;">
          Every insight you shared today goes into my product roadmap. I review all interview notes weekly and prioritize features based on what I hear. You'll see your suggestions reflected in future releases.
        </span>
      </p>

      <p>If you ever have more feedback or questions, my inbox is always open: <a href="mailto:michael@taxbridge.app" style="color: #667eea;">michael@taxbridge.app</a></p>

      <p style="margin-top: 40px;">Thanks again for your time!</p>

      <p style="margin-top: 15px;">
        <strong>Michael Guo</strong><br>
        Founder, TaxBridge<br>
        <a href="mailto:michael@taxbridge.app" style="color: #667eea;">michael@taxbridge.app</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
THANK YOU! 🙏

Hi ${data.firstName},

Thank you so much for taking the time to chat with me today. Your insights were incredibly valuable!

🎁 YOUR $20 AMAZON GIFT CARD

${data.giftCardCode}

TO REDEEM:
1. Go to amazon.com/gc/redeem
2. Enter the code above
3. Apply to your account or send to a friend

REDEEM ON AMAZON: https://www.amazon.com/gc/redeem

${data.keyInsights && data.keyInsights.length > 0 ? `
WHAT I LEARNED FROM OUR CONVERSATION:

${data.keyInsights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

Your feedback will directly influence the next version of TaxBridge!
` : ''}

HOW YOUR FEEDBACK HELPS:

• I now understand the specific pain points H-1B/TN workers face with cross-border taxes
• Your pricing insights help me figure out what's actually fair and valuable
• Your feature requests show me what to build next
• You're literally shaping the product for 100,000+ workers in your situation

MY PROMISE:

Every insight you shared today goes into my product roadmap. I review all interview notes weekly and prioritize features based on what I hear. You'll see your suggestions reflected in future releases.

If you ever have more feedback or questions, my inbox is always open: michael@taxbridge.app

Thanks again for your time!

Michael Guo
Founder, TaxBridge
michael@taxbridge.app
  `.trim();

  return { subject, html, text };
}

/**
 * Helper: Generate interview tracking token
 */
export function generateInterviewTrackingToken(params: {
  userId: number;
  email: string;
  timestamp: number;
}): string {
  const crypto = require('crypto');
  const data = `${params.userId}-${params.email}-${params.timestamp}-interview-2026`;
  return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
}

/**
 * Helper: Generate Calendly link with pre-filled data
 */
export function generateCalendlyLink(params: {
  email: string;
  firstName: string;
  lastName?: string;
  interviewTrackingToken: string;
}): string {
  // TODO: Replace with actual Calendly event URL
  const calendlyEventUrl = process.env.CALENDLY_EVENT_URL || 'https://calendly.com/taxbridge/user-interview';

  const queryParams = new URLSearchParams({
    email: params.email,
    first_name: params.firstName,
    last_name: params.lastName || '',
    a1: params.interviewTrackingToken, // Custom field for tracking
  });

  return `${calendlyEventUrl}?${queryParams.toString()}`;
}

/**
 * Helper: Generate Amazon gift card code
 *
 * IMPORTANT: This is a PLACEHOLDER. In production, integrate with:
 * - Amazon Incentives API (https://developer.amazon.com/incentives-api)
 * - Tremendous API (https://www.tremendous.com/)
 * - Rybbon API (https://www.rybbon.net/)
 */
export async function generateAmazonGiftCard(params: {
  amount: number;
  recipientEmail: string;
  recipientName: string;
  interviewId: number;
}): Promise<{ code: string; claimUrl: string }> {
  // TODO: Replace with actual Amazon Incentives API or Tremendous API

  // Placeholder code generation
  const code = `AMZN-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const claimUrl = 'https://www.amazon.com/gc/redeem';

  console.log(`[GIFT CARD] Generated $${params.amount} gift card for ${params.recipientEmail} (${params.recipientName})`);
  console.log(`[GIFT CARD] Code: ${code}`);
  console.log(`[GIFT CARD] Interview ID: ${params.interviewId}`);

  // TODO: In production, call actual API:
  // const response = await fetch('https://api.tremendous.com/api/v2/rewards', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.TREMENDOUS_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     external_id: `interview-${params.interviewId}`,
  //     payment: {
  //       funding_source_id: process.env.TREMENDOUS_FUNDING_SOURCE_ID,
  //     },
  //     reward: {
  //       value: { denomination: params.amount, currency_code: 'USD' },
  //       recipient: {
  //         name: params.recipientName,
  //         email: params.recipientEmail,
  //       },
  //       products: ['AMZN-E-V-STD'], // Amazon.com Gift Card
  //       delivery: {
  //         method: 'EMAIL',
  //       },
  //     },
  //   }),
  // });

  return { code, claimUrl };
}
