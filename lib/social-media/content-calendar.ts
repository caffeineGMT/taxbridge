// Content calendar management for Instagram/TikTok posting schedule
// 3x/week posting cadence with seasonal adjustments

import { VIDEO_SCRIPTS, VideoScript, POSTING_SCHEDULE, CONTENT_CATEGORIES } from './video-scripts';

export interface CalendarWeek {
  weekNumber: number;
  startDate: string;
  posts: ScheduledPost[];
}

export interface ScheduledPost {
  id: string;
  date: string;
  dayOfWeek: string;
  time: string;
  script: VideoScript;
  platform: 'instagram' | 'tiktok' | 'both';
  status: 'draft' | 'script-ready' | 'filming' | 'editing' | 'scheduled' | 'posted' | 'skipped';
  notes?: string;
  repurposedFrom?: string; // blog post URL if repurposed
  collaborator?: string; // influencer handle if collab
  metrics?: PostMetrics;
}

export interface PostMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  bioClicks: number;
}

// Generate a 12-week content calendar
export function generateContentCalendar(startDate: string): CalendarWeek[] {
  const calendar: CalendarWeek[] = [];
  const start = new Date(startDate);
  const shuffledScripts = shuffleWithCategoryBalance(VIDEO_SCRIPTS);

  let scriptIndex = 0;

  for (let week = 0; week < 12; week++) {
    const weekStart = new Date(start);
    weekStart.setDate(weekStart.getDate() + week * 7);

    const posts: ScheduledPost[] = [];

    for (let dayIdx = 0; dayIdx < POSTING_SCHEDULE.days.length; dayIdx++) {
      const dayName = POSTING_SCHEDULE.days[dayIdx] as keyof typeof POSTING_SCHEDULE.bestTimes.instagram;
      const postDate = getDateForDay(weekStart, dayName);
      const script = shuffledScripts[scriptIndex % shuffledScripts.length];

      // Alternate platforms: post to both on Tuesdays, Instagram on Thursdays, TikTok on Saturdays
      let platform: 'instagram' | 'tiktok' | 'both';
      if (dayIdx === 0) platform = 'both';
      else if (dayIdx === 1) platform = 'instagram';
      else platform = 'tiktok';

      posts.push({
        id: `w${week + 1}-${dayName.toLowerCase().slice(0, 3)}`,
        date: postDate.toISOString().split('T')[0],
        dayOfWeek: dayName,
        time: POSTING_SCHEDULE.bestTimes.instagram[dayName],
        script,
        platform,
        status: 'draft',
      });

      scriptIndex++;
    }

    calendar.push({
      weekNumber: week + 1,
      startDate: weekStart.toISOString().split('T')[0],
      posts,
    });
  }

  return calendar;
}

// Ensure category balance across the calendar
function shuffleWithCategoryBalance(scripts: VideoScript[]): VideoScript[] {
  const categories = Object.keys(CONTENT_CATEGORIES);
  const grouped: Record<string, VideoScript[]> = {};

  for (const cat of categories) {
    grouped[cat] = scripts.filter(s => s.category === cat);
  }

  const result: VideoScript[] = [];
  let maxLen = Math.max(...Object.values(grouped).map(g => g.length));

  for (let i = 0; i < maxLen; i++) {
    for (const cat of categories) {
      if (i < grouped[cat].length) {
        result.push(grouped[cat][i]);
      }
    }
  }

  return result;
}

function getDateForDay(weekStart: Date, dayName: string): Date {
  const dayMap: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  };
  const target = dayMap[dayName];
  const current = weekStart.getDay();
  const diff = (target - current + 7) % 7;
  const result = new Date(weekStart);
  result.setDate(result.getDate() + diff);
  return result;
}

// Blog-to-video repurposing suggestions
export const BLOG_REPURPOSE_MAP: Record<string, string[]> = {
  'ftc-explained': ['/blog/foreign-tax-credit-guide', '/blog/us-canada-tax-treaty'],
  'h1b-rsu-taxation': ['/blog/h1b-rsu-tax-guide', '/blog/rsu-vesting-schedule-tax'],
  'common-mistakes-dual-filing': ['/blog/cross-border-tax-mistakes', '/blog/dual-filing-checklist'],
  'tn-visa-tax-traps': ['/blog/tn-visa-tax-guide', '/blog/dual-residency-explained'],
  'rrsp-401k-trap': ['/blog/401k-to-rrsp-guide', '/blog/retirement-cross-border'],
  'departure-tax-canada': ['/blog/canada-departure-tax', '/blog/deemed-disposition-guide'],
  'tfsa-us-tax': ['/blog/tfsa-us-tax-implications', '/blog/foreign-trust-reporting'],
  'tax-season-checklist': ['/blog/cross-border-filing-checklist', '/blog/tax-deadlines-us-canada'],
};

// Video production workflow
export const PRODUCTION_WORKFLOW = {
  steps: [
    { name: 'Script Review', duration: '15 min', description: 'Review and personalize the script template' },
    { name: 'Setup', duration: '10 min', description: 'Camera, lighting, background. Ring light + clean background' },
    { name: 'Record', duration: '20 min', description: 'Film 2-3 takes of the 60-second script' },
    { name: 'Edit', duration: '30 min', description: 'Add captions, on-screen text, b-roll, music' },
    { name: 'Captions', duration: '10 min', description: 'Generate and verify auto-captions' },
    { name: 'Schedule', duration: '5 min', description: 'Upload to scheduling tool with hashtags and description' },
  ],
  totalTime: '90 minutes per video',
  batchTip: 'Film 3 videos in one session (Tuesday batch) to save 30 minutes on setup',
  equipment: [
    'iPhone 14+ or similar (4K capable)',
    'Ring light or window lighting',
    'Lavalier microphone ($20-50)',
    'Tripod or phone mount',
    'Clean, professional background (bookshelf or plain wall)',
  ],
  editingTools: [
    'CapCut (free, great for Reels/TikTok)',
    'InShot (mobile editing)',
    'Descript (AI captions and editing)',
  ],
};

// Content pillars for consistent branding
export const CONTENT_PILLARS = [
  {
    name: 'Tax Education',
    percentage: 40,
    description: 'Core explainer content on cross-border tax concepts',
    scripts: VIDEO_SCRIPTS.filter(s => ['tax-basics', 'rsu-deep-dive'].includes(s.category)),
  },
  {
    name: 'Mistake Prevention',
    percentage: 25,
    description: 'Common mistakes and myth-busting content',
    scripts: VIDEO_SCRIPTS.filter(s => ['common-mistakes', 'myth-busters'].includes(s.category)),
  },
  {
    name: 'Actionable Tips',
    percentage: 20,
    description: 'Quick tips and seasonal planning advice',
    scripts: VIDEO_SCRIPTS.filter(s => ['quick-tips', 'seasonal'].includes(s.category)),
  },
  {
    name: 'Immigration Intersection',
    percentage: 15,
    description: 'Where immigration status meets tax obligations',
    scripts: VIDEO_SCRIPTS.filter(s => ['immigration-tax', 'canada-specific'].includes(s.category)),
  },
];
