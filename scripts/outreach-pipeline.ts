#!/usr/bin/env tsx
/**
 * Outreach Pipeline Manager
 *
 * Terminal-based view of the immigration law firm outreach pipeline.
 * Shows funnel metrics, prospects needing action, and recent activity.
 *
 * Usage:
 *   npm run outreach:pipeline                    # Full pipeline view
 *   npm run outreach:pipeline -- --status replied # Filter by status
 *   npm run outreach:pipeline -- --city Seattle   # Filter by city
 *   npm run outreach:pipeline -- --action         # Show only action items
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data/taxbridge.db');

if (!fs.existsSync(dbPath)) {
  console.error('Database not found. Run npm run db:migrate:outreach first.');
  process.exit(1);
}

const db = new Database(dbPath);

// Parse args
const args = process.argv.slice(2);
const statusFilter = args.includes('--status') ? args[args.indexOf('--status') + 1] : null;
const cityFilter = args.includes('--city') ? args[args.indexOf('--city') + 1] : null;
const actionOnly = args.includes('--action');

function printDivider(char = '=', width = 80) {
  console.log(char.repeat(width));
}

function printFunnel() {
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'target' THEN 1 ELSE 0 END) as target,
      SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted,
      SUM(CASE WHEN status IN ('opened', 'clicked', 'replied', 'demo_scheduled', 'trial_started', 'closed_won') AND email_opened = 1 THEN 1 ELSE 0 END) as opened,
      SUM(CASE WHEN status IN ('clicked', 'replied', 'demo_scheduled', 'trial_started', 'closed_won') AND email_clicked = 1 THEN 1 ELSE 0 END) as clicked,
      SUM(CASE WHEN status IN ('replied', 'demo_scheduled', 'trial_started', 'closed_won') THEN 1 ELSE 0 END) as replied,
      SUM(CASE WHEN status IN ('demo_scheduled', 'trial_started', 'closed_won') THEN 1 ELSE 0 END) as demo_scheduled,
      SUM(CASE WHEN status IN ('trial_started', 'closed_won') THEN 1 ELSE 0 END) as trial_started,
      SUM(CASE WHEN status = 'closed_won' THEN 1 ELSE 0 END) as closed_won,
      SUM(CASE WHEN status = 'closed_lost' THEN 1 ELSE 0 END) as closed_lost
    FROM enterprise_prospects
  `).get() as any;

  const contacted = stats.contacted + stats.opened + stats.clicked + stats.replied +
                    stats.demo_scheduled + stats.trial_started + stats.closed_won + stats.closed_lost;

  console.log('\n  IMMIGRATION LAW FIRM PARTNER OUTREACH PIPELINE\n');
  printDivider();

  const funnelStages = [
    { label: 'Total Firms', count: stats.total, target: 200 },
    { label: 'Contacted', count: contacted, target: 200 },
    { label: 'Opened', count: stats.opened || 0, target: 90 },
    { label: 'Clicked', count: stats.clicked || 0, target: 24 },
    { label: 'Replied', count: stats.replied || 0, target: 16 },
    { label: 'Demo Scheduled', count: stats.demo_scheduled || 0, target: 6 },
    { label: 'Trial Started', count: stats.trial_started || 0, target: 3 },
    { label: 'Partners Onboarded', count: stats.closed_won || 0, target: 10 },
  ];

  const maxBarWidth = 40;

  for (const stage of funnelStages) {
    const pct = stats.total > 0 ? Math.round((stage.count / stats.total) * 100) : 0;
    const barWidth = Math.round((stage.count / Math.max(stats.total, 1)) * maxBarWidth);
    const bar = '#'.repeat(barWidth) + ' '.repeat(maxBarWidth - barWidth);
    const status = stage.count >= stage.target ? 'HIT' : `${stage.target - stage.count} to go`;

    console.log(`  ${stage.label.padEnd(20)} [${bar}] ${String(stage.count).padStart(3)} (${String(pct).padStart(2)}%) | target: ${stage.target} (${status})`);
  }

  if (stats.closed_lost > 0) {
    console.log(`  ${'Closed Lost'.padEnd(20)} ${' '.repeat(maxBarWidth + 3)} ${stats.closed_lost}`);
  }

  printDivider();

  // Key metrics
  const openRate = contacted > 0 ? Math.round((stats.opened / contacted) * 100) : 0;
  const replyRate = contacted > 0 ? Math.round((stats.replied / contacted) * 100) : 0;

  console.log(`\n  Open Rate: ${openRate}% (target: 45%)  |  Reply Rate: ${replyRate}% (target: 8%)`);
  console.log(`  Partners: ${stats.closed_won}/10  |  Projected Referrals: ${stats.closed_won * 5}/50`);
  console.log(`  Revenue Projection: $${(stats.closed_won * 5 * 299).toLocaleString()}/year`);
}

function printActionItems() {
  console.log('\n  ACTION ITEMS\n');
  printDivider('-');

  // Replied but no demo
  const needsDemo = db.prepare(`
    SELECT firm_name, contact_name, contact_email, city, state, reply_date
    FROM enterprise_prospects
    WHERE status = 'replied'
      AND demo_scheduled_date IS NULL
    ORDER BY reply_date ASC
  `).all() as any[];

  if (needsDemo.length > 0) {
    console.log(`\n  SCHEDULE DEMO (${needsDemo.length} prospects):`);
    needsDemo.forEach(p => {
      const daysSinceReply = p.reply_date
        ? Math.floor((Date.now() - new Date(p.reply_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      const urgent = daysSinceReply > 2 ? ' [URGENT]' : '';
      console.log(`    ${p.firm_name} (${p.city}, ${p.state}) - replied ${daysSinceReply}d ago${urgent}`);
      console.log(`      Contact: ${p.contact_name} <${p.contact_email}>`);
    });
  }

  // Trials ending soon
  const trialsEnding = db.prepare(`
    SELECT firm_name, contact_name, trial_start_date, trial_end_date
    FROM enterprise_prospects
    WHERE status = 'trial_started'
      AND trial_end_date IS NOT NULL
      AND julianday(trial_end_date) - julianday('now') <= 5
      AND julianday(trial_end_date) - julianday('now') >= -1
    ORDER BY trial_end_date ASC
  `).all() as any[];

  if (trialsEnding.length > 0) {
    console.log(`\n  TRIAL ENDING SOON (${trialsEnding.length} prospects):`);
    trialsEnding.forEach(p => {
      const daysLeft = Math.ceil(
        (new Date(p.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      console.log(`    ${p.firm_name} - ${daysLeft > 0 ? `${daysLeft}d left` : 'EXPIRED'}`);
      console.log(`      Contact: ${p.contact_name}`);
    });
  }

  // Demo completed but not started trial
  const demosDone = db.prepare(`
    SELECT firm_name, contact_name, demo_completed_date
    FROM enterprise_prospects
    WHERE status = 'demo_scheduled'
      AND demo_completed_date IS NOT NULL
      AND trial_start_date IS NULL
    ORDER BY demo_completed_date ASC
  `).all() as any[];

  if (demosDone.length > 0) {
    console.log(`\n  CONVERT TO TRIAL (${demosDone.length} prospects):`);
    demosDone.forEach(p => {
      console.log(`    ${p.firm_name} - demo completed ${p.demo_completed_date}`);
    });
  }

  if (needsDemo.length === 0 && trialsEnding.length === 0 && demosDone.length === 0) {
    console.log('\n  No immediate actions needed. All caught up!\n');
  }
}

function printProspects(filter?: { status?: string; city?: string }) {
  let query = 'SELECT * FROM enterprise_prospects WHERE 1=1';
  const params: any[] = [];

  if (filter?.status) {
    query += ' AND status = ?';
    params.push(filter.status);
  }

  if (filter?.city) {
    query += ' AND city LIKE ?';
    params.push(`%${filter.city}%`);
  }

  query += ' ORDER BY updated_at DESC LIMIT 30';

  const prospects = db.prepare(query).all(...params) as any[];

  console.log(`\n  PROSPECTS (${prospects.length} shown)\n`);
  printDivider('-');

  if (prospects.length === 0) {
    console.log('  No prospects found matching filters.\n');
    return;
  }

  const statusLabels: Record<string, string> = {
    target: 'TGT', contacted: 'CTD', opened: 'OPN', clicked: 'CLK',
    replied: 'RPL', demo_scheduled: 'DEM', trial_started: 'TRL',
    closed_won: 'WON', closed_lost: 'LST',
  };

  console.log(`  ${'Firm'.padEnd(35)} ${'City'.padEnd(18)} ${'Status'.padEnd(6)} ${'Contact'.padEnd(25)} Last Updated`);
  printDivider('-');

  prospects.forEach(p => {
    const statusLabel = statusLabels[p.status] || p.status;
    const location = p.city ? `${p.city}, ${p.state || ''}` : '';
    const updated = p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '-';

    console.log(
      `  ${(p.firm_name || '').substring(0, 34).padEnd(35)} ` +
      `${location.substring(0, 17).padEnd(18)} ` +
      `${statusLabel.padEnd(6)} ` +
      `${(p.contact_name || p.contact_email || '').substring(0, 24).padEnd(25)} ` +
      `${updated}`
    );
  });
}

function printCityBreakdown() {
  const cities = db.prepare(`
    SELECT city, state, COUNT(*) as count,
      SUM(CASE WHEN status = 'closed_won' THEN 1 ELSE 0 END) as partners
    FROM enterprise_prospects
    WHERE city IS NOT NULL
    GROUP BY city, state
    ORDER BY count DESC
  `).all() as any[];

  if (cities.length > 0) {
    console.log('\n  CITY BREAKDOWN\n');
    printDivider('-');
    cities.forEach(c => {
      const partners = c.partners > 0 ? ` (${c.partners} partners)` : '';
      console.log(`  ${c.city}, ${c.state}: ${c.count} firms${partners}`);
    });
  }
}

// Main
console.log('');

if (actionOnly) {
  printActionItems();
} else {
  printFunnel();

  if (statusFilter || cityFilter) {
    printProspects({ status: statusFilter || undefined, city: cityFilter || undefined });
  } else {
    printActionItems();
    printCityBreakdown();
    printProspects();
  }
}

console.log('');
db.close();
