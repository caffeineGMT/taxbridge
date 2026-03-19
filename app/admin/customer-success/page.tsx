/**
 * Customer Success Dashboard
 * Admin page to view feedback, churn risks, and outreach campaigns
 *
 * Route: /admin/customer-success
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getPaidUsers, getChurnRiskUsers, getAllFeedback, getNPSSummary } from '@/lib/customer-success';

export default async function CustomerSuccessDashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // TODO: Add admin role check
  // For now, only allow specific user (replace with proper admin check)
  // const userProfile = await getUserProfileByClerkId(userId);
  // if (!userProfile?.isAdmin) {
  //   redirect('/dashboard');
  // }

  // Fetch customer success data
  const paidUsers = await getPaidUsers();
  const churnRisks = await getChurnRiskUsers();
  const feedback = await getAllFeedback(50);
  const npsSummary = await getNPSSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Customer Success Dashboard
          </h1>
          <p className="text-slate-600">
            Monitor paid users, churn risks, and customer feedback
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Paid Users"
            value={paidUsers.length}
            icon="👥"
            color="blue"
          />
          <MetricCard
            title="Churn Risks"
            value={churnRisks.length}
            icon="⚠️"
            color="red"
            subtitle={`${churnRisks.filter(r => r.risk_level === 'critical').length} critical`}
          />
          <MetricCard
            title="NPS Score"
            value={npsSummary.nps_score}
            icon="📊"
            color="green"
            subtitle={`${npsSummary.total_responses} responses`}
          />
          <MetricCard
            title="Feedback Items"
            value={feedback.length}
            icon="💬"
            color="purple"
          />
        </div>

        {/* Churn Risks Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>⚠️</span> Churn Risks ({churnRisks.length})
          </h2>

          {churnRisks.length === 0 ? (
            <p className="text-slate-600">No users at risk of churning. Great job!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Risk Level</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Score</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Days Since Login</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Calculations</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {churnRisks.slice(0, 10).map((user) => (
                    <tr key={user.user_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-slate-900">
                            {user.first_name || 'N/A'}
                          </div>
                          <div className="text-sm text-slate-600">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={user.risk_level} />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-700">{user.churn_risk_score}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {user.days_since_last_login > 90 ? '90+' : user.days_since_last_login} days
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {user.calculations_completed}
                      </td>
                      <td className="py-3 px-4">
                        {user.outreach_needed && (
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Send Email
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>💬</span> Recent Feedback
          </h2>

          {feedback.length === 0 ? (
            <p className="text-slate-600">No feedback yet.</p>
          ) : (
            <div className="space-y-4">
              {feedback.slice(0, 10).map((item: any) => (
                <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-slate-900">{item.email}</div>
                      <div className="text-sm text-slate-600">
                        {new Date(item.created_at * 1000).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {item.nps_score !== null && (
                        <NPSBadge score={item.nps_score} />
                      )}
                      {item.satisfaction_score !== null && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                          Satisfaction: {item.satisfaction_score}/5
                        </span>
                      )}
                    </div>
                  </div>

                  {item.general_feedback && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-slate-700 mb-1">Feedback:</p>
                      <p className="text-slate-700">{item.general_feedback}</p>
                    </div>
                  )}

                  {item.missing_features && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-slate-700 mb-1">Missing Features:</p>
                      <p className="text-slate-700">{item.missing_features}</p>
                    </div>
                  )}

                  {item.feature_requests && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-slate-700 mb-1">Feature Requests:</p>
                      <p className="text-slate-700">{item.feature_requests}</p>
                    </div>
                  )}

                  {item.testimonial && (
                    <div className="mt-2 bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-sm font-semibold text-green-800 mb-1">✨ Testimonial:</p>
                      <p className="text-green-900 italic">"{item.testimonial}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'red' | 'green' | 'purple';
  subtitle?: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
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

function RiskBadge({ level }: { level: string }) {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded text-sm font-medium ${colors[level as keyof typeof colors]}`}>
      {level.toUpperCase()}
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
