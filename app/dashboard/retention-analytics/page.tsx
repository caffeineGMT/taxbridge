/**
 * Retention Analytics Dashboard
 * Day 1/7/30 retention, churn triggers, inactive user management
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Users, TrendingDown, AlertTriangle, Mail, RefreshCw, Download } from 'lucide-react';

interface CohortRetentionData {
  cohortMonth: string;
  cohortSize: number;
  day1Retained: number;
  day7Retained: number;
  day30Retained: number;
  day1RetentionRate: number;
  day7RetentionRate: number;
  day30RetentionRate: number;
}

interface ChurnTrigger {
  triggerId: string;
  triggerName: string;
  usersAffected: number;
  avgDaysToChurn: number;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface RetentionSummary {
  totalUsers: number;
  activeLastDay: number;
  activeLast7Days: number;
  activeLast30Days: number;
  churnedUsers: number;
  overallRetentionRate: number;
  avgDaysActive: number;
}

export default function RetentionAnalyticsDashboard() {
  const [cohorts, setCohorts] = useState<CohortRetentionData[]>([]);
  const [triggers, setTriggers] = useState<ChurnTrigger[]>([]);
  const [summary, setSummary] = useState<RetentionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailResult, setEmailResult] = useState<any>(null);

  useEffect(() => {
    fetchRetentionData();
  }, []);

  async function fetchRetentionData() {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/retention');
      const data = await response.json();

      setCohorts(data.cohorts || []);
      setTriggers(data.triggers || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error('Error fetching retention data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function sendReengagementEmails(dryRun: boolean = false) {
    setSendingEmails(true);
    setEmailResult(null);

    try {
      const response = await fetch(
        `/api/analytics/send-reengagement?days=7&maxEmails=50&dryRun=${dryRun}`,
        { method: 'POST' }
      );
      const data = await response.json();

      setEmailResult(data);
      alert(data.message);
    } catch (error) {
      console.error('Error sending re-engagement emails:', error);
      alert('Failed to send re-engagement emails');
    } finally {
      setSendingEmails(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading retention analytics...</p>
        </div>
      </div>
    );
  }

  // Format data for charts
  const retentionTrendData = cohorts.map(cohort => ({
    month: cohort.cohortMonth,
    'Day 1': cohort.day1RetentionRate,
    'Day 7': cohort.day7RetentionRate,
    'Day 30': cohort.day30RetentionRate,
  }));

  const churnTriggerData = triggers.map(trigger => ({
    name: trigger.triggerName,
    users: trigger.usersAffected,
    priority: trigger.priority,
  }));

  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Retention Analytics</h1>
        <p className="text-gray-600">
          Track user retention, identify churn triggers, and re-engage inactive users
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active (30 Days)</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.activeLast30Days.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.overallRetentionRate.toFixed(1)}% retention rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churned Users</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.churnedUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Inactive 30+ days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active (7 Days)</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.activeLast7Days.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Weekly active users</p>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Retention Trend */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Retention Trend by Cohort</CardTitle>
          <CardDescription>
            Track how retention rates change across user cohorts (Day 1/7/30)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={retentionTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Retention Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="Day 1"
                stroke="#10b981"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="Day 7"
                stroke="#3b82f6"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="Day 30"
                stroke="#8b5cf6"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Churn Triggers */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Churn Triggers</CardTitle>
            <CardDescription>
              Identify high-risk user segments that are likely to churn
            </CardDescription>
          </div>
          <Button onClick={() => fetchRetentionData()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={churnTriggerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#8884d8">
                {churnTriggerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={priorityColors[entry.priority]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 space-y-3">
            {triggers.map(trigger => (
              <div
                key={trigger.triggerId}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{trigger.triggerName}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        trigger.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : trigger.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {trigger.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{trigger.description}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    <span className="font-medium">{trigger.usersAffected}</span> users affected •{' '}
                    Avg. {trigger.avgDaysToChurn} days to churn
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Re-engagement Campaign */}
      <Card>
        <CardHeader>
          <CardTitle>Re-engagement Campaign</CardTitle>
          <CardDescription>
            Send "Did you finish your taxes?" emails to inactive users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900">Email Inactive Users (7+ days)</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Personalized nudge emails to bring users back to complete their tax filing
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => sendReengagementEmails(true)}
                  variant="outline"
                  disabled={sendingEmails}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Preview (Dry Run)
                </Button>
                <Button
                  onClick={() => sendReengagementEmails(false)}
                  disabled={sendingEmails}
                >
                  {sendingEmails ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Emails
                    </>
                  )}
                </Button>
              </div>
            </div>

            {emailResult && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Campaign Results</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Inactive</p>
                    <p className="text-2xl font-bold">{emailResult.results?.totalInactive || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Eligible</p>
                    <p className="text-2xl font-bold">{emailResult.results?.eligible || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sent</p>
                    <p className="text-2xl font-bold text-green-600">
                      {emailResult.results?.sent || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {emailResult.results?.failed || 0}
                    </p>
                  </div>
                </div>

                {emailResult.results?.emails && emailResult.results.emails.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Email Details:</h5>
                    <div className="max-h-60 overflow-y-auto">
                      {emailResult.results.emails.map((email: any, idx: number) => (
                        <div key={idx} className="text-sm py-1 border-b last:border-0">
                          <span className="font-medium">{email.firstName}</span> ({email.email}) -{' '}
                          <span
                            className={
                              email.status === 'sent'
                                ? 'text-green-600'
                                : email.status === 'failed'
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                            }
                          >
                            {email.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
