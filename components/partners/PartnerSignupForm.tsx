'use client';

/**
 * Partner Signup Form Component
 * Handles partner application submissions
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export function PartnerSignupForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      partner_name: formData.get('partner_name') as string,
      firm_name: formData.get('firm_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      website: formData.get('website') as string,
      partner_type: formData.get('partner_type') as string,
      message: formData.get('message') as string,
    };

    try {
      const response = await fetch('/api/partners/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit application');
      }

      const result = await response.json();

      // Redirect to success page
      router.push(`/partners/application-submitted?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="partner_name" className="text-slate-200">
            Your Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="partner_name"
            name="partner_name"
            type="text"
            required
            placeholder="John Smith"
            className="bg-slate-900/50 border-slate-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="firm_name" className="text-slate-200">
            Firm/Practice Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="firm_name"
            name="firm_name"
            type="text"
            required
            placeholder="Smith Immigration Law"
            className="bg-slate-900/50 border-slate-700 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-200">
          Business Email <span className="text-red-400">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="john@smithimmigration.com"
          className="bg-slate-900/50 border-slate-700 text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-slate-200">
            Phone Number
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            className="bg-slate-900/50 border-slate-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-slate-200">
            Website
          </Label>
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="https://smithimmigration.com"
            className="bg-slate-900/50 border-slate-700 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="partner_type" className="text-slate-200">
          Partner Type <span className="text-red-400">*</span>
        </Label>
        <select
          id="partner_type"
          name="partner_type"
          required
          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          <option value="immigration_lawyer">Immigration Lawyer</option>
          <option value="cpa">CPA (Certified Public Accountant)</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-slate-200">
          Tell us about your practice
        </Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder="How many H-1B/TN clients do you work with? What services do you provide?"
          className="bg-slate-900/50 border-slate-700 text-white resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Apply Now'
        )}
      </Button>

      <p className="text-xs text-slate-500 text-center">
        By applying, you agree to our Partner Terms and Commission Agreement
      </p>
    </form>
  );
}
