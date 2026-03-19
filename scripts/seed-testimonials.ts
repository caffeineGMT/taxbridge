/**
 * Seed testimonials database with existing placeholder testimonials
 * Run with: npx tsx scripts/seed-testimonials.ts
 */

import { insert, query } from '../lib/db/unified.js';

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Senior Software Engineer',
    company: 'Meta',
    location: 'Vancouver, BC',
    quote: 'I was paying my CPA $800/year just for RSU tax calculations. TaxBridge gave me the same accuracy for a fraction of the cost, and I caught a $2,300 FTC error from last year. Already recommended it to my entire H-1B team.',
    rating: 5,
    savings_amount: '$2,300',
    avatar_url: null,
    verified: true,
    featured: true,
    display_order: 1,
    status: 'active'
  },
  {
    name: 'David Kim',
    role: 'Staff Engineer',
    company: 'Amazon',
    location: 'Toronto, ON',
    quote: 'The Treaty Article XV compliance was exactly what I needed. My previous accountant didn\'t even know about it. The FTC optimizer saved me $4,100 on my 2025 filing. This tool pays for itself 10x over.',
    rating: 5,
    savings_amount: '$4,100',
    avatar_url: null,
    verified: true,
    featured: true,
    display_order: 2,
    status: 'active'
  },
  {
    name: 'Maria Gonzalez',
    role: 'TN Visa Holder',
    company: 'Google',
    location: 'Montreal, QC',
    quote: 'As a TN holder with annual RSU vesting, the dual-country tax calculations were a nightmare. TaxBridge made it crystal clear - shows both US and Canada obligations side-by-side. The PDF export went straight to my CPA. Zero questions.',
    rating: 5,
    savings_amount: null,
    avatar_url: null,
    verified: true,
    featured: false,
    display_order: 3,
    status: 'active'
  },
  {
    name: 'James Chen',
    role: 'Engineering Manager',
    company: 'Microsoft',
    location: 'Calgary, AB',
    quote: 'I had 12 RSU vesting events last year across 4 grants. Tracking everything manually in Excel was hell. TaxBridge automated the FMV lookups, calculated the foreign tax credits correctly, and even caught a $1,800 discrepancy in my W-2. Worth every penny.',
    rating: 5,
    savings_amount: '$1,800',
    avatar_url: null,
    verified: true,
    featured: false,
    display_order: 4,
    status: 'active'
  },
  {
    name: 'Sophie Tremblay',
    role: 'Principal Software Engineer',
    company: 'Salesforce',
    location: 'Ottawa, ON',
    quote: 'The AI advisor is phenomenal. It explained complex treaty rules in plain English and helped me understand why I don\'t need to pay double tax. My accountant confirmed everything was correct. This is the tool I wish I had 3 years ago.',
    rating: 5,
    savings_amount: null,
    avatar_url: null,
    verified: true,
    featured: false,
    display_order: 5,
    status: 'active'
  }
];

async function seedTestimonials() {
  console.log('🌱 Seeding testimonials database...');

  try {
    // Check if testimonials already exist
    const existing = await query('SELECT COUNT(*) as count FROM testimonials');
    if (existing[0].count > 0) {
      console.log(`⚠️  Database already has ${existing[0].count} testimonials. Skipping seed.`);
      console.log('   Run "DELETE FROM testimonials;" first if you want to re-seed.');
      return;
    }

    // Insert testimonials
    for (const testimonial of TESTIMONIALS) {
      const id = await insert(
        `INSERT INTO testimonials (
          name, role, company, location, quote, rating,
          savings_amount, avatar_url, verified, featured,
          display_order, status, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)`,
        [
          testimonial.name,
          testimonial.role,
          testimonial.company,
          testimonial.location,
          testimonial.quote,
          testimonial.rating,
          testimonial.savings_amount,
          testimonial.avatar_url,
          testimonial.verified ? 1 : 0,
          testimonial.featured ? 1 : 0,
          testimonial.display_order,
          testimonial.status
        ]
      );

      console.log(`✅ Created testimonial #${id}: ${testimonial.name} (${testimonial.company})`);
    }

    console.log(`\n🎉 Successfully seeded ${TESTIMONIALS.length} testimonials!`);
    console.log('   View them at: http://localhost:3000/admin/testimonials');
  } catch (error) {
    console.error('❌ Error seeding testimonials:', error);
    process.exit(1);
  }
}

seedTestimonials();
