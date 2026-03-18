#!/usr/bin/env tsx

/**
 * Check for pending responses that need replies
 * Usage: npm run launch:check-responses
 */

import { CommunityPostTracker } from '../../lib/community-posting/tracker';

async function main() {
  const tracker = new CommunityPostTracker();

  console.log('💬 PENDING RESPONSES CHECK\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const pendingResponses = tracker.getPendingResponses();

  if (pendingResponses.length === 0) {
    console.log('✅ No pending responses! Great job staying on top of comments.\n');
    console.log('Keep monitoring for new comments every 10-15 minutes.\n');
    tracker.close();
    return;
  }

  console.log(`⚠️  You have ${pendingResponses.length} pending response(s)\n`);
  console.log('RESPOND WITHIN 10 MINUTES to maintain engagement!\n');
  console.log('───────────────────────────────────────────────────────────────\n');

  pendingResponses.forEach((response, index) => {
    const post = tracker.getPost(response.post_id);
    const timeAgo = getTimeAgo(new Date(response.created_at));

    console.log(`${index + 1}. ${post?.platform} - ${post?.community}`);
    console.log(`   Post: ${response.post_id}`);
    console.log(`   User: ${response.username || 'Unknown'}`);
    console.log(`   Time: ${timeAgo} ago`);
    console.log(`   Comment: ${response.comment_text.substring(0, 150)}...`);
    if (response.comment_url) {
      console.log(`   URL: ${response.comment_url}`);
    }
    console.log('');
  });

  console.log('───────────────────────────────────────────────────────────────\n');
  console.log('📝 RESPONSE TIPS:\n');
  console.log('1. Be helpful, not sales-y');
  console.log('2. Share specific examples and numbers');
  console.log('3. Ask follow-up questions');
  console.log('4. Thank them for engaging');
  console.log('5. Keep it conversational\n');

  console.log('After responding, mark it as responded:');
  console.log('  (This feature coming soon - manual tracking for now)\n');

  tracker.close();
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
}

main().catch(console.error);
