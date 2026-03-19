'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, MessageSquare } from 'lucide-react';

function CancellationSurveyContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({
    question1: '',
    question2: '',
    question3: '',
  });

  const surveyToken = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/survey/cancellation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: surveyToken,
          answers,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        toast({
          title: 'Thank you!',
          description: 'Your feedback has been submitted.',
        });
      } else {
        throw new Error('Failed to submit survey');
      }
    } catch (error) {
      console.error('Failed to submit survey:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit survey. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!surveyToken) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <Card className="bg-slate-900 border-slate-800 max-w-md">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-center">Invalid survey link.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <Card className="bg-slate-900 border-slate-800 max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Thank You!</h2>
            <p className="text-slate-400 mb-6">
              We appreciate your feedback. It helps us improve TaxBridge for everyone.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <Card className="bg-slate-900 border-slate-800 max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-500" />
            We're Sorry to See You Go
          </CardTitle>
          <CardDescription className="text-slate-400">
            Your feedback helps us improve TaxBridge. Please take a moment to answer these 3 questions.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question 1 */}
            <div className="space-y-3">
              <Label htmlFor="question1" className="text-slate-100 font-semibold">
                1. Why did you cancel your subscription?
              </Label>
              <textarea
                id="question1"
                value={answers.question1}
                onChange={(e) => setAnswers({ ...answers, question1: e.target.value })}
                required
                rows={4}
                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Please share your reason..."
              />
            </div>

            {/* Question 2 */}
            <div className="space-y-3">
              <Label htmlFor="question2" className="text-slate-100 font-semibold">
                2. What could we improve to win you back?
              </Label>
              <textarea
                id="question2"
                value={answers.question2}
                onChange={(e) => setAnswers({ ...answers, question2: e.target.value })}
                required
                rows={4}
                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="We'd love to hear your suggestions..."
              />
            </div>

            {/* Question 3 */}
            <div className="space-y-3">
              <Label htmlFor="question3" className="text-slate-100 font-semibold">
                3. Would you consider coming back if we made improvements?
              </Label>
              <select
                id="question3"
                value={answers.question3}
                onChange={(e) => setAnswers({ ...answers, question3: e.target.value })}
                required
                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select an option...</option>
                <option value="yes">Yes, definitely</option>
                <option value="maybe">Maybe, depends on the changes</option>
                <option value="no">No, probably not</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CancellationSurveyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <Card className="bg-slate-900 border-slate-800 max-w-md">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-center">Loading survey...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <CancellationSurveyContent />
    </Suspense>
  );
}
