import { initializeDatabase, runMigrations, closeDatabase } from '../lib/db/index.js';
import { seedDatabase } from '../lib/db/seed.js';

/**
 * Initialize the TaxBridge database
 * Run with: npm run db:init
 * Add --seed flag to populate with sample data
 */
async function main() {
  const shouldSeed = process.argv.includes('--seed');

  console.log('🚀 Initializing TaxBridge database...\n');

  try {
    // Initialize schema
    initializeDatabase();

    // Run migrations
    runMigrations();

    // Optionally seed data
    if (shouldSeed) {
      console.log('');
      seedDatabase();
    } else {
      console.log('\n💡 Tip: Run with --seed flag to populate sample data');
      console.log('   npm run db:init -- --seed\n');
    }

    console.log('✅ Database initialization complete!');
    console.log('   Database location: data/taxbridge.db\n');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

main();
