/**
 * Migration: Influencer Affiliate Program
 * Extends affiliate system with influencer-specific features
 */

import { getDatabase } from '../lib/db/index';
import fs from 'fs';
import path from 'path';

function migrate() {
  const db = getDatabase();

  console.log('Running influencer affiliate migration...');

  const migrationPath = path.join(
    process.cwd(),
    'lib/db/migrations/013_influencer_affiliates.sql'
  );

  const sql = fs.readFileSync(migrationPath, 'utf-8');

  // Split by semicolons and run each statement individually
  // (ALTER TABLE can't be batched in SQLite)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let skipCount = 0;

  for (const statement of statements) {
    try {
      db.exec(statement + ';');
      successCount++;
    } catch (err: any) {
      if (err.message.includes('duplicate column') || err.message.includes('already exists')) {
        skipCount++;
      } else {
        console.warn(`Warning: ${err.message}`);
        skipCount++;
      }
    }
  }

  console.log(`Migration complete: ${successCount} statements executed, ${skipCount} skipped`);

  // Seed the influencer outreach database with 20 targets
  seedInfluencerTargets(db);
}

function seedInfluencerTargets(db: ReturnType<typeof getDatabase>) {
  console.log('\nSeeding influencer outreach targets...');

  const influencers = [
    {
      influencer_name: 'Self Sponsored Visa',
      platform: 'youtube',
      platform_url: 'https://youtube.com/@SelfSponsoredVisa',
      audience_size: 85000,
      content_niche: 'US immigration, H-1B, green card self-sponsorship',
      email: null,
      priority: 10,
    },
    {
      influencer_name: 'Immigration.ca',
      platform: 'blog',
      platform_url: 'https://www.immigration.ca',
      audience_size: 500000,
      content_niche: 'Canadian immigration news and guides',
      email: null,
      priority: 9,
    },
    {
      influencer_name: 'CanadaVisa Forum Moderators',
      platform: 'forum',
      platform_url: 'https://www.canadavisa.com/canada-immigration-discussion-board/',
      audience_size: 1000000,
      content_niche: 'Canadian visa and immigration forum',
      email: null,
      priority: 9,
    },
    {
      influencer_name: 'Haque Legal (Imad Haque)',
      platform: 'youtube',
      platform_url: 'https://youtube.com/@HaqueLegal',
      audience_size: 120000,
      content_niche: 'H-1B, EB-2 NIW, employment-based immigration',
      email: null,
      priority: 9,
    },
    {
      influencer_name: 'Path2USA',
      platform: 'blog',
      platform_url: 'https://www.path2usa.com',
      audience_size: 300000,
      content_niche: 'US visa guides, H-1B, L-1, work permits',
      email: null,
      priority: 8,
    },
    {
      influencer_name: 'Moving2Canada',
      platform: 'blog',
      platform_url: 'https://moving2canada.com',
      audience_size: 400000,
      content_niche: 'Immigration to Canada, express entry, work permits',
      email: null,
      priority: 8,
    },
    {
      influencer_name: 'Unacademy Visa (Saurabh)',
      platform: 'youtube',
      platform_url: 'https://youtube.com/@UnacademyVisa',
      audience_size: 200000,
      content_niche: 'US visa interviews, H-1B processing, immigration tips',
      email: null,
      priority: 8,
    },
    {
      influencer_name: 'Singh in USA',
      platform: 'youtube',
      platform_url: 'https://youtube.com/@SinghinUSA',
      audience_size: 150000,
      content_niche: 'Life in USA, H-1B, tech career, taxes',
      email: null,
      priority: 8,
    },
    {
      influencer_name: 'Cross-Border CPA (Phil Hogan)',
      platform: 'blog',
      platform_url: 'https://www.beaconhillwm.ca/blog',
      audience_size: 50000,
      content_niche: 'US-Canada cross-border tax planning, CPA advice',
      email: null,
      priority: 10,
    },
    {
      influencer_name: 'Canadian Tax Podcast',
      platform: 'podcast',
      platform_url: 'https://canadiantaxpodcast.com',
      audience_size: 30000,
      content_niche: 'Canadian tax strategies, cross-border issues',
      email: null,
      priority: 8,
    },
    {
      influencer_name: 'VisaJourney',
      platform: 'forum',
      platform_url: 'https://www.visajourney.com',
      audience_size: 800000,
      content_niche: 'US immigration forums, visa experiences',
      email: null,
      priority: 7,
    },
    {
      influencer_name: 'TurboTax Canada Blog',
      platform: 'blog',
      platform_url: 'https://turbotax.intuit.ca/tips',
      audience_size: 2000000,
      content_niche: 'Canadian tax tips, filing guides',
      email: null,
      priority: 7,
    },
    {
      influencer_name: 'Syed Brothers',
      platform: 'youtube',
      platform_url: 'https://youtube.com/@SyedBrothers',
      audience_size: 100000,
      content_niche: 'Tech career in US/Canada, immigration experiences',
      email: null,
      priority: 7,
    },
    {
      influencer_name: 'H1B Grader',
      platform: 'blog',
      platform_url: 'https://h1bgrader.com',
      audience_size: 250000,
      content_niche: 'H-1B salary data, visa statistics, employer info',
      email: null,
      priority: 8,
    },
    {
      influencer_name: 'Nerdwallet Canada',
      platform: 'blog',
      platform_url: 'https://www.nerdwallet.com/ca',
      audience_size: 5000000,
      content_niche: 'Personal finance, tax optimization, investing',
      email: null,
      priority: 6,
    },
    {
      influencer_name: 'Wealthsimple Magazine',
      platform: 'blog',
      platform_url: 'https://www.wealthsimple.com/en-ca/magazine',
      audience_size: 3000000,
      content_niche: 'Canadian personal finance, taxes, investing',
      email: null,
      priority: 6,
    },
    {
      influencer_name: 'GreenCardTracker',
      platform: 'twitter',
      platform_url: 'https://twitter.com/GreenCardTrack',
      audience_size: 45000,
      content_niche: 'Green card processing times, EB-2/EB-3 tracking',
      email: null,
      priority: 7,
    },
    {
      influencer_name: 'YMI (Your Move Immigration)',
      platform: 'youtube',
      platform_url: 'https://youtube.com/@YMImmigration',
      audience_size: 60000,
      content_niche: 'Canadian immigration pathways, express entry',
      email: null,
      priority: 7,
    },
    {
      influencer_name: 'TaxTips.ca',
      platform: 'blog',
      platform_url: 'https://www.taxtips.ca',
      audience_size: 1500000,
      content_niche: 'Canadian tax information, calculators, guides',
      email: null,
      priority: 8,
    },
    {
      influencer_name: 'Blind (Tech Workers)',
      platform: 'forum',
      platform_url: 'https://www.teamblind.com',
      audience_size: 5000000,
      content_niche: 'Tech salary, RSU, immigration, compensation discussions',
      email: null,
      priority: 9,
    },
  ];

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO influencer_outreach (
      influencer_name, platform, platform_url, audience_size, content_niche, email, priority
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  let insertCount = 0;
  for (const inf of influencers) {
    try {
      const result = insertStmt.run(
        inf.influencer_name,
        inf.platform,
        inf.platform_url,
        inf.audience_size,
        inf.content_niche,
        inf.email,
        inf.priority
      );
      if (result.changes > 0) insertCount++;
    } catch {
      // Already exists
    }
  }

  console.log(`Seeded ${insertCount} influencer outreach targets`);
}

migrate();
