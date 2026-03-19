#!/usr/bin/env tsx

/**
 * Product Hunt Comment Monitoring System
 *
 * Checks for new comments on TaxBridge Product Hunt launch every hour.
 * Sends alerts for new comments requiring response.
 *
 * Setup:
 *   1. Get Product Hunt API token: https://www.producthunt.com/v2/oauth/applications
 *   2. Add to .env: PRODUCT_HUNT_API_TOKEN=your_token
 *   3. Add POST_ID after submission: PRODUCT_HUNT_POST_ID=taxbridge
 *
 * Usage:
 *   # Manual check
 *   npx tsx scripts/monitor-ph-comments.ts
 *
 *   # Hourly cron (add to crontab)
 *   0 * * * * cd /path/to/project && npx tsx scripts/monitor-ph-comments.ts
 */

import { writeFile, readFile } from 'fs/promises';
import path from 'path';

// Configuration
const API_TOKEN = process.env.PRODUCT_HUNT_API_TOKEN || '';
const POST_SLUG = process.env.PRODUCT_HUNT_POST_ID || 'taxbridge'; // Product slug on PH
const STATE_FILE = path.join(process.cwd(), 'data', 'ph-comments-state.json');

interface Comment {
  id: string;
  body: string;
  user: {
    name: string;
    username: string;
  };
  created_at: string;
}

interface State {
  last_check: string;
  last_comment_id: string | null;
  total_comments: number;
}

async function fetchProductHuntComments(): Promise<Comment[]> {
  if (!API_TOKEN) {
    console.log('⚠️  No Product Hunt API token found');
    console.log('   Set PRODUCT_HUNT_API_TOKEN in .env');
    console.log('   Get token: https://www.producthunt.com/v2/oauth/applications');
    return [];
  }

  try {
    // Product Hunt GraphQL API
    const query = `
      query {
        post(slug: "${POST_SLUG}") {
          id
          name
          comments(first: 50, order: NEWEST) {
            edges {
              node {
                id
                body
                user {
                  name
                  username
                }
                createdAt
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const comments = data.data?.post?.comments?.edges?.map((edge: any) => ({
      id: edge.node.id,
      body: edge.node.body,
      user: {
        name: edge.node.user.name,
        username: edge.node.user.username,
      },
      created_at: edge.node.createdAt,
    })) || [];

    return comments;
  } catch (error: any) {
    console.error('❌ Failed to fetch comments:', error.message);
    return [];
  }
}

async function loadState(): Promise<State> {
  try {
    const content = await readFile(STATE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    // First run - no state file exists yet
    return {
      last_check: new Date().toISOString(),
      last_comment_id: null,
      total_comments: 0,
    };
  }
}

async function saveState(state: State): Promise<void> {
  try {
    await writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error: any) {
    console.error('❌ Failed to save state:', error.message);
  }
}

async function monitorComments() {
  console.log('='.repeat(70));
  console.log('PRODUCT HUNT COMMENT MONITOR');
  console.log('='.repeat(70));
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log('');

  // Load previous state
  const state = await loadState();
  console.log(`Last check: ${state.last_check}`);
  console.log(`Previous comments: ${state.total_comments}`);
  console.log('');

  // Fetch current comments
  console.log('🔍 Fetching latest comments...');
  const comments = await fetchProductHuntComments();

  if (comments.length === 0) {
    console.log('⚠️  No comments found (or API not configured)');
    console.log('');
    console.log('To enable monitoring:');
    console.log('1. Get API token: https://www.producthunt.com/v2/oauth/applications');
    console.log('2. Add to .env: PRODUCT_HUNT_API_TOKEN=your_token');
    console.log('3. After submission, set POST_ID in .env');
    console.log('');
    return;
  }

  console.log(`✅ Found ${comments.length} total comments\n`);

  // Find new comments
  const newComments = state.last_comment_id
    ? comments.filter((c) => c.id !== state.last_comment_id &&
        new Date(c.created_at) > new Date(state.last_check))
    : comments;

  if (newComments.length === 0) {
    console.log('✅ No new comments since last check\n');
  } else {
    console.log(`🆕 ${newComments.length} NEW COMMENTS:\n`);

    newComments.forEach((comment, i) => {
      console.log(`[${i + 1}] ${comment.user.name} (@${comment.user.username})`);
      console.log(`    Time: ${new Date(comment.created_at).toLocaleString()}`);
      console.log(`    Comment: ${comment.body.substring(0, 100)}${comment.body.length > 100 ? '...' : ''}`);
      console.log(`    Link: https://www.producthunt.com/posts/${POST_SLUG}#comment-${comment.id}`);
      console.log('');
    });

    // Alert (in production, this could send email/SMS/Slack notification)
    console.log('🔔 ACTION REQUIRED: Respond to new comments!');
    console.log('   Response time target: <15 minutes for algorithm boost');
    console.log('   See response templates: docs/PH_COMMENT_RESPONSE_PLAYBOOK.md');
    console.log('');
  }

  // Update state
  const updatedState: State = {
    last_check: new Date().toISOString(),
    last_comment_id: comments[0]?.id || state.last_comment_id,
    total_comments: comments.length,
  };

  await saveState(updatedState);

  console.log('='.repeat(70));
  console.log('MONITOR COMPLETE');
  console.log('='.repeat(70));
  console.log(`Total comments: ${comments.length}`);
  console.log(`New since last check: ${newComments.length}`);
  console.log(`Next check: Run this script again in 1 hour`);
  console.log('');

  if (newComments.length > 0) {
    console.log('⚠️  NEW COMMENTS REQUIRE RESPONSE!');
    process.exit(1); // Non-zero exit for cron alerting
  }
}

// Run the monitor
monitorComments().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
