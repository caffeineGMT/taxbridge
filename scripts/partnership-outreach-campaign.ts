/**
 * Partner Outreach Campaign Script
 *
 * This script executes the partnership outreach campaign:
 * - 10 immigration lawyers
 * - 5 CPAs
 * - Personalized emails with 30% revenue share offer
 * - Automatic tracking in the database
 *
 * Usage:
 *   tsx scripts/partnership-outreach-campaign.ts
 */

import { initializeDatabase } from '@/lib/db';
import {
  createPartner,
  recordPartnerOutreach,
  PartnerInput,
} from '@/lib/db/queries/partners';
import {
  getImmigrationLawyerPartnerEmail,
  ImmigrationLawyerPartnerEmailData,
} from '@/lib/email/templates/partnership-immigration-lawyer';
import {
  getCPAPartnerEmail,
  CPAPartnerEmailData,
} from '@/lib/email/templates/partnership-cpa';

// ============================================================================
// TARGET PARTNERS DATA
// ============================================================================

// Immigration Lawyers (10 targets)
const IMMIGRATION_LAWYER_PROSPECTS: Array<
  ImmigrationLawyerPartnerEmailData & {
    phone?: string;
    location_city?: string;
    location_state?: string;
  }
> = [
  {
    lawyerName: 'Sarah Johnson',
    lawyerFirmName: 'Johnson Immigration Law',
    lawyerWebsite: 'johnsonimmigration.com',
    numberOfClients: 150,
    specialization: 'H-1B and TN visa holders at tech companies',
    phone: '(415) 555-0101',
    location_city: 'San Francisco',
    location_state: 'CA',
  },
  {
    lawyerName: 'Michael Chen',
    lawyerFirmName: 'Chen & Associates Immigration',
    lawyerWebsite: 'chenimmigration.com',
    numberOfClients: 200,
    specialization: 'Employment-based immigration and H-1B transfers',
    phone: '(206) 555-0102',
    location_city: 'Seattle',
    location_state: 'WA',
  },
  {
    lawyerName: 'Emily Rodriguez',
    lawyerFirmName: 'Rodriguez Immigration Services',
    lawyerWebsite: 'rodriguezimmigration.com',
    numberOfClients: 120,
    specialization: 'TN visa and NAFTA professional immigration',
    phone: '(512) 555-0103',
    location_city: 'Austin',
    location_state: 'TX',
  },
  {
    lawyerName: 'David Patel',
    lawyerFirmName: 'Patel Global Immigration',
    lawyerWebsite: 'patelglobal.com',
    numberOfClients: 300,
    specialization: 'H-1B, L-1, and O-1 visa for tech professionals',
    phone: '(408) 555-0104',
    location_city: 'San Jose',
    location_state: 'CA',
  },
  {
    lawyerName: 'Jennifer Lee',
    lawyerFirmName: 'Lee Immigration Law Group',
    lawyerWebsite: 'leeimmigrationlaw.com',
    numberOfClients: 180,
    specialization: 'Canadian professionals on TN and H-1B visas',
    phone: '(617) 555-0105',
    location_city: 'Boston',
    location_state: 'MA',
  },
  {
    lawyerName: 'Robert Taylor',
    lawyerFirmName: 'Taylor & Partners Immigration',
    lawyerWebsite: 'taylorimmigration.com',
    numberOfClients: 250,
    specialization: 'Corporate immigration and equity compensation',
    phone: '(212) 555-0106',
    location_city: 'New York',
    location_state: 'NY',
  },
  {
    lawyerName: 'Lisa Nguyen',
    lawyerFirmName: 'Nguyen Immigration Attorneys',
    lawyerWebsite: 'nguyenimmigration.com',
    numberOfClients: 140,
    specialization: 'H-1B visa holders with stock options',
    phone: '(650) 555-0107',
    location_city: 'Palo Alto',
    location_state: 'CA',
  },
  {
    lawyerName: 'James Wilson',
    lawyerFirmName: 'Wilson Global Visa Services',
    lawyerWebsite: 'wilsonglobalvisa.com',
    numberOfClients: 160,
    specialization: 'TN visa and cross-border employment',
    phone: '(604) 555-0108',
    location_city: 'Vancouver',
    location_state: 'BC',
  },
  {
    lawyerName: 'Maria Garcia',
    lawyerFirmName: 'Garcia Immigration Law',
    lawyerWebsite: 'garciaimmigrationlaw.com',
    numberOfClients: 190,
    specialization: 'Employment visas for FAANG engineers',
    phone: '(425) 555-0109',
    location_city: 'Bellevue',
    location_state: 'WA',
  },
  {
    lawyerName: 'Daniel Kim',
    lawyerFirmName: 'Kim & Associates Immigration',
    lawyerWebsite: 'kimimmigration.com',
    numberOfClients: 210,
    specialization: 'H-1B and green card for tech workers',
    phone: '(408) 555-0110',
    location_city: 'Santa Clara',
    location_state: 'CA',
  },
];

// CPAs (5 targets)
const CPA_PROSPECTS: Array<
  CPAPartnerEmailData & {
    phone?: string;
    location_city?: string;
    location_state?: string;
  }
> = [
  {
    cpaName: 'Alexandra Thompson',
    cpaFirmName: 'Thompson Cross-Border Tax',
    cpaWebsite: 'thompsoncrossborder.com',
    numberOfClients: 80,
    specialization: 'US-Canada cross-border tax compliance',
    phone: '(415) 555-0201',
    location_city: 'San Francisco',
    location_state: 'CA',
  },
  {
    cpaName: 'Christopher Brown',
    cpaFirmName: 'Brown International Tax Services',
    cpaWebsite: 'browninternationaltax.com',
    numberOfClients: 60,
    specialization: 'RSU taxation and foreign tax credits',
    phone: '(206) 555-0202',
    location_city: 'Seattle',
    location_state: 'WA',
  },
  {
    cpaName: 'Michelle Anderson',
    cpaFirmName: 'Anderson Tax Advisory',
    cpaWebsite: 'andersontaxadvisory.com',
    numberOfClients: 100,
    specialization: 'Expatriate tax and equity compensation',
    phone: '(212) 555-0203',
    location_city: 'New York',
    location_state: 'NY',
  },
  {
    cpaName: 'Kevin Martinez',
    cpaFirmName: 'Martinez Global Tax',
    cpaWebsite: 'martinezglobaltax.com',
    numberOfClients: 50,
    specialization: 'Cross-border tax for tech professionals',
    phone: '(512) 555-0204',
    location_city: 'Austin',
    location_state: 'TX',
  },
  {
    cpaName: 'Rachel Cohen',
    cpaFirmName: 'Cohen International CPA',
    cpaWebsite: 'coheninternationalcpa.com',
    numberOfClients: 70,
    specialization: 'US-Canada tax treaty and RSU taxation',
    phone: '(617) 555-0205',
    location_city: 'Boston',
    location_state: 'MA',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateReferralCode(
  partnerType: 'immigration_lawyer' | 'cpa',
  firmName: string
): string {
  const prefix = partnerType === 'immigration_lawyer' ? 'LAW' : 'CPA';
  const firmSlug = firmName
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 6)
    .toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${prefix}_${firmSlug}_${randomSuffix}`;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 Starting Partnership Outreach Campaign...\n');

  // Initialize database
  await initializeDatabase();

  let totalCreated = 0;
  let totalEmails = 0;

  // ===== IMMIGRATION LAWYERS =====
  console.log('📧 Processing Immigration Lawyer Outreach (10 targets)...\n');

  for (const lawyer of IMMIGRATION_LAWYER_PROSPECTS) {
    try {
      // Generate unique referral code
      const referralCode = generateReferralCode(
        'immigration_lawyer',
        lawyer.lawyerFirmName
      );

      // Create partner in database
      const partnerInput: PartnerInput = {
        partner_type: 'immigration_lawyer',
        name: lawyer.lawyerName,
        firm_name: lawyer.lawyerFirmName,
        email: `${lawyer.lawyerName.toLowerCase().replace(' ', '.')}@${lawyer.lawyerWebsite}`,
        phone: lawyer.phone,
        website: lawyer.lawyerWebsite
          ? `https://${lawyer.lawyerWebsite}`
          : undefined,
        specialization: lawyer.specialization,
        estimated_client_count: lawyer.numberOfClients,
        location_city: lawyer.location_city,
        location_state: lawyer.location_state,
        revenue_share_percentage: 30.0,
        referral_code: referralCode,
        notes: 'Initial outreach campaign - March 2026',
      };

      const partnerId = await createPartner(partnerInput);
      totalCreated++;

      console.log(
        `✅ Created partner: ${lawyer.lawyerName} (${lawyer.lawyerFirmName}) - ID: ${partnerId}`
      );

      // Generate personalized email
      const emailContent = getImmigrationLawyerPartnerEmail(lawyer);

      // Record outreach email
      const outreachId = await recordPartnerOutreach({
        partner_id: partnerId,
        email_subject: emailContent.subject,
        email_body: emailContent.body,
        notes: 'Initial outreach email',
      });
      totalEmails++;

      console.log(`  📨 Outreach email recorded - ID: ${outreachId}`);
      console.log(`  🔗 Referral code: ${referralCode}\n`);

      // Output email for manual sending (you can integrate with SendGrid/Postmark later)
      console.log(
        `  EMAIL PREVIEW:\n  To: ${partnerInput.email}\n  Subject: ${emailContent.subject}\n`
      );
    } catch (error) {
      console.error(
        `❌ Failed to process ${lawyer.lawyerName}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  // ===== CPAs =====
  console.log('\n📧 Processing CPA Outreach (5 targets)...\n');

  for (const cpa of CPA_PROSPECTS) {
    try {
      // Generate unique referral code
      const referralCode = generateReferralCode('cpa', cpa.cpaFirmName);

      // Create partner in database
      const partnerInput: PartnerInput = {
        partner_type: 'cpa',
        name: cpa.cpaName,
        firm_name: cpa.cpaFirmName,
        email: `${cpa.cpaName.toLowerCase().replace(' ', '.')}@${cpa.cpaWebsite}`,
        phone: cpa.phone,
        website: cpa.cpaWebsite ? `https://${cpa.cpaWebsite}` : undefined,
        specialization: cpa.specialization,
        estimated_client_count: cpa.numberOfClients,
        location_city: cpa.location_city,
        location_state: cpa.location_state,
        revenue_share_percentage: 30.0,
        referral_code: referralCode,
        notes: 'Initial outreach campaign - March 2026',
      };

      const partnerId = await createPartner(partnerInput);
      totalCreated++;

      console.log(
        `✅ Created partner: ${cpa.cpaName} (${cpa.cpaFirmName}) - ID: ${partnerId}`
      );

      // Generate personalized email
      const emailContent = getCPAPartnerEmail(cpa);

      // Record outreach email
      const outreachId = await recordPartnerOutreach({
        partner_id: partnerId,
        email_subject: emailContent.subject,
        email_body: emailContent.body,
        notes: 'Initial outreach email',
      });
      totalEmails++;

      console.log(`  📨 Outreach email recorded - ID: ${outreachId}`);
      console.log(`  🔗 Referral code: ${referralCode}\n`);

      // Output email for manual sending
      console.log(
        `  EMAIL PREVIEW:\n  To: ${partnerInput.email}\n  Subject: ${emailContent.subject}\n`
      );
    } catch (error) {
      console.error(
        `❌ Failed to process ${cpa.cpaName}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  // ===== SUMMARY =====
  console.log('\n' + '='.repeat(80));
  console.log('📊 CAMPAIGN SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Total partners created: ${totalCreated}/15`);
  console.log(`📧 Total outreach emails recorded: ${totalEmails}/15`);
  console.log(`💰 Revenue share offered: 30%`);
  console.log(
    `🎯 Target: ${IMMIGRATION_LAWYER_PROSPECTS.reduce((sum, l) => sum + (l.numberOfClients || 0), 0) + CPA_PROSPECTS.reduce((sum, c) => sum + (c.numberOfClients || 0), 0)} potential referrals`
  );
  console.log('\n📬 NEXT STEPS:');
  console.log(
    '  1. Review generated emails above and copy to your email client'
  );
  console.log('  2. Send personalized emails to each partner');
  console.log(
    '  3. Track responses via API: PATCH /api/partners/[id]/outreach'
  );
  console.log('  4. Schedule intro calls via API: PATCH /api/partners/[id]');
  console.log('  5. Monitor metrics at /dashboard/partnerships\n');
}

// Run the script
main()
  .then(() => {
    console.log('✨ Partnership outreach campaign completed!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Campaign failed:', error);
    process.exit(1);
  });
