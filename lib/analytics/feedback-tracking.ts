/**
 * Feedback Tracking Utilities
 *
 * Tracks user feedback through PostHog:
 * 1. NPS Survey (Net Promoter Score) - after checkout
 * 2. Helpfulness Rating - on calculator results
 * 3. Exit Intent Survey - bounce prevention
 */

import { trackEvent } from './posthog';

export type NPSScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface NPSFeedback {
  score: NPSScore;
  comment?: string;
  page: string;
  timestamp: Date;
}

export interface HelpfulnessFeedback {
  helpful: boolean;
  comment?: string;
  page: string;
  calculationAmount?: number;
  timestamp: Date;
}

export interface ExitIntentFeedback {
  reason?: string;
  email?: string;
  page: string;
  timeOnPage: number;
  timestamp: Date;
}

/**
 * Track NPS survey response
 */
export function trackNPSResponse(feedback: NPSFeedback) {
  const category = feedback.score >= 9 ? 'promoter' : feedback.score >= 7 ? 'passive' : 'detractor';

  trackEvent('nps_survey_completed', {
    nps_score: feedback.score,
    nps_category: category,
    nps_comment: feedback.comment,
    page: feedback.page,
    feedback_type: 'nps',
  });
}

/**
 * Track helpfulness rating
 */
export function trackHelpfulnessRating(feedback: HelpfulnessFeedback) {
  trackEvent('feedback_submitted', {
    helpful: feedback.helpful,
    comment: feedback.comment,
    page: feedback.page,
    calculation_amount: feedback.calculationAmount,
    feedback_type: 'helpfulness',
  });
}

/**
 * Track exit intent survey response
 */
export function trackExitIntentResponse(feedback: ExitIntentFeedback) {
  trackEvent('feedback_submitted', {
    exit_reason: feedback.reason,
    email_captured: !!feedback.email,
    page: feedback.page,
    time_on_page: feedback.timeOnPage,
    feedback_type: 'exit_intent',
  });
}

/**
 * Track survey dismissal (user closed without responding)
 */
export function trackSurveyDismissed(surveyType: 'nps' | 'helpfulness' | 'exit_intent', page: string) {
  trackEvent('feedback_submitted', {
    survey_type: surveyType,
    page,
    dismissed: true,
    feedback_type: 'dismissal',
  });
}

/**
 * Calculate NPS score from responses
 * NPS = (% Promoters - % Detractors)
 */
export function calculateNPS(responses: NPSScore[]): number {
  if (responses.length === 0) return 0;

  const promoters = responses.filter(score => score >= 9).length;
  const detractors = responses.filter(score => score <= 6).length;

  const promoterPercentage = (promoters / responses.length) * 100;
  const detractorPercentage = (detractors / responses.length) * 100;

  return Math.round(promoterPercentage - detractorPercentage);
}
