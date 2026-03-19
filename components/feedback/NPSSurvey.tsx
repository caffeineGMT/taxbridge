/**
 * NPS Survey Component
 *
 * Net Promoter Score survey that appears after successful checkout
 * Tracks customer satisfaction and likelihood to recommend
 */

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { trackNPSResponse, trackSurveyDismissed, type NPSScore } from '@/lib/analytics/feedback-tracking';

interface NPSSurveyProps {
  trigger?: 'checkout' | 'dashboard' | 'manual';
  onComplete?: () => void;
  autoShow?: boolean;
  delayMs?: number;
}

export function NPSSurvey({
  trigger = 'checkout',
  onComplete,
  autoShow = true,
  delayMs = 2000,
}: NPSSurveyProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedScore, setSelectedScore] = useState<NPSScore | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if user already submitted NPS for this session
    const hasSubmitted = sessionStorage.getItem('nps_submitted');
    if (hasSubmitted) return;

    // Auto-show after delay
    if (autoShow) {
      const timer = setTimeout(() => setIsVisible(true), delayMs);
      return () => clearTimeout(timer);
    }
  }, [autoShow, delayMs]);

  const handleScoreClick = (score: NPSScore) => {
    setSelectedScore(score);
  };

  const handleSubmit = async () => {
    if (selectedScore === null) return;

    setIsSubmitting(true);

    // Track NPS response
    trackNPSResponse({
      score: selectedScore,
      comment: comment.trim() || undefined,
      page: window.location.pathname,
      timestamp: new Date(),
    });

    // Store in sessionStorage to prevent showing again
    sessionStorage.setItem('nps_submitted', 'true');

    // Optional: Send to backend API
    try {
      await fetch('/api/feedback/nps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: selectedScore,
          comment: comment.trim() || null,
          trigger,
          page: window.location.pathname,
        }),
      });
    } catch (error) {
      console.error('Failed to submit NPS:', error);
      // Still show success even if API fails - PostHog event was sent
    }

    setIsSubmitting(false);
    setSubmitted(true);

    // Auto-hide after 2 seconds
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2000);
  };

  const handleDismiss = () => {
    trackSurveyDismissed('nps', window.location.pathname);
    sessionStorage.setItem('nps_submitted', 'true');
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible) return null;

  const scoreLabels = {
    low: 'Not at all likely',
    high: 'Extremely likely',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md animate-in slide-in-from-bottom-5">
      <Card className="border-2 border-emerald-500 bg-slate-900 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg text-slate-100">
                {submitted ? 'Thank you! 🎉' : 'Quick question!'}
              </CardTitle>
              <CardDescription>
                {submitted
                  ? 'Your feedback helps us improve'
                  : 'How likely are you to recommend TaxBridge to a friend?'}
              </CardDescription>
            </div>
            {!submitted && (
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-100 transition-colors"
                aria-label="Close survey"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardHeader>

        {!submitted ? (
          <CardContent className="space-y-4">
            {/* NPS Score Selector (0-10) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400 px-1">
                <span>{scoreLabels.low}</span>
                <span>{scoreLabels.high}</span>
              </div>
              <div className="grid grid-cols-11 gap-1">
                {([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as NPSScore[]).map((score) => {
                  const isSelected = selectedScore === score;
                  const isPromoter = score >= 9;
                  const isDetractor = score <= 6;

                  return (
                    <button
                      key={score}
                      onClick={() => handleScoreClick(score)}
                      className={`
                        h-10 rounded-lg font-semibold transition-all hover:scale-110 active:scale-95
                        ${isSelected
                          ? isPromoter
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                            : isDetractor
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
                            : 'bg-amber-500 text-white shadow-lg shadow-amber-500/50'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        }
                      `}
                    >
                      {score}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Comment */}
            {selectedScore !== null && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label htmlFor="nps-comment" className="text-sm text-slate-300">
                  {selectedScore >= 9
                    ? "What do you love most? (optional)"
                    : selectedScore >= 7
                    ? "What could we improve? (optional)"
                    : "What's the main reason for your score? (optional)"}
                </label>
                <Textarea
                  id="nps-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Your feedback helps us improve..."
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
                  rows={2}
                />
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={selectedScore === null || isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </CardContent>
        ) : (
          <CardContent className="text-center py-6">
            <p className="text-emerald-400 font-medium">
              We appreciate you taking the time to share your thoughts!
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
