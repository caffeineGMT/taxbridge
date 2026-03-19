/**
 * Exit Intent Survey Component
 *
 * Detects when user is about to leave the page and shows a quick survey
 * Triggers on:
 * 1. Mouse moving towards top of screen (to close tab)
 * 2. Mobile: back button press
 * 3. Time-based (after 10s with no interaction)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackExitIntentResponse, trackSurveyDismissed } from '@/lib/analytics/feedback-tracking';

interface ExitIntentSurveyProps {
  enabled?: boolean;
  sensitivityMs?: number;
  excludePaths?: string[];
}

export function ExitIntentSurvey({
  enabled = true,
  sensitivityMs = 10000, // Wait 10s before showing
  excludePaths = ['/dashboard', '/settings'],
}: ExitIntentSurveyProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pageLoadTime] = useState(Date.now());

  const shouldShow = useCallback(() => {
    // Don't show if disabled
    if (!enabled) return false;

    // Don't show if already submitted
    if (sessionStorage.getItem('exit_survey_submitted')) return false;

    // Don't show on excluded paths
    const currentPath = window.location.pathname;
    if (excludePaths.some(path => currentPath.startsWith(path))) return false;

    // Only show after minimum time on page
    const timeOnPage = Date.now() - pageLoadTime;
    if (timeOnPage < sensitivityMs) return false;

    return true;
  }, [enabled, excludePaths, pageLoadTime, sensitivityMs]);

  useEffect(() => {
    if (!enabled) return;

    let hasTriggered = false;

    // Exit Intent Detection - Mouse leaving top of viewport
    const handleMouseLeave = (e: MouseEvent) => {
      if (hasTriggered) return;
      if (!shouldShow()) return;

      // Detect mouse moving to top of screen (to close tab/window)
      if (e.clientY <= 10 && e.movementY < 0) {
        hasTriggered = true;
        setIsVisible(true);
      }
    };

    // Mobile: Detect back button navigation
    const handlePopState = () => {
      if (hasTriggered) return;
      if (!shouldShow()) return;

      hasTriggered = true;
      setIsVisible(true);

      // Prevent navigation briefly to show survey
      window.history.pushState(null, '', window.location.href);
    };

    // Desktop: Mouse leave at top
    document.addEventListener('mouseleave', handleMouseLeave);

    // Mobile: Back button
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enabled, shouldShow]);

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
  };

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);

    const timeOnPage = Date.now() - pageLoadTime;

    // Track exit intent response
    trackExitIntentResponse({
      reason: selectedReason,
      email: email.trim() || undefined,
      page: window.location.pathname,
      timeOnPage: Math.round(timeOnPage / 1000), // seconds
      timestamp: new Date(),
    });

    // Optional: Send to backend API
    try {
      await fetch('/api/feedback/exit-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: selectedReason,
          email: email.trim() || null,
          page: window.location.pathname,
          timeOnPage: Math.round(timeOnPage / 1000),
        }),
      });
    } catch (error) {
      console.error('Failed to submit exit intent survey:', error);
    }

    // Mark as submitted
    sessionStorage.setItem('exit_survey_submitted', 'true');

    setIsSubmitting(false);
    setSubmitted(true);

    // Auto-hide after 2 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 2000);
  };

  const handleDismiss = () => {
    trackSurveyDismissed('exit_intent', window.location.pathname);
    sessionStorage.setItem('exit_survey_submitted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const exitReasons = [
    "I'm just browsing",
    "Too confusing to use",
    "Missing features I need",
    "Too expensive",
    "Don't trust the calculations",
    "I'll come back later",
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md mx-4 animate-in zoom-in-95 slide-in-from-bottom-4">
        <Card className="border-2 border-blue-500 bg-slate-900 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl text-slate-100">
                  {submitted ? "Thank you! 🙏" : "Wait! Before you go..."}
                </CardTitle>
                <CardDescription>
                  {submitted
                    ? "Your feedback helps us improve"
                    : "Help us understand what we're missing"}
                </CardDescription>
              </div>
              {!submitted && (
                <button
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-slate-100 transition-colors"
                  aria-label="Close survey"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </CardHeader>

          {!submitted ? (
            <CardContent className="space-y-4">
              {/* Reason Selection */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-300">What's stopping you?</p>
                <div className="grid grid-cols-2 gap-2">
                  {exitReasons.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => handleReasonSelect(reason)}
                      className={`
                        p-3 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] active:scale-95
                        ${selectedReason === reason
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        }
                      `}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Email Capture */}
              {selectedReason && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label htmlFor="exit-email" className="text-sm text-slate-300 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Leave your email and we'll fix it (optional)
                  </label>
                  <Input
                    id="exit-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedReason || isSubmitting}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold"
                >
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Skip
                </Button>
              </div>
            </CardContent>
          ) : (
            <CardContent className="text-center py-6">
              <p className="text-blue-400 font-medium text-lg">
                We appreciate your feedback!
              </p>
              {email && (
                <p className="text-sm text-slate-400 mt-2">
                  We'll reach out to {email} soon
                </p>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
