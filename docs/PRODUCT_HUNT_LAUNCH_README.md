# Product Hunt Launch Package - README

Complete guide to launching TaxBridge on Product Hunt with target of 500+ upvotes.

---

## Quick Start (15-Minute Overview)

### What You Have

✅ **Complete launch guide** (PRODUCT_HUNT_LAUNCH.md)
✅ **Demo video script** (DEMO_VIDEO_SCRIPT.md)
✅ **Social media templates** (SOCIAL_MEDIA_TEMPLATES.md)
✅ **Hunter outreach templates** (HUNTER_OUTREACH_TEMPLATES.md)
✅ **Hour-by-hour timeline** (LAUNCH_DAY_TIMELINE.md)
✅ **Screenshot capture tool** (`npm run capture:screenshots`)

### What You Need to Do

1. **Set launch date** (Tuesday or Wednesday, 2-3 weeks from now)
2. **Capture screenshots** (8-10 high-quality images)
3. **Record demo video** (60-90 seconds)
4. **Find a hunter** (or prepare to self-hunt)
5. **Prepare social posts** (templates provided)
6. **Launch and stay active** (12+ hours)

---

## File Guide

### Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `PRODUCT_HUNT_LAUNCH.md` | Master guide with strategy, assets, checklist | Read first for overview |
| `DEMO_VIDEO_SCRIPT.md` | Script, tips, and recording guide for demo video | When recording video |
| `SOCIAL_MEDIA_TEMPLATES.md` | Pre-written Twitter, LinkedIn, Reddit posts | Copy/paste on launch day |
| `HUNTER_OUTREACH_TEMPLATES.md` | Email/DM templates for reaching hunters | When finding a hunter |
| `LAUNCH_DAY_TIMELINE.md` | Hour-by-hour checklist for launch day | During launch (keep open) |
| `PRODUCT_HUNT_LAUNCH_README.md` | This file - quick reference guide | Start here |

### Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Screenshot capture | `npm run capture:screenshots` | Auto-capture 8 product screenshots |

---

## Launch Timeline (Big Picture)

### 3 Weeks Before Launch

**Week 1: Product Polish**
- [ ] Fix critical bugs
- [ ] Test all core features
- [ ] Optimize page load speed
- [ ] Mobile responsive check
- [ ] Set up analytics (Google Analytics, PostHog)

**Week 2: Asset Creation**
- [ ] Capture screenshots (`npm run capture:screenshots`)
- [ ] Record demo video (60-90 seconds)
- [ ] Write maker comment
- [ ] Find/confirm hunter
- [ ] Write all social posts

**Week 3: Final Prep**
- [ ] Test everything end-to-end
- [ ] Schedule social posts
- [ ] Notify network (email, DMs)
- [ ] Prepare FAQ responses
- [ ] Clear calendar for launch day

### Launch Week

**Monday** (Day before):
- [ ] Final product check
- [ ] Confirm hunter
- [ ] Prepare tracking dashboards
- [ ] Get good sleep (12+ hour day ahead)

**Tuesday** (Launch day):
- [ ] Stay online 12+ hours (6 AM - 11 PM PST)
- [ ] Follow hour-by-hour timeline
- [ ] Respond to EVERY comment within 10 minutes
- [ ] Post on Twitter, LinkedIn, Reddit, Hacker News
- [ ] Track metrics continuously

**Wednesday** (Day after):
- [ ] Respond to remaining comments
- [ ] Analyze results
- [ ] Write retrospective
- [ ] Follow up with engaged users

---

## Critical Success Factors

### 1. **Screenshots (8-10 images)**

**Priority Order**:
1. Hero/landing page (most important - first impression)
2. Tax calculator with real data
3. Dual-country tax breakdown (show FTC savings)
4. Dashboard with RSU portfolio
5. Forms checklist
6. Multi-year dashboard
7. Pricing page
8. Mobile view

**How to Capture**:
```bash
# Automated (recommended)
npm run capture:screenshots

# Manual (if script doesn't work)
# Use Chrome DevTools (Cmd+Shift+C on Mac)
# Set viewport to 1920x1080
# Screenshot each page
```

**Quality Checklist**:
- [ ] High resolution (1920x1080 or higher)
- [ ] No lorem ipsum or fake data (use realistic examples)
- [ ] Clean UI (no browser UI visible)
- [ ] Consistent branding
- [ ] Show actual product value (not just pretty design)

---

### 2. **Demo Video (60-90 seconds)**

**Script Provided**: See `DEMO_VIDEO_SCRIPT.md`

**Key Sections**:
1. Hook (0-5s): "I overpaid $12K in taxes..."
2. Problem (5-15s): Dual taxation pain
3. Solution (15-60s): Calculator demo with real data
4. CTA (60-75s): Pricing + URL

**Recording Options**:
- **Easiest**: Loom (loom.com) - Free, auto-upload
- **Professional**: OBS Studio (obsproject.com) - Free, full control
- **Mac built-in**: QuickTime - Simple, no editing

**Must-Haves**:
- [ ] Clear voiceover (or text overlays)
- [ ] Show actual product in action
- [ ] Demonstrate value (FTC savings)
- [ ] Under 90 seconds
- [ ] Captions/subtitles (many watch muted)

---

### 3. **Hunter (Optional but Recommended)**

**Why Use a Hunter?**
- Higher initial visibility
- Social proof (reputable hunter = credible product)
- Hunter's network upvotes early
- Better ranking algorithm boost

**Top Hunters to Contact**:
1. Chris Messina (@chrismessina) - Tech products
2. Kevin William David (@kwdinc) - SaaS
3. Hiten Shah (@hnshah) - B2B SaaS

**Outreach Templates**: See `HUNTER_OUTREACH_TEMPLATES.md`

**Timing**: Reach out 7 days before launch

**Backup Plan**: Self-hunt if no hunter available (still works!)

---

### 4. **Maker Comment (Post Immediately)**

**Purpose**: Your main pitch. This is what people read first.

**Structure**:
```
Hey Product Hunt! 👋

[HOOK - Personal story]
I'm Michael, and I built TaxBridge after overpaying $12K in taxes...

[PROBLEM - What you're solving]
If you're a tech worker who moved to Canada with US RSUs...

[SOLUTION - How it works]
TaxBridge calculates dual-country taxes, optimizes FTC...

[TRACTION - Social proof]
Already helping [X] customers save thousands...

[ASK - What you want]
Would love your feedback on features, pricing, positioning...
```

**Full Template**: See `PRODUCT_HUNT_LAUNCH.md` (Maker Comment section)

**Timing**: Post within 2 minutes of product going live

---

### 5. **Social Media Promotion**

**Platforms to Hit**:
- Twitter (8+ tweets throughout the day)
- LinkedIn (2 posts)
- Reddit (3 subreddits: r/PersonalFinanceCanada, r/CanadianInvestor, r/ImmigrationCanada)
- Hacker News (Show HN post)

**All Posts Pre-Written**: See `SOCIAL_MEDIA_TEMPLATES.md`

**Timing Strategy**:
- 12:01 AM: Launch announcement (Twitter + LinkedIn)
- 6 AM: Reddit r/PersonalFinanceCanada
- 9 AM: Twitter (founder story)
- 12 PM: Reddit r/CanadianInvestor, Hacker News
- 3 PM: Twitter (social proof)
- 6 PM: Twitter (urgency), Reddit r/ImmigrationCanada
- 9 PM: Final push
- 11 PM: Thank you

---

### 6. **Engagement (Most Important)**

**Golden Rules**:
1. **Respond to EVERY comment** within 10 minutes
2. **Be helpful, not sales-y** (education over promotion)
3. **Ask questions back** (drive conversation)
4. **Thank supporters** (build relationships)
5. **Handle criticism gracefully** (turn critics into advocates)

**Response Template**:
```
Thanks [Name]! [Acknowledge their point]

[Answer their question or address their concern]

[Follow-up question to keep conversation going]

Happy to dive deeper on [specific topic] if helpful!
```

**Time Commitment**: 12+ hours on launch day. Clear your calendar.

---

## Launch Day Survival Guide

### Before You Start

- [ ] Sleep well (night before)
- [ ] Clear calendar (full day)
- [ ] Caffeine/snacks ready
- [ ] Laptop fully charged
- [ ] Phone charged (for mobile responses)
- [ ] Open tabs ready:
  - Product Hunt (your product page)
  - Twitter (to post)
  - LinkedIn (to post)
  - Reddit (r/PersonalFinanceCanada, r/CanadianInvestor, r/ImmigrationCanada)
  - Hacker News
  - Google Analytics (track traffic)
  - Stripe Dashboard (track conversions)

### During Launch

**Keep These Open**:
1. `LAUNCH_DAY_TIMELINE.md` (hour-by-hour guide)
2. `SOCIAL_MEDIA_TEMPLATES.md` (copy/paste posts)
3. Product Hunt comments section (respond to everything)
4. Google Analytics (track traffic in real-time)

**Every Hour, Check**:
- [ ] Product Hunt comments (respond within 10 min)
- [ ] Product Hunt ranking (don't obsess, but monitor)
- [ ] Twitter mentions/replies
- [ ] Reddit comments
- [ ] Google Analytics traffic
- [ ] Stripe conversions

**Every 3 Hours**:
- [ ] Post new social media update
- [ ] Take 10-minute break (stretch, walk, eat)
- [ ] Reflect on what's working

---

## Success Metrics

### Primary Goals (Launch Day)

| Metric | Target | Stretch |
|--------|--------|---------|
| Upvotes | 500+ | 1,000+ |
| Ranking | #1-3 Product of Day | #1 |
| Comments | 100+ | 200+ |
| Website Traffic | 5,000 visitors | 10,000+ |
| Free Signups | 50+ | 100+ |
| Pro Conversions | 5+ | 10+ |

### Secondary Goals

- [ ] 100+ Twitter followers gained
- [ ] 50+ LinkedIn connections
- [ ] Featured in Product Hunt newsletter
- [ ] Press coverage (TechCrunch, BetaKit)

### Revenue Impact

**Conservative**:
- 5,000 visitors × 1% signup = 50 signups
- 50 signups × 10% conversion = 5 Pro customers
- 5 × $299 = $1,495 immediate revenue
- 50 signups × 30% conversion (3 months) = 15 Pro customers
- 15 × $299 = $4,485 ARR

**Optimistic**:
- 10,000 visitors × 2% signup = 200 signups
- 200 × 10% conversion = 20 Pro customers
- 20 × $299 = $5,980 immediate revenue
- 200 × 30% conversion (3 months) = 60 Pro customers
- 60 × $299 = $17,940 ARR

---

## Common Mistakes to Avoid

### 1. **Posting and Ghosting**

**Wrong**: Post at 12:01 AM, disappear until morning
**Right**: Stay online, respond to early comments immediately

### 2. **Over-Promoting**

**Wrong**: "Check out my product! Upvote please!"
**Right**: "Here's how we solve [problem]. What do you think?"

### 3. **Ignoring Criticism**

**Wrong**: Get defensive or ignore negative feedback
**Right**: "Great point. Here's our thinking... How would you improve it?"

### 4. **Focusing Only on Rank**

**Wrong**: Obsess over #1 ranking, ignore engagement
**Right**: Build relationships, have meaningful conversations

### 5. **Not Preparing Assets**

**Wrong**: Record video on launch day, rush screenshots
**Right**: All assets ready 1 week before launch

### 6. **Going Too Long**

**Wrong**: 5-minute demo video, essay-length comments
**Right**: 60-second video, concise answers

### 7. **No Follow-Up**

**Wrong**: Launch day ends, never engage again
**Right**: Continue responding for 7+ days, write retrospective

---

## Post-Launch Checklist

### Immediate (Day After)

- [ ] Respond to remaining comments
- [ ] Send thank you to hunter
- [ ] Screenshot final ranking/metrics
- [ ] Write quick thank you post (Twitter, LinkedIn)

### Week 1

- [ ] Analyze all metrics (traffic, conversions, sources)
- [ ] Write launch retrospective (blog post)
- [ ] Follow up with engaged users (DMs, emails)
- [ ] Implement quick wins from feedback

### Week 2

- [ ] Press outreach (TechCrunch, BetaKit, etc.)
- [ ] Content marketing based on questions received
- [ ] Build features requested by community
- [ ] Optimize conversion funnel based on data

### Month 1

- [ ] Track 30-day conversion rate
- [ ] Calculate ROI of launch
- [ ] Plan next growth channel
- [ ] Iterate based on user feedback

---

## Resources

### Product Hunt

- Product Hunt Homepage: https://www.producthunt.com
- Hunter Leaderboard: https://www.producthunt.com/leaderboard/hunters
- Ship (pre-launch page): https://www.producthunt.com/ship

### Video Tools

- Loom: https://loom.com (easiest)
- OBS Studio: https://obsproject.com (professional, free)
- Kapwing: https://kapwing.com (editing)

### Screenshot Tools

- CleanShot X: https://cleanshot.com (Mac, $29)
- Shottr: https://shottr.cc (Mac, free)
- Built-in: `npm run capture:screenshots`

### Social Media Scheduling

- Buffer: https://buffer.com
- Hypefury: https://hypefury.com (Twitter)
- LinkedIn Native Scheduler (built-in)

### Analytics

- Google Analytics: Track Product Hunt referral traffic
- PostHog: Product analytics
- Stripe Dashboard: Conversion tracking
- Product Hunt Stats: Built-in

---

## FAQ

### Q: When should I launch?

**A**: Tuesday, Wednesday, or Thursday. Avoid Monday (competitive), Friday (low traffic), and weekends (very low traffic).

Best time: 12:01 AM PST (Product Hunt resets).

---

### Q: Do I need a hunter?

**A**: Not required, but recommended. Hunters provide:
- Initial visibility boost
- Social proof
- Network effect (their followers upvote)

If you can't find a hunter, self-hunting still works. Focus on quality of product and engagement.

---

### Q: How long should I stay active?

**A**: Minimum 12 hours (6 AM - 6 PM PST). Ideally 16 hours (6 AM - 10 PM PST).

Product Hunt rankings are most volatile in first 12 hours. Engagement matters most.

---

### Q: What if I don't hit #1?

**A**: That's OK! Top 10 is great. Top 20 is good. Focus on:
- Quality of engagement (not just rank)
- Conversions (paying customers)
- Relationships built
- Feedback received

Many successful products launched at #15-20 and still generated strong revenue.

---

### Q: Should I use paid promotion?

**A**: No. Product Hunt prohibits paid upvotes. Focus on organic reach through:
- Social media
- Personal network
- Reddit/Hacker News (genuine, helpful posts)
- Quality product + engagement

---

### Q: How much does this cost?

**A**: $0-$500 depending on tools:

**Free**:
- Product Hunt listing (free)
- Loom video recording (free tier)
- OBS Studio (free)
- Self-hunting (free)
- Social media (free)

**Paid (Optional)**:
- CleanShot X: $29 (screenshot tool)
- Loom Pro: $12.50/month (if you need longer videos)
- Hunter outreach: Free (just ask nicely)

Total cost: Can be $0 if you use free tools.

---

### Q: What's the best way to find a hunter?

**A**:
1. Check Product Hunt leaderboard: https://www.producthunt.com/leaderboard/hunters
2. Find hunters who've launched similar products (SaaS, fintech)
3. Reach out via Twitter DM or email (see HUNTER_OUTREACH_TEMPLATES.md)
4. Reach out 7 days before launch
5. Be genuine, explain your product, make it easy for them

---

### Q: How do I track conversions from Product Hunt?

**A**:
1. Google Analytics: Set up "Source/Medium" tracking for producthunt.com
2. UTM parameters: Add `?ref=producthunt` to all Product Hunt links
3. Stripe Dashboard: Filter customers by signup date
4. Manual tracking: Spreadsheet of signups with source

---

### Q: What if my product goes viral (too much traffic)?

**A**:
- Vercel should auto-scale (no action needed)
- Monitor Vercel dashboard for errors
- Have rollback plan ready
- Communicate via Product Hunt if issues arise

If traffic crashes site, that's a GOOD problem. Fix it and celebrate.

---

## Next Steps

1. **Read `PRODUCT_HUNT_LAUNCH.md`** (master guide)
2. **Set launch date** (2-3 weeks from now, Tuesday/Wednesday)
3. **Capture screenshots** (`npm run capture:screenshots`)
4. **Record demo video** (follow `DEMO_VIDEO_SCRIPT.md`)
5. **Find a hunter** (use `HUNTER_OUTREACH_TEMPLATES.md`)
6. **Review `LAUNCH_DAY_TIMELINE.md`** (hour-by-hour plan)
7. **Launch and engage!** 🚀

---

## Support

**Questions?**
- Email: michael@taxbridgecpa.com
- Twitter: @taxbridge
- Product Hunt: (profile link)

**Feedback on This Launch Package?**
- File issue on GitHub
- DM on Twitter
- Email directly

---

**Good luck with your launch!** 🚀

You've got this. The product is solid. The assets are ready. Now go crush it on Product Hunt.

**Remember**: Engagement > Rank. Conversions > Upvotes. Relationships > Metrics.
