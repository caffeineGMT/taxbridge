/**
 * Influencer Affiliate Program Landing + Signup Page
 * Targeted at immigration bloggers, YouTubers, and forum moderators
 * Route: /affiliates
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, CheckCircle2, DollarSign, TrendingUp, Users, Trophy,
  Youtube, Globe, MessageSquare, Mic, Share2, BarChart3,
  ArrowRight, Star, Zap, Gift
} from 'lucide-react';

const PLATFORM_OPTIONS = [
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'blog', label: 'Blog / Website', icon: Globe },
  { value: 'instagram', label: 'Instagram', icon: Share2 },
  { value: 'tiktok', label: 'TikTok', icon: Zap },
  { value: 'twitter', label: 'Twitter / X', icon: MessageSquare },
  { value: 'forum', label: 'Forum', icon: Users },
  { value: 'linkedin', label: 'LinkedIn', icon: BarChart3 },
  { value: 'podcast', label: 'Podcast', icon: Mic },
  { value: 'other', label: 'Other', icon: Globe },
];

export default function AffiliateSignupPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    partner_name: '',
    channel_name: '',
    email: '',
    platform: '',
    platform_url: '',
    audience_size: '',
    content_niche: '',
    custom_slug: '',
    payout_method: 'stripe',
    paypal_email: '',
    terms_accepted: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value;
    setFormData(prev => ({
      ...prev,
      [target.name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/affiliates/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_name: formData.partner_name,
          firm_name: formData.channel_name,
          email: formData.email,
          partner_type: formData.platform === 'youtube' ? 'youtuber' :
            formData.platform === 'blog' ? 'blogger' :
            formData.platform === 'forum' ? 'forum_moderator' : 'influencer',
          platform: formData.platform,
          platform_url: formData.platform_url,
          audience_size: parseInt(formData.audience_size) || 0,
          content_niche: formData.content_niche,
          custom_referral_slug: formData.custom_slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
          payout_method: formData.payout_method,
          paypal_email: formData.paypal_email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Application Submitted!</h2>
          <p className="text-slate-300 mb-4">
            Welcome to the TaxBridge Affiliate Program! We'll review your application and
            get back to you within 24-48 hours.
          </p>
          <p className="text-slate-400 text-sm mb-6">
            Once approved, you'll get access to your custom referral link, marketing toolkit,
            and affiliate dashboard.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Return to Home
            </button>
            <button
              onClick={() => router.push('/affiliates/leaderboard')}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-3 rounded-lg transition-colors"
            >
              View Affiliate Leaderboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="text-xl font-bold text-white">TaxBridge Affiliates</span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </header>

      {!showForm ? (
        <>
          {/* Hero Section */}
          <section className="container mx-auto px-4 pt-20 pb-16 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm mb-6">
              <Gift className="w-4 h-4" />
              30% Recurring Commission
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Earn <span className="text-emerald-400">$89+</span> Per Referral,<br />
              <span className="text-blue-400">Every Year</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Join the TaxBridge Affiliate Program. Help your audience save thousands on cross-border taxes
              and earn 30% recurring commission on every subscription.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowForm(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                Apply Now <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#how-it-works"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-4 px-8 rounded-xl text-lg transition-colors border border-slate-600"
              >
                Learn More
              </a>
            </div>
          </section>

          {/* Stats */}
          <section className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: DollarSign, value: '30%', label: 'Recurring Commission', color: 'text-emerald-400' },
                { icon: Trophy, value: '$500', label: 'Monthly #1 Bonus', color: 'text-yellow-400' },
                { icon: TrendingUp, value: '$89+', label: 'Per Referral/Year', color: 'text-blue-400' },
                { icon: Users, value: '30-Day', label: 'Cookie Duration', color: 'text-purple-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 text-center">
                  <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works" className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: '1',
                  title: 'Apply & Get Approved',
                  description: 'Fill out the application below. We review within 24-48 hours. Get your custom referral link (e.g., /signup?ref=yourname).',
                },
                {
                  step: '2',
                  title: 'Share With Your Audience',
                  description: 'Use our pre-written blog posts, video scripts, social media content, and banner ads. We provide everything you need.',
                },
                {
                  step: '3',
                  title: 'Earn 30% Recurring',
                  description: 'Earn 30% of every subscription your referrals purchase - not just the first payment, but every renewal. Monthly payouts via Stripe or PayPal.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-xl p-8">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold text-xl mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Earnings Calculator */}
          <section className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-white text-center mb-4">Earning Potential</h2>
            <p className="text-slate-400 text-center mb-12">30% recurring commission on the $299/year Pro plan</p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { referrals: 5, monthly: '$37', annual: '$449', label: 'Getting Started' },
                { referrals: 25, monthly: '$187', annual: '$2,243', label: 'Growing' },
                { referrals: 100, monthly: '$748', annual: '$8,970', label: 'Top Performer' },
              ].map((tier, i) => (
                <div
                  key={i}
                  className={`border rounded-xl p-8 text-center ${
                    i === 2
                      ? 'bg-gradient-to-b from-emerald-900/40 to-slate-800/60 border-emerald-500/50'
                      : 'bg-slate-800/60 border-slate-700'
                  }`}
                >
                  {i === 2 && (
                    <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                      <Star className="w-3 h-3" /> Top Affiliate Bonus: +$500/mo
                    </div>
                  )}
                  <div className="text-sm text-slate-400 mb-2">{tier.label}</div>
                  <div className="text-lg text-slate-300 mb-1">{tier.referrals} referrals/month</div>
                  <div className="text-3xl font-bold text-emerald-400 mb-1">{tier.monthly}<span className="text-lg text-slate-500">/mo</span></div>
                  <div className="text-sm text-slate-500">{tier.annual}/year</div>
                </div>
              ))}
            </div>
          </section>

          {/* What You Get */}
          <section className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Your Affiliate Toolkit</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                { title: 'Pre-Written Blog Post', desc: 'SEO-optimized article about cross-border RSU tax savings, ready to publish on your blog.' },
                { title: 'YouTube Video Script', desc: '8-10 minute video script with hooks, talking points, and CTAs. Just record and publish.' },
                { title: 'Social Media Content', desc: 'Ready-to-post content for Twitter, LinkedIn, and Instagram with viral hooks.' },
                { title: 'Email Newsletter Template', desc: 'Professionally written email you can send to your subscriber list.' },
                { title: 'Banner Ads (8 Sizes)', desc: 'Professional banner ads in all standard sizes for your website sidebar, header, and mobile.' },
                { title: 'Example Testimonials', desc: 'Real user testimonials you can quote in your content (with permission).' },
                { title: 'Real-Time Dashboard', desc: 'Track clicks, conversions, commissions, and payouts in your affiliate dashboard.' },
                { title: 'Monthly Leaderboard', desc: 'Compete with other affiliates. #1 earns a $500 bonus, #2 gets $250, #3 gets $100.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Who Is This For */}
          <section className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Perfect For</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Youtube, title: 'Immigration YouTubers', desc: 'H-1B, TN, green card content creators with engaged audiences.' },
                { icon: Globe, title: 'Immigration Bloggers', desc: 'Writers covering US-Canada immigration, visa guides, and expat life.' },
                { icon: MessageSquare, title: 'Forum Moderators', desc: 'Active members of CanadaVisa, VisaJourney, Blind, and similar communities.' },
                { icon: Mic, title: 'Podcast Hosts', desc: 'Shows about immigration, cross-border finance, or tech careers.' },
                { icon: BarChart3, title: 'Financial Advisors', desc: 'CPAs, tax preparers, and financial planners serving cross-border clients.' },
                { icon: Share2, title: 'Social Media Creators', desc: 'LinkedIn, Twitter, Instagram creators in the immigration/finance space.' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 text-center">
                  <item.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600/20 to-emerald-600/20 border border-blue-500/30 rounded-2xl p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Earning?</h2>
              <p className="text-slate-300 mb-8">
                Join 50+ immigration content creators already earning recurring income with TaxBridge.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all inline-flex items-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                Apply Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </section>
        </>
      ) : (
        /* Application Form */
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-slate-400 hover:text-slate-200 mb-6 inline-block"
            >
              &larr; Back to overview
            </button>

            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-2">Affiliate Application</h2>
              <p className="text-slate-400 mb-8">Tell us about yourself and your platform. We review applications within 24-48 hours.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Your Name *</label>
                    <input
                      type="text"
                      name="partner_name"
                      value={formData.partner_name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Jane Smith"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Channel / Brand Name *</label>
                    <input
                      type="text"
                      name="channel_name"
                      value={formData.channel_name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Self Sponsored Visa"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="jane@example.com"
                    required
                  />
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Primary Platform *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORM_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, platform: opt.value }))}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-colors text-sm ${
                          formData.platform === opt.value
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-slate-900/50 border-slate-600 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Platform URL *</label>
                  <input
                    type="url"
                    name="platform_url"
                    value={formData.platform_url}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://youtube.com/@yourchannel"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Audience Size (approx.)</label>
                    <input
                      type="number"
                      name="audience_size"
                      value={formData.audience_size}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="10000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Content Niche</label>
                    <input
                      type="text"
                      name="content_niche"
                      value={formData.content_niche}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="H-1B immigration, taxes, tech careers"
                    />
                  </div>
                </div>

                {/* Custom Slug */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Custom Referral Slug</label>
                  <div className="flex items-center gap-0">
                    <span className="bg-slate-700 border border-slate-600 border-r-0 rounded-l-lg px-4 py-3 text-slate-400 text-sm whitespace-nowrap">
                      taxbridge.app/signup?ref=
                    </span>
                    <input
                      type="text"
                      name="custom_slug"
                      value={formData.custom_slug}
                      onChange={handleInputChange}
                      className="flex-1 bg-slate-900/50 border border-slate-600 rounded-r-lg px-4 py-3 text-emerald-400 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="yourname"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Letters, numbers, and hyphens only. We'll assign one if left blank.</p>
                </div>

                {/* Payout Method */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Payout Method *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, payout_method: 'stripe' }))}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        formData.payout_method === 'stripe'
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                          : 'bg-slate-900/50 border-slate-600 text-slate-400'
                      }`}
                    >
                      <DollarSign className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Stripe Connect</div>
                      <div className="text-xs opacity-75">Direct bank deposit</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, payout_method: 'paypal' }))}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        formData.payout_method === 'paypal'
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                          : 'bg-slate-900/50 border-slate-600 text-slate-400'
                      }`}
                    >
                      <Globe className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">PayPal</div>
                      <div className="text-xs opacity-75">International support</div>
                    </button>
                  </div>
                </div>

                {formData.payout_method === 'paypal' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">PayPal Email</label>
                    <input
                      type="email"
                      name="paypal_email"
                      value={formData.paypal_email}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="your@paypal.com"
                    />
                  </div>
                )}

                {/* Commission Info */}
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6">
                  <h3 className="font-semibold text-emerald-400 mb-3">Your Commission Structure</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Commission Rate</span>
                      <span className="text-emerald-400 font-bold">30% recurring</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Pro Plan ($299/yr) Commission</span>
                      <span className="text-emerald-400 font-bold">$89.70/year per referral</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Enterprise Plan ($2,000/yr)</span>
                      <span className="text-emerald-400 font-bold">$600/year per referral</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-emerald-500/20">
                      <span className="text-slate-300">Cookie Duration</span>
                      <span className="text-emerald-400 font-bold">30 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Payout Schedule</span>
                      <span className="text-emerald-400 font-bold">Monthly</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">#1 Monthly Bonus</span>
                      <span className="text-yellow-400 font-bold">$500</span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="terms_accepted"
                    checked={formData.terms_accepted}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                    required
                  />
                  <span className="text-sm text-slate-300">
                    I agree to the TaxBridge Affiliate Program terms. I will promote TaxBridge
                    honestly and in compliance with FTC disclosure guidelines.
                  </span>
                </label>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!formData.terms_accepted || !formData.platform || loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl text-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>Submit Application <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>Questions? Contact us at affiliates@taxbridge.app</p>
          <p className="mt-2">TaxBridge Affiliate Program &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
