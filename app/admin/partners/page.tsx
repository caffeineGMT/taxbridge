/**
 * Admin Partners Page
 * Manage affiliate partner applications and view stats
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle, XCircle, Clock, Users, DollarSign, TrendingUp,
  Mail, Building2, Percent, Loader2, ExternalLink,
} from 'lucide-react';

interface Partner {
  id: number;
  partner_name: string;
  firm_name: string;
  email: string;
  referral_code: string;
  commission_rate: number;
  status: 'pending' | 'approved' | 'rejected';
  total_referrals: number;
  total_revenue: number;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
}

export default function AdminPartnersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const response = await fetch('/api/admin/partners');
      if (!response.ok) {
        if (response.status === 403) {
          router.push('/');
          return;
        }
        throw new Error('Failed to load partners');
      }

      const data = await response.json();
      setPartners(data.partners);
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (partnerId: number) => {
    if (!confirm('Approve this partner application?')) return;

    setProcessingId(partnerId);
    try {
      const response = await fetch('/api/partners/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: partnerId,
          action: 'approve',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve partner');
      }

      const data = await response.json();
      alert(`Partner approved!\n\nReferral Link:\n${data.referral_link}`);

      await loadPartners();
    } catch (error: any) {
      alert(error.message || 'Failed to approve partner');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (partner: Partner) => {
    setSelectedPartner(partner);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedPartner) return;

    setProcessingId(selectedPartner.id);
    try {
      const response = await fetch('/api/partners/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: selectedPartner.id,
          action: 'reject',
          rejection_reason: rejectionReason || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject partner');
      }

      setShowRejectModal(false);
      await loadPartners();
    } catch (error: any) {
      alert(error.message || 'Failed to reject partner');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPartners = partners.filter(p =>
    filter === 'all' ? true : p.status === filter
  );

  const pendingCount = partners.filter(p => p.status === 'pending').length;
  const approvedCount = partners.filter(p => p.status === 'approved').length;
  const totalRevenue = partners.reduce((sum, p) => sum + p.total_revenue, 0);
  const totalReferrals = partners.reduce((sum, p) => sum + p.total_referrals, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Partner Management</h1>
              <p className="text-slate-400 text-sm">Admin Dashboard</p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              Back to Admin
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Pending</h3>
            <p className="text-3xl font-bold text-slate-100">{pendingCount}</p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Approved</h3>
            <p className="text-3xl font-bold text-slate-100">{approvedCount}</p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Referrals</h3>
            <p className="text-3xl font-bold text-slate-100">{totalReferrals}</p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Commissions</h3>
            <p className="text-3xl font-bold text-slate-100">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                filter === status
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'pending' && pendingCount > 0 && (
                <span className="ml-2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Partners Table */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Firm / Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No partners found
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-slate-900/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-200">{partner.firm_name}</p>
                            <p className="text-xs text-slate-400">{partner.partner_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Mail className="w-4 h-4 text-slate-500" />
                          {partner.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Percent className="w-4 h-4 text-slate-500" />
                          {(partner.commission_rate * 100).toFixed(0)}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          partner.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : partner.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {partner.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-slate-300">{partner.total_referrals} referrals</p>
                          <p className="text-emerald-500 font-semibold">${partner.total_revenue.toFixed(2)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(partner.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {partner.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(partner.id)}
                              disabled={processingId === partner.id}
                              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                            >
                              {processingId === partner.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleRejectClick(partner)}
                              disabled={processingId === partner.id}
                              className="bg-red-500 hover:bg-red-600 disabled:bg-slate-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : partner.status === 'approved' ? (
                          <a
                            href={`/partners/dashboard/${partner.referral_code}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400 text-sm"
                          >
                            View Dashboard
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500">
                            {partner.rejection_reason || 'Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedPartner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Reject Partner Application</h3>
            <p className="text-slate-400 text-sm mb-4">
              Rejecting: <strong className="text-slate-200">{selectedPartner.firm_name}</strong>
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Optional: Provide a reason for rejection..."
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={processingId !== null}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                {processingId === selectedPartner.id ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Confirm Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
