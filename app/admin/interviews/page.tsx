/**
 * Customer Interview Insights Dashboard
 * Admin page to view interview results and generate referral messaging
 *
 * Route: /admin/interviews
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db/unified';

export default async function InterviewInsightsDashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // TODO: Add admin role check

  // Fetch interview stats
  const interviews = await query<any>(`
    SELECT
      ci.*,
      ii.problem_solved,
      ii.money_saved_usd,
      ii.time_saved_hours,
      ii.testimonial_text,
      ii.net_promoter_score
    FROM customer_interviews ci
    LEFT JOIN interview_insights ii ON ci.id = ii.interview_id
    ORDER BY ci.invited_at DESC
    LIMIT 50
  `);

  const insights = await query<any>(`
    SELECT * FROM interview_insights
    ORDER BY created_at DESC
  `);

  const referralMessages = await query<any>(`
    SELECT * FROM referral_messaging
    WHERE status = 'active'
    ORDER BY conversion_rate DESC NULLS LAST
  `);

  // Calculate summary stats
  const totalInvited = interviews.length;
  const totalCompleted = interviews.filter((i: any) => i.status === 'completed').length;
  const completionRate = totalInvited > 0 ? Math.round((totalCompleted / totalInvited) * 100) : 0;

  const avgNPS = insights.length > 0
    ? Math.round(insights.reduce((sum: number, i: any) => sum + (i.net_promoter_score || 0), 0) / insights.filter((i: any) => i.net_promoter_score).length)
    : 0;

  const totalMoneySaved = insights.reduce((sum: number, i: any) => sum + (i.money_saved_usd || 0), 0);
  const avgMoneySaved = insights.length > 0 ? Math.round(totalMoneySaved / insights.length) : 0;

  const totalTimeSaved = insights.reduce((sum: number, i: any) => sum + (i.time_saved_hours || 0), 0);
  const avgTimeSaved = insights.length > 0 ? Math.round(totalTimeSaved / insights.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Customer Interview Insights
          </h1>
          <p className="text-slate-600">
            Analyze interview responses to build referral program messaging
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Invited"
            value={totalInvited}
            icon="📧"
            color="blue"
          />
          <StatCard
            title="Completed"
            value={totalCompleted}
            icon="✅"
            color="green"
            subtitle={`${completionRate}% completion`}
          />
          <StatCard
            title="Avg NPS"
            value={avgNPS}
            icon="📊"
            color="purple"
          />
          <StatCard
            title="Avg $ Saved"
            value={`$${avgMoneySaved.toLocaleString()}`}
            icon="💰"
            color="green"
          />
          <StatCard
            title="Avg Hours Saved"
            value={avgTimeSaved}
            icon="⏱️"
            color="blue"
          />
        </div>

        {/* Key Insights Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            📊 Key Themes (from {insights.length} interviews)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Problems We Solve */}
            <ThemeCard
              title="Problems We Solve"
              icon="💡"
              items={extractTopThemes(insights, 'pain_points')}
            />

            {/* Purchase Barriers */}
            <ThemeCard
              title="Purchase Barriers"
              icon="🚧"
              items={extractTopThemes(insights, 'objection_type')}
            />

            {/* Referral Triggers */}
            <ThemeCard
              title="Referral Triggers"
              icon="📣"
              items={extractTopThemes(insights, 'referral_motivation')}
            />
          </div>
        </div>

        {/* Best Quotes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>💬</span> Best Testimonials
          </h2>

          {insights.filter((i: any) => i.testimonial_text && i.testimonial_permission !== 'no').slice(0, 5).map((insight: any) => (
            <div key={insight.id} className="border border-slate-200 rounded-lg p-4 mb-4">
              <p className="text-slate-900 italic mb-2">"{insight.testimonial_text}"</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {insight.testimonial_attribution || 'Anonymous'}
                </span>
                {insight.net_promoter_score && (
                  <NPSBadge score={insight.net_promoter_score} />
                )}
              </div>
            </div>
          ))}

          {insights.filter((i: any) => i.testimonial_text && i.testimonial_permission !== 'no').length === 0 && (
            <p className="text-slate-600">No testimonials collected yet.</p>
          )}
        </div>

        {/* Generated Referral Messaging */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>🎯</span> Generated Referral Messaging
          </h2>

          {referralMessages.length > 0 ? (
            <div className="space-y-4">
              {referralMessages.slice(0, 10).map((msg: any) => (
                <div key={msg.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold uppercase">
                      {msg.message_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-500">
                      Theme: {msg.problem_theme}
                    </span>
                  </div>
                  <p className="text-slate-900 whitespace-pre-wrap">{msg.message_text}</p>
                  {msg.conversion_rate && (
                    <div className="mt-2 text-sm text-slate-600">
                      Conversion: {(msg.conversion_rate * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600">No messaging generated yet. Complete interviews to auto-generate messaging.</p>
          )}
        </div>

        {/* Interview List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>📋</span> Interview Status
          </h2>

          {interviews.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Invited</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Completed</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Impact</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">NPS</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.slice(0, 20).map((interview: any) => (
                    <tr key={interview.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-900">{interview.email}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={interview.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-sm">
                        {new Date(interview.invited_at * 1000).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-sm">
                        {interview.completed_at
                          ? new Date(interview.completed_at * 1000).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-sm">
                        {interview.money_saved_usd
                          ? `$${interview.money_saved_usd.toLocaleString()}`
                          : interview.time_saved_hours
                          ? `${interview.time_saved_hours}h`
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {interview.net_promoter_score !== null && interview.net_promoter_score !== undefined ? (
                          <span className="text-slate-700 font-mono">{interview.net_promoter_score}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-600">No interviews yet. Send invitations to get started.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Send Interview Invitations
          </button>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
            Export All Insights (CSV)
          </button>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700">
            Generate New Messaging
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'green' | 'purple';
  subtitle?: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} text-white rounded-lg shadow-md p-6`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-3xl">{icon}</div>
        <div className="text-4xl font-bold">{value}</div>
      </div>
      <div className="text-sm opacity-90">{title}</div>
      {subtitle && <div className="text-xs opacity-75 mt-1">{subtitle}</div>}
    </div>
  );
}

function ThemeCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: Array<{ theme: string; count: number }>;
}) {
  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <ul className="space-y-2">
        {items.slice(0, 5).map((item, index) => (
          <li key={index} className="flex items-center justify-between text-sm">
            <span className="text-slate-700">{item.theme || 'Unknown'}</span>
            <span className="font-semibold text-slate-900">{item.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    invited: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    no_response: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 rounded text-sm font-medium ${colors[status as keyof typeof colors] || colors.no_response}`}>
      {status.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
}

function NPSBadge({ score }: { score: number }) {
  let color = 'bg-red-100 text-red-800'; // Detractor
  let label = 'Detractor';

  if (score >= 9) {
    color = 'bg-green-100 text-green-800'; // Promoter
    label = 'Promoter';
  } else if (score >= 7) {
    color = 'bg-yellow-100 text-yellow-800'; // Passive
    label = 'Passive';
  }

  return (
    <span className={`px-2 py-1 rounded text-sm font-medium ${color}`}>
      NPS {score} ({label})
    </span>
  );
}

// Helper Functions

function extractTopThemes(insights: any[], field: string): Array<{ theme: string; count: number }> {
  const counts: Record<string, number> = {};

  for (const insight of insights) {
    const value = insight[field];
    if (!value) continue;

    // Split comma-separated values
    const themes = typeof value === 'string' ? value.split(',').map((t: string) => t.trim()) : [value];

    for (const theme of themes) {
      if (theme) {
        counts[theme] = (counts[theme] || 0) + 1;
      }
    }
  }

  return Object.entries(counts)
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count);
}
