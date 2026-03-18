/**
 * Partner Dashboard Page
 * Shows affiliate stats, referral link, and earnings
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import {
  Copy, Check, TrendingUp, Users, DollarSign, Clock,
  ExternalLink, Loader2,
} from 'lucide-react';

interface Partner {
  id: number;
  partner_name: string;
  firm_name: string;
  email: string;
  referral_code: string;
  commission_rate: number;
  status: string;
  total_referrals: number;
  total_revenue: number;
  created_at: string;
  approved_at: string | null;
}

interface Referral {
  id: number;
  user_masked: string;
  commission_amount: number;
  commission_status: string;
  created_at: string;
  paid_at: string | null;
}

export default function PartnerDashboardPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState<string>('');

  useEffect(() => {
    params.then((p) => setCode(p.code));
  }, [params]);

  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://taxbridge.app'}?ref=${code}`;

  useEffect(() => {
    if (code) {
      loadDashboardData();
    }
  }, [code]);

  const loadDashboardData = async () => {
    try {
      const response = await fetch(`/api/partners/dashboard/${code}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load dashboard');
      }

      setPartner(data.partner);
      setReferrals(data.referrals || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Access Denied</h2>
          <p className="text-slate-300 mb-6">
            {error || 'You do not have access to this partner dashboard.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const pendingCommissions = referrals
    .filter(r => r.commission_status === 'pending')
    .reduce((sum, r) => sum + r.commission_amount, 0);

  const paidCommissions = referrals
    .filter(r => r.commission_status === 'paid')
    .reduce((sum, r) => sum + r.commission_amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{partner.firm_name}</h1>
              <p className="text-slate-400 text-sm">Partner Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                partner.status === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-500'
                  : partner.status === 'pending'
                  ? 'bg-amber-500/20 text-amber-500'
                  : 'bg-red-500/20 text-red-500'
              }`}>
                {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Total Referrals */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-slate-500" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Referrals</h3>
            <p className="text-3xl font-bold text-slate-100">{partner.total_referrals}</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Earned</h3>
            <p className="text-3xl font-bold text-slate-100">${partner.total_revenue.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">
              {(partner.commission_rate * 100).toFixed(0)}% commission rate
            </p>
          </div>

          {/* Pending Payouts */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Pending Payouts</h3>
            <p className="text-3xl font-bold text-slate-100">${pendingCommissions.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">
              Paid: ${paidCommissions.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Referral Link Widget */}
        <div className="bg-gradient-to-br from-slate-800/60 to-emerald-900/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-100 mb-4">Your Referral Link</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-slate-900/50 border-2 border-emerald-500 rounded-lg px-4 py-3 text-slate-100 font-mono text-sm focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <p className="text-slate-400 text-sm mt-4">
            Share this link with your clients. When they sign up for a paid plan, you'll earn a commission.
          </p>

          {/* QR Code Placeholder */}
          <div className="mt-6 flex items-center gap-4">
            <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
              <p className="text-xs text-slate-500 text-center px-4">QR Code<br/>(to be implemented)</p>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Quick Tips</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Add the link to your email signature</li>
                <li>• Share on your website or blog</li>
                <li>• Include in client newsletters</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Referrals Table */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-slate-100">Recent Referrals</h2>
          </div>

          {referrals.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No referrals yet. Start sharing your link!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-slate-900/30">
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {referral.user_masked}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold ${
                        referral.commission_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        ${referral.commission_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          referral.commission_status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-amber-500/20 text-amber-500'
                        }`}>
                          {referral.commission_status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payout Information */}
        <div className="mt-8 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Payout Information</h3>
          <p className="text-slate-400 text-sm mb-4">
            Commissions are processed monthly via Stripe Connect. Payments are sent within 30 days
            after the end of each month for all pending commissions.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <ExternalLink className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-400">
              Stripe Connect setup: <span className="text-slate-500">(Coming soon)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
