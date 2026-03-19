/**
 * Influencer Affiliate Dashboard
 * Private dashboard for approved affiliates to track performance
 * Route: /affiliates/dashboard/[code]
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2, TrendingUp, Users, DollarSign, MousePointer,
  Copy, CheckCircle2, BarChart3, ArrowUpRight, Download,
  Trophy, Clock, CreditCard, FileText, Share2, ExternalLink
} from 'lucide-react';

interface DashboardData {
  partner: {
    id: number;
    partner_name: string;
    firm_name: string;
    email: string;
    referral_code: string;
    commission_rate: number;
    status: string;
    created_at: string;
    approved_at: string;
  };
  stats: {
    totalClicks: number;
    totalReferrals: number;
    totalRevenue: number;
    pendingCommission: number;
    paidCommission: number;
    conversionRate: number;
    last30DaysClicks: number;
    last30DaysReferrals: number;
  };
  referrals: any[];
  payouts: any[];
  leaderboardPosition: number | null;
  referralUrl: string;
}

export default function AffiliateDashboard() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'payouts' | 'toolkit'>('overview');

  useEffect(() => {
    fetchDashboard();
  }, [code]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`/api/affiliates/dashboard/${code}`);
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to load dashboard');
        return;
      }

      if (result.message && result.partner?.status !== 'approved') {
        setError(result.message);
        return;
      }

      setData(result);
    } catch (err) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (data?.referralUrl) {
      navigator.clipboard.writeText(data.referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Dashboard Not Available</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/affiliates')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Back to Affiliate Program
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
            <div>
              <span className="text-lg font-bold text-white">{data.partner.firm_name}</span>
              <span className="text-sm text-slate-400 ml-2">Affiliate Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/affiliates/leaderboard')}
              className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <Trophy className="w-4 h-4" /> Leaderboard
            </button>
            <button
              onClick={() => router.push('/')}
              className="text-sm text-slate-400 hover:text-slate-200"
            >
              Home
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Referral Link Bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-8 flex items-center gap-4">
          <span className="text-sm text-slate-400 whitespace-nowrap">Your referral link:</span>
          <div className="flex-1 bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-emerald-400 text-sm font-mono truncate">
            {data.referralUrl}
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Clicks', value: data.stats.totalClicks, icon: MousePointer, color: 'text-blue-400', sub: `${data.stats.last30DaysClicks} last 30d` },
            { label: 'Total Referrals', value: data.stats.totalReferrals, icon: Users, color: 'text-purple-400', sub: `${data.stats.last30DaysReferrals} last 30d` },
            { label: 'Pending Commission', value: `$${data.stats.pendingCommission.toFixed(2)}`, icon: Clock, color: 'text-yellow-400', sub: 'Awaiting payout' },
            { label: 'Paid Commission', value: `$${data.stats.paidCommission.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400', sub: 'Total earned' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">{stat.label}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
            <BarChart3 className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{data.stats.conversionRate.toFixed(1)}%</div>
            <div className="text-sm text-slate-400">Conversion Rate</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
            <DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{(data.partner.commission_rate * 100).toFixed(0)}%</div>
            <div className="text-sm text-slate-400">Commission Rate</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
            <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">
              {data.leaderboardPosition ? `#${data.leaderboardPosition}` : '--'}
            </div>
            <div className="text-sm text-slate-400">Leaderboard Rank</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1 mb-6 max-w-md">
          {[
            { key: 'overview' as const, label: 'Overview', icon: BarChart3 },
            { key: 'referrals' as const, label: 'Referrals', icon: Users },
            { key: 'payouts' as const, label: 'Payouts', icon: CreditCard },
            { key: 'toolkit' as const, label: 'Toolkit', icon: FileText },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
                activeTab === tab.key
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={copyLink}
                  className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">Share Link</div>
                    <div className="text-xs text-slate-400">Copy your referral URL</div>
                  </div>
                </button>
                <a
                  href={`/api/affiliates/toolkit/${code}`}
                  target="_blank"
                  className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5 text-emerald-400" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">Download Toolkit</div>
                    <div className="text-xs text-slate-400">Blog posts, scripts, graphics</div>
                  </div>
                </a>
                <button
                  onClick={() => router.push('/affiliates/leaderboard')}
                  className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">View Leaderboard</div>
                    <div className="text-xs text-slate-400">See your ranking</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Partner Name</span>
                  <span className="text-white">{data.partner.partner_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Channel</span>
                  <span className="text-white">{data.partner.firm_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Commission Rate</span>
                  <span className="text-emerald-400 font-semibold">{(data.partner.commission_rate * 100).toFixed(0)}% recurring</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Member Since</span>
                  <span className="text-white">{new Date(data.partner.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Referral Code</span>
                  <span className="text-blue-400 font-mono">{data.partner.referral_code}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Status</span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-xs font-semibold uppercase">
                    {data.partner.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Referral History</h3>
            </div>
            {data.referrals.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No referrals yet. Share your link to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left px-6 py-3 text-slate-400 font-medium">User</th>
                      <th className="text-left px-6 py-3 text-slate-400 font-medium">Date</th>
                      <th className="text-left px-6 py-3 text-slate-400 font-medium">Commission</th>
                      <th className="text-left px-6 py-3 text-slate-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.referrals.map((ref: any, i: number) => (
                      <tr key={i} className="border-t border-slate-700/50">
                        <td className="px-6 py-4 text-white">{ref.user_masked}</td>
                        <td className="px-6 py-4 text-slate-400">{new Date(ref.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-emerald-400 font-semibold">${ref.commission_amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            ref.commission_status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {ref.commission_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Payout History</h3>
            </div>
            {data.payouts.length === 0 ? (
              <div className="p-12 text-center">
                <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No payouts yet. Commissions are paid monthly when you have a balance.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left px-6 py-3 text-slate-400 font-medium">Period</th>
                      <th className="text-left px-6 py-3 text-slate-400 font-medium">Amount</th>
                      <th className="text-left px-6 py-3 text-slate-400 font-medium">Method</th>
                      <th className="text-left px-6 py-3 text-slate-400 font-medium">Status</th>
                      <th className="text-left px-6 py-3 text-slate-400 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payouts.map((payout: any, i: number) => (
                      <tr key={i} className="border-t border-slate-700/50">
                        <td className="px-6 py-4 text-white">
                          {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-emerald-400 font-semibold">${payout.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-slate-300 capitalize">{payout.payout_method}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            payout.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                            payout.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                            payout.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {payout.processed_at ? new Date(payout.processed_at).toLocaleDateString() : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'toolkit' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Marketing Toolkit</h3>
              <p className="text-slate-400 mb-6">
                Download ready-to-use content for your blog, YouTube channel, social media, and email list.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Blog Post', desc: 'SEO-optimized article about cross-border RSU tax savings', icon: FileText },
                  { title: 'YouTube Script', desc: '8-10 minute video script with hooks and CTAs', icon: ExternalLink },
                  { title: 'Social Media Posts', desc: 'Twitter, LinkedIn, and Instagram content', icon: Share2 },
                  { title: 'Email Template', desc: 'Ready-to-send newsletter about TaxBridge', icon: ExternalLink },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                    <item.icon className="w-8 h-8 text-blue-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-white">{item.title}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href={`/api/affiliates/toolkit/${code}`}
                target="_blank"
                className="mt-6 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" /> Download Full Toolkit
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
