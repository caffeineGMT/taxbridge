#!/usr/bin/env tsx
/**
 * Set Up Instantly.ai Campaign
 *
 * Creates campaign, configures email sequence, and adds verified leads.
 * Alternatively generates CSV for manual upload.
 *
 * Usage:
 *   INSTANTLY_API_KEY=xxx npm run outreach:setup-campaign
 *   npm run outreach:setup-campaign -- --csv-only
 */

import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';
import {
  createCampaign,
  addLeadsToCampaign,
  setupEmailSequence,
  generateCampaignConfig,
  type InstantlyConfig,
  type InstantlyLead,
} from '../lib/outreach/instantly-integration';
import { generateEmailSequence } from '../lib/email/cpa-outreach-sequence';

const API_KEY = process.env.INSTANTLY_API_KEY || '';
const csvOnly = process.argv.includes('--csv-only');

const config: InstantlyConfig = {
  apiKey: API_KEY,
  baseUrl: 'https://api.instantly.ai/api/v1',
};

async function main() {
  console.log('Instantly.ai Campaign Setup\n');

  const dbPath = path.join(process.cwd(), 'data/taxbridge.db');
  if (!fs.existsSync(dbPath)) {
    console.error('Database not found. Run npm run db:migrate:outreach first.');
    process.exit(1);
  }

  const db = new Database(dbPath);

  // Get verified prospects (valid or catchall)
  const prospects = db.prepare(`
    SELECT id, firm_name, contact_email, contact_name, contact_title, city, state
    FROM enterprise_prospects
    WHERE status = 'target'
      AND (email_verification_status IS NULL
           OR email_verification_status IN ('valid', 'catchall'))
      AND contact_email IS NOT NULL
      AND contact_email != ''
    ORDER BY city, firm_name
  `).all() as any[];

  if (prospects.length === 0) {
    console.log('No eligible prospects found.');
    console.log('Run npm run scrape:aila-firms first to load firms.');
    db.close();
    return;
  }

  console.log(`Found ${prospects.length} eligible prospects\n`);

  // Generate campaign configuration
  const campaignConfig = generateCampaignConfig(prospects.length);
  console.log('Campaign Configuration:');
  console.log(`  Name: ${campaignConfig.campaign_name}`);
  console.log(`  Daily limit: ${campaignConfig.sending_limits.daily_limit} emails`);
  console.log(`  Warmup: ${campaignConfig.warmup.warmup_days} days`);
  console.log(`  Domains: ${campaignConfig.sending_domains.join(', ')}`);
  console.log('');
  console.log('Expected Results:');
  console.log(`  Opens: ${campaignConfig.expected_results.expected_opens} (${(campaignConfig.expected_results.expected_open_rate * 100)}%)`);
  console.log(`  Replies: ${campaignConfig.expected_results.expected_replies} (${(campaignConfig.expected_results.expected_reply_rate * 100)}%)`);
  console.log(`  Demos: ${campaignConfig.expected_results.expected_demos} (${(campaignConfig.expected_results.expected_demo_rate * 100)}%)`);
  console.log(`  Target partners: ${campaignConfig.expected_results.target_partners}`);
  console.log('');

  // Always generate CSV
  const outputDir = path.join(process.cwd(), 'data/outreach');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate personalized email content for each prospect
  const instantlyLeads: InstantlyLead[] = prospects.map((p: any) => {
    const firstName = (p.contact_name || '').split(' ')[0] || 'there';
    return {
      email: p.contact_email,
      first_name: firstName,
      last_name: (p.contact_name || '').split(' ').slice(1).join(' '),
      company_name: p.firm_name,
      custom_variables: {
        firmName: p.firm_name,
        city: p.city || '',
        state: p.state || '',
        firstName,
      },
    };
  });

  // Generate CSV for Instantly.ai
  const csvHeaders = [
    'email', 'first_name', 'last_name', 'company_name',
    'firmName', 'city', 'state',
  ];

  const csvRows = instantlyLeads.map(lead => {
    return [
      lead.email,
      lead.first_name || '',
      lead.last_name || '',
      lead.company_name || '',
      lead.custom_variables?.firmName || '',
      lead.custom_variables?.city || '',
      lead.custom_variables?.state || '',
    ].map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',');
  });

  const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
  const csvPath = path.join(outputDir, 'instantly-campaign-leads.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf-8');
  console.log(`CSV exported: ${csvPath} (${instantlyLeads.length} leads)\n`);

  // Generate email sequence templates
  const sampleSequence = generateEmailSequence('{{firmName}}', '{{firstName}} Sample', '{{city}}');
  const templatePath = path.join(outputDir, 'email-sequence-templates.json');
  fs.writeFileSync(templatePath, JSON.stringify(sampleSequence, null, 2), 'utf-8');
  console.log(`Email templates: ${templatePath}\n`);

  if (csvOnly || !API_KEY) {
    if (!API_KEY) {
      console.log('INSTANTLY_API_KEY not set. CSV generated for manual upload.\n');
      console.log('To auto-create campaign:');
      console.log('  INSTANTLY_API_KEY=your_key npm run outreach:setup-campaign\n');
    }
    console.log('Manual upload steps:');
    console.log('  1. Go to https://app.instantly.ai');
    console.log('  2. Create new campaign: "Immigration Law Firm Partner Outreach"');
    console.log('  3. Upload CSV: data/outreach/instantly-campaign-leads.csv');
    console.log('  4. Set up 3-step email sequence (templates in email-sequence-templates.json)');
    console.log('  5. Configure: Day 0, Day 3, Day 7');
    console.log('  6. Set daily limit: 50 emails');
    console.log('  7. Enable warmup for 14 days');
    console.log('  8. Add webhook URL: https://taxbridge.app/api/outreach/webhook');
    console.log('  9. Launch campaign');
    db.close();
    return;
  }

  // Create campaign via API
  console.log('Creating campaign via Instantly.ai API...');
  try {
    const { campaign_id } = await createCampaign(campaignConfig.campaign_name, config);
    console.log(`  Campaign created: ${campaign_id}\n`);

    // Set up email sequence
    console.log('Setting up email sequence...');
    await setupEmailSequence(campaign_id, [
      {
        subject: 'Partnership opportunity: Help your H-1B clients with RSU taxes',
        body: sampleSequence[0].body,
        delay_days: 0,
      },
      {
        subject: 'Re: Partnership opportunity',
        body: sampleSequence[1].body,
        delay_days: 3,
      },
      {
        subject: '[Video] See how TaxBridge helps your H-1B clients',
        body: sampleSequence[2].body,
        delay_days: 4, // 7 days after first email (4 days after second)
      },
    ], config);
    console.log('  Email sequence configured\n');

    // Add leads
    console.log(`Adding ${instantlyLeads.length} leads...`);
    const result = await addLeadsToCampaign(campaign_id, instantlyLeads, config);
    console.log(`  Added: ${result.leads_added}, Skipped: ${result.leads_skipped}\n`);

    // Update database with campaign ID
    const updateStmt = db.prepare(`
      UPDATE enterprise_prospects
      SET instantly_campaign_id = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    for (const p of prospects) {
      updateStmt.run(campaign_id, p.id);
    }

    // Update outreach campaign record
    db.prepare(`
      UPDATE outreach_campaigns
      SET instantly_campaign_id = ?,
          total_prospects = ?,
          status = 'active',
          start_date = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE campaign_name LIKE '%Immigration Law Firm%'
    `).run(campaign_id, prospects.length);

    console.log('Campaign setup complete!');
    console.log(`\nCampaign ID: ${campaign_id}`);
    console.log('Status: Ready to launch');
    console.log('\nNext steps:');
    console.log('  1. Review campaign in Instantly.ai dashboard');
    console.log('  2. Verify sending domains are warmed up');
    console.log('  3. Set webhook URL: https://taxbridge.app/api/outreach/webhook');
    console.log('  4. Launch campaign');
  } catch (error: any) {
    console.error(`Failed to create campaign: ${error.message}`);
    console.log('\nFallback: Use the CSV for manual upload.');
  }

  db.close();
}

main().catch(console.error);
