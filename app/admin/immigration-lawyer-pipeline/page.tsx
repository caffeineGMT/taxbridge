'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface CampaignStats {
  total_prospects: number;
  contacted: number;
  opened: number;
  clicked: number;
  replied: number;
  demo_scheduled: number;
  trial_started: number;
  closed_won: number;
  open_rate: number;
  click_rate: number;
  reply_rate: number;
  demo_conversion: number;
}

interface Prospect {
  id: number;
  firm_name: string;
  contact_email: string;
  contact_name: string;
  city: string;
  state: string;
  attorney_count: number;
  status: string;
  email_opened: number;
  email_clicked: number;
  reply_date: string | null;
  demo_scheduled_date: string | null;
  last_contact_date: string;
  last_contact_type: string;
}

interface Activity {
  id: number;
  firm_name: string;
  event_type: string;
  event_timestamp: string;
  email_template: string;
}

export default function ImmigrationLawyerPipelinePage() {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const [statsRes, prospectsRes, activityRes] = await Promise.all([
        fetch('/api/outreach/immigration-lawyers/stats'),
        fetch('/api/outreach/immigration-lawyers/prospects'),
        fetch('/api/outreach/immigration-lawyers/activity')
      ]);

      const statsData = await statsRes.json();
      const prospectsData = await prospectsRes.json();
      const activityData = await activityRes.json();

      setStats(statsData);
      setProspects(prospectsData);
      setRecentActivity(activityData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
    }
  }

  const filteredProspects = filter === 'all'
    ? prospects
    : prospects.filter(p => p.status === filter);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      target: 'bg-gray-100 text-gray-800',
      contacted: 'bg-blue-100 text-blue-800',
      opened: 'bg-indigo-100 text-indigo-800',
      clicked: 'bg-purple-100 text-purple-800',
      replied: 'bg-green-100 text-green-800',
      demo_scheduled: 'bg-yellow-100 text-yellow-800',
      trial_started: 'bg-orange-100 text-orange-800',
      closed_won: 'bg-emerald-100 text-emerald-800',
      closed_lost: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getEventIcon = (eventType: string) => {
    const icons: Record<string, string> = {
      sent: '📤',
      delivered: '✅',
      opened: '👀',
      clicked: '🖱️',
      replied: '💬',
      bounced: '⚠️',
      spam: '🚫'
    };
    return icons[eventType] || '📧';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pipeline data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Immigration Lawyer Partnership Pipeline
        </h1>
        <p className="text-gray-600">
          Q1 2026 Campaign - Track outreach, engagement, demos, and deal closures
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Contacted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats?.contacted || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              of {stats?.total_prospects || 0} prospects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Email Opened</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{stats?.opened || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.open_rate?.toFixed(1)}% open rate
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(stats?.open_rate || 0, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Replied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats?.replied || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.reply_rate?.toFixed(1)}% reply rate
              {stats?.reply_rate && stats.reply_rate >= 8 ? ' 🎯' : ''}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(stats?.reply_rate || 0, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Demos Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats?.demo_scheduled || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.demo_conversion?.toFixed(1)}% of replies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Trials Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats?.trial_started || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Active partnerships testing</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Deals Closed 🎉</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{stats?.closed_won || 0}</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              {stats?.closed_won === 0 ? 'Working on first deal!' : 'Active partnerships'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Click-Through</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats?.clicked || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.click_rate?.toFixed(1)}% clicked links
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Pipeline Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats && stats.contacted > 0
                ? Math.round(
                    ((stats.replied + stats.demo_scheduled * 2 + stats.closed_won * 5) /
                      stats.contacted) *
                      100
                  )
                : 0}
            </div>
            <p className="text-xs text-blue-600 mt-1 font-medium">Engagement score</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>From first contact to partnership closed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Contacted', count: stats?.contacted || 0, color: 'bg-blue-500' },
              { label: 'Opened Email', count: stats?.opened || 0, color: 'bg-indigo-500' },
              { label: 'Clicked Link', count: stats?.clicked || 0, color: 'bg-purple-500' },
              { label: 'Replied', count: stats?.replied || 0, color: 'bg-green-500' },
              {
                label: 'Demo Scheduled',
                count: stats?.demo_scheduled || 0,
                color: 'bg-yellow-500'
              },
              {
                label: 'Trial Started',
                count: stats?.trial_started || 0,
                color: 'bg-orange-500'
              },
              { label: 'Partnership Closed', count: stats?.closed_won || 0, color: 'bg-emerald-500' }
            ].map((stage, index) => {
              const maxCount = stats?.contacted || 1;
              const width = (stage.count / maxCount) * 100;

              return (
                <div key={stage.label} className="flex items-center gap-4">
                  <div className="w-40 text-sm font-medium text-gray-700">{stage.label}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                    <div
                      className={`${stage.color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
                      style={{ width: `${Math.max(width, stage.count > 0 ? 8 : 0)}%` }}
                    >
                      {stage.count > 0 && (
                        <span className="text-white font-bold text-sm">{stage.count}</span>
                      )}
                    </div>
                  </div>
                  {index < 6 && stage.count > 0 && (
                    <div className="text-xs text-gray-500 w-16 text-right">
                      {((stage.count / (stats?.contacted || 1)) * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prospects List */}
        <Card>
          <CardHeader>
            <CardTitle>Prospects</CardTitle>
            <CardDescription>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="mt-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Statuses ({prospects.length})</option>
                <option value="target">Not Contacted</option>
                <option value="contacted">Contacted</option>
                <option value="opened">Opened</option>
                <option value="clicked">Clicked</option>
                <option value="replied">Replied ⭐</option>
                <option value="demo_scheduled">Demo Scheduled 🎯</option>
                <option value="trial_started">Trial Started</option>
                <option value="closed_won">Closed Won 🎉</option>
              </select>
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            <div className="space-y-3">
              {filteredProspects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No prospects in this category</p>
              ) : (
                filteredProspects.map(prospect => (
                  <div
                    key={prospect.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{prospect.firm_name}</h3>
                        <p className="text-sm text-gray-600">
                          {prospect.contact_name} - {prospect.city}, {prospect.state}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prospect.status)}`}
                      >
                        {prospect.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                      <span>👥 {prospect.attorney_count || 'N/A'} attorneys</span>
                      {prospect.email_opened === 1 && <span>👀 Opened</span>}
                      {prospect.email_clicked === 1 && <span>🖱️ Clicked</span>}
                      {prospect.reply_date && (
                        <span className="text-green-600 font-medium">💬 Replied</span>
                      )}
                      {prospect.demo_scheduled_date && (
                        <span className="text-yellow-600 font-medium">📅 Demo booked</span>
                      )}
                    </div>

                    {prospect.last_contact_date && (
                      <p className="text-xs text-gray-400 mt-2">
                        Last contact: {new Date(prospect.last_contact_date).toLocaleDateString()} (
                        {prospect.last_contact_type})
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Real-time email events</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No activity yet</p>
              ) : (
                recentActivity.map(activity => (
                  <div
                    key={activity.id}
                    className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getEventIcon(activity.event_type)}</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {activity.event_type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.event_timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{activity.firm_name}</p>
                    {activity.email_template && (
                      <span className="text-xs text-gray-500">
                        Template: {activity.email_template}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              📧 Send Follow-Up Batch
            </button>
            <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
              📞 Schedule Demo Calls
            </button>
            <button className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
              📊 Export Pipeline Report
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
