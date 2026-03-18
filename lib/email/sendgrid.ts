import sgMail from '@sendgrid/mail';

// Initialize SendGrid client
const apiKey = process.env.SENDGRID_API_KEY;

if (!apiKey) {
  console.warn('⚠️  SENDGRID_API_KEY not found in environment variables. Email functionality will be disabled.');
} else {
  sgMail.setApiKey(apiKey);
}

export interface EmailParams {
  to: string;
  templateId: string;
  dynamicData: Record<string, any>;
  from?: {
    email: string;
    name: string;
  };
  replyTo?: string;
}

/**
 * Send an email using SendGrid Dynamic Template
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!apiKey) {
    console.warn(`⚠️  Skipping email send to ${params.to} (SendGrid not configured)`);
    return false;
  }

  const { to, templateId, dynamicData, from, replyTo } = params;

  const msg = {
    to,
    from: from || {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@taxbridge.app',
      name: process.env.SENDGRID_FROM_NAME || 'TaxBridge',
    },
    replyTo: replyTo || process.env.SENDGRID_REPLY_TO || 'support@taxbridge.app',
    templateId,
    dynamicTemplateData: dynamicData,
  };

  try {
    await sgMail.send(msg);
    console.log(`✓ Email sent to ${to} (template: ${templateId})`);
    return true;
  } catch (error: any) {
    console.error(`✗ Failed to send email to ${to}:`, error.response?.body || error.message);
    return false;
  }
}

/**
 * Send bulk emails using SendGrid (batch processing)
 */
export async function sendBulkEmails(emails: EmailParams[]): Promise<number> {
  if (!apiKey) {
    console.warn(`⚠️  Skipping ${emails.length} bulk emails (SendGrid not configured)`);
    return 0;
  }

  let successCount = 0;

  // SendGrid recommends batching in groups of 1000
  const batchSize = 1000;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    const messages = batch.map(email => ({
      to: email.to,
      from: email.from || {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@taxbridge.app',
        name: process.env.SENDGRID_FROM_NAME || 'TaxBridge',
      },
      replyTo: email.replyTo || process.env.SENDGRID_REPLY_TO || 'support@taxbridge.app',
      templateId: email.templateId,
      dynamicTemplateData: email.dynamicData,
    }));

    try {
      await sgMail.send(messages);
      successCount += batch.length;
      console.log(`✓ Sent batch of ${batch.length} emails (${i + batch.length}/${emails.length})`);
    } catch (error: any) {
      console.error(`✗ Failed to send batch:`, error.response?.body || error.message);
    }
  }

  return successCount;
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
