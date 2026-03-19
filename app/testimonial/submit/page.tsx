'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Check, Upload } from 'lucide-react';

// Force dynamic rendering since this page uses searchParams
export const dynamic = 'force-dynamic';

function TestimonialSubmitForm() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('request_id');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    company: '',
    location: '',
    testimonial: '',
    savingsAmount: '',
    rating: 5,
    videoUrl: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          savingsAmount: parseInt(formData.savingsAmount) || 0,
          requestId,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit testimonial. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <Card className="max-w-lg border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-4">
              Thank You! 🎉
            </h2>
            <p className="text-slate-400 mb-6">
              Your testimonial has been submitted and we've added <strong className="text-emerald-400">1 month free</strong> to your subscription!
            </p>
            <p className="text-sm text-slate-500">
              We'll review your testimonial and may feature it on our website to help other H-1B/TN workers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-3">
            Share Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">TaxBridge</span> Experience
          </h1>
          <p className="text-slate-400">
            Help fellow H-1B/TN workers - get <strong className="text-emerald-400">1 month free</strong>!
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-100">Your Success Story</CardTitle>
            <CardDescription className="text-slate-400">
              Share how TaxBridge helped you navigate cross-border taxes
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Role & Company */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="Senior Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="Meta, Google, etc."
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  placeholder="Toronto, ON"
                />
              </div>

              {/* Testimonial */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Your Testimonial *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.testimonial}
                  onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                  placeholder="Share your experience: How did TaxBridge help you? What was your aha moment? Would you recommend it to friends?"
                />
                <p className="text-xs text-slate-500 mt-2">
                  💡 Mention specific features you loved and concrete results
                </p>
              </div>

              {/* Savings Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  How much did you save? (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    value={formData.savingsAmount}
                    onChange={(e) => setFormData({ ...formData, savingsAmount: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="3000"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Include CPA fees saved + tax optimization gains
                </p>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= formData.rating
                            ? 'fill-emerald-400 text-emerald-400'
                            : 'fill-slate-700 text-slate-700'
                        } hover:scale-110 transition-transform`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Video URL (Optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Video Testimonial (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="https://www.loom.com/share/..."
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  📹 Record a quick Loom video (30-60 seconds) for bonus impact!
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-lg py-6"
              >
                {isSubmitting ? 'Submitting...' : 'Submit & Get 1 Month Free 🎁'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TestimonialSubmitPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-6 py-16 text-center">Loading...</div>}>
      <TestimonialSubmitForm />
    </Suspense>
  );
}
