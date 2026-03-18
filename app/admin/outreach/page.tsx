import { Metadata } from 'next';
import { Mail, TrendingUp, Users, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Outreach Dashboard | TaxBridge Admin',
  description: 'Track cold email campaigns to immigration law firms',
};

// Mock data - replace with actual database queries
const campaignStats = {
  totalProspects: 200,
  contacted: 50,
  opened: 23,
  clicked: 12,
  replied: 5,
  demoScheduled: 2,
  trialStarted: 1,
  closedWon: 0,
  openRate: 46, // 23/50
  clickRate: 24, // 12/50
  replyRate: 10, // 5/50
};

const recentActivity = [
  {
    id: 1,
    firm: 'Berry Appleman & Leiden LLP',
    city: 'San Francisco, CA',
    status: 'demo_scheduled',
    lastContact: '2024-03-18',
    nextAction: 'Demo call scheduled for 2024-03-20',
  },
  {
    id: 2,
    firm: 'Fragomen Del Rey Bernsen & Loewy',
    city: 'San Francisco, CA',
    status: 'trial_started',
    lastContact: '2024-03-17',
    nextAction: 'Check in after 14 days of trial',
  },
  {
    id: 3,
    firm: 'Greenspoon Marder LLP',
    city: 'Seattle, WA',
    status: 'replied',
    lastContact: '2024-03-16',
    nextAction: 'Schedule demo call',
  },
  {
    id: 4,
    firm: 'Jackson Lewis P.C.',
    city: 'New York, NY',
    status: 'clicked',
    lastContact: '2024-03-15',
    nextAction: 'Send Email 2 (case study) on 2024-03-18',
  },
  {
    id: 5,
    firm: 'Klasko Immigration Law Partners',
    city: 'Boston, MA',
    status: 'opened',
    lastContact: '2024-03-15',
    nextAction: 'Wait for reply, send Email 2 on 2024-03-18',
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  target: { label: 'Target', color: 'bg-textMuted', icon: Users },
  contacted: { label: 'Contacted', color: 'bg-info', icon: Mail },
  opened: { label: 'Opened', color: 'bg-primary', icon: Mail },
  clicked: { label: 'Clicked', color: 'bg-warning', icon: TrendingUp },
  replied: { label: 'Replied', color: 'bg-success', icon: CheckCircle },
  demo_scheduled: { label: 'Demo Scheduled', color: 'bg-success', icon: Calendar },
  trial_started: { label: 'Trial Started', color: 'bg-success', icon: Clock },
  closed_won: { label: 'Closed Won', color: 'bg-success', icon: CheckCircle },
  closed_lost: { label: 'Closed Lost', color: 'bg-error', icon: XCircle },
};

export default function OutreachDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Outreach Dashboard</h1>
          <p className="text-textMuted">
            Track cold email campaigns to 200 immigration law firms
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-textMuted">Total Prospects</div>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-text">{campaignStats.totalProspects}</div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-textMuted">Contacted</div>
              <Mail className="w-5 h-5 text-info" />
            </div>
            <div className="text-3xl font-bold text-text">{campaignStats.contacted}</div>
            <div className="text-xs text-textMuted mt-1">
              {Math.round((campaignStats.contacted / campaignStats.totalProspects) * 100)}% of total
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-textMuted">Open Rate</div>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-text">{campaignStats.openRate}%</div>
            <div className="text-xs text-textMuted mt-1">
              {campaignStats.opened} / {campaignStats.contacted}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-textMuted">Reply Rate</div>
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div className="text-3xl font-bold text-text">{campaignStats.replyRate}%</div>
            <div className="text-xs text-textMuted mt-1">
              {campaignStats.replied} / {campaignStats.contacted}
            </div>
          </div>
        </div>

        {/* Funnel Metrics */}
        <div className="bg-surface border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-text mb-4">Sales Funnel</h2>

          <div className="space-y-4">
            {[
              { label: 'Contacted', count: campaignStats.contacted, total: campaignStats.totalProspects },
              { label: 'Opened', count: campaignStats.opened, total: campaignStats.contacted },
              { label: 'Clicked', count: campaignStats.clicked, total: campaignStats.contacted },
              { label: 'Replied', count: campaignStats.replied, total: campaignStats.contacted },
              { label: 'Demo Scheduled', count: campaignStats.demoScheduled, total: campaignStats.replied },
              { label: 'Trial Started', count: campaignStats.trialStarted, total: campaignStats.demoScheduled },
              { label: 'Closed Won', count: campaignStats.closedWon, total: campaignStats.trialStarted },
            ].map((stage, i) => {
              const percentage = Math.round((stage.count / stage.total) * 100);
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
                <div className="text-textMuted">Target reply rate:</div>
                <div className="font-semibold text-text">
                  {campaignStats.replyRate}% / 10%{' '}
                  <span className={campaignStats.replyRate >= 10 ? 'text-success' : 'text-warning'}>
                    ({campaignStats.replyRate >= 10 ? '✓ Hit' : `${10 - campaignStats.replyRate}% to go`})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-textMuted">Target demos:</div>
                <div className="font-semibold text-text">
                  {campaignStats.demoScheduled} / 10{' '}
                  <span className={campaignStats.demoScheduled >= 10 ? 'text-success' : 'text-warning'}>
                    ({campaignStats.demoScheduled >= 10 ? '✓ Hit' : `${10 - campaignStats.demoScheduled} to go`})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-textMuted">Target trials:</div>
                <div className="font-semibold text-text">
                  {campaignStats.trialStarted} / 3{' '}
                  <span className={campaignStats.trialStarted >= 3 ? 'text-success' : 'text-warning'}>
                    ({campaignStats.trialStarted >= 3 ? '✓ Hit' : `${3 - campaignStats.trialStarted} to go`})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-textMuted">Target customers:</div>
                <div className="font-semibold text-text">
                  {campaignStats.closedWon} / 2{' '}
                  <span className={campaignStats.closedWon >= 2 ? 'text-success' : 'text-warning'}>
                    ({campaignStats.closedWon >= 2 ? '✓ Hit' : `${2 - campaignStats.closedWon} to go`})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Projection */}
          <div className="mt-6 pt-6 border-t border-border bg-primary/5 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
            <div className="text-sm font-semibold text-text mb-2">Revenue Projection</div>
            <div className="text-2xl font-bold text-primary">
              ${(campaignStats.closedWon * 100000).toLocaleString()} ARR
            </div>
            <div className="text-xs text-textMuted mt-1">
              {campaignStats.closedWon} customers × $100K/year (50 seats @ $2K/seat)
            </div>
            <div className="text-xs text-warning mt-2">
              Goal: 2 customers = $200K ARR
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-text mb-4">Recent Activity</h2>

          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const status = statusConfig[activity.status];
              const StatusIcon = status.icon;

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className={`p-2 ${status.color} bg-opacity-20 rounded-lg`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold text-text">{activity.firm}</div>
                    <div className="text-sm text-textMuted">{activity.city}</div>
                    <div className="text-sm text-textMuted mt-1">
                      Last contact: {activity.lastContact}
                    </div>
                    <div className="text-sm text-primary mt-1">
                      Next: {activity.nextAction}
                    </div>
                  </div>

                  <div className={`px-3 py-1 ${status.color} bg-opacity-20 rounded-full text-xs font-semibold`}>
                    {status.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <button className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors">
              View All Prospects
            </button>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-text mb-4">Next Steps</h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-text">Send Email 2 to opened prospects (18 firms)</div>
                <div className="text-textMuted">Case study email scheduled for 3 days after Email 1</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-text">Follow up with replied prospects (5 firms)</div>
                <div className="text-textMuted">Schedule demo calls within 48 hours of reply</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-text">Send next batch of 50 emails</div>
                <div className="text-textMuted">Target: Seattle and NYC firms (50 new prospects)</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-text">Check trial user engagement</div>
                <div className="text-textMuted">Fragomen trial started 2024-03-17 — check usage after 7 days</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
