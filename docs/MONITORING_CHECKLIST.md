# Product Hunt Launch Monitoring Checklist

**Run this checklist every hour from 8:00 AM - 11:00 PM PT on March 25, 2026**

---

## Hourly Status Report Template

**Copy/paste into Discord #product-hunt-launch channel every hour:**

```
🕐 HOURLY UPDATE - [TIME] PT

📊 METRICS:
Current Rank: #___
Upvotes: ___ (+___ since last hour)
Comments: ___ (+___ since last hour)
Reviews: ___

💬 ENGAGEMENT:
New comments needing response: ___
Average response time: ___ min
Most engaged comment: [link]

🎯 REVENUE:
Signups today: ___
Free trial starts: ___
Paid conversions: ___
MRR added: $_____

⚠️ ALERTS:
[ ] Rank dropped (from #___ to #___)
[ ] Negative comment posted
[ ] Response time exceeded 15 min
[ ] Technical issue reported
[ ] None - all good ✅

🎬 NEXT ACTIONS:
- [ ] [Action item 1]
- [ ] [Action item 2]

Posted by: [Your name]
```

---

## Detailed Monitoring Workflow

### Every Hour (On the hour: 8:00, 9:00, 10:00, etc.)

#### Step 1: Check Product Hunt Rank (2 min)
1. Go to https://www.producthunt.com/
2. Find TaxBridge in today's launches
3. Note current rank: #___
4. Compare to last hour: ▲ up, ▼ down, ➡️ same
5. **If rank dropped below #5:** Activate emergency protocol (see below)

#### Step 2: Engagement Metrics (3 min)
1. Click into TaxBridge product page
2. Count total upvotes: ___
3. Count total comments: ___
4. Count new comments since last check: ___
5. Identify comments needing response (any without hunter reply)

#### Step 3: Response Time Audit (2 min)
1. Check all unanswered comments
2. Calculate time since posted (use timestamp)
3. **If any comment is >15 min old without response:** Flag in Discord
4. Prioritize: Questions > Feature requests > Praise > Criticism

#### Step 4: Revenue Dashboard (3 min)
1. Open Stripe dashboard: https://dashboard.stripe.com
2. Check new signups today: ___
3. Check new paid customers: ___
4. Calculate MRR added: (new paid customers) × $49 = $_____
5. **If signups are low:** Check if calculator is working (test it)

#### Step 5: Competitor Tracking (2 min)
1. Check top 5 products today
2. Note their upvote count:
   - #1: ___ upvotes
   - #2: ___ upvotes
   - #3: ___ upvotes
   - #4: ___ upvotes
   - #5: ___ upvotes
3. **Gap analysis:** We need ___ more upvotes to reach #3

#### Step 6: Social Media Monitoring (3 min)
1. Check Twitter mentions: https://twitter.com/search?q=taxbridge
2. Check Reddit mentions: https://www.reddit.com/search/?q=taxbridge
3. Check LinkedIn: Search "TaxBridge Product Hunt"
4. **If new mentions found:** Engage and thank them

#### Step 7: Technical Health Check (2 min)
1. Visit https://taxbridgecpa.com
2. Test calculator (enter sample data)
3. Verify results load in <3 seconds
4. Check Sentry for errors: https://sentry.io
5. **If errors found:** Alert tech team immediately

#### Step 8: Post Hourly Update (3 min)
1. Fill out hourly template (see above)
2. Post to Discord #product-hunt-launch
3. **If rank is #1-3:** Celebrate in message 🎉
4. **If rank dropped:** Tag @everyone for help

**Total time per hour:** ~20 minutes

---

## Key Performance Indicators (KPIs)

### Success Benchmarks by Time

| Time (PT) | Target Rank | Target Upvotes | Target Comments |
|-----------|-------------|----------------|-----------------|
| 8:00 AM | #8-10 | 40-60 | 10-15 |
| 10:00 AM | #5-7 | 80-100 | 20-30 |
| 12:00 PM | #3-5 | 120-150 | 35-50 |
| 3:00 PM | #2-4 | 160-200 | 50-70 |
| 6:00 PM | #2-3 | 180-220 | 60-80 |
| 9:00 PM | #2-3 | 200-250 | 70-90 |

**If we're below targets:** Activate emergency protocol

---

## Emergency Protocols

### 🚨 Protocol A: Rank Dropped Below #5 (by 12:00 PM)

**Trigger:** We're #6 or lower at noon
**Goal:** Get back to #5 within 2 hours

**Actions (execute in order):**
1. **Immediate social push** (10 min)
   - Post to Twitter with @ProductHunt tag
   - Share on LinkedIn with ask for support
   - Post to 3 subreddits: r/h1b, r/PersonalFinanceCanada, r/cscareerquestions

2. **Activate backup network** (30 min)
   - DM 10 warm contacts on LinkedIn
   - Email beta users: "Help us reach Top 3 on PH!"
   - Post in 3 Slack communities (H1B Visa, Tech Immigrants, Startup Founders)

3. **Content boost** (15 min)
   - Create Twitter thread with user testimonial
   - Post Michael's founder story on LinkedIn
   - Share to Hacker News (only if rank is #8+)

4. **Team mobilization** (ongoing)
   - All team members share on personal social
   - Engage with other PH products to boost profile visibility
   - Comment on top products to get noticed

**Success metric:** Back to #5 or higher within 2 hours

---

### 🚨 Protocol B: Response Time Exceeded 15 Minutes

**Trigger:** Any comment is >15 min old without hunter response
**Goal:** Get response time back under 10 min average

**Actions:**
1. **Immediate response** (now)
   - Use pre-written template if available
   - Keep it short but genuine
   - Tag in if needed: @CTO for tech, @CEO for vision

2. **Coverage plan** (next 30 min)
   - Assign backup responder (Team Member 1)
   - Michael focuses only on critical comments
   - Backup handles praise/simple questions

3. **Template library** (reference RESPONSE_TEMPLATES.md)
   - 20+ pre-written responses ready to customize
   - Just add personal touch and post

**Success metric:** All comments <10 min response time

---

### 🚨 Protocol C: Negative Comment / Troll Attack

**Trigger:** Comment with criticism, complaint, or trolling
**Goal:** Neutralize negative sentiment without escalation

**Actions:**
1. **DO NOT delete or flag** (looks defensive)
2. **Respond within 10 minutes** (shows we care)
3. **Stay professional** (no defensiveness)
4. **Offer to help** (move to DM/email)
5. **Post positive comment immediately after** (drown out negativity)

**Response framework:**
```
Thanks for the feedback, [name]!

[Acknowledge their concern specifically]

[Explain our side / clarify misunderstanding]

[Offer solution or next step]

Happy to discuss further - feel free to email me at michael@taxbridgecpa.com

Cheers,
Michael
```

**Success metric:** Turn critic into constructive conversation

---

### 🚨 Protocol D: Technical Issue Reported

**Trigger:** User reports bug, error, or site down
**Goal:** Fix within 30 minutes + reassure users

**Actions:**
1. **Immediate triage** (now)
   - Reproduce the issue (test on same browser/device)
   - Check Sentry for error logs
   - Verify Vercel deployment status

2. **Quick fix or workaround** (15 min)
   - If simple bug: Fix and deploy
   - If complex: Provide workaround in comment
   - If our fault: Apologize and commit to fix timeline

3. **Public update** (after fix)
   - Reply to original comment with resolution
   - Post update comment: "Fixed the [X] issue - thanks for reporting!"
   - Test in production to confirm

**Response template:**
```
Oh no! Thanks for catching this, [name]. 😅

Just investigated and [found the issue / deployed a fix / working on it now].

[If fixed] → Try refreshing the page - should work now!
[If not fixed] → Workaround: [instructions]. Fix coming in <30 min.

Really appreciate you reporting this. DM me your email and I'll comp you a year of Pro as thanks. 🙏

-Michael
```

**Success metric:** Issue resolved in <30 min

---

## Success Signals to Watch

### 🟢 Green Flags (We're winning!)
- Upvotes growing faster than 10/hour
- Comments are 80%+ positive
- Multiple success stories shared
- Other makers commenting (crossover audience)
- Getting featured in PH newsletters/social
- Rank climbing steadily

### 🟡 Yellow Flags (Need attention)
- Upvotes slowing down (<5/hour)
- Response time creeping up (>10 min)
- Negative comments appearing
- Rank stagnating
- Low conversion (traffic but no signups)

### 🔴 Red Flags (Emergency!)
- Rank dropped 3+ positions in 1 hour
- Multiple negative comments
- Technical issues reported
- Response time >20 min
- Zero signups despite traffic

---

## End-of-Day Final Report (11:00 PM PT)

**Post this summary in Discord at 11:00 PM:**

```
🎯 FINAL REPORT - March 25, 2026

🏆 FINAL RANK: #___
📊 TOTAL UPVOTES: ___
💬 TOTAL COMMENTS: ___
⭐ REVIEWS: ___

💰 REVENUE:
Free signups: ___
Paid conversions: ___
MRR added: $_____
Conversion rate: ___%

⏱️ ENGAGEMENT:
Average response time: ___ min
Total comments responded to: ___
Fastest response: ___ min
Peak rank: #___

🎖️ TOP PERFORMERS:
Most upvoted comment: [link]
Most engaged user: [name]
Best success story: [summary]

📈 TRAFFIC:
PH referrals: ___
Calculator completions: ___
Bounce rate: ___%

🎬 TOMORROW:
[ ] Thank you email to all PH upvoters
[ ] Post-mortem meeting (11 AM PT)
[ ] Update homepage with badge
[ ] Share final results on social

🙌 TEAM KUDOS:
[Thank specific team members]

WE DID IT! 🚀
```

---

**Created:** March 19, 2026
**Launch Date:** March 25, 2026
**Status:** Ready for execution
