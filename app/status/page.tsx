import { Metadata } from 'next';
import { Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'System Status - TaxBridge',
  description: 'Real-time system status and uptime monitoring for TaxBridge',
};

/**
 * Status Page
 * Public-facing page showing system health, uptime, and recent incidents
 * Data source: UptimeRobot API or internal monitoring
 */
export default async function StatusPage() {
  // Fetch uptime data (in production, this would come from UptimeRobot API)
  const statusData = await getStatusData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-100 mb-4">
            TaxBridge System Status
          </h1>
          <p className="text-lg text-slate-400">
            Real-time monitoring and performance metrics
          </p>
        </div>

        {/* Overall Status */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${statusData.operational ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <div>
                <h2 className="text-xl font-semibold text-slate-100">
                  {statusData.operational ? 'All Systems Operational' : 'Service Degraded'}
                </h2>
                <p className="text-sm text-slate-400">
                  Last checked: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-500">
                {statusData.uptime}%
              </div>
              <div className="text-sm text-slate-400">30-day uptime</div>
            </div>
          </div>
        </div>

        {/* Service Components */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Components
          </h3>
          <div className="space-y-3">
            {statusData.components.map((component) => (
              <div
                key={component.name}
                className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {component.status === 'operational' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                  <div>
                    <div className="font-medium text-slate-100">
                      {component.name}
                    </div>
                    <div className="text-sm text-slate-400">
                      {component.description}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-300">
                    {component.responseTime}
                  </div>
                  <div className="text-xs text-slate-500">response time</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response Time Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Response Time (Last 7 Days)
          </h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {statusData.responseTimeData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-900 rounded-t-lg relative overflow-hidden"
                  style={{
                    height: `${(data.avgResponseTime / Math.max(...statusData.responseTimeData.map(d => d.avgResponseTime))) * 200}px`,
                    minHeight: '20px'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500 to-emerald-400" />
                </div>
                <div className="text-xs text-slate-400 text-center">
                  {data.day}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-8 text-sm">
            <div>
              <span className="text-slate-400">Avg: </span>
              <span className="text-slate-100 font-medium">
                {statusData.responseTimeData.reduce((sum, d) => sum + d.avgResponseTime, 0) / statusData.responseTimeData.length}ms
              </span>
            </div>
            <div>
              <span className="text-slate-400">Best: </span>
              <span className="text-emerald-500 font-medium">
                {Math.min(...statusData.responseTimeData.map(d => d.avgResponseTime))}ms
              </span>
            </div>
            <div>
              <span className="text-slate-400">Worst: </span>
              <span className="text-amber-500 font-medium">
                {Math.max(...statusData.responseTimeData.map(d => d.avgResponseTime))}ms
              </span>
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Recent Incidents
          </h3>
          {statusData.incidents.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
              <p>No incidents in the last 90 days</p>
            </div>
          ) : (
            <div className="space-y-4">
              {statusData.incidents.map((incident, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-900/50 rounded-lg border-l-4"
                  style={{
                    borderColor: incident.severity === 'critical' ? '#ef4444' :
                                 incident.severity === 'major' ? '#f59e0b' : '#3b82f6'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-100">
                      {incident.title}
                    </h4>
                    <span className="text-xs text-slate-400">
                      {incident.date}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">
                    {incident.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      incident.resolved
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {incident.resolved ? 'Resolved' : 'Investigating'}
                    </span>
                    {incident.duration && (
                      <span className="text-xs text-slate-500">
                        Duration: {incident.duration}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            Status page powered by UptimeRobot and Cloudflare
          </p>
          <p className="mt-1">
            Data refreshed every 5 minutes
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Fetch status data from monitoring service
 * In production, integrate with UptimeRobot API
 */
async function getStatusData() {
  // Mock data - replace with actual UptimeRobot API calls in production
  return {
    operational: true,
    uptime: 99.98,
    components: [
      {
        name: 'Web Application',
        description: 'Main TaxBridge web app (taxbridge.app)',
        status: 'operational' as const,
        responseTime: '142ms',
      },
      {
        name: 'API Services',
        description: 'REST API endpoints (/api/*)',
        status: 'operational' as const,
        responseTime: '89ms',
      },
      {
        name: 'Database',
        description: 'SQLite database operations',
        status: 'operational' as const,
        responseTime: '12ms',
      },
      {
        name: 'Authentication',
        description: 'Clerk authentication service',
        status: 'operational' as const,
        responseTime: '256ms',
      },
      {
        name: 'Payment Processing',
        description: 'Stripe payment gateway',
        status: 'operational' as const,
        responseTime: '312ms',
      },
    ],
    responseTimeData: [
      { day: 'Mon', avgResponseTime: 145 },
      { day: 'Tue', avgResponseTime: 132 },
      { day: 'Wed', avgResponseTime: 156 },
      { day: 'Thu', avgResponseTime: 128 },
      { day: 'Fri', avgResponseTime: 142 },
      { day: 'Sat', avgResponseTime: 138 },
      { day: 'Sun', avgResponseTime: 151 },
    ],
    incidents: [
      // No recent incidents - uncomment to show example
      // {
      //   title: 'Elevated API Response Times',
      //   description: 'We experienced elevated response times on our API endpoints due to increased traffic.',
      //   date: '2026-03-15',
      //   severity: 'minor' as const,
      //   resolved: true,
      //   duration: '23 minutes',
      // },
    ],
  };
}
