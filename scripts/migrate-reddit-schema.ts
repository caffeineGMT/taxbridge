import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const db = new Database('data/taxbridge.db');

console.log('Running Reddit tracking schema migration...');

const schemaSQL = readFileSync(
  join(process.cwd(), 'lib/db/reddit-schema.sql'),
  'utf-8'
);

// Execute schema
const statements = schemaSQL.split(';').filter(s => s.trim());
for (const statement of statements) {
  if (statement.trim()) {
    db.exec(statement);
  }
}

// Seed default keywords
const seedKeywords = db.prepare(`
  INSERT OR IGNORE INTO reddit_keywords (keyword, subreddit, active)
  VALUES (?, ?, 1)
`);

const targetKeywords = [
  // r/h1b
  ['RSU tax', 'h1b'],
  ['moved to Canada', 'h1b'],
  ['dual filing', 'h1b'],
  ['H-1B CPA', 'h1b'],
  ['stock compensation tax', 'h1b'],
  ['cross-border tax', 'h1b'],

  // r/ImmigrationCanada
  ['RSU tax', 'ImmigrationCanada'],
  ['H-1B returning', 'ImmigrationCanada'],
  ['US tax obligations', 'ImmigrationCanada'],
  ['dual tax filing', 'ImmigrationCanada'],
  ['tech worker tax', 'ImmigrationCanada'],

  // r/PersonalFinanceCanada
  ['RSU tax', 'PersonalFinanceCanada'],
  ['US stock tax', 'PersonalFinanceCanada'],
  ['cross-border tax', 'PersonalFinanceCanada'],
  ['H-1B', 'PersonalFinanceCanada'],
  ['US income tax', 'PersonalFinanceCanada'],

  // r/cscareerquestions
  ['RSU tax', 'cscareerquestions'],
  ['Canada tax', 'cscareerquestions'],
  ['cross-border', 'cscareerquestions'],
  ['stock compensation', 'cscareerquestions'],
  ['H-1B tax', 'cscareerquestions'],
];

for (const [keyword, subreddit] of targetKeywords) {
  seedKeywords.run(keyword, subreddit);
}

console.log(`✅ Reddit schema created successfully`);
console.log(`✅ Seeded ${targetKeywords.length} keyword-subreddit combinations`);

db.close();
