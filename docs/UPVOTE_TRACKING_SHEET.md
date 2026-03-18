# Product Hunt Upvote Tracking & Analytics

**Goal**: Track upvotes hourly, monitor ranking, optimize engagement strategy in real-time
**Tool**: Google Sheets (live tracking dashboard)
**Update frequency**: Every hour on launch day

---

## Google Sheet Structure

### Sheet 1: Hourly Upvote Tracking

**Columns**:
| Time (PST) | Total Upvotes | Upvotes This Hour | Ranking | Comments | Website Traffic | Stripe Conversions | Notes |
|------------|---------------|-------------------|---------|----------|-----------------|-------------------|-------|
| 12:01 AM | 0 | 0 | #500+ | 0 | 0 | 0 | Launch! |
| 1:00 AM | 15 | 15 | #200 | 2 | 150 | 0 | Email list responded |
| 2:00 AM | 28 | 13 | #150 | 5 | 320 | 1 | Hunter posted on Twitter |
| 3:00 AM | 35 | 7 | #120 | 8 | 450 | 1 | Slow hour |
| ... | ... | ... | ... | ... | ... | ... | ... |

**Formulas**:
- `Upvotes This Hour` = Current row `Total Upvotes` - Previous row `Total Upvotes`
- `Ranking` = Manual entry (check Product Hunt every hour)
- `Website Traffic` = Google Analytics real-time visitors (cumulative)
- `Stripe Conversions` = Stripe dashboard "Successful payments" count (cumulative)

### Sheet 2: Traffic Sources

**Columns**:
| Source | Upvotes | Visitors | Conversions | Conversion Rate | ROI |
|--------|---------|----------|-------------|-----------------|-----|
| Email list | 34 | 450 | 3 | 0.67% | $897 |
| Reddit (PersonalFinanceCanada) | 28 | 820 | 2 | 0.24% | $598 |
| Hacker News | 52 | 1,340 | 5 | 0.37% | $1,495 |
| Twitter | 18 | 290 | 1 | 0.34% | $299 |
| LinkedIn | 12 | 180 | 0 | 0.00% | $0 |
| Facebook Groups | 8 | 95 | 0 | 0.00% | $0 |
| Direct (PH only) | 145 | 2,100 | 4 | 0.19% | $1,196 |
| **TOTAL** | **297** | **5,275** | **15** | **0.28%** | **$4,485** |

**Data sources**:
- `Upvotes`: UTM tracking (Google Analytics)
- `Visitors`: Google Analytics traffic by source
- `Conversions`: Stripe metadata (UTM source)
- `ROI`: Conversions × $299 (Pro plan price)

### Sheet 3: Competitor Analysis

**Columns**:
| Product | Launch Date | Category | Peak Ranking | Total Upvotes | Comments | Maker Engagement |
|---------|-------------|----------|--------------|---------------|----------|------------------|
| TaxBridge | Apr 8, 2026 | Finance | #2 | 523 | 87 | High |
| Competitor A | Apr 8, 2026 | Finance | #1 | 612 | 103 | High |
| Competitor B | Apr 8, 2026 | Finance | #4 | 387 | 56 | Medium |

**Use case**: See what other products launched the same day, benchmark against them

### Sheet 4: Comment Engagement

**Columns**:
| Time | Commenter | Comment Summary | Response Time (min) | Upvotes on Comment | Follow-up Conversation | Conversion |
|------|-----------|-----------------|---------------------|-------------------|------------------------|------------|
| 8:30 AM | @johndoe | "How vs TurboTax?" | 5 | 12 | ✅ Yes | ❌ No |
| 8:45 AM | @janedoe | "Support US-UK?" | 8 | 3 | ✅ Yes | ❌ No |
| 9:00 AM | @bobsmith | "Congrats!" | 3 | 0 | ❌ No | ❌ No |
| 9:15 AM | @alicejones | "I need this!" | 4 | 18 | ✅ Yes | ✅ YES ($299) |

**Metrics**:
- Avg response time: `=AVERAGE(D:D)`
- % with follow-up: `=COUNTIF(F:F,"✅ Yes")/COUNTA(F:F)`
- Conversion rate: `=COUNTIF(G:G,"✅ YES")/COUNTA(G:G)`

### Sheet 5: Goals & Milestones

**Milestones Table**:
| Goal | Target | Actual | Status | Time Achieved |
|------|--------|--------|--------|---------------|
| 50 upvotes | 3:00 AM | 35 | ❌ Behind | - |
| 100 upvotes | 6:00 AM | 127 | ✅ Ahead | 5:20 AM |
| 200 upvotes | 12:00 PM | 198 | 🟡 On Track | - |
| 300 upvotes | 6:00 PM | 287 | 🟡 On Track | - |
| 500 upvotes | 11:59 PM | 523 | ✅ Achieved | 10:45 PM |
| Top 10 ranking | 6:00 PM | #8 | ✅ Achieved | 4:30 PM |
| Top 5 ranking | 9:00 PM | #4 | ✅ Achieved | 8:15 PM |
| Top 3 ranking | 11:00 PM | #2 | ✅ Achieved | 10:30 PM |
| #1 Product | 11:59 PM | #2 | ❌ Close! | - |

**Revenue Goals**:
| Goal | Target | Actual | Status |
|------|--------|--------|--------|
| 5,000 visitors | 5,000 | 5,275 | ✅ Achieved |
| 50 signups | 50 | 68 | ✅ Achieved |
| 5 Pro conversions | 5 | 15 | ✅ Exceeded |
| $1,495 revenue | $1,495 | $4,485 | ✅ Exceeded (3x) |

---

## Hourly Update Protocol

### Every Hour (12:01 AM - 11:59 PM PST)

**Step 1: Open Product Hunt** (Tab 1)
- Note current upvote count
- Note current ranking (e.g., #1, #2, #10, etc.)
- Note total comments

**Step 2: Open Google Analytics** (Tab 2)
- Real-time visitors (right now)
- Total visitors (today)
- Traffic by source (which channels driving traffic)

**Step 3: Open Stripe Dashboard** (Tab 3)
- Total successful payments (today)
- Revenue (today)
- Check for HUNT20 coupon usage

**Step 4: Update Google Sheet**
- Add new row with timestamp
- Fill in: Upvotes, Ranking, Comments, Traffic, Conversions
- Add notes (e.g., "Posted on Reddit", "Hunter tweeted", "Slow hour")

**Step 5: Analyze & Adjust**
- Is upvote velocity slowing? → Post in another community
- Is ranking dropping? → Engage more in comments
- Is traffic high but conversions low? → Check pricing page, fix barriers

**Time required per update**: 3-5 minutes

---

## Real-Time Tracking Dashboard

### Key Metrics to Monitor

**Upvote Velocity**:
- First hour: Target 15-20 upvotes (email list)
- Hours 2-6: Target 10-15 upvotes/hour (organic + community posts)
- Hours 7-12: Target 20-30 upvotes/hour (peak PH traffic)
- Hours 13-18: Target 15-25 upvotes/hour (sustained engagement)
- Hours 19-24: Target 10-20 upvotes/hour (final push)

**Ranking Algorithm**:
Product Hunt ranks by: `(Upvotes × Recency × Engagement) / Time Since Launch`

Translation:
- Early upvotes count MORE (first 6 hours = 3x weight)
- Comments boost ranking (engagement signal)
- Fast responses boost ranking (maker engagement)

**Traffic vs. Conversion**:
- Target: 1% website conversion (100 visitors = 1 Pro customer)
- If below 0.5%: Check pricing page, add testimonials, simplify CTA
- If above 2%: Amazing! Scale traffic with paid ads

---

## Alerts & Triggers

### Set up automatic alerts (Google Sheets notifications or phone alarms)

**Alert 1: Falling behind on upvotes**
- Trigger: 2 consecutive hours below target upvote velocity
- Action: Post in another community, tweet again, ask friends to share

**Alert 2: Ranking dropped below #10**
- Trigger: Ranking goes from #8 → #11
- Action: Increase comment engagement, respond faster, ask questions to drive conversation

**Alert 3: High traffic but low conversions**
- Trigger: 500+ visitors but only 1-2 conversions (below 0.4%)
- Action: Check pricing page, add urgency (HUNT20 discount banner), simplify CTA

**Alert 4: Competitor passing you**
- Trigger: Competitor moves from #5 → #3 (while you're at #4)
- Action: Analyze their strategy (what are they doing differently?), increase engagement

---

## Optimization Playbook

### If upvote velocity slows:

**1. Post in another community** (refer to Community Posting Playbook)
- Reddit: r/PersonalFinanceCanada, r/CanadianInvestor, r/ImmigrationCanada
- Hacker News: Show HN
- LinkedIn: Personal post + 2 group posts
- Twitter: New thread or quote tweet

**2. Ask for shares**
- DM 10 friends: "Can you share TaxBridge on Twitter/LinkedIn?"
- Reply to engaged commenters: "If you found this useful, a share would help!"
- Email list: "We're at #5 - help us reach #1 with a share!"

**3. Increase comment engagement**
- Sort PH comments by "Recent" (not "Popular")
- Respond to EVERY new comment within 5 minutes
- Ask questions to drive conversation (boosts engagement metric)

### If ranking drops:

**1. Boost engagement rate**
- Respond faster (target 3 minutes, not 15)
- Ask questions in responses (drives follow-up comments)
- Post maker updates (e.g., "Just hit 200 upvotes! Thank you! Here's what we're building next...")

**2. Drive more upvotes**
- Post in new community (space 1-2 hours apart)
- Tweet again with new angle (e.g., "Thread: How I built TaxBridge in 6 weeks")
- Email list reminder (if it's been 6+ hours since first email)

**3. Analyze competitor**
- Check what competitor is doing (more screenshots? better copy? hunter with larger audience?)
- Learn and adapt (don't copy, but learn from their tactics)

### If conversions are low:

**1. Check pricing page**
- Is HUNT20 banner visible? (20% off = urgency)
- Are testimonials prominent? (social proof)
- Is CTA clear? ("Get 20% off today" > "Learn more")

**2. Add urgency**
- Update banner: "HUNT20 expires in 12 hours" (countdown timer)
- Add scarcity: "Only 50 spots left for launch discount"

**3. Simplify signup flow**
- Remove friction: One-click checkout (Stripe Checkout)
- Reduce fields: Email + payment = done (no unnecessary forms)

---

## Google Sheets Template

### Create a copy of this template:

**Link**: [Create Google Sheet from template]

**Sheets**:
1. Hourly Upvote Tracking
2. Traffic Sources
3. Competitor Analysis
4. Comment Engagement
5. Goals & Milestones

**Auto-populate**:
- Time column (every hour from 12:01 AM - 11:59 PM PST)
- Formulas (upvote velocity, conversion rate, etc.)
- Charts (upvote graph, traffic breakdown, conversion funnel)

**Sharing**:
- Share with co-founders / team (if any)
- Make view-only link for investors / supporters (show traction)

---

## Data Sources & Integration

### Product Hunt API (if available)

**Endpoint**: `GET /v2/posts/{id}`

**Response**:
```json
{
  "upvotes_count": 523,
  "comments_count": 87,
  "rank": 2,
  "featured": true
}
```

**Automation** (Google Apps Script):
```javascript
function updateProductHuntMetrics() {
  // Fetch PH data every hour
  const response = UrlFetchApp.fetch('https://api.producthunt.com/v2/posts/YOUR_POST_ID');
  const data = JSON.parse(response.getContentText());

  // Update Google Sheet
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.appendRow([
    new Date(),
    data.upvotes_count,
    data.rank,
    data.comments_count
  ]);
}
```

**Trigger**: Set up hourly trigger in Google Apps Script

### Google Analytics API

**Real-time visitors**:
- Dashboard: Google Analytics → Real-Time → Overview
- Export: Use Google Analytics API for automated tracking

**Traffic by source**:
- Dashboard: Acquisition → All Traffic → Source/Medium
- Filter by UTM parameters (utm_source=reddit, etc.)

### Stripe API

**Successful payments**:
- Dashboard: Stripe → Payments → Filter by date (today)
- Filter by coupon code: `HUNT20`

**Revenue**:
- Dashboard: Stripe → Home → Today's revenue
- Export: Use Stripe API for automated tracking

---

## Post-Launch Analysis

### Day After Launch (Analyze final results)

**Metrics to capture**:
1. Final upvote count (e.g., 523)
2. Final ranking (e.g., #2 Product of the Day)
3. Total comments (e.g., 87)
4. Total website traffic (e.g., 5,275 visitors)
5. Total conversions (e.g., 15 Pro customers)
6. Revenue (e.g., $4,485)
7. Best traffic source (e.g., Hacker News - 1,340 visitors)
8. Best converting source (e.g., Email list - 0.67% conversion)

**Questions to answer**:
- What time of day had highest upvote velocity? (6-9 AM? 6-9 PM?)
- Which community drove most traffic? (Reddit? HN? Twitter?)
- Which community converted best? (Email? Direct?)
- What was avg response time to comments? (5 min? 15 min?)
- Did we hit our goals? (500+ upvotes? #1-3 ranking? 5 conversions?)

**Learnings for next launch**:
- What worked: [List 3-5 tactics that drove results]
- What didn't work: [List 2-3 tactics that flopped]
- What to do differently: [List 2-3 improvements for next time]

---

## Example Hourly Log (Annotated)

| Time | Upvotes | Δ | Rank | Comments | Traffic | Conv | Notes |
|------|---------|---|------|----------|---------|------|-------|
| 12:01 AM | 0 | 0 | #500+ | 0 | 0 | 0 | Launch! Hunter posted. |
| 1:00 AM | 15 | +15 | #200 | 2 | 150 | 0 | Email list responded. Strong start. |
| 2:00 AM | 28 | +13 | #150 | 5 | 320 | 1 | Hunter tweeted. First conversion! |
| 3:00 AM | 35 | +7 | #120 | 8 | 450 | 1 | Slow hour. Posted on r/PersonalFinanceCanada. |
| 4:00 AM | 42 | +7 | #100 | 12 | 580 | 2 | Reddit post gaining traction. |
| 5:00 AM | 53 | +11 | #85 | 18 | 720 | 2 | Replied to all comments. Engagement up. |
| 6:00 AM | 127 | +74 | #25 | 28 | 1,100 | 3 | HUGE hour. Email reminder sent. HN post hit front page. |
| 7:00 AM | 165 | +38 | #18 | 35 | 1,450 | 4 | HN traffic peaking. Ranking climbing. |
| 8:00 AM | 198 | +33 | #12 | 42 | 1,820 | 5 | Posted on LinkedIn. Steady growth. |
| 9:00 AM | 234 | +36 | #8 | 51 | 2,200 | 7 | Top 10! Posted on Twitter thread. |
| 10:00 AM | 268 | +34 | #6 | 58 | 2,580 | 9 | Top 5 within reach. |
| 11:00 AM | 301 | +33 | #5 | 64 | 2,950 | 10 | Top 5 achieved! Posted on r/SideProject. |
| 12:00 PM | 337 | +36 | #4 | 71 | 3,320 | 12 | Midday push. Posted on r/cscareerquestions. |
| 1:00 PM | 368 | +31 | #3 | 76 | 3,680 | 13 | Top 3! Close to #2. |
| 2:00 PM | 395 | +27 | #3 | 80 | 4,020 | 14 | Holding #3. Competitor at #2 pulling ahead. |
| 3:00 PM | 421 | +26 | #3 | 83 | 4,340 | 14 | Velocity slowing. Tweeted again. |
| 4:00 PM | 448 | +27 | #2 | 85 | 4,650 | 15 | Jumped to #2! Competitor dropped to #3. |
| 5:00 PM | 472 | +24 | #2 | 86 | 4,920 | 15 | Final push. Posted in Facebook groups. |
| 6:00 PM | 493 | +21 | #2 | 87 | 5,150 | 15 | #1 still ahead by 80 upvotes. |
| 7:00 PM | 508 | +15 | #2 | 87 | 5,220 | 15 | Velocity dropping. Late evening lull. |
| 8:00 PM | 515 | +7 | #2 | 87 | 5,250 | 15 | Very slow hour. |
| 9:00 PM | 519 | +4 | #2 | 87 | 5,265 | 15 | Final hour push. Tweeted last time. |
| 10:00 PM | 521 | +2 | #2 | 87 | 5,272 | 15 | Minimal movement. #1 locked in. |
| 11:00 PM | 523 | +2 | #2 | 87 | 5,275 | 15 | Launch complete. #2 Product of the Day! |

**Final Results**:
- **523 upvotes** (#2 Product of the Day)
- **87 comments** (high engagement)
- **5,275 visitors** (exceeded goal)
- **15 Pro conversions** ($4,485 revenue - 3x goal!)

---

## Success Criteria

**Primary goal**: 500+ upvotes ✅ (523)
**Stretch goal**: #1-3 Product of the Day ✅ (#2)
**Revenue goal**: $1,495 (5 conversions) ✅ ($4,485 - 3x exceeded)

**Outcome**: Successful launch!

---

**Status**: Google Sheet template ready. Set up before launch day, update hourly during launch.
