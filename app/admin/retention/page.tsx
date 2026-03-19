'use client';

/**
 * Retention Analytics Dashboard
 * Displays cohort retention rates, churn analysis, and feature usage correlation
 */

import { useEffect, useState } from 'react';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, TrendingDown, Users, Target } from 'lucide-react';

interface RetentionData {
  cohort_month: string;
  cohort_size: number;
  day_1_retained: number;
  day_7_retained: number;
  day_30_retained: number;
  day_90_retained: number;
  day_1_retention_rate: number;
  day_7_retention_rate: number;
  day_30_retention_rate: number;
  day_90_retention_rate: number;
}

interface ChurnReason {
  primary_reason: string;
  response_count: number;
  percentage: number;
  avg_satisfaction: number;
  return_likelihood_pct: number;
}

interface FeatureCorrelation {
  feature_name: string;
  users_using_feature: number;
  day_30_retained: number;
  retention_rate_pct: number;
  avg_usage_per_user: number;
  total_usages: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

export default function RetentionAnalyticsPage() {
  const [cohorts, setCohorts] = useState<RetentionData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [churnData, setChurnData] = useState<any>(null);
  const [featureData, setFeatureData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadRetentionData();
  }, []);

  const loadRetentionData = async () => {
    setLoading(true);
    try {
      const [overviewRes, churnRes, featureRes] = await Promise.all([
        fetch('/api/analytics/retention?action=overview'),
        fetch('/api/analytics/retention?action=churn'),
        fetch('/api/analytics/retention?action=features'),
      ]);

      const overview = await overviewRes.json();
      const churn = await churnRes.json();
      const features = await featureRes.json();

      if (overview.success) {
        setCohorts(overview.data.cohorts);
        setSummary(overview.data.summary);
      }

      if (churn.success) {
        setChurnData(churn.data);
      }

      if (features.success) {
        setFeatureData(features.data);
      }
    } catch (error) {
      console.error('Failed to load retention data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/analytics/retention?action=refresh');
      const data = await res.json();
      if (data.success) {
        await loadRetentionData();
        alert(`Refreshed retention data for ${data.data.cohorts_updated} cohorts`);
      }
    } catch (error) {
      console.error('Failed to refresh:', error);
      alert('Failed to refresh retention data');
    } finally {
      setRefreshing(false);
    }
  };

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Retention Analytics</h1>
          <p className="text-gray-600 mt-2">Cohort analysis, churn reasons, and feature correlation</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across {summary?.total_cohorts || 0} cohorts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Day 1 Retention</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.avg_day_1_retention.toFixed(1)}%</div>
            <div className="flex items-center text-xs">
              {summary?.avg_day_1_retention >= 50 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className="text-muted-foreground">Average across cohorts</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Day 7 Retention</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.avg_day_7_retention.toFixed(1)}%</div>
            <div className="flex items-center text-xs">
              {summary?.avg_day_7_retention >= 40 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className="text-muted-foreground">Week 1 engagement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Day 30 Retention</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.avg_day_30_retention.toFixed(1)}%</div>
            <div className="flex items-center text-xs">
              {summary?.avg_day_30_retention >= 30 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className="text-muted-foreground">Monthly active users</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview">Cohort Overview</TabsTrigger>
          <TabsTrigger value="churn">Churn Analysis</TabsTrigger>
          <TabsTrigger value="features">Feature Correlation</TabsTrigger>
        </TabsList>

        {/* Cohort Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Retention Curve by Cohort</CardTitle>
              <CardDescription>Retention rates at Day 1, 7, and 30 for each monthly cohort</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={cohorts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cohort_month" />
                  <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="day_1_retention_rate" stroke="#8884d8" name="Day 1" strokeWidth={2} />
                  <Line type="monotone" dataKey="day_7_retention_rate" stroke="#82ca9d" name="Day 7" strokeWidth={2} />
                  <Line type="monotone" dataKey="day_30_retention_rate" stroke="#ffc658" name="Day 30" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cohort Size Trends</CardTitle>
              <CardDescription>New user signups per cohort month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cohorts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cohort_month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cohort_size" fill="#0088FE" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cohort Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Cohort Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Cohort Month</th>
                      <th className="px-4 py-2 text-right">Size</th>
                      <th className="px-4 py-2 text-right">Day 1</th>
                      <th className="px-4 py-2 text-right">Day 7</th>
                      <th className="px-4 py-2 text-right">Day 30</th>
                      <th className="px-4 py-2 text-right">Day 90</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cohorts.map((cohort) => (
                      <tr key={cohort.cohort_month}>
                        <td className="px-4 py-2 font-medium">{cohort.cohort_month}</td>
                        <td className="px-4 py-2 text-right">{cohort.cohort_size}</td>
                        <td className="px-4 py-2 text-right">
                          <Badge variant={cohort.day_1_retention_rate >= 50 ? 'default' : 'secondary'}>
                            {cohort.day_1_retention_rate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Badge variant={cohort.day_7_retention_rate >= 40 ? 'default' : 'secondary'}>
                            {cohort.day_7_retention_rate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Badge variant={cohort.day_30_retention_rate >= 30 ? 'default' : 'secondary'}>
                            {cohort.day_30_retention_rate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Badge variant={cohort.day_90_retention_rate >= 20 ? 'default' : 'secondary'}>
                            {cohort.day_90_retention_rate.toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Churn Analysis Tab */}
        <TabsContent value="churn" className="space-y-6">
          {churnData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Responses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{churnData.summary.total_responses}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Avg Satisfaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{churnData.summary.avg_satisfaction_score.toFixed(1)}/5</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Would Return</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{churnData.summary.would_return_pct.toFixed(0)}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Would Recommend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{churnData.summary.would_recommend_pct.toFixed(0)}%</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Churn Reasons Distribution</CardTitle>
                  <CardDescription>Why users cancelled their subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={churnData.reasons}
                          dataKey="response_count"
                          nameKey="primary_reason"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {churnData.reasons.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-3">
                      {churnData.reasons.map((reason: ChurnReason, index: number) => (
                        <div key={reason.primary_reason} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm font-medium">{reason.primary_reason}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">{reason.response_count}</div>
                            <div className="text-xs text-gray-500">{reason.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Feature Requests from Churned Users</CardTitle>
                  <CardDescription>What would bring users back</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {churnData.feature_requests.slice(0, 10).map((request: string, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded border">
                        <p className="text-sm">{request}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Feature Correlation Tab */}
        <TabsContent value="features" className="space-y-6">
          {featureData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Feature Usage vs Retention Rate</CardTitle>
                  <CardDescription>
                    Correlation between feature usage and 30-day retention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={featureData.correlation}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="feature_name" angle={-45} textAnchor="end" height={100} />
                      <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="retention_rate_pct" fill="#8884d8" name="Retention Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">High Impact Features</CardTitle>
                    <CardDescription>&gt;70% retention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {featureData.impact_analysis.high_impact_features}
                    </div>
                    <div className="mt-4 space-y-2">
                      {featureData.impact_analysis.features_by_impact.high.slice(0, 5).map((f: FeatureCorrelation) => (
                        <div key={f.feature_name} className="text-xs">
                          <div className="font-medium">{f.feature_name}</div>
                          <div className="text-gray-500">{f.retention_rate_pct.toFixed(1)}% retention</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Medium Impact Features</CardTitle>
                    <CardDescription>40-70% retention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">
                      {featureData.impact_analysis.medium_impact_features}
                    </div>
                    <div className="mt-4 space-y-2">
                      {featureData.impact_analysis.features_by_impact.medium.slice(0, 5).map((f: FeatureCorrelation) => (
                        <div key={f.feature_name} className="text-xs">
                          <div className="font-medium">{f.feature_name}</div>
                          <div className="text-gray-500">{f.retention_rate_pct.toFixed(1)}% retention</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Low Impact Features</CardTitle>
                    <CardDescription>&lt;40% retention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      {featureData.impact_analysis.low_impact_features}
                    </div>
                    <div className="mt-4 space-y-2">
                      {featureData.impact_analysis.features_by_impact.low.slice(0, 5).map((f: FeatureCorrelation) => (
                        <div key={f.feature_name} className="text-xs">
                          <div className="font-medium">{f.feature_name}</div>
                          <div className="text-gray-500">{f.retention_rate_pct.toFixed(1)}% retention</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Usage Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Feature</th>
                          <th className="px-4 py-2 text-right">Users</th>
                          <th className="px-4 py-2 text-right">Retention</th>
                          <th className="px-4 py-2 text-right">Avg Usage</th>
                          <th className="px-4 py-2 text-right">Total Uses</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {featureData.correlation.map((feature: FeatureCorrelation) => (
                          <tr key={feature.feature_name}>
                            <td className="px-4 py-2 font-medium">{feature.feature_name}</td>
                            <td className="px-4 py-2 text-right">{feature.users_using_feature}</td>
                            <td className="px-4 py-2 text-right">
                              <Badge
                                variant={
                                  feature.retention_rate_pct > 70
                                    ? 'default'
                                    : feature.retention_rate_pct > 40
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {feature.retention_rate_pct.toFixed(1)}%
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-right">{feature.avg_usage_per_user.toFixed(1)}</td>
                            <td className="px-4 py-2 text-right">{feature.total_usages}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
