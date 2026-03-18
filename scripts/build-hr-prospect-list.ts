#!/usr/bin/env tsx
/**
 * Build HR Prospect List for LinkedIn Outreach
 *
 * Target: 50 HR/Benefits/Compensation leads from 10 tech companies (5 each)
 * Companies: Meta, Google, Amazon, Microsoft, Apple, Netflix, Salesforce, Adobe, Uber, Airbnb
 * Data sources: LinkedIn Sales Navigator, Apollo.io API, RocketReach API
 */

import { bulkCreateHRProspects } from '../lib/db/queries/hr-prospects';

// Sample HR prospects - In production, this would come from:
// 1. LinkedIn Sales Navigator export (manual CSV download)
// 2. Apollo.io API (5000 free credits/month)
// 3. RocketReach API ($49/month for emails)
const HR_PROSPECTS = [
  // Meta (5 contacts)
  {
    company: 'Meta',
    name: 'Jennifer Martinez',
    title: 'Senior Benefits Manager',
    linkedin_url: 'https://www.linkedin.com/in/jennifer-martinez-benefits',
    email: 'jmartinez@meta.com',
    city: 'Menlo Park, CA'
  },
  {
    company: 'Meta',
    name: 'David Chen',
    title: 'Global Compensation Lead',
    linkedin_url: 'https://www.linkedin.com/in/david-chen-compensation',
    email: 'dchen@meta.com',
    city: 'Menlo Park, CA'
  },
  {
    company: 'Meta',
    name: 'Sarah Thompson',
    title: 'Director of HR Operations',
    linkedin_url: 'https://www.linkedin.com/in/sarah-thompson-hr',
    city: 'Menlo Park, CA'
  },
  {
    company: 'Meta',
    name: 'Michael Park',
    title: 'Equity Compensation Manager',
    linkedin_url: 'https://www.linkedin.com/in/michael-park-equity',
    city: 'Seattle, WA'
  },
  {
    company: 'Meta',
    name: 'Lisa Wang',
    title: 'Total Rewards Program Manager',
    linkedin_url: 'https://www.linkedin.com/in/lisa-wang-rewards',
    city: 'New York, NY'
  },

  // Google (5 contacts)
  {
    company: 'Google',
    name: 'Robert Anderson',
    title: 'Benefits Strategy Lead',
    linkedin_url: 'https://www.linkedin.com/in/robert-anderson-benefits',
    email: 'randerson@google.com',
    city: 'Mountain View, CA'
  },
  {
    company: 'Google',
    name: 'Emily Zhang',
    title: 'Senior Compensation Analyst',
    linkedin_url: 'https://www.linkedin.com/in/emily-zhang-comp',
    city: 'Mountain View, CA'
  },
  {
    company: 'Google',
    name: 'James Wilson',
    title: 'Director of Global Benefits',
    linkedin_url: 'https://www.linkedin.com/in/james-wilson-benefits',
    email: 'jwilson@google.com',
    city: 'Sunnyvale, CA'
  },
  {
    company: 'Google',
    name: 'Amanda Rodriguez',
    title: 'HR Business Partner - Engineering',
    linkedin_url: 'https://www.linkedin.com/in/amanda-rodriguez-hr',
    city: 'Seattle, WA'
  },
  {
    company: 'Google',
    name: 'Kevin Patel',
    title: 'Equity Programs Manager',
    linkedin_url: 'https://www.linkedin.com/in/kevin-patel-equity',
    city: 'New York, NY'
  },

  // Amazon (5 contacts)
  {
    company: 'Amazon',
    name: 'Michelle Lee',
    title: 'Senior Manager, Total Rewards',
    linkedin_url: 'https://www.linkedin.com/in/michelle-lee-rewards',
    email: 'michlee@amazon.com',
    city: 'Seattle, WA'
  },
  {
    company: 'Amazon',
    name: 'Brian Foster',
    title: 'Global Benefits Director',
    linkedin_url: 'https://www.linkedin.com/in/brian-foster-benefits',
    city: 'Seattle, WA'
  },
  {
    company: 'Amazon',
    name: 'Diana Nguyen',
    title: 'Compensation and Benefits Manager',
    linkedin_url: 'https://www.linkedin.com/in/diana-nguyen-comp',
    email: 'dnguyen@amazon.com',
    city: 'Seattle, WA'
  },
  {
    company: 'Amazon',
    name: 'Christopher Brown',
    title: 'HR Manager - Tech Org',
    linkedin_url: 'https://www.linkedin.com/in/christopher-brown-hr',
    city: 'San Francisco, CA'
  },
  {
    company: 'Amazon',
    name: 'Rachel Kim',
    title: 'Senior Benefits Program Manager',
    linkedin_url: 'https://www.linkedin.com/in/rachel-kim-benefits',
    city: 'New York, NY'
  },

  // Microsoft (5 contacts)
  {
    company: 'Microsoft',
    name: 'Thomas Johnson',
    title: 'Director of Compensation',
    linkedin_url: 'https://www.linkedin.com/in/thomas-johnson-comp',
    email: 'tjohnson@microsoft.com',
    city: 'Redmond, WA'
  },
  {
    company: 'Microsoft',
    name: 'Angela Martinez',
    title: 'Senior Benefits Specialist',
    linkedin_url: 'https://www.linkedin.com/in/angela-martinez-benefits',
    city: 'Redmond, WA'
  },
  {
    company: 'Microsoft',
    name: 'Daniel White',
    title: 'Total Rewards Lead',
    linkedin_url: 'https://www.linkedin.com/in/daniel-white-rewards',
    email: 'dwhite@microsoft.com',
    city: 'Seattle, WA'
  },
  {
    company: 'Microsoft',
    name: 'Jessica Liu',
    title: 'HR Business Partner - Cloud',
    linkedin_url: 'https://www.linkedin.com/in/jessica-liu-hr',
    city: 'Bellevue, WA'
  },
  {
    company: 'Microsoft',
    name: 'Steven Garcia',
    title: 'Equity Compensation Specialist',
    linkedin_url: 'https://www.linkedin.com/in/steven-garcia-equity',
    city: 'San Francisco, CA'
  },

  // Apple (5 contacts)
  {
    company: 'Apple',
    name: 'Patricia Davis',
    title: 'Senior Manager, Benefits',
    linkedin_url: 'https://www.linkedin.com/in/patricia-davis-benefits',
    email: 'pdavis@apple.com',
    city: 'Cupertino, CA'
  },
  {
    company: 'Apple',
    name: 'Richard Taylor',
    title: 'Compensation Programs Manager',
    linkedin_url: 'https://www.linkedin.com/in/richard-taylor-comp',
    city: 'Cupertino, CA'
  },
  {
    company: 'Apple',
    name: 'Karen Jackson',
    title: 'Director of Total Rewards',
    linkedin_url: 'https://www.linkedin.com/in/karen-jackson-rewards',
    email: 'kjackson@apple.com',
    city: 'Cupertino, CA'
  },
  {
    company: 'Apple',
    name: 'Andrew Sharma',
    title: 'HR Manager - Hardware Engineering',
    linkedin_url: 'https://www.linkedin.com/in/andrew-sharma-hr',
    city: 'Cupertino, CA'
  },
  {
    company: 'Apple',
    name: 'Nicole Anderson',
    title: 'Benefits and Wellness Manager',
    linkedin_url: 'https://www.linkedin.com/in/nicole-anderson-benefits',
    city: 'Austin, TX'
  },

  // Netflix (5 contacts)
  {
    company: 'Netflix',
    name: 'Gregory Moore',
    title: 'Director of Compensation',
    linkedin_url: 'https://www.linkedin.com/in/gregory-moore-comp',
    email: 'gmoore@netflix.com',
    city: 'Los Gatos, CA'
  },
  {
    company: 'Netflix',
    name: 'Laura Williams',
    title: 'Senior HR Business Partner',
    linkedin_url: 'https://www.linkedin.com/in/laura-williams-hr',
    city: 'Los Gatos, CA'
  },
  {
    company: 'Netflix',
    name: 'Matthew Jones',
    title: 'Total Rewards Manager',
    linkedin_url: 'https://www.linkedin.com/in/matthew-jones-rewards',
    email: 'mjones@netflix.com',
    city: 'Los Angeles, CA'
  },
  {
    company: 'Netflix',
    name: 'Olivia Harris',
    title: 'Benefits Program Lead',
    linkedin_url: 'https://www.linkedin.com/in/olivia-harris-benefits',
    city: 'Los Gatos, CA'
  },
  {
    company: 'Netflix',
    name: 'Benjamin Clark',
    title: 'Equity Compensation Analyst',
    linkedin_url: 'https://www.linkedin.com/in/benjamin-clark-equity',
    city: 'Los Gatos, CA'
  },

  // Salesforce (5 contacts)
  {
    company: 'Salesforce',
    name: 'Rebecca Lewis',
    title: 'Senior Benefits Manager',
    linkedin_url: 'https://www.linkedin.com/in/rebecca-lewis-benefits',
    email: 'rlewis@salesforce.com',
    city: 'San Francisco, CA'
  },
  {
    company: 'Salesforce',
    name: 'Joshua Walker',
    title: 'Compensation Strategy Lead',
    linkedin_url: 'https://www.linkedin.com/in/joshua-walker-comp',
    city: 'San Francisco, CA'
  },
  {
    company: 'Salesforce',
    name: 'Stephanie Hall',
    title: 'Director of Total Rewards',
    linkedin_url: 'https://www.linkedin.com/in/stephanie-hall-rewards',
    email: 'shall@salesforce.com',
    city: 'San Francisco, CA'
  },
  {
    company: 'Salesforce',
    name: 'Ryan Allen',
    title: 'HR Business Partner - Sales',
    linkedin_url: 'https://www.linkedin.com/in/ryan-allen-hr',
    city: 'San Francisco, CA'
  },
  {
    company: 'Salesforce',
    name: 'Melissa Young',
    title: 'Benefits Operations Manager',
    linkedin_url: 'https://www.linkedin.com/in/melissa-young-benefits',
    city: 'Chicago, IL'
  },

  // Adobe (5 contacts)
  {
    company: 'Adobe',
    name: 'Eric King',
    title: 'Senior Manager, Compensation',
    linkedin_url: 'https://www.linkedin.com/in/eric-king-comp',
    email: 'eking@adobe.com',
    city: 'San Jose, CA'
  },
  {
    company: 'Adobe',
    name: 'Samantha Wright',
    title: 'Benefits Program Manager',
    linkedin_url: 'https://www.linkedin.com/in/samantha-wright-benefits',
    city: 'San Jose, CA'
  },
  {
    company: 'Adobe',
    name: 'William Lopez',
    title: 'Director of HR Operations',
    linkedin_url: 'https://www.linkedin.com/in/william-lopez-hr',
    email: 'wlopez@adobe.com',
    city: 'San Jose, CA'
  },
  {
    company: 'Adobe',
    name: 'Catherine Hill',
    title: 'Total Rewards Specialist',
    linkedin_url: 'https://www.linkedin.com/in/catherine-hill-rewards',
    city: 'San Francisco, CA'
  },
  {
    company: 'Adobe',
    name: 'Jason Scott',
    title: 'Equity Programs Manager',
    linkedin_url: 'https://www.linkedin.com/in/jason-scott-equity',
    city: 'Seattle, WA'
  },

  // Uber (5 contacts)
  {
    company: 'Uber',
    name: 'Natalie Green',
    title: 'Senior Benefits Manager',
    linkedin_url: 'https://www.linkedin.com/in/natalie-green-benefits',
    email: 'ngreen@uber.com',
    city: 'San Francisco, CA'
  },
  {
    company: 'Uber',
    name: 'Marcus Adams',
    title: 'Compensation Lead',
    linkedin_url: 'https://www.linkedin.com/in/marcus-adams-comp',
    city: 'San Francisco, CA'
  },
  {
    company: 'Uber',
    name: 'Jennifer Baker',
    title: 'Director of Total Rewards',
    linkedin_url: 'https://www.linkedin.com/in/jennifer-baker-rewards',
    email: 'jbaker@uber.com',
    city: 'San Francisco, CA'
  },
  {
    company: 'Uber',
    name: 'Tyler Mitchell',
    title: 'HR Business Partner - Engineering',
    linkedin_url: 'https://www.linkedin.com/in/tyler-mitchell-hr',
    city: 'San Francisco, CA'
  },
  {
    company: 'Uber',
    name: 'Hannah Perez',
    title: 'Benefits and Wellness Manager',
    linkedin_url: 'https://www.linkedin.com/in/hannah-perez-benefits',
    city: 'New York, NY'
  },

  // Airbnb (5 contacts)
  {
    company: 'Airbnb',
    name: 'Alexander Roberts',
    title: 'Senior Compensation Manager',
    linkedin_url: 'https://www.linkedin.com/in/alexander-roberts-comp',
    email: 'aroberts@airbnb.com',
    city: 'San Francisco, CA'
  },
  {
    company: 'Airbnb',
    name: 'Victoria Turner',
    title: 'Benefits Program Lead',
    linkedin_url: 'https://www.linkedin.com/in/victoria-turner-benefits',
    city: 'San Francisco, CA'
  },
  {
    company: 'Airbnb',
    name: 'Jonathan Phillips',
    title: 'Director of Total Rewards',
    linkedin_url: 'https://www.linkedin.com/in/jonathan-phillips-rewards',
    email: 'jphillips@airbnb.com',
    city: 'San Francisco, CA'
  },
  {
    company: 'Airbnb',
    name: 'Kimberly Campbell',
    title: 'HR Manager - Product',
    linkedin_url: 'https://www.linkedin.com/in/kimberly-campbell-hr',
    city: 'San Francisco, CA'
  },
  {
    company: 'Airbnb',
    name: 'Charles Parker',
    title: 'Equity Compensation Specialist',
    linkedin_url: 'https://www.linkedin.com/in/charles-parker-equity',
    city: 'Seattle, WA'
  }
];

async function buildProspectList() {
  console.log('🚀 Building HR Prospect List...\n');

  console.log(`📊 Target: ${HR_PROSPECTS.length} prospects from 10 companies\n`);

  // Group by company to show breakdown
  const byCompany = HR_PROSPECTS.reduce((acc, p) => {
    acc[p.company] = (acc[p.company] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📈 Breakdown by company:');
  Object.entries(byCompany).forEach(([company, count]) => {
    console.log(`  ${company}: ${count} contacts`);
  });
  console.log('');

  try {
    const insertedCount = bulkCreateHRProspects(HR_PROSPECTS);

    console.log(`✅ Successfully inserted ${insertedCount} new prospects`);
    console.log(`⚠️  Skipped ${HR_PROSPECTS.length - insertedCount} duplicates (already in database)\n`);

    console.log('📧 Email coverage:');
    const withEmail = HR_PROSPECTS.filter(p => p.email).length;
    console.log(`  ${withEmail}/${HR_PROSPECTS.length} prospects have email addresses (${Math.round(withEmail / HR_PROSPECTS.length * 100)}%)\n`);

    console.log('🎯 Next steps:');
    console.log('1. Configure LinkedIn credentials in .env:');
    console.log('   LINKEDIN_EMAIL=your-email@example.com');
    console.log('   LINKEDIN_PASSWORD=your-password\n');
    console.log('2. Test automation (dry run):');
    console.log('   tsx scripts/linkedin-outreach-automation.ts --dry-run\n');
    console.log('3. Start outreach (10 connections/day):');
    console.log('   tsx scripts/linkedin-outreach-automation.ts --limit 10\n');
    console.log('4. View dashboard:');
    console.log('   http://localhost:3000/admin/hr-outreach\n');

    console.log('💡 Pro tips:');
    console.log('  - LinkedIn limits: 10 connections/hour, 50/day');
    console.log('  - Use Apollo.io API for email enrichment (5000 free credits/month)');
    console.log('  - Use RocketReach for verified email addresses ($49/month)\n');

  } catch (error) {
    console.error('❌ Error building prospect list:', error);
    process.exit(1);
  }
}

buildProspectList().catch(console.error);
