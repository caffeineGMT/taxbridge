#!/usr/bin/env tsx
// Social media content management CLI
// Usage: npx tsx scripts/social-media-content.ts [command]
// Commands: list, calendar, script <id>, export, stats

import { VIDEO_SCRIPTS, POSTING_SCHEDULE, CONTENT_CATEGORIES, HASHTAG_SETS, INFLUENCER_TARGETS } from '../lib/social-media/video-scripts';
import { GROWTH_TARGETS, SOCIAL_PROFILES, BIO_LINKS, buildUTMLink } from '../lib/social-media/analytics-tracker';
import { generateContentCalendar, CONTENT_PILLARS, PRODUCTION_WORKFLOW } from '../lib/social-media/content-calendar';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const command = args[0] || 'list';

function main() {
  switch (command) {
    case 'list':
      listScripts();
      break;
    case 'calendar':
      showCalendar();
      break;
    case 'script':
      showScript(args[1]);
      break;
    case 'export':
      exportScripts();
      break;
    case 'stats':
      showStats();
      break;
    case 'setup':
      showSetupGuide();
      break;
    default:
      console.log(`
Social Media Content Manager for TaxBridge
==========================================

Commands:
  list              List all video scripts
  calendar          Show 12-week content calendar
  script <id>       View a specific script in full
  export            Export all scripts to markdown
  stats             Show content statistics
  setup             Show account setup guide

Examples:
  npx tsx scripts/social-media-content.ts list
  npx tsx scripts/social-media-content.ts script ftc-explained
  npx tsx scripts/social-media-content.ts export
      `);
  }
}

function listScripts() {
  console.log('\n=== VIDEO SCRIPTS ===\n');
  console.log(`Total: ${VIDEO_SCRIPTS.length} scripts\n`);

  const grouped: Record<string, typeof VIDEO_SCRIPTS> = {};
  for (const script of VIDEO_SCRIPTS) {
    if (!grouped[script.category]) grouped[script.category] = [];
    grouped[script.category].push(script);
  }

  for (const [category, scripts] of Object.entries(grouped)) {
    const cat = CONTENT_CATEGORIES[category as keyof typeof CONTENT_CATEGORIES];
    console.log(`\n--- ${cat.label} (${scripts.length} scripts) ---`);
    for (const script of scripts) {
      console.log(`  [${script.id}] ${script.title} (${script.difficulty}, ${script.estimatedDuration}s)`);
    }
  }
}

function showCalendar() {
  const today = new Date().toISOString().split('T')[0];
  const calendar = generateContentCalendar(today);

  console.log('\n=== 12-WEEK CONTENT CALENDAR ===\n');
  console.log(`Starting: ${today}`);
  console.log(`Schedule: ${POSTING_SCHEDULE.days.join(', ')}\n`);

  for (const week of calendar) {
    console.log(`\nWeek ${week.weekNumber} (${week.startDate})`);
    console.log('-'.repeat(60));
    for (const post of week.posts) {
      const platform = post.platform === 'both' ? 'IG+TT' : post.platform === 'instagram' ? 'IG' : 'TT';
      console.log(`  ${post.dayOfWeek.padEnd(10)} [${platform.padEnd(5)}] ${post.script.title}`);
    }
  }
}

function showScript(scriptId: string) {
  if (!scriptId) {
    console.log('Usage: npx tsx scripts/social-media-content.ts script <script-id>');
    console.log('Run "list" to see available script IDs.');
    return;
  }

  const script = VIDEO_SCRIPTS.find(s => s.id === scriptId);
  if (!script) {
    console.log(`Script "${scriptId}" not found. Run "list" to see available IDs.`);
    return;
  }

  console.log(`
╔══════════════════════════════════════════════════════════════╗
  ${script.title}
  Category: ${CONTENT_CATEGORIES[script.category].label} | Duration: ${script.estimatedDuration}s | Level: ${script.difficulty}
╚══════════════════════════════════════════════════════════════╝

🎬 HOOK (First 3 seconds - stop the scroll):
"${script.hook}"

📝 BODY (Main content - 45 seconds):
${script.body}

📣 CTA (Call to Action - last 10 seconds):
"${script.cta}"

📋 CAPTION OPTIONS:
${script.captions.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}

# HASHTAGS:
${script.hashtags.join(' ')}

🎯 Target Audience: ${script.targetAudience.join(', ')}
${script.props ? `\n🎨 Visual Props:\n${script.props.map(p => `  - ${p}`).join('\n')}` : ''}
${script.bRollSuggestions ? `\n🎥 B-Roll:\n${script.bRollSuggestions.map(b => `  - ${b}`).join('\n')}` : ''}
  `);
}

function exportScripts() {
  const outputDir = path.join(process.cwd(), 'content', 'social-media');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Export each script as a markdown file
  for (const script of VIDEO_SCRIPTS) {
    const content = `# ${script.title}

**Category:** ${CONTENT_CATEGORIES[script.category].label}
**Duration:** ${script.estimatedDuration} seconds
**Difficulty:** ${script.difficulty}
**Target Audience:** ${script.targetAudience.join(', ')}

---

## Hook (First 3 seconds)

> ${script.hook}

## Body (45 seconds)

${script.body}

## Call to Action (Last 10 seconds)

> ${script.cta}

---

## Caption Options

${script.captions.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## Hashtags

${script.hashtags.join(' ')}

${script.props ? `## Visual Props\n\n${script.props.map(p => `- ${p}`).join('\n')}` : ''}

${script.bRollSuggestions ? `## B-Roll Suggestions\n\n${script.bRollSuggestions.map(b => `- ${b}`).join('\n')}` : ''}
`;

    const filepath = path.join(outputDir, `${script.id}.md`);
    fs.writeFileSync(filepath, content);
    console.log(`Exported: ${filepath}`);
  }

  // Export content calendar
  const today = new Date().toISOString().split('T')[0];
  const calendar = generateContentCalendar(today);
  let calendarMd = `# Content Calendar\n\nGenerated: ${today}\nSchedule: ${POSTING_SCHEDULE.days.join(', ')}\n\n`;

  for (const week of calendar) {
    calendarMd += `## Week ${week.weekNumber} (${week.startDate})\n\n`;
    calendarMd += `| Day | Platform | Script | Time |\n`;
    calendarMd += `|-----|----------|--------|------|\n`;
    for (const post of week.posts) {
      calendarMd += `| ${post.dayOfWeek} | ${post.platform} | ${post.script.title} | ${post.time} |\n`;
    }
    calendarMd += '\n';
  }

  fs.writeFileSync(path.join(outputDir, 'content-calendar.md'), calendarMd);
  console.log(`\nExported content calendar to ${outputDir}/content-calendar.md`);
  console.log(`\nTotal files exported: ${VIDEO_SCRIPTS.length + 1}`);
}

function showStats() {
  console.log('\n=== CONTENT STATISTICS ===\n');
  console.log(`Total Scripts: ${VIDEO_SCRIPTS.length}`);
  console.log(`Posts per Week: ${POSTING_SCHEDULE.days.length}`);
  console.log(`Weeks of Content: ${Math.floor(VIDEO_SCRIPTS.length / POSTING_SCHEDULE.days.length)}`);

  console.log('\n--- By Category ---');
  for (const [key, cat] of Object.entries(CONTENT_CATEGORIES)) {
    const count = VIDEO_SCRIPTS.filter(s => s.category === key).length;
    console.log(`  ${cat.label}: ${count} scripts`);
  }

  console.log('\n--- By Difficulty ---');
  for (const diff of ['beginner', 'intermediate', 'advanced'] as const) {
    const count = VIDEO_SCRIPTS.filter(s => s.difficulty === diff).length;
    console.log(`  ${diff}: ${count} scripts`);
  }

  console.log('\n--- Content Pillars ---');
  for (const pillar of CONTENT_PILLARS) {
    console.log(`  ${pillar.name}: ${pillar.percentage}% (${pillar.scripts.length} scripts)`);
  }

  console.log('\n--- Growth Targets ---');
  const m6 = GROWTH_TARGETS.find(t => t.month === 6);
  const m12 = GROWTH_TARGETS.find(t => t.month === 12);
  console.log(`  Month 6: ${m6?.targetFollowers.toLocaleString()} followers, ${m6?.targetBioClickRate}% bio CTR`);
  console.log(`  Month 12: ${m12?.targetFollowers.toLocaleString()} followers, ${m12?.targetBioClickRate}% bio CTR`);

  console.log('\n--- Influencer Targets ---');
  for (const inf of INFLUENCER_TARGETS) {
    console.log(`  ${inf.handle} (${inf.platform}, ${inf.followers}, ${inf.priority} priority)`);
  }

  console.log('\n--- Bio Links ---');
  console.log(`  Instagram: ${BIO_LINKS.instagram.url}`);
  console.log(`  TikTok: ${BIO_LINKS.tiktok.url}`);

  console.log('\n--- UTM Links ---');
  console.log(`  IG Bio: ${buildUTMLink('https://taxbridge.app/rsu', 'instagram', 'ig_bio_link')}`);
  console.log(`  TT Bio: ${buildUTMLink('https://taxbridge.app/rsu', 'tiktok', 'tt_bio_link')}`);
}

function showSetupGuide() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
  INSTAGRAM & TIKTOK ACCOUNT SETUP GUIDE
╚══════════════════════════════════════════════════════════════╝

=== INSTAGRAM SETUP ===

1. Create Business Account:
   Handle: ${SOCIAL_PROFILES.instagram.handle}
   Name: ${SOCIAL_PROFILES.instagram.displayName}
   Category: ${SOCIAL_PROFILES.instagram.category}

2. Bio (copy-paste):
${SOCIAL_PROFILES.instagram.bio}

3. Bio Link:
   URL: ${BIO_LINKS.instagram.url}
   Display: ${BIO_LINKS.instagram.displayText}

4. Profile Picture: ${SOCIAL_PROFILES.instagram.profilePicture}

=== TIKTOK SETUP ===

1. Create Business Account:
   Handle: ${SOCIAL_PROFILES.tiktok.handle}
   Name: ${SOCIAL_PROFILES.tiktok.displayName}
   Category: ${SOCIAL_PROFILES.tiktok.category}

2. Bio (copy-paste):
${SOCIAL_PROFILES.tiktok.bio}

3. Bio Link:
   URL: ${BIO_LINKS.tiktok.url}
   Display: ${BIO_LINKS.tiktok.displayText}

4. Profile Picture: ${SOCIAL_PROFILES.tiktok.profilePicture}

=== EQUIPMENT CHECKLIST ===
${PRODUCTION_WORKFLOW.equipment.map(e => `  [ ] ${e}`).join('\n')}

=== EDITING TOOLS ===
${PRODUCTION_WORKFLOW.editingTools.map(t => `  [ ] Install: ${t}`).join('\n')}

=== POSTING SCHEDULE ===
${POSTING_SCHEDULE.days.map(d => {
  const dk = d as keyof typeof POSTING_SCHEDULE.bestTimes.instagram;
  return `  ${d}: IG @ ${POSTING_SCHEDULE.bestTimes.instagram[dk]} | TT @ ${POSTING_SCHEDULE.bestTimes.tiktok[dk]}`;
}).join('\n')}

=== FIRST WEEK CONTENT ===
  Tuesday: "What is Foreign Tax Credit?" (both platforms)
  Thursday: "H-1B RSU Taxation Explained" (Instagram)
  Saturday: "Common Mistakes Filing Dual Taxes" (TikTok)

=== KEY METRICS TO TRACK ===
  - Follower count (weekly)
  - Profile visits (weekly)
  - Bio link clicks (per post)
  - Video views, likes, comments, shares, saves
  - Completion rate (avg watch time / video length)
  - Website signups from utm_source=instagram/tiktok
  `);
}

main();
