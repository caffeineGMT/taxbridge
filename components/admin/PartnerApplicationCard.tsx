'use client';

/**
 * Partner Application Card Component
 * Shows partner details with approve/reject actions
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Mail, Phone, Globe, Briefcase, Loader2 } from 'lucide-react';
import { AffiliatePartner } from '@/lib/db/queries/affiliates';

interface Props {
  partner: AffiliatePartner;
}

export function PartnerApplicationCard({ partner }: Props) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const response = await fetch(`/api/admin/partners/${partner.id}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to approve partner');
      }

      router.refresh();
    } catch (error) {
      console.error('Error approving partner:', error);
      alert('Failed to approve partner');
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setIsRejecting(true);
    try {
      const response = await fetch(`/api/admin/partners/${partner.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject partner');
      }

      router.refresh();
    } catch (error) {
      console.error('Error rejecting partner:', error);
      alert('Failed to reject partner');
      setIsRejecting(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white text-xl">{partner.firm_name}</CardTitle>
            <p className="text-slate-400 mt-1">{partner.partner_name}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400 capitalize">
              {partner.partner_type.replace('_', ' ')}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-4 h-4 text-slate-500" />
            <a href={`mailto:${partner.email}`} className="hover:text-blue-400">
              {partner.email}
            </a>
          </div>
          {partner.phone && (
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-slate-500" />
              {partner.phone}
            </div>
          )}
          {partner.website && (
            <div className="flex items-center gap-2 text-slate-300">
              <Globe className="w-4 h-4 text-slate-500" />
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400"
              >
                {partner.website}
              </a>
            </div>
          )}
        </div>

        {/* Application Details */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Referral Code</span>
            <span className="text-white font-mono">{partner.referral_code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Commission Rate</span>
            <span className="text-emerald-400 font-semibold">
              {(partner.commission_rate * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Applied</span>
            <span className="text-white">
              {new Date(partner.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        {!showRejectForm ? (
          <div className="flex gap-3">
            <Button
              onClick={handleApprove}
              disabled={isApproving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isApproving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Partner
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowRejectForm(true)}
              variant="outline"
              className="flex-1 border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              placeholder="Reason for rejection (will be sent to applicant)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="bg-slate-900/50 border-slate-700 text-white resize-none"
            />
            <div className="flex gap-3">
              <Button
                onClick={handleReject}
                disabled={isRejecting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Confirm Rejection
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason('');
                }}
                variant="outline"
                className="flex-1 border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
