/**
 * Helpfulness Rating Component
 *
 * Simple thumbs up/down rating with optional comment
 * Appears on calculator results to gather immediate feedback
 */

'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { trackHelpfulnessRating, trackSurveyDismissed } from '@/lib/analytics/feedback-tracking';

interface HelpfulnessRatingProps {
  calculationAmount?: number;
  variant?: 'inline' | 'card';
  onSubmit?: (helpful: boolean) => void;
}

export function HelpfulnessRating({
  calculationAmount,
  variant = 'card',
  onSubmit,
}: HelpfulnessRatingProps) {
  const [selectedRating, setSelectedRating] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRatingClick = (helpful: boolean) => {
    setSelectedRating(helpful);
  };

  const handleSubmit = async () => {
    if (selectedRating === null) return;

    setIsSubmitting(true);

    // Track helpfulness rating
    trackHelpfulnessRating({
      helpful: selectedRating,
      comment: comment.trim() || undefined,
      page: window.location.pathname,
      calculationAmount,
      timestamp: new Date(),
    });

    // Optional: Send to backend API
    try {
      await fetch('/api/feedback/helpfulness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          helpful: selectedRating,
          comment: comment.trim() || null,
          calculationAmount,
          page: window.location.pathname,
        }),
      });
    } catch (error) {
      console.error('Failed to submit helpfulness rating:', error);
      // Still show success even if API fails - PostHog event was sent
    }

    setIsSubmitting(false);
    setSubmitted(true);
    onSubmit?.(selectedRating);
  };

  const content = (
    <div className="space-y-4">
      {!submitted ? (
        <>
          {/* Question */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Was this helpful?</h3>
            <p className="text-sm text-slate-400">
              Your feedback helps us improve our tax calculator
            </p>
          </div>

          {/* Thumbs Up/Down Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleRatingClick(true)}
              className={`
                flex flex-col items-center gap-2 p-6 rounded-xl transition-all hover:scale-105 active:scale-95
                ${selectedRating === true
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }
              `}
              aria-label="Helpful"
            >
              <ThumbsUp className="h-8 w-8" />
              <span className="text-sm font-medium">Yes</span>
            </button>

            <button
              onClick={() => handleRatingClick(false)}
              className={`
                flex flex-col items-center gap-2 p-6 rounded-xl transition-all hover:scale-105 active:scale-95
                ${selectedRating === false
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }
              `}
              aria-label="Not helpful"
            >
              <ThumbsDown className="h-8 w-8" />
              <span className="text-sm font-medium">No</span>
            </button>
          </div>

          {/* Optional Comment */}
          {selectedRating !== null && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label htmlFor="helpfulness-comment" className="text-sm text-slate-300">
                {selectedRating
                  ? "What did you find most helpful? (optional)"
                  : "What could we improve? (optional)"}
              </label>
              <Textarea
                id="helpfulness-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  selectedRating
                    ? "Tell us what worked well..."
                    : "Tell us what's missing or confusing..."
                }
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
                rows={2}
              />
            </div>
          )}

          {/* Submit Button */}
          {selectedRating !== null && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-emerald-400 font-medium text-lg">Thank you! 🙏</p>
          <p className="text-sm text-slate-400 mt-1">
            Your feedback helps us make this tool better for everyone
          </p>
        </div>
      )}
    </div>
  );

  if (variant === 'inline') {
    return <div className="py-4">{content}</div>;
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardContent className="pt-6">{content}</CardContent>
    </Card>
  );
}
