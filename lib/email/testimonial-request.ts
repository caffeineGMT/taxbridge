import { sendEmail } from './sendgrid';

export interface TestimonialRequestData {
  firstName: string;
  email: string;
  savingsAmount?: number;
  subscriptionTier: string;
  testimonialUrl: string;
}

/**
 * Send testimonial request email to paid customers
 * Offers 1-month free extension as incentive
 */
export async function sendTestimonialRequest(data: TestimonialRequestData): Promise<boolean> {
  const { firstName, email, savingsAmount, subscriptionTier, testimonialUrl } = data;

  const templateId = process.env.SENDGRID_TESTIMONIAL_REQUEST_TEMPLATE_ID || 'd-testimonial-request';

  return await sendEmail({
    to: email,
    templateId,
    dynamicData: {
      firstName,
      savingsAmount: savingsAmount || 0,
      hasSavings: savingsAmount && savingsAmount > 0,
      subscriptionTier,
      testimonialUrl,
      incentive: '1 month free extension',
    },
  });
}

/**
 * Send testimonial reminder email (follow-up after 7 days)
 */
export async function sendTestimonialReminder(data: TestimonialRequestData): Promise<boolean> {
  const { firstName, email, testimonialUrl } = data;

  const templateId = process.env.SENDGRID_TESTIMONIAL_REMINDER_TEMPLATE_ID || 'd-testimonial-reminder';

  return await sendEmail({
    to: email,
    templateId,
    dynamicData: {
      firstName,
      testimonialUrl,
      incentive: '1 month free extension',
    },
  });
}

/**
 * Send thank you email after testimonial submission
 */
export async function sendTestimonialThankYou(email: string, firstName: string): Promise<boolean> {
  const templateId = process.env.SENDGRID_TESTIMONIAL_THANKYOU_TEMPLATE_ID || 'd-testimonial-thankyou';

  return await sendEmail({
    to: email,
    templateId,
    dynamicData: {
      firstName,
      extensionMonths: 1,
    },
  });
}

/**
 * HTML email templates (for SendGrid dynamic templates)
 * Copy these into SendGrid dashboard
 */
export const TESTIMONIAL_REQUEST_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">TaxBridge</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px; margin-top: 0;">Hi {{firstName}},</p>

    <p>Hope TaxBridge has been helpful for your cross-border tax filing! 🎉</p>

    <p>We'd love to hear about your experience. Would you be willing to share a quick testimonial?</p>

    {{#if hasSavings}}
    <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; font-weight: 600; color: #065f46;">💰 You saved ${{savingsAmount}} on your taxes!</p>
    </div>
    {{/if}}

    <p><strong>We'd love to know:</strong></p>
    <ul style="line-height: 1.8;">
      <li>How much did TaxBridge save you?</li>
      <li>What was your "aha moment" using the calculator?</li>
      <li>Would you recommend it to H-1B friends?</li>
    </ul>

    <p><strong>🎁 As a thank you:</strong> We'll extend your {{subscriptionTier}} subscription by <span style="color: #10b981; font-weight: 600;">1 month FREE</span>!</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{testimonialUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Share Your Story (2 min)</a>
    </div>

    <p style="font-size: 14px; color: #6b7280;">It only takes 2 minutes and helps other H-1B/TN workers discover TaxBridge.</p>

    <p style="margin-top: 30px;">Thanks for being an awesome customer!</p>

    <p style="margin-bottom: 0;">
      <strong>The TaxBridge Team</strong><br>
      <a href="mailto:support@taxbridge.app" style="color: #3b82f6;">support@taxbridge.app</a>
    </p>
  </div>

  <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
    <p>TaxBridge - Cross-Border Tax Made Simple</p>
    <p>
      <a href="{{unsubscribeUrl}}" style="color: #9ca3af;">Unsubscribe</a>
    </p>
  </div>

</body>
</html>
`;

export const TESTIMONIAL_REMINDER_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">TaxBridge</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px; margin-top: 0;">Hi {{firstName}},</p>

    <p>Just a friendly reminder about sharing your TaxBridge experience.</p>

    <p>Your story can help fellow H-1B and TN visa holders navigate cross-border taxes with confidence!</p>

    <p><strong>Still offering:</strong> <span style="color: #10b981; font-weight: 600;">{{incentive}}</span> for a 2-minute testimonial.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{testimonialUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Share Your Story Now</a>
    </div>

    <p style="font-size: 14px; color: #6b7280;">No pressure though - only if you have time!</p>

    <p style="margin-top: 30px;">Thanks,<br><strong>The TaxBridge Team</strong></p>
  </div>

  <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
    <p>
      <a href="{{unsubscribeUrl}}" style="color: #9ca3af;">Unsubscribe</a>
    </p>
  </div>

</body>
</html>
`;
