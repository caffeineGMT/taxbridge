/**
 * Reddit Daily Engagement Tracker
 * Helps execute the 10 comments/day growth campaign
 *
 * Usage: npm run reddit:daily
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

interface DailyEngagementPlan {
  date: string;
  dayOfWeek: string;
  primarySubreddit: string;
  useCases: string[];
  searchKeywords: string[];
  targetComments: number;
  targetLinks: number;
}

interface EngagementLog {
  timestamp: string;
  subreddit: string;
  useCase: string;
  postUrl: string;
  utmLink: string;
  commentText: string;
  upvotes24h?: number;
  replies24h?: number;
  clicks?: number;
  conversions?: number;
}

const SUBREDDIT_SCHEDULE = {
  Monday: {
    primary: 'r/cscareerquestions',
    secondary: ['r/h1b'],
    focus: 'Offer negotiations, total comp questions',
    useCases: ['3.1', '1.1'],
    keywords: ['offer', 'total comp', 'RSU', 'FAANG']
  },
  Tuesday: {
    primary: 'r/h1b',
    secondary: ['r/ImmigrationCanada'],
    focus: 'Visa + tax questions, layoff support',
    useCases: ['1.2', '1.3'],
    keywords: ['tax', 'Canada', 'layoff', 'TN visa']
  },
  Wednesday: {
    primary: 'r/tax',
    secondary: ['r/personalfinance'],
    focus: 'Technical tax questions, FTC',
    useCases: ['2.1', '5.1'],
    keywords: ['Foreign Tax Credit', 'dual status', 'Canada', 'amendment']
  },
  Thursday: {
    primary: 'r/ImmigrationCanada',
    secondary: ['r/h1b'],
    focus: 'Cross-border tax, TN visa',
    useCases: ['2.2', '2.1'],
    keywords: ['TN visa tax', 'US Canada tax', 'work permit']
  },
  Friday: {
    primary: 'r/personalfinance',
    secondary: ['r/tax', 'r/cscareerquestions'],
    focus: 'State tax, RSU strategy',
    useCases: ['4.1', '3.2'],
    keywords: ['RSU', 'state tax', 'remote work', 'sell or hold']
  },
  Saturday: {
    primary: 'r/personalfinance',
    secondary: [],
    focus: 'Light engagement, reply to existing threads',
    useCases: [],
    keywords: []
  },
  Sunday: {
    primary: 'r/personalfinance',
    secondary: [],
    focus: 'Light engagement, prep for Monday',
    useCases: [],
    keywords: []
  }
};

const DAILY_TARGETS = {
  weekday: {
    comments: 10,
    linksShared: 5,
    timeMinutes: 60
  },
  weekend: {
    comments: 3,
    linksShared: 1,
    timeMinutes: 20
  }
};

class RedditDailyTracker {
  private logFile: string;
  private metricsFile: string;

  constructor() {
    const dataDir = path.join(process.cwd(), 'data', 'reddit-campaign');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.logFile = path.join(dataDir, 'daily-engagement-log.jsonl');
    this.metricsFile = path.join(dataDir, 'campaign-metrics.json');
  }

  getDayOfWeek(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }

  generateDailyPlan(): DailyEngagementPlan {
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = this.getDayOfWeek();
    const schedule = SUBREDDIT_SCHEDULE[dayOfWeek as keyof typeof SUBREDDIT_SCHEDULE];
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
    const targets = isWeekend ? DAILY_TARGETS.weekend : DAILY_TARGETS.weekday;

    return {
      date: today,
      dayOfWeek,
      primarySubreddit: schedule.primary,
      useCases: schedule.useCases,
      searchKeywords: schedule.keywords,
      targetComments: targets.comments,
      targetLinks: targets.linksShared
    };
  }

  logComment(log: EngagementLog): void {
    const logEntry = JSON.stringify(log) + '\n';
    fs.appendFileSync(this.logFile, logEntry);
    console.log(`✅ Logged comment to ${log.subreddit}`);
  }

  getTodayStats(): {
    comments: number;
    links: number;
    targetComments: number;
    targetLinks: number;
    progress: number;
  } {
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = this.getDayOfWeek();
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
    const targets = isWeekend ? DAILY_TARGETS.weekend : DAILY_TARGETS.weekday;

    if (!fs.existsSync(this.logFile)) {
      return {
        comments: 0,
        links: 0,
        targetComments: targets.comments,
        targetLinks: targets.linksShared,
        progress: 0
      };
    }

    const logs = fs.readFileSync(this.logFile, 'utf-8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line) as EngagementLog)
      .filter(log => log.timestamp.startsWith(today));

    const comments = logs.length;
    const links = logs.filter(log => log.utmLink).length;
    const progress = Math.round((comments / targets.comments) * 100);

    return {
      comments,
      links,
      targetComments: targets.comments,
      targetLinks: targets.linksShared,
      progress
    };
  }

  printDailyBrief(): void {
    const plan = this.generateDailyPlan();
    const stats = this.getTodayStats();

    console.log('\n' + '='.repeat(80));
    console.log('🚀 REDDIT DAILY ENGAGEMENT TRACKER');
    console.log('='.repeat(80));
    console.log(`\n📅 Date: ${plan.date} (${plan.dayOfWeek})`);
    console.log(`\n📊 Progress: ${stats.comments}/${stats.targetComments} comments (${stats.progress}%)`);
    console.log(`   Links shared: ${stats.links}/${stats.targetLinks}`);

    if (stats.progress >= 100) {
      console.log('\n✅ 🎉 Daily target achieved! Great work!');
    } else {
      console.log(`\n⏳ ${stats.targetComments - stats.comments} comments remaining to hit target`);
    }

    console.log(`\n🎯 Today's Focus: ${plan.primarySubreddit}`);
    console.log(`   Use Cases: ${plan.useCases.join(', ')}`);
    console.log(`\n🔍 Search Keywords:`);
    plan.searchKeywords.forEach(keyword => {
      console.log(`   - "${keyword}" site:reddit.com${plan.primarySubreddit.substring(1)}`);
    });

    console.log('\n📝 Quick Actions:');
    console.log(`   1. Open Reddit: https://reddit.com${plan.primarySubreddit}/new`);
    console.log(`   2. Review use cases: docs/REDDIT_CALCULATOR_USE_CASES.md`);
    console.log(`   3. Log comments: npm run reddit:log`);
    console.log(`   4. Check metrics: npm run reddit:metrics`);

    console.log('\n' + '='.repeat(80) + '\n');
  }

  updateMetrics(): void {
    const today = new Date().toISOString().split('T')[0];

    if (!fs.existsSync(this.logFile)) {
      console.log('No engagement data found yet.');
      return;
    }

    const allLogs = fs.readFileSync(this.logFile, 'utf-8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line) as EngagementLog);

    // Group by date
    const byDate: Record<string, EngagementLog[]> = {};
    allLogs.forEach(log => {
      const date = log.timestamp.split('T')[0];
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(log);
    });

    // Calculate campaign totals
    const campaignStart = '2026-03-19';
    const campaignLogs = allLogs.filter(log => log.timestamp >= campaignStart);

    const metrics = {
      campaignStart,
      lastUpdated: new Date().toISOString(),
      totalDays: Object.keys(byDate).length,
      totalComments: campaignLogs.length,
      totalLinks: campaignLogs.filter(log => log.utmLink).length,
      totalClicks: campaignLogs.reduce((sum, log) => sum + (log.clicks || 0), 0),
      totalConversions: campaignLogs.reduce((sum, log) => sum + (log.conversions || 0), 0),
      avgCommentsPerDay: campaignLogs.length / Math.max(Object.keys(byDate).length, 1),
      avgClicksPerLink: campaignLogs.filter(log => log.utmLink).length > 0
        ? campaignLogs.reduce((sum, log) => sum + (log.clicks || 0), 0) / campaignLogs.filter(log => log.utmLink).length
        : 0,
      bySubreddit: {} as Record<string, number>,
      dailyBreakdown: {} as Record<string, { comments: number; links: number; clicks: number }>
    };

    // Subreddit breakdown
    campaignLogs.forEach(log => {
      if (!metrics.bySubreddit[log.subreddit]) {
        metrics.bySubreddit[log.subreddit] = 0;
      }
      metrics.bySubreddit[log.subreddit]++;
    });

    // Daily breakdown
    Object.keys(byDate).forEach(date => {
      const logs = byDate[date];
      metrics.dailyBreakdown[date] = {
        comments: logs.length,
        links: logs.filter(log => log.utmLink).length,
        clicks: logs.reduce((sum, log) => sum + (log.clicks || 0), 0)
      };
    });

    fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));
    console.log(`\n✅ Metrics updated: ${this.metricsFile}`);
    console.log(`\n📊 Campaign Summary (since ${campaignStart}):`);
    console.log(`   Total comments: ${metrics.totalComments}`);
    console.log(`   Calculator links: ${metrics.totalLinks}`);
    console.log(`   Total clicks: ${metrics.totalClicks}`);
    console.log(`   Avg comments/day: ${metrics.avgCommentsPerDay.toFixed(1)}`);
    console.log(`\n🎯 Subreddit Breakdown:`);
    Object.entries(metrics.bySubreddit)
      .sort(([, a], [, b]) => b - a)
      .forEach(([subreddit, count]) => {
        console.log(`   ${subreddit}: ${count} comments`);
      });
  }

  interactiveLog(): void {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n📝 Log a new Reddit comment\n');

    const log: Partial<EngagementLog> = {
      timestamp: new Date().toISOString()
    };

    readline.question('Subreddit (e.g., r/h1b): ', (subreddit: string) => {
      log.subreddit = subreddit;

      readline.question('Use Case # (e.g., 1.1): ', (useCase: string) => {
        log.useCase = useCase;

        readline.question('Post URL: ', (postUrl: string) => {
          log.postUrl = postUrl;

          readline.question('UTM Link (or press Enter to skip): ', (utmLink: string) => {
            log.utmLink = utmLink || '';

            readline.question('Comment preview (first 50 chars): ', (commentText: string) => {
              log.commentText = commentText;

              this.logComment(log as EngagementLog);
              console.log('\n✅ Comment logged successfully!');

              const stats = this.getTodayStats();
              console.log(`\n📊 Today's progress: ${stats.comments}/${stats.targetComments} comments (${stats.progress}%)`);

              readline.close();
            });
          });
        });
      });
    });
  }
}

// CLI commands
const command = process.argv[2];
const tracker = new RedditDailyTracker();

switch (command) {
  case 'brief':
    tracker.printDailyBrief();
    break;

  case 'log':
    tracker.interactiveLog();
    break;

  case 'metrics':
    tracker.updateMetrics();
    break;

  case 'stats':
    const stats = tracker.getTodayStats();
    console.log(JSON.stringify(stats, null, 2));
    break;

  default:
    tracker.printDailyBrief();
    break;
}
