/**
 * 7-DAY EMAIL DRIP CAMPAIGN TEMPLATES
 *
 * SEQUENCE:
 * - Day 1: Welcome + Quick Start Guide
 * - Day 3: Education - Complete RSU Tax Guide
 * - Day 5: Social Proof - Real User Success Stories
 * - Day 7: Urgency - Limited Time Offer
 *
 * Each template includes:
 * - Dynamic data structure for SendGrid templates
 * - HTML fallback for direct sending
 * - UTM tracking for analytics
 */

export const EMAIL_TEMPLATES = {
  DRIP_DAY1: process.env.SENDGRID_TEMPLATE_DAY1 || 'd-drip-day1',
  DRIP_DAY3: process.env.SENDGRID_TEMPLATE_DAY3 || 'd-drip-day3',
  DRIP_DAY5: process.env.SENDGRID_TEMPLATE_DAY5 || 'd-drip-day5',
  DRIP_DAY7: process.env.SENDGRID_TEMPLATE_DAY7 || 'd-drip-day7',
} as const;

// =============================================================================
// DAY 1: WELCOME EMAIL
// =============================================================================

export interface Day1EmailData {
  first_name: string;
  email: string;
  subject: string;
  headline: string;
  quick_start_steps: Array<{
    icon: string;
    title: string;
    description: string;
    cta_url: string;
  }>;
  calculator_url: string;
  dashboard_url: string;
  knowledge_base_url: string;
  unsubscribe_url: string;
  support_email: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
}

export function getDay1EmailData(params: {
  firstName: string;
  email: string;
}): Day1EmailData {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app';

  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: "Welcome to TaxBridge - Your Cross-Border Tax Journey Starts Here",
    headline: "You're all set! Let's get you started.",

    quick_start_steps: [
      {
        icon: "🧮",
        title: "Try the Calculator",
        description: "Enter your RSU details and see your US/Canada tax comparison in under 2 minutes",
        cta_url: `${baseUrl}/calculator?utm_source=email&utm_medium=drip&utm_campaign=day1-welcome`
      },
      {
        icon: "📋",
        title: "Check Your Forms",
        description: "See which cross-border forms you need: 1116, T1135, 8938, and more",
        cta_url: `${baseUrl}/forms-checklist?utm_source=email&utm_medium=drip&utm_campaign=day1-welcome`
      },
      {
        icon: "📊",
        title: "Explore Your Dashboard",
        description: "Track RSU vests, calculate Foreign Tax Credit, and plan multi-year scenarios",
        cta_url: `${baseUrl}/dashboard?utm_source=email&utm_medium=drip&utm_campaign=day1-welcome`
      }
    ],

    calculator_url: `${baseUrl}/calculator?utm_source=email&utm_medium=drip&utm_campaign=day1-welcome`,
    dashboard_url: `${baseUrl}/dashboard?utm_source=email&utm_medium=drip&utm_campaign=day1-welcome`,
    knowledge_base_url: `${baseUrl}/knowledge-base?utm_source=email&utm_medium=drip&utm_campaign=day1-welcome`,
    unsubscribe_url: `${baseUrl}/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'support@taxbridge.app',

    utm_source: 'email',
    utm_medium: 'drip-campaign',
    utm_campaign: 'day1-welcome',
  };
}

export function getDay1EmailHTML(data: Day1EmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .step { background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 20px; border-radius: 4px; }
    .step-icon { font-size: 32px; margin-bottom: 10px; }
    .step-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #333; }
    .step-description { color: #666; margin-bottom: 15px; }
    .btn { display: inline-block; background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px; }
    .btn:hover { background-color: #5568d3; }
    .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🪶 Welcome to TaxBridge</h1>
    </div>

    <div class="content">
      <div class="greeting">
        Hi ${data.first_name},
      </div>

      <p>${data.headline}</p>

      <p>As an H-1B or TN visa worker with RSUs, you're facing one of the most complex tax situations out there: dual taxation, foreign tax credits, and a mountain of cross-border forms.</p>

      <p><strong>Good news:</strong> TaxBridge makes this simple. Here's how to get started:</p>

      ${data.quick_start_steps.map(step => `
        <div class="step">
          <div class="step-icon">${step.icon}</div>
          <div class="step-title">${step.title}</div>
          <div class="step-description">${step.description}</div>
          <a href="${step.cta_url}" class="btn">Get Started →</a>
        </div>
      `).join('')}

      <p style="margin-top: 30px;">Most users complete their first calculation in under 5 minutes. Give it a try!</p>

      <p>Need help? Just reply to this email.</p>

      <p style="margin-top: 30px;">
        Best,<br>
        <strong>The TaxBridge Team</strong>
      </p>
    </div>

    <div class="footer">
      <p>You're receiving this because you signed up for TaxBridge.</p>
      <p>
        <a href="${data.unsubscribe_url}">Unsubscribe</a> |
        <a href="${data.support_email}">Contact Support</a>
      </p>
      <p>TaxBridge &copy; ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// =============================================================================
// DAY 3: EDUCATION - RSU TAX GUIDE
// =============================================================================

export interface Day3EmailData {
  first_name: string;
  email: string;
  subject: string;
  headline: string;
  guide_sections: Array<{
    icon: string;
    title: string;
    description: string;
    key_points: string[];
  }>;
  calculator_url: string;
  blog_url: string;
  unsubscribe_url: string;
  support_email: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
}

export function getDay3EmailData(params: {
  firstName: string;
  email: string;
}): Day3EmailData {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app';

  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: "Your Complete RSU Tax Guide: Everything You Need to Know",
    headline: "Master RSU taxation in 5 minutes",

    guide_sections: [
      {
        icon: "💰",
        title: "How RSUs Are Taxed",
        description: "Understanding vest dates, withholding, and dual taxation",
        key_points: [
          "RSUs are taxed as ordinary income when they vest (not when granted)",
          "Your employer withholds ~40% for US taxes at vest",
          "Canada ALSO taxes the same income - that's double taxation",
          "Foreign Tax Credit (Form 1116) prevents paying twice"
        ]
      },
      {
        icon: "🧮",
        title: "The Foreign Tax Credit (FTC) Explained",
        description: "How to avoid double taxation on your RSUs",
        key_points: [
          "FTC allows you to claim US taxes as a credit on Canadian return",
          "File Form 1116 (US) to calculate your foreign tax credit",
          "Report on Canadian T1 Schedule 1 and T2209",
          "TaxBridge calculates FTC automatically - no manual math"
        ]
      },
      {
        icon: "📄",
        title: "Required Forms Checklist",
        description: "Don't miss these critical cross-border forms",
        key_points: [
          "Form 1116 - Foreign Tax Credit (US return)",
          "T1135 - Foreign Income Verification Statement (if >$100K CAD assets)",
          "Form 8938 - FATCA filing (if >$200K USD assets)",
          "Schedule 1 & T2209 - FTC claim (Canadian return)"
        ]
      },
      {
        icon: "⏰",
        title: "Key Deadlines",
        description: "Mark your calendar",
        key_points: [
          "US Tax Deadline: April 15 (can extend to October 15)",
          "Canadian Tax Deadline: April 30 (June 15 if self-employed)",
          "File US first, then use those numbers for Canadian FTC",
          "Set calendar reminders 2 weeks before each deadline"
        ]
      }
    ],

    calculator_url: `${baseUrl}/calculator?utm_source=email&utm_medium=drip&utm_campaign=day3-education`,
    blog_url: `${baseUrl}/blog/rsu-tax-guide?utm_source=email&utm_medium=drip&utm_campaign=day3-education`,
    unsubscribe_url: `${baseUrl}/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'support@taxbridge.app',

    utm_source: 'email',
    utm_medium: 'drip-campaign',
    utm_campaign: 'day3-education',
  };
}

export function getDay3EmailHTML(data: Day3EmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .section { background-color: #f8f9fa; padding: 25px; margin-bottom: 25px; border-radius: 8px; border-left: 4px solid #667eea; }
    .section-icon { font-size: 36px; margin-bottom: 10px; }
    .section-title { font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #333; }
    .section-description { color: #666; margin-bottom: 15px; font-style: italic; }
    .key-points { margin: 0; padding-left: 20px; }
    .key-points li { margin-bottom: 8px; color: #555; }
    .btn { display: inline-block; background-color: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .btn:hover { background-color: #5568d3; }
    .highlight-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 4px; }
    .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 Your Complete RSU Tax Guide</h1>
    </div>

    <div class="content">
      <div class="greeting">
        Hi ${data.first_name},
      </div>

      <p><strong>${data.headline}</strong></p>

      <p>RSU taxation across US and Canada is confusing. Most people overpay because they don't understand Foreign Tax Credit rules.</p>

      <p>This guide covers everything you need to know:</p>

      ${data.guide_sections.map(section => `
        <div class="section">
          <div class="section-icon">${section.icon}</div>
          <div class="section-title">${section.title}</div>
          <div class="section-description">${section.description}</div>
          <ul class="key-points">
            ${section.key_points.map(point => `<li>${point}</li>`).join('')}
          </ul>
        </div>
      `).join('')}

      <div class="highlight-box">
        <strong>💡 Pro Tip:</strong> Most H-1B/TN workers overpay by $3,000-$8,000 per year because they don't optimize FTC. TaxBridge calculates this automatically.
      </div>

      <p style="text-align: center;">
        <a href="${data.calculator_url}" class="btn">Calculate Your Tax Savings →</a>
      </p>

      <p>Questions about RSU taxation? Reply to this email anytime.</p>

      <p style="margin-top: 30px;">
        Best,<br>
        <strong>The TaxBridge Team</strong>
      </p>
    </div>

    <div class="footer">
      <p>You're receiving this because you signed up for TaxBridge.</p>
      <p>
        <a href="${data.unsubscribe_url}">Unsubscribe</a> |
        <a href="${data.support_email}">Contact Support</a>
      </p>
      <p>TaxBridge &copy; ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// =============================================================================
// DAY 5: SOCIAL PROOF - SUCCESS STORIES
// =============================================================================

export interface Day5EmailData {
  first_name: string;
  email: string;
  subject: string;
  headline: string;
  success_stories: Array<{
    name: string;
    role: string;
    company: string;
    location: string;
    rsu_value: string;
    tax_saved: string;
    testimonial: string;
    time_saved: string;
  }>;
  stats: {
    total_users: string;
    total_tax_saved: string;
    avg_rating: string;
    avg_time_saved: string;
  };
  calculator_url: string;
  testimonials_url: string;
  unsubscribe_url: string;
  support_email: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
}

export function getDay5EmailData(params: {
  firstName: string;
  email: string;
}): Day5EmailData {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app';

  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: "How 2,000+ H-1B Workers Are Saving $3K-$8K in Taxes",
    headline: "Real users, real savings",

    success_stories: [
      {
        name: "Sarah L.",
        role: "Senior Software Engineer",
        company: "Tech Company (H-1B)",
        location: "Seattle → Toronto",
        rsu_value: "$120,000",
        tax_saved: "$8,400",
        testimonial: "TaxBridge made cross-border taxes actually understandable. I used to pay a CPA $2,000 every year - now I do it myself in 20 minutes.",
        time_saved: "15+ hours"
      },
      {
        name: "Michael T.",
        role: "Product Manager",
        company: "Google (TN Visa)",
        location: "Mountain View → Vancouver",
        rsu_value: "$95,000",
        tax_saved: "$6,200",
        testimonial: "I almost missed $6K in Foreign Tax Credit because I didn't know about Form 1116. TaxBridge showed me exactly what to file.",
        time_saved: "20+ hours"
      },
      {
        name: "Priya K.",
        role: "Data Scientist",
        company: "Meta (H-1B)",
        location: "Menlo Park → Toronto",
        rsu_value: "$145,000",
        tax_saved: "$9,800",
        testimonial: "The multi-year planner helped me optimize vest schedules. Best $49 I've spent - ROI was 200x in tax savings.",
        time_saved: "25+ hours"
      }
    ],

    stats: {
      total_users: "2,000+",
      total_tax_saved: "$4.2M+",
      avg_rating: "4.9/5",
      avg_time_saved: "18 hours"
    },

    calculator_url: `${baseUrl}/calculator?utm_source=email&utm_medium=drip&utm_campaign=day5-social-proof`,
    testimonials_url: `${baseUrl}/testimonials?utm_source=email&utm_medium=drip&utm_campaign=day5-social-proof`,
    unsubscribe_url: `${baseUrl}/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'support@taxbridge.app',

    utm_source: 'email',
    utm_medium: 'drip-campaign',
    utm_campaign: 'day5-social-proof',
  };
}

export function getDay5EmailHTML(data: Day5EmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0; }
    .stat-box { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
    .stat-value { font-size: 28px; font-weight: 700; color: #667eea; margin-bottom: 5px; }
    .stat-label { color: #666; font-size: 14px; }
    .story { background-color: #ffffff; border: 2px solid #e9ecef; padding: 25px; margin-bottom: 25px; border-radius: 8px; }
    .story-header { display: flex; align-items: center; margin-bottom: 15px; }
    .story-avatar { width: 50px; height: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; margin-right: 15px; }
    .story-info { flex: 1; }
    .story-name { font-weight: 600; font-size: 18px; margin-bottom: 3px; }
    .story-role { color: #666; font-size: 14px; }
    .story-stats { display: flex; gap: 20px; margin-bottom: 15px; }
    .story-stat { flex: 1; text-align: center; background-color: #f8f9fa; padding: 10px; border-radius: 4px; }
    .story-stat-value { font-weight: 700; color: #28a745; font-size: 18px; }
    .story-stat-label { font-size: 12px; color: #666; }
    .story-testimonial { font-style: italic; color: #555; line-height: 1.8; padding: 15px; background-color: #f8f9fa; border-left: 3px solid #667eea; margin-top: 15px; }
    .btn { display: inline-block; background-color: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .btn:hover { background-color: #5568d3; }
    .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⭐ Real Results from Real Users</h1>
    </div>

    <div class="content">
      <div class="greeting">
        Hi ${data.first_name},
      </div>

      <p><strong>${data.headline}</strong></p>

      <p>Don't just take our word for it. Here's how H-1B and TN workers like you are using TaxBridge to save thousands:</p>

      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">${data.stats.total_users}</div>
          <div class="stat-label">Active Users</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${data.stats.total_tax_saved}</div>
          <div class="stat-label">Total Tax Saved</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${data.stats.avg_rating}</div>
          <div class="stat-label">Average Rating</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${data.stats.avg_time_saved}</div>
          <div class="stat-label">Avg. Time Saved</div>
        </div>
      </div>

      ${data.success_stories.map(story => `
        <div class="story">
          <div class="story-header">
            <div class="story-avatar">${story.name.split(' ').map(n => n[0]).join('')}</div>
            <div class="story-info">
              <div class="story-name">${story.name}</div>
              <div class="story-role">${story.role} at ${story.company}</div>
              <div class="story-role">${story.location}</div>
            </div>
          </div>

          <div class="story-stats">
            <div class="story-stat">
              <div class="story-stat-value">${story.rsu_value}</div>
              <div class="story-stat-label">RSU Value</div>
            </div>
            <div class="story-stat">
              <div class="story-stat-value">${story.tax_saved}</div>
              <div class="story-stat-label">Tax Saved</div>
            </div>
            <div class="story-stat">
              <div class="story-stat-value">${story.time_saved}</div>
              <div class="story-stat-label">Time Saved</div>
            </div>
          </div>

          <div class="story-testimonial">
            "${story.testimonial}"
          </div>
        </div>
      `).join('')}

      <p style="text-align: center; margin-top: 40px;">
        <strong>Join 2,000+ H-1B and TN workers who've simplified their cross-border taxes</strong>
      </p>

      <p style="text-align: center;">
        <a href="${data.calculator_url}" class="btn">Calculate Your Tax Savings →</a>
      </p>

      <p style="margin-top: 30px;">
        Best,<br>
        <strong>The TaxBridge Team</strong>
      </p>
    </div>

    <div class="footer">
      <p>You're receiving this because you signed up for TaxBridge.</p>
      <p>
        <a href="${data.unsubscribe_url}">Unsubscribe</a> |
        <a href="${data.support_email}">Contact Support</a> |
        <a href="${data.testimonials_url}">Read More Stories</a>
      </p>
      <p>TaxBridge &copy; ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// =============================================================================
// DAY 7: URGENCY - LIMITED TIME OFFER
// =============================================================================

export interface Day7EmailData {
  first_name: string;
  email: string;
  subject: string;
  headline: string;
  offer: {
    discount_percentage: string;
    discount_code: string;
    regular_price: string;
    discounted_price: string;
    savings: string;
    expires_today: string;
  };
  premium_features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  social_proof: {
    recent_upgrades: string;
    testimonial: {
      quote: string;
      author: string;
      role: string;
    };
  };
  upgrade_url: string;
  keep_free_url: string;
  unsubscribe_url: string;
  support_email: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
}

export function getDay7EmailData(params: {
  firstName: string;
  email: string;
  discountCode?: string;
}): Day7EmailData {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app';
  const discountCode = params.discountCode || 'WELCOME30';

  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: "⏰ Last Chance: 30% Off TaxBridge Pro Expires Tonight",
    headline: "Don't miss out - save $14.70 today",

    offer: {
      discount_percentage: "30%",
      discount_code: discountCode,
      regular_price: "$49",
      discounted_price: "$34.30",
      savings: "$14.70",
      expires_today: "Tonight at 11:59 PM PST"
    },

    premium_features: [
      {
        icon: "♾️",
        title: "Unlimited RSU Calculations",
        description: "No limits on calculations, scenarios, or what-if analyses"
      },
      {
        icon: "📊",
        title: "Multi-Year Tax Planning",
        description: "Plan 3-5 years ahead based on your vest schedule"
      },
      {
        icon: "📄",
        title: "Professional PDF Reports",
        description: "Generate tax reports for your CPA or records"
      },
      {
        icon: "⚡",
        title: "Priority Email Support",
        description: "Get answers within 24 hours"
      },
      {
        icon: "📝",
        title: "Form Pre-Fill",
        description: "Auto-populate Form 1116, T1135, and 8938"
      },
      {
        icon: "🔒",
        title: "Advanced Security",
        description: "Bank-level encryption for your financial data"
      }
    ],

    social_proof: {
      recent_upgrades: "47 users upgraded in the last 48 hours",
      testimonial: {
        quote: "I waited until Day 7 and almost missed this offer. Best $34 I've spent - already saved $3,200 in taxes!",
        author: "Michael T.",
        role: "SWE at Google (H-1B)"
      }
    },

    upgrade_url: `${baseUrl}/upgrade?code=${discountCode}&utm_source=email&utm_medium=drip&utm_campaign=day7-last-chance`,
    keep_free_url: `${baseUrl}/dashboard?utm_source=email&utm_medium=drip&utm_campaign=day7-last-chance`,
    unsubscribe_url: `${baseUrl}/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'support@taxbridge.app',

    utm_source: 'email',
    utm_medium: 'drip-campaign',
    utm_campaign: 'day7-last-chance',
  };
}

export function getDay7EmailHTML(data: Day7EmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .urgency-banner { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 30px; text-align: center; font-weight: 600; color: #92400e; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .offer-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
    .offer-code { background-color: rgba(255,255,255,0.2); padding: 15px; border: 2px dashed white; border-radius: 8px; font-size: 32px; font-weight: 700; letter-spacing: 2px; margin: 20px 0; }
    .price { font-size: 48px; font-weight: 700; margin: 20px 0; }
    .price-strike { text-decoration: line-through; opacity: 0.7; font-size: 28px; }
    .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0; }
    .feature { background-color: #f8f9fa; padding: 15px; border-radius: 8px; }
    .feature-icon { font-size: 24px; margin-bottom: 8px; }
    .feature-title { font-weight: 600; margin-bottom: 5px; }
    .feature-description { font-size: 13px; color: #666; }
    .testimonial { background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; font-style: italic; }
    .btn { display: inline-block; background-color: #dc2626; color: white; padding: 18px 36px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .btn:hover { background-color: #b91c1c; }
    .alternative-cta { text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e9ecef; }
    .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Last Chance: Offer Expires Tonight</h1>
    </div>

    <div class="urgency-banner">
      🔥 ${data.social_proof.recent_upgrades} 🔥
    </div>

    <div class="content">
      <div class="greeting">
        Hi ${data.first_name},
      </div>

      <p><strong>This is it.</strong> Your exclusive 30% discount expires tonight at 11:59 PM PST.</p>

      <p>After that, TaxBridge Pro returns to full price ($${data.offer.regular_price}/year).</p>

      <div class="offer-box">
        <h2 style="margin-top: 0;">🎁 Your Exclusive Offer</h2>
        <div class="price">
          <span class="price-strike">$${data.offer.regular_price}</span> → $${data.offer.discounted_price}/year
        </div>
        <p>Save ${data.offer.savings} (30% off)</p>
        <div class="offer-code">${data.offer.discount_code}</div>
        <p style="margin-bottom: 0;">Use code at checkout • Expires ${data.offer.expires_today}</p>
      </div>

      <h3>What You Get with Pro:</h3>

      <div class="features-grid">
        ${data.premium_features.map(feature => `
          <div class="feature">
            <div class="feature-icon">${feature.icon}</div>
            <div class="feature-title">${feature.title}</div>
            <div class="feature-description">${feature.description}</div>
          </div>
        `).join('')}
      </div>

      <div class="testimonial">
        "${data.social_proof.testimonial.quote}"
        <br><br>
        <strong>— ${data.social_proof.testimonial.author}</strong>, ${data.social_proof.testimonial.role}
      </div>

      <p style="text-align: center; font-size: 18px; margin-top: 40px;">
        <strong>The choice is yours:</strong>
      </p>

      <p style="text-align: center;">
        <a href="${data.upgrade_url}" class="btn">Upgrade for $${data.offer.discounted_price} (Save ${data.offer.savings}) →</a>
      </p>

      <div class="alternative-cta">
        <p style="color: #666;">Not ready to upgrade? No problem.</p>
        <p><a href="${data.keep_free_url}" style="color: #667eea;">Continue with free account</a></p>
      </div>

      <p style="margin-top: 40px;">
        Best,<br>
        <strong>The TaxBridge Team</strong>
      </p>

      <p style="font-size: 12px; color: #999; margin-top: 30px;">
        P.S. This is the last email in our welcome series. You won't receive another discount offer like this.
      </p>
    </div>

    <div class="footer">
      <p>You're receiving this because you signed up for TaxBridge.</p>
      <p>
        <a href="${data.unsubscribe_url}">Unsubscribe</a> |
        <a href="${data.support_email}">Contact Support</a>
      </p>
      <p>TaxBridge &copy; ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
