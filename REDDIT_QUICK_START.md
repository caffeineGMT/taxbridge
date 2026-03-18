# Reddit Organic Growth - Quick Start Guide

Get your Reddit automation running in 15 minutes.

## Step 1: Create Reddit Account (5 min)

1. Go to https://www.reddit.com/register
2. Create account:
   - **Username:** TaxBridgeApp (or your preferred name)
   - **Email:** Your business email
   - **Password:** Strong password
3. Verify email
4. Complete profile (optional but recommended)

## Step 2: Create Reddit App (5 min)

1. Go to https://www.reddit.com/prefs/apps
2. Scroll to bottom, click **"Create App"** or **"Create Another App"**
3. Fill in form:
   - **Name:** TaxBridge Bot
   - **Type:** Select **"script"**
   - **Description:** Cross-border tax guidance automation
   - **About URL:** https://taxbridge.app
   - **Redirect URI:** http://localhost:8080
4. Click **"Create app"**
5. **Copy credentials:**
   - **Client ID:** The string under "personal use script" (14 characters)
   - **Client Secret:** The longer string labeled "secret"

## Step 3: Configure Environment (2 min)

Add to your `.env.local` file:

```bash
# Reddit API Configuration
REDDIT_CLIENT_ID=paste_your_client_id_here
REDDIT_CLIENT_SECRET=paste_your_client_secret_here
REDDIT_USERNAME=TaxBridgeApp
REDDIT_PASSWORD=your_reddit_password

# User agent (change version as needed)
REDDIT_USER_AGENT=TaxBridge:v1.0.0 (by /u/TaxBridgeApp)

# Anthropic API (already configured)
ANTHROPIC_API_KEY=sk-ant-api03-...

# App URL (already configured)
NEXT_PUBLIC_APP_URL=https://taxbridge.app
```

## Step 4: Initialize Database (1 min)

```bash
npm run db:migrate:reddit
```

Expected output:
```
✅ Reddit schema created successfully
✅ Seeded 25 keyword-subreddit combinations
```

## Step 5: Test the System (2 min)

```bash
npm run reddit:monitor
```

This will:
1. Search 4 subreddits for target keywords
2. Generate AI comment drafts for relevant posts
3. Save drafts for your review

Expected output:
```
🔍 Starting Reddit keyword monitoring...
📍 Checking r/h1b for keywords...
📍 Checking r/ImmigrationCanada for keywords...
✅ Discovered 3 new relevant posts
🤖 Generating AI-powered comment drafts...
✅ Created 3 comment drafts for review
```

## Step 6: Review & Approve Comments

```bash
npm run reddit:review-drafts
```

Interactive review process:
- See post title, subreddit, comment preview
- Type `a` to approve (will post to Reddit)
- Type `r` to reject (won't post)
- Type `s` to skip (review later)
- Type `q` to quit

## Step 7: Post Approved Comments

```bash
npm run reddit:post-comments
```

This posts all approved comments with 10-minute delays between each.

## Step 8: View Dashboard

```bash
npm run reddit:dashboard
```

See:
- Account karma status
- Posts monitored
- Comment performance
- Conversion metrics

## Daily Workflow

### Option A: Fully Automated (Recommended)

Run the automation scheduler:

```bash
npm run reddit:automation
```

This runs continuously:
- **Every 2 hours:** Monitor keywords + generate drafts
- **Every 6 hours:** Post approved comments
- **Daily at 9 AM:** Update metrics

Keep running in background with PM2:
```bash
npm install -g pm2
pm2 start "npm run reddit:automation" --name reddit-bot
pm2 save
```

### Option B: Manual Control

Run these commands as needed:

```bash
# Morning routine (9 AM)
npm run reddit:monitor          # Find new posts
npm run reddit:review-drafts    # Review and approve
npm run reddit:post-comments    # Post approved

# Evening routine (6 PM)
npm run reddit:monitor          # Find more posts
npm run reddit:review-drafts    # Review and approve
npm run reddit:dashboard        # Check performance

# Weekly
npm run reddit:update-metrics   # Update karma tracking
```

## Monthly Task: Generate Ultimate Guide

Once per quarter (4 guides/year):

```bash
npm run reddit:generate-guide
```

1. Choose target subreddit
2. AI generates 800-1200 word guide
3. Review and edit
4. Post manually to Reddit (with infographic if available)

## Monitoring Success

### Week 1-4: Build Karma
- Target: 100+ comment karma
- Target: 30+ day account age
- Focus: Genuinely helpful comments
- Link inclusion: 0-25% (build trust first)

### Week 5-8: Ramp Up
- Target: 5-10 comments/day
- Link inclusion: 50%
- Monitor UTM tracking in PostHog
- Track comment→click→signup funnel

### Month 3+: Optimize
- Target: 10-15% CTR (comment → click)
- Target: 5-10% conversion (click → signup)
- Goal: 50 comments → 5-7 clicks → 1 signup

## Troubleshooting

### "Invalid credentials"
- Check client ID and secret are correct
- Verify username/password match Reddit account
- Ensure no extra spaces in .env.local

### "No posts discovered"
- Check target subreddits are active
- Keywords may be too specific (add more via database)
- Try different time of day (peak posting hours)

### "Rate limited"
- Respect 10-minute delays between comments
- Don't exceed 10 comments/day initially
- Reddit may rate limit new accounts more aggressively

### "Comments are too promotional"
- Adjust AI prompts in `lib/reddit/comment-generator.ts`
- Manually edit drafts before approval
- Reduce link inclusion percentage

## Production Deployment

Use GitHub Actions for free automation:

1. Add secrets to GitHub repository:
   - `REDDIT_CLIENT_ID`
   - `REDDIT_CLIENT_SECRET`
   - `REDDIT_USERNAME`
   - `REDDIT_PASSWORD`
   - `ANTHROPIC_API_KEY`

2. Workflow runs automatically every 2 hours
3. No server required
4. Free on GitHub (2000 minutes/month)

See `REDDIT_ORGANIC_GROWTH_IMPLEMENTATION.md` for full deployment guide.

## Support

Questions or issues? Check the main documentation:
- `REDDIT_ORGANIC_GROWTH_IMPLEMENTATION.md` - Complete system overview
- `lib/reddit/` - Source code with inline comments

## Next Steps

1. ✅ Run first test: `npm run reddit:monitor`
2. ✅ Review drafts: `npm run reddit:review-drafts`
3. ✅ Post comments: `npm run reddit:post-comments`
4. ✅ Start automation: `npm run reddit:automation`
5. 📊 Track in PostHog (UTM: `utm_source=reddit`)
6. 📚 Generate first Ultimate Guide (after 30 days)

**Goal:** 100+ signups from Reddit organic growth in first 6 months 🚀
