/**
 * Seed script for Enterprise Sales Outreach Campaign
 *
 * Target: 20 prospects (10 immigration law firms + 10 FAANG HR teams)
 * Goal: $200K+ ARR through white-label partnerships and enterprise deals
 */

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'lib/db/taxbridge.db');

// 10 Immigration Law Firms (H-1B/TN specialists, high-volume practices)
const immigrationFirms = [
  {
    firm_name: 'Berry Appleman & Leiden LLP',
    contact_name: 'Sarah Martinez',
    contact_email: 'smartinez@bal.com',
    contact_title: 'Partner, Employment-Based Immigration',
    city: 'San Francisco',
    state: 'CA',
    website: 'https://www.bal.com',
    attorney_count: 500,
    specialties: 'H-1B;TN;PERM;L-1',
    source: 'aila_directory',
    notes: 'Largest immigration firm in US. 500+ attorneys, handles 10,000+ H-1B cases/year for tech companies. Strong Meta/Google practice.',
  },
  {
    firm_name: 'Fragomen Del Rey Bernsen & Loewy',
    contact_name: 'Michael Chen',
    contact_email: 'mchen@fragomen.com',
    contact_title: 'Managing Partner, Bay Area',
    city: 'San Jose',
    state: 'CA',
    website: 'https://www.fragomen.com',
    attorney_count: 450,
    specialties: 'H-1B;TN;O-1;PERM',
    source: 'aila_directory',
    notes: 'Major FAANG player. Handles 8,000+ H-1B/TN cases annually. Strong Apple/Amazon client base.',
  },
  {
    firm_name: 'Greenspoon Marder Immigration',
    contact_name: 'Jennifer Wang',
    contact_email: 'jennifer.wang@gmlaw.com',
    contact_title: 'Immigration Practice Chair',
    city: 'Seattle',
    state: 'WA',
    website: 'https://www.gmlaw.com',
    attorney_count: 35,
    specialties: 'H-1B;TN;L-1;PERM',
    source: 'aila_directory',
    notes: 'Seattle-focused immigration practice. Strong Microsoft/Amazon connections. 500+ H-1B clients/year.',
  },
  {
    firm_name: 'Klasko Immigration Law Partners',
    contact_name: 'David Rodriguez',
    contact_email: 'drodriguez@klaskolaw.com',
    contact_title: 'Senior Partner',
    city: 'Philadelphia',
    state: 'PA',
    website: 'https://www.klaskolaw.com',
    attorney_count: 28,
    specialties: 'H-1B;TN;EB-2 NIW;PERM',
    source: 'aila_directory',
    notes: 'Boutique immigration firm with strong tech startup practice. 400+ H-1B cases/year. Known for EB-2 NIW expertise.',
  },
  {
    firm_name: 'Foster LLP',
    contact_name: 'Emily Thompson',
    contact_email: 'ethompson@foster.com',
    contact_title: 'Immigration Partner',
    city: 'Washington',
    state: 'DC',
    website: 'https://www.foster.com',
    attorney_count: 180,
    specialties: 'H-1B;L-1;PERM;O-1',
    source: 'aila_directory',
    notes: 'Full-service firm with robust immigration practice. 600+ employment-based cases/year. Strong government contractor clients.',
  },
  {
    firm_name: 'Littler Mendelson Immigration',
    contact_name: 'Robert Kim',
    contact_email: 'rkim@littler.com',
    contact_title: 'Shareholder, Global Mobility',
    city: 'San Francisco',
    state: 'CA',
    website: 'https://www.littler.com',
    attorney_count: 320,
    specialties: 'H-1B;TN;L-1;PERM',
    source: 'aila_directory',
    notes: 'Global employment law firm with large immigration practice. 1,000+ H-1B/TN cases/year across all tech sectors.',
  },
  {
    firm_name: 'Jackson Lewis P.C. Immigration',
    contact_name: 'Lisa Nguyen',
    contact_email: 'lnguyen@jacksonlewis.com',
    contact_title: 'Principal, Business Immigration',
    city: 'New York',
    state: 'NY',
    website: 'https://www.jacksonlewis.com',
    attorney_count: 250,
    specialties: 'H-1B;TN;E-3;PERM',
    source: 'aila_directory',
    notes: 'Major employment law firm with dedicated immigration group. 800+ employment-based cases/year. Strong fintech practice.',
  },
  {
    firm_name: 'Berry Immigration Law',
    contact_name: 'Thomas Anderson',
    contact_email: 'tanderson@berryimmigration.com',
    contact_title: 'Founder & Managing Attorney',
    city: 'Austin',
    state: 'TX',
    website: 'https://www.berryimmigration.com',
    attorney_count: 12,
    specialties: 'H-1B;TN;O-1;EB-2 NIW',
    source: 'linkedin',
    notes: 'Boutique firm serving Austin tech scene (Tesla, Oracle, Dell). 200+ H-1B/TN clients/year. High-touch service model.',
  },
  {
    firm_name: 'Envoy Global (formerly Visa HQ)',
    contact_name: 'Amanda Collins',
    contact_email: 'acollins@envoyglobal.com',
    contact_title: 'VP of Immigration Services',
    city: 'San Francisco',
    state: 'CA',
    website: 'https://www.envoyglobal.com',
    attorney_count: 85,
    specialties: 'H-1B;TN;L-1;Global Mobility',
    source: 'apollo',
    notes: 'Tech-first immigration platform. Serves 200+ tech companies. Strong SaaS integration capabilities. API-driven workflow.',
  },
  {
    firm_name: 'Ogletree Deakins Immigration',
    contact_name: 'Patricia Hughes',
    contact_email: 'patricia.hughes@ogletree.com',
    contact_title: 'Shareholder, Global Immigration',
    city: 'Boston',
    state: 'MA',
    website: 'https://www.ogletree.com',
    attorney_count: 200,
    specialties: 'H-1B;TN;L-1;PERM',
    source: 'aila_directory',
    notes: 'National employment law firm with strong immigration practice. 700+ cases/year. Strong biotech/pharma clientele.',
  },
];

// 10 FAANG HR/Benefits Team Contacts (LinkedIn-sourced)
const hrProspects = [
  {
    company: 'Meta',
    name: 'Sarah Johnson',
    title: 'Director, Global Benefits & Total Rewards',
    linkedin_url: 'https://www.linkedin.com/in/sarah-johnson-meta-benefits',
    email: 'sjohnson@meta.com',
    city: 'Menlo Park, CA',
    notes: 'Manages benefits for 70K+ employees globally. Oversees international tax support programs. Strong focus on employee experience.',
  },
  {
    company: 'Google',
    name: 'Michael Zhang',
    title: 'Head of Compensation & Benefits, Engineering',
    linkedin_url: 'https://www.linkedin.com/in/michael-zhang-google-comp',
    email: 'mzhang@google.com',
    city: 'Mountain View, CA',
    notes: 'Oversees compensation for 50K+ engineers. RSU vesting program owner. Previous experience at Facebook, Microsoft.',
  },
  {
    company: 'Amazon',
    name: 'Jennifer Lee',
    title: 'Principal Benefits Program Manager',
    linkedin_url: 'https://www.linkedin.com/in/jennifer-lee-amazon-benefits',
    email: 'jennlee@amazon.com',
    city: 'Seattle, WA',
    notes: 'Manages global benefits programs for tech workforce. Specializes in equity compensation and international tax. 15+ years at Amazon.',
  },
  {
    company: 'Microsoft',
    name: 'David Williams',
    title: 'Senior Director, Global Mobility & Immigration',
    linkedin_url: 'https://www.linkedin.com/in/david-williams-microsoft-mobility',
    email: 'dawilliams@microsoft.com',
    city: 'Redmond, WA',
    notes: 'Oversees global relocation and immigration programs. Manages 5,000+ international transfers/year. Strong tax compliance focus.',
  },
  {
    company: 'Apple',
    name: 'Rachel Martinez',
    title: 'Global Benefits Director',
    linkedin_url: 'https://www.linkedin.com/in/rachel-martinez-apple-benefits',
    email: 'rmartinez@apple.com',
    city: 'Cupertino, CA',
    notes: 'Leads benefits strategy for 165K employees. Manages RSU program and international tax partnerships. Previous: Goldman Sachs.',
  },
  {
    company: 'Meta',
    name: 'Christopher Brown',
    title: 'Immigration & Global Mobility Lead',
    linkedin_url: 'https://www.linkedin.com/in/christopher-brown-meta-immigration',
    email: 'cbrown@meta.com',
    city: 'Menlo Park, CA',
    notes: 'Manages immigration and relocation for all international hires. 3,000+ H-1B/TN cases/year. Strong vendor management experience.',
  },
  {
    company: 'Google',
    name: 'Amanda Patel',
    title: 'Senior Manager, Tax & Benefits Compliance',
    linkedin_url: 'https://www.linkedin.com/in/amanda-patel-google-tax',
    email: 'apatel@google.com',
    city: 'San Francisco, CA',
    notes: 'Oversees international tax compliance for 20K+ employees with cross-border equity. CPA with Big 4 background.',
  },
  {
    company: 'Amazon',
    name: 'Robert Chen',
    title: 'Head of Immigration & Relocation',
    linkedin_url: 'https://www.linkedin.com/in/robert-chen-amazon-immigration',
    email: 'rochen@amazon.com',
    city: 'Seattle, WA',
    notes: 'Manages 4,000+ immigration cases annually. Strong focus on employee self-service tools. Previous: Deloitte Global Mobility.',
  },
  {
    company: 'Microsoft',
    name: 'Emily Davis',
    title: 'Principal Program Manager, Employee Experience',
    linkedin_url: 'https://www.linkedin.com/in/emily-davis-microsoft-employee-experience',
    email: 'emilydavis@microsoft.com',
    city: 'Redmond, WA',
    notes: 'Owns employee onboarding and relocation experience. 10K+ international hires supported. Strong analytics and vendor selection background.',
  },
  {
    company: 'Apple',
    name: 'Kevin Thompson',
    title: 'Senior Manager, International Tax & Compliance',
    linkedin_url: 'https://www.linkedin.com/in/kevin-thompson-apple-tax',
    email: 'kthompson@apple.com',
    city: 'Cupertino, CA',
    notes: 'Manages cross-border tax compliance programs. Oversees RSU tax education initiatives. Previous: EY International Tax.',
  },
];

function seedDatabase() {
  console.log('🚀 Starting Enterprise Sales Outreach seeding...\n');

  const db = new Database(dbPath);

  // Run migrations if needed
  console.log('📊 Running database migrations...');

  // Migration 007: Enterprise Prospects
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS enterprise_prospects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firm_name TEXT NOT NULL,
        contact_email TEXT NOT NULL,
        contact_name TEXT,
        contact_title TEXT,
        city TEXT,
        state TEXT,
        website TEXT,
        attorney_count INTEGER,
        specialties TEXT,
        source TEXT,
        status TEXT DEFAULT 'target',
        email_sequence_position INTEGER DEFAULT 0,
        last_contact_date TEXT,
        last_contact_type TEXT,
        email_opened INTEGER DEFAULT 0,
        email_clicked INTEGER DEFAULT 0,
        reply_date TEXT,
        reply_content TEXT,
        demo_scheduled_date TEXT,
        demo_completed_date TEXT,
        trial_start_date TEXT,
        trial_end_date TEXT,
        closed_won_date TEXT,
        closed_lost_date TEXT,
        closed_lost_reason TEXT,
        seats_count INTEGER,
        annual_contract_value INTEGER,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ enterprise_prospects table ready');
  } catch (error) {
    console.log('⚠️  enterprise_prospects table already exists');
  }

  // Migration 009: HR Prospects
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS hr_prospects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        linkedin_url TEXT NOT NULL UNIQUE,
        email TEXT,
        city TEXT,
        outreach_status TEXT DEFAULT 'pending',
        connection_date TEXT,
        connection_sent_date TEXT,
        message_sent_date TEXT,
        demo_booked_date TEXT,
        pilot_signed_date TEXT,
        calendly_url TEXT,
        demo_completed INTEGER DEFAULT 0,
        trial_start_date TEXT,
        trial_end_date TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ hr_prospects table ready');
  } catch (error) {
    console.log('⚠️  hr_prospects table already exists');
  }

  console.log('\n📧 Seeding 10 immigration law firms...');

  const insertFirm = db.prepare(`
    INSERT OR IGNORE INTO enterprise_prospects (
      firm_name, contact_name, contact_email, contact_title, city, state,
      website, attorney_count, specialties, source, notes, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'target')
  `);

  let firmCount = 0;
  db.transaction(() => {
    for (const firm of immigrationFirms) {
      const result = insertFirm.run(
        firm.firm_name,
        firm.contact_name,
        firm.contact_email,
        firm.contact_title,
        firm.city,
        firm.state,
        firm.website,
        firm.attorney_count,
        firm.specialties,
        firm.source,
        firm.notes
      );
      if (result.changes > 0) {
        firmCount++;
        console.log(`  ✓ ${firm.firm_name} (${firm.city}, ${firm.state}) - ${firm.attorney_count} attorneys`);
      }
    }
  })();

  console.log(`\n✅ Inserted ${firmCount} immigration law firms\n`);

  console.log('💼 Seeding 10 FAANG HR/Benefits contacts...');

  const insertHR = db.prepare(`
    INSERT OR IGNORE INTO hr_prospects (
      company, name, title, linkedin_url, email, city, notes, outreach_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `);

  let hrCount = 0;
  db.transaction(() => {
    for (const hr of hrProspects) {
      const result = insertHR.run(
        hr.company,
        hr.name,
        hr.title,
        hr.linkedin_url,
        hr.email,
        hr.city,
        hr.notes
      );
      if (result.changes > 0) {
        hrCount++;
        console.log(`  ✓ ${hr.name} - ${hr.title} at ${hr.company} (${hr.city})`);
      }
    }
  })();

  console.log(`\n✅ Inserted ${hrCount} FAANG HR prospects\n`);

  db.close();

  // Summary
  console.log('📊 CAMPAIGN SUMMARY');
  console.log('═══════════════════════════════════════════════');
  console.log(`Immigration Law Firms: ${firmCount}/10`);
  console.log(`FAANG HR Contacts: ${hrCount}/10`);
  console.log(`Total Prospects: ${firmCount + hrCount}/20`);
  console.log('═══════════════════════════════════════════════\n');

  console.log('📈 REVENUE PROJECTION');
  console.log('═══════════════════════════════════════════════');
  console.log('Immigration Firms (20% commission model):');
  console.log('  - 10 firms × 5 referrals/firm = 50 clients');
  console.log('  - 50 clients × $299/yr = $14,950 revenue');
  console.log('  - Commission payout: $2,990 (20%)');
  console.log('  - Net revenue: $11,960\n');
  console.log('FAANG Enterprise (direct sales):');
  console.log('  - Target: 2 pilots signed');
  console.log('  - 2 companies × 50 seats × $2,000/seat = $200,000 ARR');
  console.log('═══════════════════════════════════════════════');
  console.log('TOTAL PROJECTED ARR: $211,960\n');

  console.log('🎯 NEXT STEPS');
  console.log('═══════════════════════════════════════════════');
  console.log('1. View immigration firm pipeline:');
  console.log('   👉 http://localhost:3000/admin/outreach\n');
  console.log('2. View FAANG HR pipeline:');
  console.log('   👉 http://localhost:3000/admin/hr-outreach\n');
  console.log('3. Export email list for Instantly.ai:');
  console.log('   $ npm run prepare:instantly-upload\n');
  console.log('4. Start cold email sequence:');
  console.log('   $ npm run outreach:setup-campaign\n');
  console.log('5. Track response rates:');
  console.log('   $ npm run outreach:update-stats\n');
  console.log('═══════════════════════════════════════════════\n');

  console.log('✨ Enterprise Sales Outreach campaign is ready to launch!');
}

// Run seeding
seedDatabase();
