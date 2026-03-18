'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface ConferenceStats {
  id: string;
  name: string;
  location: string;
  dateRange: string;
  boothCost: number;
  stats: {
    total: number;
    hot: number;
    warm: number;
    cold: number;
    contacted: number;
    demos_scheduled: number;
    converted: number;
    total_revenue: number;
    followups_sent: number;
  };
}

interface Lead {
  id: number;
  conference_id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  title: string | null;
  phone: string | null;
  qualification: 'hot' | 'warm' | 'cold';
  status: string;
  notes: string | null;
  followup_sent: number;
  followup_sent_at: string | null;
  demo_scheduled_at: string | null;
  converted_at: string | null;
  revenue: number | null;
  created_at: string;
}

interface Summary {
  conferences: ConferenceStats[];
  totals: {
    totalLeads: number;
    totalConverted: number;
    totalRevenue: number;
    totalBoothCost: number;
    netRevenue: number;
    targetRevenue: number;
  };
}

export default function ConferenceDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selectedConference, setSelectedConference] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingFollowups, setSendingFollowups] = useState(false);
  const [followupResult, setFollowupResult] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchLeads = useCallback(async (conferenceId: string) => {
    const res = await fetch(`/api/conferences/leads?conference_id=${conferenceId}`);
    const data = await res.json();
    setLeads(data.leads || []);
  }, []);

  useEffect(() => {
    if (selectedConference) {
      fetchLeads(selectedConference);
    }
  }, [selectedConference, fetchLeads]);

  async function fetchSummary() {
    try {
      const res = await fetch('/api/conferences/stats');
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateLead(leadId: number, updates: Record<string, string | number | boolean>) {
    await fetch(`/api/conferences/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (selectedConference) fetchLeads(selectedConference);
    fetchSummary();
  }

  async function sendFollowups(conferenceId: string, dryRun = true) {
    setSendingFollowups(true);
    setFollowupResult(null);
    try {
      const res = await fetch('/api/conferences/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conference_id: conferenceId, dry_run: dryRun }),
      });
      const data = await res.json();
      if (dryRun) {
        setFollowupResult(`Preview: ${data.pending_count} emails ready to send`);
      } else {
        setFollowupResult(`Sent ${data.sent} emails${data.failed > 0 ? `, ${data.failed} failed` : ''}`);
        if (selectedConference) fetchLeads(selectedConference);
        fetchSummary();
      }
    } catch {
      setFollowupResult('Error sending followups');
    } finally {
      setSendingFollowups(false);
    }
  }

  const qualBadge = (q: string) => {
    const colors: Record<string, string> = {
      hot: 'bg-red-500/20 text-red-400 border-red-500/30',
      warm: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      cold: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return colors[q] || colors.warm;
  };

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      new: 'bg-slate-700 text-slate-300',
      contacted: 'bg-blue-500/20 text-blue-400',
      demo_scheduled: 'bg-purple-500/20 text-purple-400',
      demo_completed: 'bg-indigo-500/20 text-indigo-400',
      negotiating: 'bg-amber-500/20 text-amber-400',
      converted: 'bg-emerald-500/20 text-emerald-400',
      lost: 'bg-red-500/20 text-red-400',
    };
    return colors[s] || colors.new;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading conference dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Conference Booth Dashboard</h1>
            <p className="text-slate-400 mt-1">Lead capture, qualification, and follow-up management</p>
          </div>
          <Link href="/admin" className="text-slate-400 hover:text-white text-sm">
            Back to Admin
          </Link>
        </div>

        {/* Overall Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{summary.totals.totalLeads}</p>
              <p className="text-sm text-slate-400">Total Leads</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-emerald-400">{summary.totals.totalConverted}</p>
              <p className="text-sm text-slate-400">Converted</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-emerald-400">
                ${summary.totals.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-slate-400">Revenue</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-amber-400">
                ${summary.totals.totalBoothCost.toLocaleString()}
              </p>
              <p className="text-sm text-slate-400">Booth Investment</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className={`text-2xl font-bold ${summary.totals.netRevenue >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${summary.totals.netRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-slate-400">Net Revenue</p>
            </div>
          </div>
        )}

        {/* Conference Cards */}
        {summary && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {summary.conferences.map(conf => (
              <button
                key={conf.id}
                onClick={() => setSelectedConference(conf.id)}
                className={`text-left bg-slate-900 border rounded-xl p-6 transition-colors ${
                  selectedConference === conf.id
                    ? 'border-emerald-500'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{conf.name}</h3>
                    <p className="text-sm text-slate-400">{conf.location}</p>
                    <p className="text-xs text-slate-500">{conf.dateRange}</p>
                  </div>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">
                    ${conf.boothCost.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{conf.stats.total}</p>
                    <p className="text-xs text-slate-500">Leads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-400">{conf.stats.converted}</p>
                    <p className="text-xs text-slate-500">Converted</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-400">{conf.stats.demos_scheduled}</p>
                    <p className="text-xs text-slate-500">Demos</p>
                  </div>
                </div>

                <div className="flex gap-1 mt-3">
                  <div className="h-1.5 rounded-full bg-red-500/60" style={{ width: `${conf.stats.total > 0 ? (conf.stats.hot / conf.stats.total) * 100 : 0}%` }} />
                  <div className="h-1.5 rounded-full bg-amber-500/60" style={{ width: `${conf.stats.total > 0 ? (conf.stats.warm / conf.stats.total) * 100 : 0}%` }} />
                  <div className="h-1.5 rounded-full bg-blue-500/60" style={{ width: `${conf.stats.total > 0 ? (conf.stats.cold / conf.stats.total) * 100 : 0}%` }} />
                  {conf.stats.total === 0 && <div className="h-1.5 rounded-full bg-slate-700 flex-1" />}
                </div>
                <div className="flex gap-3 mt-1 text-xs text-slate-500">
                  <span className="text-red-400">{conf.stats.hot} hot</span>
                  <span className="text-amber-400">{conf.stats.warm} warm</span>
                  <span className="text-blue-400">{conf.stats.cold} cold</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Lead Management */}
        {selectedConference && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Leads - {summary?.conferences.find(c => c.id === selectedConference)?.name}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => sendFollowups(selectedConference, true)}
                  disabled={sendingFollowups}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  Preview Followups
                </button>
                <button
                  onClick={() => sendFollowups(selectedConference, false)}
                  disabled={sendingFollowups}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {sendingFollowups ? 'Sending...' : 'Send Followup Emails'}
                </button>
              </div>
            </div>

            {followupResult && (
              <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-lg p-3 mb-4 text-sm">
                {followupResult}
              </div>
            )}

            {leads.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No leads yet for this conference.</p>
                <p className="text-sm text-slate-500 mt-1">
                  Leads are captured via the conference landing page or badge scanner API.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left text-xs text-slate-400 font-medium pb-3 pr-4">Name</th>
                      <th className="text-left text-xs text-slate-400 font-medium pb-3 pr-4">Company</th>
                      <th className="text-left text-xs text-slate-400 font-medium pb-3 pr-4">Email</th>
                      <th className="text-left text-xs text-slate-400 font-medium pb-3 pr-4">Qualification</th>
                      <th className="text-left text-xs text-slate-400 font-medium pb-3 pr-4">Status</th>
                      <th className="text-left text-xs text-slate-400 font-medium pb-3 pr-4">Follow-up</th>
                      <th className="text-left text-xs text-slate-400 font-medium pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr key={lead.id} className="border-b border-slate-800/50">
                        <td className="py-3 pr-4">
                          <p className="text-white text-sm font-medium">{lead.first_name} {lead.last_name}</p>
                          <p className="text-xs text-slate-500">{lead.title}</p>
                        </td>
                        <td className="py-3 pr-4 text-sm text-slate-300">{lead.company || '-'}</td>
                        <td className="py-3 pr-4 text-sm text-slate-300">{lead.email}</td>
                        <td className="py-3 pr-4">
                          <select
                            value={lead.qualification}
                            onChange={e => updateLead(lead.id, { qualification: e.target.value })}
                            className={`text-xs px-2 py-1 rounded border ${qualBadge(lead.qualification)} bg-transparent cursor-pointer`}
                          >
                            <option value="hot">Hot</option>
                            <option value="warm">Warm</option>
                            <option value="cold">Cold</option>
                          </select>
                        </td>
                        <td className="py-3 pr-4">
                          <select
                            value={lead.status}
                            onChange={e => updateLead(lead.id, { status: e.target.value })}
                            className={`text-xs px-2 py-1 rounded ${statusBadge(lead.status)} bg-transparent cursor-pointer`}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="demo_scheduled">Demo Scheduled</option>
                            <option value="demo_completed">Demo Completed</option>
                            <option value="negotiating">Negotiating</option>
                            <option value="converted">Converted</option>
                            <option value="lost">Lost</option>
                          </select>
                        </td>
                        <td className="py-3 pr-4">
                          {lead.followup_sent ? (
                            <span className="text-xs text-emerald-400">Sent</span>
                          ) : (
                            <span className="text-xs text-slate-500">Pending</span>
                          )}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => updateLead(lead.id, { status: 'demo_scheduled' })}
                            className="text-xs text-blue-400 hover:text-blue-300 mr-3"
                          >
                            Schedule Demo
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
