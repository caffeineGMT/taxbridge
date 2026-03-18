'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const provinces = [
  { value: 'BC', label: 'British Columbia' },
  { value: 'ON', label: 'Ontario' },
  { value: 'QC', label: 'Quebec' },
  { value: 'AB', label: 'Alberta' },
];

const states = [
  { value: 'CA', label: 'California' },
  { value: 'WA', label: 'Washington' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
];

const filingStatuses = [
  { value: 'single', label: 'Single' },
  { value: 'married_joint', label: 'Married Filing Jointly' },
  { value: 'married_separate', label: 'Married Filing Separately' },
  { value: 'head_of_household', label: 'Head of Household' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [province, setProvince] = useState('');
  const [state, setState] = useState('');
  const [filingStatus, setFilingStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!province || !state || !filingStatus) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          province,
          state,
          filing_status: filingStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding data');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Failed to save your information. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background Grid Pattern */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px),
            repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-500 mb-2">Welcome to TaxBridge</h1>
          <p className="text-slate-400">Let's set up your tax profile</p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Tax Profile Setup</CardTitle>
            <CardDescription className="text-slate-400">
              Tell us about your tax residency to get accurate calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Canadian Province */}
              <div className="space-y-2">
                <Label htmlFor="province" className="text-slate-300">
                  Canadian Province
                </Label>
                <Select value={province} onValueChange={setProvince}>
                  <SelectTrigger
                    id="province"
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  >
                    <SelectValue placeholder="Select your province" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {provinces.map((p) => (
                      <SelectItem key={p.value} value={p.value} className="text-slate-100">
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500">
                  Your current province of residence in Canada
                </p>
              </div>

              {/* US State */}
              <div className="space-y-2">
                <Label htmlFor="state" className="text-slate-300">
                  US State (for RSU income)
                </Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger
                    id="state"
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  >
                    <SelectValue placeholder="Select your US state" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {states.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="text-slate-100">
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500">
                  The state where you worked when RSUs vested
                </p>
              </div>

              {/* Filing Status */}
              <div className="space-y-2">
                <Label htmlFor="filing-status" className="text-slate-300">
                  Filing Status
                </Label>
                <Select value={filingStatus} onValueChange={setFilingStatus}>
                  <SelectTrigger
                    id="filing-status"
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  >
                    <SelectValue placeholder="Select your filing status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {filingStatuses.map((fs) => (
                      <SelectItem key={fs.value} value={fs.value} className="text-slate-100">
                        {fs.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500">
                  Your US tax filing status
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {isSubmitting ? 'Saving...' : 'Continue to Dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
