'use client';

/**
 * User Interview Response Form
 *
 * Landing page for paid customers to submit feedback.
 * Accessed via unique link from email campaign.
 * Offers $25 Amazon gift card incentive.
 */

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

function UserInterviewForm() {
  const searchParams = useSearchParams();
  const customerId = searchParams?.get('id') || '';
  const token = searchParams?.get('token') || '';
  const email = searchParams?.get('email') || '';
  const name = searchParams?.get('name') || '';
  const plan = searchParams?.get('plan') || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    almostStoppedMe: '',
    pricePerception: 'just-right',
    missingFeatures: '',
    competitorConsidered: '',
    overallExperience: '4',
    additionalFeedback: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/user-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          email,
          name,
          plan,
          token,
          responses: formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit response');
      }

      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit response. Please try again or email michael@taxbridge.app');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!customerId || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h1>
          <p className="text-gray-600">
            This link appears to be invalid or expired. Please check your email for the correct link
            or contact <a href="mailto:support@taxbridge.app" className="text-blue-600 hover:underline">support@taxbridge.app</a>
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Your feedback has been recorded. This is incredibly valuable for making TaxBridge better.
            </p>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
              <div className="text-4xl font-bold text-green-600 mb-2">$25 Amazon Gift Card</div>
              <p className="text-gray-700">
                Your gift card will be sent to <strong>{email}</strong> within the next 24 hours.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Check your inbox (and spam folder just in case!)
              </p>
            </div>

            <p className="text-gray-600">
              If you have any questions or more feedback, feel free to email me directly at{' '}
              <a href="mailto:michael@taxbridge.app" className="text-blue-600 hover:underline">
                michael@taxbridge.app
              </a>
            </p>

            <p className="text-gray-500 text-sm mt-6">
              — Michael Guo, Founder of TaxBridge
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">Hi {name || 'there'}! 👋</h1>
            <p className="text-purple-100 text-lg">
              Your honest feedback is worth <strong className="text-yellow-300">$25</strong>
            </p>
          </div>

          {/* Gift Card Banner */}
          <div className="bg-green-50 border-b-2 border-green-200 p-6 text-center">
            <div className="text-4xl mb-2">🎁</div>
            <div className="text-2xl font-bold text-green-700">$25 Amazon Gift Card</div>
            <p className="text-green-600 text-sm mt-1">Sent within 24 hours of submission</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Main Question */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                🎯 What almost stopped you from buying TaxBridge? *
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Be brutally honest. Was it the price? A missing feature? A competitor? Something broken or confusing?
                Your answer helps us fix things for the next person.
              </p>
              <Textarea
                required
                rows={6}
                value={formData.almostStoppedMe}
                onChange={(e) => setFormData({ ...formData, almostStoppedMe: e.target.value })}
                placeholder="Example: The price seemed high compared to SimpleTax at $29/year. I almost left but decided the FTC optimizer was worth it..."
                className="w-full"
              />
            </div>

            {/* Price Perception */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                💰 How did you feel about the price? *
              </label>
              <RadioGroup
                value={formData.pricePerception}
                onValueChange={(value) => setFormData({ ...formData, pricePerception: value })}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="too-expensive" id="expensive" />
                    <Label htmlFor="expensive">Too expensive — I hesitated before buying</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="just-right" id="just-right" />
                    <Label htmlFor="just-right">Just right — Fair value for what I got</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cheap" id="cheap" />
                    <Label htmlFor="cheap">Actually cheap — I'd pay more</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Missing Features */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                🔧 What features were you hoping for but didn't find?
              </label>
              <p className="text-sm text-gray-600 mb-3">Optional — but super helpful for our roadmap</p>
              <Textarea
                rows={4}
                value={formData.missingFeatures}
                onChange={(e) => setFormData({ ...formData, missingFeatures: e.target.value })}
                placeholder="Example: I wanted to compare different tax scenarios side-by-side, or export to TurboTax..."
                className="w-full"
              />
            </div>

            {/* Competitor Considered */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                🥊 Did you consider any competitors before choosing us?
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Optional — If yes, which ones? What made you choose TaxBridge instead?
              </p>
              <Textarea
                rows={3}
                value={formData.competitorConsidered}
                onChange={(e) => setFormData({ ...formData, competitorConsidered: e.target.value })}
                placeholder="Example: I looked at Sprintax but their UI was confusing. TaxBridge was cleaner..."
                className="w-full"
              />
            </div>

            {/* Overall Experience */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                ⭐ Overall experience so far? *
              </label>
              <RadioGroup
                value={formData.overallExperience}
                onValueChange={(value) => setFormData({ ...formData, overallExperience: value })}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="exp5" />
                    <Label htmlFor="exp5">⭐⭐⭐⭐⭐ Amazing — Exceeded expectations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="exp4" />
                    <Label htmlFor="exp4">⭐⭐⭐⭐ Good — Met expectations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="exp3" />
                    <Label htmlFor="exp3">⭐⭐⭐ Okay — Gets the job done</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="exp2" />
                    <Label htmlFor="exp2">⭐⭐ Disappointing — Has issues</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="exp1" />
                    <Label htmlFor="exp1">⭐ Poor — Not working for me</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Additional Feedback */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                💭 Anything else you want to tell me?
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Optional — bugs, feature requests, compliments, complaints, random thoughts...
              </p>
              <Textarea
                rows={4}
                value={formData.additionalFeedback}
                onChange={(e) => setFormData({ ...formData, additionalFeedback: e.target.value })}
                placeholder="Example: The calculator is great but mobile layout is a bit cramped..."
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 text-lg"
            >
              {isSubmitting ? 'Submitting...' : 'Submit & Get My $25 Gift Card 🎁'}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By submitting, you confirm that your responses are honest and you're a TaxBridge {plan} customer.
              Gift card will be sent to {email} within 24 hours.
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>
            Questions? Email <a href="mailto:michael@taxbridge.app" className="text-blue-600 hover:underline">michael@taxbridge.app</a>
          </p>
          <p className="mt-2">TaxBridge · US-Canada Cross-Border Tax Calculator</p>
        </div>
      </div>
    </div>
  );
}

export default function UserInterviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading interview form...</p>
        </div>
      </div>
    }>
      <UserInterviewForm />
    </Suspense>
  );
}
