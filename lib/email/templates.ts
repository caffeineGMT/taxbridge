/**
 * Email Template IDs and Dynamic Data Structures
 *
 * 7-DAY NURTURE SEQUENCE:
 * - Day 1: Welcome + Calculator Tips
 * - Day 3: Case Study (Social Proof)
 * - Day 5: Limited Offer (First Discount Mention)
 * - Day 7: Last Chance (Urgency + Scarcity)
 *
 * SETUP INSTRUCTIONS:
 * 1. Create Dynamic Templates in SendGrid Dashboard (https://app.sendgrid.com/dynamic_templates)
 * 2. Copy the Template IDs and update environment variables
 * 3. Each template should include an unsubscribe link: {{unsubscribe_url}}
 * 4. Test templates with sample data before production deployment
 */

export const EMAIL_TEMPLATES = {
  // Day 1 - Welcome Email + Calculator Tips
  DRIP_DAY1: process.env.SENDGRID_TEMPLATE_DAY1 || 'd-placeholder-day1',

  // Day 3 - Case Study (Social Proof)
  DRIP_DAY3: process.env.SENDGRID_TEMPLATE_DAY3 || 'd-placeholder-day3',

  // Day 5 - Limited Offer (First Discount Mention)
  DRIP_DAY5: process.env.SENDGRID_TEMPLATE_DAY5 || 'd-placeholder-day5',

  // Day 7 - Last Chance (Urgency + Scarcity)
  DRIP_DAY7: process.env.SENDGRID_TEMPLATE_DAY7 || 'd-placeholder-day7',

  // Notification Digest - Daily notification summary
  NOTIFICATION_DIGEST: process.env.SENDGRID_TEMPLATE_NOTIFICATION_DIGEST || 'd-notification-digest',

  // Referral Program Emails
  REFERRAL_REWARD_GRANTED: process.env.SENDGRID_TEMPLATE_REFERRAL_REWARD || 'd-referral-reward',
  REFERRAL_INVITATION: process.env.SENDGRID_TEMPLATE_REFERRAL_INVITATION || 'd-referral-invitation',
} as const;

export type EmailTemplateId = typeof EMAIL_TEMPLATES[keyof typeof EMAIL_TEMPLATES];

/**
 * DAY 1: Welcome Email + Calculator Tips
 *
 * PURPOSE: Onboard new users, provide immediate value
 * SUBJECT: "Welcome to TaxBridge - Let's Calculate Your Tax Savings"
 * CTA: "Start Your First Calculation →"
 */
export function getDay1EmailData(params: {
  firstName: string;
  email: string;
}) {
  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: "Welcome to TaxBridge - Let's Calculate Your Tax Savings",
    headline: "You're all set! Let's get started.",

    // Quick start tips
    calculator_tips: [
      {
        icon: "📊",
        title: "Dual Calculator Mode",
        description: "View US and Canada tax side-by-side for instant comparisons"
      },
      {
        icon: "💰",
        title: "Foreign Tax Credit (FTC)",
        description: "Automatically calculate FTC to avoid double taxation on RSUs"
      },
      {
        icon: "📝",
        title: "Forms Checklist",
        description: "Track your 1116, T1135, and other cross-border tax forms"
      }
    ],

    // CTAs
    calculator_url: 'https://taxbridge.app/calculator',
    dashboard_url: 'https://taxbridge.app/dashboard',
    knowledge_base_url: 'https://taxbridge.app/knowledge-base',

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'support@taxbridge.app',

    // UTM tracking
    utm_source: 'email',
    utm_medium: 'drip-campaign',
    utm_campaign: 'day1-welcome',
  };
}

/**
 * DAY 3: Case Study (Social Proof)
 *
 * PURPOSE: Build trust through real user success story
 * SUBJECT: "How Sarah Saved $8,400 in Taxes Using TaxBridge"
 * CTA: "Calculate My Savings →"
 */
export function getDay3EmailData(params: {
  firstName: string;
  email: string;
}) {
  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: "How Sarah Saved $8,400 in Taxes Using TaxBridge",
    headline: "Real user, real savings",

    // Case study details
    case_study: {
      user_name: "Sarah L.",
      role: "Senior Software Engineer",
      company: "Tech company on H-1B",
      location: "Seattle → Toronto",
      rsu_value: "$120,000",
      tax_saved: "$8,400",
      testimonial: "TaxBridge made cross-border taxes actually understandable. I used to pay a CPA $2,000 every year - now I do it myself in 20 minutes.",
      avatar_initials: "SL",
      stats: [
        { label: "Time Saved", value: "15+ hours", icon: "⏱️" },
        { label: "Money Saved", value: "$8,400", icon: "💰" },
        { label: "CPA Fees Avoided", value: "$2,000/year", icon: "🎯" }
      ]
    },

    // How it works
    how_it_works: [
      { step: 1, text: "Enter your RSU details and income" },
      { step: 2, text: "TaxBridge calculates FTC automatically" },
      { step: 3, text: "Export tax forms ready for filing" }
    ],

    // CTAs
    calculator_url: 'https://taxbridge.app/calculator?utm_source=email&utm_medium=drip&utm_campaign=day3-case-study',
    testimonials_url: 'https://taxbridge.app/testimonials',

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'support@taxbridge.app',

    // UTM tracking
    utm_source: 'email',
    utm_medium: 'drip-campaign',
    utm_campaign: 'day3-case-study',
  };
}

/**
 * DAY 5: Limited Offer (First Discount Mention)
 *
 * PURPOSE: Introduce paid tier with limited-time discount
 * SUBJECT: "🎁 Exclusive Offer: 30% Off TaxBridge Pro (48 Hours Only)"
 * CTA: "Claim My 30% Discount →"
 */
export function getDay5EmailData(params: {
  firstName: string;
  email: string;
  discountCode?: string;
}) {
  const discountCode = params.discountCode || 'WELCOME30';
  const expiryDate = getDiscountExpiryDate(2); // 48 hours

  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: "🎁 Exclusive Offer: 30% Off TaxBridge Pro (48 Hours Only)",
    headline: "Limited time: Save 30% on your first year",

    // Offer details
    offer: {
      discount_percentage: "30%",
      discount_code: discountCode,
      regular_price: "$49",
      discounted_price: "$34.30",
      savings: "$14.70",
      valid_until: expiryDate,
      time_remaining: "48 hours",
    },

    // Premium features
    premium_features: [
      {
        icon: "♾️",
        title: "Unlimited RSU Calculations",
        description: "No limits on calculations or scenarios"
      },
      {
        icon: "📊",
        title: "Multi-Year Tax Planning",
        description: "Plan 3-5 years ahead for vest schedules"
      },
      {
        icon: "📄",
        title: "PDF Tax Reports",
        description: "Professional reports for your CPA or records"
      },
      {
        icon: "⚡",
        title: "Priority Support",
        description: "Email support with 24-hour response time"
      },
      {
        icon: "📝",
        title: "Form Pre-Fill",
        description: "Auto-populate Form 1116 and T1135"
      }
    ],

    // Social proof
    stats: {
      users: "2,000+",
      tax_saved: "$4.2M+",
      rating: "4.9/5",
      reviews: "320"
    },

    // CTAs
    upgrade_url: `https://taxbridge.app/upgrade?code=${discountCode}&utm_source=email&utm_medium=drip&utm_campaign=day5-limited-offer`,
    pricing_url: 'https://taxbridge.app/pricing',

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'support@taxbridge.app',

    // UTM tracking
    utm_source: 'email',
    utm_medium: 'drip-campaign',
    utm_campaign: 'day5-limited-offer',
  };
}

/**
 * DAY 7: Last Chance (Urgency + Scarcity)
 *
 * PURPOSE: Final push with urgency and FOMO
 * SUBJECT: "⏰ Last Chance: Your 30% Discount Expires Tonight"
 * CTA: "Upgrade Now (Expires in 6 Hours) →"
 */
export function getDay7EmailData(params: {
  firstName: string;
  email: string;
  discountCode?: string;
}) {
  const discountCode = params.discountCode || 'WELCOME30';
  const expiryTime = getExpiryTimeToday(23, 59); // 11:59 PM today

  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: "⏰ Last Chance: Your 30% Discount Expires Tonight",
    headline: "Don't miss out on $14.70 in savings",

    // Urgency messaging
    urgency: {
      discount_code: discountCode,
      discount_percentage: "30%",
      expires_at: expiryTime,
      time_remaining_display: "Today at 11:59 PM PST",
      savings: "$14.70",
      final_price: "$34.30",
    },

    // What you're missing
    missing_out: [
      { icon: "💸", text: "Save $14.70 on your first year" },
      { icon: "📊", text: "Unlimited multi-year tax scenarios" },
      { icon: "📄", text: "Professional PDF tax reports" },
      { icon: "⚡", text: "Priority support when you need it" }
    ],

    // FOMO elements
    social_proof: {
      recent_signups: "47 users upgraded in the last 48 hours",
      testimonial: {
        quote: "I waited until Day 7 and almost missed this offer. Best $34 I've spent - already saved $3,200 in taxes!",
        author: "Michael T., Google (H-1B)",
        role: "SWE, Mountain View → Vancouver"
      }
    },

    // Final decision framework
    comparison: {
      diy_cost: "$0 (but 20+ hours of work)",
      cpa_cost: "$1,500-$3,000/year",
      taxbridge_cost: "$34.30/year (with code)",
      time_to_complete: "15 minutes"
    },

    // CTAs
    upgrade_url: `https://taxbridge.app/upgrade?code=${discountCode}&utm_source=email&utm_medium=drip&utm_campaign=day7-last-chance`,

    // Alternative: Keep free account
    keep_free_url: 'https://taxbridge.app/dashboard',
    free_tier_description: "Stay on free tier (limited to 3 calculations/month)",

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'support@taxbridge.app',

    // UTM tracking
    utm_source: 'email',
    utm_medium: 'drip-campaign',
    utm_campaign: 'day7-last-chance',
  };
}

/**
 * Get discount expiry date (N days from now)
 */
function getDiscountExpiryDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

/**
 * Get expiry time for today at specific hour
 */
function getExpiryTimeToday(hour: number, minute: number): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

/**
 * Generate dynamic data for Notification Digest Email
 */
export function getNotificationDigestEmailData(params: {
  firstName: string;
  email: string;
  notifications: Array<{
    type: string;
    title: string;
    body: string;
  }>;
}) {
  const ctaUrls: Record<string, string> = {
    deadline: 'https://taxbridge.app/dashboard',
    ftc_opportunity: 'https://taxbridge.app/calculator',
    new_feature: 'https://taxbridge.app/dashboard',
    renewal: 'https://taxbridge.app/dashboard/subscription',
  };

  return {
    first_name: params.firstName || 'there',
    email: params.email,
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    notifications: params.notifications.map(n => ({
      ...n,
      cta_url: ctaUrls[n.type] || 'https://taxbridge.app/dashboard',
      icon: n.type === 'deadline' ? '⏰' : n.type === 'ftc_opportunity' ? '💰' : n.type === 'new_feature' ? '✨' : '🔄',
    })),
    notification_count: params.notifications.length,
    dashboard_url: 'https://taxbridge.app/dashboard',
    settings_url: 'https://taxbridge.app/settings/notifications',
    support_email: 'support@taxbridge.app',
  };
}

/**
 * REFERRAL REWARD GRANTED EMAIL
 *
 * PURPOSE: Notify referrer that they earned a reward
 * SUBJECT: "🎉 You earned 2 months free! Thanks for referring {friend_name}"
 * CTA: "View Your Referral Dashboard →"
 */
export function getReferralRewardEmailData(params: {
  firstName: string;
  email: string;
  friendName?: string;
  rewardMonths: number;
  rewardValue: number;
  totalReferrals: number;
  referralDashboardUrl?: string;
}) {
  const dashboardUrl = params.referralDashboardUrl || 'https://taxbridge.app/referrals';

  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: `🎉 You earned ${params.rewardMonths} months free! Thanks for referring ${params.friendName || 'a friend'}`,
    headline: "You just earned free months!",

    // Reward details
    friend_name: params.friendName || 'your friend',
    reward_months: params.rewardMonths,
    reward_value: `$${params.rewardValue.toFixed(2)}`,
    total_referrals: params.totalReferrals,

    // Encouragement to refer more
    next_milestone: params.totalReferrals < 5
      ? { count: 5, reward: '$50 bonus' }
      : params.totalReferrals < 10
      ? { count: 10, reward: '$100 bonus' }
      : { count: params.totalReferrals + 5, reward: 'Free Enterprise upgrade' },

    // CTAs
    referral_dashboard_url: dashboardUrl,
    share_again_url: `${dashboardUrl}?action=share`,

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'support@taxbridge.app',

    // UTM tracking
    utm_source: 'email',
    utm_medium: 'transactional',
    utm_campaign: 'referral-reward',
  };
}

/**
 * REFERRAL INVITATION EMAIL (sent by user to friend)
 *
 * PURPOSE: Invite friend to join TaxBridge with referral discount
 * SUBJECT: "{referrer_name} thinks you'd find TaxBridge useful"
 * CTA: "Get 20% Off →"
 */
export function getReferralInvitationEmailData(params: {
  referrerName: string;
  referrerEmail: string;
  friendEmail: string;
  referralCode: string;
  personalMessage?: string;
  discountPercent: number;
}) {
  const referralUrl = `https://taxbridge.app?ref=${params.referralCode}`;

  return {
    referrer_name: params.referrerName,
    referrer_first_name: params.referrerName.split(' ')[0],
    friend_email: params.friendEmail,
    subject: `${params.referrerName} thinks you'd find TaxBridge useful`,
    headline: "Your friend recommended TaxBridge",

    // Personal message (optional)
    has_personal_message: !!params.personalMessage,
    personal_message: params.personalMessage || '',

    // Discount details
    discount_percent: params.discountPercent,
    discount_amount: params.discountPercent === 20 ? '$60' : `${params.discountPercent}%`,

    // Product value props (for cold audience)
    value_props: [
      {
        icon: "💰",
        title: "Dual-Country Tax Calculator",
        description: "Calculate US and Canada taxes on RSU income side-by-side"
      },
      {
        icon: "🌍",
        title: "Foreign Tax Credit Optimization",
        description: "Maximize FTC to avoid double taxation across borders"
      },
      {
        icon: "📋",
        title: "Forms Checklist",
        description: "Track 1116, T1135, 8833, and other cross-border forms"
      }
    ],

    // Social proof
    user_count: '500+',
    avg_savings: '$8,400',

    // CTAs
    signup_url: `${referralUrl}&utm_source=referral-email&utm_medium=email&utm_campaign=friend-invite`,
    learn_more_url: 'https://taxbridge.app/features',

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.friendEmail)}`,
    support_email: 'support@taxbridge.app',

    // UTM tracking
    utm_source: 'referral-email',
    utm_medium: 'email',
    utm_campaign: 'friend-invite',
  };
}

/**
 * SENDGRID TEMPLATE CREATION GUIDE
 *
 * Each template should follow this structure:
 *
 * 1. HEADER:
 *    - TaxBridge logo (150px width)
 *    - Simple navigation (optional)
 *
 * 2. HERO SECTION:
 *    - Subject line / headline ({{headline}})
 *    - Subheadline or value prop
 *
 * 3. MAIN CONTENT:
 *    - Personalized greeting: "Hi {{first_name}},"
 *    - Main content blocks with dynamic data
 *    - Visual elements (icons, images, stats)
 *
 * 4. CALL TO ACTION:
 *    - Single, prominent CTA button
 *    - Secondary CTA (optional)
 *
 * 5. FOOTER:
 *    - Unsubscribe link: {{unsubscribe_url}}
 *    - Support email: {{support_email}}
 *    - Company address
 *    - Social media links
 *
 * DESIGN GUIDELINES:
 * - Mobile-responsive (60%+ opens on mobile)
 * - Single column layout
 * - Max width: 600px
 * - Font: System fonts (Arial, Helvetica, sans-serif)
 * - Colors: Brand colors + high contrast CTA
 * - CTA button: 44px min height (touch-friendly)
 *
 * TESTING CHECKLIST:
 * - Test in Gmail, Outlook, Apple Mail
 * - Test on mobile (iOS Mail, Gmail app)
 * - Verify all dynamic variables render
 * - Check unsubscribe link works
 * - Preview in SendGrid's template editor
 */
