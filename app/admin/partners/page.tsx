/**
 * Admin Partner Approval Page
 * Review and approve/reject partner applications
 */

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getAffiliatePartnersByStatus } from '@/lib/db/queries/affiliates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PartnerApplicationCard } from '@/components/admin/PartnerApplicationCard';
import { Users, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPartnersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/admin/partners');
  }

  // TODO: Add admin role check
  // For now, anyone can access (should be restricted to admins only)

  const pendingPartners = getAffiliatePartnersByStatus('pending');
  const approvedPartners = getAffiliatePartnersByStatus('approved');
  const rejectedPartners = getAffiliatePartnersByStatus('rejected');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Partner Management</h1>
          <p className="text-slate-400">Review and approve partnership applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-amber-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400">{pendingPartners.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-emerald-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Approved Partners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">{approvedPartners.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-red-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{rejectedPartners.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Applications */}
        {pendingPartners.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Pending Applications</h2>
            <div className="space-y-4">
              {pendingPartners.map((partner) => (
                <PartnerApplicationCard key={partner.id} partner={partner} />
              ))}
            </div>
          </div>
        )}

        {pendingPartners.length === 0 && (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardContent className="py-12 text-center text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pending applications</p>
            </CardContent>
          </Card>
        )}

        {/* Approved Partners */}
        {approvedPartners.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Active Partners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedPartners.map((partner) => (
                <Card key={partner.id} className="bg-slate-800/50 border-emerald-500/30 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{partner.firm_name}</CardTitle>
                    <p className="text-sm text-slate-400">{partner.partner_name}</p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Referrals</span>
                      <span className="text-white font-semibold">{partner.total_referrals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Revenue Generated</span>
                      <span className="text-emerald-400 font-semibold">
                        ${partner.total_revenue.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type</span>
                      <span className="text-white capitalize">{partner.partner_type.replace('_', ' ')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
