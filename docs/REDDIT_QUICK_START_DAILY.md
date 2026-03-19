# Reddit Daily Engagement - Quick Start Guide

**Campaign:** Reddit Growth Sprint - 10 comments/day
**Goal:** Drive calculator completions and paid conversions through authentic engagement
**Duration:** Ongoing (starting March 19, 2026)

---

## Morning Routine (30 minutes)

### Step 1: Check Today's Plan (2 min)
```bash
npm run reddit:daily
```

This shows:
- ✅ Today's progress (X/10 comments)
- 🎯 Primary subreddit focus
- 🔍 Search keywords
- 📝 Recommended use cases

### Step 2: Find Relevant Posts (10 min)

**Method A: Reddit Search (Manual)**
1. Open today's primary subreddit (shown in daily brief)
2. Sort by "New"
3. Scan for keywords: tax, RSU, layoff, Canada, visa, etc.
4. Bookmark 5-10 posts to comment on

**Method B: Google Search (Better)**
Use these search queries in Google (replace [keyword] with today's focus):

```
site:reddit.com/r/h1b "RSU tax" OR "stock compensation" after:2026-03-18
site:reddit.com/r/cscareerquestions "offer" OR "total comp" after:2026-03-18
site:reddit.com/r/tax "Foreign Tax Credit" OR "Canada" after:2026-03-18
```

### Step 3: Write 5-8 Comments (18 min)

**For each post:**
1. Read the full post and context
2. Match to a use case from `docs/REDDIT_CALCULATOR_USE_CASES.md`
3. Write 150-300 word helpful comment
4. Include calculator link (50% of comments only)
5. Use correct UTM tracking link for that subreddit

**Quality checklist before posting:**
- ✅ Answers their specific question
- ✅ At least 150 words of value
- ✅ Calculator link is contextually relevant (not forced)
- ✅ Would be helpful even without the link

### Step 4: Log Your Comments (2-3 min)

After posting each comment:
```bash
npm run reddit:log
```

Enter:
- Subreddit (e.g., r/h1b)
- Use Case # (e.g., 1.1)
- Post URL
- UTM link (if included)
- Comment preview (first 50 chars)

---

## Midday Check-In (15 minutes)

### 12:00pm - Reply to Comments

1. Check Reddit inbox
2. Respond to ALL replies on your comments (within 24 hours = algorithm boost)
3. Upvote helpful responses from others
4. Continue conversation threads (builds reputation)

**DO NOT:**
- ❌ Ignore replies (looks like spam)
- ❌ Give one-word responses
- ❌ Argue with critics (thank them for feedback instead)

---

## Evening Wrap-Up (15 minutes)

### 5:00pm - Final Engagement

1. Check inbox again, reply to new comments
2. Post 1-2 final comments if below daily target
3. Check progress:

```bash
npm run reddit:stats
```

4. Update metrics:

```bash
npm run reddit:metrics
```

---

## Weekly Planning

### Monday Morning
- Review last week's metrics
- Identify top-performing content
- Adjust strategy based on data

### Friday Evening
- Export PostHog data (Reddit traffic)
- Calculate ROI (time spent vs conversions)
- Plan next week's focus areas

---

## Quick Reference: UTM Links by Subreddit

**r/cscareerquestions:**
```
https://taxbridgecpa.com?utm_source=reddit&utm_medium=organic&utm_campaign=reddit-growth-q1-2026&utm_term=cscareerquestions&utm_content=comment-helpful-reply
```

**r/h1b:**
```
https://taxbridgecpa.com?utm_source=reddit&utm_medium=organic&utm_campaign=reddit-growth-q1-2026&utm_term=h1b&utm_content=comment-helpful-reply
```

**r/tax:**
```
https://taxbridgecpa.com?utm_source=reddit&utm_medium=organic&utm_campaign=reddit-growth-q1-2026&utm_term=tax&utm_content=comment-helpful-reply
```

**r/ImmigrationCanada:**
```
https://taxbridgecpa.com?utm_source=reddit&utm_medium=organic&utm_campaign=reddit-growth-q1-2026&utm_term=ImmigrationCanada&utm_content=comment-helpful-reply
```

**r/personalfinance:**
```
https://taxbridgecpa.com?utm_source=reddit&utm_medium=organic&utm_campaign=reddit-growth-q1-2026&utm_term=personalfinance&utm_content=comment-helpful-reply
```

---

## Success Metrics

**Daily Targets:**
- ✅ 10 comments posted (weekdays)
- ✅ 5 calculator links shared
- ✅ <60 minutes total time
- ✅ 100% reply rate to your comments

**Weekly Targets:**
- ✅ 50 comments posted
- ✅ 25 calculator links
- ✅ 37+ calculator clicks (30% CTR)
- ✅ 11+ calculator completions
- ✅ 1+ signups from Reddit

**Check progress:**
```bash
npm run reddit:metrics
```

---

## Common Scenarios & Responses

### "This looks like spam"
**Response:**
> Fair point - I'm trying to be helpful, not promotional. I built this calculator for my own use and found it useful for this exact situation. Happy to answer your question without any links if you prefer.

**Action:** Reduce link frequency for 48 hours in that subreddit

### Post removed by mods
**Action:**
1. Check modmail for reason
2. Apologize and ask for clarification
3. Rewrite to comply with rules
4. Build relationship with mods (contribute high-quality content)

### Shadowban suspected (zero upvotes/comments after hours)
**Check:** https://reddit.com/r/ShadowBan (post to test)

**Fix:**
- Reduce link frequency to 30%
- Engage without links for 48 hours
- Upvote others, reply to non-promotional posts
- Contact subreddit mods to confirm status

### Low engagement on comments
**Causes:**
- Not answering specific question
- Too short (<100 words)
- Too promotional (link-first, value-second)
- Off-peak posting time

**Fix:**
- Write longer, more detailed responses
- Post during peak hours (8-10am ET, 6-9pm ET)
- Provide value FIRST, link SECOND

---

## Anti-Spam Rules

✅ **DO:**
- Answer specific questions with detailed responses
- Provide value BEFORE linking to calculator
- Keep link frequency <50% of comments
- Build reputation with no-link comments
- Respond to ALL replies on your comments

❌ **DON'T:**
- Copy-paste same comment across posts
- Post link without context
- Ignore subreddit rules
- Engage only on promotional opportunities
- Use fake accounts or bots

---

## Files & Resources

**Documentation:**
- `docs/REDDIT_CALCULATOR_USE_CASES.md` - Ready-to-post examples
- `docs/REDDIT_POST_TEMPLATES.md` - Long-form post templates
- `docs/REDDIT_GROWTH_PLAYBOOK.md` - Full strategy guide
- `docs/REDDIT_DAILY_CHECKLIST.md` - 5-day campaign checklist

**Scripts:**
- `npm run reddit:daily` - Show today's plan
- `npm run reddit:log` - Log a comment
- `npm run reddit:metrics` - View campaign metrics
- `npm run reddit:stats` - Today's progress

**Analytics:**
- PostHog: https://app.posthog.com (filter by utm_source=reddit)
- Local dashboard: http://localhost:3000/analytics/reddit

---

## Troubleshooting

**"I don't have time for 10 comments/day"**
- Reduce to 5 comments/day (still 25/week)
- Focus on high-value posts only
- Use templates from use cases doc (faster)
- Batch work: 3 comments Mon/Wed/Fri

**"I'm running out of things to say"**
- Review `REDDIT_CALCULATOR_USE_CASES.md` for new angles
- Search for different keywords
- Expand to adjacent subreddits (r/PersonalFinanceCanada, r/tax)
- Repurpose old comments for new questions (don't copy-paste, rewrite)

**"Calculator CTR is low"**
- Provide more value before linking (2-3 paragraphs minimum)
- Make link contextual ("I used this when I was planning my move...")
- Test different CTAs ("Run the numbers here" vs "Calculator" vs "Free tool")

**"No conversions yet"**
- Check 30-day attribution window (conversions lag traffic)
- Verify UTM tracking is working (check PostHog)
- Focus on high-intent keywords ("tax calculator", "how much tax")
- Double down on subreddits with highest calculator completion rate

---

## Daily Workflow TL;DR

**8:00am (30 min):**
1. `npm run reddit:daily` - See today's plan
2. Open primary subreddit, sort by "New"
3. Write 5-8 helpful comments
4. `npm run reddit:log` for each comment

**12:00pm (15 min):**
5. Reply to ALL comments on your posts
6. Upvote helpful content from others

**5:00pm (15 min):**
7. Final engagement sweep
8. `npm run reddit:metrics` - Check progress

**Total time:** 60 minutes/day
**Output:** 10 comments, 5 calculator links, authentic engagement

---

**Let's drive 100+ calculator completions from Reddit! 🚀**
