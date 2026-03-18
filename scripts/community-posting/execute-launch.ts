#!/usr/bin/env tsx

/**
 * Community Posting Launch Day Execution Script
 * Generates all posts, initializes tracking database, and provides posting dashboard
 */

import { communityPosts } from '../../lib/community-posting/posts';
import { CommunityPostTracker } from '../../lib/community-posting/tracker';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'data', 'launch-posts');

function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateMarkdownPost(post: typeof communityPosts[0]): string {
  const markdown = `# ${post.platform} - ${post.community}

**Scheduled Time:** ${post.scheduledTime} PST
**Post ID:** ${post.id}

---

## Title

${post.title || 'N/A (use body only)'}

---

## Post Body

${post.body}

---

## UTM Parameters

- **Source:** ${post.utmSource}
- **Medium:** ${post.utmMedium}
- **Campaign:** ${post.utmCampaign}
- **Content:** ${post.utmContent}

---

## Target Metrics

${post.targetMetrics.upvotes ? `- **Upvotes:** ${post.targetMetrics.upvotes}+\n` : ''}${post.targetMetrics.comments ? `- **Comments:** ${post.targetMetrics.comments}+\n` : ''}${post.targetMetrics.impressions ? `- **Impressions:** ${post.targetMetrics.impressions}+\n` : ''}${post.targetMetrics.engagements ? `- **Engagements:** ${post.targetMetrics.engagements}+\n` : ''}

---

## Instructions

1. **Copy the title and body** above
2. **Post to ${post.community}** on ${post.platform}
3. **Copy the post URL**
4. **Update tracking:** Run \`npm run launch:mark-posted ${post.id} <POST_URL>\`
5. **Monitor engagement:** Check comments every 10-15 minutes
6. **Respond to ALL comments** within 10 minutes
7. **Update metrics:** Run \`npm run launch:update-metrics ${post.id}\` hourly

---

## Engagement Strategy

- Respond to every comment within 10 minutes
- Ask follow-up questions to keep conversations going
- Share specific examples and numbers
- Be helpful, not sales-y
- Thank everyone who engages
- Cross-promote: mention Product Hunt link naturally

---

## Status

- [ ] Posted
- [ ] Post URL recorded
- [ ] First response made
- [ ] Hourly engagement check

---

*Generated on ${new Date().toISOString()}*
`;

  return markdown;
}

function generateLaunchSchedule(): string {
  const sortedPosts = [...communityPosts].sort((a, b) => {
    const timeA = convertTimeToMinutes(a.scheduledTime);
    const timeB = convertTimeToMinutes(b.scheduledTime);
    return timeA - timeB;
  });

  let schedule = `# Launch Day Posting Schedule

**Date:** Launch Day (Product Hunt goes live at 12:01 AM PST)
**Total Posts:** ${communityPosts.length}
**Duration:** ${sortedPosts[0].scheduledTime} - ${sortedPosts[sortedPosts.length - 1].scheduledTime}

---

## Hour-by-Hour Timeline

`;

  sortedPosts.forEach((post, index) => {
    schedule += `
### ${post.scheduledTime} PST - Post #${index + 1}

**Platform:** ${post.platform}
**Community:** ${post.community}
**Post ID:** \`${post.id}\`
**File:** \`${post.id}.md\`

**Quick Actions:**
- [ ] Read post file: \`data/launch-posts/${post.id}.md\`
- [ ] Copy title + body
- [ ] Post to ${post.community}
- [ ] Mark as posted: \`npm run launch:mark-posted ${post.id} <URL>\`
- [ ] Monitor comments (set 10-min timer)

**Target Metrics:** ${post.targetMetrics.upvotes ? `${post.targetMetrics.upvotes}+ upvotes` : ''}${post.targetMetrics.comments ? `, ${post.targetMetrics.comments}+ comments` : ''}${post.targetMetrics.impressions ? `, ${post.targetMetrics.impressions}+ impressions` : ''}

---
`;
  });

  schedule += `
## Post-Launch Checklist

After posting each community:

1. **Record post URL** immediately
2. **Set 10-minute timer** for first comment check
3. **Respond to ALL comments** within 10 minutes
4. **Update engagement metrics** every hour
5. **Track conversions** in PostHog dashboard
6. **Screenshot milestones** (100+ upvotes, top post, etc.)

---

## Success Criteria

- [ ] All 15 posts published
- [ ] 200+ total upvotes across all communities
- [ ] 500+ UTM-tagged clicks to website
- [ ] 50+ comments/discussions generated
- [ ] 10+ conversions from community traffic
- [ ] Sub-10-minute response time maintained

---

## Emergency Contacts

If you need help during launch:
- PostHog dashboard: https://app.posthog.com
- Stripe dashboard: https://dashboard.stripe.com
- Vercel deployment: https://vercel.com/dashboard

---

*Generated on ${new Date().toISOString()}*
`;

  return schedule;
}

function convertTimeToMinutes(time: string): number {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/);
  if (!match) return 0;

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3];

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function generateREADME(): string {
  return `# Launch Day Community Posting

This directory contains all 15 community posts for the TaxBridge Product Hunt launch.

## Quick Start

1. **Initialize tracking database:**
   \`\`\`bash
   npm run launch:init
   \`\`\`

2. **Review launch schedule:**
   \`\`\`bash
   cat data/launch-posts/SCHEDULE.md
   \`\`\`

3. **Post according to schedule** (see SCHEDULE.md for timeline)

4. **Mark each post as posted:**
   \`\`\`bash
   npm run launch:mark-posted <POST_ID> <POST_URL>
   \`\`\`

5. **Monitor engagement and update metrics:**
   \`\`\`bash
   npm run launch:update-metrics <POST_ID>
   \`\`\`

6. **View real-time dashboard:**
   \`\`\`bash
   npm run launch:dashboard
   \`\`\`

## Directory Structure

\`\`\`
data/launch-posts/
├── README.md                          # This file
├── SCHEDULE.md                        # Hour-by-hour posting schedule
├── reddit-pfc.md                      # r/PersonalFinanceCanada post
├── hackernews.md                      # Hacker News Show HN post
├── reddit-canadianinvestor.md         # r/CanadianInvestor post
├── reddit-immigration-canada.md       # r/ImmigrationCanada post
├── linkedin-personal.md               # LinkedIn personal post
├── twitter-thread.md                  # Twitter thread (8 tweets)
├── reddit-sideproject.md              # r/SideProject post
├── reddit-cscareerquestions.md        # r/cscareerquestions post
├── indiehackers.md                    # IndieHackers post
├── facebook-h1b-groups.md             # Facebook H-1B groups post
├── linkedin-tech-groups.md            # LinkedIn tech groups post
├── reddit-h1b.md                      # r/h1b post
├── reddit-tax.md                      # r/tax post
├── levels-fyi-discord.md              # Levels.fyi Discord post
└── techcrunch-comments.md             # TechCrunch comment strategy
\`\`\`

## NPM Scripts

Add these to package.json:

\`\`\`json
{
  "scripts": {
    "launch:init": "tsx scripts/community-posting/execute-launch.ts",
    "launch:mark-posted": "tsx scripts/community-posting/mark-posted.ts",
    "launch:update-metrics": "tsx scripts/community-posting/update-metrics.ts",
    "launch:dashboard": "tsx scripts/community-posting/dashboard.ts",
    "launch:check-responses": "tsx scripts/community-posting/check-responses.ts"
  }
}
\`\`\`

## Posting Best Practices

### Timing
- Space posts 1-2 hours apart
- Follow the schedule in SCHEDULE.md
- Peak times: 6-9 AM, 12-2 PM, 6-9 PM PST

### Engagement
- Respond to ALL comments within 10 minutes
- Be helpful, not sales-y
- Share specific examples and numbers
- Ask follow-up questions
- Thank everyone who engages

### Tracking
- Record post URL immediately after posting
- Update engagement metrics every hour
- Monitor UTM clicks in PostHog
- Track conversions in Stripe

### Success Metrics
- 200+ total upvotes across all communities
- 500+ UTM-tagged clicks
- 50+ comments/discussions
- Sub-10-minute response time
- 10+ conversions from community traffic

## Troubleshooting

### Post gets removed
- Check community rules
- Repost with adjusted language
- Contact moderators if needed

### Low engagement
- Respond to comments quickly
- Cross-promote in related communities
- Share personal stories/examples

### Too many comments to handle
- Prioritize high-quality responses
- Use templates for common questions
- Focus on posts with highest engagement

## Post-Launch

After launch day:
1. **Export metrics:** \`npm run launch:export-metrics\`
2. **Analyze performance:** Review which platforms drove most traffic
3. **Follow up:** Continue responding to comments for 48-72 hours
4. **Document learnings:** What worked, what didn't

---

**Questions?** Check the main playbook: \`docs/COMMUNITY_POSTING_PLAYBOOK.md\`
`;
}

async function main() {
  console.log('🚀 TaxBridge Launch Day - Community Posting Setup\n');

  // Create output directory
  ensureDirectoryExists(OUTPUT_DIR);
  console.log(`✅ Created output directory: ${OUTPUT_DIR}`);

  // Generate individual post files
  console.log('\n📝 Generating post files...');
  communityPosts.forEach(post => {
    const markdown = generateMarkdownPost(post);
    const filename = `${post.id}.md`;
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, markdown);
    console.log(`   ✅ ${filename}`);
  });

  // Generate launch schedule
  const schedule = generateLaunchSchedule();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'SCHEDULE.md'), schedule);
  console.log('   ✅ SCHEDULE.md');

  // Generate README
  const readme = generateREADME();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), readme);
  console.log('   ✅ README.md');

  // Initialize tracking database
  console.log('\n📊 Initializing tracking database...');
  const tracker = new CommunityPostTracker();
  tracker.initializePosts(communityPosts);
  console.log('   ✅ Database initialized');

  // Print summary
  const stats = tracker.getSummaryStats();
  console.log('\n📈 Launch Summary:');
  console.log(`   Total posts: ${stats.totalPosts}`);
  console.log(`   Pending: ${stats.pendingPosts}`);
  console.log(`   Posted: ${stats.postedPosts}`);

  // Print next steps
  console.log('\n✨ Setup Complete!\n');
  console.log('Next steps:');
  console.log('1. Review the posting schedule:');
  console.log('   cat data/launch-posts/SCHEDULE.md\n');
  console.log('2. Review each post file before launch day\n');
  console.log('3. On launch day, follow the schedule and post to each community\n');
  console.log('4. After each post, mark it as posted:');
  console.log('   npm run launch:mark-posted <POST_ID> <POST_URL>\n');
  console.log('5. Monitor engagement and respond to comments within 10 minutes\n');
  console.log('6. Update metrics hourly:');
  console.log('   npm run launch:update-metrics <POST_ID>\n');
  console.log('📂 All posts saved to: data/launch-posts/\n');

  tracker.close();
}

main().catch(console.error);
