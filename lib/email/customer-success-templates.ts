/**
 * Customer Success Email Templates
 *
 * Templates for engaging with paid customers to collect feedback,
 * identify churn risks, and offer concierge onboarding.
 */

export const CUSTOMER_SUCCESS_TEMPLATES = {
  // Initial check-in email (sent 7 days after subscription)
  PAID_USER_CHECKIN: process.env.SENDGRID_TEMPLATE_PAID_CHECKIN || 'd-paid-checkin',

  // Feedback request (sent 14 days after subscription)
  FEEDBACK_REQUEST: process.env.SENDGRID_TEMPLATE_FEEDBACK_REQUEST || 'd-feedback-request',

  // Churn risk intervention (sent when user shows low engagement)
  CHURN_PREVENTION: process.env.SENDGRID_TEMPLATE_CHURN_PREVENTION || 'd-churn-prevention',

  // Concierge onboarding offer (sent to new paid users)
  CONCIERGE_ONBOARDING: process.env.SENDGRID_TEMPLATE_CONCIERGE || 'd-concierge-onboarding',
} as const;

/**
 * INITIAL CHECK-IN EMAIL (7 days after subscription)
 *
 * PURPOSE: Welcome paid users, ensure they're getting value
 * SUBJECT: "How's your TaxBridge Pro experience so far?"
 * CTA: "Schedule a Quick Call →" or "Send Feedback →"
 */
export function getPaidUserCheckinEmailData(params: {
  firstName: string;
  email: string;
  subscriptionTier: 'pro' | 'enterprise';
  subscriptionDate: Date;
  calculationsCompleted: number;
  feedbackUrl: string;
  calendarUrl: string;
}) {
  const daysSinceSubscription = Math.floor(
    (Date.now() - params.subscriptionDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: "How's your TaxBridge Pro experience so far?",
    headline: "We're here to help you succeed",

    // Subscription context
    subscription_tier: params.subscriptionTier === 'enterprise' ? 'Enterprise' : 'Pro',
    days_since_subscription: daysSinceSubscription,
    calculations_completed: params.calculationsCompleted,

    // Engagement messaging
    is_active_user: params.calculationsCompleted > 0,
    engagement_message: params.calculationsCompleted > 0
      ? `We noticed you've completed ${params.calculationsCompleted} calculation${params.calculationsCompleted > 1 ? 's' : ''} - great start!`
      : "We'd love to help you get the most out of TaxBridge.",

    // Quick wins
    quick_wins: [
      {
        icon: "🎯",
        title: "Set up your multi-year plan",
        description: "Plan for future vest dates and optimize your FTC strategy",
        url: "https://taxbridge.app/dashboard/multi-year"
      },
      {
        icon: "📄",
        title: "Export your first PDF report",
        description: "Generate professional tax reports for your records or CPA",
        url: "https://taxbridge.app/dashboard"
      },
      {
        icon: "📋",
        title: "Complete your forms checklist",
        description: "Track all cross-border tax forms you need to file",
        url: "https://taxbridge.app/forms-checklist"
      }
    ],

    // Personal outreach
    personal_message: "I'm Michael, founder of TaxBridge. As a fellow H-1B → Canada immigrant, I built this tool to solve the exact tax headaches I faced. If you have any questions or need help getting started, I'd love to hear from you.",
    founder_name: "Michael Guo",
    founder_title: "Founder, TaxBridge",

    // CTAs
    feedback_url: params.feedbackUrl,
    calendar_url: params.calendarUrl,
    support_email: 'michael@taxbridge.app',

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,

    // UTM tracking
    utm_source: 'email',
    utm_medium: 'customer-success',
    utm_campaign: 'paid-user-checkin',
  };
}

/**
 * FEEDBACK REQUEST EMAIL (14 days after subscription)
 *
 * PURPOSE: Collect structured feedback from paying customers
 * SUBJECT: "Quick favor? Help us improve TaxBridge"
 * CTA: "Share My Feedback (2 minutes) →"
 */
export function getFeedbackRequestEmailData(params: {
  firstName: string;
  email: string;
  subscriptionTier: 'pro' | 'enterprise';
  calculationsCompleted: number;
  feedbackSurveyUrl: string;
}) {
  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: "Quick favor? Help us improve TaxBridge",
    headline: "Your feedback shapes our roadmap",

    // Context
    subscription_tier: params.subscriptionTier === 'enterprise' ? 'Enterprise' : 'Pro',
    calculations_completed: params.calculationsCompleted,

    // Why we're asking
    why_feedback_matters: [
      "🎯 We're a small team building for cross-border tax filers like you",
      "📊 Your input directly influences our feature roadmap",
      "💡 Every piece of feedback helps us serve you better"
    ],

    // What we want to know
    questions_preview: [
      "What made you upgrade to Pro?",
      "What features do you use most?",
      "What would make TaxBridge indispensable for you?",
      "How likely are you to recommend us? (NPS)",
      "Anything frustrating or missing?"
    ],

    // Incentive
    incentive: {
      offer: "Complete our 2-minute survey and get 1 month free",
      value: "$49 value",
      how_it_works: "We'll automatically credit your account within 24 hours"
    },

    // Social proof
    testimonials: [
      {
        quote: "I suggested the multi-year planning feature in a feedback survey, and they built it in 2 weeks. Incredible team!",
        author: "Sarah L.",
        role: "Pro user"
      }
    ],

    // CTAs
    survey_url: params.feedbackSurveyUrl,
    email_reply_option: "Or just hit reply and tell us what's on your mind - I read every email personally.",

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'michael@taxbridge.app',

    // UTM tracking
    utm_source: 'email',
    utm_medium: 'customer-success',
    utm_campaign: 'feedback-request',
  };
}

/**
 * CHURN PREVENTION EMAIL (sent when user shows low engagement)
 *
 * PURPOSE: Re-engage at-risk paid users before they churn
 * SUBJECT: "Need help getting value from TaxBridge?"
 * CTA: "Book a Free 15-Min Call →" or "Cancel My Subscription →"
 */
export function getChurnPreventionEmailData(params: {
  firstName: string;
  email: string;
  subscriptionTier: 'pro' | 'enterprise';
  subscriptionDate: Date;
  lastLoginDate: Date | null;
  calculationsCompleted: number;
  churnRiskScore: number; // 0-100
  calendarUrl: string;
  cancellationUrl: string;
}) {
  const daysSinceLastLogin = params.lastLoginDate
    ? Math.floor((Date.now() - params.lastLoginDate.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  const monthlyPrice = params.subscriptionTier === 'enterprise' ? 149 : 49;

  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: "Need help getting value from TaxBridge?",
    headline: "Let's make sure you're getting your money's worth",

    // Context
    subscription_tier: params.subscriptionTier === 'enterprise' ? 'Enterprise' : 'Pro',
    monthly_price: `$${monthlyPrice}`,
    days_since_last_login: daysSinceLastLogin,
    calculations_completed: params.calculationsCompleted,

    // Empathy-first messaging
    empathy_message: daysSinceLastLogin > 30
      ? "We noticed you haven't logged in for a while. Cross-border taxes can be overwhelming - we get it."
      : "We want to make sure TaxBridge is working for you.",

    // Value reminder
    features_you_might_have_missed: [
      {
        icon: "📊",
        title: "Multi-Year Planning Dashboard",
        description: "Plan 3-5 years ahead for all your vest dates",
        is_new: false
      },
      {
        icon: "📄",
        title: "PDF Tax Reports",
        description: "Professional reports you can share with your CPA",
        is_new: false
      },
      {
        icon: "💬",
        title: "Priority Email Support",
        description: "Get answers within 24 hours",
        is_new: false
      }
    ],

    // Personal offer
    personal_offer: {
      headline: "Let me help you personally",
      description: "Book a free 15-minute call with me (Michael, founder) and I'll walk you through exactly how to use TaxBridge for your situation. No sales pitch - just help.",
      calendar_url: params.calendarUrl,
      testimonial: {
        quote: "Michael spent 20 minutes on a call helping me set up my multi-year plan. Game changer!",
        author: "David R.",
        role: "Enterprise customer"
      }
    },

    // Honest cancellation option
    cancellation_option: {
      message: "Not getting value? No hard feelings.",
      description: "If TaxBridge isn't right for you, you can cancel anytime with one click. No hoops, no retention teams.",
      cancel_url: params.cancellationUrl,
      refund_policy: "Cancel within 30 days for a full refund, no questions asked."
    },

    // Win-back offer
    special_offer: params.calculationsCompleted === 0 ? {
      headline: "Haven't had time to get started?",
      offer: "Pause your subscription for up to 3 months (free)",
      description: "We'll pause your billing until you're ready to dive in.",
      pause_url: "https://taxbridge.app/dashboard/subscription?action=pause"
    } : null,

    // CTAs
    book_call_url: params.calendarUrl,
    view_dashboard_url: 'https://taxbridge.app/dashboard',
    cancel_subscription_url: params.cancellationUrl,

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'michael@taxbridge.app',

    // UTM tracking
    utm_source: 'email',
    utm_medium: 'customer-success',
    utm_campaign: 'churn-prevention',
  };
}

/**
 * CONCIERGE ONBOARDING OFFER (sent to new paid users)
 *
 * PURPOSE: Offer personalized onboarding to new paid customers
 * SUBJECT: "Want a personal walkthrough? (Free for Pro members)"
 * CTA: "Book My Onboarding Call →"
 */
export function getConciergeOnboardingEmailData(params: {
  firstName: string;
  email: string;
  subscriptionTier: 'pro' | 'enterprise';
  calendarUrl: string;
}) {
  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: "Want a personal walkthrough? (Free for Pro members)",
    headline: "Welcome to TaxBridge Pro!",

    // Welcome message
    welcome_message: params.subscriptionTier === 'enterprise'
      ? "Thanks for choosing TaxBridge Enterprise. You've unlocked our full suite of cross-border tax tools."
      : "Thanks for upgrading to Pro! You now have unlimited calculations, multi-year planning, and priority support.",

    // Concierge offer
    concierge_offer: {
      headline: "Get a personalized 20-minute onboarding call",
      value: "Free for all Pro and Enterprise customers ($200 value)",
      what_we_cover: [
        "🎯 Set up your profile with your exact tax situation",
        "📊 Build your first multi-year tax plan together",
        "💡 Learn pro tips and hidden features",
        "❓ Get answers to all your cross-border tax questions",
        "📋 Create your personalized tax filing checklist"
      ],
      availability: "Book anytime this week that works for you",
      duration: "20 minutes",
    },

    // Who will help
    who_helps: {
      name: "Michael Guo",
      title: "Founder, TaxBridge",
      bio: "Former H-1B at Meta, moved to Vancouver in 2024. Built TaxBridge to solve my own RSU tax nightmare.",
      credentials: [
        "Processed cross-border taxes for 3+ years",
        "Harvard + UT Austin grad",
        "Helped 500+ users optimize their FTC"
      ],
      photo_url: "https://taxbridge.app/images/michael-avatar.jpg"
    },

    // Social proof
    testimonials: [
      {
        quote: "The onboarding call was incredibly helpful. Michael walked me through my entire vest schedule and showed me exactly how to optimize my FTC. Worth way more than the $49/year subscription!",
        author: "Jessica K.",
        role: "Google, H-1B → Toronto",
        rating: 5
      },
      {
        quote: "I thought I understood cross-border taxes until Michael showed me I was leaving $4K on the table. 20 minutes = $4,000 saved. No brainer.",
        author: "Alex M.",
        role: "Amazon, L5 → Vancouver",
        rating: 5
      }
    ],

    // Alternative: DIY onboarding
    diy_option: {
      headline: "Prefer to explore on your own?",
      description: "We've built a comprehensive video tutorial library and knowledge base.",
      video_tutorials_url: "https://taxbridge.app/tutorials",
      knowledge_base_url: "https://taxbridge.app/docs",
      email_support: "Or just email michael@taxbridge.app with any questions - I respond within 24 hours."
    },

    // CTAs
    book_call_url: params.calendarUrl,
    skip_to_dashboard_url: 'https://taxbridge.app/dashboard',

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'michael@taxbridge.app',

    // UTM tracking
    utm_source: 'email',
    utm_medium: 'customer-success',
    utm_campaign: 'concierge-onboarding',
  };
}

/**
 * Helper: Generate feedback survey URL with pre-filled data
 */
export function generateFeedbackSurveyUrl(params: {
  email: string;
  userId: number;
  subscriptionTier: string;
}): string {
  const baseUrl = 'https://taxbridge.app/api/feedback/survey';
  const queryParams = new URLSearchParams({
    email: params.email,
    user_id: params.userId.toString(),
    tier: params.subscriptionTier,
    utm_source: 'email',
    utm_campaign: 'feedback-request',
  });

  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Helper: Generate Calendly URL with pre-filled data
 */
export function generateCalendarUrl(params: {
  firstName: string;
  email: string;
  type: 'onboarding' | 'support' | 'churn-prevention';
}): string {
  // Replace with actual Calendly link when set up
  const calendlyBase = process.env.CALENDLY_URL || 'https://calendly.com/taxbridge-michael';

  const eventType = params.type === 'onboarding'
    ? 'onboarding-call'
    : params.type === 'support'
    ? 'support-call'
    : 'winback-call';

  const queryParams = new URLSearchParams({
    name: params.firstName,
    email: params.email,
    utm_source: 'email',
    utm_campaign: `customer-success-${params.type}`,
  });

  return `${calendlyBase}/${eventType}?${queryParams.toString()}`;
}

/**
 * Helper: Generate subscription cancellation URL with feedback
 */
export function generateCancellationUrl(params: {
  email: string;
  userId: number;
}): string {
  const queryParams = new URLSearchParams({
    email: params.email,
    user_id: params.userId.toString(),
    utm_source: 'email',
    utm_campaign: 'churn-prevention',
  });

  return `https://taxbridge.app/dashboard/subscription/cancel?${queryParams.toString()}`;
}
