/**
 * Email Template IDs and Dynamic Data Structures
 *
 * SETUP INSTRUCTIONS:
 * 1. Create Dynamic Templates in SendGrid Dashboard (https://app.sendgrid.com/dynamic_templates)
 * 2. Copy the Template IDs and update the constants below
 * 3. Each template should include an unsubscribe link: {{unsubscribe_url}}
 * 4. Test templates with sample data before deploying to production
 */

export const EMAIL_TEMPLATES = {
  // Day 0 - Welcome Email (sent immediately upon signup)
  DRIP_WELCOME: process.env.SENDGRID_TEMPLATE_WELCOME || 'd-placeholder-welcome',

  // Day 3 - Educational Email (explain FTC basics)
  DRIP_DAY3: process.env.SENDGRID_TEMPLATE_DAY3 || 'd-placeholder-day3',

  // Day 7 - Feature Highlight (showcase calculator features)
  DRIP_DAY7: process.env.SENDGRID_TEMPLATE_DAY7 || 'd-placeholder-day7',

  // Day 14 - Upgrade Offer (premium features + discount)
  DRIP_DAY14: process.env.SENDGRID_TEMPLATE_DAY14 || 'd-placeholder-day14',
} as const;

export type EmailTemplateId = typeof EMAIL_TEMPLATES[keyof typeof EMAIL_TEMPLATES];

/**
 * Generate dynamic data for Welcome Email
 */
export function getWelcomeEmailData(params: {
  firstName: string;
  email: string;
}) {
  return {
    first_name: params.firstName || 'there',
    email: params.email,
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    dashboard_url: 'https://taxbridge.app/dashboard',
    rsu_entry_url: 'https://taxbridge.app/rsu-entry',
    support_email: 'support@taxbridge.app',
  };
}

/**
 * Generate dynamic data for Day 3 Email (FTC Education)
 */
export function getDay3EmailData(params: {
  firstName: string;
  email: string;
}) {
  return {
    first_name: params.firstName || 'there',
    email: params.email,
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    ftc_calculator_url: 'https://taxbridge.app/ftc-calculator',
    knowledge_base_url: 'https://taxbridge.app/knowledge-base/ftc-basics',
    treaty_article_url: 'https://taxbridge.app/knowledge-base/treaty-article-xv',
    support_email: 'support@taxbridge.app',
  };
}

/**
 * Generate dynamic data for Day 7 Email (Feature Highlight)
 */
export function getDay7EmailData(params: {
  firstName: string;
  email: string;
}) {
  return {
    first_name: params.firstName || 'there',
    email: params.email,
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    dual_calculator_url: 'https://taxbridge.app/calculator',
    form_checklist_url: 'https://taxbridge.app/forms',
    exchange_rate_url: 'https://taxbridge.app/exchange-rates',
    demo_video_url: 'https://taxbridge.app/demo',
    support_email: 'support@taxbridge.app',
  };
}

/**
 * Generate dynamic data for Day 14 Email (Upgrade Offer)
 */
export function getDay14EmailData(params: {
  firstName: string;
  email: string;
  discountCode?: string;
}) {
  const discountCode = params.discountCode || 'SAVE20';

  return {
    first_name: params.firstName || 'there',
    email: params.email,
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    upgrade_url: `https://taxbridge.app/upgrade?code=${discountCode}`,
    discount_code: discountCode,
    discount_amount: '20%',
    valid_until: getDiscountExpiryDate(),
    premium_features: [
      'Unlimited RSU calculations',
      'Multi-year tax planning',
      'PDF tax reports generation',
      'Priority email support',
      'Tax form pre-fill assistance',
    ],
    pricing_url: 'https://taxbridge.app/pricing',
    support_email: 'support@taxbridge.app',
  };
}

/**
 * Get discount expiry date (7 days from now)
 */
function getDiscountExpiryDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Email content guidelines for creating SendGrid templates:
 *
 * WELCOME EMAIL (drip_welcome):
 * - Subject: "Welcome to TaxBridge - Your Cross-Border Tax Solution"
 * - Greeting: Hi {{first_name}},
 * - Content: Thank you for signing up, quick start guide, what to expect
 * - CTA: Get Started with Your First RSU Entry
 *
 * DAY 3 EMAIL (drip_day3):
 * - Subject: "Understanding Foreign Tax Credits (FTC) - Avoid Double Taxation"
 * - Greeting: Hi {{first_name}},
 * - Content: What is FTC, how it works, treaty Article XV explanation, examples
 * - CTA: Calculate Your Foreign Tax Credit
 *
 * DAY 7 EMAIL (drip_day7):
 * - Subject: "TaxBridge Features You Might Have Missed"
 * - Greeting: Hi {{first_name}},
 * - Content: Feature highlights (dual calculator, forms checklist, exchange rates)
 * - CTA: Explore All Features
 *
 * DAY 14 EMAIL (drip_day14):
 * - Subject: "Special Offer: Save 20% on TaxBridge Premium"
 * - Greeting: Hi {{first_name}},
 * - Content: Premium features, limited-time discount, social proof
 * - CTA: Upgrade Now with Code {{discount_code}}
 * - Urgency: Valid until {{valid_until}}
 */
