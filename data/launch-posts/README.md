# Launch Day Community Posting

This directory contains all 15 community posts for the TaxBridge Product Hunt launch.

## Quick Start

1. **Initialize tracking database:**
   ```bash
   npm run launch:init
   ```

2. **Review launch schedule:**
   ```bash
   cat data/launch-posts/SCHEDULE.md
   ```

3. **Post according to schedule** (see SCHEDULE.md for timeline)

4. **Mark each post as posted:**
   ```bash
   npm run launch:mark-posted <POST_ID> <POST_URL>
   ```

5. **Monitor engagement and update metrics:**
   ```bash
   npm run launch:update-metrics <POST_ID>
   ```

6. **View real-time dashboard:**
   ```bash
   npm run launch:dashboard
   ```

## Directory Structure

```
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
```

## NPM Scripts

Add these to package.json:

```json
{
  "scripts": {
    "launch:init": "tsx scripts/community-posting/execute-launch.ts",
    "launch:mark-posted": "tsx scripts/community-posting/mark-posted.ts",
    "launch:update-metrics": "tsx scripts/community-posting/update-metrics.ts",
    "launch:dashboard": "tsx scripts/community-posting/dashboard.ts",
    "launch:check-responses": "tsx scripts/community-posting/check-responses.ts"
  }
}
```

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
1. **Export metrics:** `npm run launch:export-metrics`
2. **Analyze performance:** Review which platforms drove most traffic
3. **Follow up:** Continue responding to comments for 48-72 hours
4. **Document learnings:** What worked, what didn't

---

**Questions?** Check the main playbook: `docs/COMMUNITY_POSTING_PLAYBOOK.md`
