#!/usr/bin/env tsx
import 'dotenv/config';
import Database from 'better-sqlite3';
import * as readline from 'readline';

async function main() {
  console.log('📋 Reddit Comment Draft Review');
  console.log('='.repeat(60));

  const db = new Database('data/taxbridge.db');

  const drafts = db.prepare(`
    SELECT
      c.id,
      c.parent_reddit_id,
      c.subreddit,
      c.content,
      c.include_link,
      p.title as postTitle,
      p.permalink
    FROM reddit_comments c
    JOIN reddit_posts p ON c.parent_reddit_id = p.reddit_id
    WHERE c.status = 'pending'
    ORDER BY c.created_at DESC
  `).all() as Array<{
    id: number;
    parent_reddit_id: string;
    subreddit: string;
    content: string;
    include_link: number;
    postTitle: string;
    permalink: string;
  }>;

  if (drafts.length === 0) {
    console.log('\n✅ No pending drafts to review');
    db.close();
    return;
  }

  console.log(`\nFound ${drafts.length} pending comment drafts\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  for (let i = 0; i < drafts.length; i++) {
    const draft = drafts[i];

    console.log('\n' + '='.repeat(60));
    console.log(`Draft ${i + 1}/${drafts.length} (ID: ${draft.id})`);
    console.log('='.repeat(60));
    console.log(`\nSubreddit: r/${draft.subreddit}`);
    console.log(`Post: "${draft.postTitle}"`);
    console.log(`Link: ${draft.permalink}`);
    console.log(`Includes product link: ${draft.include_link ? 'YES' : 'NO'}`);
    console.log('\n--- COMMENT ---');
    console.log(draft.content);
    console.log('--- END COMMENT ---\n');

    const answer = await new Promise<string>((resolve) => {
      rl.question('Action: [a]pprove, [r]eject, [s]kip, [q]uit? ', resolve);
    });

    const action = answer.toLowerCase().trim();

    if (action === 'a' || action === 'approve') {
      db.prepare('UPDATE reddit_comments SET status = ? WHERE id = ?').run('approved', draft.id);
      console.log('✅ Approved');
    } else if (action === 'r' || action === 'reject') {
      db.prepare('UPDATE reddit_comments SET status = ? WHERE id = ?').run('rejected', draft.id);
      console.log('❌ Rejected');
    } else if (action === 's' || action === 'skip') {
      console.log('⏭️  Skipped');
    } else if (action === 'q' || action === 'quit') {
      console.log('Exiting review...');
      break;
    }
  }

  rl.close();
  db.close();

  console.log('\n✅ Review complete');
}

main();
