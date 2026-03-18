'use client';

/**
 * Product Hunt Launch Dashboard
 *
 * Real-time monitoring dashboard for Product Hunt launch.
 * Shows: ranking, upvotes, comments, velocity, projections, hourly actions, alerts
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Target, Users, MessageCircle, MousePointer, Zap } from 'lucide-react';

interface LaunchMetrics {
  timestamp: string;
  hour: number;
  ranking: number;
  upvotes: number;
  comments: number;
  websiteClicks: number;
  velocity: number;
  projectedFinalUpvotes: number;
  estimatedFinalRanking: number;
  actions: string[];
  alerts: string[];
}

interface DashboardData {
  status: string;
  launchDate: string;
  productSlug: string;
  summary: {
    currentRanking: number;
    currentUpvotes: number;
    currentComments: number;
    currentVelocity: number;
    projectedFinalUpvotes: number;
    estimatedFinalRanking: number;
    targetUpvotes: number;
    targetRanking: number;
    hoursSinceLaunch: number;
    hoursRemaining: number;
    isOnTrack: boolean;
    upvotesGap: number;
  };
  velocityTrend: number;
  metrics: LaunchMetrics[];
  latestMetrics: LaunchMetrics;
  alerts: string[];
  actions: string[];
}

export default function LaunchDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async (refresh: boolean = false) => {
    try {
      const url = refresh ? '/api/product-hunt?refresh=true' : '/api/product-hunt';
      const response = await fetch(url);
      const result = await response.json();

      if (result.status === 'not_launched') {
        setError('No launch data found. Run `npm run launch:monitor` to start tracking.');
        setLoading(false);
        return;
      }

      if (result.status === 'error') {
        setError(result.message);
        setLoading(false);
        return;
      }

      setData(result);
      setLastUpdated(new Date());
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 5 minutes if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchData(true);
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading launch metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{error}</p>
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p className="text-sm font-mono">npm run launch:monitor</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { summary, metrics, alerts, actions, velocityTrend } = data;

  // Prepare chart data
  const chartData = metrics.map(m => ({
    hour: `Hour ${m.hour}`,
    upvotes: m.upvotes,
    ranking: m.ranking,
    velocity: m.velocity,
    comments: m.comments,
  }));

  const isOnTrack = summary.isOnTrack;
  const rankingColor = summary.currentRanking <= 3 ? 'text-green-600' : summary.currentRanking <= 10 ? 'text-yellow-600' : 'text-red-600';
  const velocityTrendIcon = velocityTrend >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Hunt Launch Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Launched: {new Date(data.launchDate).toLocaleDateString()} • Product: {data.productSlug}
              </p>
            </div>
            <div className="text-right">
              <button
                onClick={() => fetchData(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Refresh Now
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {lastUpdated?.toLocaleTimeString()}
              </p>
              <label className="flex items-center gap-2 mt-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh (5 min)
              </label>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Current Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${rankingColor}`}>
                #{summary.currentRanking}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Target: #{summary.targetRanking} {isOnTrack ? '✅' : '⚠️'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Projected: #{summary.estimatedFinalRanking}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Upvotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {summary.currentUpvotes}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Target: {summary.targetUpvotes} ({summary.upvotesGap > 0 ? `-${summary.upvotesGap}` : '+' + Math.abs(summary.upvotesGap)})
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Projected: {summary.projectedFinalUpvotes}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Velocity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                {summary.currentVelocity}
                {velocityTrendIcon}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                upvotes/hour
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Trend: {velocityTrend >= 0 ? '+' : ''}{velocityTrend.toFixed(1)}/hr
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {summary.hoursSinceLaunch}h
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {summary.hoursRemaining}h remaining
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {Math.round((summary.hoursSinceLaunch / 24) * 100)}% complete
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alerts ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {alerts.map((alert, i) => (
                  <li key={i} className="text-red-800 text-sm">
                    {alert}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Hourly Actions */}
        {actions.length > 0 && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Actions for Hour {summary.hoursSinceLaunch}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-blue-900 text-sm">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Upvotes Over Time</CardTitle>
              <CardDescription>Hourly upvote growth</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="upvotes" stroke="#2563eb" fill="#93c5fd" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ranking Position</CardTitle>
              <CardDescription>Product of the Day ranking</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis reversed domain={[1, 20]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="ranking" stroke="#dc2626" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Velocity Trend</CardTitle>
              <CardDescription>Upvotes per hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="velocity" stroke="#16a34a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>Comments over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="comments" stroke="#f59e0b" fill="#fcd34d" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Breakdown</CardTitle>
            <CardDescription>Detailed metrics by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Hour</th>
                    <th className="text-right p-2">Ranking</th>
                    <th className="text-right p-2">Upvotes</th>
                    <th className="text-right p-2">Comments</th>
                    <th className="text-right p-2">Velocity</th>
                    <th className="text-right p-2">Projected</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.slice(-12).reverse().map((m, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-2">Hour {m.hour}</td>
                      <td className="text-right p-2">#{m.ranking}</td>
                      <td className="text-right p-2">{m.upvotes}</td>
                      <td className="text-right p-2">{m.comments}</td>
                      <td className="text-right p-2">{m.velocity}/hr</td>
                      <td className="text-right p-2">{m.projectedFinalUpvotes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
