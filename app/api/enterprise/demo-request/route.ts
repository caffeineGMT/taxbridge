import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import sgMail from '@sendgrid/mail';
import { logger } from '@/lib/logger';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(request: NextRequest) {
  // Rate limiting: public form, strict limits to prevent spam
  const rateLimitResult = await rateLimit(request, RateLimitPresets.STRICT);
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await request.json();
    const {
      firm_name,
      contact_name,
      contact_email,
      contact_phone,
      clients_count,
      current_tax_software,
      pain_points,
    } = body;

    // Validate required fields
    if (!firm_name || !contact_name || !contact_email || !clients_count) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact_email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Insert into database
    const stmt = db.prepare(`
      INSERT INTO enterprise_leads (
        firm_name,
        contact_name,
        contact_email,
        contact_phone,
        clients_count,
        current_tax_software,
        pain_points,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new')
    `);

    const result = stmt.run(
      firm_name,
      contact_name,
      contact_email,
      contact_phone || null,
      clients_count,
      current_tax_software || null,
      pain_points || null
    );

    const leadId = result.lastInsertRowid;

    logger.info('Enterprise demo request received', {
      leadId,
      firm_name,
      contact_email,
      clients_count,
    });

    // Send confirmation email to the lead
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
      try {
        const confirmationEmail = {
          to: contact_email,
          from: process.env.SENDGRID_FROM_EMAIL,
          subject: 'TaxBridge Enterprise Demo Request Received',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">TaxBridge Enterprise</h1>
              </div>

              <div style="padding: 40px; background: #f8fafc;">
                <h2 style="color: #1e293b; margin-top: 0;">Thank you for your interest!</h2>

                <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                  Hi ${contact_name},
                </p>

                <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                  We've received your demo request for <strong>${firm_name}</strong>. Our enterprise sales team will reach out within 24 hours to schedule a personalized demo.
                </p>

                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 30px 0;">
                  <h3 style="color: #1e293b; margin-top: 0;">Your Request Details:</h3>
                  <ul style="color: #475569; line-height: 1.8;">
                    <li><strong>Firm:</strong> ${firm_name}</li>
                    <li><strong>Clients:</strong> ${clients_count}</li>
                    ${current_tax_software ? `<li><strong>Current Software:</strong> ${current_tax_software}</li>` : ''}
                  </ul>
                </div>

                <h3 style="color: #1e293b;">What happens next:</h3>
                <ol style="color: #475569; line-height: 1.8;">
                  <li>A TaxBridge specialist will email you to schedule your 30-minute demo</li>
                  <li>We'll prepare a custom ROI analysis for your firm</li>
                  <li>You'll see how TaxBridge can save you hundreds of hours per year</li>
                </ol>

                <div style="text-align: center; margin-top: 40px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app'}/enterprise/calculator"
                     style="display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
                    Calculate Your ROI
                  </a>
                </div>
              </div>

              <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 14px;">
                <p>Questions? Reply to this email or call us at +1 (555) 123-4567</p>
                <p style="margin-top: 20px;">
                  TaxBridge Enterprise<br>
                  Cross-Border Tax Automation for Immigration Law Firms
                </p>
              </div>
            </div>
          `,
        };

        await sgMail.send(confirmationEmail);
        logger.info('Confirmation email sent', { to: contact_email });
      } catch (emailError) {
        logger.error('Failed to send confirmation email', emailError);
        // Don't fail the request if email fails
      }

      // Send notification to sales team
      if (process.env.SALES_NOTIFICATION_EMAIL) {
        try {
          const salesNotification = {
            to: process.env.SALES_NOTIFICATION_EMAIL,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: `🎯 New Enterprise Lead: ${firm_name} (${clients_count})`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e293b;">New Enterprise Demo Request</h2>

                <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #10b981;">Lead Details</h3>
                  <table style="width: 100%; color: #475569;">
                    <tr>
                      <td style="padding: 8px 0;"><strong>Lead ID:</strong></td>
                      <td>${leadId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;"><strong>Firm:</strong></td>
                      <td>${firm_name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;"><strong>Contact:</strong></td>
                      <td>${contact_name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;"><strong>Email:</strong></td>
                      <td><a href="mailto:${contact_email}">${contact_email}</a></td>
                    </tr>
                    ${contact_phone ? `
                    <tr>
                      <td style="padding: 8px 0;"><strong>Phone:</strong></td>
                      <td><a href="tel:${contact_phone}">${contact_phone}</a></td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 8px 0;"><strong>Clients:</strong></td>
                      <td><strong style="color: #10b981; font-size: 18px;">${clients_count}</strong></td>
                    </tr>
                    ${current_tax_software ? `
                    <tr>
                      <td style="padding: 8px 0;"><strong>Current Software:</strong></td>
                      <td>${current_tax_software}</td>
                    </tr>
                    ` : ''}
                  </table>

                  ${pain_points ? `
                  <div style="margin-top: 20px;">
                    <strong style="color: #1e293b;">Pain Points:</strong>
                    <p style="color: #475569; background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
                      ${pain_points}
                    </p>
                  </div>
                  ` : ''}
                </div>

                <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin: 20px 0;">
                  <strong style="color: #059669;">Action Required:</strong>
                  <p style="color: #047857; margin: 10px 0 0 0;">
                    Contact ${contact_name} within 24 hours to schedule demo.
                  </p>
                </div>

                <p style="color: #94a3b8; font-size: 14px;">
                  Lead captured at: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST
                </p>
              </div>
            `,
          };

          await sgMail.send(salesNotification);
          logger.info('Sales notification sent', { leadId });
        } catch (emailError) {
          logger.error('Failed to send sales notification', emailError);
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        leadId,
        message: 'Demo request received. We will contact you within 24 hours.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error('Error processing demo request', error);
    return NextResponse.json(
      { error: 'Failed to process demo request. Please try again.' },
      { status: 500 }
    );
  }
}
