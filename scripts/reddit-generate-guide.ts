#!/usr/bin/env tsx
import 'dotenv/config';
import { UltimateGuideGenerator } from '../lib/reddit/ultimate-guide-generator';
import * as readline from 'readline';

const GUIDE_TOPICS = {
  'h1b': 'Complete Guide to H-1B RSU Taxation When Moving to Canada',
  'ImmigrationCanada': 'Ultimate Tax Guide for US Tech Workers Moving to Canada',
  'PersonalFinanceCanada': 'Cross-Border Tax Filing: Everything You Need to Know',
  'cscareerquestions': 'Software Engineer\'s Guide to RSU Taxation Across Borders',
};

async function main() {
  console.log('📚 Reddit Ultimate Guide Generator');
  console.log('='.repeat(60));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\nTarget subreddits:');
  Object.entries(GUIDE_TOPICS).forEach(([sub, topic], i) => {
    console.log(`${i + 1}. r/${sub} - "${topic}"`);
  });

  const choice = await new Promise<string>((resolve) => {
    rl.question('\nSelect subreddit (1-4): ', resolve);
  });

  const index = parseInt(choice) - 1;
  const subreddits = Object.keys(GUIDE_TOPICS);

  if (index < 0 || index >= subreddits.length) {
    console.log('❌ Invalid choice');
    rl.close();
    process.exit(1);
  }

  const subreddit = subreddits[index];
  const topic = GUIDE_TOPICS[subreddit as keyof typeof GUIDE_TOPICS];

  rl.close();

  const generator = new UltimateGuideGenerator();

  try {
    console.log(`\n🤖 Generating guide for r/${subreddit}...`);
    const guide = await generator.generateGuide(subreddit, topic);

    console.log('\n' + '='.repeat(60));
    console.log('GENERATED GUIDE');
    console.log('='.repeat(60));
    console.log(`\nTitle: ${guide.title}`);
    console.log(`\nContent:\n${guide.content}`);
    console.log('\n' + '='.repeat(60));

    console.log(`\n✅ Guide saved to database (ID: ${guide.id})`);
    console.log('\nNext steps:');
    console.log('1. Review the guide content');
    console.log('2. Create an infographic (optional, use Canva/Figma)');
    console.log('3. Schedule posting: npm run reddit:schedule-guide');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    generator.close();
  }
}

main();
