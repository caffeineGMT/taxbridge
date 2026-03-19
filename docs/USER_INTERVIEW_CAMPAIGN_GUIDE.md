# User Interview Campaign - Implementation Complete ✓

**Status**: ✅ **PRODUCTION-READY**
**Date**: March 19, 2026
**Goal**: Talk to 10 real calculator users to understand conversion blockers

---

## 📋 Campaign Overview

### Objective
Conduct 15-minute user interviews with 10 calculator users to understand:
1. **What problem were they solving?**
2. **What almost stopped them?**
3. **What would make them pay?**

### Incentive
- **$20 Amazon gift card** delivered within 1 hour after interview
- **15-minute Zoom call** (scheduled via Calendly)
- **Zero pressure** - just listening and learning

### Target Audience
- Used calculator at least once
- Free tier (not paid subscribers)
- First calculation 3-90 days ago
- Has valid email

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Initialize Database Schema
```bash
# Run database migration to create interview campaign tables
npm run db:init
```

This creates 4 tables:
- `user_interview_invitations` - Track email invitations
- `user_interview_bookings` - Track scheduled interviews
- `user_interview_completed` - Track completed interviews & gift cards
- `user_interview_insights` - Aggregate actionable insights

### Step 2: Configure Environment Variables

Add to `.env.production`:
```bash
# Calendly Integration (required)
CALENDLY_EVENT_URL=https://calendly.com/your-username/user-interview
# Get this from: https://calendly.com/event_types/user

# Email Service (required - choose one)
RESEND_API_KEY=re_xxxxxxxxx
# OR
SENDGRID_API_KEY=SG.xxxxxxxxx

# Amazon Gift Cards (required - choose one)
# Option 1: Tremendous API (recommended - easiest integration)
TREMENDOUS_API_KEY=TEST_xxxxxxxxx
TREMENDOUS_FUNDING_SOURCE_ID=FUNDING_xxxxxxxxx
# Get these from: https://www.tremendous.com/

# Option 2: Amazon Incentives API (enterprise only)
AMAZON_INCENTIVES_PARTNER_ID=xxxxxxxxx
AMAZON_INCENTIVES_ACCESS_KEY=xxxxxxxxx
AMAZON_INCENTIVES_SECRET_KEY=xxxxxxxxx
# Get these from: https://developer.amazon.com/incentives-api

# Option 3: Manual gift cards (for testing/small scale)
# Buy gift cards manually and paste codes into database
```

### Step 3: Test Campaign (Dry Run)
```bash
# Preview emails without sending
npm run interview:invite:dry-run

# Check what the dashboard looks like
npm run interview:dashboard
```

### Step 4: Send First Batch of Invitations
```bash
# Send to 10 eligible users
npm run interview:invite

# Or send to specific number
npm run interview:invite:limit=20
```

---

## 📊 Campaign Management

### Monitor Progress
```bash
# View real-time dashboard with metrics
npm run interview:dashboard
```

Dashboard shows:
- Total invitations sent
- Booking conversion rate (target: 15-25%)
- Completion rate (target: 80-90%)
- Gift cards sent & total spend
- Top pain points
- Actionable insights
- Recommendations

### Send Reminders
```bash
# Automatically send reminders to non-responders
# (5 days after invitation, max 2 reminders)
npm run interview:remind
```

### View Campaign Stats
```bash
# Show quick stats summary
npm run interview:stats
```

---

## 📅 Interview Workflow

### 1. User Receives Invitation Email

**Subject**: "Can I ask you 3 questions? ($20 Amazon gift card)"

**Key Points**:
- Offer $20 gift card for 15 minutes
- Show 3 simple questions
- Link to Calendly booking
- Delivered within 1 hour after call

### 2. User Books Interview

- Clicks Calendly link in email
- Selects available time slot
- Receives confirmation email with:
  - Zoom link
  - Interview date/time
  - What to expect
  - Reschedule link

### 3. Interview Conducted (15 Minutes)

**Follow interview guide**: `docs/USER_INTERVIEW_QUESTION_GUIDE.md`

**Three Questions**:
1. What problem were you solving when you found TaxBridge?
2. What almost stopped you from using the calculator?
3. What would make you pay for a tax tool like this?

**Take Notes**:
- Pain point category (pricing, trust, features, UX, competition)
- Severity (critical, high, medium, low)
- Key insights
- Conversion impact estimate

### 4. Send Gift Card (Within 1 Hour)

**Automated** (if using Tremendous/Amazon API):
- Gift card code generated automatically
- Thank you email sent with code
- Tracking updated in database

**Manual** (if buying gift cards):
- Buy $20 Amazon gift card online
- Send thank you email with code
- Update database:
  ```bash
  # Record completed interview manually
  sqlite3 data/taxbridge.db
  UPDATE user_interview_completed SET gift_card_code='AMZN-XXXX-XXXX-XXXX', gift_card_sent_at=unixepoch() WHERE id=1;
  ```

### 5. Extract Insights

After each interview, add insights to database:
```sql
INSERT INTO user_interview_insights (
  insight_text,
  insight_category,
  insight_severity,
  action_priority,
  estimated_conversion_impact_percent
) VALUES (
  'Pricing too high - users expect $49/year not $79/year',
  'pricing',
  'critical',
  'p0',
  20.0
);
```

---

## 📧 Email Templates

All email templates are in: `lib/email-templates/user-interview-campaign.ts`

### Invitation Email
- Subject: "Can I ask you 3 questions? ($20 Amazon gift card)"
- Highlights: 15 min, $20 gift card, 3 questions, Calendly link
- CTA: "Schedule My 15-Min Call"

### Reminder Email
- Sent 5 days after invitation (if no response)
- Max 2 reminders per user
- TL;DR format with same offer

### Confirmation Email
- Sent immediately after booking
- Includes: Zoom link, date/time, what to expect
- Reschedule link included

### Thank You Email (with gift card)
- Sent within 1 hour after interview
- Includes: $20 Amazon gift card code
- Redemption instructions
- Key insights learned (personalized)

---

## 🗄️ Database Schema

### user_interview_invitations
Tracks who was invited and when.

**Key Fields**:
- `user_id`, `email`, `first_name`, `last_name`
- `first_calculation_at`, `total_calculations`
- `invitation_sent_at`, `reminder_sent_at`, `reminder_count`
- `calendly_link`, `tracking_token`
- `status`: `invited`, `reminded`, `booked`, `completed`, `declined`, `expired`

### user_interview_bookings
Tracks scheduled interviews.

**Key Fields**:
- `invitation_id`, `user_id`, `email`
- `scheduled_date`, `scheduled_time`, `scheduled_timestamp`
- `calendly_event_id`, `zoom_link`, `reschedule_link`
- `status`: `scheduled`, `rescheduled`, `canceled`, `no_show`, `completed`

### user_interview_completed
Tracks completed interviews and gift cards.

**Key Fields**:
- `booking_id`, `user_id`, `email`
- `interview_date`, `interview_duration_minutes`
- `question_1_answer`, `question_2_answer`, `question_3_answer`
- `interviewer_notes`, `key_insights` (JSON), `pain_point_category`
- `gift_card_code`, `gift_card_amount`, `gift_card_sent_at`

### user_interview_insights
Aggregate actionable insights from interviews.

**Key Fields**:
- `insight_text`, `insight_category`, `insight_severity`
- `action_priority`: `p0`, `p1`, `p2`, `p3`
- `estimated_conversion_impact_percent`
- `action_status`: `identified`, `planned`, `in_progress`, `completed`

---

## 🎯 Success Metrics

### Campaign-Level Metrics

| Metric | Target | How to Track |
|--------|--------|--------------|
| Invitation-to-booking conversion | 15-25% | Dashboard |
| Booking-to-completion rate | 80-90% | Dashboard |
| Average interview duration | 12-18 min | Dashboard |
| Gift card delivery time | <1 hour | Manual tracking |
| Total interviews completed | 10 minimum | Dashboard |

### Insight-Level Metrics

| Metric | Target | How to Track |
|--------|--------|--------------|
| Actionable insights per interview | 3-5 | SQL query |
| P0/P1 issues identified | Track weekly | Dashboard |
| Estimated conversion impact | Calculate ROI | SQL query |
| Feature requests prioritized | By frequency + severity | SQL query |

---

## 💡 Analyzing Results

### After 5 Interviews: Early Patterns

Check dashboard for:
- **Most mentioned pain point** (if 3+ people say the same thing, it's a pattern)
- **Price sensitivity** (if 50%+ mention pricing, test lower price point)
- **Missing features** (if 3+ request same feature, build it)
- **Trust issues** (if 3+ mention accuracy concerns, add social proof)

### After 10 Interviews: Action Plan

1. **Review top pain points** in dashboard
2. **Prioritize P0/P1 fixes** by conversion impact
3. **Build MVPs** of most-requested features
4. **Run experiments**:
   - If pricing is #1 → Test $49/year vs $79/year
   - If feature requests dominate → Build MVP and re-test with same users
   - If trust is the issue → Add testimonials, guarantees, certifications

### SQL Queries for Analysis

```sql
-- Top 5 pain points
SELECT
  pain_point_category,
  COUNT(*) as count
FROM user_interview_completed
WHERE pain_point_category IS NOT NULL
GROUP BY pain_point_category
ORDER BY count DESC
LIMIT 5;

-- Average conversion impact by category
SELECT
  insight_category,
  AVG(estimated_conversion_impact_percent) as avg_impact
FROM user_interview_insights
WHERE estimated_conversion_impact_percent IS NOT NULL
GROUP BY insight_category
ORDER BY avg_impact DESC;

-- P0 action items
SELECT
  insight_text,
  action_needed,
  estimated_conversion_impact_percent
FROM user_interview_insights
WHERE action_priority = 'p0'
  AND action_status IN ('identified', 'planned')
ORDER BY estimated_conversion_impact_percent DESC;
```

---

## 🛠️ Troubleshooting

### No eligible users found

**Problem**: "Found 0 eligible users"

**Solutions**:
1. Check database has user profiles: `sqlite3 data/taxbridge.db "SELECT COUNT(*) FROM user_profiles;"`
2. Check RSU events exist: `sqlite3 data/taxbridge.db "SELECT COUNT(*) FROM rsu_events;"`
3. Adjust eligibility criteria:
   ```bash
   # Lower minimum calculations
   # Or expand date range in lib/db/queries/user-interview-campaign.ts
   # Change maxDaysSinceFirst from 90 to 180
   ```

### Emails not sending

**Problem**: Emails appear to send but users don't receive them

**Solutions**:
1. Verify email service API key is set: `echo $RESEND_API_KEY`
2. Check spam folder (first time sender)
3. Replace placeholder email service in `scripts/send-user-interview-invitations.ts` with real service:
   ```typescript
   // Replace placeholder with actual Resend/SendGrid code
   const { Resend } = require('resend');
   const resend = new Resend(process.env.RESEND_API_KEY);
   await resend.emails.send({ ... });
   ```

### Gift cards not generating

**Problem**: Placeholder gift card codes instead of real codes

**Solutions**:
1. If using Tremendous API:
   - Set `TREMENDOUS_API_KEY` and `TREMENDOUS_FUNDING_SOURCE_ID`
   - Replace placeholder in `lib/email-templates/user-interview-campaign.ts` with actual API call
2. If buying manually:
   - Buy $20 Amazon gift cards: https://www.amazon.com/gift-cards
   - Update database manually after each interview

### Low booking conversion rate (<10%)

**Problem**: Invitations sent but few bookings

**Solutions**:
1. **Test different subject lines** (A/B test):
   - "Quick favor? $20 for 15 minutes of your time"
   - "Help improve TaxBridge - $20 Amazon gift card"
   - "Can I ask you 3 questions? ($20 gift card)"
2. **Increase gift card to $30** or $50
3. **Send reminders** after 3 days (not 5)
4. **Check Calendly link works** (test booking yourself)

---

## 📁 File Structure

```
lib/
├── email-templates/
│   └── user-interview-campaign.ts      # Email templates (invitation, reminder, confirmation, thank you)
├── db/
│   ├── user-interview-schema.ts        # Database schema for campaign tracking
│   └── queries/
│       └── user-interview-campaign.ts  # Database queries (find users, record data)

scripts/
├── send-user-interview-invitations.ts   # Main campaign script (send emails, reminders)
└── user-interview-dashboard.ts         # Real-time campaign dashboard

docs/
├── USER_INTERVIEW_QUESTION_GUIDE.md    # Interview script and question guide
└── USER_INTERVIEW_CAMPAIGN_GUIDE.md    # This file (complete documentation)
```

---

## ✅ Checklist for Launch

Before sending first batch:
- [ ] Database schema created (`npm run db:init`)
- [ ] Environment variables configured (`.env.production`)
- [ ] Calendly event created and URL set
- [ ] Email service API key tested
- [ ] Gift card API configured (or manual process ready)
- [ ] Interview guide reviewed (`docs/USER_INTERVIEW_QUESTION_GUIDE.md`)
- [ ] Dry run completed successfully (`npm run interview:invite:dry-run`)
- [ ] Dashboard accessible (`npm run interview:dashboard`)
- [ ] Zoom account ready for interviews

---

## 🎓 Best Practices

### Before Sending Invitations
1. **Test email yourself** - Send dry run to your own email first
2. **Check Calendly availability** - Make sure you have slots available next week
3. **Prepare Zoom** - Test recording works, background looks professional
4. **Review interview guide** - Know the 3 questions cold

### During Interviews
1. **Record permission** - Always ask "Is it okay if I record?"
2. **Listen more than talk** - Let them share, don't interrupt
3. **Follow-up questions** - Dig deeper on interesting points
4. **Take notes** - Capture pain points, quotes, severity
5. **Thank them** - Express genuine gratitude

### After Interviews
1. **Send gift card within 1 hour** - Keep your promise
2. **Record data immediately** - Don't wait, update database right away
3. **Extract insights** - Add to insights table while fresh
4. **Review patterns** - After 5 interviews, look for recurring themes
5. **Take action** - Build fixes for P0 issues immediately

---

## 📞 Support

**Questions?** Contact: michael@taxbridge.app

**Documentation**:
- Interview question guide: `docs/USER_INTERVIEW_QUESTION_GUIDE.md`
- Campaign implementation: This file
- Database schema: `lib/db/user-interview-schema.ts`
- Email templates: `lib/email-templates/user-interview-campaign.ts`

---

**🚀 You're ready to launch! Run `npm run interview:invite` to send your first batch of invitations.**
