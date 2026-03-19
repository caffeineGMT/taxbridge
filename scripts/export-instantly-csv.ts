/**
 * Export enterprise prospects to CSV for Instantly.ai upload
 *
 * Instantly.ai requires these columns:
 * - email, firstName, lastName, companyName, website, linkedin
 *
 * Custom fields (for personalization):
 * - firmName, city, state, attorneyCount
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'lib/db/taxbridge.db');

interface ProspectRow {
  firm_name: string;
  contact_email: string;
  contact_name: string;
  city: string;
  state: string;
  website: string;
  attorney_count: number;
}

function exportToInstantlyCSV() {
  console.log('📊 Exporting prospects to Instantly.ai CSV format...\n');

  const db = new Database(dbPath);

  // Fetch all immigration firm prospects
  const prospects = db.prepare(`
    SELECT
      firm_name,
      contact_email,
      contact_name,
      city,
      state,
      website,
      attorney_count
    FROM enterprise_prospects
    WHERE status = 'target'
    ORDER BY attorney_count DESC
  `).all() as ProspectRow[];

  db.close();

  console.log(`Found ${prospects.length} prospects to export\n`);

  // Build CSV
  const headers = [
    'email',
    'firstName',
    'lastName',
    'companyName',
    'website',
    'firmName',
    'city',
    'state',
    'attorneyCount',
  ].join(',');

  const rows = prospects.map((p) => {
    // Parse first name and last name
    const nameParts = (p.contact_name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return [
      p.contact_email,
      firstName,
      lastName,
      p.firm_name,
      p.website || '',
      p.firm_name,
      p.city || '',
      p.state || '',
      p.attorney_count || 0,
    ]
      .map((field) => `"${field}"`) // Quote all fields
      .join(',');
  });

  const csv = [headers, ...rows].join('\n');

  // Write to file
  const outputPath = path.join(process.cwd(), 'data/instantly-upload.csv');
  fs.writeFileSync(outputPath, csv, 'utf-8');

  console.log(`✅ CSV exported to: ${outputPath}\n`);

  // Print preview
  console.log('📋 Preview (first 3 rows):');
  console.log('═══════════════════════════════════════════════\n');
  console.log(headers);
  rows.slice(0, 3).forEach((row) => console.log(row));
  console.log('\n═══════════════════════════════════════════════');

  // Print summary
  console.log('\n📊 Export Summary:');
  console.log('═══════════════════════════════════════════════');
  console.log(`Total prospects: ${prospects.length}`);
  console.log(`Total addressable attorneys: ${prospects.reduce((sum, p) => sum + (p.attorney_count || 0), 0)}`);
  console.log('═══════════════════════════════════════════════\n');

  // Instructions
  console.log('🚀 Next Steps:');
  console.log('═══════════════════════════════════════════════');
  console.log('1. Log in to Instantly.ai (https://app.instantly.ai)');
  console.log('2. Go to Campaigns → Create New Campaign');
  console.log('3. Click "Import Leads" → Upload CSV');
  console.log(`4. Upload: ${outputPath}`);
  console.log('5. Map columns: email → Email, firstName → First Name, etc.');
  console.log('6. Create email sequence (5 emails over 12 days)');
  console.log('7. Use variables: {{firmName}}, {{city}}, {{attorneyCount}}');
  console.log('8. Set warmup period: 3-5 days before sending');
  console.log('9. Daily send limit: 10 emails/day (avoid spam flags)');
  console.log('10. Track opens/clicks in Instantly.ai dashboard');
  console.log('═══════════════════════════════════════════════\n');
}

// Run export
exportToInstantlyCSV();
