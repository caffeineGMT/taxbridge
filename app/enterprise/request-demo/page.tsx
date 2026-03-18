'use client';

import { useState } from 'react';
import { Building2, Mail, Phone, Users, Briefcase, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RequestDemoPage() {
  const [formData, setFormData] = useState({
    firm_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    clients_count: '',
    current_tax_software: '',
    pain_points: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/enterprise/demo-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit demo request');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-12 text-center">
          <div className="bg-emerald-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-100 mb-4">Demo Request Received!</h2>
          <p className="text-slate-400 text-lg mb-6">
            Thank you for your interest in TaxBridge Enterprise. Our team will contact you within 24 hours to schedule a personalized demo.
          </p>
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-6 mb-8">
            <p className="text-blue-300 text-sm mb-2">
              <strong>What happens next:</strong>
            </p>
            <ul className="text-left text-slate-300 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                You'll receive an email confirmation at <strong>{formData.contact_email}</strong>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                A TaxBridge specialist will reach out to schedule your 30-minute demo
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                We'll prepare a custom ROI analysis for your firm
              </li>
            </ul>
          </div>
          <div className="flex gap-4 justify-center">
            <Link
              href="/enterprise/calculator"
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Calculate ROI
            </Link>
            <Link
              href="/"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px),
            repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px)
          `,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-emerald-500">TaxBridge</div>
          </Link>
          <Link
            href="/demo"
            className="text-slate-300 hover:text-emerald-500 font-medium transition-colors"
          >
            View Demo
          </Link>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column - Info */}
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-900/20 border border-emerald-700/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Building2 className="h-4 w-4" />
                Enterprise Solution
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6">
                Request a Personalized Demo
              </h1>

              <p className="text-xl text-slate-400 mb-8">
                See how TaxBridge Enterprise can save your immigration law firm or corporate tax department hundreds of hours managing H-1B/TN visa cross-border tax filings.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-600 rounded-lg p-3 flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-100 font-semibold mb-2">Multi-Client Management</h3>
                    <p className="text-slate-400 text-sm">
                      Manage 10-100+ clients from a single dashboard. Bulk import, automated calculations, white-label reports.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 rounded-lg p-3 flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-100 font-semibold mb-2">API Integration</h3>
                    <p className="text-slate-400 text-sm">
                      Connect to QuickBooks, Xero, or TaxAct. Automate data sync and reduce manual entry.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-amber-600 rounded-lg p-3 flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-100 font-semibold mb-2">Dedicated Support</h3>
                    <p className="text-slate-400 text-sm">
                      Priority phone/email support, dedicated account manager, custom onboarding.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-slate-100 font-semibold mb-3">Trusted by leading firms:</h3>
                <div className="grid grid-cols-2 gap-4 text-slate-400 text-sm">
                  <div>✓ Smith Immigration LLP</div>
                  <div>✓ TechVisa Partners</div>
                  <div>✓ Global Mobility Tax</div>
                  <div>✓ Cross-Border CPA</div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-6">Get Started Today</h2>

              {error && (
                <div className="bg-red-900/20 border border-red-700/30 text-red-400 rounded-lg p-4 mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Firm Name */}
                <div>
                  <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
                    <Building2 className="h-4 w-4 text-emerald-500" />
                    Firm / Organization Name *
                  </label>
                  <input
                    type="text"
                    name="firm_name"
                    required
                    value={formData.firm_name}
                    onChange={handleChange}
                    placeholder="e.g., Smith Immigration LLP"
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Contact Name */}
                <div>
                  <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="contact_name"
                    required
                    value={formData.contact_name}
                    onChange={handleChange}
                    placeholder="e.g., Jennifer Smith"
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
                    <Mail className="h-4 w-4 text-amber-500" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    required
                    value={formData.contact_email}
                    onChange={handleChange}
                    placeholder="jennifer@smithimmigration.com"
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
                    <Phone className="h-4 w-4 text-purple-500" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Client Count */}
                <div>
                  <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
                    <Users className="h-4 w-4 text-emerald-500" />
                    Number of H-1B/TN Clients *
                  </label>
                  <select
                    name="clients_count"
                    required
                    value={formData.clients_count}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select range</option>
                    <option value="1-10">1-10 clients</option>
                    <option value="11-25">11-25 clients</option>
                    <option value="26-50">26-50 clients</option>
                    <option value="51-100">51-100 clients</option>
                    <option value="100+">100+ clients</option>
                  </select>
                </div>

                {/* Current Software */}
                <div>
                  <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    Current Tax Software
                  </label>
                  <input
                    type="text"
                    name="current_tax_software"
                    value={formData.current_tax_software}
                    onChange={handleChange}
                    placeholder="e.g., Excel, QuickBooks, TurboTax, None"
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Pain Points */}
                <div>
                  <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
                    <MessageSquare className="h-4 w-4 text-amber-500" />
                    Biggest Pain Points
                  </label>
                  <textarea
                    name="pain_points"
                    value={formData.pain_points}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about your current challenges with cross-border tax filings..."
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Schedule Demo
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                <p className="text-slate-500 text-xs text-center">
                  By submitting this form, you agree to receive communications from TaxBridge.
                  We'll contact you within 24 hours to schedule your personalized demo.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
