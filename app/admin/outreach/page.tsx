import { Metadata } from 'next';
import { Mail, TrendingUp, Users, Calendar, CheckCircle, Clock, XCircle, AlertTriangle, Target, Handshake } from 'lucide-react';
import { getDashboardSummary, getProspects, getProspectsDueForFollowup, getTrialsEndingSoon } from '@/lib/db/queries/enterprise-prospects';

export const metadata: Metadata = {
  title: 'Immigration Firm Outreach | TaxBridge Admin',
  description: 'Track outreach campaign to onboard 10 immigration law firms as partners',
};

export const dynamic = 'force-dynamic';

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  target: { label: 'Target', color: 'text-slate-400', bgColor: 'bg-slate-500/20' },
  contacted: { label: 'Contacted', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  opened: { label: 'Opened', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  clicked: { label: 'Clicked', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  replied: { label: 'Replied', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  demo_scheduled: { label: 'Demo Scheduled', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  trial_started: { label: 'Trial Started', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  closed_won: { label: 'Partner Onboarded', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  closed_lost: { label: 'Closed Lost', color: 'text-red-400', bgColor: 'bg-red-500/20' },
};

function getNextAction(prospect: any): string {
  switch (prospect.status) {
    case 'target': return 'Add to Instantly.ai campaign';
    case 'contacted': return 'Waiting for open/reply';
    case 'opened': return 'Send follow-up email (Day 3)';
    case 'clicked': return 'High intent - send personal follow-up';
    case 'replied': return 'Schedule demo call ASAP';
    case 'demo_scheduled': return `Demo on ${prospect.demo_scheduled_date || 'TBD'}`;
    case 'trial_started': {
      if (prospect.trial_end_date) {
        const daysLeft = Math.ceil(
          (new Date(prospect.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return daysLeft > 0 ? `Trial ends in ${daysLeft} days` : 'Trial ended - convert to partner';
      }
      return 'Monitor trial usage';
    }
    case 'closed_won': return 'Onboarded - track referrals';
    case 'closed_lost': return prospect.closed_lost_reason || 'No action needed';
    default: return '';
  }
}

export default function OutreachDashboard() {
  // Fetch real data from database
  let summary: any;
  let recentProspects: any[];
  let needsFollowup: any[];
  let trialsEndingSoon: any[];

  try {
    summary = getDashboardSummary();
    recentProspects = getProspects({ limit: 15 });
    needsFollowup = getProspectsDueForFollowup();
    trialsEndingSoon = getTrialsEndingSoon();
  } catch {
    // Fallback if database not initialized yet
    summary = {
      total_prospects: 0, contacted: 0, opened: 0, clicked: 0,
      replied: 0, demo_scheduled: 0, trial_started: 0,
      closed_won: 0, closed_lost: 0,
      openRate: 0, clickRate: 0, replyRate: 0,
    };
    recentProspects = [];
    needsFollowup = [];
    trialsEndingSoon = [];
  }

  const totalContacted = summary.contacted || 1; // Avoid division by zero
  const totalProspects = summary.total_prospects || 0;

  // Goal targets
  const goals = {
    openRate: { current: summary.openRate, target: 45 },
    replyRate: { current: summary.replyRate, target: 8 },
    demos: { current: summary.demo_scheduled || 0, target: 6 },
    partners: { current: summary.closed_won || 0, target: 10 },
  };

  // Revenue calculations
  const partnersOnboarded = summary.closed_won || 0;
  const projectedReferrals = partnersOnboarded * 5;
  const projectedRevenue = projectedReferrals * 299;
  const commissionCost = projectedRevenue * 0.20;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Handshake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Immigration Firm Partner Outreach</h1>
              <p className="text-slate-400">
                Goal: Onboard 10 immigration law firms | 50+ enterprise referrals in 90 days
              </p>
            </div>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Firms', value: totalProspects, icon: Target, color: 'text-blue-400' },
            { label: 'Contacted', value: summary.contacted || 0, icon: Mail, color: 'text-cyan-400' },
            { label: 'Open Rate', value: `${summary.openRate}%`, icon: TrendingUp, color: 'text-yellow-400', sub: `Target: 45%` },
            { label: 'Reply Rate', value: `${summary.replyRate}%`, icon: CheckCircle, color: 'text-green-400', sub: `Target: 8%` },
            { label: 'Partners', value: `${partnersOnboarded}/10`, icon: Handshake, color: 'text-emerald-400', sub: `${10 - partnersOnboarded} to go` },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">{stat.label}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              {stat.sub && <div className="text-xs text-slate-500 mt-1">{stat.sub}</div>}
            </div>
          ))}
        </div>

        {/* Funnel + Goals */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Sales Funnel */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Outreach Funnel</h2>
            <div className="space-y-3">
              {[
                { label: 'Contacted', count: summary.contacted || 0, total: totalProspects },
                { label: 'Opened', count: summary.opened || 0, total: totalContacted },
                { label: 'Clicked', count: summary.clicked || 0, total: totalContacted },
                { label: 'Replied', count: summary.replied || 0, total: totalContacted },
                { label: 'Demo Scheduled', count: summary.demo_scheduled || 0, total: Math.max(summary.replied || 1, 1) },
                { label: 'Trial Started', count: summary.trial_started || 0, total: Math.max(summary.demo_scheduled || 1, 1) },
                { label: 'Onboarded', count: summary.closed_won || 0, total: Math.max(summary.trial_started || 1, 1) },
              ].map((stage, i) => {
                const pct = stage.total > 0 ? Math.round((stage.count / stage.total) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">{stage.label}</span>
                      <span className="text-sm text-slate-400">
                        {stage.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Goal Tracking */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Goal Tracking</h2>
            <div className="space-y-4">
              {[
                { label: 'Open Rate', current: goals.openRate.current, target: goals.openRate.target, unit: '%' },
                { label: 'Reply Rate', current: goals.replyRate.current, target: goals.replyRate.target, unit: '%' },
                { label: 'Demos Booked', current: goals.demos.current, target: goals.demos.target, unit: '' },
                { label: 'Partners Onboarded', current: goals.partners.current, target: goals.partners.target, unit: '' },
              ].map((goal, i) => {
                const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
                const hit = goal.current >= goal.target;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">{goal.label}</span>
                      <span className={`text-sm font-semibold ${hit ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {goal.current}{goal.unit} / {goal.target}{goal.unit}
                        {hit && ' ✓'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${hit ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Revenue Projection */}
            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Projected Revenue (90-day)</div>
              <div className="text-2xl font-bold text-emerald-400">
                ${projectedRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {partnersOnboarded} partners x 5 referrals x $299/yr
              </div>
              <div className="text-xs text-slate-500">
                Commission payout: ${commissionCost.toLocaleString()} (20%)
              </div>
            </div>

            {/* Cost Summary */}
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="text-sm text-slate-400 mb-2">Campaign Cost</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <div className="text-slate-400">Apollo.io</div>
                  <div className="font-semibold text-white">$79/mo</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <div className="text-slate-400">NeverBounce</div>
                  <div className="font-semibold text-white">$1.60</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <div className="text-slate-400">Instantly.ai</div>
                  <div className="font-semibold text-white">$37/mo</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        {(needsFollowup.length > 0 || trialsEndingSoon.length > 0) && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Action Required ({needsFollowup.length + trialsEndingSoon.length})
            </h2>
            <div className="space-y-3">
              {needsFollowup.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{p.firm_name}</div>
                    <div className="text-xs text-slate-400">
                      Replied {p.reply_date} - Schedule demo call
                    </div>
                  </div>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                    Needs Demo
                  </span>
                </div>
              ))}
              {trialsEndingSoon.map((p: any) => {
                const daysLeft = Math.ceil(
                  (new Date(p.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={p.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{p.firm_name}</div>
                      <div className="text-xs text-slate-400">
                        Trial ends in {daysLeft} days - Follow up on experience
                      </div>
                    </div>
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                      Trial Ending
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pipeline Table */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Pipeline ({totalProspects} firms)</h2>
            <div className="flex gap-2 text-xs">
              <a href="/api/outreach/stats" target="_blank" className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors">
                API Stats
              </a>
            </div>
          </div>

          {recentProspects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">Firm</th>
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">Location</th>
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">Contact</th>
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">Next Action</th>
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProspects.map((prospect: any) => {
                    const status = statusConfig[prospect.status] || statusConfig.target;
                    return (
                      <tr key={prospect.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-2">
                          <div className="font-medium text-white">{prospect.firm_name}</div>
                          {prospect.website && (
                            <div className="text-xs text-slate-500">{prospect.website}</div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-slate-300">
                          {prospect.city}{prospect.state ? `, ${prospect.state}` : ''}
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-slate-300">{prospect.contact_name || '-'}</div>
                          <div className="text-xs text-slate-500">{prospect.contact_email}</div>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${status.bgColor} ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-xs text-slate-400 max-w-[200px]">
                          {getNextAction(prospect)}
                        </td>
                        <td className="py-3 px-2 text-xs text-slate-500">
                          {prospect.updated_at ? new Date(prospect.updated_at).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No prospects yet</p>
              <p className="text-sm">
                Run <code className="bg-slate-700 px-2 py-1 rounded">npm run scrape:aila-firms</code> to scrape 200 firms from Apollo.io
              </p>
              <p className="text-sm mt-1">
                Then <code className="bg-slate-700 px-2 py-1 rounded">npm run outreach:setup-campaign</code> to launch the campaign
              </p>
            </div>
          )}
        </div>

        {/* Email Sequence Reference */}
        <div className="mt-8 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Email Sequence</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                day: 'Day 0',
                subject: 'Partnership opportunity: Help your H-1B clients with RSU taxes',
                type: 'Initial Outreach',
                color: 'border-blue-500/50',
              },
              {
                day: 'Day 3',
                subject: 'Re: Partnership opportunity (social proof + commission details)',
                type: 'Follow-up',
                color: 'border-yellow-500/50',
              },
              {
                day: 'Day 7',
                subject: '[Video] See how TaxBridge helps your H-1B clients',
                type: 'Video Demo + Final CTA',
                color: 'border-emerald-500/50',
              },
            ].map((email, i) => (
              <div key={i} className={`border-l-2 ${email.color} bg-slate-900/50 rounded-r-lg p-4`}>
                <div className="text-xs text-slate-400 mb-1">{email.day}</div>
                <div className="text-sm font-medium text-white mb-1">{email.type}</div>
                <div className="text-xs text-slate-400">{email.subject}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-500">
            <strong>Personalization:</strong> {'{{firmName}}'}, {'{{city}}'}, {'{{firstName}}'} |{' '}
            <strong>Offer:</strong> 20% recurring commission, co-branded /p/[code] page, white-label option
          </div>
        </div>

        {/* Operational Playbook */}
        <div className="mt-8 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Quick Commands</h2>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            {[
              { cmd: 'npm run scrape:aila-firms', desc: 'Scrape 200 firms from Apollo.io' },
              { cmd: 'npm run outreach:verify-emails', desc: 'Verify emails with NeverBounce ($1.60)' },
              { cmd: 'npm run outreach:setup-campaign', desc: 'Set up Instantly.ai campaign' },
              { cmd: 'npm run prepare:instantly-upload', desc: 'Generate CSV for Instantly.ai upload' },
              { cmd: 'npm run outreach:check-followups', desc: 'Check for overdue follow-ups' },
              { cmd: 'npm run outreach:update-stats', desc: 'Sync stats from Instantly.ai' },
              { cmd: 'npm run db:migrate:outreach', desc: 'Run outreach database migration' },
              { cmd: 'npm run outreach:pipeline', desc: 'View pipeline in terminal' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 bg-slate-900/50 rounded-lg p-3">
                <code className="text-xs bg-slate-700 px-2 py-1 rounded text-emerald-400 whitespace-nowrap">
                  {item.cmd}
                </code>
                <span className="text-xs text-slate-400">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
