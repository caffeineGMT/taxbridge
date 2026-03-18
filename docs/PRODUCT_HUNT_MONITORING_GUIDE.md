# Product Hunt Launch Monitoring System

**Goal:** Monitor Product Hunt ranking every hour and execute hour-by-hour actions to achieve Top 3 Product of the Day

**Target Metrics:**
- 500+ upvotes by midnight PST
- Top 3 Product of the Day ranking
- 1,000+ website visitors
- 20+ paid conversions

---

## 🚀 Quick Start

### 1. Setup (Before Launch Day)

Add your Product Hunt API token to `.env.local`:

```bash
# .env.local
PRODUCT_HUNT_API_TOKEN=your_api_token_here
PRODUCT_HUNT_SLUG=taxbridge
```

**Get API Token:** https://www.producthunt.com/v2/oauth/applications

### 2. Launch Day - Start Monitoring

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start hourly monitoring (runs every hour automatically)
npm run launch:start-cron

# Alternative: Run once manually
npm run launch:monitor

# Alternative: Watch mode (continuous)
npm run launch:watch
```

### 3. View Dashboard

Open in browser: **http://localhost:3000/launch-dashboard**

The dashboard shows:
- Current ranking (#1-10+)
- Upvotes, comments, website clicks
- Velocity (upvotes per hour)
- Projected final ranking
- Hourly action checklist
- Alerts (low velocity, ranking drops, behind target)

---

## 📊 What Gets Tracked

### Metrics (Updated Every Hour)

1. **Ranking** - Current position in Product of the Day
2. **Upvotes** - Total upvotes received
3. **Comments** - Total comments
4. **Website Clicks** - Traffic driven to TaxBridge
5. **Velocity** - Upvotes per hour
6. **Projected Final Upvotes** - Estimated total by midnight
7. **Estimated Final Ranking** - Predicted final position

### Alerts (Automatic)

The system generates alerts when:

- **Low Velocity:** < 15 upvotes/hour
- **Ranking Drop:** Falls 3+ positions
- **Behind Target (Hour 6):** < 100 upvotes
- **Behind Target (Hour 12):** < 250 upvotes
- **Emergency (Hour 18):** < 400 upvotes → Activate email list

### Actions (Hour-by-Hour)

**Hour 0 (12:01 AM):**
- 🚀 Launch! Post first comment within 2 minutes
- Pin maker comment

**Hour 1:**
- 📧 Email beta users (first wave)
- Monitor comments - respond within 15 min

**Hour 6:**
- 📧 Send beta user reminder email
- 📱 Post on r/PersonalFinanceCanada

**Hour 7:**
- 💻 Post on Hacker News (Show HN)
- First comment with technical details

**Hour 12:**
- 📱 Post on LinkedIn (personal)
- Share progress update

**Hour 18:**
- 📱 Post on Indie Hackers
- Monitor final ranking position
- **If ranking > 3:** Activate emergency protocol

**Hour 23:**
- Launch day complete! Export final metrics
- Plan thank-you emails

[See complete hour-by-hour plan in monitoring script]

---

## 🎯 Emergency Protocols

### If Upvotes Are Low (< 400 by Hour 18)

1. **Activate Email List**
   - Send urgent "upvote now" email to all 50 beta users
   - Subject: "🚨 We need your help - 6 hours left!"

2. **Post in Additional Communities**
   - r/Entrepreneur
   - r/startups
   - Tech worker Slack communities (Blind, Teamblind)

3. **Direct Outreach**
   - DM 20 friends/colleagues
   - Ask for shares on Twitter/LinkedIn

### If Ranking Drops Below Top 3 (After Hour 18)

1. **Increase Comment Response Speed**
   - Respond within 5 minutes (not 15)
   - Turn every comment into a conversation

2. **Post Maker Update on Product Hunt**
   - Share progress milestone
   - Thank supporters
   - Tease new feature

3. **Social Media Blitz**
   - Post Twitter thread highlighting user testimonials
   - LinkedIn update with screenshots of positive feedback
   - Tag Product Hunt in all posts

### If Velocity Slows (< 10 upvotes/hour)

1. **New Community Post**
   - Post in previously unused community
   - Use different angle (e.g., technical deep-dive, founder story)

2. **Engage with Comments**
   - Upvote all comments
   - Ask follow-up questions
   - Share additional context

3. **Drive External Traffic**
   - Tweet from personal account
   - Post in company Slack (if applicable)

---

## 📁 File Structure

```
cross-border-tax/
├── lib/
│   └── product-hunt/
│       └── client.ts               # Product Hunt API client
├── scripts/
│   └── monitor-product-hunt.ts    # Hourly monitoring script
├── app/
│   ├── api/
│   │   └── product-hunt/
│   │       └── route.ts           # API endpoint for dashboard
│   └── launch-dashboard/
│       └── page.tsx               # Real-time dashboard UI
├── lib/
│   └── cron/
│       └── product-hunt-monitor.ts # Cron job for automation
└── data/
    └── launch-metrics.json        # Stored metrics (auto-generated)
```

---

## 🔧 Commands Reference

```bash
# Monitor once (manual check)
npm run launch:monitor

# Monitor continuously (every hour)
npm run launch:watch

# Start cron job (background monitoring)
npm run launch:start-cron

# View dashboard (requires dev server)
npm run dev
# Then open: http://localhost:3000/launch-dashboard
```

---

## 📈 Dashboard Features

### Real-Time Metrics Cards

1. **Current Ranking**
   - Shows current position (#1-10+)
   - Green if in Top 3, yellow if Top 10, red otherwise
   - Displays target (#3) and projected final ranking

2. **Upvotes**
   - Total upvotes
   - Gap to target (500)
   - Projected final upvotes

3. **Velocity**
   - Upvotes per hour
   - Trend indicator (↗️ increasing, ↘️ decreasing)
   - Velocity change over last 3 hours

4. **Time**
   - Hours since launch
   - Hours remaining
   - % complete

### Charts

1. **Upvotes Over Time** - Area chart showing hourly growth
2. **Ranking Position** - Line chart (lower is better)
3. **Velocity Trend** - Line chart of upvotes/hour
4. **Engagement Metrics** - Comments over time

### Alerts Section

Shows critical alerts:
- 🚨 Behind target
- 🔻 Ranking dropped
- ⚠️ Low velocity
- 🎉 Top 3 achieved!

### Actions Section

Displays hour-specific actions:
- ✓ Email beta users
- ✓ Post on Reddit
- ✓ Respond to comments
- ✓ Share on LinkedIn

### Hourly Breakdown Table

Detailed metrics by hour:
- Hour | Ranking | Upvotes | Comments | Velocity | Projected

---

## 🧪 Testing (Before Launch Day)

### Test with Mock Data

The system automatically uses mock data if Product Hunt API token is not configured.

```bash
# Run monitoring with mock data
npm run launch:monitor

# Expected output:
# ⚠️  Product Hunt API token not found. Using mock client for testing.
# 📊 TaxBridge - Hour 3
# 🏆 Ranking: #5 / 10+
# 👍 Upvotes: 110
# 💬 Comments: 22
# ⚡ Velocity: 36 upvotes/hour
```

### Test Dashboard

```bash
# Start dev server
npm run dev

# Run mock monitoring to generate data
npm run launch:monitor

# Open dashboard
open http://localhost:3000/launch-dashboard
```

You should see:
- Charts with sample data
- Mock alerts
- Hour-specific actions

---

## 🎯 Success Criteria

### Minimum Success (Acceptable)

- ✅ 250+ upvotes
- ✅ Top 10 Product of the Day
- ✅ 500+ website visitors
- ✅ 10+ paid conversions

### Target Success (Goal)

- ✅ 500+ upvotes
- ✅ Top 3 Product of the Day
- ✅ 1,000+ website visitors
- ✅ 20+ paid conversions

### Stretch Success (Amazing!)

- ✅ 1,000+ upvotes
- ✅ #1 Product of the Day
- ✅ 2,000+ website visitors
- ✅ 50+ paid conversions
- ✅ Featured in Product Hunt newsletter

---

## 🔔 Notifications (Optional Setup)

### Email Alerts (SendGrid)

Add to `.env.local`:

```bash
SENDGRID_API_KEY=your_sendgrid_key
ALERT_EMAIL=founder@taxbridge.com
```

Alerts will be sent for:
- Ranking drops below Top 5
- Velocity < 10 upvotes/hour
- Behind target at hour 6, 12, 18

### SMS Alerts (Twilio)

Add to `.env.local`:

```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
ALERT_PHONE=+1234567890
```

Critical alerts (emergency protocol activation) sent via SMS.

### Slack Alerts

Add to `.env.local`:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

All alerts posted to Slack channel in real-time.

---

## 📊 Post-Launch Analysis

After launch day, export metrics:

```bash
# Metrics saved to: data/launch-metrics.json

# View final results
cat data/launch-metrics.json | jq '.metrics[-1]'
```

**Analyze:**

1. **Peak Velocity Hour** - Which hour had highest upvotes/hr?
2. **Best Performing Community** - Which post drove most traffic?
3. **Comment Response Time** - Average response time to comments
4. **Conversion Rate** - Visitors → Signups → Paid
5. **Final Ranking** - #1, #2, #3, or lower?

**Share Results:**

- Write Medium article: "How we got 500+ upvotes on Product Hunt"
- Post on Indie Hackers, Hacker News
- LinkedIn case study
- Twitter thread with screenshots

---

## ❓ FAQ

**Q: What if I don't have a Product Hunt API token?**
A: The system uses mock data for testing. You can still test the dashboard and monitoring flow without a real token.

**Q: How often should I check the dashboard?**
A: Every hour during launch day. Set alerts so you don't need to manually check constantly.

**Q: What if ranking drops suddenly?**
A: Check alerts panel for recommended actions. Usually: post in new community, increase comment engagement, send reminder email.

**Q: Can I run monitoring on production (Vercel)?**
A: Yes, but hourly checks should run locally or via cron job. Dashboard can be deployed to Vercel and accessed remotely.

**Q: What if Product Hunt API is down?**
A: Monitor manually via Product Hunt website. Dashboard will show last cached metrics.

---

## 🎉 Launch Day Checklist

**24 Hours Before:**
- [ ] Add Product Hunt API token to `.env.local`
- [ ] Set PRODUCT_HUNT_SLUG to your product slug
- [ ] Test monitoring script: `npm run launch:monitor`
- [ ] Test dashboard: `npm run dev` → http://localhost:3000/launch-dashboard
- [ ] Clear calendar (12+ hours availability)
- [ ] Set phone alerts for comments

**Launch Day (12:01 AM PST):**
- [ ] Start monitoring: `npm run launch:start-cron`
- [ ] Open dashboard: http://localhost:3000/launch-dashboard
- [ ] Post first comment on Product Hunt
- [ ] Execute hourly actions (see dashboard)
- [ ] Respond to EVERY comment within 15 minutes
- [ ] Update dashboard hourly
- [ ] Activate emergency protocol if needed (hour 18)

**Post-Launch (Next Day):**
- [ ] Export final metrics: `data/launch-metrics.json`
- [ ] Send thank-you emails to top upvoters
- [ ] Analyze performance (which communities drove traffic?)
- [ ] Write launch retrospective
- [ ] Plan follow-up content (Medium, Twitter thread)

---

## 📞 Support

**Issues?** Check:
1. Product Hunt API token is correct
2. Product slug matches your launch
3. Dev server is running (`npm run dev`)
4. Monitoring script is running (`npm run launch:start-cron`)

**Still stuck?** Check console logs for error messages.

---

**Status:** ✅ Ready for Launch
**Last Updated:** March 18, 2026
**Target Launch:** Week of March 24, 2026

**Good luck! 🚀**
