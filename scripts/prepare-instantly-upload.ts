#!/usr/bin/env tsx
/**
 * Prepare Instantly.ai Upload CSV
 *
 * Converts firm list to Instantly.ai format with personalized email sequence
 *
 * Output columns:
 * - email (required)
 * - firstName
 * - firmName
 * - city
 * - state
 * - email1Subject, email1Body
 * - email2Subject, email2Body
 * - email3Subject, email3Body
 */

import * as fs from 'fs';
import * as path from 'path';
import { formatForInstantly } from '../lib/email/cpa-outreach-sequence';

interface FirmData {
  firm_name: string;
  contact_name: string;
  contact_email: string;
  title: string;
  city: string;
  state: string;
  website: string;
  attorney_count: number;
  email_status?: string;
  email_score?: number;
  source: string;
}

/**
 * Parse CSV file
 */
function parseCSV(filePath: string): FirmData[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const firms: FirmData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
    const cleaned = values.map(v => v.replace(/^"|"$/g, '').trim());

    if (cleaned.length < headers.length) continue;

    const firm: any = {};
    headers.forEach((header, index) => {
      firm[header] = cleaned[index] || '';
    });

    firms.push(firm as FirmData);
  }

  return firms;
}

/**
 * Convert to Instantly.ai format
 */
function convertToInstantly(firms: FirmData[]): any[] {
  return firms.map(firm =>
    formatForInstantly(
      firm.firm_name,
      firm.contact_email,
      firm.contact_name,
      firm.city,
      firm.state
    )
  );
}

/**
 * Export to CSV
 */
function exportToCSV(data: any[], outputPath: string): void {
  const headers = [
    'email',
    'firstName',
    'firmName',
    'city',
    'state',
    'email1Subject',
    'email1Body',
    'email2Subject',
    'email2Body',
    'email3Subject',
    'email3Body'
  ];

  const rows = data.map(item => {
    return headers.map(header => {
      const value = item[header] || '';
      // Escape quotes and wrap in quotes
      return `"${value.toString().replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');

  fs.writeFileSync(outputPath, csv, 'utf-8');
  console.log(`✅ Exported ${rows.length} rows to ${outputPath}`);
}

/**
 * Preview first 3 emails
 */
function previewEmails(data: any[]): void {
  console.log('\n📧 Preview of Email Sequence:\n');
  console.log('═'.repeat(80));

  const sample = data[0];

  console.log(`\n📨 EMAIL 1 (Day 0) - ${sample.email1Subject}\n`);
  console.log(sample.email1Body);
  console.log('\n' + '─'.repeat(80));

  console.log(`\n📨 EMAIL 2 (Day 3) - ${sample.email2Subject}\n`);
  console.log(sample.email2Body);
  console.log('\n' + '─'.repeat(80));

  console.log(`\n📨 EMAIL 3 (Day 7) - ${sample.email3Subject}\n`);
  console.log(sample.email3Body);
  console.log('\n' + '═'.repeat(80) + '\n');
}

// Main execution
async function main() {
  console.log('🚀 Preparing Instantly.ai Upload CSV\n');

  // Input file
  const inputPath = path.join(__dirname, '../data/outreach/immigration-firms-apollo.csv');
  const fallbackPath = path.join(__dirname, '../data/outreach/immigration-firms-target-list.csv');

  let csvPath = inputPath;
  if (!fs.existsSync(inputPath)) {
    console.log('⚠️  Apollo CSV not found, using fallback target list');
    csvPath = fallbackPath;
  }

  if (!fs.existsSync(csvPath)) {
    console.error('❌ No CSV file found. Run npm run scrape:aila-firms first.');
    process.exit(1);
  }

  console.log(`📄 Reading from: ${csvPath}\n`);

  // Parse CSV
  const firms = parseCSV(csvPath);
  console.log(`✅ Loaded ${firms.length} firms\n`);

  // Convert to Instantly format
  console.log('🔄 Converting to Instantly.ai format...');
  const instantlyData = convertToInstantly(firms);
  console.log(`✅ Converted ${instantlyData.length} contacts\n`);

  // Preview emails
  previewEmails(instantlyData);

  // Export
  const outputPath = path.join(__dirname, '../data/outreach/instantly-upload.csv');
  exportToCSV(instantlyData, outputPath);

  console.log('\n✨ Done! Next steps:\n');
  console.log('1. Review the CSV at: data/outreach/instantly-upload.csv');
  console.log('2. Log in to Instantly.ai (https://app.instantly.ai)');
  console.log('3. Create new campaign: "Immigration Law Firm Outreach - March 2026"');
  console.log('4. Upload CSV via "Import Leads"');
  console.log('5. Set email sequence delays:');
  console.log('   - Email 1: Sent immediately');
  console.log('   - Email 2: 3 days after Email 1');
  console.log('   - Email 3: 7 days after Email 1 (4 days after Email 2)');
  console.log('6. Configure sending domains (3 warmed domains):');
  console.log('   - taxbridge-partners.com');
  console.log('   - taxbridge.co');
  console.log('   - taxbridge.io');
  console.log('7. Set daily send limit: 50 emails/day (increase to 100 after 7 days)');
  console.log('8. Enable warmup mode for first 14 days');
  console.log('9. Launch campaign!');
  console.log('');
  console.log('📊 Expected Results (200 firms):');
  console.log('   - Open rate: 45% (90 opens)');
  console.log('   - Reply rate: 8% (16 replies)');
  console.log('   - Demo rate: 3% (6 demos)');
  console.log('   - Partner signups: 10 firms');
  console.log('');
}

main().catch(console.error);
