#!/usr/bin/env tsx
/**
 * Production Health Check Monitor
 * Pings taxbridge.vercel.app every 5 minutes and alerts to Slack if down
 *
 * Usage:
 *   npm run health-check          # Run once
 *   npm run health-check:watch    # Run continuously (every 5 min)
 */

import https from 'https';
import http from 'http';

interface HealthCheckConfig {
  url: string;
  interval: number; // milliseconds
  timeout: number; // milliseconds
  slackWebhookUrl?: string;
  criticalEndpoints: string[];
}

interface HealthCheckResult {
  url: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  statusCode?: number;
  responseTime: number;
  timestamp: string;
  error?: string;
  endpoints: {
    path: string;
    status: 'UP' | 'DOWN';
    statusCode?: number;
    responseTime: number;
  }[];
}

const CONFIG: HealthCheckConfig = {
  url: process.env.PRODUCTION_URL || 'https://taxbridge.vercel.app',
  interval: 5 * 60 * 1000, // 5 minutes
  timeout: 30000, // 30 seconds
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
  criticalEndpoints: [
    '/', // Homepage
    '/dashboard', // Dashboard (requires auth but will redirect)
    '/api/health', // Health check endpoint
  ],
};

const STATE = {
  lastStatus: 'UNKNOWN' as 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN',
  consecutiveFailures: 0,
  lastAlertTimestamp: 0,
  uptimeStart: Date.now(),
  totalChecks: 0,
  failedChecks: 0,
};

/**
 * Fetch URL with timeout
 */
function fetchWithTimeout(url: string, timeout: number): Promise<{ statusCode: number; responseTime: number }> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, { timeout }, (res) => {
      const responseTime = Date.now() - startTime;

      // Consume response data to free up memory
      res.resume();

      resolve({
        statusCode: res.statusCode || 0,
        responseTime,
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });
  });
}

/**
 * Check a single endpoint
 */
async function checkEndpoint(baseUrl: string, path: string, timeout: number) {
  const url = `${baseUrl}${path}`;

  try {
    const result = await fetchWithTimeout(url, timeout);

    return {
      path,
      status: (result.statusCode >= 200 && result.statusCode < 400) ? 'UP' : 'DOWN',
      statusCode: result.statusCode,
      responseTime: result.responseTime,
    } as const;
  } catch (error) {
    return {
      path,
      status: 'DOWN',
      responseTime: timeout,
      error: error instanceof Error ? error.message : String(error),
    } as const;
  }
}

/**
 * Perform comprehensive health check
 */
async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  // Check all critical endpoints in parallel
  const endpointResults = await Promise.all(
    CONFIG.criticalEndpoints.map(path =>
      checkEndpoint(CONFIG.url, path, CONFIG.timeout)
    )
  );

  const totalResponseTime = Date.now() - startTime;
  const failedEndpoints = endpointResults.filter(e => e.status === 'DOWN');

  // Determine overall status
  let status: 'UP' | 'DOWN' | 'DEGRADED';
  if (failedEndpoints.length === 0) {
    status = 'UP';
  } else if (failedEndpoints.length === endpointResults.length) {
    status = 'DOWN';
  } else {
    status = 'DEGRADED';
  }

  return {
    url: CONFIG.url,
    status,
    responseTime: totalResponseTime,
    timestamp: new Date().toISOString(),
    endpoints: endpointResults,
  };
}

/**
 * Send Slack alert
 */
async function sendSlackAlert(result: HealthCheckResult, isRecovery: boolean = false) {
  if (!CONFIG.slackWebhookUrl) {
    console.warn('⚠️  SLACK_WEBHOOK_URL not configured - skipping Slack notification');
    return;
  }

  const emoji = isRecovery ? '✅' : result.status === 'DOWN' ? '🚨' : '⚠️';
  const color = isRecovery ? '#36a64f' : result.status === 'DOWN' ? '#ff0000' : '#ffaa00';
  const title = isRecovery
    ? 'Production Site Recovered'
    : `Production Site ${result.status}`;

  const failedEndpoints = result.endpoints.filter(e => e.status === 'DOWN');
  const uptimePercentage = STATE.totalChecks > 0
    ? ((STATE.totalChecks - STATE.failedChecks) / STATE.totalChecks * 100).toFixed(2)
    : '100.00';

  const message = {
    username: 'TaxBridge Health Monitor',
    icon_emoji: ':chart_with_upwards_trend:',
    attachments: [
      {
        color,
        title: `${emoji} ${title}`,
        text: isRecovery
          ? `Site has recovered and is now operational after ${STATE.consecutiveFailures} failed checks.`
          : `Production site is ${result.status}. Immediate attention required.`,
        fields: [
          {
            title: 'Site URL',
            value: `<${CONFIG.url}|${CONFIG.url}>`,
            short: true,
          },
          {
            title: 'Status',
            value: result.status,
            short: true,
          },
          {
            title: 'Response Time',
            value: `${result.responseTime}ms`,
            short: true,
          },
          {
            title: 'Consecutive Failures',
            value: STATE.consecutiveFailures.toString(),
            short: true,
          },
          {
            title: 'Uptime %',
            value: `${uptimePercentage}%`,
            short: true,
          },
          {
            title: 'Total Checks',
            value: `${STATE.totalChecks} (${STATE.failedChecks} failed)`,
            short: true,
          },
          ...(failedEndpoints.length > 0 ? [{
            title: 'Failed Endpoints',
            value: failedEndpoints.map(e =>
              `• ${e.path} ${e.statusCode ? `(${e.statusCode})` : '(unreachable)'}`
            ).join('\n'),
            short: false,
          }] : []),
        ],
        footer: 'TaxBridge Health Monitor',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  try {
    await new Promise<void>((resolve, reject) => {
      const url = new URL(CONFIG.slackWebhookUrl!);
      const req = https.request({
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`Slack API returned ${res.statusCode}`));
        }
      });

      req.on('error', reject);
      req.write(JSON.stringify(message));
      req.end();
    });

    console.log('✅ Slack alert sent successfully');
  } catch (error) {
    console.error('❌ Failed to send Slack alert:', error);
  }
}

/**
 * Process health check result and send alerts
 */
async function processHealthCheck(result: HealthCheckResult) {
  const now = Date.now();
  const wasDown = STATE.lastStatus === 'DOWN' || STATE.lastStatus === 'DEGRADED';
  const isNowDown = result.status === 'DOWN' || result.status === 'DEGRADED';

  STATE.totalChecks++;
  if (isNowDown) {
    STATE.failedChecks++;
    STATE.consecutiveFailures++;
  } else {
    STATE.consecutiveFailures = 0;
  }

  // Log result
  const emoji = result.status === 'UP' ? '✅' : result.status === 'DEGRADED' ? '⚠️' : '🚨';
  console.log(`\n${emoji} [${result.timestamp}] ${CONFIG.url} - ${result.status}`);
  console.log(`   Response Time: ${result.responseTime}ms`);
  console.log(`   Uptime: ${((STATE.totalChecks - STATE.failedChecks) / STATE.totalChecks * 100).toFixed(2)}%`);

  result.endpoints.forEach(endpoint => {
    const endpointEmoji = endpoint.status === 'UP' ? '  ✓' : '  ✗';
    console.log(`   ${endpointEmoji} ${endpoint.path}: ${endpoint.statusCode || 'unreachable'} (${endpoint.responseTime}ms)`);
  });

  // Send alerts based on state transitions
  const ALERT_COOLDOWN = 15 * 60 * 1000; // 15 minutes between alerts

  if (isNowDown && !wasDown) {
    // Site just went down
    await sendSlackAlert(result, false);
    STATE.lastAlertTimestamp = now;
  } else if (isNowDown && wasDown && STATE.consecutiveFailures % 3 === 0) {
    // Site still down after multiple checks (every 3rd check = every 15 min)
    if (now - STATE.lastAlertTimestamp > ALERT_COOLDOWN) {
      await sendSlackAlert(result, false);
      STATE.lastAlertTimestamp = now;
    }
  } else if (!isNowDown && wasDown) {
    // Site recovered
    await sendSlackAlert(result, true);
    STATE.lastAlertTimestamp = now;
  }

  STATE.lastStatus = result.status;
}

/**
 * Main monitoring loop
 */
async function startMonitoring(continuous: boolean = false) {
  console.log('🚀 TaxBridge Production Health Monitor');
  console.log(`   URL: ${CONFIG.url}`);
  console.log(`   Interval: ${CONFIG.interval / 1000}s`);
  console.log(`   Timeout: ${CONFIG.timeout / 1000}s`);
  console.log(`   Slack Alerts: ${CONFIG.slackWebhookUrl ? 'ENABLED' : 'DISABLED'}`);
  console.log(`   Critical Endpoints: ${CONFIG.criticalEndpoints.length}`);
  console.log(`   Mode: ${continuous ? 'CONTINUOUS' : 'SINGLE CHECK'}\n`);

  if (!CONFIG.slackWebhookUrl) {
    console.warn('⚠️  To enable Slack alerts, set SLACK_WEBHOOK_URL environment variable');
    console.warn('   Create webhook at: https://api.slack.com/messaging/webhooks\n');
  }

  do {
    try {
      const result = await performHealthCheck();
      await processHealthCheck(result);

      if (continuous) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.interval));
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);

      if (continuous) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.interval));
      }
    }
  } while (continuous);
}

// Run if executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const args = process.argv.slice(2);
  const continuous = args.includes('--watch') || args.includes('-w');

  startMonitoring(continuous).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { performHealthCheck, startMonitoring, CONFIG, STATE };
