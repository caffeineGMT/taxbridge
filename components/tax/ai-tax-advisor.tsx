'use client';

import { useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RSUEntry {
  year: number;
  vestingDate: string;
  fmvUSD: number;
  shares: number;
  employer: string;
}

interface FTCResults {
  usTaxUSD: number;
  canadaTaxCAD: number;
  ftcCAD: number;
}

interface AITaxAdvisorProps {
  rsuEntries: RSUEntry[];
  province: string;
  state: string;
  ftcResults: FTCResults;
  filingStatus: string;
}

interface Recommendation {
  title: string;
  content: string;
}

export function AITaxAdvisor({
  rsuEntries,
  province,
  state,
  ftcResults,
  filingStatus,
}: AITaxAdvisorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string>('');
  const [feedback, setFeedback] = useState<number | null>(null);
  const [contextHash, setContextHash] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations('');
    setFeedback(null);

    try {
      const response = await fetch('/api/ai/tax-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rsuEntries,
          province,
          state,
          ftcResults,
          filingStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      // Get context hash from response header
      const hash = response.headers.get('X-Context-Hash') || '';
      setContextHash(hash);

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let streamedText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        streamedText += chunk;
        setRecommendations(streamedText);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError('Failed to generate recommendations. Please try again.');
      setIsLoading(false);
    }
  };

  const handleFeedback = async (feedbackValue: number) => {
    setFeedback(feedbackValue);

    try {
      await fetch('/api/ai/tax-advice', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contextHash,
          feedback: feedbackValue,
        }),
      });
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  // Parse recommendations into structured format
  const parseRecommendations = (text: string): Recommendation[] => {
    const sections = text.split('## ').filter(Boolean);
    return sections.map((section) => {
      const lines = section.split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      return { title, content };
    });
  };

  const parsedRecommendations = recommendations
    ? parseRecommendations(recommendations)
    : [];

  return (
    <div className="space-y-6">
      {/* AI Advisor Button */}
      {!recommendations && !isLoading && (
        <div className="flex justify-center">
          <Button
            onClick={handleGetRecommendations}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Get AI Tax Recommendations
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
          </div>
          <p className="text-slate-400 text-sm animate-pulse">
            Analyzing your tax situation...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="error">
          <AlertTriangle className="h-5 w-5" />
          <div className="ml-3">
            <h4 className="font-semibold text-red-900">Error</h4>
            <p className="text-red-800">{error}</p>
          </div>
        </Alert>
      )}

      {/* Streaming Content */}
      {recommendations && !isLoading && (
        <div className="space-y-6">
          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {parsedRecommendations.map((rec, index) => (
              <Card
                key={index}
                className="bg-slate-900/60 backdrop-blur-sm border-slate-700 shadow-xl"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-emerald-400 flex items-start gap-2">
                    <span className="text-2xl">{index + 1}</span>
                    <span>{rec.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <div
                      className="text-slate-300 text-sm space-y-3"
                      dangerouslySetInnerHTML={{
                        __html: rec.content
                          .replace(/\*\*(.+?)\*\*/g, '<strong class="text-emerald-400">$1</strong>')
                          .replace(/\n/g, '<br />')
                          .replace(/~\$([0-9,]+)/g, '<span class="text-2xl font-bold text-emerald-500">~\$$$1/year</span>'),
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feedback Buttons */}
          <div className="flex items-center justify-center gap-4 py-4">
            <p className="text-slate-400 text-sm">Was this helpful?</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(1)}
                disabled={feedback !== null}
                className={`border ${
                  feedback === 1
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                    : 'border-slate-600 hover:border-emerald-500'
                }`}
              >
                <ThumbsUp
                  className={`h-5 w-5 ${
                    feedback === 1 ? 'fill-emerald-500' : ''
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(-1)}
                disabled={feedback !== null}
                className={`border ${
                  feedback === -1
                    ? 'border-red-500 bg-red-500/10 text-red-500'
                    : 'border-slate-600 hover:border-red-500'
                }`}
              >
                <ThumbsDown
                  className={`h-5 w-5 ${feedback === -1 ? 'fill-red-500' : ''}`}
                />
              </Button>
            </div>
            {feedback !== null && (
              <p className="text-emerald-400 text-sm">Thank you for your feedback!</p>
            )}
          </div>

          {/* Disclaimer */}
          <Alert className="border-l-4 border-amber-500 bg-amber-50/5 border-amber-500/30">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div className="ml-3">
              <h4 className="font-semibold text-amber-400">Important Disclaimer</h4>
              <p className="text-amber-200/80 text-sm mt-1">
                AI-generated suggestions are for informational purposes only and do not
                constitute professional tax advice. Consult a licensed CPA or tax attorney
                before making any tax-related decisions.
              </p>
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
}
