/**
 * Partner Signup Page
 * Public page for law firms and CPAs to apply for affiliate program
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Building2, User, Mail, Percent } from 'lucide-react';

export default function PartnerSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firm_name: '',
    partner_name: '',
    email: '',
    commission_rate_requested: 0.20,
    terms_accepted: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      commission_rate_requested: parseFloat(e.target.value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/partners/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return formData.firm_name.trim().length > 0;
      case 2:
        return formData.partner_name.trim().length > 0 && formData.email.trim().length > 0;
      case 3:
        return true;
      case 4:
        return formData.terms_accepted;
      default:
        return false;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Application Submitted!</h2>
          <p className="text-slate-300 mb-6">
            Thank you for your interest in the TaxBridge Partner Program. We'll review your application
            and send you an email within 2-3 business days.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="text-xl font-bold text-white">
              TaxBridge Partner Program
            </span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      s <= step
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-colors ${
                        s < step ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Firm Info</span>
              <span>Contact</span>
              <span>Commission</span>
              <span>Terms</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Firm Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100">Firm Information</h2>
                      <p className="text-slate-400">Tell us about your organization</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Firm Name *
                    </label>
                    <input
                      type="text"
                      name="firm_name"
                      value={formData.firm_name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., Smith & Associates Law Firm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Contact Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100">Contact Details</h2>
                      <p className="text-slate-400">Primary contact for this partnership</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="partner_name"
                      value={formData.partner_name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., Jane Smith"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="jane@smithlaw.com"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Commission Proposal */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Percent className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100">Commission Proposal</h2>
                      <p className="text-slate-400">Suggest your preferred commission rate</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-4">
                      Requested Commission Rate: {(formData.commission_rate_requested * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0.10"
                      max="0.30"
                      step="0.01"
                      value={formData.commission_rate_requested}
                      onChange={handleSliderChange}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>10%</span>
                      <span>20%</span>
                      <span>30%</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-slate-300 mb-3">Earnings Example</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pro Plan ($299/year)</span>
                        <span className="text-emerald-500 font-semibold">
                          ${(299 * formData.commission_rate_requested).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Enterprise Plan ($2,000/year)</span>
                        <span className="text-emerald-500 font-semibold">
                          ${(2000 * formData.commission_rate_requested).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-700">
                        <span className="text-slate-300 font-semibold">10 Pro customers/year</span>
                        <span className="text-emerald-500 font-bold">
                          ${(2990 * formData.commission_rate_requested).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    Note: Final commission rate will be confirmed during the approval process.
                  </p>
                </div>
              )}

              {/* Step 4: Terms & Acceptance */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-100 mb-2">Terms & Conditions</h2>
                    <p className="text-slate-400">Review and accept the partnership terms</p>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-6 max-h-80 overflow-y-auto">
                    <h3 className="font-semibold text-slate-200 mb-3">TaxBridge Partner Program Agreement</h3>
                    <div className="space-y-3 text-sm text-slate-400">
                      <p>1. <strong className="text-slate-300">Commission Structure:</strong> Commissions are calculated based on the subscription value of referred customers.</p>
                      <p>2. <strong className="text-slate-300">Payment Terms:</strong> Commissions are paid monthly via Stripe Connect within 30 days of the end of each month.</p>
                      <p>3. <strong className="text-slate-300">Tracking:</strong> Referrals are tracked via unique referral codes. Cookies valid for 30 days.</p>
                      <p>4. <strong className="text-slate-300">Refunds:</strong> If a referred customer requests a refund, the associated commission will be deducted.</p>
                      <p>5. <strong className="text-slate-300">Termination:</strong> Either party may terminate this agreement with 30 days notice. Outstanding commissions will be paid.</p>
                      <p>6. <strong className="text-slate-300">Compliance:</strong> Partner agrees to promote TaxBridge in compliance with all applicable laws and regulations.</p>
                      <p>7. <strong className="text-slate-300">Confidentiality:</strong> Partner agrees to maintain confidentiality of proprietary information.</p>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="terms_accepted"
                      checked={formData.terms_accepted}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                      required
                    />
                    <span className="text-sm text-slate-300">
                      I have read and agree to the TaxBridge Partner Program terms and conditions
                    </span>
                  </label>
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-3 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    Back
                  </button>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed(step)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!canProceed(step) || loading}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
