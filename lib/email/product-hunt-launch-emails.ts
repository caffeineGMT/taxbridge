/**
 * Product Hunt Launch Email Templates
 *
 * Pre-launch (24h before), Launch day, and Follow-up emails
 */

export const PRODUCT_HUNT_EMAILS = {
  /**
   * Pre-Launch Email (Send 24 hours before)
   * To: All beta users, early supporters
   */
  preLaunch: {
    subject: "We're launching on Product Hunt tomorrow! 🚀",
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e293b;">Hey {{firstName}},</h1>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Big news! TaxBridge is launching on <strong>Product Hunt tomorrow at 12:01 AM PST</strong> (Tuesday, March 25).
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          As one of our earliest supporters, your upvote would mean the world. It takes just 30 seconds and helps us reach thousands of H-1B/TN workers who desperately need this tool.
        </p>

        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #1e293b;">What to expect tomorrow:</h3>
          <ul style="color: #334155; line-height: 1.8;">
            <li>🕛 <strong>12:01 AM PST:</strong> We go live</li>
            <li>📧 <strong>12:10 AM PST:</strong> You'll get an email with the Product Hunt link</li>
            <li>⬆️ <strong>Takes 30 seconds:</strong> Click link → Upvote → Done</li>
            <li>🎯 <strong>Goal:</strong> Hit #1 Product of the Day</li>
          </ul>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          <strong>Bonus:</strong> Use code <code style="background: #fef3c7; padding: 2px 6px; border-radius: 4px;">HUNT20</code> for 20% off Pro plan (48 hours only).
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Thank you for being part of this journey! 🙏
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Michael<br/>
          <span style="color: #64748b; font-size: 14px;">Founder, TaxBridge</span>
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

        <p style="font-size: 13px; color: #64748b; text-align: center;">
          TaxBridge - Cross-Border Tax Calculator<br/>
          <a href="https://cross-border-tax.vercel.app" style="color: #3b82f6;">cross-border-tax.vercel.app</a>
        </p>
      </div>
    `,
    text: `
Hey {{firstName}},

Big news! TaxBridge is launching on Product Hunt tomorrow at 12:01 AM PST (Tuesday, March 25).

As one of our earliest supporters, your upvote would mean the world. It takes just 30 seconds and helps us reach thousands of H-1B/TN workers who desperately need this tool.

What to expect tomorrow:
- 🕛 12:01 AM PST: We go live
- 📧 12:10 AM PST: You'll get an email with the Product Hunt link
- ⬆️ Takes 30 seconds: Click link → Upvote → Done
- 🎯 Goal: Hit #1 Product of the Day

Bonus: Use code HUNT20 for 20% off Pro plan (48 hours only).

Thank you for being part of this journey! 🙏

Michael
Founder, TaxBridge
    `,
  },

  /**
   * Launch Day Email (Send at 12:10 AM PST on launch day)
   * To: All beta users, early supporters, personal network
   */
  launchDay: {
    subject: "We're live on Product Hunt! 🚀 (Need your support)",
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 32px; text-align: center; border-radius: 8px; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 32px;">🚀 We're Live!</h1>
          <p style="margin: 8px 0 0; font-size: 18px; opacity: 0.9;">TaxBridge is now on Product Hunt</p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Hey {{firstName}},
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          <strong>We're officially live on Product Hunt!</strong>
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Could you take 30 seconds to support us with an upvote? Every vote helps us reach the #1 spot and get in front of thousands of H-1B/TN workers who need this tool.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="{{productHuntUrl}}" style="display: inline-block; background: #da552f; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px;">
            ⬆️ Upvote TaxBridge on Product Hunt
          </a>
        </div>

        <div style="background: #fef3c7; border-left: 4px solid #fbbf24; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #92400e; font-weight: 600;">💰 Limited Launch Offer</p>
          <p style="margin: 8px 0 0; color: #92400e;">
            Use code <strong>HUNT20</strong> for 20% off Pro plan ($299 → $239/year)<br/>
            <span style="font-size: 14px;">Valid for 48 hours only!</span>
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Thank you so much for your support! It truly means the world. 🙏
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Michael<br/>
          <span style="color: #64748b; font-size: 14px;">Founder, TaxBridge</span>
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

        <p style="font-size: 13px; color: #64748b;">
          <strong>P.S.</strong> If you know anyone dealing with US-Canada cross-border taxes (H-1B/TN workers, remote workers, expats), please share!
        </p>

        <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 32px;">
          TaxBridge - Cross-Border Tax Calculator<br/>
          <a href="https://cross-border-tax.vercel.app" style="color: #3b82f6;">cross-border-tax.vercel.app</a>
        </p>
      </div>
    `,
    text: `
🚀 WE'RE LIVE!

Hey {{firstName}},

TaxBridge is officially live on Product Hunt!

Could you take 30 seconds to support us with an upvote? Every vote helps us reach the #1 spot and get in front of thousands of H-1B/TN workers who need this tool.

👉 Upvote here: {{productHuntUrl}}

💰 LIMITED LAUNCH OFFER
Use code HUNT20 for 20% off Pro plan ($299 → $239/year)
Valid for 48 hours only!

Thank you so much for your support! 🙏

Michael
Founder, TaxBridge

P.S. If you know anyone dealing with US-Canada cross-border taxes, please share!

TaxBridge - cross-border-tax.vercel.app
    `,
  },

  /**
   * Follow-Up Email (Send 48 hours after launch)
   * To: People who upvoted/commented but didn't sign up
   */
  followUp: {
    subject: "Thanks for the Product Hunt support! Here's what's next",
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e293b;">Hey {{firstName}},</h1>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Thank you for supporting TaxBridge on Product Hunt! {{upvoteCount}} upvotes later, we {{ranking}}! 🎉
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          I noticed you upvoted but haven't tried the calculator yet. I'd love to get your feedback!
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="https://cross-border-tax.vercel.app/calculator?ref=ph-followup" style="display: inline-block; background: #3b82f6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px;">
            Try the Calculator (Free)
          </a>
        </div>

        <div style="background: #fef3c7; border-left: 4px solid #fbbf24; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #92400e; font-weight: 600;">⏰ HUNT20 code expires in {{hoursLeft}} hours</p>
          <p style="margin: 8px 0 0; color: #92400e;">
            Get 20% off Pro plan: $299 → $239/year
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          <strong>Quick question:</strong> What would make TaxBridge more useful for you?
        </p>

        <ul style="font-size: 16px; line-height: 1.8; color: #334155;">
          <li>Different country pairs (UK-Canada, India-US)?</li>
          <li>Other visa types (L-1, O-1, EB-2)?</li>
          <li>Different equity types (options, ESPP)?</li>
          <li>Something else?</li>
        </ul>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Hit reply and let me know - I read every response personally.
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Michael<br/>
          <span style="color: #64748b; font-size: 14px;">Founder, TaxBridge</span>
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

        <p style="font-size: 13px; color: #64748b; text-align: center;">
          TaxBridge - Cross-Border Tax Calculator<br/>
          <a href="https://cross-border-tax.vercel.app" style="color: #3b82f6;">cross-border-tax.vercel.app</a>
        </p>
      </div>
    `,
    text: `
Hey {{firstName}},

Thank you for supporting TaxBridge on Product Hunt! {{upvoteCount}} upvotes later, we {{ranking}}! 🎉

I noticed you upvoted but haven't tried the calculator yet. I'd love to get your feedback!

👉 Try it free: https://cross-border-tax.vercel.app/calculator

⏰ HUNT20 code expires in {{hoursLeft}} hours
Get 20% off Pro plan: $299 → $239/year

Quick question: What would make TaxBridge more useful for you?
- Different country pairs (UK-Canada, India-US)?
- Other visa types (L-1, O-1, EB-2)?
- Different equity types (options, ESPP)?
- Something else?

Hit reply and let me know - I read every response personally.

Michael
Founder, TaxBridge
    `,
  },

  /**
   * Thank You Email (Send to top upvoters/commenters)
   * To: Top 10-20 most engaged people
   */
  thankYou: {
    subject: "Thank you for making our Product Hunt launch a success! 🙏",
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e293b;">Hey {{firstName}},</h1>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          I wanted to personally thank you for your support during our Product Hunt launch.
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          We hit {{ranking}} with {{upvoteCount}} upvotes, and your early upvote/comment made a huge difference. The Product Hunt algorithm rewards early engagement, so you literally helped us get in front of thousands of people.
        </p>

        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #166534; font-weight: 600;">🎁 Token of Appreciation</p>
          <p style="margin: 8px 0 0; color: #166534;">
            Use code <strong>{{uniqueCode}}</strong> for 30% off Pro plan (normally 20%)<br/>
            <span style="font-size: 14px;">Valid forever, just for you!</span>
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          If there's anything I can do to help YOU with your projects, launches, or just feedback - please don't hesitate to reach out. I'd love to pay it forward.
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Thank you again! 🙏
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Michael<br/>
          <span style="color: #64748b; font-size: 14px;">Founder, TaxBridge</span><br/>
          <a href="mailto:michael@taxbridge.com" style="color: #3b82f6; font-size: 14px;">michael@taxbridge.com</a>
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

        <p style="font-size: 13px; color: #64748b; text-align: center;">
          TaxBridge - Cross-Border Tax Calculator<br/>
          <a href="https://cross-border-tax.vercel.app" style="color: #3b82f6;">cross-border-tax.vercel.app</a>
        </p>
      </div>
    `,
    text: `
Hey {{firstName}},

I wanted to personally thank you for your support during our Product Hunt launch.

We hit {{ranking}} with {{upvoteCount}} upvotes, and your early upvote/comment made a huge difference. The Product Hunt algorithm rewards early engagement, so you literally helped us get in front of thousands of people.

🎁 TOKEN OF APPRECIATION
Use code {{uniqueCode}} for 30% off Pro plan (normally 20%)
Valid forever, just for you!

If there's anything I can do to help YOU with your projects, launches, or just feedback - please don't hesitate to reach out. I'd love to pay it forward.

Thank you again! 🙏

Michael
Founder, TaxBridge
michael@taxbridge.com
    `,
  },
};

/**
 * Email sending utility (integrate with your email service)
 */
export async function sendProductHuntEmail(
  template: keyof typeof PRODUCT_HUNT_EMAILS,
  to: string,
  variables: Record<string, string>
) {
  const emailTemplate = PRODUCT_HUNT_EMAILS[template];

  let html = emailTemplate.html;
  let text = emailTemplate.text;
  let subject = emailTemplate.subject;

  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    html = html.replace(new RegExp(placeholder, 'g'), value);
    text = text.replace(new RegExp(placeholder, 'g'), value);
    subject = subject.replace(new RegExp(placeholder, 'g'), value);
  });

  // TODO: Integrate with Resend, SendGrid, or your email service
  console.log('Sending email:', { to, subject });

  // Example with Resend:
  // await resend.emails.send({
  //   from: 'michael@taxbridge.com',
  //   to,
  //   subject,
  //   html,
  //   text,
  // });

  return { success: true, subject, to };
}
