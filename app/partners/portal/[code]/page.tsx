/**
 * Enhanced Partner Portal with Analytics & Marketing Resources
 * Advanced dashboard for CPA/Accountant partners
 * Route: /partners/portal/[code]
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import {
  Loader2,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Download,
  Mail,
  Share2,
  BarChart3,
  FileText,
  Copy,
  CheckCircle2,
  Calendar,
  Target,
  ExternalLink
} from 'lucide-react';

interface PartnerStats {
  total_referrals: number;
  total_revenue: number;
  pending_commissions: number;
  paid_commissions: number;
  conversion_rate: number;
  avg_commission: number;
  last_30_days: number;
  monthly_trend: Array<{ month: string; count: number; revenue: number }>;
}

interface PartnerInfo {
  id: number;
  firm_name: string;
  partner_name: string;
  email: string;
  referral_code: string;
  commission_rate: number;
  status: string;
  created_at: string;
  approved_at: string;
}

export default function EnhancedPartnerPortal() {
  const params = useParams();
  const { isLoaded, userId, getToken } = useAuth();
  const code = params.code as string;

  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app'}/p/${code}`;

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      window.location.href = '/auth/sign-in';
      return;
    }

    fetchPartnerData();
  }, [isLoaded, userId, code]);

  const fetchPartnerData = async () => {
    try {
      const token = await getToken();

      const response = await fetch(`/api/partners/portal/${code}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load partner data');
      }

      setPartner(data.partner);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarketingKit = () => {
    // Trigger download of marketing materials PDF
    window.open(`/api/partners/marketing-kit/${code}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !partner || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-4">Access Denied</h1>
          <p className="text-slate-400">{error || 'Unable to load partner portal'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                T
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Partner Portal</h1>
                <p className="text-sm text-slate-400">{partner.firm_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">
                Commission: <span className="text-emerald-400 font-semibold">{(partner.commission_rate * 100).toFixed(0)}%</span>
              </span>
              <a
                href="/"
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Exit Portal
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-sm text-slate-400">Total</span>
            </div>
            <p className="text-3xl font-bold text-slate-100 mb-1">{stats.total_referrals}</p>
            <p className="text-sm text-slate-400">Referrals</p>
            <p className="text-xs text-emerald-400 mt-2">+{stats.last_30_days} last 30 days</p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="text-sm text-slate-400">Earned</span>
            </div>
            <p className="text-3xl font-bold text-slate-100 mb-1">${stats.total_revenue.toFixed(2)}</p>
            <p className="text-sm text-slate-400">Total Revenue</p>
            <p className="text-xs text-slate-500 mt-2">Avg: ${stats.avg_commission.toFixed(2)} per referral</p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <span className="text-sm text-slate-400">Pending</span>
            </div>
            <p className="text-3xl font-bold text-slate-100 mb-1">${stats.pending_commissions.toFixed(2)}</p>
            <p className="text-sm text-slate-400">Awaiting Payout</p>
            <p className="text-xs text-slate-500 mt-2">Paid: ${stats.paid_commissions.toFixed(2)}</p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-sm text-slate-400">Rate</span>
            </div>
            <p className="text-3xl font-bold text-slate-100 mb-1">{stats.conversion_rate.toFixed(1)}%</p>
            <p className="text-sm text-slate-400">Conversion Rate</p>
            <p className="text-xs text-slate-500 mt-2">Industry avg: 2-3%</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Referral Link Widget */}
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-500" />
                Your Co-Branded Landing Page
              </h2>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralUrl}
                    readOnly
                    className="flex-1 bg-slate-900/50 border border-emerald-500/30 rounded-lg px-4 py-3 text-slate-300 text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(referralUrl)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="flex gap-2">
                  <a
                    href={referralUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Preview Landing Page
                  </a>
                  <button
                    onClick={() => copyToClipboard(`Check out TaxBridge for cross-border tax calculations: ${referralUrl}`)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Copy Email Text
                  </button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <h3 className="text-sm font-semibold text-emerald-400 mb-2">Quick Sharing Tips</h3>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• Email to clients with cross-border income (H-1B, TN visa holders)</li>
                  <li>• Share in immigration law firm newsletters</li>
                  <li>• Add to your email signature</li>
                  <li>• Post on LinkedIn for professional network</li>
                  <li>• Include in year-end tax planning communications</li>
                </ul>
              </div>
            </div>

            {/* Marketing Resources */}
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-500" />
                Marketing Resources
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={downloadMarketingKit}
                  className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg p-4 text-left transition-colors group"
                >
                  <FileText className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-slate-200 mb-1">Marketing Kit PDF</h3>
                  <p className="text-xs text-slate-400">Logos, banners, and email templates</p>
                </button>

                <button
                  onClick={() => window.open(`/api/partners/email-templates/${code}`, '_blank')}
                  className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg p-4 text-left transition-colors group"
                >
                  <Mail className="w-8 h-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-slate-200 mb-1">Email Templates</h3>
                  <p className="text-xs text-slate-400">5 pre-written client emails</p>
                </button>

                <button
                  onClick={() => window.open(`/api/partners/social-posts/${code}`, '_blank')}
                  className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg p-4 text-left transition-colors group"
                >
                  <Share2 className="w-8 h-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-slate-200 mb-1">Social Media Posts</h3>
                  <p className="text-xs text-slate-400">LinkedIn, Twitter ready content</p>
                </button>

                <button
                  onClick={() => window.open(`/api/partners/performance-report/${code}`, '_blank')}
                  className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg p-4 text-left transition-colors group"
                >
                  <BarChart3 className="w-8 h-8 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-slate-200 mb-1">Performance Report</h3>
                  <p className="text-xs text-slate-400">Monthly stats and insights</p>
                </button>
              </div>
            </div>

            {/* Monthly Performance Chart */}
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Monthly Performance
              </h2>

              <div className="space-y-3">
                {stats.monthly_trend.map((month, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-slate-400">{month.month}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">{month.count} referrals</span>
                        <span className="text-xs text-emerald-400">${month.revenue.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((month.revenue / stats.total_revenue) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Right column */}
          <div className="space-y-6">
            {/* Partner Info Card */}
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <h3 className="font-semibold text-slate-100 mb-4">Partner Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500">Firm</p>
                  <p className="text-slate-200 font-medium">{partner.firm_name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Contact</p>
                  <p className="text-slate-200">{partner.partner_name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="text-slate-200 text-xs">{partner.email}</p>
                </div>
                <div>
                  <p className="text-slate-500">Commission Rate</p>
                  <p className="text-emerald-400 font-semibold">{(partner.commission_rate * 100).toFixed(0)}% recurring</p>
                </div>
                <div>
                  <p className="text-slate-500">Partner Since</p>
                  <p className="text-slate-200">{new Date(partner.approved_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Commission Info */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-6">
              <h3 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Commission Structure
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pro Plan ($299/yr)</span>
                  <span className="text-slate-200 font-semibold">${(299 * partner.commission_rate).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Enterprise ($2,000/yr)</span>
                  <span className="text-slate-200 font-semibold">${(2000 * partner.commission_rate).toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-emerald-500/30">
                  <p className="text-xs text-slate-400">
                    Commissions paid monthly via Stripe Connect within 30 days of month end.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <h3 className="font-semibold text-slate-100 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <a
                  href="mailto:support@taxbridge.app"
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Contact Support
                </a>
                <button
                  onClick={() => window.open('/docs/partner-guide.pdf', '_blank')}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Partner Guide
                </button>
              </div>
            </div>

            {/* Payout Schedule */}
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <h3 className="font-semibold text-slate-100 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Next Payout
              </h3>
              <p className="text-2xl font-bold text-slate-100 mb-1">
                {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-xs text-slate-400">
                Estimated: ${stats.pending_commissions.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
