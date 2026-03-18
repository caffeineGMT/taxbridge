import { Metadata } from 'next';
import { Mail, TrendingUp, Users, Calendar, CheckCircle, Clock, XCircle, Linkedin } from 'lucide-react';
import { getHRProspects, getHRDashboardSummary, getProspectsByCompany } from '@/lib/db/queries/hr-prospects';

export const metadata: Metadata = {
  title: 'HR Outreach Dashboard | TaxBridge Admin',
  description: 'Track LinkedIn outreach to FAANG HR departments',
};

export default async function HROutreachDashboard() {
  // Fetch real data from database
  const summary = getHRDashboardSummary();
  const prospects = getHRProspects({ limit: 10 });
  const byCompany = getProspectsByCompany();

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Pending', color: 'bg-textMuted', icon: Users },
    connection_sent: { label: 'Connection Sent', color: 'bg-info', icon: Linkedin },
    connected: { label: 'Connected', color: 'bg-primary', icon: CheckCircle },
    message_sent: { label: 'Message Sent', color: 'bg-warning', icon: Mail },
    demo_booked: { label: 'Demo Booked', color: 'bg-success', icon: Calendar },
    pilot_signed: { label: 'Pilot Signed', color: 'bg-success', icon: CheckCircle },
    declined: { label: 'Declined', color: 'bg-error', icon: XCircle },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">HR Outreach Dashboard</h1>
          <p className="text-textMuted">
            Track LinkedIn outreach to {summary.total_prospects} HR/Benefits leads at FAANG companies
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-textMuted">Total Prospects</div>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-text">{summary.total_prospects}</div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-textMuted">Connections Sent</div>
              <Linkedin className="w-5 h-5 text-info" />
            </div>
            <div className="text-3xl font-bold text-text">{summary.connection_sent}</div>
            <div className="text-xs text-textMuted mt-1">
              {summary.connection_sent > 0
                ? Math.round((summary.connection_sent / summary.total_prospects) * 100)
                : 0}% of total
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-textMuted">Accepted Rate</div>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-text">{summary.acceptedRate}%</div>
            <div className="text-xs text-textMuted mt-1">
              {summary.connected} / {summary.connection_sent} accepted
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-textMuted">Demo Rate</div>
              <Calendar className="w-5 h-5 text-success" />
            </div>
            <div className="text-3xl font-bold text-text">{summary.demoRate}%</div>
            <div className="text-xs text-textMuted mt-1">
              {summary.demo_booked} / {summary.connected} booked
            </div>
          </div>
        </div>

        {/* Funnel Metrics */}
        <div className="bg-surface border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-text mb-4">LinkedIn Outreach Funnel</h2>

          <div className="space-y-4">
            {[
              { label: 'Total Prospects', count: summary.total_prospects, total: summary.total_prospects },
              { label: 'Connection Sent', count: summary.connection_sent, total: summary.total_prospects },
              { label: 'Connected', count: summary.connected, total: summary.connection_sent || 1 },
              { label: 'Message Sent', count: summary.message_sent, total: summary.connected || 1 },
              { label: 'Demo Booked', count: summary.demo_booked, total: summary.message_sent || 1 },
              { label: 'Pilot Signed', count: summary.pilot_signed, total: summary.demo_booked || 1 },
            ].map((stage, i) => {
              const percentage = stage.total > 0 ? Math.round((stage.count / stage.total) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-text">{stage.label}</span>
                    <span className="text-sm text-textMuted">
                      {stage.count} / {stage.total} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surfaceLight rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Goal Tracking */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-sm font-semibold text-text mb-3">Campaign Goals</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-textMuted">Target connections sent:</div>
                <div className="font-semibold text-text">
                  {summary.connection_sent} / 50{' '}
                  <span className={summary.connection_sent >= 50 ? 'text-success' : 'text-warning'}>
                    ({summary.connection_sent >= 50 ? '✓ Hit' : `${50 - summary.connection_sent} to go`})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-textMuted">Target demos:</div>
                <div className="font-semibold text-text">
                  {summary.demo_booked} / 10{' '}
                  <span className={summary.demo_booked >= 10 ? 'text-success' : 'text-warning'}>
                    ({summary.demo_booked >= 10 ? '✓ Hit' : `${10 - summary.demo_booked} to go`})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-textMuted">Target pilots:</div>
                <div className="font-semibold text-text">
                  {summary.pilot_signed} / 2{' '}
                  <span className={summary.pilot_signed >= 2 ? 'text-success' : 'text-warning'}>
                    ({summary.pilot_signed >= 2 ? '✓ Hit' : `${2 - summary.pilot_signed} to go`})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-textMuted">Declined:</div>
                <div className="font-semibold text-text">
                  {summary.declined}{' '}
                  <span className="text-textMuted">
                    ({summary.total_prospects > 0 ? Math.round((summary.declined / summary.total_prospects) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Projection */}
          <div className="mt-6 pt-6 border-t border-border bg-primary/5 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
            <div className="text-sm font-semibold text-text mb-2">Revenue Projection (Enterprise Tier)</div>
            <div className="text-2xl font-bold text-primary">
              ${(summary.pilot_signed * 100000).toLocaleString()} ARR
            </div>
            <div className="text-xs text-textMuted mt-1">
              {summary.pilot_signed} customers × $100K/year (50 seats @ $2K/seat)
            </div>
            <div className="text-xs text-warning mt-2">
              Goal: 2 pilots signed = $200K ARR
            </div>
          </div>
        </div>

        {/* Company Breakdown */}
        <div className="bg-surface border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-text mb-4">Prospects by Company</h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {byCompany.map((item) => (
              <div key={item.company} className="bg-background border border-border rounded-lg p-4">
                <div className="text-sm font-semibold text-text">{item.company}</div>
                <div className="text-2xl font-bold text-primary mt-1">{item.count}</div>
                <div className="text-xs text-textMuted mt-1">prospects</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-text mb-4">Recent Prospects</h2>

          {prospects.length === 0 ? (
            <div className="text-center py-12 text-textMuted">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No prospects yet. Run the prospect list builder:</p>
              <code className="block mt-2 bg-background px-4 py-2 rounded">
                tsx scripts/build-hr-prospect-list.ts
              </code>
            </div>
          ) : (
            <div className="space-y-4">
              {prospects.map((prospect) => {
                const status = statusConfig[prospect.outreach_status];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={prospect.id}
                    className="flex items-start gap-4 p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className={`p-2 ${status.color} bg-opacity-20 rounded-lg`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold text-text">{prospect.name}</div>
                      <div className="text-sm text-textMuted">{prospect.title}</div>
                      <div className="text-sm text-textMuted">{prospect.company} • {prospect.city}</div>
                      {prospect.connection_sent_date && (
                        <div className="text-xs text-textMuted mt-1">
                          Connection sent: {new Date(prospect.connection_sent_date).toLocaleDateString()}
                        </div>
                      )}
                      {prospect.connection_date && (
                        <div className="text-xs text-success mt-1">
                          Connected: {new Date(prospect.connection_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-3 py-1 ${status.color} bg-opacity-20 rounded-full text-xs font-semibold whitespace-nowrap`}>
                        {status.label}
                      </div>
                      <a
                        href={prospect.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Linkedin className="w-3 h-3" />
                        View Profile
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-text mb-4">Next Steps</h2>

          <div className="space-y-3 text-sm">
            {summary.pending > 0 && (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-text">
                    Send connection requests ({summary.pending} pending)
                  </div>
                  <div className="text-textMuted">
                    Run: <code className="bg-background px-2 py-0.5 rounded">
                      tsx scripts/linkedin-outreach-automation.ts --limit 10
                    </code>
                  </div>
                </div>
              </div>
            )}

            {summary.connected > summary.message_sent && (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-text">
                    Send follow-up messages ({summary.connected - summary.message_sent} connected prospects)
                  </div>
                  <div className="text-textMuted">
                    Run: <code className="bg-background px-2 py-0.5 rounded">
                      tsx scripts/linkedin-message-followup.ts --limit 5
                    </code>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-text">Monitor Calendly for demo bookings</div>
                <div className="text-textMuted">
                  Check {process.env.CALENDLY_URL || 'https://calendly.com/taxbridge/demo'} for new bookings
                </div>
              </div>
            </div>

            {summary.demo_booked > 0 && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-text">
                    Follow up with demo attendees ({summary.demo_booked} demos booked)
                  </div>
                  <div className="text-textMuted">
                    Send pilot agreement within 24 hours of demo call
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LinkedIn Automation Tips */}
        <div className="mt-8 bg-warning/10 border border-warning/30 rounded-lg p-6">
          <h2 className="text-lg font-bold text-text mb-3">⚠️ LinkedIn Automation Best Practices</h2>
          <ul className="space-y-2 text-sm text-textMuted">
            <li>• <strong>Rate limits:</strong> Max 10 connections/hour, 50/day (LinkedIn enforces strictly)</li>
            <li>• <strong>Anti-bot detection:</strong> Use headless: false, randomize delays, avoid bulk actions</li>
            <li>• <strong>Account safety:</strong> Don't automate from your personal account - use a dedicated profile</li>
            <li>• <strong>Testing:</strong> Always run --dry-run first to verify targeting and messaging</li>
            <li>• <strong>Manual verification:</strong> LinkedIn may require phone/email verification - be ready</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
