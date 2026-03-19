/**
 * User Feedback Email Templates
 *
 * Templates for collecting conversion optimization feedback from paid and free users
 *
 * PAID USERS: "What almost stopped you from buying?"
 * FREE USERS: "Why didn't you upgrade?"
 */

export const USER_FEEDBACK_TEMPLATES = {
  PAID_PURCHASE_BARRIERS: process.env.SENDGRID_TEMPLATE_PAID_FEEDBACK || 'd-paid-feedback',
  FREE_UPGRADE_BARRIERS: process.env.SENDGRID_TEMPLATE_FREE_FEEDBACK || 'd-free-feedback',
} as const;

/**
 * PAID USER FEEDBACK EMAIL
 *
 * PURPOSE: Understand purchase barriers - what almost stopped them from buying
 * SUBJECT: "Quick favor? What almost stopped you from subscribing? ($10 gift card)"
 * CTA: "Share Feedback (2 min) →"
 */
export function getPaidUserFeedbackEmailData(params: {
  firstName: string;
  email: string;
  subscriptionTier: 'pro' | 'enterprise';
  daysSinceSubscription: number;
  calculationsCompleted: number;
  surveyUrl: string;
  campaignId: number;
}) {
  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: "Quick favor? What almost stopped you from subscribing? ($10 gift card)",
    preheader: "Help us understand what makes people hesitate - 2 min survey + $10 Amazon gift card",
    headline: "You almost didn't subscribe. What made you hesitate?",

    // Personal context
    subscription_tier: params.subscriptionTier === 'enterprise' ? 'Enterprise' : 'Pro',
    days_since_subscription: params.daysSinceSubscription,
    calculations_completed: params.calculationsCompleted,

    // Why we're asking
    personal_message: `Hi ${params.firstName || 'there'},

I'm Michael, founder of TaxBridge. You've been a ${params.subscriptionTier === 'enterprise' ? 'Enterprise' : 'Pro'} subscriber for ${params.daysSinceSubscription} days now, and I need your help with something.

Before you subscribed, you probably had some doubts. Maybe the price felt high. Maybe you weren't sure if it would work for your situation. Maybe you almost clicked away.

**I want to know what almost stopped you.**

Not because I'm nosy - but because there are probably 100 people right now who are hesitating for the same reasons you did. If I can understand what made YOU almost not subscribe, I can fix that for them.`,

    // What's in it for them
    incentive: {
      amount: "$10 Amazon gift card",
      time_required: "2 minutes (4 quick questions)",
      value_statement: "Your answers will directly shape our messaging and help more H-1B/TN workers solve their tax problems"
    },

    // The ONE key question
    key_question: {
      icon: "🤔",
      question: "What almost stopped you from subscribing?",
      examples: [
        "Was the price higher than you expected?",
        "Did you worry the calculator wouldn't work for your situation?",
        "Were you comparing us to a CPA or other tool?",
        "Did something about the website feel untrustworthy?",
        "Was there a feature you thought was missing?"
      ]
    },

    // Other questions (preview)
    other_questions: [
      "What ultimately convinced you to subscribe?",
      "What other solutions did you consider?",
      "What would have made you buy sooner?"
    ],

    // Social proof
    previous_responses: {
      count: 23,
      testimonial: {
        quote: "Honestly, the $79/year price made me pause. I was comparing to H&R Block ($50) and didn't realize TaxBridge saves me $800/year in tax prep fees. The multi-year calculator sold me - that's a feature CPAs don't offer.",
        author: "David K.",
        role: "Pro user, Meta (H-1B → Vancouver)"
      }
    },

    // CTA
    survey_url: params.surveyUrl,
    decline_url: `https://taxbridge.app/api/feedback/decline?email=${encodeURIComponent(params.email)}&campaign=${params.campaignId}`,

    // Time commitment
    time_commitment: "2 minutes, 4 questions, $10 gift card delivered within 24 hours",

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'michael@taxbridge.app',

    // UTM tracking
    utm_source: 'email',
    utm_medium: 'feedback-campaign',
    utm_campaign: 'paid-purchase-barriers',
  };
}

/**
 * FREE USER FEEDBACK EMAIL
 *
 * PURPOSE: Understand upgrade barriers - why haven't they upgraded
 * SUBJECT: "Quick question: What's stopping you from upgrading? ($10 gift card)"
 * CTA: "Share Feedback (2 min) →"
 */
export function getFreeUserFeedbackEmailData(params: {
  firstName: string;
  email: string;
  daysSinceSignup: number;
  calculationsCompleted: number;
  lastCalculationDate?: Date;
  surveyUrl: string;
  campaignId: number;
}) {
  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: "Quick question: What's stopping you from upgrading? ($10 gift card)",
    preheader: "Help us understand what would make you upgrade - 2 min survey + $10 Amazon gift card",
    headline: "You've used the free calculator. What would make you upgrade?",

    // Personal context
    days_since_signup: params.daysSinceSignup,
    calculations_completed: params.calculationsCompleted,
    last_calculation_date: params.lastCalculationDate?.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }) || 'recently',

    // Why we're asking
    personal_message: `Hi ${params.firstName || 'there'},

I'm Michael, founder of TaxBridge. You've completed ${params.calculationsCompleted} tax ${params.calculationsCompleted === 1 ? 'calculation' : 'calculations'} using our free calculator, but you haven't upgraded to Pro.

That's totally fine! The free tier exists so you can try before you buy.

But I'm curious: **what's stopping you?**

Is the Pro plan too expensive? Not enough value? Missing a feature you need? Or maybe you just haven't had time to think about it yet?

I want to know because if 100 people are hesitating for the same reason you are, I need to fix that. Maybe it's a pricing issue. Maybe it's a messaging issue. Maybe we're missing a killer feature.`,

    // What's in it for them
    incentive: {
      amount: "$10 Amazon gift card",
      time_required: "2 minutes (4 quick questions)",
      value_statement: "Your honest answer will help us build a better product that actually solves your problem"
    },

    // The ONE key question
    key_question: {
      icon: "💭",
      question: "What's the main reason you haven't upgraded?",
      examples: [
        "Price is too high - what would be a fair price?",
        "Value isn't clear - what outcome would justify $79/year?",
        "Free tier is enough - what feature would make you want more?",
        "Missing a feature - what would make this a no-brainer?",
        "Trying before buying - what would build trust?",
        "Comparing to alternatives - what tool are you using instead?"
      ]
    },

    // Other questions (preview)
    other_questions: [
      "What would make upgrading a no-brainer?",
      "How much would you be willing to pay?",
      "What other tools are you using instead?"
    ],

    // Social proof - recent upgrades
    recent_upgrades: {
      count: 12,
      timeframe: "this week",
      testimonial: {
        quote: "I was stuck on free for 3 weeks because I wasn't sure if it would save me money. Then I realized my CPA would charge $600 for this - $79/year is a steal. Wish I upgraded sooner!",
        author: "Sarah L.",
        role: "Upgraded from Free → Pro last week"
      }
    },

    // Current Pro features (reminder of what they're missing)
    pro_features_reminder: [
      "📊 Multi-year tax planning (optimize FTC across 5 years)",
      "💾 Unlimited RSU import from CSV (vs. 5 manual entries)",
      "📧 Tax deadline reminders + filing checklist",
      "📞 Email support from founder (15-min response time)",
      "📄 PDF tax summary export for your CPA"
    ],

    // CTA
    survey_url: params.surveyUrl,
    decline_url: `https://taxbridge.app/api/feedback/decline?email=${encodeURIComponent(params.email)}&campaign=${params.campaignId}`,

    // Soft upgrade offer (optional - after survey)
    upgrade_offer: {
      headline: "Liked what you read?",
      description: "Use code FEEDBACK20 for 20% off your first year of Pro ($63 instead of $79)",
      cta: "Upgrade Now →",
      url: `https://taxbridge.app/pricing?code=FEEDBACK20&utm_source=email&utm_campaign=free-feedback`
    },

    // Time commitment
    time_commitment: "2 minutes, 4 questions, $10 gift card delivered within 24 hours",

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'michael@taxbridge.app',

    // UTM tracking
    utm_source: 'email',
    utm_medium: 'feedback-campaign',
    utm_campaign: 'free-upgrade-barriers',
  };
}

/**
 * THANK YOU EMAIL (after feedback submission)
 *
 * PURPOSE: Thank user and deliver gift card
 * SUBJECT: "Thanks for your feedback! Here's your $10 gift card"
 * CTA: "Redeem Gift Card →"
 */
export function getFeedbackThankYouEmailData(params: {
  firstName: string;
  email: string;
  giftCardCode: string;
  giftCardAmount: number;
  feedbackType: 'paid' | 'free';
  keyInsights?: string[]; // What we learned from their response
}) {
  return {
    first_name: params.firstName || 'there',
    email: params.email,
    subject: `Thanks for your feedback! Here's your $${params.giftCardAmount} gift card`,
    headline: "Your feedback just made TaxBridge better!",

    // Gratitude
    thank_you_message: `Thank you so much for taking the time to share your honest feedback. Your answers are going straight into our roadmap for the next quarter.

${params.feedbackType === 'paid'
      ? "Understanding what almost stopped you from subscribing helps us fix those barriers for future customers. You're literally helping more H-1B/TN workers solve their cross-border tax problems."
      : "Understanding why you haven't upgraded yet helps us build features that are actually worth paying for. You're making the product better for everyone."
    }`,

    // Gift card
    gift_card: {
      code: params.giftCardCode,
      amount: `$${params.giftCardAmount}`,
      redemption_url: "https://www.amazon.com/gc/redeem",
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      instructions: `To redeem your gift card:
1. Go to Amazon.com/gc/redeem
2. Enter code: ${params.giftCardCode}
3. Apply to your account or send to a friend`
    },

    // What we learned (personalized based on their response)
    key_insights: params.keyInsights || [],

    // What's next
    whats_next: [
      "📊 I'll review all feedback responses and identify patterns",
      "🛠️ Top pain points will be fixed in the next product update",
      "📣 You'll see your suggestions reflected in future releases",
      "💬 Feel free to email me anytime: michael@taxbridge.app"
    ],

    // Soft CTA (only for free users)
    ...(params.feedbackType === 'free' && {
      upgrade_offer: {
        headline: "Ready to upgrade? Here's 20% off.",
        description: "Use code FEEDBACK20 for $63/year (instead of $79) - expires in 7 days",
        cta: "Upgrade Now →",
        url: "https://taxbridge.app/pricing?code=FEEDBACK20&utm_source=email&utm_campaign=feedback-thank-you"
      }
    }),

    // Footer
    unsubscribe_url: `https://taxbridge.app/unsubscribe?email=${encodeURIComponent(params.email)}`,
    support_email: 'michael@taxbridge.app',

    // UTM tracking
    utm_source: 'email',
    utm_medium: 'feedback-campaign',
    utm_campaign: 'feedback-thank-you',
  };
}

/**
 * Helper: Generate feedback survey URL with pre-filled data
 */
export function generateFeedbackSurveyUrl(params: {
  email: string;
  userId: number | null;
  userType: 'paid' | 'free';
  campaignId: number;
}): string {
  const baseUrl = 'https://taxbridge.app/survey/user-feedback';
  const queryParams = new URLSearchParams({
    email: params.email,
    user_id: params.userId?.toString() || '',
    user_type: params.userType,
    campaign_id: params.campaignId.toString(),
    utm_source: 'email',
    utm_campaign: `${params.userType}-feedback`,
  });

  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Helper: Generate Amazon gift card code (mock - replace with actual API)
 */
export async function generateFeedbackGiftCard(params: {
  amount: number;
  recipientEmail: string;
  recipientName: string;
}): Promise<string> {
  // TODO: Integrate with Amazon Gift Card API, Tremendous API, or Rybbon
  // For now, return a placeholder code

  const code = `TXBR-FEEDBACK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  console.log(`[GIFT CARD] Generated $${params.amount} gift card for ${params.recipientEmail} (${params.recipientName}): ${code}`);

  // TODO: Store in database for tracking and audit trail
  return code;
}

/**
 * Helper: Log feedback email sent
 */
export async function logFeedbackEmailSent(params: {
  campaignId: number;
  userId: number | null;
  email: string;
  subject: string;
  templateId: string;
}): Promise<void> {
  // This would insert into feedback_email_tracking table
  console.log(`[FEEDBACK EMAIL] Logged email sent to ${params.email} for campaign ${params.campaignId}`);
}
