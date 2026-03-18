#!/usr/bin/env tsx

/**
 * LAUNCH DAY COMMUNITY POSTING TRACKER
 *
 * Tracks and manages 15 community posts across the launch day
 * Ensures proper spacing (1-2 hours) and UTM parameter tracking
 */

import fs from 'fs';
import path from 'path';

// Community posting schedule
export interface CommunityPost {
  id: number;
  time: string; // PST
  platform: string;
  community: string;
  members: string;
  title: string;
  url: string; // URL with UTM params
  status: 'pending' | 'posted' | 'responded';
  upvotes?: number;
  comments?: number;
  clicks?: number;
  postedAt?: string;
  notes?: string;
}

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 1,
    time: '06:00 AM',
    platform: 'Reddit',
    community: 'r/PersonalFinanceCanada',
    members: '700K+',
    title: 'Built a free calculator for cross-border tax (US → Canada) - saved me $12K on RSU taxes',
    url: 'https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=PersonalFinanceCanada',
    status: 'pending'
  },
  {
    id: 2,
    time: '07:30 AM',
    platform: 'Hacker News',
    community: 'Show HN',
    members: 'Millions',
    title: 'Show HN: TaxBridge – Cross-border tax calculator for H-1B → Canada relocations',
    url: 'https://taxbridge.app?utm_source=hackernews&utm_medium=show_hn&utm_campaign=ph_launch',
    status: 'pending'
  },
  {
    id: 3,
    time: '09:00 AM',
    platform: 'Reddit',
    community: 'r/CanadianInvestor',
    members: '250K+',
    title: 'Cross-border tax on US stock? Built a calculator after overpaying $12K',
    url: 'https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=CanadianInvestor',
    status: 'pending'
  },
  {
    id: 4,
    time: '10:30 AM',
    platform: 'Reddit',
    community: 'r/ImmigrationCanada',
    members: '150K+',
    title: 'For H-1B/TN visa holders moving to Canada: Built a free tax calculator for US RSUs',
    url: 'https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=ImmigrationCanada',
    status: 'pending'
  },
  {
    id: 5,
    time: '12:00 PM',
    platform: 'LinkedIn',
    community: 'Personal Post',
    members: '1st/2nd connections',
    title: '🚀 Launching my side project on Product Hunt today!',
    url: 'https://taxbridge.app?utm_source=linkedin&utm_medium=post&utm_campaign=ph_launch',
    status: 'pending'
  },
  {
    id: 6,
    time: '01:30 PM',
    platform: 'Twitter',
    community: 'Thread',
    members: 'Followers',
    title: 'I overpaid $12,000 on my taxes last year. Here\'s what I learned...',
    url: 'https://taxbridge.app?utm_source=twitter&utm_medium=thread&utm_campaign=ph_launch',
    status: 'pending'
  },
  {
    id: 7,
    time: '03:00 PM',
    platform: 'Reddit',
    community: 'r/SideProject',
    members: '200K+',
    title: '[Launched] TaxBridge - Built a cross-border tax calculator in 6 weeks, hit $6K MRR',
    url: 'https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=SideProject',
    status: 'pending'
  },
  {
    id: 8,
    time: '04:30 PM',
    platform: 'Reddit',
    community: 'r/cscareerquestions',
    members: '2M+',
    title: 'PSA: If you\'re moving US → Canada for a tech job, here\'s a tax trap that cost me $12K',
    url: 'https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=cscareerquestions',
    status: 'pending'
  },
  {
    id: 9,
    time: '06:00 PM',
    platform: 'Indie Hackers',
    community: 'Share Your Product',
    members: 'Community',
    title: 'Launched TaxBridge on PH today - $6K MRR in 6 weeks, targeting $1M ARR',
    url: 'https://taxbridge.app?utm_source=indiehackers&utm_medium=post&utm_campaign=ph_launch',
    status: 'pending'
  },
  {
    id: 10,
    time: '07:30 PM',
    platform: 'Facebook',
    community: 'H-1B Visa Holders',
    members: '200K+',
    title: '📢 For H-1B holders moving to Canada: Tax calculator for US RSUs',
    url: 'https://taxbridge.app?utm_source=facebook&utm_medium=group&utm_campaign=ph_launch&utm_content=H1BVisaHolders',
    status: 'pending'
  },
  {
    id: 11,
    time: '07:45 PM',
    platform: 'Facebook',
    community: 'H-1B to Canada Immigration',
    members: '50K+',
    title: '📢 For H-1B holders moving to Canada: Tax calculator for US RSUs',
    url: 'https://taxbridge.app?utm_source=facebook&utm_medium=group&utm_campaign=ph_launch&utm_content=H1BtoCanada',
    status: 'pending'
  },
  {
    id: 12,
    time: '08:00 PM',
    platform: 'Facebook',
    community: 'Tech Workers Immigration',
    members: '75K+',
    title: '📢 For H-1B holders moving to Canada: Tax calculator for US RSUs',
    url: 'https://taxbridge.app?utm_source=facebook&utm_medium=group&utm_campaign=ph_launch&utm_content=TechWorkersImmigration',
    status: 'pending'
  },
  {
    id: 13,
    time: '09:00 PM',
    platform: 'LinkedIn',
    community: 'Vancouver Tech Community',
    members: '30K+',
    title: '🚀 Launched a cross-border tax calculator today (Product Hunt)',
    url: 'https://taxbridge.app?utm_source=linkedin&utm_medium=group&utm_campaign=ph_launch&utm_content=VancouverTech',
    status: 'pending'
  },
  {
    id: 14,
    time: '09:15 PM',
    platform: 'LinkedIn',
    community: 'Toronto Tech',
    members: '25K+',
    title: '🚀 Launched a cross-border tax calculator today (Product Hunt)',
    url: 'https://taxbridge.app?utm_source=linkedin&utm_medium=group&utm_campaign=ph_launch&utm_content=TorontoTech',
    status: 'pending'
  },
  {
    id: 15,
    time: '08:00 PM',
    platform: 'Reddit',
    community: 'r/tax',
    members: '150K+',
    title: 'Built a cross-border tax calculator (US-Canada) after overpaying $12K on RSUs',
    url: 'https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=tax',
    status: 'pending'
  }
];

// Product Hunt URL placeholder
export const PRODUCT_HUNT_URL = 'https://www.producthunt.com/posts/taxbridge';

// Generate tracking CSV
export function generateTrackingCSV(): string {
  const headers = [
    'ID',
    'Time (PST)',
    'Platform',
    'Community',
    'Members',
    'Title',
    'URL',
    'Status',
    'Upvotes',
    'Comments',
    'Clicks',
    'Posted At',
    'Notes'
  ];

  const rows = COMMUNITY_POSTS.map(post => [
    post.id,
    post.time,
    post.platform,
    post.community,
    post.members,
    `"${post.title}"`,
    post.url,
    post.status,
    post.upvotes || '',
    post.comments || '',
    post.clicks || '',
    post.postedAt || '',
    `"${post.notes || ''}"`
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

// Generate Markdown checklist
export function generateMarkdownChecklist(): string {
  let markdown = '# 🚀 Launch Day Community Posting Checklist\n\n';
  markdown += `**Product Hunt URL**: ${PRODUCT_HUNT_URL}\n\n`;
  markdown += '**Instructions**: Post to each community at the scheduled time. Respond to ALL comments within 15 minutes.\n\n';
  markdown += '---\n\n';

  COMMUNITY_POSTS.forEach(post => {
    markdown += `## ${post.time} - ${post.community}\n\n`;
    markdown += `- [ ] **Posted** (${post.platform})\n`;
    markdown += `- [ ] **Responded to comments** (within 15 min)\n`;
    markdown += `- **Members**: ${post.members}\n`;
    markdown += `- **Title**: ${post.title}\n`;
    markdown += `- **URL**: ${post.url}\n`;
    markdown += `- **Tracking**: Upvotes: ___ | Comments: ___ | Clicks: ___\n\n`;
  });

  markdown += '---\n\n';
  markdown += '## Success Metrics\n\n';
  markdown += '- [ ] 15 posts published ✅\n';
  markdown += '- [ ] 200+ upvotes across communities\n';
  markdown += '- [ ] 500+ UTM-tagged clicks in PostHog\n';
  markdown += '- [ ] 100% response rate to comments (within 15 min)\n';
  markdown += '- [ ] 50+ signups from community traffic\n\n';

  return markdown;
}

// Save tracking files
export function saveTrackingFiles() {
  const outputDir = path.join(process.cwd(), 'docs');

  // Save CSV
  const csvPath = path.join(outputDir, 'LAUNCH_DAY_TRACKING.csv');
  fs.writeFileSync(csvPath, generateTrackingCSV());
  console.log(`✅ CSV tracker saved: ${csvPath}`);

  // Save Markdown checklist
  const mdPath = path.join(outputDir, 'LAUNCH_DAY_CHECKLIST.md');
  fs.writeFileSync(mdPath, generateMarkdownChecklist());
  console.log(`✅ Markdown checklist saved: ${mdPath}`);
}

// CLI execution
if (require.main === module) {
  console.log('🚀 Generating Launch Day Tracking Files...\n');
  saveTrackingFiles();
  console.log('\n✅ All tracking files generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Open docs/LAUNCH_DAY_CHECKLIST.md');
  console.log('2. Post to each community at scheduled time');
  console.log('3. Track metrics in docs/LAUNCH_DAY_TRACKING.csv');
  console.log('4. Monitor PostHog for UTM-tagged clicks\n');
}
