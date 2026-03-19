/**
 * Product Hunt Launch Monitor
 *
 * Monitors Product Hunt ranking every hour and executes actions based on performance.
 * Tracks metrics: upvotes, comments, ranking, website clicks, conversions
 *
 * Usage:
 *   npm run launch:monitor              # Run once
 *   npm run launch:monitor -- --watch   # Run continuously (every hour)
 */

import fs from 'fs/promises';
import path from 'path';
import { createProductHuntClient } from '../lib/product-hunt/client';

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

interface LaunchData {
  productId: string;
  productSlug: string;
  launchDate: string;
  targetUpvotes: number;
  targetRanking: number;
  metrics: LaunchMetrics[];
}

// Hour-by-hour action plan from launch strategy
const HOURLY_ACTIONS: Record<number, string[]> = {
  0: ['🚀 Launch! Post first comment within 2 minutes', 'Pin maker comment'],
  1: ['📧 Email beta users (first wave)', 'Monitor comments - respond within 15 min'],
  2: ['Monitor upvote velocity', 'Respond to all comments'],
  3: ['Check ranking position', 'Update tracking spreadsheet'],
  4: ['Monitor velocity', 'Respond to comments'],
  5: ['Prepare morning posts', 'Check competitor rankings'],
  6: ['📧 Send beta user reminder email', '📱 Post on r/PersonalFinanceCanada'],
  7: ['💻 Post on Hacker News (Show HN)', 'First comment with technical details'],
  8: ['📧 Email investor network', 'Monitor HN frontpage status'],
  9: ['📱 Post on r/CanadianInvestor', '📱 Post on r/ImmigrationCanada'],
  10: ['Update tracking metrics', 'Respond to all comments'],
  11: ['Monitor velocity - adjust strategy if needed'],
  12: ['📱 Post on LinkedIn (personal)', 'Share progress update'],
  13: ['🐦 Post Twitter thread (8 tweets)', 'Engage with replies'],
  14: ['Monitor Twitter engagement', 'Retweet supporters'],
  15: ['📱 Post on r/SideProject', 'Monitor subreddit engagement'],
  16: ['📱 Post on r/cscareerquestions', 'Update tracking'],
  17: ['Check velocity - activate emergency protocol if needed'],
  18: ['📱 Post on Indie Hackers', 'Engage with community'],
  19: ['📱 Post on Facebook H-1B groups (3 groups)', 'Monitor responses'],
  20: ['📱 Post on LinkedIn groups', 'Final social push'],
  21: ['Monitor final ranking position', 'Respond to remaining comments'],
  22: ['Final comment sweep', 'Thank top supporters'],
  23: ['Launch day complete! Export final metrics', 'Plan thank-you emails'],
};

// Alert triggers
const ALERT_THRESHOLDS = {
  VELOCITY_LOW: 15,           // upvotes/hour below this = warning
  RANKING_DROP: 3,            // ranking drops by this amount = alert
  TARGET_MISS_HOUR_6: 100,    // if upvotes < 100 by hour 6 = alert
  TARGET_MISS_HOUR_12: 250,   // if upvotes < 250 by hour 12 = alert
  TARGET_MISS_HOUR_18: 400,   // if upvotes < 400 by hour 18 = activate emergency
  COMMENTS_RESPONSE_TIME: 15, // respond within 15 minutes
};

class ProductHuntMonitor {
  private dataPath: string;
  private client: ReturnType<typeof createProductHuntClient>;
  private productSlug: string;
  private productId: string | null = null;

  constructor(productSlug: string) {
    this.productSlug = productSlug;
    this.dataPath = path.join(process.cwd(), 'data', 'launch-metrics.json');
    this.client = createProductHuntClient();
  }

  /**
   * Load existing launch data or create new
   */
  private async loadLaunchData(): Promise<LaunchData> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Create new launch data
      return {
        productId: '',
        productSlug: this.productSlug,
        launchDate: new Date().toISOString(),
        targetUpvotes: 500,
        targetRanking: 3,
        metrics: [],
      };
    }
  }

  /**
   * Save launch data to file
   */
  private async saveLaunchData(data: LaunchData): Promise<void> {
    await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
    await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2));
  }

  /**
   * Check current metrics and generate alerts
   */
  private generateAlerts(
    metrics: LaunchMetrics,
    previousMetrics: LaunchMetrics | null,
    launchData: LaunchData
  ): string[] {
    const alerts: string[] = [];

    // Velocity alert
    if (metrics.velocity < ALERT_THRESHOLDS.VELOCITY_LOW) {
      alerts.push(`⚠️  LOW VELOCITY: ${metrics.velocity} upvotes/hour (target: ${ALERT_THRESHOLDS.VELOCITY_LOW}+)`);
    }

    // Ranking drop alert
    if (previousMetrics && metrics.ranking > previousMetrics.ranking + ALERT_THRESHOLDS.RANKING_DROP) {
      alerts.push(`🔻 RANKING DROPPED: #${previousMetrics.ranking} → #${metrics.ranking} (dropped ${metrics.ranking - previousMetrics.ranking} positions)`);
    }

    // Hour-specific target alerts
    if (metrics.hour >= 6 && metrics.upvotes < ALERT_THRESHOLDS.TARGET_MISS_HOUR_6) {
      alerts.push(`🚨 BEHIND TARGET: ${metrics.upvotes} upvotes at hour ${metrics.hour} (need ${ALERT_THRESHOLDS.TARGET_MISS_HOUR_6}+)`);
    }

    if (metrics.hour >= 12 && metrics.upvotes < ALERT_THRESHOLDS.TARGET_MISS_HOUR_12) {
      alerts.push(`🚨 BEHIND TARGET: ${metrics.upvotes} upvotes at hour ${metrics.hour} (need ${ALERT_THRESHOLDS.TARGET_MISS_HOUR_12}+)`);
    }

    if (metrics.hour >= 18 && metrics.upvotes < ALERT_THRESHOLDS.TARGET_MISS_HOUR_18) {
      alerts.push(`🚨🚨 EMERGENCY: ${metrics.upvotes} upvotes at hour ${metrics.hour} (need ${ALERT_THRESHOLDS.TARGET_MISS_HOUR_18}+)`);
      alerts.push(`📧 ACTIVATE EMAIL LIST: Send urgent "upvote now" email`);
    }

    // Top 3 alert
    if (metrics.hour >= 18 && metrics.ranking > launchData.targetRanking) {
      alerts.push(`🎯 NOT IN TOP 3: Currently #${metrics.ranking} (target: #${launchData.targetRanking})`);
      alerts.push(`⚡ FINAL PUSH NEEDED: ${metrics.projectedFinalUpvotes} projected (may not be enough)`);
    }

    // Success milestones
    if (metrics.ranking <= 3 && (!previousMetrics || previousMetrics.ranking > 3)) {
      alerts.push(`🎉 TOP 3 ACHIEVED! Currently #${metrics.ranking}`);
    }

    if (metrics.ranking === 1 && (!previousMetrics || previousMetrics.ranking > 1)) {
      alerts.push(`🏆 #1 PRODUCT OF THE DAY! 🏆`);
    }

    return alerts;
  }

  /**
   * Run monitoring check
   */
  async monitor(): Promise<void> {
    console.log('\n🔍 Product Hunt Launch Monitor\n');
    console.log('═'.repeat(60));

    try {
      // Load launch data
      const launchData = await this.loadLaunchData();

      // Get product details
      let product = await this.client.getProduct(this.productSlug);

      if (!product) {
        console.error(`❌ Product not found: ${this.productSlug}`);
        console.log('\n💡 Make sure the product slug is correct.');
        console.log('Example: "taxbridge" or "your-product-name"');
        return;
      }

      this.productId = product.id;
      if (!launchData.productId) {
        launchData.productId = product.id;
      }

      // Get detailed metrics
      const productMetrics = await this.client.getProductMetrics(product.id);

      if (!productMetrics) {
        console.error(`❌ Could not fetch metrics for product: ${product.id}`);
        return;
      }

      // Get today's products for ranking
      const todayProducts = await this.client.getTodayProducts();

      // Calculate velocity and projection
      const velocity = this.client.calculateVelocity(productMetrics);
      const projection = this.client.estimateFinalRanking(productMetrics, todayProducts);

      // Get actions for current hour
      const currentHour = productMetrics.hoursSinceLaunch;
      const actions = HOURLY_ACTIONS[currentHour] || ['Monitor metrics and respond to comments'];

      // Create metrics record
      const metrics: LaunchMetrics = {
        timestamp: new Date().toISOString(),
        hour: currentHour,
        ranking: productMetrics.ranking,
        upvotes: productMetrics.upvotes,
        comments: productMetrics.comments,
        websiteClicks: productMetrics.websiteClicks,
        velocity,
        projectedFinalUpvotes: projection.projectedUpvotes,
        estimatedFinalRanking: projection.estimated,
        actions,
        alerts: [],
      };

      // Generate alerts
      const previousMetrics = launchData.metrics[launchData.metrics.length - 1] || null;
      metrics.alerts = this.generateAlerts(metrics, previousMetrics, launchData);

      // Save metrics
      launchData.metrics.push(metrics);
      await this.saveLaunchData(launchData);

      // Display results
      this.displayMetrics(product.name, product.id, metrics, todayProducts.products.slice(0, 5));

      // Display alerts
      if (metrics.alerts.length > 0) {
        console.log('\n🚨 ALERTS:');
        console.log('─'.repeat(60));
        metrics.alerts.forEach(alert => console.log(`  ${alert}`));
      }

      // Display actions
      console.log('\n📋 ACTIONS FOR HOUR', currentHour + ':');
      console.log('─'.repeat(60));
      actions.forEach((action, i) => {
        console.log(`  ${i + 1}. ${action}`);
      });

      console.log('\n═'.repeat(60));
      console.log(`✅ Metrics saved to: ${this.dataPath}`);
      console.log(`📊 Dashboard: http://localhost:3000/launch-dashboard`);

    } catch (error) {
      console.error('❌ Error monitoring Product Hunt:', error);
      throw error;
    }
  }

  /**
   * Display current metrics
   */
  private displayMetrics(
    productName: string,
    productId: string,
    metrics: LaunchMetrics,
    topProducts: any[]
  ): void {
    console.log(`\n📊 ${productName} - Hour ${metrics.hour}`);
    console.log('─'.repeat(60));
    console.log(`  🏆 Ranking:          #${metrics.ranking} / ${topProducts.length}+`);
    console.log(`  👍 Upvotes:          ${metrics.upvotes}`);
    console.log(`  💬 Comments:         ${metrics.comments}`);
    console.log(`  🌐 Website Clicks:   ${metrics.websiteClicks}`);
    console.log(`  ⚡ Velocity:         ${metrics.velocity} upvotes/hour`);
    console.log(`  🎯 Projected Final:  ${metrics.projectedFinalUpvotes} upvotes (Rank #${metrics.estimatedFinalRanking})`);

    console.log('\n🏆 Top 5 Products Today:');
    console.log('─'.repeat(60));
    topProducts.forEach((product, index) => {
      const isOurs = product.id === productId;
      const marker = isOurs ? '👉' : '  ';
      console.log(`${marker} #${index + 1}: ${product.name.padEnd(30)} ${product.votesCount} upvotes`);
    });
  }

  /**
   * Run monitoring in watch mode (every hour)
   */
  async watch(): Promise<void> {
    console.log('👀 Watch mode enabled - monitoring every hour\n');

    // Run immediately
    await this.monitor();

    // Then run every hour
    setInterval(async () => {
      console.log(`\n⏰ Hourly check at ${new Date().toLocaleTimeString()}\n`);
      await this.monitor();
    }, 60 * 60 * 1000); // 1 hour
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const watchMode = args.includes('--watch') || args.includes('-w');
  const productSlug = args.find(arg => !arg.startsWith('-')) || process.env.PRODUCT_HUNT_SLUG || 'taxbridge';

  const monitor = new ProductHuntMonitor(productSlug);

  if (watchMode) {
    await monitor.watch();
  } else {
    await monitor.monitor();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { ProductHuntMonitor };
