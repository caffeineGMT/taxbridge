/**
 * Customer Interview Email Templates
 *
 * Templates for inviting paid users to participate in customer success interviews
 * to understand: (1) What problem did we solve? (2) What almost made them not buy?
 * (3) What would make them refer friends?
 */

export const CUSTOMER_INTERVIEW_TEMPLATES = {
  // Interview invitation email (sent to qualified paid users)
  INTERVIEW_INVITATION: process.env.SENDGRID_TEMPLATE_INTERVIEW_INVITE || 'd-interview-invite',
} as const;

/**
 * INTERVIEW INVITATION EMAIL
 *
 * PURPOSE: Invite paid users to participate in customer success interview
 * SUBJECT: "Quick favor? 15 min + $25 Amazon gift card"
 * CTA: "Book Interview Call →" or "Fill Out Survey →"
 */
export function getInterviewInvitationEmailData(params: {
  firstName: string;
  email: string;
  subscriptionTier: 'pro' | 'enterprise';
  daysSinceSubscription: number;
  calculationsCompleted: number;
  calendarUrl: string;
  surveyUrl: string;
}) {
  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: "Quick favor? 15 min + $25 Amazon gift card",
    headline: "Help shape the future of TaxBridge",

    // Context
    subscription_tier: params.subscriptionTier === 'enterprise' ? 'Enterprise' : 'Pro',
    days_since_subscription: params.daysSinceSubscription,
    calculations_completed: params.calculationsCompleted,

    // Why we're asking
    personal_message: `Hi ${params.firstName || 'there'},

I'm Michael, founder of TaxBridge. You've been a ${params.subscriptionTier === 'enterprise' ? 'Enterprise' : 'Pro'} subscriber for ${params.daysSinceSubscription} days now, and I'd love to learn from your experience.

I'm talking to a handful of our best customers to understand what's working, what's not, and what would make TaxBridge so good you'd tell all your H-1B/TN friends about it.`,

    // What's in it for them
    incentive: {
      call_option: "$25 Amazon gift card for a 15-min video call",
      survey_option: "$15 Amazon gift card for a 5-min survey",
      value_statement: "Your feedback will directly shape our roadmap - past interviews led to our multi-year planning feature!"
    },

    // What we'll ask about
    interview_topics: [
      {
        icon: "💡",
        question: "What problem did we solve?",
        description: "What was frustrating about cross-border taxes before TaxBridge?"
      },
      {
        icon: "🤔",
        question: "What almost made you not buy?",
        description: "What made you hesitate before subscribing? What convinced you?"
      },
      {
        icon: "📣",
        question: "What would make you refer friends?",
        description: "What feature or outcome would make you actively recommend us?"
      }
    ],

    // Time commitment
    time_commitment: {
      call: "15-20 minutes (video call via Zoom/Google Meet)",
      survey: "5 minutes (quick online survey)",
      scheduling: "Pick any time that works for you this week"
    },

    // Social proof - previous interviews
    previous_interviews: {
      count: 12,
      testimonial: {
        quote: "The interview was fun! I got to share my ideas and they actually built the feature I suggested (multi-year planning). Plus, $25 is $25. 😄",
        author: "Sarah L.",
        role: "Pro user"
      }
    },

    // CTAs
    book_call_url: params.calendarUrl,
    take_survey_url: params.surveyUrl,
    decline_url: `https://taxbridge.app/api/interviews/decline?email=${encodeURIComponent(params.email)}`,

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'michael@taxbridge.app',

    // UTM tracking
    utm_source: 'email',
    utm_medium: 'customer-success',
    utm_campaign: 'interview-invitation',
  };
}

/**
 * INTERVIEW CONFIRMATION EMAIL (after user books call)
 *
 * PURPOSE: Confirm interview details and set expectations
 * SUBJECT: "Interview confirmed - Tuesday 2pm PST (+ prep guide)"
 * CTA: "Add to Calendar →"
 */
export function getInterviewConfirmationEmailData(params: {
  firstName: string;
  email: string;
  interviewDate: Date;
  interviewTime: string;
  timezone: string;
  interviewFormat: 'video' | 'survey';
  videoCallUrl?: string;
}) {
  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: `Interview confirmed - ${params.interviewDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} ${params.interviewTime}`,
    headline: "Thanks for making time to chat!",

    // Interview details
    interview_date: params.interviewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    interview_time: params.interviewTime,
    timezone: params.timezone,
    duration: "15-20 minutes",
    format: params.interviewFormat === 'video' ? 'Video call (Zoom/Google Meet)' : 'Online survey',
    video_call_url: params.videoCallUrl || '',

    // What to expect
    what_to_expect: [
      "📝 Super casual conversation - no right or wrong answers",
      "💬 I'll ask about your experience with TaxBridge (what's working, what's not)",
      "💡 Your honest feedback will shape our roadmap",
      "🎁 You'll receive a $25 Amazon gift card within 24 hours after the call"
    ],

    // Questions we'll cover
    questions_preview: [
      "What problem did we solve for you?",
      "What almost made you not buy TaxBridge?",
      "What feature would make you refer friends?",
      "What's your #1 feature request?"
    ],

    // Prep (optional)
    optional_prep: `No prep needed, but if you want to think ahead:
- What were you doing for cross-border taxes before TaxBridge?
- What hesitations did you have before subscribing?
- Who do you know who might benefit from TaxBridge?`,

    // Reschedule option
    reschedule_url: `https://taxbridge.app/api/interviews/reschedule?email=${encodeURIComponent(params.email)}`,

    // CTAs
    add_to_calendar_url: params.videoCallUrl || '',
    join_call_url: params.videoCallUrl || '',

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'michael@taxbridge.app',

    // UTM tracking
    utm_source: 'email',
    utm_medium: 'customer-success',
    utm_campaign: 'interview-confirmation',
  };
}

/**
 * INTERVIEW THANK YOU EMAIL (after interview completed)
 *
 * PURPOSE: Thank user and deliver gift card
 * SUBJECT: "Thanks for your time! Here's your $25 gift card"
 * CTA: "Redeem Gift Card →"
 */
export function getInterviewThankYouEmailData(params: {
  firstName: string;
  email: string;
  giftCardCode: string;
  giftCardAmount: number;
  interviewDate: Date;
  keyInsights?: string[]; // What we learned
}) {
  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: `Thanks for your time! Here's your $${params.giftCardAmount} gift card`,
    headline: "You just helped make TaxBridge better for everyone!",

    // Gratitude
    thank_you_message: `Thank you so much for taking the time to chat with me${params.interviewDate ? ` on ${params.interviewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}` : ''}. Your feedback was incredibly valuable and will directly influence our product roadmap.`,

    // Gift card
    gift_card: {
      code: params.giftCardCode,
      amount: `$${params.giftCardAmount}`,
      redemption_url: "https://www.amazon.com/gc/redeem",
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      instructions: `To redeem your gift card:
1. Go to Amazon.com/gc/redeem
2. Enter code: ${params.giftCardCode}
3. Apply to your account or send to a friend`
    },

    // What we learned (optional - shows impact)
    key_insights: params.keyInsights || [],

    // What's next
    whats_next: [
      "🚀 I'll review all interview feedback and update our roadmap",
      "📧 You'll see your suggestions reflected in future product updates",
      "💬 Feel free to email me anytime with more ideas: michael@taxbridge.app"
    ],

    // Referral CTA (soft ask)
    soft_referral: {
      headline: "Know other H-1B/TN folks who need this?",
      description: "Share your referral link and you both get 2 months free:",
      referral_url: `https://taxbridge.app?ref=${encodeURIComponent(params.email)}`,
      incentive: "You get 2 months free for each friend who subscribes"
    },

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'michael@taxbridge.app',

    // UTM tracking
    utm_source: 'email',
    utm_medium: 'customer-success',
    utm_campaign: 'interview-thank-you',
  };
}

/**
 * Helper: Generate interview calendar URL with pre-filled data
 */
export function generateInterviewCalendarUrl(params: {
  firstName: string;
  email: string;
  userId: number;
  subscriptionTier: string;
}): string {
  // Replace with actual Calendly link when set up
  const calendlyBase = process.env.CALENDLY_INTERVIEW_URL || 'https://calendly.com/taxbridge-michael/customer-interview';

  const queryParams = new URLSearchParams({
    name: params.firstName,
    email: params.email,
    a1: params.subscriptionTier, // Calendly custom field
    a2: params.userId.toString(), // Calendly custom field
    utm_source: 'email',
    utm_campaign: 'customer-interview',
  });

  return `${calendlyBase}?${queryParams.toString()}`;
}

/**
 * Helper: Generate interview survey URL with pre-filled data
 */
export function generateInterviewSurveyUrl(params: {
  email: string;
  userId: number;
  subscriptionTier: string;
}): string {
  const baseUrl = 'https://taxbridge.app/survey/customer-interview';
  const queryParams = new URLSearchParams({
    email: params.email,
    user_id: params.userId.toString(),
    tier: params.subscriptionTier,
    utm_source: 'email',
    utm_campaign: 'customer-interview',
  });

  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Helper: Generate Amazon gift card code (mock - replace with actual API)
 */
export async function generateGiftCard(params: {
  amount: number;
  recipientEmail: string;
}): Promise<string> {
  // TODO: Integrate with Amazon Gift Card API or Tremendous API
  // For now, return a placeholder code
  const code = `TXBR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  console.log(`[GIFT CARD] Generated $${params.amount} gift card for ${params.recipientEmail}: ${code}`);

  // TODO: Store in database for tracking
  return code;
}
