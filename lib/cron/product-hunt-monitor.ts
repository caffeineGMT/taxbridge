/**
 * Product Hunt Monitor - Cron Job
 *
 * Automated hourly monitoring of Product Hunt launch.
 * Runs every hour during launch day (24 hours).
 *
 * Setup:
 *   1. On launch day, run: npm run launch:start-cron
 *   2. Monitor will run every hour automatically
 *   3. View results: http://localhost:3000/launch-dashboard
 *   4. Stop monitoring: npm run launch:stop-cron
 */

import { ProductHuntMonitor } from '../../scripts/monitor-product-hunt';

// Configuration
const PRODUCT_SLUG = process.env.PRODUCT_HUNT_SLUG || 'taxbridge';
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Run monitoring check and schedule next
 */
async function runMonitoringCycle() {
  console.log(`\n⏰ Hourly Product Hunt check - ${new Date().toLocaleString()}\n`);

  try {
    const monitor = new ProductHuntMonitor(PRODUCT_SLUG);
    await monitor.monitor();

    console.log('\n✅ Check complete. Next check in 1 hour.\n');
  } catch (error) {
    console.error('❌ Error during monitoring:', error);
    console.log('Will retry in 1 hour...\n');
  }
}

/**
 * Start continuous monitoring
 */
export async function startMonitoring() {
  console.log('🚀 Starting Product Hunt Launch Monitor');
  console.log('─'.repeat(60));
  console.log(`  Product: ${PRODUCT_SLUG}`);
  console.log(`  Check Interval: Every hour`);
  console.log(`  Dashboard: http://localhost:3000/launch-dashboard`);
  console.log('─'.repeat(60));
  console.log('\nPress Ctrl+C to stop monitoring\n');

  // Run immediately
  await runMonitoringCycle();

  // Schedule hourly checks
  setInterval(runMonitoringCycle, CHECK_INTERVAL_MS);
}

/**
 * Send alert notification (email, SMS, etc.)
 */
export async function sendAlert(message: string, priority: 'low' | 'medium' | 'high' | 'critical') {
  // TODO: Integrate with SendGrid, Twilio, or Slack for alerts
  console.log(`\n🔔 ALERT [${priority.toUpperCase()}]: ${message}\n`);

  // For now, just log to console
  // In production, you would:
  // 1. Send email via SendGrid
  // 2. Send SMS via Twilio
  // 3. Send Slack message
  // 4. Send push notification

  // Example SendGrid integration:
  // if (priority === 'critical') {
  //   await sendgrid.send({
  //     to: 'founder@taxbridge.com',
  //     from: 'alerts@taxbridge.com',
  //     subject: `🚨 Product Hunt Alert: ${message}`,
  //     text: message,
  //   });
  // }
}

// Run if called directly
if (require.main === module) {
  startMonitoring().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
